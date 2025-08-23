// src/components/TaskEditor.jsx
import React, { useMemo, useState } from "react";
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
  const MAX_SUBS = 10;

  // --- estado local controlado (evita mutar props) ---
  const [form, setForm] = useState({
    taskName: task.taskName || "",
    completeBy: task.completeBy || "",
    priority: task.priority || "medium",
    assignedTo: task.assignedTo || "",
    status: task.status || "pending",
    notes: task.notes || "",
    subTasks: Array.isArray(task.subTasks)
      ? task.subTasks.map((s) => ({
          name: s?.name || "",
          priority: s?.priority || "medium",
          completeBy: s?.completeBy || "",
          notes: s?.notes || "",
          assignedTo: s?.assignedTo || "",
          status: s?.status || "pending",
        }))
      : [],
  });
  const [saving, setSaving] = useState(false);

  const initial = useMemo(
    () => ({
      taskName: task.taskName || "",
      completeBy: task.completeBy || "",
      priority: task.priority || "medium",
      assignedTo: task.assignedTo || "",
      status: task.status || "pending",
      notes: task.notes || "",
      subTasks: Array.isArray(task.subTasks) ? task.subTasks : [],
    }),
    [task]
  );
  const dirty = useMemo(
    () =>
      JSON.stringify(form) !==
      JSON.stringify({
        ...initial,
        // normalizamos initial.subTasks para comparar contra el shape del form
        subTasks: (initial.subTasks || []).map((s) => ({
          name: s?.name || "",
          priority: s?.priority || "medium",
          completeBy: s?.completeBy || "",
          notes: s?.notes || "",
          assignedTo: s?.assignedTo || "",
          status: s?.status || "pending",
        })),
      }),
    [form, initial]
  );

  const onChange = (key) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const onSubChange = (idx, key) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm((f) => {
      const copy = [...f.subTasks];
      copy[idx] = { ...copy[idx], [key]: val };
      return { ...f, subTasks: copy };
    });
  };

  const addSub = () => {
    if (form.subTasks.length >= MAX_SUBS) return;
    setForm((f) => ({
      ...f,
      subTasks: [
        ...f.subTasks,
        {
          name: "",
          priority: f.priority || "medium", // por comodidad, hereda
          completeBy: f.completeBy || "",
          notes: "",
          assignedTo: "",
          status: "pending",
        },
      ],
    }));
  };

  const removeSub = (idx) => {
    setForm((f) => {
      const copy = f.subTasks.filter((_, i) => i !== idx);
      return { ...f, subTasks: copy };
    });
  };

  const sanitizeSubTasks = (arr) =>
    (arr || [])
      .map((s) => ({
        name: (s?.name || "").trim(),
        priority: s?.priority || "medium",
        completeBy: s?.completeBy || "",
        notes: (s?.notes || "").trim(),
        assignedTo: s?.assignedTo || "",
        status: s?.status || "pending",
      }))
      .filter((s) => s.name); // descarta las vacías

  const save = async () => {
    try {
      if (isMissed) {
        alert('Las tareas "missed" no se pueden editar.');
        return;
      }
      setSaving(true);
      const ref = doc(db, "tasks", task.id);
      await updateDoc(ref, {
        taskName: form.taskName.trim(),
        completeBy: form.completeBy || "",
        priority: form.priority,
        assignedTo: form.assignedTo || null,
        status: form.status,
        notes: form.notes || "",
        subTasks: sanitizeSubTasks(form.subTasks).slice(0, MAX_SUBS),
      });
      onClose?.();
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
      alert("No se pudo guardar. Revisa la consola.");
    } finally {
      setSaving(false);
    }
  };

  // --- helpers UI / estilos coherentes ---
  const inputBase =
    "flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
    "placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/40";

  const btnBase =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const btnDanger =
    btnBase + " bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800";
  const btnPrimary =
    btnBase +
    " bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-800/90";
  const btnSecondary =
    btnBase +
    " border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100";
  const btnOutline =
    btnBase +
    " border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100";

  const priorityText = {
    low: "text-teal",
    medium: "text-yellow",
    high: "text-orange",
  };
  const priorityBorder = {
    low: "border-teal-2",
    medium: "border-Yellow-2",
    high: "border-orange-2",
  };
  const statusBg = {
    pending: "bg-yellow-trasparent text-yellow",
    progress: "bg-teal-trasparent text-teal",
    completed: "bg-teal-trasparent text-teal",
    missed: "bg-orange-trasparent text-orange",
  };

  if (isMissed) {
    return (
      <div
        className="w-full rounded-xl border border-slate-200 bg-[var(--componentsBG)] p-4 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full text-center">
          <p className="text-rose-600 mb-3">
            Esta tarea está marcada como <b>Missed</b> y no se puede modificar.
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <button className={btnDanger} onClick={() => onDelete?.(task)}>
            Delete task
          </button>
          <button className={btnSecondary} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  const assignee = userMap?.[form.assignedTo];

  return (
    <div
      className="w-full rounded-xl border border-slate-200 bg-[var(--componentsBG)] p-4 shadow-sm"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Badge de estado */}
          <span
            className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
              "border-purple-1",
              statusBg[form.status] || "bg-slate-50 text-slate-600",
            ].join(" ")}
            title={`Estado: ${form.status}`}
          >
            <img
              src={statusIcon[form.status] || statusIconImg}
              alt="status"
              className="h-4 w-4 mr-1"
            />
            <span className="capitalize">{form.status}</span>
          </span>

          {/* Pill de prioridad */}
          <span
            className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
              priorityBorder[form.priority],
              priorityText[form.priority],
            ].join(" ")}
            title={`Prioridad: ${form.priority}`}
          >
            <img
              src={priorityIcons[form.priority]}
              className="h-4 w-4 mr-1"
              alt="priority"
            />
            <span className="capitalize">{form.priority}</span>
          </span>

          {/* Tipo */}
          <span className="text-xs text-slate-500 capitalize">
            {task.type === "public" ? "Public" : "Personal"}
          </span>
        </div>

        {/* Asignado (avatar + nombre) */}
        <div className="flex items-center gap-2">
          <div className="p-0.5 rounded-full border-teal-2">
            <img
              src={assignee?.photo || samplePhoto}
              alt="assigned"
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {assignee?.name || "Unassigned"}
          </div>
        </div>
      </div>

      {/* BODY: 3 columnas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Columna 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
              <img src={titleIcon} alt="title" className="h-5 w-5" />
            </span>
            <input
              type="text"
              className={inputBase}
              placeholder="Editar nombre de la tarea"
              value={form.taskName}
              onChange={onChange("taskName")}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
              <img src={calendarIcon} alt="date" className="h-5 w-5" />
            </span>
            <input
              type="date"
              className={inputBase}
              value={form.completeBy}
              onChange={onChange("completeBy")}
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

        {/* Columna 2 */}
        <div className="space-y-3">
          {/* Asignación */}
          <div className="flex items-center gap-2">
            <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
              <img
                src={assignee?.photo || samplePhoto}
                alt="assigned"
                className="h-10 w-10 rounded-full border-2 border-blue-500 object-cover"
              />
            </span>
            <select
              className={inputBase}
              value={form.assignedTo}
              onChange={onChange("assignedTo")}
              disabled={task.type === "personal" || !isAdmin}
              style={!isAdmin ? { pointerEvents: "none", opacity: 1 } : {}}
            >
              <option value="">No asignada</option>
              {Object.entries(userMap || {}).map(([uid, info]) => (
                <option key={uid} value={uid}>
                  {info.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridad */}
          <div className="flex items-center gap-2">
            <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
              <img
                src={priorityIcons[form.priority]}
                alt="priority"
                className="h-5 w-5"
              />
            </span>
            <select
              className={inputBase}
              value={form.priority}
              onChange={onChange("priority")}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-2">
            <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
              <img
                src={statusIcon[form.status] || statusIconImg}
                alt="status"
                className="h-5 w-5"
              />
            </span>
            <select
              className={inputBase}
              value={form.status}
              onChange={onChange("status")}
            >
              <option value="pending">Pendiente</option>
              <option value="progress">En progreso</option>
              <option value="completed">Completada</option>
              <option value="missed">Missed</option>
            </select>
          </div>
        </div>

        {/* Columna 3: notas + acciones */}
        <div className="flex flex-col items-end space-y-3">
          <div className="flex items-start gap-2 w-full">
            <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
              <img src={note} alt="notes" className="h-5 w-5" />
            </span>
            <textarea
              className={inputBase + " min-h-[100px]"}
              placeholder="Notas"
              value={form.notes}
              onChange={onChange("notes")}
            />
          </div>

          <div className="flex gap-2">
            <button className={btnSecondary} onClick={onClose}>
              Cancelar
            </button>
            <button
              className={btnPrimary}
              onClick={save}
              disabled={!dirty || saving}
              title={!dirty ? "Sin cambios" : ""}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      {/* SUBTASKS */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white/50 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-slate-800">
            Sub-tasks{" "}
            <span className="text-slate-400">
              ({form.subTasks.length}/{MAX_SUBS})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={btnOutline}
              onClick={addSub}
              disabled={form.subTasks.length >= MAX_SUBS}
              title="Agregar sub-task"
            >
              Agregar
            </button>
          </div>
        </div>

        {form.subTasks.length === 0 ? (
          <div className="text-sm text-slate-500">No hay sub-tasks.</div>
        ) : (
          <ul className="space-y-2">
            {form.subTasks.map((st, idx) => {
              const ass = userMap?.[st.assignedTo];
              return (
                <li
                  key={`st-${idx}`}
                  className="rounded-lg border border-slate-200 bg-white p-2"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    {/* Nombre */}
                    <div className="md:col-span-4 flex items-center gap-2">
                      <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                        <img src={titleIcon} alt="title" className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        className={inputBase}
                        placeholder="Nombre de la sub-task"
                        value={st.name}
                        onChange={onSubChange(idx, "name")}
                        maxLength={100}
                      />
                    </div>

                    {/* Prioridad */}
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                        <img
                          src={priorityIcons[st.priority]}
                          alt="priority"
                          className="h-5 w-5"
                        />
                      </span>
                      <select
                        className={inputBase}
                        value={st.priority}
                        onChange={onSubChange(idx, "priority")}
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>

                    {/* Fecha */}
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                        <img
                          src={calendarIcon}
                          alt="date"
                          className="h-5 w-5"
                        />
                      </span>
                      <input
                        type="date"
                        className={inputBase}
                        value={st.completeBy}
                        onChange={onSubChange(idx, "completeBy")}
                      />
                    </div>

                    {/* Estado */}
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                        <img
                          src={statusIcon[st.status] || statusIconImg}
                          alt="status"
                          className="h-5 w-5"
                        />
                      </span>
                      <select
                        className={inputBase}
                        value={st.status}
                        onChange={onSubChange(idx, "status")}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="progress">En progreso</option>
                        <option value="completed">Completada</option>
                        <option value="missed">Missed</option>
                      </select>
                    </div>

                    {/* Asignado */}
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                        <img
                          src={ass?.photo || samplePhoto}
                          alt="assigned"
                          className="h-10 w-10 rounded-full border-2 border-blue-500 object-cover"
                        />
                      </span>
                      <select
                        className={inputBase}
                        value={st.assignedTo || ""}
                        onChange={onSubChange(idx, "assignedTo")}
                        disabled={task.type === "personal" || !isAdmin}
                        style={
                          !isAdmin ? { pointerEvents: "none", opacity: 1 } : {}
                        }
                      >
                        <option value="">No asignada</option>
                        {Object.entries(userMap || {}).map(([uid, info]) => (
                          <option key={uid} value={uid}>
                            {info.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notas (fila completa) */}
                    <div className="md:col-span-10 flex items-start gap-2">
                      <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                        <img src={note} alt="notes" className="h-5 w-5" />
                      </span>
                      <textarea
                        className={inputBase + " min-h-[60px]"}
                        placeholder="Notas (opcional)"
                        value={st.notes}
                        onChange={onSubChange(idx, "notes")}
                        maxLength={400}
                      />
                    </div>

                    {/* Eliminar */}
                    <div className="md:col-span-2 flex items-start justify-end">
                      <button
                        type="button"
                        className={btnDanger}
                        onClick={() => removeSub(idx)}
                        title="Eliminar sub-task"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TaskEditor;
