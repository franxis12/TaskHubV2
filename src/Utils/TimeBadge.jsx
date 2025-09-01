import React from "react";
import { tailwindClass } from "../importFiles/tailwindStyles";
import { SVGIcons } from "../importFiles/imports";

function TimeBadge({ task, getTimeLeft }) {
  const timeleft = getTimeLeft(task.completeBy);
  return (
    <div
      className={
        tailwindClass.time.parent +
        (timeleft == "Overdue"
          ? " bg-[var(--orange-trasparent)]"
          : timeleft === "Today"
          ? " bg-[var(--yellow-trasparent)]"
          : " bg-[var(--green-trasparent)]")
      }
    >
      <div className={tailwindClass.time.children1}>
        <SVGIcons.timeLeft />
      </div>
      <span
        className={
          tailwindClass.time.children2 + "hidden md:block  text-[10px]"
        }
      >
        {getTimeLeft(task.completeBy)}
      </span>
    </div>
  );
}

export default TimeBadge;
