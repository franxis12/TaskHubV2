import React from "react";
import { SVGIcons } from "../importFiles/imports";
import { tailwindClass } from "../importFiles/tailwindStyles";

function StatusBadge({ task }) {
  return (
    <div
      className={
        tailwindClass.status.parent +
        (task.status === "completed"
          ? " bg-[var(--green-trasparent)]"
          : task.status === "pending"
          ? " bg-[var(--yellow-trasparent)]"
          : task.status === "missed"
          ? " bg-[var(--orange-trasparent)]"
          : task.status === "progress"
          ? "shadow-lg transition-all animate-pulse shadow-blue-600 bg-blue-300 "
          : "")
      }
    >
      <div className={tailwindClass.status.children1}>
        {task.status === "completed" ? (
          <SVGIcons.status.completed />
        ) : task.status === "pending" ? (
          <SVGIcons.status.pending />
        ) : task.status === "missed" ? (
          <SVGIcons.status.missed />
        ) : task.status === "progress" ? (
          SVGIcons?.status && SVGIcons.status.progress ? (
            <SVGIcons.status.progress className="animate-spin transition-all " />
          ) : (
            <SVGIcons.question className="animate-spin transition-all " />
          )
        ) : (
          <SVGIcons.question />
        )}
      </div>
      <span className={tailwindClass.status.children2}>{task.status}</span>
    </div>
  );
}

export default StatusBadge;
