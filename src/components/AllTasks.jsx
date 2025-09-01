// src/components/AllTasks.jsx
import React from "react";
import { SVGIcons, myImage } from "../importFiles/imports";
import TaskEditor from "../components/TaskEditor";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";
import IconBadge from "../Utils/IconBadge";
import StatusBadge from "../Utils/StatusBadge";
import TimeBadge from "../Utils/TimeBadge";

function AllTasks({
  user,
  filteredTasks = [],
  userMap = {},
  tailwindClass,
  actionTaskId,
  currentTask,
  editTask,
  deleteTaskId,
  expandedTaskIds,
  setActionTaskId,
  setCurrentTask,
  setEditTask,
  setDeleteTaskId,
  toggleExpand,
  canChangeStatus,
  updateTaskStatus,
  getTimeLeft,
  priorityIcons,
  statusIcon,
  statusIconImg,
  calendarIcon,
  titleIcon,
}) {
  return (
    <div className=" col-span-3 p-2  ">
      {/* Estados vacíos / aprobación */}
      {user?.pendingApproval ? (
        <div className="my-6 w-full text-center">
          <h4 className="w-full rounded-xl border bg-[var(--componentsBG)] p-3">
            You will be able to view your tasks once your account has been
            approved.
          </h4>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex min-h-40 w-full items-center justify-center rounded-xl border bg-[var(--componentsBG)]">
          <h3 className="text-lg font-medium text-slate-700">
            You don't have any tasks yet.
          </h3>
        </div>
      ) : (
        filteredTasks.map((task) => {
          const isSelected = actionTaskId === task.id;
          const isEditing = editTask === task.id;
          const isExpanded = expandedTaskIds.has(task.id);
          const hasSubs =
            Array.isArray(task.subTasks) && task.subTasks.length > 0;
          const totalSubs = hasSubs ? task.subTasks.length : 0;
          const doneSubs = hasSubs
            ? task.subTasks.filter((s) => s.status === "completed").length
            : 0;

          const openExtras =
            isSelected ||
            isEditing ||
            deleteTaskId === task.id ||
            (isExpanded && hasSubs);

          return (
            <div
              key={task.id}
              onClick={() => {
                if (editTask) return;
                setActionTaskId(task.id);
                setCurrentTask(task);
                // toggleExpand controlado por botón
              }}
              className={[
                " grid grid-cols-12 rounded-3xl m-2 px-2 border border-slate-500/30  ",
                isEditing
                  ? "ring-2 ring-slate-400 shadow-sm bg-amber-50"
                  : isSelected
                  ? " shadow-xl  scale-101 transition-transform  bg-[var(--green-trasparent)]/30"
                  : "",
              ].join(" ")}
            >
              <div className="flex col-span-12  max-h-25 min-h-22 ">
                <IconBadge
                  task={task}
                  tailwindClass={tailwindClass}
                  doneSubs={doneSubs}
                  totalSubs={totalSubs}
                />

                <div className="flex items-center justify-between w-full">
                  <div className="col-span-10 flex flex-col justify-between h-4/5  w-full">
                    <div className="w-full">
                      <span className="col-span-5 text-sm md:text-md lg:text-lg font-semibold text-[var(--textColor)] ">
                        {task.taskName}
                      </span>
                    </div>
                    <div className="flex gap-2 ">
                      {/* status */}
                      <StatusBadge tailwindClass={tailwindClass} task={task} />

                      {/* time left */}
                      <TimeBadge
                        task={task}
                        tailwindClass={tailwindClass}
                        getTimeLeft={getTimeLeft}
                      />

                      {/* priority */}
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
                    </div>

                    <div className="h-full flex items-end ">
                      {/* Toggle subtasks button */}
                      {hasSubs && (
                        <div className="col-span-12 flex justify-end pr-2 pb-2 h-full items-end">
                          <button
                            type="button"
                            className="text-xs text-[var(--textColor)] hover:text-slate-600 flex items-center gap-1 whitespace-nowrap mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(task.id);
                            }}
                            title={
                              isExpanded ? "Hide sub-task" : "Show sub-task"
                            }
                          >
                            {isExpanded ? "Hide sub-task" : "Show sub-task"}
                            {SVGIcons?.arrow && SVGIcons.arrow.down ? (
                              <SVGIcons.arrow.down
                                className={
                                  (isExpanded ? "rotate-180 " : "") +
                                  "transition-transform duration-200"
                                }
                              />
                            ) : (
                              <span
                                className={
                                  (isExpanded ? "rotate-180 " : "") +
                                  "transition-transform duration-200"
                                }
                              >
                                ▾
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* assignedTo */}
                  <div className="w-20 flex flex-col items-center justify-center">
                    <img
                      src={
                        userMap[task.assignedTo]?.photo || myImage.defaultUser
                      }
                      className="h-9 w-9 rounded-full border-2 border-blue-500 object-cover"
                      alt="Assignee"
                    />
                    <span className="font-semibold text-[var(--textColor)] col-span-1 text-center text-xs">
                      {userMap[task.assignedTo]?.name ?? "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extras con animación */}
              <div
                className={
                  `col-span-12 overflow-hidden transition-all duration-300 ease-in-out ` +
                  (openExtras
                    ? "max-h-[1200px] opacity-100 mt-1 pointer-events-auto"
                    : "max-h-0 opacity-0 mt-0 pointer-events-none")
                }
              >
                {actionTaskId === task.id && (
                  <div className="flex col-span-12 pb-3 pl-2 gap-1  w-full border-t-1 pt-1 border-slate-500/50 ">
                    {/* Botones de estado para la tarea seleccionada */}
                    <div className="flex flex-wrap items-center gap-2 w-full  ">
                      {canChangeStatus(currentTask) ? (
                        currentTask.status === "missed" ? (
                          <span className="text-sm font-medium text-rose-700">
                            This task can no longer be changed in status.
                          </span>
                        ) : (
                          <>
                            {currentTask.status === "pending" && (
                              <button
                                className="inline-flex items-center gap-2 rounded-md bg-yellow px-3 py-2 text-sm font-medium text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTaskStatus(currentTask, "progress");
                                }}
                              >
                                Start
                              </button>
                            )}

                            {(currentTask.status === "pending" ||
                              currentTask.status === "progress") && (
                              <button
                                className="inline-flex items-center gap-2 rounded-md bg-teal px-3 py-2 text-sm font-medium text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTaskStatus(currentTask, "completed");
                                }}
                              >
                                Complete
                              </button>
                            )}

                            {currentTask.status !== "pending" && (
                              <button
                                className="inline-flex items-center gap-2 rounded-md bg-yellow px-3 py-2 text-sm font-medium text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTaskStatus(currentTask, "pending");
                                }}
                              >
                                Set Pending
                              </button>
                            )}
                          </>
                        )
                      ) : (
                        <span className="text-sm text-slate-700">
                          Only the assignee or an admin can change the status.
                        </span>
                      )}

                      {(user?.role === "admin" ||
                        (user?.role === "member" &&
                          currentTask.type === "personal")) && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editTask === currentTask.id) setEditTask("");
                            else {
                              setEditTask(currentTask.id);
                              setActionTaskId("");
                            }
                          }}
                        >
                          {editTask === currentTask.id
                            ? "Close Editor"
                            : "Edit"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Subtasks expandibles + acciones */}
                {isExpanded &&
                  Array.isArray(task.subTasks) &&
                  task.subTasks.length > 0 && (
                    <div className="w-full px-2 pb-3 col-span-12">
                      <ul className="space-y-1">
                        {task.subTasks.map((st, idx) => {
                          const canChangeSub =
                            user?.role === "admin" ||
                            st.assignedTo === user?.uid;

                          const updateSubtaskStatus = async (newStatus, e) => {
                            e?.stopPropagation?.();
                            try {
                              if (st.status === "missed") {
                                alert(
                                  'Las subtareas "missed" no se pueden cambiar.'
                                );
                                return;
                              }
                              const ref = doc(db, "tasks", task.id);
                              const updated = [...task.subTasks];
                              updated[idx] = {
                                ...updated[idx],
                                status: newStatus,
                              };
                              await updateDoc(ref, { subTasks: updated });
                            } catch (err) {
                              console.error(
                                "Error al actualizar subtask:",
                                err
                              );
                              alert(
                                "No se pudo cambiar el estado de la subtask."
                              );
                            }
                          };

                          return (
                            <li
                              key={`${task.id}-${idx}`}
                              className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-medium">
                                  {st.name || `Subtask ${idx + 1}`}
                                </span>
                                <span className="rounded-full border px-2 py-0.5 bg-white text-xs">
                                  {st.priority || "medium"}
                                </span>
                                {st.completeBy && (
                                  <span className="rounded-full border px-2 py-0.5 bg-white text-xs">
                                    {st.completeBy}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="rounded-full border px-2 py-0.5 bg-white text-xs capitalize">
                                  {st.status || "pending"}
                                </span>
                                {canChangeSub ? (
                                  <>
                                    {st.status === "pending" && (
                                      <button
                                        className="inline-flex items-center gap-2 rounded-md bg-yellow px-2 py-1 text-xs font-medium text-white"
                                        onClick={(e) =>
                                          updateSubtaskStatus("progress", e)
                                        }
                                      >
                                        Start
                                      </button>
                                    )}
                                    {(st.status === "pending" ||
                                      st.status === "progress") && (
                                      <button
                                        className="inline-flex items-center gap-2 rounded-md bg-teal px-2 py-1 text-xs font-medium text-white"
                                        onClick={(e) =>
                                          updateSubtaskStatus("completed", e)
                                        }
                                      >
                                        Complete
                                      </button>
                                    )}
                                    {st.status !== "pending" && (
                                      <button
                                        className="inline-flex items-center gap-2 rounded-md bg-yellow px-2 py-1 text-xs font-medium text-white"
                                        onClick={(e) =>
                                          updateSubtaskStatus("pending", e)
                                        }
                                      >
                                        Set Pending
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-xs text-slate-500">
                                    No puedes cambiar el estado
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                {/* Confirm delete */}
                {deleteTaskId === task.id && (
                  <div className="mx-2 mb-3 w-[calc(100%-1rem)] rounded-lg border border-slate-200 bg-white p-3 text-slate-800 shadow-sm">
                    <h3 className="mb-2 text-sm font-medium">
                      Seguro que quieren eliminar la tarea
                    </h3>
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            if (task.status === "progress") {
                              alert(
                                "No puedes eliminar una tarea en progreso."
                              );
                              setDeleteTaskId(null);
                              return;
                            }
                            const isAdmin = user?.role === "admin";
                            const isMyPersonal =
                              task.type === "personal" &&
                              task.createdBy === user.uid;
                            if (!isAdmin && !isMyPersonal) {
                              alert(
                                "No tienes permiso para eliminar esta tarea."
                              );
                              setDeleteTaskId(null);
                              return;
                            }
                            await deleteDoc(doc(db, "tasks", task.id));
                            setDeleteTaskId(null);
                            setEditTask("");
                          } catch (err) {
                            console.error("Error al eliminar la tarea:", err);
                            alert("No se pudo eliminar. Revisa la consola.");
                          }
                        }}
                      >
                        Delete
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTaskId(null);
                        }}
                      >
                        Keep
                      </button>
                    </div>
                  </div>
                )}

                {/* Editor */}
                {editTask === task.id && (
                  <div className="w-full px-2 pb-3 col-span-12">
                    <TaskEditor
                      task={task}
                      user={user}
                      userMap={userMap}
                      priorityIcons={priorityIcons}
                      statusIcon={statusIcon}
                      statusIconImg={statusIconImg}
                      calendarIcon={calendarIcon}
                      titleIcon={titleIcon}
                      onClose={() => setEditTask("")}
                      onDelete={() => setDeleteTaskId(task.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AllTasks;
