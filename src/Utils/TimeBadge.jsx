import React from "react";

function TimeBadge({ task, tailwindClass, getTimeLeft }) {
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
