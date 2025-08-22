// src/components/TaskFilters.jsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import Input from "../Utils/Input";
import Container from "../Utils/Container";
import Button from "../Utils/Button";
import Select from "../Utils/Select";

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
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

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
    <div className=" bg-pages  w-full h-5">
      <div className="flex w-full items-center justify-between ">
        {/* Search */}
        <Input
          id={"taskSearch"}
          type={"text"}
          classNameExtra={"h-full"}
          placeholder="Task name or notes..."
          defaultValue={filters.search}
          onChange={handleSearchChange}
          iconPick={"search"}
          hasIcon
          cols={"1"}
          current={"taskSearch"}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
        />

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
                   z-50
                 `}
        >
          {/* Type */}
          <Select
            cols="1"
            labelName={"Type :"}
            id="typeSel"
            value={filters.type}
            onChange={handleChange("type")}
            options={[
              { optionsVal: "all", nameOpt: "All" },
              { optionsVal: "public", nameOpt: "Public" },
              { optionsVal: "personal", nameOpt: "Personal" },
            ]}
          />

          {/* Priority */}
          <Select
            cols="1"
            labelName={"Priority"}
            id="prioritySel"
            value={filters.priority}
            onChange={handleChange("priority")}
            options={[
              { optionsVal: "all", nameOpt: "All" },
              { optionsVal: "high", nameOpt: "High" },
              { optionsVal: "medium", nameOpt: "Medium" },
              { optionsVal: "low", nameOpt: "Low" },
            ]}
          />

          {/* Status */}
          <Select
            cols="1"
            labelName={"Status"}
            id="statusSel"
            value={filters.status}
            onChange={handleChange("status")}
            options={[
              { optionsVal: "all", nameOpt: "All" },
              { optionsVal: "pending", nameOpt: "Pending" },
              { optionsVal: "progress", nameOpt: "In progress" },
              { optionsVal: "completed", nameOpt: "Completed" },
              { optionsVal: "missed", nameOpt: "Missed" },
            ]}
          />

          {/* Assigned to */}
          <Select
            cols={"1"}
            labelName={"Assigned to"}
            id="assignedSel"
            value={filters.assignedTo}
            onChange={handleChange("assignedTo")}
            options={[
              { optionsVal: "all", nameOpt: "Anyone" },
              { optionsVal: "unassigned", nameOpt: "Unassigned" },
              { optionsVal: currentUserId, nameOpt: "Me" },
            ]}
            optionsMap={assignees}
          />

          {/* Due from */}
          <Input
            id={"dueFrom"}
            type={"date"}
            classNameExtra={""}
            defaultValue={filters.search}
            onChange={handleChange("dueFrom")}
            iconPick={"date"}
            hasIcon
            value={filters.dueTo}
            labelName={"From :"}
            cols={"1"}
            current={"due"}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />

          {/* Due to */}
          <Input
            id={"dueTo"}
            type={"date"}
            classNameExtra={""}
            defaultValue={filters.search}
            onChange={handleChange("dueTo")}
            iconPick={"date"}
            hasIcon
            value={filters.dueTo}
            labelName={"To :"}
            cols={"1"}
            current={"due"}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />

          {/* Overdue + Clear */}
          <div className="flex items-center gap-2 center justify-center h-full">
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

          <div className="flex items-center justify-center h-full gap-2">
            <div className="md:hidden">
              <Button
                btnType={"danger"}
                btnName={"Close"}
                onClick={() => setShowFilters(false)}
                classNameExtra=" text-white rounded md:hidden"
              ></Button>
            </div>
          </div>
        </div>
        {!expandedId && (
          <div className="flex gap-1">
            {" "}
            <div className="md:hidden">
              <Button
                btnType={"primary"}
                btnName={"Filters"}
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              ></Button>
            </div>
            <div className="flex items-center justify-center h-full gap-2">
              <Button
                disabled={isDefault}
                onClick={reset}
                btnName={"Clear"}
                btnType={"primary"}
                classNameExtra={
                  "items-center justify-center pl-2 disabled:opacity-50 disabled:cursor-not-allowed"
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskFilters;
