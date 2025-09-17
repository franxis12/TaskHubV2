// src/components/TaskEditor.jsx
import React, { useMemo, useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";
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

  // Permissions
  const canEditPublic = task.type === "public" && isAdmin;
  const canEditPersonal =
    task.type === "personal" && task.createdBy === user?.uid;
  const canEdit = canEditPublic || canEditPersonal;

  const canDelete =
    task.type === "public" ? isAdmin : task.createdBy === user?.uid;

  const MAX_SUBS = 10;

  // --- controlled local state (avoid mutating props) ---
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

  const normalizedInitial = useMemo(
    () => ({
      ...initial,
      subTasks: (initial.subTasks || []).map((s) => ({
        name: s?.name || "",
        priority: s?.priority || "medium",
        completeBy: s?.completeBy || "",
        notes: s?.notes || "",
        assignedTo: s?.assignedTo || "",
        status: s?.status || "pending",
      })),
    }),
    [initial]
  );

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(normalizedInitial),
    [form, normalizedInitial]
  );

  const isTerminal = form.status === "completed" || form.status === "missed";

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
    if (!canEdit) return;
    if (form.subTasks.length >= MAX_SUBS) return;
    setForm((f) => ({
      ...f,
      subTasks: [
        ...f.subTasks,
        {
          name: "",
          priority: f.priority || "medium",
          completeBy: f.completeBy || "",
          notes: "",
          assignedTo: "",
          status: "pending",
        },
      ],
    }));
  };

  const removeSub = (idx) => {
    if (!canEdit) return;
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
      .filter((s) => s.name); // discard empty

  const save = async () => {
    try {
      if (!canEdit) {
        alert("You don't have permission to edit this task.");
        return;
      }
      if (isMissed) {
        alert('Missed tasks cannot be edited.');
        return;
      }
      setSaving(true);
      const ref = doc(db, "tasks", task.id);

      const payload = {
        taskName: form.taskName.trim(),
        completeBy: form.completeBy || "",
        priority: form.priority,
        assignedTo: form.assignedTo || null,
        status: form.status,
        notes: form.notes || "",
        subTasks: sanitizeSubTasks(form.subTasks).slice(0, MAX_SUBS),
      };

      // if it transitioned to completed now, set completedAt
      if (task.status !== "completed" && form.status === "completed") {
        payload.completedAt = serverTimestamp();
      }

      await updateDoc(ref, payload);
      onClose?.();
    } catch (err) {
      console.error("Error updating task:", err);
      alert("We couldn't save the changes. Check the console for details.");
    } finally {
      setSaving(false);
    }
  };

  // --- UI helpers / consistent styles ---
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

  // read-only notice
  const readOnlyBanner =
    !canEdit &&
    "This task is read-only for your user (you don't have edit permissions).";

  if (isMissed) {
    return (
      <div
        className="w-full rounded-xl border border-slate-200 bg-[var(--componentsBG)] p-4 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full text-center">
          <p className="text-rose-600 mb-3">
            This task is marked as <b>Missed</b> and cannot be modified.
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            className={btnDanger}
            onClick={() => onDelete?.(task)}
            disabled={!canDelete}
            title={!canDelete ? "You don't have permission to delete." : ""}
          >
            Delete task
          </button>
          <button className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const assignee = userMap?.[form.assignedTo];

  return (
    <div
      className="w-full rounded-xl border border-slate-200 bg-[var(--componentsBG)]  p-2 shadow-sm"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <span
            className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
              "border-purple-1",
              statusBg[form.status] || "bg-slate-50 text-slate-600",
            ].join(" ")}
            title={`Status: ${form.status}`}
          >
            <img
              src={statusIcon[form.status] || statusIconImg}
              alt="status"
              className="h-4 w-4 mr-1"
            />
            <span className="capitalize">{form.status}</span>
          </span>

          {/* Priority pill */}
          <span
            className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
              priorityBorder[form.priority],
              priorityText[form.priority],
            ].join(" ")}
            title={`Priority: ${form.priority}`}
          >
            <img
              src={priorityIcons[form.priority]}
              className="h-4 w-4 mr-1"
              alt="priority"
            />
            <span className="capitalize">{form.priority}</span>
          </span>

          {/* Type */}
          <span className="text-xs text-slate-500 capitalize">
            {task.type === "public" ? "Public" : "Personal"}
          </span>
        </div>

        {/* Assigned (avatar + name) */}
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

      {readOnlyBanner && (
        <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {readOnlyBanner}
        </div>
      )}

      {/* BODY: 3 main columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
              <img src={titleIcon} alt="title" className="h-5 w-5" />
            </span>
            <input
              type="text"
              className={inputBase}
              placeholder="Edit task name"
              value={form.taskName}
              onChange={onChange("taskName")}
              disabled={!canEdit}
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
              disabled={!canEdit}
            />
          </div>

          <button
            className={btnDanger}
            disabled={!canDelete || task.status === "progress"}
            title={
              !canDelete
                ? "You don't have permission to delete."
                : task.status === "progress"
                ? "You can't delete a task in progress"
                : ""
            }
            onClick={() => onDelete?.(task)}
          >
            Delete task
          </button>
        </div>

        {/* Column 2 */}
        <div className="space-y-3">
          {/* Assignment */}
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
              disabled={
                // public: only admin can change
                (task.type === "public" && !isAdmin) ||
                // personal: only the creator (canEditPersonal)
                (task.type === "personal" && !canEditPersonal)
              }
            >
              <option value="">Unassigned</option>
              {Object.entries(userMap || {}).map(([uid, info]) => (
                <option key={uid} value={uid}>
                  {info.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
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
              disabled={!canEdit}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Status */}
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
              disabled={!canEdit || isTerminal}
              title={
                isTerminal
                  ? "You can't change the status when the task is Completed or Missed"
                  : ""
              }
            >
              <option value="pending">Pending</option>
              <option value="progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
            </select>
          </div>
        </div>

        {/* Column 3: notes + actions */}
        <div className="flex flex-col items-end space-y-3">
          <div className="flex items-start gap-2 w-full">
            <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
              <img src={note} alt="notes" className="h-5 w-5" />
            </span>
            <textarea
              className={inputBase + " min-h-[100px]"}
              placeholder="Notes"
              value={form.notes}
              onChange={onChange("notes")}
              disabled={!canEdit}
            />
          </div>

          <div className="flex gap-2">
            <button className={btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button
              className={btnPrimary}
              onClick={save}
              disabled={!dirty || saving || !canEdit}
              title={
                !canEdit
                  ? "You don't have permission to edit."
                  : !dirty
                  ? "No changes"
                  : ""
              }
            >
              {saving ? "Saving..." : "Save changes"}
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
              disabled={form.subTasks.length >= MAX_SUBS || !canEdit}
              title={
                !canEdit ? "You don't have permission to edit." : "Add sub-task"
              }
            >
              Add
            </button>
          </div>
        </div>

        {form.subTasks.length === 0 ? (
          <div className="text-sm text-slate-500">No sub-tasks yet.</div>
        ) : (
          <ul className="space-y-2">
            {form.subTasks.map((st, idx) => {
              const ass = userMap?.[st.assignedTo];
              const disableSub = !canEdit;
              const disableSubAssignee =
                (task.type === "public" && !isAdmin) ||
                (task.type === "personal" && !canEditPersonal);

              return (
                <li
                  key={`st-${idx}`}
                  className="rounded-lg border border-slate-200 bg-white p-2"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    {/* Name */}
                    <div className="md:col-span-4 flex items-center gap-2">
                      <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                        <img src={titleIcon} alt="title" className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        className={inputBase}
                        placeholder="Sub-task name"
                        value={st.name}
                        onChange={onSubChange(idx, "name")}
                        maxLength={100}
                        disabled={disableSub}
                      />
                    </div>

                    {/* Priority */}
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
                        disabled={disableSub}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    {/* Date */}
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
                        disabled={disableSub}
                      />
                    </div>

                    {/* Status */}
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
                        disabled={disableSub}
                      >
                        <option value="pending">Pending</option>
                        <option value="progress">In progress</option>
                        <option value="completed">Completed</option>
                        <option value="missed">Missed</option>
                      </select>
                    </div>

                    {/* Assigned */}
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
                        disabled={disableSubAssignee}
                      >
                        <option value="">Unassigned</option>
                        {Object.entries(userMap || {}).map(([uid, info]) => (
                          <option key={uid} value={uid}>
                            {info.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes (full row) */}
                    <div className="md:col-span-10 flex items-start gap-2">
                      <span className="rounded-l-md bg-white px-2 py-2 border border-slate-300">
                        <img src={note} alt="notes" className="h-5 w-5" />
                      </span>
                      <textarea
                        className={inputBase + " min-h-[60px]"}
                        placeholder="Notes (optional)"
                        value={st.notes}
                        onChange={onSubChange(idx, "notes")}
                        maxLength={400}
                        disabled={disableSub}
                      />
                    </div>

                    {/* Delete */}
                    <div className="md:col-span-2 flex items-start justify-end">
                      <button
                        type="button"
                        className={btnDanger}
                        onClick={() => removeSub(idx)}
                        title="Delete sub-task"
                        disabled={!canEdit}
                      >
                        Delete
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
