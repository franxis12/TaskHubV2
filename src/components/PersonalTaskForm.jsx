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
      setTaskName("");
      setPriority("medium");
      setCompleteBy("");
      setNotes("");
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
        className={inputBase + " mb-3 min-h-[84px]"}
        maxLength={800}
      />

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
