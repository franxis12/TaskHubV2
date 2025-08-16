import React, { useState, useContext } from "react";
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

  return (
    <form
      onSubmit={handleCreate}
      className="mb-4 newPersonalTask componentBackground rounded-4 p-3 border"
    >
      <h5 className="mb-3">Nueva tarea personal</h5>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Nombre de la tarea"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        required
      />
      <div className="row mb-2">
        <div className="col">
          <label className="form-label">Prioridad</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="form-control"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>
        <div className="col">
          <label className="form-label">Fecha límite</label>
          <input
            type="date"
            value={completeBy}
            onChange={(e) => setCompleteBy(e.target.value)}
            className="form-control"
          />
        </div>
      </div>
      <label className="form-label">Notas</label>
      <textarea
        placeholder="Opcional"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="form-control mb-3"
      />
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-success" disabled={submitting}>
          {submitting ? "Creando..." : "Crear tarea personal"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-outline-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default PersonalTaskForm;
