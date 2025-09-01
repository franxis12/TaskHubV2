// src/components/AssignedToMe.jsx
import React from "react";
import { SVGIcons } from "../importFiles/imports";
import IconBadge from "../Utils/IconBadge";
import { tailwindClass } from "../importFiles/tailwindStyles";

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
                No tienes asignaciones.
              </h3>
            </div>
          ) : (
            assignedItems.map((item) => {
              // chip tiempo restante
              const timeLeft = getTimeLeft?.(item.completeBy);
              const timeChipClass =
                timeLeft === "Overdue"
                  ? "bg-orange-trasparent text-orange border-orange-2"
                  : "bg-teal-trasparent text-teal border-teal-2";

              // chip de estado
              const statusChipClass =
                item.status === "missed"
                  ? "bg-orange-trasparent text-orange border-orange-2"
                  : item.status === "pending"
                  ? "bg-yellow-trasparent text-yellow border-Yellow-2"
                  : "bg-teal-trasparent text-teal border-teal-2";

              return (
                <div
                  key={item.id}
                  className="transform-gpu 
                  will-change-transform  
                [backface-visibility:hidden]  
                  flex items-center justify-between
                  min-h-20 rounded-3xl col-span-12 
                  border dark:border-slate-200/20 
                  border-slate-300 mb-1 mx-1 cursor-pointer 
                  hover:scale-102 hover:bg-[var(--green-trasparent)]/30 transition"
                  onClick={() => {
                    const parentTask = item.task;
                    setActionTaskId?.(parentTask.id);
                    setCurrentTask?.(parentTask);
                    // si es subtask, aseguro expandir el padre
                    setExpandedTaskIds?.((prev) => {
                      const next = new Set(prev);
                      next.add(parentTask.id);
                      return next;
                    });
                  }}
                  title={
                    item.kind === "subtask"
                      ? `${item.parentName} → ${item.name}`
                      : item.name
                  }
                >
                  <div className="flex items-center justify-between">
                    {/* Izquierda: tipo + badge + nombres */}

                    <div className=" col-span-8 flex items-center justify-start h-full text-xs font-semibold text-slate-800  ">
                      <IconBadge tailwindClass={tailwindClass} task={item} />

                      {/* nombres */}
                      <div className=" w-full">
                        {item.kind === "subtask" ? (
                          <>
                            <div className="text-[var(--textColor)]">
                              <span className="font-semibold">
                                {item.parentName}
                              </span>
                              <span className="mx-1 opacity-60">→</span>
                              <span className="opacity-80">{item.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Subtask assigned to you
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-[var(--textColor)]">
                              <span className="font-semibold">{item.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Main task assigned to you
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Centro: chips (tiempo restante + estado) */}
                    <div className="col-span-3 flex items-center justify-center gap-2">
                      {item.completeBy && (
                        <span
                          className={`text-[11px] font-semibold border rounded-3xl px-2 py-[2px] ${timeChipClass}`}
                        >
                          {timeLeft}
                        </span>
                      )}

                      <span
                        className={[
                          "text-[11px] font-semibold capitalize border rounded-3xl px-2 py-[2px]",
                          statusChipClass,
                        ].join(" ")}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* prioridad */}
                    <div className="flex flex-col items-center justify-center w-10 ">
                      {item.priority === "high" ? (
                        <SVGIcons.priority.high className="text-[var(--orange)]" />
                      ) : item.priority === "medium" ? (
                        <SVGIcons.priority.med className="text-[var(--yellow)]" />
                      ) : item.priority === "low" ? (
                        <SVGIcons.priority.low className="text-[var(--green)]" />
                      ) : (
                        <SVGIcons.question />
                      )}
                      <span className="text-[11px] font-semibold text-[var(--textColor)] capitalize">
                        {item.priority}
                      </span>
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
