// src/components/PersonalTaskForm.jsx
import React, { useState, useContext, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";
import { UserContext } from "../context/UserContext";
import { SVGIcons, myImage } from "../importFiles/imports";
import Button from "../Utils/Button";

function PersonalTaskForm({ onClose, onCreated }) {
  const { user } = useContext(UserContext);

  // Main fields
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [completeBy, setCompleteBy] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Subtasks
  const [subTaskMenu, setSubTaskMenu] = useState(false);
  const [animation, setAnimation] = useState(false);
  const [stName, setStName] = useState("");
  const [stPriority, setStPriority] = useState("medium");
  const [stCompleteBy, setStCompleteBy] = useState("");
  const [stNotes, setStNotes] = useState("");
  const [subTasks, setSubTasks] = useState([]); // {name, priority, completeBy, notes, status, assignedTo}

  // Accordion animation
  useEffect(() => {
    if (subTaskMenu) {
      setAnimation(true);
    } else {
      const t = setTimeout(() => setAnimation(false), 700); // igual a duration-700
      return () => clearTimeout(t);
    }
  }, [subTaskMenu]);

  // Cmd/Ctrl + Enter => submit
  useEffect(() => {
    const handler = (e) => {
      const isMetaEnter = (e.metaKey || e.ctrlKey) && e.key === "Enter";
      if (isMetaEnter && !submitting && taskName.trim()) {
        document.getElementById("personal-task-submit")?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submitting, taskName]);

  const copyFromMain = () => {
    setStPriority(priority);
    setStCompleteBy(completeBy);
  };

  const handleAddSubTask = () => {
    const name = stName.trim();
    if (!name || subTasks.length >= 10) return;
    setSubTasks((prev) => [
      ...prev,
      {
        name,
        priority: stPriority || "medium",
        completeBy: stCompleteBy || "",
        notes: stNotes?.trim() || "",
        status: "pending",
        // Important: owner can change status
        assignedTo: user?.uid || null,
      },
    ]);
    setStName("");
    setStNotes("");
    // Leave priority/date to add several similar ones
  };

  const handleRemoveSubTask = (idx) => {
    setSubTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    if (!user?.uid || !user?.companyId) {
      alert("Falta uid/companyId del usuario.");
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, "tasks"), {
        // Identidad / ownership
        type: "personal",
        companyId: user.companyId,
        createdBy: user.uid,
        assignedTo: user.uid, // owner
        // Contenido
        taskName: taskName.trim(),
        notes: notes || "",
        priority,
        // Fechas
        createdAt: serverTimestamp(),
        completeBy: completeBy || "",
        completedAt: null,
        // Estado + flags
        status: "pending",
        pendingCounted: false,
        completedCounted: false,
        missedCounted: false,
        // Subtareas
        subTasks,
      });

      // Reset
      setTaskName("");
      setPriority("medium");
      setCompleteBy("");
      setNotes("");
      setSubTasks([]);
      setStName("");
      setStPriority("medium");
      setStCompleteBy("");
      setStNotes("");

      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error("Error al crear la tarea personal:", err);
      alert("No se pudo crear la tarea.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] bg-black/50 overflow-y-auto overscroll-contain">
      {/* Wrapper: top on mobile, centered on md+ */}
      <div
        className="min-h-svh flex items-start md:items-center justify-center p-4 md:p-6"
        style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
      >
        {/* Contenedor modal */}
        <div
          className="w-full md:w-[90vw] max-w-4xl rounded-3xl p-4 no-scrollbar bg-principal border border-slate-100/30 shadow-[inset_0_0_1px_#fff9] "
          style={{
            color: "var(--textColor)",
            maxHeight: "calc(100svh - 2rem)",
            overflow: "auto",
          }}
        >
          <form className="flex flex-col gap-4" onSubmit={handleCreate}>
            {/* Header with PERSONAL icon + title input */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1 w-full border-b-2">
                <SVGIcons.personal className="w-10 h-7 textColor" />
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
            </div>

            {/* Dos columnas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-3">
                {/* Assignment (read-only: owner) */}
                <div className="h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl mb-5">
                  <span className="ml-2 aspect-square min-w-10 min-h-10 flex items-center">
                    <img
                      src={user?.photo || myImage.defaultUser}
                      alt="owner"
                      className="relative h-15 w-19 rounded-full border-2 border-blue-500 object-cover aspect-square"
                    />
                  </span>
                  <div className="selectBase pointer-events-none opacity-100">
                    {`${user?.firstName || ""} ${
                      user?.lastName || ""
                    }`.trim() || "You"}
                  </div>
                </div>

                {/* Date */}
                <div className="h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl">
                  <span className="ml-3 mx-3 px-2 py-2 ">
                    <SVGIcons.calendar className="h-6 w-6" />
                  </span>
                  <input
                    type="date"
                    value={completeBy}
                    onChange={(e) => setCompleteBy(e.target.value)}
                    className="inputBaseDate"
                  />
                </div>

                {/* Priority */}
                <div className="h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl">
                  <span className="ml-3  px-2 py-2 ">
                    {priority === "high" ? (
                      <SVGIcons.priority.high className="h-6 w-6 text-[var(--orange)]" />
                    ) : priority === "medium" ? (
                      <SVGIcons.priority.med className="h-6 w-6 text-[var(--yellow)]" />
                    ) : priority === "low" ? (
                      <SVGIcons.priority.low className="h-6 w-6 text-[var(--green)]" />
                    ) : (
                      <SVGIcons.question className="h-6 w-6" />
                    )}
                  </span>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="selectBase"
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </select>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-3">
                {/* Notes */}
                <div className="flex flex-col items-start gap-2 border bg-[var(--color-input)] border-slate-600/25 rounded-xl">
                  <span className="text-black px-2 py-1 flex bg-slate-200 w-full rounded-t-xl items-center gap-2">
                    <SVGIcons.note className="h-6 w-6" />
                    Notes <span className="text-slate-600 ">(Optional)</span>
                  </span>
                  <textarea
                    placeholder="Enter your notes here"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={"textAreaBase min-h-[110px]"}
                  />
                </div>
              </div>
            </div>

            {/* Subtasks */}
            {subTaskMenu ? (
              <div
                className={`${
                  animation ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden transition-all duration-700 ease-in-out rounded-2xl border border-slate-200 p-3 bg-white/10`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="labelBase m-0 text-[var(--textColor)] font-medium">
                    Sub-tasks{" "}
                    <span className="text-slate-400">
                      ({subTasks.length}/10)
                    </span>
                  </label>
                  <div className="gap-2 flex">
                    <Button
                      type="button"
                      color=""
                      onClick={copyFromMain}
                      title="Copy priority & date from main"
                    >
                      Copy from main
                    </Button>
                    <Button
                      onClick={() => setSubTaskMenu(false)}
                      type="button"
                      color={"orange"}
                      icon={SVGIcons.x}
                    />
                  </div>
                </div>

                {/* Subtask form */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                  <input
                    type="text"
                    value={stName}
                    onChange={(e) => setStName(e.target.value)}
                    className="inputBase text-lg border-b-2"
                    placeholder="Enter Sub-task name"
                    maxLength={100}
                  />
                  <div className="pl-3 h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl">
                    <select
                      value={stPriority}
                      onChange={(e) => setStPriority(e.target.value)}
                      className="selectBase"
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
                  {/* In personal we DO NOT reassign: subtasks are assigned to the owner */}
                  <div className="pl-3 h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl text-xs selectBase pointer-events-none opacity-100">
                    Assigned to you
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddSubTask}
                    color={"green"}
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
                    className="textAreaBase mb-2 min-h-[60px]"
                    placeholder="Enter your notes here"
                    maxLength={400}
                  />
                </div>

                {subTasks.length > 0 && (
                  <ul className="space-y-1 mt-2">
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
                            <span>Priority: {st.priority}</span>
                            {st.completeBy && (
                              <span>• Due: {st.completeBy}</span>
                            )}
                            {st.notes && <span>• Notes: {st.notes}</span>}
                            <span>• Assigned: You</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleRemoveSubTask(idx)}
                          color={"orange"}
                          title="Remove"
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-3 bg-white/50">
                <div
                  onClick={() => setSubTaskMenu(true)}
                  className="flex flex-col h-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 cursor-pointer"
                >
                  <span>Add Sub-Tasks</span>
                  <SVGIcons.plus className="w-5 h-5 border rounded-3xl" />
                </div>

                {subTasks.map((st, idx) => (
                  <li
                    key={`${st.name}-${idx}`}
                    className="flex items-start justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                  >
                    <div className="flex">
                      <div className="h-full w-5">
                        <div className="bg-black text-white w-5 rounded-sm items-center flex justify-center">
                          {idx + 1}
                        </div>
                        <SVGIcons.arrowTurn.right className="w-4 h-full mr-3 ml-2" />
                      </div>
                      <div className="min-w-0 flex-1 ml-3">
                        <div className="text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                          <span>Assigned: You</span>
                        </div>
                        <div className="font-medium truncate mb-1">
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
                id="personal-task-submit"
                type="submit"
                color={`green`}
                icon={submitting && SVGIcons.status.progress}
                animation={"spin"}
                disabled={submitting || !taskName.trim()}
                title="Cmd/Ctrl + Enter to create"
              >
                {submitting ? "Creating..." : "Create personal task"}
              </Button>

              <Button type="button" onClick={onClose} color={"orange"}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PersonalTaskForm;
