import React, { useState, useContext, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { UserContext } from "../context/UserContext";

function PersonalTaskForm({ onClose, onCreated }) {
  const { user } = useContext(UserContext);
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [completeBy, setCompleteBy] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // NUEVO: estado para sub-tasks con mismos campos que la principal
  const [stName, setStName] = useState("");
  const [stPriority, setStPriority] = useState("medium");
  const [stCompleteBy, setStCompleteBy] = useState("");
  const [stNotes, setStNotes] = useState("");
  const [subTasks, setSubTasks] = useState([]); // [{name, priority, completeBy, notes, status}]

  // Atajo: Cmd/Ctrl + Enter => enviar
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

  // Rellena los campos de sub-task con los valores actuales de la principal
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
    // limpiar inputs sub-task
    setStName("");
    setStNotes("");
    // Mantengo prioridad/fecha para que puedas agregar varias similares
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
    setSubmitting(true);
    try {
      await addDoc(collection(db, "tasks"), {
        taskName: taskName.trim(),
        subTasks, // arreglo con mismos campos que la principal
        status: "pending",
        type: "personal",
        createdBy: user.uid,
        assignedTo: user.uid,
        companyId: user.companyId,
        createdAt: serverTimestamp(),
        completeBy: completeBy || "",
        priority,
        notes: notes || "",
        // flags: CFs gestionan los contadores
        pendingCounted: false,
        completedCounted: false,
        missedCounted: false,
      });

      // reset
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

  // utilidades de estilo
  const inputBase =
    "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
    "placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/40";
  const labelBase = "mb-1 block text-xs font-medium text-slate-600";
  const btnBase =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSuccess =
    btnBase +
    " bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800";
  const btnOutline =
    btnBase +
    " border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100";

  return (
    <form
      onSubmit={handleCreate}
      className="mb-4 rounded-xl p-4 ring-1 ring-slate-200 bg-[var(--componentsBG)] text-[var(--textColor)]"
    >
      <h5 className="mb-3 text-base font-semibold">Nueva tarea personal</h5>

      <input
        type="text"
        className={inputBase + " mb-2"}
        placeholder="Nombre de la tarea"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        required
        autoFocus
        maxLength={120}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        <div>
          <label className={labelBase}>Prioridad</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={inputBase}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div>
          <label className={labelBase}>Fecha límite</label>
          <input
            type="date"
            value={completeBy}
            onChange={(e) => setCompleteBy(e.target.value)}
            className={inputBase}
          />
        </div>
      </div>

      <label className={labelBase}>Notas</label>
      <textarea
        placeholder="Opcional"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={inputBase + " mb-4 min-h-[84px]"}
        maxLength={800}
      />

      {/* SUB-TASKS */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className={labelBase}>
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
                  className="text-xs text-slate-600 hover:text-red-600"
                  title="Eliminar"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          id="personal-task-submit"
          type="submit"
          className={btnSuccess}
          disabled={submitting || !taskName.trim()}
          title="Cmd/Ctrl + Enter para crear"
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
            "Crear tarea personal"
          )}
        </button>

        <button type="button" onClick={onClose} className={btnOutline}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default PersonalTaskForm;
