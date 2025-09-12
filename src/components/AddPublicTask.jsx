// src/components/AddPublicTask.jsx
import React, { useState, useContext, useEffect } from "react";
import { db } from "../auth/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { UserContext } from "../context/UserContext";
import { SVGIcons, myImage } from "../importFiles/imports";
import Button from "../Utils/Button";
import Inputs from "../Utils/Inputs";
import Selects from "../Utils/Selects";

function AddPublicTask({ accion }) {
  const { user } = useContext(UserContext);

  // Main task fields
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [completeBy, setCompleteBy] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [subTaskMenu, setSubTaskMenu] = useState(false);

  // Sub-tasks (each one with independent assignment)
  const [stName, setStName] = useState("");
  const [stPriority, setStPriority] = useState("medium");
  const [stCompleteBy, setStCompleteBy] = useState("");
  const [stNotes, setStNotes] = useState("");
  const [stAssignedTo, setStAssignedTo] = useState("");
  const [subTasks, setSubTasks] = useState([]); // [{ name, priority, completeBy, notes, assignedTo, status }]

  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    if (subTaskMenu) {
      setAnimation(true);
    } else {
      const timeout = setTimeout(() => setAnimation(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [subTaskMenu]);
  // Fetch company members (from 'users')
  useEffect(() => {
    async function fetchMembers() {
      if (!user?.companyId) return;
      const q = query(
        collection(db, "users"),
        where("companyId", "==", user.companyId)
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc) => ({
        uid: doc.id,
        name: `${doc.data().firstName || ""} ${
          doc.data().lastName || ""
        }`.trim(),
        photo: doc.data().photo || myImage.defaultUser,
      }));
      setMembers(users);
    }
    fetchMembers();
  }, [user]);

  // Shortcut: Cmd/Ctrl + Enter to submit
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        document.getElementById("create-public-task")?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Copy priority/date from the main task to the sub-task inputs
  const copyFromMain = () => {
    setStPriority(priority);
    setStCompleteBy(completeBy);
  };

  // Add/Remove sub-tasks (limit 10)
  const handleAddSubTask = () => {
    const name = stName.trim();
    if (!name) return;
    if (subTasks.length >= 10) return;

    setSubTasks((prev) => [
      ...prev,
      {
        name,
        priority: stPriority || "medium",
        completeBy: stCompleteBy || "",
        notes: stNotes?.trim() || "",
        assignedTo: stAssignedTo || null,
        status: "pending",
      },
    ]);

    // Clear name/notes/assignment; keep priority/date to add several similar
    setStName("");
    setStNotes("");
    setStAssignedTo("");
  };

  const handleRemoveSubTask = (idx) => {
    setSubTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user || user.role !== "admin") {
      alert("Solo los administradores pueden crear tareas públicas.");
      return;
    }
    if (!user?.uid || !user?.companyId) {
      alert(
        "Falta uid/companyId del usuario. En el emulador crea primero tu documento en 'users/{uid}'."
      );
      return;
    }

    try {
      setSubmitting(true);

      // Documento con todos los campos que pediste
      await addDoc(collection(db, "tasks"), {
        // Identidad / ownership
        type: "public", // "public" | "personal"
        companyId: user.companyId, // companyId
        createdBy: user.uid, // user que crea la tarea
        assignedTo: assignedTo || null, // usuario asignado (o null)

        // Contenido
        taskName: taskName.trim(), // "Task name"
        notes, // ""
        priority, // prioridad

        // Fechas
        createdAt: serverTimestamp(), // creation timestamp
        completeBy, // due date (string "YYYY-MM-DD" or empty)
        completedAt: null, // completion timestamp (null on create)

        // State + metrics flags
        status: "pending", // "pending" | "progress" | "completed" | "missed"
        pendingCounted: false,
        completedCounted: false,
        missedCounted: false,

        // Subtareas (array)
        subTasks, // []
      });

      // Reset
      setTaskName("");
      setPriority("medium");
      setCompleteBy("");
      setNotes("");
      setAssignedTo("");
      setSubTasks([]);
      setStName("");
      setStPriority("medium");
      setStCompleteBy("");
      setStNotes("");
      setStAssignedTo("");

      // Cerrar modal/form
      accion?.();
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      alert("Hubo un error al guardar la tarea.");
    } finally {
      setSubmitting(false);
    }
  }

  const prioritis = [
    { uid: "l", name: "low" },
    { uid: "m", name: "medium" },
    { uid: "h", name: "high" },
  ];

  return (
    <div className="fixed inset-0 z-[4000] bg-black/50 overflow-y-auto overscroll-contain">
      {/* Responsive wrapper: top on mobile, centered on md+ */}
      <div
        className="min-h-svh flex items-start md:items-center justify-center p-4 md:p-6"
        style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }} // respeta notch
      >
        {/* Contenido del modal */}
        <div
          className="w-full md:w-[90vw] max-w-4xl rounded-3xl p-4 no-scrollbar bg-principal border border-slate-100/30 shadow-[inset_0_0_1px_#fff9    ] shadow-lg "
          style={{
            color: "var(--textColor)",
            maxHeight: "calc(100svh - 2rem)", // que no rebase la pantalla
            overflow: "auto", // scroll interno si hace falta
          }}
        >
          {/* Header */}

          <form
            className="flex flex-col gap-4 rounded-2xl"
            onSubmit={handleSubmit}
          >
            {/*<div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1 w-full border-b-2  ">
                <SVGIcons.public className="w-10 h-7 textColor" />
                <span className="text-black w-full">
                  <input
                    type="text"
                    placeholder="Enter Task Name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                    className="inputBase"
                  />
                </span>
              </div>
            </div>*/}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl">Public Task Form</h2>
              <Button
                icon={SVGIcons.x}
                color={"orange"}
                iconSize={"4"}
                onClick={accion}
              />
            </div>
            <Inputs
              id={"taskname"}
              label="Task name"
              icon={SVGIcons.public}
              iconSize={"6"}
              placeholder="Enter your task name here"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Columna izquierda */}
              <div className="space-y-3">
                {/* Asignar usuario (tarea principal) */}
                <Selects
                  defaultVal={"Unassigned"}
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  map={members}
                  id="assignedTo"
                  label={"Assigned to"}
                  //icon={SVGIcons.personal}
                  iconSize={"6"}
                  image={
                    members.find((m) => m.uid === assignedTo)?.photo ||
                    myImage.defaultUser
                  }
                />

                {/* Fecha */}
                <Inputs
                  type={"date"}
                  icon={SVGIcons.calendar}
                  iconSize={"6"}
                  id={"taskdate"}
                  label={"Due date"}
                  value={completeBy}
                  onChange={(e) => setCompleteBy(e.target.value)}
                />

                {/* Prioridad */}
                <Selects
                  map={prioritis}
                  id="priority"
                  label={"Priority "}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  valueKey={"name"}
                  labelKey={"name"}
                  className="selectBase"
                  icon={
                    priority === "high"
                      ? SVGIcons.priority.high
                      : priority === "medium"
                      ? SVGIcons.priority.med
                      : priority === "low"
                      ? SVGIcons.priority.low
                      : SVGIcons.question
                  }
                  iconSize={"6"}
                  iconColor={
                    priority === "high"
                      ? "orange"
                      : priority === "medium"
                      ? "yellow"
                      : priority === "low"
                      ? "green"
                      : ""
                  }
                />
              </div>

              {/* Columna derecha */}
              <div className="space-y-3">
                {/* Notas */}
                <div className="flex flex-col items-start gap-2 border bg-[var(--color-input)] border-slate-600/25 rounded-xl">
                  <span className="text-black px-2 py-1 flex bg-slate-200 w-full rounded-t-xl items-center gap-2">
                    <SVGIcons.note className="h-6 w-6" />
                    Notes <span className="text-slate-600 ">(Optional)</span>
                  </span>
                  <textarea
                    placeholder="Enter here your notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={"textAreaBase" + " min-h-[110px]"}
                  />
                </div>
              </div>
            </div>

            {/* Sub-tasks with independent assignment */}

            {subTaskMenu ? (
              <div
                className={`${
                  animation ? " opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden transition-all duration-700 rounded-2xl border border-slate-200 p-3 bg-white/10`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={
                      "labelBase" + " m-0 text-[var(--textColor)] font-medium "
                    }
                  >
                    Sub-tasks
                    <span className="text-slate-400">
                      ({subTasks.length}/10)
                    </span>
                  </label>
                  <div className="gap-2 flex">
                    <button
                      type="button"
                      className="text-xs text-slate-600 hover:text-slate-900 underline"
                      onClick={copyFromMain}
                      title="Copiar prioridad y fecha desde la tarea principal"
                    >
                      Copy from main
                    </button>

                    <Button
                      iconSize={"5"}
                      color="yellow"
                      onClick={() => setSubTaskMenu(false)}
                      icon={SVGIcons.x}
                    />
                  </div>
                </div>

                {/* Formulario de sub-task */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 overflow-scroll">
                  <input
                    type="text"
                    value={stName}
                    onChange={(e) => setStName(e.target.value)}
                    className={"inputBase text-lg border-b-2"}
                    placeholder="Enter Sub-task name"
                    maxLength={100}
                  />
                  <div className="pl-3 h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl">
                    <select
                      value={stPriority}
                      onChange={(e) => setStPriority(e.target.value)}
                      className={"selectBase"}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="pl-4 h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl">
                    <input
                      type="date"
                      value={stCompleteBy}
                      onChange={(e) => setStCompleteBy(e.target.value)}
                      className="flex items-center"
                    />
                  </div>
                  <div className="pl-3 h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl">
                    <select
                      value={stAssignedTo}
                      onChange={(e) => setStAssignedTo(e.target.value)}
                      className="selectBase"
                    >
                      <option value="">Sin asignar</option>
                      {members.map((member) => (
                        <option key={member.uid} value={member.uid}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    color="green"
                    type="button"
                    onClick={handleAddSubTask}
                    disabled={!stName.trim() || subTasks.length >= 10}
                    title="Add sub-task"
                  >
                    Add Sub-task
                  </Button>
                </div>
                <div className="flex flex-col items-start gap-2 border bg-[var(--color-input)] border-slate-600/25 rounded-xl">
                  <span className="text-black px-2 py-1 flex bg-slate-200 w-full rounded-t-xl items-center gap-2">
                    <SVGIcons.note className="h-6 w-6" />
                    Sub-task notes
                    <span className="text-slate-600 ">(Optional)</span>
                  </span>
                  <textarea
                    value={stNotes}
                    onChange={(e) => setStNotes(e.target.value)}
                    className={"textAreaBase" + " mb-2 min-h-[60px]"}
                    placeholder="Enter your notes here"
                    maxLength={400}
                  />
                </div>

                {subTasks.length > 0 && (
                  <ul className="space-y-1">
                    {subTasks.map((st, idx) => (
                      <li
                        key={`${st.name}-${idx}`}
                        className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {idx + 1}. {st.name}
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                            <span>Prioridad: {st.priority}</span>
                            {st.completeBy && (
                              <span>• Due: {st.completeBy}</span>
                            )}
                            {st.notes && <span>• Notas: {st.notes}</span>}
                            {st.assignedTo && (
                              <>
                                <span>• Asignado:</span>
                                <span className="inline-flex items-center gap-1">
                                  <img
                                    src={
                                      members.find(
                                        (m) => m.uid === st.assignedTo
                                      )?.photo || myImage.defaultUser
                                    }
                                    alt="assignee"
                                    className="h-4 w-4 rounded-full border"
                                  />
                                  {members.find((m) => m.uid === st.assignedTo)
                                    ?.name || "?"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubTask(idx)}
                          className="text-xs text-slate-600 hover:text-rose-600"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="overflow-scroll flex items-center gap-4 rounded-2xl border border-slate-200 p-3 bg-white/50">
                {/*Sub task assingne*/}
                <div
                  onClick={() => setSubTaskMenu(true)}
                  className=" flex flex-col h-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                >
                  <span className="btn-">Add Sub-Taks</span>
                  <SVGIcons.plus className="w-5 h-5 border rounded-3xl " />
                </div>

                {subTasks.map((st, idx) => (
                  <li
                    key={`${st.name}-${idx}`}
                    className=" flex  items-start justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                  >
                    <div className="flex ">
                      <div className="h-full w-5">
                        <div className="bg-black text-white w-5 rounded-sm items-center flex justify-center">
                          {idx + 1}
                        </div>
                        <SVGIcons.arrowTurn.right className="w-4 h-full mr-3 ml-2" />
                      </div>
                      <div className="min-w-0 flex-1 ml-3">
                        <div className="text-xs text-slate-500 flex flex-wrap gap-2 items-center o">
                          {st.assignedTo && (
                            <>
                              <span className="inline-flex items-center gap-1 w-30 h-12">
                                <img
                                  src={
                                    members.find((m) => m.uid === st.assignedTo)
                                      ?.photo || myImage.defaultUser
                                  }
                                  alt="assignee"
                                  className="h-4 w-4 rounded-full border"
                                />
                                {members.find((m) => m.uid === st.assignedTo)
                                  ?.name || "?"}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="font-medium truncate mb-1 ">
                          {st.name}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                width={"w-full"}
                id={"create-public-task"}
                type={"submit"}
                disabled={
                  submitting || !taskName.trim() || user?.role !== "admin"
                }
                color={user?.role !== "admin" ? "disable" : "green"}
                title={
                  user?.role !== "admin"
                    ? "Only admin can create public tasks."
                    : "Cmd/Ctrl + Enter to create"
                }
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <SVGIcons.status.progress className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Created task"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPublicTask;
