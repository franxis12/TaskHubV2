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
import { db } from "../firebaseConfig";

import AddPublicTask from "./AddPublicTask";
import TaskFilters, { defaultFilters } from "./TaskFilters";
import PersonalTaskForm from "../components/PersonalTaskForm";
import TaskEditor from "../components/TaskEditor";
import TaskEstadistic from "../components/TaskEstadistic";
import TeamMembers from "../components/TeamMembers";

import Container from "../Utils/Container";
import Button from "../Utils/Button";

import samplePhoto from "../assets/sample.png";
import highImportantIcon from "../assets/icons/HImportan.png";
import lowImportantIcon from "../assets/icons/LImportant.png";
import mediumImportantIcon from "../assets/icons/MImportant.png";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

import Personal from "../assets/icons/personal.svg";
import addPersonal from "../assets/icons/add-personal.svg";
import addPersonalHover from "../assets/icons/add-personal-hover.svg";
import Public from "../assets/icons/public.svg";
import addPublic from "../assets/icons/add-public.svg";
import addPublicHover from "../assets/icons/add-public-hover.svg";
import note from "../assets/icons/note.svg";
import noteHover from "../assets/icons/note-hover.svg";

import completeIcon from "../assets/icons/complete.svg";
import pendingIcon from "../assets/icons/pending.svg";
import progressIcon from "../assets/icons/progress.svg";
import missedIcon from "../assets/icons/missed.svg";

const calendarIcon = pendingIcon;
const titleIcon = note;
const statusIconImg = progressIcon;

function TaskList() {
  const { user } = useContext(UserContext);

  // Data
  const [tasks, setTasks] = useState([]);
  const [pubTasks, setPubTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState([]);

  // UI
  const [hoveredIcon, setHoveredIcon] = useState("");
  const [editTask, setEditTask] = useState(""); // task.id activo en editor
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [actionTaskId, setActionTaskId] = useState("");
  const [showPublicForm, setShowPublicForm] = useState(false);
  const [showPersonalForm, setShowPersonalForm] = useState(false);

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
  const badgeByStatus = (s) => {
    const base =
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border";
    const map = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      progress: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      missed: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return `${base} ${map[s] || "bg-slate-50 text-slate-600 border-slate-200"}`;
  };

  // toggle expand/collapse for a task
  const toggleExpand = (taskId) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  return (
    <div className="p-2  w-full bg-component rounded-2xl h-auto shadow-inner drop-shadow-md ">
      {showPublicForm && (
        <AddPublicTask accion={() => setShowPublicForm(!showPublicForm)} />
      )}
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

          {/*Task Filters */}
          <div className="mb-4 w-full" onClick={() => setEditTask("")}>
            <TaskFilters
              filters={filters}
              setFilters={setFilters}
              assignees={assignees}
              currentUserId={user?.uid}
            />
          </div>
        </div>

        {/* PersonalTask Form */}
        {showPersonalForm && (
          <div className="mt-3">
            <PersonalTaskForm
              onClose={() => setShowPersonalForm(false)}
              onCreated={() => {}}
            />
          </div>
        )}

        {/* Acciones de la tarea seleccionada */}
        {actionTaskId === currentTask.id && (
          <div
            className="mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
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
        )}
      </div>

      <div className="grid md:grid-cols-3 grid-cols-1 grid-rows-2 gap-2 grid-flow-row-dense col-span-2">
        <Container cols="md:col-span-1 max-h-90">
          {/*<<<<---- Container for task assigned Task   */}
          <div className="flex items-start justify-between col-span-3 p-2 shadowBottom divTitle ">
            <h3 className="font-semibold ml-3 mt-2">Assigned to me</h3>
          </div>
          <div className="space-y-3 col-span-3 p-2">
            {assignedItems.length === 0 ? (
              <div className="flex min-h-40 w-full items-center justify-center rounded-xl border bg-[var(--componentsBG)]">
                <h3 className="text-lg font-medium text-slate-700">
                  No tienes asignaciones.
                </h3>
              </div>
            ) : (
              assignedItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 rounded-xl border-purple-1"
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
                >
                  <div className=" my-2 flex w-full items-center justify-between rounded-xl px-2 col-span-12">
                    <div className="px-2 text-lg font-semibold text-slate-800 w-full flex">
                      <img
                        src={item.type === "public" ? Public : Personal}
                        className="mr-2 inline-block h-5 w-5 align-[-2px]"
                        alt="Task type"
                      />
                      <div className="bg-black p-2 px-5 text-white rounded-lg text-xs w-5 flex items-center justify-center">
                        {/* marcador simple */}•
                      </div>
                      {item.kind === "subtask" ? (
                        <span className="ml-2">
                          {item.name}{" "}
                          <span className="text-slate-500">— de</span>{" "}
                          <span className="font-medium">{item.parentName}</span>
                        </span>
                      ) : (
                        <span className="ml-2">{item.name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-slate-700">
                          {item.completeBy || ""}
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-emerald-600">
                          {getTimeLeft(item.completeBy)}
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <img
                          src={priorityIcons[item.priority] || ""}
                          className="h-5 w-5"
                          alt="Priority"
                        />
                        <span className="text-sm font-semibold text-slate-700 capitalize">
                          {item.priority}
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <img
                          src={statusIcon[item.status] || ""}
                          className="h-5 w-5"
                          alt="Status"
                        />
                        <span className="text-sm font-semibold text-slate-700 capitalize">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Container>

        <Container cols="md:col-span-1 max-h-90">
          {/*<<<<---- Container for Stats  */}
          <TaskEstadistic />
        </Container>
        <Container cols="row-span-2 ">
          {/*<<<<---- Container for Team Member  */}
          <TeamMembers
            tasks={tasks} // opcional, para mostrar conteos
            onMemberClick={(uid) => {
              // opcional: filtra por asignado usando tus filtros existentes
              setFilters((f) => ({ ...f, assignedTo: uid }));
            }}
          />
        </Container>

        <Container cols="md:col-span-2 max-h-90">
          {" "}
          {/*<<<<---- Container for all task */}
          <div className="flex items-start justify-between col-span-3 p-2 shadowBottom divTitle ">
            <h3 className="font-semibold ml-3 mt-2">All Tasks</h3>
            <div className="flex gap-1 ">
              {/*To transfer*/}
              <div className="flex flex-wrap items-center gap-2">
                {canChangeStatus(currentTask) ? (
                  currentTask.status === "missed" ? (
                    <span className="text-sm font-medium text-rose-700">
                      Esta tarea ya no se puede cambiar de estado.
                    </span>
                  ) : (
                    <>
                      {currentTask.status === "pending" && (
                        <Button
                          btnName="Start"
                          btnType={"yellow"}
                          classNameExtra={""}
                          onClick={() =>
                            updateTaskStatus(currentTask, "progress")
                          }
                        />
                      )}

                      {(currentTask.status === "pending" ||
                        currentTask.status === "progress") && (
                        <Button
                          btnName="Complete"
                          btnType={"green"}
                          classNameExtra={""}
                          onClick={() =>
                            updateTaskStatus(currentTask, "completed")
                          }
                        />
                      )}

                      {currentTask.status !== "pending" && (
                        <Button
                          btnName="Set Pending"
                          btnType={"yellow"}
                          classNameExtra={""}
                          onClick={() =>
                            updateTaskStatus(currentTask, "pending")
                          }
                        />
                      )}
                    </>
                  )
                ) : (
                  <span className="text-sm text-slate-700">
                    No puedes cambiar el estado. Solo el asignado o un admin.
                  </span>
                )}

                {(user?.role === "admin" ||
                  (user?.role === "member" &&
                    currentTask.type === "personal")) && (
                  <Button
                    btnName={
                      editTask === currentTask.id ? "Close Editor" : "Edit"
                    }
                    btnType={"orange"}
                    classNameExtra={""}
                    type="button"
                    className={btnGhost}
                    onClick={() => {
                      if (editTask === currentTask.id) setEditTask("");
                      else {
                        setEditTask(currentTask.id);
                        setActionTaskId("");
                      }
                    }}
                  />
                )}
              </div>
              {/* To trasnfers*/}

              <Button btnName="Delete" btnType={"edit"} classNameExtra={""} />
            </div>
          </div>
          <div className="space-y-3 col-span-3 p-2">
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
                  No tienes tareas aún.
                </h3>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isSelected = actionTaskId === task.id;
                const isEditing = editTask === task.id;
                const isExpanded = expandedTaskIds.has(task.id);
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
                      " grid grid-cols-12 rounded-xl border-purple-1 ",
                      isEditing
                        ? "ring-2 ring-slate-400 shadow-sm"
                        : isSelected
                        ? " shadow-xl  scale-101 transition-transform  bg-indigo-100"
                        : "",
                    ].join(" ")}
                  >
                    <div className=" my-2 flex w-full items-center justify-between rounded-xl px-2 col-span-12">
                      {" "}
                      {/*TASK Principal Div*/}
                      {/* Nombre y tipo */}
                      <div className="px-2 text-lg font-semibold text-slate-800 w-full flex">
                        <img
                          src={task.type === "public" ? Public : Personal}
                          className="mr-2 inline-block h-5 w-5 align-[-2px]"
                          alt="Task type"
                        />
                        <div className="bg-black p-2 px-5 text-white rounded-lg text-xs w-5 flex items-center justify-center">
                          1/4
                        </div>
                        {task.taskName}
                        {task.notes && (
                          <img
                            src={
                              hoveredIcon === `note-${task.id}`
                                ? noteHover
                                : note
                            }
                            onMouseEnter={() =>
                              setHoveredIcon(`note-${task.id}`)
                            }
                            onMouseLeave={() => setHoveredIcon("")}
                            className="ml-2 inline-block h-5 w-5 align-[-2px]"
                            alt="Note"
                          />
                        )}
                      </div>
                      {/* Metadatos derecha */}
                      <div className="flex items-center gap-8">
                        {/* completeBy */}
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-semibold text-slate-700">
                            {task.completeBy}
                          </span>
                        </div>

                        {/* time left */}
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-semibold text-emerald-600">
                            {getTimeLeft(task.completeBy)}
                          </span>
                        </div>

                        {/* assignedTo */}
                        <div className="flex flex-col items-center">
                          <img
                            src={userMap[task.assignedTo]?.photo || samplePhoto}
                            className="h-9 w-9 rounded-full border-2 border-blue-500 object-cover"
                            alt="Assignee"
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            {userMap[task.assignedTo]?.name ?? "Unassigned"}
                          </span>
                        </div>

                        {/* priority */}
                        <div className="flex flex-col items-center">
                          <img
                            src={priorityIcons[task.priority] || ""}
                            className="h-5 w-5"
                            alt="Priority"
                          />
                          <span className="text-sm font-semibold text-slate-700 capitalize">
                            {task.priority}
                          </span>
                        </div>

                        {/* status */}
                        <div className="flex flex-col items-center">
                          <img
                            src={statusIcon[task.status] || ""}
                            className="h-5 w-5"
                            alt="Status"
                          />
                          <span className="text-sm font-semibold text-slate-700 capitalize">
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* NUEVO: Subtasks expandibles */}
                    {isExpanded &&
                      Array.isArray(task.subTasks) &&
                      task.subTasks.length > 0 && (
                        <div className="w-full px-2 pb-3 col-span-12">
                          <ul className="space-y-1">
                            {task.subTasks.map((st, idx) => (
                              <li
                                key={`${task.id}-${idx}`}
                                className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
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
                                          {userMap[st.assignedTo]?.name || "?"}
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
                              </li>
                            ))}
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
                            onClick={async () => {
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
                            onClick={() => setDeleteTaskId(null)}
                          >
                            Keep
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Editor */}
                    {editTask === task.id && (
                      <div className="w-full px-2 pb-3">
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
