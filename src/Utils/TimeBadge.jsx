import React from "react";
import { tailwindClass } from "../importFiles/tailwindStyles";

function TimeBadge({ task, getTimeLeft }) {
  return (
    <>
      {task.completeBy && (
        <div className="hidden md:block">
          <span className={tailwindClass.badge.green}>
            {getTimeLeft(task.completeBy)}
          </span>
        </div>
      )}
    </>
  );
}

export default TimeBadge;
