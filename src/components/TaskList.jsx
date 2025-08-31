// src/components/TaskList.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import { UserContext } from "../context/UserContext";
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../auth/firebaseConfig";

import TaskFilters, { defaultFilters } from "./TaskFilters";
import TaskEditor from "../components/TaskEditor";
import TaskEstadistic from "../components/TaskEstadistic";
import TeamMembers from "../components/TeamMembers";

import Container from "../Utils/Container";
import Button from "../Utils/Button";
import { SVGIcons } from "../importFiles/imports";
import { tailwindClass } from "../importFiles/tailwindStyles";

import samplePhoto from "../assets/sample.png";
import highImportantIcon from "../assets/icons/HImportan.png";
import lowImportantIcon from "../assets/icons/LImportant.png";
import mediumImportantIcon from "../assets/icons/MImportant.png";
import SubIcon from "../assets/iconsV2/arrow-turn-right-solid-full.svg?react";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

import Personal from "../assets/icons/personal.svg";
import Public from "../assets/icons/public.svg";
import note from "../assets/icons/note.svg";

import completeIcon from "../assets/icons/complete.svg";
import pendingIcon from "../assets/icons/pending.svg";
import progressIcon from "../assets/icons/progress.svg";
import missedIcon from "../assets/icons/missed.svg";

const calendarIcon = pendingIcon;
const titleIcon = note;
const statusIconImg = progressIcon;

function TaskList({
  setShowPublicForm,

  setShowPersonalForm,
}) {
  const { user } = useContext(UserContext);

  // Data
  const [tasks, setTasks] = useState([]);
  const [pubTasks, setPubTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState([]);

  // UI
  const [editTask, setEditTask] = useState(""); // task.id activo en editor
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [actionTaskId, setActionTaskId] = useState("");
  //const [showPublicForm, setShowPublicForm] = useState(false);
  //const [showPersonalForm, setShowPersonalForm] = useState(false);

  // NUEVO: control de expandir/cerrar sub-tasks por tarea
  const [expandedTaskIds, setExpandedTaskIds] = useState(new Set());

  const [userMap, setUserMap] = useState({});
  const [filters, setFilters] = useState({
    ...(defaultFilters || {
      search: "",
      type: "all",
      priority: "all",
      status: "all",
      assignedTo: "all",
      dueFrom: "",
      dueTo: "",
      overdueOnly: false,
    }),
  });

  const priorityIcons = {
    high: highImportantIcon,
    medium: mediumImportantIcon,
    low: lowImportantIcon,
  };
  const statusIcon = {
    completed: completeIcon,
    progress: progressIcon,
    pending: pendingIcon,
    missed: missedIcon,
  };

  const canChangeStatus = (t) => {
    if (!user) return false;
    const isAdmin = user.role === "admin";
    const isOwnerPersonal = t.type === "personal" && t.createdBy === user.uid;
    const isAssignedUser = t.assignedTo === user.uid;
    if (isAdmin) return true;
    if (t.type === "personal") return isOwnerPersonal;
    if (t.type === "public") return isAssignedUser;
    return false;
  };

  const assignees = useMemo(
    () =>
      Object.entries(userMap).map(([uid, info]) => ({ uid, name: info.name })),
    [userMap]
  );
  console.log(assignees);

  const filteredTasks = useMemo(() => {
    const text = filters.search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.priority !== "all" && t.priority !== filters.priority)
        return false;
      if (filters.status !== "all" && t.status !== filters.status) return false;

      if (filters.assignedTo === "unassigned") {
        if (t.assignedTo) return false;
      } else if (filters.assignedTo !== "all") {
        if ((t.assignedTo || "") !== filters.assignedTo) return false;
      }

      if (filters.dueFrom) {
        if (
          !t.completeBy ||
          dayjs(t.completeBy).isBefore(dayjs(filters.dueFrom), "day")
        )
          return false;
      }
      if (filters.dueTo) {
        if (
          !t.completeBy ||
          dayjs(t.completeBy).isAfter(dayjs(filters.dueTo), "day")
        )
          return false;
      }

      if (filters.overdueOnly) {
        const today = dayjs().startOf("day");
        const isOverdue =
          t.completeBy &&
          dayjs(t.completeBy).endOf("day").isBefore(today) &&
          (t.status === "pending" || t.status === "progress");
        if (!isOverdue) return false;
      }

      if (text) {
        const haystack = `${t.taskName || ""} ${t.notes || ""}`.toLowerCase();
        if (!haystack.includes(text)) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  // NUEVO: items asignados a mí (tareas y sub-tareas)
  const assignedItems = useMemo(() => {
    if (!user?.uid) return [];
    const items = [];

    for (const t of tasks) {
      if (t.assignedTo === user.uid) {
        items.push({
          kind: "task",
          id: t.id,
          parentId: null,
          parentName: null,
          name: t.taskName,
          priority: t.priority,
          completeBy: t.completeBy,
          status: t.status,
          type: t.type,
          task: t,
        });
      }
      if (Array.isArray(t.subTasks)) {
        t.subTasks.forEach((st, idx) => {
          if (st?.assignedTo === user.uid) {
            items.push({
              kind: "subtask",
              id: `${t.id}::${idx}`,
              parentId: t.id,
              parentName: t.taskName,
              name: st.name,
              priority: st.priority,
              completeBy: st.completeBy,
              status: st.status || "pending",
              type: t.type,
              task: t,
              subtaskIndex: idx,
              subtask: st,
            });
          }
        });
      }
    }
    return items;
  }, [tasks, user]);

  // Cambiar estado (CFs ajustan contadores/flags)
  const updateTaskStatus = async (task, newStatus) => {
    if (!canChangeStatus(task)) {
      alert("No tienes permiso para cambiar el estado de esta tarea.");
      return;
    }
    if (task.status === "missed") {
      alert('Las tareas "missed" no se pueden cambiar.');
      return;
    }
    try {
      const ref = doc(db, "tasks", task.id);
      const payload = { status: newStatus };
      if (newStatus === "completed") payload.completedAt = serverTimestamp();
      await updateDoc(ref, payload);
      setActionTaskId("");
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo cambiar el estado.");
    }
  };

  // Users map
  useEffect(() => {
    if (!user?.companyId) return;
    (async () => {
      const qUsers = query(
        collection(db, "users"),
        where("companyId", "==", user.companyId)
      );
      const snapshot = await getDocs(qUsers);
      const map = {};
      snapshot.forEach((d) => {
        map[d.id] = {
          name: `${d.data().firstName || ""} ${d.data().lastName || ""}`.trim(),
          photo: d.data().photo || samplePhoto,
        };
      });
      setUserMap(map);
    })();
  }, [user]);

  // Public tasks
  useEffect(() => {
    if (!user?.companyId) return;
    const qPublic = query(
      collection(db, "tasks"),
      where("type", "==", "public"),
      where("companyId", "==", user.companyId)
    );
    const unsub = onSnapshot(qPublic, (snap) => {
      setPubTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // My personal tasks
  useEffect(() => {
    if (!user?.uid) return;
    const qMine = query(
      collection(db, "tasks"),
      where("type", "==", "personal"),
      where("createdBy", "==", user.uid)
    );
    const unsub = onSnapshot(qMine, (snap) => {
      setMyTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // Merge
  useEffect(() => {
    const map = new Map();
    [...myTasks, ...pubTasks].forEach((t) => map.set(t.id, t));
    setTasks(Array.from(map.values()));
  }, [myTasks, pubTasks]);

  // Time left label
  function getTimeLeft(completeByValue) {
    if (!completeByValue) return "-";
    const due = dayjs(completeByValue).endOf("day");
    const now = dayjs();

    if (due.isSame(now, "day")) return "Today";
    if (due.isBefore(now, "day")) return "Overdue";

    const diff = due.diff(now);
    const d = dayjs.duration(diff);
    const days = Math.floor(d.asDays());
    const hours = d.hours();
    const minutes = d.minutes();

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  // helpers UI
  const btnGhost =
    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 active:bg-slate-200";
  const btnOutline =
    "inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100";
  const btnPrimary =
    "inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 active:bg-slate-800/90";

  // toggle expand/collapse for a task
  const toggleExpand = (taskId) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  console.log(currentTask);
  return (
    <div className="p-2  w-full bg-component rounded-2xl h-auto shadow-inner drop-shadow-md ">
      {/* Toolbar */}
      <div className="rounded-2xl bg-[var(--pagesBackground)] p-1 mb-2 shadow-md">
        {/* Primary actions and Filters */}
        <div className="flex  items-center gap-2 ">
          {/*Add task buttons*/}
          <div className="flex gap-1 border-r pr-2">
            <Button
              btnName={"Public task"}
              hasIcon
              iconPicked={"addPublic"}
              classNameExtra={"justify-start border"}
              btnType={"secondary"}
              onClick={() => setShowPublicForm((s) => !s)}
            />
            <Button
              btnName={"Personal task"}
              hasIcon
              iconPicked={"addPersonal"}
              classNameExtra={"justify-start border"}
              btnType={"secondary"}
              onClick={() => setShowPersonalForm((s) => !s)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12   gap-2 grid-flow-row-dense  col-span-2">
        <Container className="max-h-100 col-span-12 md:col-span-6 lg:col-span-4   grid-cols-12 overflow-hidden">
          <div className="flex flex-col gap-2 col-span-12 overflow-hidden ">
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
                  // badge: número de subtask o 'M' para la principal
                  const badgeText =
                    item.kind === "subtask" &&
                    typeof item.subtaskIndex === "number"
                      ? item.subtaskIndex + 1
                      : "M";

                  // chip tiempo restante
                  const timeLeft = getTimeLeft(item.completeBy);
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
                      className="transform-gpu will-change-transform  max-h-18 [backface-visibility:hidden]  grid grid-cols-12 min-h-17 rounded-3xl col-span-12 border dark:border-slate-200/20 border-slate-300 mt-1 cursor-pointer hover:scale-102 hover:bg-[var(--green-trasparent)]/30 transition"
                      onClick={() => {
                        const parentTask = item.task;
                        setActionTaskId(parentTask.id);
                        setCurrentTask(parentTask);
                        // si es subtask, aseguro expandir el padre
                        setExpandedTaskIds((prev) => {
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
                      <div className="grid col-span-12 grid-cols-12 my-2 max-h-8 px-2  mb-2">
                        {/* Izquierda: tipo + badge + nombres */}
                        <div className=" col-span-8 flex items-center justify-start h-full px-2 text-xs font-semibold text-slate-800 ">
                          {item.type === "public" ? (
                            <SVGIcons.public
                              className="text-[var(--textColor)] mr-2 inline-block h-5 w-5 align-[-2px] "
                              alt="Task type"
                            />
                          ) : (
                            <SVGIcons.personal
                              className="text-[var(--textColor)] mr-2 inline-block h-5 w-5 align-[-2px] "
                              alt="Task type"
                            />
                          )}

                          <div
                            className={[
                              " p-1 px-3 rounded-lg text-[10px] min-w-8 text-center border ",
                              "bg-black text-white w-8",
                            ].join(" ")}
                            aria-label={
                              item.kind === "subtask"
                                ? `Subtask #${badgeText}`
                                : "Main task"
                            }
                          >
                            {badgeText}
                          </div>

                          {/* nombres */}
                          {item.kind === "subtask" ? (
                            <span className="ml-2 text-xs text-[var(--textColor)]">
                              <span className="text-slate-500">
                                {item.parentName}
                              </span>
                              <div className="flex gap-2 items-center">
                                <SVGIcons.arrowTurn.right className="w-4 h-4" />
                                <span className="text-sm text-[var(--textColor)]">
                                  {item.name}
                                </span>
                              </div>
                            </span>
                          ) : (
                            <span className="ml-2 text-sm text-[var(--textColor)] ">
                              {item.name}
                            </span>
                          )}
                        </div>

                        {/* Derecha: tiempo, estado, prioridad */}
                        <div className=" col-span-4 flex items-center justify-end gap-2">
                          <div className="flex flex-col items-center justify-start  ">
                            {/* tiempo restante */}
                            <div className="">
                              <span
                                className={[
                                  "text-[11px] font-semibold whitespace-nowrap border rounded-3xl px-2 py-[2px]",
                                  timeChipClass,
                                ].join(" ")}
                              >
                                {timeLeft}
                              </span>
                            </div>

                            {/* status */}
                            <div className="">
                              <span
                                className={[
                                  "text-[11px] font-semibold capitalize border rounded-3xl px-2 py-[2px]",
                                  statusChipClass,
                                ].join(" ")}
                              >
                                {item.status}
                              </span>
                            </div>
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
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="divFooter col-span-12 h-4 shadowTop "></div>
        </Container>

        <Container className="max-h-100 col-span-12 md:col-span-6 lg:col-span-4   grid-cols-12">
          <TaskEstadistic />
        </Container>

        <Container
          className="row-span-2 lg:col-span-4 col-span-12"
          onClick={() => setCurrentTask([])}
        >
          {/*<<<<---- Container for Team Member  */}
          <TeamMembers
            tasks={tasks} // opcional, para mostrar conteos
            onMemberClick={(uid) => {
              // opcional: filtra por asignado usando tus filtros existentes
              setFilters((f) => ({ ...f, assignedTo: uid }));
            }}
          />
        </Container>

        <Container className="col-span-12 md:col-span-12 lg:col-span-8 transition-height duration-500 ease-in-out ">
          {/*<<<<---- Container for all task */}
          <div className="flex items-center justify-between col-span-3 p-2 shadowBottom divTitle  ">
            <h3 className="font-semibold ml-3 ">All Tasks</h3>

            {/* Acciones de la tarea seleccionada 
            {actionTaskId === currentTask.id && (
              <div className=" " onClick={(e) => e.stopPropagation()}>
                <div className="mb-2 flex items-center justify-between">
                  <span className={badgeByStatus(currentTask.status)}>
                    {currentTask.status}
                  </span>
                  <h3 className="text-sm font-medium text-slate-800">
                    {currentTask.status === "progress"
                      ? "This task is in progress"
                      : currentTask.status === "completed"
                      ? "This task is completed"
                      : currentTask.status === "missed"
                      ? "This task is missed"
                      : "This task is pending"}
                  </h3>
                </div>
              </div>
            )}*/}
          </div>

          {/*Task Filters 
          <div
            className="mb-4 w-full col-span-3"
            onClick={() => setEditTask("")}
          >
            <TaskFilters
              filters={filters}
              setFilters={setFilters}
              assignees={assignees}
              currentUserId={user?.uid}
            />
          </div>*/}

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
                const hasSubs = Array.isArray(task.subTasks) && task.subTasks.length > 0;
                const openExtras =
                  isSelected || isEditing || deleteTaskId === task.id || (isExpanded && hasSubs);
                const totalSubs = Array.isArray(task.subTasks)
                  ? task.subTasks.length
                  : 0;
                const doneSubs =
                  totalSubs > 0
                    ? task.subTasks.filter((s) => s.status === "completed")
                        .length
                    : 0;

                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      if (editTask) return;
                      setActionTaskId(task.id);
                      setCurrentTask(task);
                      toggleExpand(task.id);
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
                      {/* Nombre y tipo */}
                      <div className="flex items-center px-2 text-lg  font-semibold text-slate-800  w-20  ">
                        <div className="flex flex-col items-center justify-center  bg-white pt-1 rounded-2xl overflow-hidden border border-slate-700/20 mr-1">
                          {task.type === "public" ? (
                            <SVGIcons.public
                              className={tailwindClass.icon.dark}
                            />
                          ) : (
                            <SVGIcons.personal
                              className={tailwindClass.icon.dark}
                            />
                          )}
                          <div className="bg-black p-1 px-5 text-white rounded-b-lg text-xs flex items-center justify-center  ">
                            {/* progreso subtasks dinámico */}
                            {task.subTasks.length === 0
                              ? "M"
                              : doneSubs + "/" + totalSubs}
                          </div>
                        </div>
                        {/*<div>
                          <span className="col-span-5 text-xs">
                            {task.taskName}
                          </span>
                        </div>*/}

                        {/*<span className="col-span-1">
                          {task.notes && (
                            <SVGIcons.note className="text-[var(--orange)]" />
                          )}
                        </span>*/}
                      </div>

                      {/* Metadatos derecha */}
                      <div className="flex items-center justify-between w-full">
                        <div className="col-span-10 flex flex-col justify-between h-4/5  w-full">
                          <div className="w-full">
                            <span className="col-span-5 text-sm md:text-md lg:text-lg font-semibold text-[var(--textColor)] ">
                              {task.taskName}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {/* status */}
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
                                  <SVGIcons.status.progress className="animate-spin transition-all " />
                                ) : (
                                  <SVGIcons.question />
                                )}
                              </div>
                              <span className={tailwindClass.status.children2}>
                                {task.status}
                              </span>
                            </div>

                            {/* completeBy 
                            <div className="col-span-1 font-semibold">
                              <span className="text-slate-500 font-medium text-xs">
                                {task.completeBy}
                              </span>
                            </div>*/}

                            {/* time left */}
                            {task.completeBy && (
                              <div className="">
                                <span className={tailwindClass.badge.green}>
                                  {getTimeLeft(task.completeBy)}
                                </span>
                              </div>
                            )}

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
                        </div>

                        {/* assignedTo */}
                        <div className="w-20 flex flex-col items-center justify-center">
                          <img
                            src={userMap[task.assignedTo]?.photo || samplePhoto}
                            className="h-9 w-9 rounded-full border-2 border-blue-500 object-cover"
                            alt="Assignee"
                          />
                          <span className="font-semibold text-[var(--textColor)] col-span-1 text-center text-xs">
                            {userMap[task.assignedTo]?.name ?? "Unassigned"}
                          </span>
                        </div>
                      </div>
                    </div>

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
                                  <Button
                                    btnName="Start"
                                    btnType={"yellow"}
                                    classNameExtra={""}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTaskStatus(currentTask, "progress");
                                    }}
                                  />
                                )}

                                {(currentTask.status === "pending" ||
                                  currentTask.status === "progress") && (
                                  <Button
                                    btnName="Complete"
                                    btnType={"green"}
                                    classNameExtra={""}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTaskStatus(
                                        currentTask,
                                        "completed"
                                      );
                                    }}
                                  />
                                )}

                                {currentTask.status !== "pending" && (
                                  <Button
                                    btnName="Set Pending"
                                    btnType={"yellow"}
                                    classNameExtra={""}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTaskStatus(currentTask, "pending");
                                    }}
                                  />
                                )}
                              </>
                            )
                          ) : (
                            <span className="text-sm text-slate-700">
                              Only the assignee or an admin can change the
                              status.
                            </span>
                          )}

                          {(user?.role === "admin" ||
                            (user?.role === "member" &&
                              currentTask.type === "personal")) && (
                            <Button
                              btnName={
                                editTask === currentTask.id
                                  ? "Close Editor"
                                  : "Edit"
                              }
                              btnType={"orange"}
                              classNameExtra={""}
                              type="button"
                              className={btnGhost}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (editTask === currentTask.id)
                                  setEditTask("");
                                else {
                                  setEditTask(currentTask.id);
                                  setActionTaskId("");
                                }
                              }}
                            />
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

                              const updateSubtaskStatus = async (
                                newStatus,
                                e
                              ) => {
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
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">
                                      {idx + 1}. {st.name}
                                    </div>
                                    <div className="text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                                      <span>Prioridad: {st.priority}</span>
                                      {st.completeBy && (
                                        <span>• Límite: {st.completeBy}</span>
                                      )}
                                      {st.notes && (
                                        <span>• Notas: {st.notes}</span>
                                      )}
                                      {st.assignedTo && (
                                        <>
                                          <span>• Asignado:</span>
                                          <span className="inline-flex items-center gap-1">
                                            <img
                                              src={
                                                userMap[st.assignedTo]?.photo ||
                                                samplePhoto
                                              }
                                              alt="assignee"
                                              className="h-4 w-4 rounded-full border"
                                            />
                                            {userMap[st.assignedTo]?.name ||
                                              "?"}
                                          </span>
                                        </>
                                      )}
                                      {st.status && (
                                        <span className="capitalize">
                                          • Estado: {st.status}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Acciones subtarea */}
                                  <div className="flex flex-wrap items-center gap-2">
                                    {canChangeSub ? (
                                      st.status === "missed" ? (
                                        <span className="text-xs font-medium text-rose-700">
                                          Esta subtask no se puede cambiar.
                                        </span>
                                      ) : (
                                        <>
                                          {st.status === "pending" && (
                                            <Button
                                              btnName="Start"
                                              btnType={"yellow"}
                                              classNameExtra={""}
                                              onClick={(e) =>
                                                updateSubtaskStatus(
                                                  "progress",
                                                  e
                                                )
                                              }
                                            />
                                          )}

                                          {(st.status === "pending" ||
                                            st.status === "progress") && (
                                            <Button
                                              btnName="Complete"
                                              btnType={"green"}
                                              classNameExtra={""}
                                              onClick={(e) =>
                                                updateSubtaskStatus(
                                                  "completed",
                                                  e
                                                )
                                              }
                                            />
                                          )}

                                          {st.status !== "pending" && (
                                            <Button
                                              btnName="Set Pending"
                                              btnType={"yellow"}
                                              classNameExtra={""}
                                              onClick={(e) =>
                                                updateSubtaskStatus(
                                                  "pending",
                                                  e
                                                )
                                              }
                                            />
                                          )}
                                        </>
                                      )
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
                            className={btnPrimary}
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
                                console.error(
                                  "Error al eliminar la tarea:",
                                  err
                                );
                                alert(
                                  "No se pudo eliminar. Revisa la consola."
                                );
                              }
                            }}
                          >
                            Delete
                          </button>
                          <button
                            className={btnOutline}
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
          <div className="flex items-start justify-between col-span-3 p-2 shadowTopInset divTitle"></div>
        </Container>
      </div>
    </div>
  );
}

export default TaskList;
