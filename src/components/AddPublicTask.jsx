// src/components/AddPublicTask.jsx
import React, { useState, useContext, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { UserContext } from "../context/UserContext";

// Iconos
import samplePhoto from "../assets/sample.png";
import noteIcon from "../assets/icons/note.svg";
import calendarIcon from "../assets/icons/pending.svg";
import titleIcon from "../assets/icons/note.svg";
import { SVGIcons, myImage } from "../imports";

function AddPublicTask({ accion }) {
  const { user } = useContext(UserContext);

  // Campos de la tarea principal
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [completeBy, setCompleteBy] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Sub-tasks (cada una con asignación independiente)
  const [stName, setStName] = useState("");
  const [stPriority, setStPriority] = useState("medium");
  const [stCompleteBy, setStCompleteBy] = useState("");
  const [stNotes, setStNotes] = useState("");
  const [stAssignedTo, setStAssignedTo] = useState("");
  const [subTasks, setSubTasks] = useState([]); // [{ name, priority, completeBy, notes, assignedTo, status }]

  // Obtener miembros de la empresa (desde 'users')
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
        photo: doc.data().photo || samplePhoto,
      }));
      setMembers(users);
    }
    fetchMembers();
  }, [user]);

  // Atajo: Cmd/Ctrl + Enter para enviar
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        document.getElementById("create-public-task")?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Copiar prioridad/fecha desde la principal a los inputs de sub-task
  const copyFromMain = () => {
    setStPriority(priority);
    setStCompleteBy(completeBy);
  };

  // Agregar/Eliminar sub-tasks (límite 10)
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

    // Limpiar nombre/notas/asignación; dejar prioridad/fecha para agregar varias similares
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
        createdAt: serverTimestamp(), // fecha que se creó la tarea
        completeBy, // fecha límite (string "YYYY-MM-DD" o vacío)
        completedAt: null, // fecha que se completó (nulo al crear)

        // Estado + flags de métricas
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

  // estilos base
  const inputBase =
    "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
    "placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/40";
  const labelBase = "mb-1 block text-xs font-medium text-slate-600";
  const btnBase =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const btnPrimary =
    btnBase +
    " bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-800/90";
  const btnOutlineDanger =
    btnBase + " border border-rose-300 bg-white text-rose-700 hover:bg-rose-50";
  const btnOutline =
    btnBase +
    " border border-slate-300 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <div className="fixed inset-0 z-[4000] bg-black/50 overflow-y-auto overscroll-contain">
      {/* Wrapper responsivo: top en móvil, centrado en md+ */}
      <div
        className="min-h-svh flex items-start md:items-center justify-center p-4 md:p-6"
        style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }} // respeta notch
      >
        {/* Contenido del modal */}
        <div
          className="w-full md:w-[90vw] max-w-4xl rounded-3xl p-4 no-scrollbar bg-principal"
          style={{
            color: "var(--textColor)",
            maxHeight: "calc(100svh - 2rem)", // que no rebase la pantalla
            overflow: "auto", // scroll interno si hace falta
          }}
        >
          {/* Header */}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="mb-3 flex items-center justify-between">
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Columna izquierda */}
              <div className="space-y-3">
                {/* Asignar usuario (tarea principal) */}
                <div className=" h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl">
                  <span className=" ml-2 aspect-square min-w-10 min-h-10 flex items-center ">
                    {assignedTo ? (
                      <img
                        src={
                          members.find((m) => m.uid === assignedTo)?.photo ||
                          samplePhoto
                        }
                        alt="assigned"
                        className="fixed h-15 w-auto rounded-full border-2 border-blue-500 object-cover aspect-square"
                      />
                    ) : (
                      <img
                        src={myImage.defaultUser}
                        alt="assign"
                        className=" fixed h-15 w-auto rounded-full border-2 border-slate-400 object-cover aspect-square"
                      />
                    )}
                  </span>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="selectBase"
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member.uid} value={member.uid}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Fecha */}
                <div className="h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl">
                  <span className="ml-3 mx-3 px-2 py-2 ">
                    <SVGIcons.calendar className="h-6 w-6" alt="date" />
                  </span>
                  <input
                    type="date"
                    value={completeBy}
                    onChange={(e) => setCompleteBy(e.target.value)}
                    className="inputBaseDate"
                  />
                </div>

                {/* Prioridad */}
                <div className="h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl">
                  <span className="ml-3  px-2 py-2 ">
                    {priority === "high" ? (
                      <SVGIcons.high
                        className="h-6 w-6 text-[var(--orange)]"
                        alt="high"
                      />
                    ) : priority === "medium" ? (
                      <SVGIcons.med
                        className="h-6 w-6 text-[var(--yellow)]"
                        alt="medium"
                      />
                    ) : priority === "low" ? (
                      <SVGIcons.low
                        className="h-6 w-6 text-[var(--green)]"
                        alt="low"
                      />
                    ) : (
                      <SVGIcons.question
                        className="h-6 w-6"
                        alt="No priority selected reload"
                      />
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
                    className={"textAreaBase" + " min-h-[102px]"}
                  />
                </div>
              </div>
            </div>

            {/* Sub-tasks con asignación independiente */}
            <div className="rounded-md border border-slate-200 p-3 bg-white/50">
              <div className="flex items-center justify-between mb-2">
                <label className={labelBase + " m-0"}>
                  Sub-tasks
                  <span className="text-slate-400">({subTasks.length}/10)</span>
                </label>
                <button
                  type="button"
                  className="text-xs text-slate-600 hover:text-slate-900 underline"
                  onClick={copyFromMain}
                  title="Copiar prioridad y fecha desde la tarea principal"
                >
                  Copiar de la principal
                </button>
              </div>

              {/* Formulario de sub-task */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                <input
                  type="text"
                  value={stName}
                  onChange={(e) => setStName(e.target.value)}
                  className={inputBase}
                  placeholder="Nombre (p. ej. wireframe)"
                  maxLength={100}
                />
                <select
                  value={stPriority}
                  onChange={(e) => setStPriority(e.target.value)}
                  className={inputBase}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
                <input
                  type="date"
                  value={stCompleteBy}
                  onChange={(e) => setStCompleteBy(e.target.value)}
                  className={inputBase}
                />
                <select
                  value={stAssignedTo}
                  onChange={(e) => setStAssignedTo(e.target.value)}
                  className={inputBase}
                >
                  <option value="">Sin asignar</option>
                  {members.map((member) => (
                    <option key={member.uid} value={member.uid}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddSubTask}
                  className={btnOutline}
                  disabled={!stName.trim() || subTasks.length >= 10}
                  title="Agregar sub-task"
                >
                  Agregar
                </button>
              </div>

              <textarea
                value={stNotes}
                onChange={(e) => setStNotes(e.target.value)}
                className={inputBase + " mb-2 min-h-[60px]"}
                placeholder="Notas de la sub-task (opcional)"
                maxLength={400}
              />

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
                            <span>• Límite: {st.completeBy}</span>
                          )}
                          {st.notes && <span>• Notas: {st.notes}</span>}
                          {st.assignedTo && (
                            <>
                              <span>• Asignado:</span>
                              <span className="inline-flex items-center gap-1">
                                <img
                                  src={
                                    members.find((m) => m.uid === st.assignedTo)
                                      ?.photo || samplePhoto
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
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <button
                id="create-public-task"
                type="submit"
                className={
                  user?.role !== "admin" ? "btn-disable " : "btn-green"
                }
                disabled={
                  submitting || !taskName.trim() || user?.role !== "admin"
                }
                title={
                  user?.role !== "admin"
                    ? "Solo los administradores pueden crear tareas públicas"
                    : "Cmd/Ctrl + Enter para crear"
                }
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Creando...
                  </span>
                ) : (
                  "Created task"
                )}
              </button>

              <button type="button" onClick={accion} className="btn-danger">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPublicTask;
