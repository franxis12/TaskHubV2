import React from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import samplePhoto from "../assets/sample.png";
import note from "../assets/icons/note.svg";

function TaskEditor({
  task,
  user,
  userMap,
  priorityIcons,
  statusIcon,
  statusIconImg,
  calendarIcon,
  titleIcon = note,
  onClose,
  onDelete,
}) {
  const isAdmin = user?.role === "admin";
  const isMissed = task.status === "missed";

  const save = async () => {
    try {
      if (isMissed) {
        // Seguridad extra en UI por si acaso
        alert('Las tareas "missed" no se pueden editar.');
        return;
      }
      const ref = doc(db, "tasks", task.id);
      await updateDoc(ref, {
        taskName: task.taskName || "",
        completeBy: task.completeBy || "",
        priority: task.priority || "medium",
        assignedTo: task.assignedTo || null,
        status: task.status || "pending",
        notes: task.notes || "",
      });
      onClose?.();
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
      alert("No se pudo guardar. Revisa la consola.");
    }
  };

  if (isMissed) {
    return (
      <div
        className="editTask p-3 w-100 d-flex"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-100 text-center">
          <p className="text-danger mb-3">
            Esta tarea está marcada como <b>Missed</b> y no se puede modificar.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-danger" onClick={() => onDelete?.(task)}>
              Delete task
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="editTask p-3 w-100 d-flex"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-100">
        <div className="input-group mb-2 w-75">
          <span className="input-group-text bg-white">
            <img src={titleIcon} alt="title" className="statusIcon" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Editar nombre de la tarea"
            defaultValue={task.taskName}
            onChange={(e) => (task.taskName = e.target.value)}
          />
        </div>

        <div className="input-group mb-2 w-75">
          <span className="input-group-text bg-white">
            <img src={calendarIcon} alt="date" className="statusIcon" />
          </span>
          <input
            type="date"
            className="form-control"
            defaultValue={task.completeBy}
            onChange={(e) => (task.completeBy = e.target.value)}
          />
        </div>

        <button
          className="btn btn-danger"
          disabled={task.status === "progress"}
          title={
            task.status === "progress"
              ? "No puedes eliminar una tarea en progreso"
              : ""
          }
          onClick={() => onDelete?.(task)}
        >
          Delete task
        </button>
      </div>

      <div className="w-100">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="input-group w-50">
            <span className="input-group-text bg-white">
              <img
                src={userMap[task.assignedTo]?.photo || samplePhoto}
                alt="assigned"
                className="taskPicAssi rounded-5 border border-2 border-primary"
                style={{ width: 40, height: 40 }}
              />
            </span>
            <select
              className="form-control"
              defaultValue={task.assignedTo || ""}
              onChange={(e) => (task.assignedTo = e.target.value)}
              disabled={task.type === "personal" || !isAdmin}
              style={!isAdmin ? { pointerEvents: "none", opacity: 1 } : {}}
            >
              <option value="">No asignada</option>
              {Object.entries(userMap).map(([uid, info]) => (
                <option key={uid} value={uid}>
                  {info.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group mb-2 w-75">
          <span className="input-group-text bg-white">
            <img src={priorityIcons[task.priority]} alt="priority" />
          </span>
          <select
            className="form-control"
            defaultValue={task.priority}
            onChange={(e) => (task.priority = e.target.value)}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div className="input-group mb-2 w-75">
          <span className="input-group-text bg-white">
            <img
              src={statusIcon[task.status] || statusIconImg}
              alt="status"
              className="statusIcon"
            />
          </span>
          <select
            className="form-control"
            defaultValue={task.status}
            onChange={(e) => (task.status = e.target.value)}
          >
            <option value="pending">Pendiente</option>
            <option value="progress">En progreso</option>
            <option value="completed">Completada</option>
            <option value="missed">Missed</option>
          </select>
        </div>
      </div>

      <div className="w-100 d-flex flex-column align-items-end">
        <div className="input-group mb-2 w-100">
          <span className="input-group-text bg-white">
            <img src={note} alt="notes" className="statusIcon" />
          </span>
          <textarea
            className="form-control"
            placeholder="Notas"
            defaultValue={task.notes}
            onChange={(e) => (task.notes = e.target.value)}
          />
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-danger" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={save}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskEditor;
