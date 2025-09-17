// src/components/AssignedToMe.jsx
import React from "react";
import { SVGIcons } from "../importFiles/imports";
import IconBadge from "../Utils/IconBadge";
import { tailwindClass } from "../importFiles/tailwindStyles";
import TimeBadge from "../Utils/TimeBadge";
import StatusBadge from "../Utils/StatusBadge";
import PriorityBadge from "../Utils/PriorityBadge";

function AssignedToMe({
  assignedItems = [],
  getTimeLeft,
  setActionTaskId,
  setCurrentTask,
  setExpandedTaskIds,
}) {
  return (
    <>
      <div className="flex flex-col gap-2 col-span-12 ">
        {/*<<<<---- Container for task assigned Task   */}
        <div className="col-span-12 divTitle max-h-20 h-12 shadowBottom bg-[var(--bg-color-component)] ">
          <h3 className="font-semibold ml-3 mt-2 w-full">Assigned to me</h3>
        </div>

        <div className=" col-span-12 grid grid-cols-12 min-h-15 p-2">
          {assignedItems.length === 0 ? (
            <div className="col-span-12 rounded-xl border bg-[var(--componentsBG)]">
              {/*Pending*/}
              <h3 className="text-lg font-medium text-[var(--textColor)]">
                You have no assignments.
              </h3>
            </div>
          ) : (
            assignedItems.map((task) => {
              return (
                <div
                  key={task.id}
                  className="transform-gpu 
                  will-change-transform  
                  [backface-visibility:hidden]  
                  flex items-center justify-between
                  min-h-20 rounded-3xl col-span-12 
                  border dark:border-slate-200/20 
                  border-slate-300 mb-1 mx-1 cursor-pointer 
                  hover:scale-102 hover:bg-[var(--green-trasparent)]/30 transition"
                  onClick={() => {
                    const parentTask = task.task;
                    setActionTaskId?.(parentTask.id);
                    setCurrentTask?.(parentTask);
                    setExpandedTaskIds?.((prev) => {
                      const next = new Set(prev);
                      next.add(parentTask.id);
                      return next;
                    });
                  }}
                  title={
                    task.kind === "subtask"
                      ? `${task.parentName} → ${task.name}`
                      : task.name
                  }
                >
                  <div className="flex  items-center justify-between w-full  p-2">
                    {/* Left: type + badges + names */}

                    <div className=" flex items-center w-full h-full   text-xs font-semibold text-slate-800   ">
                      <IconBadge tailwindClass={tailwindClass} task={task} />

                      {/* Names */}
                      <div className="  ">
                        {task.kind === "subtask" ? (
                          <>
                            <div className="text-[var(--textColor)]">
                              <span className="font-semibold opacity-80 text-slate-500 text-[10px]">
                                {task.parentName}
                              </span>
                              <div className="flex">
                                <SVGIcons.arrowTurn.right className="w-4 mr-1 ml-3" />
                                <span className="text-md">{task.name}</span>
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Subtask assigned to you
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-[var(--textColor)]">
                              <span className="font-semibold capitalize">
                                {task.name}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Main task assigned to you
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="w-40  overflow-hidden ">
                      {/* Status */}
                      <StatusBadge task={task} />

                      {/* Center: chips (time left + status) */}
                      <TimeBadge task={task} getTimeLeft={getTimeLeft} />

                      {/* Priority */}
                      <PriorityBadge task={task} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="divFooter col-span-12 h-4 shadowTop "></div>
    </>
  );
}

export default AssignedToMe;
