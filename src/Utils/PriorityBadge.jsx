import React from "react";
import { SVGIcons } from "../importFiles/imports";
import { tailwindClass } from "../importFiles/tailwindStyles";

function PriorityBadge({ task }) {
  return (
    <div
      className={
        tailwindClass.priority.parent +
        (task.priority === "low"
          ? " bg-[var(--green-trasparent)]"
          : task.priority === "medium"
          ? " bg-[var(--yellow-trasparent)]"
          : task.priority === "high"
          ? " bg-[var(--orange-trasparent)]"
          : "")
      }
    >
      <div className={tailwindClass.priority.children1}>
        {task.priority === "high" ? (
          <SVGIcons.priority.high className="text-[var(--orange)] text-lg" />
        ) : task.priority === "medium" ? (
          <SVGIcons.priority.med className="text-[var(--yellow)]" />
        ) : task.priority === "low" ? (
          <SVGIcons.priority.low className="text-[var(--greenMain)]" />
        ) : (
          <SVGIcons.question />
        )}
      </div>
      <spa className={tailwindClass.priority.children2}>{task.priority}</spa>
    </div>
  );
}

export default PriorityBadge;
