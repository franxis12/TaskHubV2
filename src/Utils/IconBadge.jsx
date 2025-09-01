import React from "react";
import { SVGIcons } from "../importFiles/imports";

function IconBadge({ task, tailwindClass, doneSubs, totalSubs }) {
  const hasSubs = typeof totalSubs === "number" && totalSubs > 0;
  const completed = typeof doneSubs === "number" ? doneSubs : 0;
  const counterText = hasSubs
    ? `${completed}/${totalSubs}`
    : task?.kind === "subtask" && typeof task?.subtaskIndex === "number"
    ? task.subtaskIndex + 1
    : "M";

  return (
    <div className="flex items-center px-2 text-lg font-semibold w-20">
      <div className="flex flex-col items-center w-14 justify-center bg-[var(--textColor)] pt-1 rounded-2xl overflow-hidden border border-slate-700/20 mr-1">
        {task?.type === "public" ? (
          <SVGIcons.public className={tailwindClass.icon.darkLight} />
        ) : (
          <SVGIcons.personal className={tailwindClass.icon.darkLight} />
        )}
        <div className="bg-[var(--textColorInverse)] p-1 px-5 text-[var(--textColor)] rounded-b-lg text-xs flex items-center justify-center w-full">
          {counterText}
        </div>
      </div>
    </div>
  );
}

export default IconBadge;
