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

  const inputBase =
    "flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
    "placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/40";

  const btnBase =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors";
  const btnDanger =
    btnBase +
    " bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50";
  const btnPrimary =
    btnBase +
    " bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-800/90";
  const btnSecondary =
    btnBase +
    " border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100";

  if (isMissed) {
    return (
      <div className="w-full p-3 flex" onClick={(e) => e.stopPropagation()}>
        <div className="w-full text-center">
          <p className="text-rose-600 mb-3">
            Esta tarea está marcada como <b>Missed</b> y no se puede modificar.
          </p>
          <div className="flex gap-2 justify-center">
            <button className={btnDanger} onClick={() => onDelete?.(task)}>
              Delete task
            </button>
            <button className={btnSecondary} onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full p-3 flex flex-col md:flex-row gap-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Columna izquierda */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
            <img src={titleIcon} alt="title" className="h-5 w-5" />
          </span>
          <input
            type="text"
            className={inputBase}
            placeholder="Editar nombre de la tarea"
            defaultValue={task.taskName}
            onChange={(e) => (task.taskName = e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
            <img src={calendarIcon} alt="date" className="h-5 w-5" />
          </span>
          <input
            type="date"
            className={inputBase}
            defaultValue={task.completeBy}
            onChange={(e) => (task.completeBy = e.target.value)}
          />
        </div>

        <button
          className={btnDanger}
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

      {/* Columna derecha */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-1/2">
            <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
              <img
                src={userMap[task.assignedTo]?.photo || samplePhoto}
                alt="assigned"
                className="h-10 w-10 rounded-full border-2 border-blue-500 object-cover"
              />
            </span>
            <select
              className={inputBase}
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

        <div className="flex items-center gap-2">
          <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
            <img
              src={priorityIcons[task.priority]}
              alt="priority"
              className="h-5 w-5"
            />
          </span>
          <select
            className={inputBase}
            defaultValue={task.priority}
            onChange={(e) => (task.priority = e.target.value)}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
            <img
              src={statusIcon[task.status] || statusIconImg}
              alt="status"
              className="h-5 w-5"
            />
          </span>
          <select
            className={inputBase}
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

      {/* Notas y acciones */}
      <div className="flex-1 flex flex-col items-end space-y-3">
        <div className="flex items-start gap-2 w-full">
          <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
            <img src={note} alt="notes" className="h-5 w-5" />
          </span>
          <textarea
            className={inputBase + " min-h-[80px]"}
            placeholder="Notas"
            defaultValue={task.notes}
            onChange={(e) => (task.notes = e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button className={btnDanger} onClick={onClose}>
            Cancelar
          </button>
          <button className={btnPrimary} onClick={save}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskEditor;
