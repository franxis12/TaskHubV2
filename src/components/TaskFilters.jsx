// src/components/TaskFilters.jsx
import React, { useMemo, useRef, useEffect } from "react";

export const defaultFilters = {
  search: "",
  type: "all",
  priority: "all",
  status: "all",
  assignedTo: "all",
  dueFrom: "",
  dueTo: "",
  overdueOnly: false,
};

function TaskFilters({
  filters,
  setFilters,
  assignees = [],
  currentUserId, // opcional: para mostrar "Me"
}) {
  // --- debounce para search ---
  const searchTimer = useRef(null);
  const handleSearchChange = (e) => {
    const v = e.target.value;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: v }));
    }, 250);
  };

  // limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const isDefault = useMemo(() => {
    const a = filters;
    const b = defaultFilters;
    return (
      a.search === b.search &&
      a.type === b.type &&
      a.priority === b.priority &&
      a.status === b.status &&
      a.assignedTo === b.assignedTo &&
      a.dueFrom === b.dueFrom &&
      a.dueTo === b.dueTo &&
      (a.overdueOnly ?? false) === b.overdueOnly
    );
  }, [filters]);

  const reset = () => setFilters({ ...defaultFilters });

  // estilos base para inputs/selects
  const inputBase =
    "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
    "placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:border-slate-400";

  return (
    <div className="w-full mb-3 rounded-xl bg-[var(--componentsBG)] p-4 ring-1 ring-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        {/* Search */}
        <div className="md:col-span-3">
          <label
            htmlFor="taskSearch"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Search
          </label>
          <input
            id="taskSearch"
            type="text"
            className={inputBase}
            placeholder="Task name or notes..."
            defaultValue={filters.search}
            onChange={handleSearchChange}
            aria-label="Search tasks"
          />
        </div>

        {/* Type */}
        <div className="md:col-span-3">
          <label
            htmlFor="typeSel"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Type
          </label>
          <select
            id="typeSel"
            className={inputBase}
            value={filters.type}
            onChange={handleChange("type")}
          >
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        {/* Priority */}
        <div className="md:col-span-3">
          <label
            htmlFor="prioritySel"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Priority
          </label>
          <select
            id="prioritySel"
            className={inputBase}
            value={filters.priority}
            onChange={handleChange("priority")}
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Status */}
        <div className="md:col-span-3">
          <label
            htmlFor="statusSel"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Status
          </label>
          <select
            id="statusSel"
            className={inputBase}
            value={filters.status}
            onChange={handleChange("status")}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>
        </div>

        {/* Assigned to */}
        <div className="md:col-span-4">
          <label
            htmlFor="assignedSel"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Assigned to
          </label>
          <select
            id="assignedSel"
            className={inputBase}
            value={filters.assignedTo}
            onChange={handleChange("assignedTo")}
          >
            <option value="all">Anyone</option>
            <option value="unassigned">Unassigned</option>
            {currentUserId && <option value={currentUserId}>Me</option>}
            {assignees.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Due from */}
        <div className="md:col-span-4">
          <label
            htmlFor="dueFrom"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Due from
          </label>
          <input
            id="dueFrom"
            type="date"
            className={inputBase}
            value={filters.dueFrom}
            onChange={handleChange("dueFrom")}
          />
        </div>

        {/* Due to */}
        <div className="md:col-span-4">
          <label
            htmlFor="dueTo"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Due to
          </label>
          <input
            id="dueTo"
            type="date"
            className={inputBase}
            value={filters.dueTo}
            onChange={handleChange("dueTo")}
          />
        </div>

        {/* Overdue + Clear */}
        <div className="md:col-span-6 flex items-center gap-2">
          <input
            className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400/40 accent-slate-700"
            type="checkbox"
            id="overdueOnly"
            checked={!!filters.overdueOnly}
            onChange={handleChange("overdueOnly")}
          />
          <label className="text-sm text-slate-700" htmlFor="overdueOnly">
            Overdue only
          </label>
        </div>

        <div className="md:col-span-6">
          <button
            className="inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDefault}
            onClick={reset}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskFilters;
