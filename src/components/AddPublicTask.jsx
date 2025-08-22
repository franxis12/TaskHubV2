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
import priorityLow from "../assets/icons/LImportant.png";
import priorityMedium from "../assets/icons/MImportant.png";
import priorityHigh from "../assets/icons/HImportan.png";
import assignIcon from "../assets/icons/progress.svg";

function AddPublicTask({ accion }) {
  const { user } = useContext(UserContext);

  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [completeBy, setCompleteBy] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // NUEVO: estado para sub-tasks con mismos campos que la principal
  const [stName, setStName] = useState("");
  const [stPriority, setStPriority] = useState("medium");
  const [stCompleteBy, setStCompleteBy] = useState("");
  const [stNotes, setStNotes] = useState("");
  const [subTasks, setSubTasks] = useState([]); // [{name, priority, completeBy, notes, status}]

  const priorityIcons = {
    low: priorityLow,
    medium: priorityMedium,
    high: priorityHigh,
  };

  // Obtener miembros de la empresa
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
        status: "pending",
      },
    ]);

    // Limpiar nombre/notas; dejo prioridad/fecha por comodidad al agregar varias similares
    setStName("");
    setStNotes("");
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
      await addDoc(collection(db, "tasks"), {
        taskName: taskName.trim(),
        status: "pending",
        type: "public",
        createdBy: user.uid,
        companyId: user.companyId,
        assignedTo: assignedTo || null,
        priority,
        notes,
        createdAt: serverTimestamp(),
        completeBy,
        // NUEVO: guardar sub-tasks con mismos campos que la principal
        subTasks, // p.ej. [{name, priority, completeBy, notes, status}, ...]
        // flags para contadores
        pendingCounted: false,
        completedCounted: false,
        missedCounted: false,
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
    <div
      className="mt-4 w-full max-w-4xl rounded-xl p-4 ring-1 ring-slate-200"
      style={{
        backgroundColor: "var(--componentsBG)",
        color: "var(--textColor)",
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-base font-semibold">Crear nueva tarea pública</h4>
        <button onClick={accion} className={btnOutlineDanger}>
          Close
        </button>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Columna izquierda */}
          <div className="space-y-3">
            {/* Nombre de tarea */}
            <div className="flex items-center gap-2">
              <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                <img src={titleIcon} alt="title" className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Nombre de la tarea"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
                className={inputBase}
              />
            </div>

            {/* Asignar usuario */}
            <div className="flex items-center gap-2">
              <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                {assignedTo ? (
                  <img
                    src={
                      members.find((m) => m.uid === assignedTo)?.photo ||
                      samplePhoto
                    }
                    alt="assigned"
                    className="h-10 w-10 rounded-full border-2 border-blue-500 object-cover"
                  />
                ) : (
                  <img src={assignIcon} alt="assign" className="h-5 w-5" />
                )}
              </span>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={inputBase}
              >
                <option value="">Sin asignar (puede tomarla cualquiera)</option>
                {members.map((member) => (
                  <option key={member.uid} value={member.uid}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-3">
            {/* Fecha */}
            <div className="flex items-center gap-2">
              <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                <img src={calendarIcon} alt="date" className="h-5 w-5" />
              </span>
              <input
                type="date"
                value={completeBy}
                onChange={(e) => setCompleteBy(e.target.value)}
                className={inputBase}
              />
            </div>

            {/* Prioridad */}
            <div className="flex items-center gap-2">
              <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                <img
                  src={priorityIcons[priority]}
                  alt="priority"
                  className="h-5 w-5"
                />
              </span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputBase}
              >
                <option value="low">Prioridad baja</option>
                <option value="medium">Prioridad media</option>
                <option value="high">Prioridad alta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="flex items-start gap-2">
          <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
            <img src={noteIcon} alt="notes" className="h-5 w-5" />
          </span>
          <textarea
            placeholder="Notas (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputBase + " min-h-[84px]"}
          />
        </div>

        {/* NUEVO: Sub-tasks */}
        <div className="rounded-md border border-slate-200 p-3 bg-white/50">
          <div className="flex items-center justify-between mb-2">
            <label className={labelBase + " m-0"}>
              Sub-tasks{" "}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
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
                    <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                      <span>Prioridad: {st.priority}</span>
                      {st.completeBy && <span>• Límite: {st.completeBy}</span>}
                      {st.notes && (
                        <span className="truncate">• Notas: {st.notes}</span>
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
            className={btnPrimary}
            disabled={submitting || !taskName.trim() || user?.role !== "admin"}
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
              "Crear tarea"
            )}
          </button>

          <button type="button" onClick={accion} className={btnOutlineDanger}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPublicTask;
