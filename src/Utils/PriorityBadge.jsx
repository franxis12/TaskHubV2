import React from "react";
import { SVGIcons } from "../importFiles/imports";

function PriorityBadge({ task }) {
  return (
    <div
      className={`col-span-1  w-10 h- flex items-center justify-center rounded-3xl `}
    >
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
  );
}

export default PriorityBadge;
