// src/components/TaskFilters.jsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import Input from "../Utils/Input";
import Container from "../Utils/Container";
import Button from "../Utils/Button";
import Select from "../Utils/Select";
import { MyComponents } from "../importFiles/components";
import { SVGIcons } from "../importFiles/imports";

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
  currentUserId, // optional: to show "Me"
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // --- debounce for search ---
  const searchTimer = useRef(null);
  const handleSearchChange = (e) => {
    const v = e.target.value;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: v }));
    }, 250);
  };

  // clear timeout on unmount
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

  const taskType = [
    { uid: "all", name: "All" },
    { uid: "public", name: "Public" },
    { uid: "personal", name: "Personal" },
  ];
  const taskPriority = [
    { uid: "all", name: "All" },
    { uid: "high", name: "High" },
    { uid: "medium", name: "Medium" },
    { uid: "low", name: "Low" },
  ];

  const taskStatus = [
    { uid: "all", name: "All" },
    { uid: "pending", name: "Pending" },
    { uid: "progress", name: "In progress" },
    { uid: "completed", name: "Completed" },
    { uid: "missed", name: "Missed" },
  ];

  const taskAssignee = [
    { uid: "all", name: "Anyone" },
    { uid: "unassigned", name: "Unassigned" },
    { uid: currentUserId, name: "Me" },
  ];

  // base styles for inputs/selects
  const inputBase =
    "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
    "placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:border-slate-400";

  return (
    <div className=" bg-pages  w-full h-20">
      <div className="flex flex-col w-full items-center justify-between">
        {/* Search */}
        <div className="flex w-full items-center justify-between">
          <MyComponents.Input
            id={"taskSearch"}
            type={"text"}
            placeholder="Task name or notes..."
            defaultValue={filters.search}
            onChange={handleSearchChange}
            icon={SVGIcons.search}
            iconSize={"6"}
            current={"taskSearch"}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            plain
          />{" "}
          <div className="flex items-center justify-center h-full gap-2">
            <MyComponents.Button
              disabled={isDefault}
              onClick={reset}
              color={"yellow"}
            >
              Clear
            </MyComponents.Button>
          </div>
        </div>

        <div
          className={`
                   ${showFilters ? "flex" : "hidden md:flex"}
                   flex-col gap-4
                   fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                   bg-white p-6 shadow-2xl border-2 border-gray-200 
                   rounded-2xl 
                   md:static md:flex md:flex-row md:items-center md:justify-between 
                   md:shadow-none md:border-0 md:p-0 
                   md:transform-none md:translate-x-0 md:translate-y-0
                   md:w-auto
                   transition-all duration-300 ease-in-out
                   z-500
                   w-5/6
                   h-5/6
                 `}
        >
          {/* Type */}
          <MyComponents.Select
            labelName={"Type :"}
            label={"Type :"}
            id="typeSel"
            value={filters.type}
            onChange={handleChange("type")}
            map={taskType}
            icon={
              filters.type === "personal"
                ? SVGIcons.personal
                : filters.type === "public"
                ? SVGIcons.public
                : SVGIcons.question
            }
            iconSize={"6"}
          />

          {/* Priority */}
          <MyComponents.Select
            labelName={"Priority"}
            label={"Priority"}
            id="prioritySel"
            value={filters.priority}
            onChange={handleChange("priority")}
            map={taskPriority}
            icon={
              filters.priority === "high"
                ? SVGIcons.priority.high
                : filters.priority === "medium"
                ? SVGIcons.priority.med
                : filters.priority === "low"
                ? SVGIcons.priority.low
                : SVGIcons.question
            }
            iconSize={"6"}
            iconColor={
              filters.priority === "high"
                ? "orange"
                : filters.priority === "medium"
                ? "yellow"
                : filters.priority === "low"
                ? "green"
                : ""
            }
          />

          {/* Status */}
          <MyComponents.Select
            label={"Status"}
            id="statusSel"
            value={filters.status}
            onChange={handleChange("status")}
            map={taskStatus}
            icon={
              filters.status === "completed"
                ? SVGIcons.status.completed
                : filters.status === "pending"
                ? SVGIcons.status.pending
                : filters.status === "progress"
                ? SVGIcons.status.progress
                : filters.status === "missed"
                ? SVGIcons.status.missed
                : SVGIcons.question
            }
            iconSize={"6"}
            iconColor={
              filters.status === "missed"
                ? "orange"
                : filters.status === "pending"
                ? "yellow"
                : filters.status === "completed"
                ? "green"
                : filters.status === "progress"
                ? "yellow"
                : ""
            }
          />

          {/* Assigned to */}
          <MyComponents.Select
            label={"Assigned to"}
            id="assignedSel"
            value={filters.assignedTo}
            onChange={handleChange("assignedTo")}
            map={taskAssignee}
            optionsMap={assignees}
          />

          {/* Due from */}
          <MyComponents.Input
            id={"dueFrom"}
            type={"date"}
            defaultValue={filters.search}
            onChange={handleChange("dueFrom")}
            icon={SVGIcons.calendar}
            value={filters.dueFrom}
            label={"From :"}
            current={"due"}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            plain
          />

          {/* Due to */}
          <MyComponents.Input
            id={"dueTo"}
            type={"date"}
            defaultValue={filters.search}
            onChange={handleChange("dueTo")}
            icon={SVGIcons.calendar}
            value={filters.dueTo}
            label={"To :"}
            current={"due"}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            plain
          />

          {/* Overdue + Clear */}
          <div className="flex items-center gap-2 center justify-center h-full">
            <MyComponents.Input
              type="checkbox"
              id="overdueOnly"
              checked={!!filters.overdueOnly}
              onChange={handleChange("overdueOnly")}
              plain
            />
            <label className="text-sm text-slate-700" htmlFor="overdueOnly">
              Overdue only
            </label>
          </div>

          <div className="flex items-center justify-center h-full gap-2">
            <div className="md:hidden">
              <MyComponents.Button
                onClick={() => setShowFilters(false)}
                color={"green"}
              >
                Close
              </MyComponents.Button>
            </div>
          </div>
        </div>
        {!expandedId && (
          <div className="flex gap-1">
            {" "}
            <div className="md:hidden">
              <MyComponents.Button
                onClick={() => setShowFilters(!showFilters)}
                color={""}
              >
                Filters
              </MyComponents.Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskFilters;
