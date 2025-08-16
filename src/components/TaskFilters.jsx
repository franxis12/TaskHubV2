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

  return (
    <div
      className="filterMenu p-3 mb-3 rounded-4 w-100"
      style={{ background: "var(--componentsBG)" }}
    >
      <div className="row g-2 align-items-start d-flex flex-column w-100">
        <div className="col-12 col-md-3 w-100">
          <label htmlFor="taskSearch" className="form-label">
            Search
          </label>
          <input
            id="taskSearch"
            type="text"
            className="form-control"
            placeholder="Task name or notes..."
            defaultValue={filters.search}
            onChange={handleSearchChange}
            aria-label="Search tasks"
          />
        </div>

        <div className="d-flex gap-3 w-100">
          <div className="w-50">
            <label htmlFor="typeSel" className="form-label">
              Type
            </label>
            <select
              id="typeSel"
              className="form-control"
              value={filters.type}
              onChange={handleChange("type")}
            >
              <option value="all">All</option>
              <option value="public">Public</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          <div className="w-50">
            <label htmlFor="prioritySel" className="form-label">
              Priority
            </label>
            <select
              id="prioritySel"
              className="form-control"
              value={filters.priority}
              onChange={handleChange("priority")}
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="w-100">
          <label htmlFor="statusSel" className="form-label">
            Status
          </label>
          <select
            id="statusSel"
            className="form-control"
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

        <div className="w-100">
          <label htmlFor="assignedSel" className="form-label">
            Assigned to
          </label>
          <select
            id="assignedSel"
            className="form-control"
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

        <div className="d-flex w-100 gap-3">
          <div className="w-50">
            <label htmlFor="dueFrom" className="form-label">
              Due from
            </label>
            <input
              id="dueFrom"
              type="date"
              className="form-control"
              value={filters.dueFrom}
              onChange={handleChange("dueFrom")}
            />
          </div>

          <div className="w-50">
            <label htmlFor="dueTo" className="form-label">
              Due to
            </label>
            <input
              id="dueTo"
              type="date"
              className="form-control"
              value={filters.dueTo}
              onChange={handleChange("dueTo")}
            />
          </div>
        </div>

        <div className="form-check mt-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="overdueOnly"
            checked={!!filters.overdueOnly}
            onChange={handleChange("overdueOnly")}
          />
          <label className="form-check-label" htmlFor="overdueOnly">
            Overdue only
          </label>
        </div>

        <div className="col-12 col-md-2 w-100">
          <button
            className="btn btn-outline-secondary w-100 mt-2 mt-md-0"
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
