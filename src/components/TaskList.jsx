// src/components/TaskList.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import { UserContext } from "../context/UserContext";
import {
  doc,
  updateDoc,
  //deleteDoc,
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
import Setting from "../pages/Setting";

import Container from "../Utils/Container";
import AssignedToMe from "./AssignedToMe";
import AllTasks from "./AllTasks";
import Button from "../Utils/Button";
import { myImage, SVGIcons } from "../importFiles/imports";
import { tailwindClass } from "../importFiles/tailwindStyles";

import highImportantIcon from "../assets/icons/HImportan.png";
import lowImportantIcon from "../assets/icons/LImportant.png";
import mediumImportantIcon from "../assets/icons/MImportant.png";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

import note from "../assets/icons/note.svg";

import completeIcon from "../assets/icons/complete.svg";
import pendingIcon from "../assets/icons/pending.svg";
import progressIcon from "../assets/icons/progress.svg";
import missedIcon from "../assets/icons/missed.svg";

const calendarIcon = pendingIcon;
const titleIcon = note;
const statusIconImg = progressIcon;

function TaskList({ setShowPublicForm, setShowPersonalForm, tap, setTap }) {
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
  const [expandedTaskIds, setExpandedTaskIds] = useState(new Set());
  const mobile = window.innerWidth < 700;
  const [chatVisivility, setChatVisivility] = useState(!mobile);

  useEffect(() => {
    if (!mobile) {
      setChatVisivility(true);
    } else if (mobile) {
      setChatVisivility(false);
    }
  }, [mobile]);

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

  // NEW: items assigned to me (tasks and sub-tasks)
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

  // Change status (Cloud Functions adjust counters/flags)
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
          photo: d.data().photo || myImage.defaultUser,
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
    if (!completeByValue) return "Unlimited";
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
    <div className="p-2  w-full bg-component rounded-2xl rounded-b-3xl h-auto shadow-inner drop-shadow-md ">
      {/* Toolbar */}
      <div className="rounded-2xl bg-[var(--pagesBackground)] p-1 mb-2 shadow-md">
        {/* Primary actions and Filters */}
        <div className="flex  items-center gap-2 ">
          {/*Add task buttons*/}
          <div className="flex gap-1 border-r pr-2">
            <Button
              icon={SVGIcons.addPublic}
              color="auto"
              position={"center"}
              onClick={() => setShowPublicForm((s) => !s)}
            >
              Public Task
            </Button>
            <Button
              icon={SVGIcons.addPersonal}
              color="auto"
              position={"center"}
              onClick={() => setShowPersonalForm((s) => !s)}
            >
              Personal Task
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12   gap-2 grid-flow-row-dense  col-span-2">
        {(tap === "assigned" || tap === "dashboard") && (
          <Container
            className={`max-h-100 col-span-12 ${
              tap !== "assigned"
                ? "md:col-span-6 lg:col-span-4"
                : "max-h-screen h-[83vh]"
            }   grid-cols-12 overflow-x-hidden`}
          >
            <AssignedToMe
              assignedItems={assignedItems}
              getTimeLeft={getTimeLeft}
              setActionTaskId={setActionTaskId}
              setCurrentTask={setCurrentTask}
              setExpandedTaskIds={setExpandedTaskIds}
            />
          </Container>
        )}

        {(tap === "stats" || tap === "dashboard") && (
          <Container
            className={`max-h-100   grid-cols-12  ${
              tap === "stats"
                ? " lg:col-sapn-12 "
                : " col-span-12 md:col-span-6 lg:col-span-4 "
            } col-span-6`}
          >
            <TaskEstadistic />
          </Container>
        )}

        {(tap === "team" || tap === "dashboard") && (
          <Container
            className={`row-span-2 ${
              tap === "team" ? "lg:col-span-12 h-[83vh]" : "lg:col-span-4"
            } col-span-12 flex`}
          >
            <div className={`flex w-full justify-between `}>
              <div className={"w-full"}>
                <TeamMembers
                  tasks={tasks} // opcional, para mostrar conteos
                  onMemberClick={(uid) => {
                    // opcional: filtra por asignado usando tus filtros existentes
                    setFilters((f) => ({ ...f, assignedTo: uid }));
                  }}
                  tap={tap}
                  setTap={setTap}
                  mobile={mobile}
                  setChatVisivility={() => setChatVisivility(!chatVisivility)}
                  chatVisivility={chatVisivility}
                />
              </div>
            </div>
          </Container>
        )}

        {(tap === "alltask" || tap === "dashboard") && (
          <Container
            className={`col-span-12 md:col-span-12 ${
              tap === "alltask" ? "lg:col-span-12" : ""
            } transition-height duration-500 ease-in-out`}
          >
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

            {/*Task Filters */}
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
            </div>

            {/* All Tasks extracted component */}
            <AllTasks
              user={user}
              filteredTasks={filteredTasks}
              userMap={userMap}
              tailwindClass={tailwindClass}
              actionTaskId={actionTaskId}
              currentTask={currentTask}
              editTask={editTask}
              deleteTaskId={deleteTaskId}
              expandedTaskIds={expandedTaskIds}
              setActionTaskId={setActionTaskId}
              setCurrentTask={setCurrentTask}
              setEditTask={setEditTask}
              setDeleteTaskId={setDeleteTaskId}
              toggleExpand={toggleExpand}
              canChangeStatus={canChangeStatus}
              updateTaskStatus={updateTaskStatus}
              getTimeLeft={getTimeLeft}
              priorityIcons={priorityIcons}
              statusIcon={statusIcon}
              statusIconImg={statusIconImg}
              calendarIcon={calendarIcon}
              titleIcon={titleIcon}
            />

            <div className="flex items-start justify-between col-span-3 p-2 shadowTopInset divTitle"></div>
          </Container>
        )}

        {tap === "settings" && (
          <Container
            className={`row-span-2 ${
              tap === "settings" ? "lg:col-span-12 h-[83vh]" : "lg:col-span-4"
            } col-span-12 flex`}
          >
            <Setting />
          </Container>
        )}
      </div>
    </div>
  );
}

export default TaskList;
