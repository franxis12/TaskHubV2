import React, { useState, useEffect, useContext, useMemo } from "react";
//import "../styles/taskList.css";
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
  const [curretTask, setCurrentTask] = useState([]);

  // UI
  const [hoveredIcon, setHoveredIcon] = useState("");
  const [editTask, setEditTask] = useState(""); // task.id activo en editor
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [actionTaskId, setActionTaskId] = useState("");
  const [showPublicForm, setShowPublicForm] = useState(false);
  const [showPersonalForm, setShowPersonalForm] = useState(false);

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

  return (
    <div className="taskListMain p-4">
      {showPublicForm && (
        <AddPublicTask accion={() => setShowPublicForm(!showPublicForm)} />
      )}

      <div className="filterMenu" onClick={() => setEditTask(false)}>
        <TaskFilters
          filters={filters}
          setFilters={setFilters}
          assignees={assignees}
          currentUserId={user?.uid}
        />
      </div>

      <div className="taskList">
        <div className="taskMenu toolbar">
          {/* Acciones primarias de la barra */}
          <div className="toolbar-row">
            <button
              type="button"
              className="tbtn tbtn-ghost"
              onMouseEnter={() => setHoveredIcon("addPersonal")}
              onMouseLeave={() => setHoveredIcon("")}
              onClick={() => setShowPersonalForm((s) => !s)}
              title="Nueva tarea personal"
            >
              <img
                src={
                  hoveredIcon === "addPersonal" ? addPersonalHover : addPersonal
                }
                className="tbtn-icon"
                alt="Add Personal Task"
              />
              <span>Personal</span>
            </button>

            <button
              type="button"
              className="tbtn tbtn-ghost"
              onMouseEnter={() => setHoveredIcon("addPublic")}
              onMouseLeave={() => setHoveredIcon("")}
              onClick={() => setShowPublicForm((s) => !s)}
              title="Nueva tarea pública"
            >
              <img
                src={hoveredIcon === "addPublic" ? addPublicHover : addPublic}
                className="tbtn-icon"
                alt="Add Public Task"
              />
              <span>Public</span>
            </button>
          </div>

          {/* Form personal */}
          {showPersonalForm && (
            <PersonalTaskForm
              onClose={() => setShowPersonalForm(false)}
              onCreated={() => {}}
            />
          )}

          {/* Acciones de la tarea seleccionada */}
          {actionTaskId === curretTask.id && (
            <div
              className="taskActions toolbar-actions"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="toolbar-status">
                <span className={`status-badge status-${curretTask.status}`}>
                  {curretTask.status}
                </span>
                <h3 className="toolbar-title">
                  {curretTask.status === "progress"
                    ? "This task is in progress"
                    : curretTask.status === "completed"
                    ? "This task is completed"
                    : curretTask.status === "missed"
                    ? "This task is missed"
                    : "This task is pending"}
                </h3>
              </div>

              <div className="toolbar-row">
                {canChangeStatus(curretTask) ? (
                  curretTask.status === "missed" ? (
                    <span className="toolbar-note danger">
                      Esta tarea ya no se puede cambiar de estado.
                    </span>
                  ) : (
                    <>
                      {curretTask.status === "pending" && (
                        <button
                          type="button"
                          className="tbtn tbtn-outline"
                          onClick={() =>
                            updateTaskStatus(curretTask, "progress")
                          }
                        >
                          Start
                        </button>
                      )}

                      {(curretTask.status === "pending" ||
                        curretTask.status === "progress") && (
                        <button
                          type="button"
                          className="tbtn tbtn-primary"
                          onClick={() =>
                            updateTaskStatus(curretTask, "completed")
                          }
                        >
                          Complete
                        </button>
                      )}

                      {curretTask.status !== "pending" && (
                        <button
                          type="button"
                          className="tbtn tbtn-outline"
                          onClick={() =>
                            updateTaskStatus(curretTask, "pending")
                          }
                        >
                          Set Pending
                        </button>
                      )}
                    </>
                  )
                ) : (
                  <span className="toolbar-note">
                    No puedes cambiar el estado. Solo el asignado o un admin.
                  </span>
                )}

                {(user.role === "admin" ||
                  (user.role === "member" &&
                    curretTask.type === "personal")) && (
                  <button
                    type="button"
                    className="tbtn tbtn-ghost"
                    onClick={() => {
                      if (editTask === curretTask.id) setEditTask("");
                      else {
                        setEditTask(curretTask.id);
                        setActionTaskId("");
                      }
                    }}
                  >
                    {editTask === curretTask.id ? "Close Editor" : "Edit"}
                  </button>
                )}

                <button
                  type="button"
                  className="tbtn tbtn-ghost"
                  onClick={() => setActionTaskId("")}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-100 rounded-4 d-flex justify-content-between align-items-center">
          <div className="fw-bold fs-6">Task Name</div>
          <div className="d-flex gap-5 align-items-center justify-content-center">
            <span className="fw-bold fs-6 gross text-center">Complete by</span>
            <span className="fw-bold fs-6 gross text-center">
              Time Left to complete
            </span>
            <span className="fw-bold fs-6 gross text-center">Assigned to</span>
            <span className="fw-bold fs-6 gross text-center">Priority</span>
            <span className="fw-bold fs-6 gross text-center">Status</span>
          </div>
        </div>

        {user.pendingApproval ? (
          <div className="text-center my-5 w-100">
            <h4 className="w-100 componentBackground p-3 rounded-4 border">
              You will be able to view your tasks once your account has been
              approved.
            </h4>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="divPlaceholder border w-100 rounded-4 h-25 d-flex align-items-center justify-content-center">
            <h3>No tienes tareas aún.</h3>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                if (editTask) return;
                setActionTaskId(task.id);
                setCurrentTask(task);
              }}
              className={`${editTask === task.id && "editing"} ${
                actionTaskId === task.id && "selected"
              } w-100 componentBackground my-2 rounded-4 d-flex flex-column justify-content-between align-items-center`}
            >
              <div className="w-100 my-2 rounded-4 d-flex justify-content-between align-items-center">
                <div className="fw-bold fs-4 px-2">
                  <img
                    src={task.type === "public" ? Public : Personal}
                    className="iconTask"
                    alt="Task type"
                  />
                  {task.taskName}
                  {task.notes && (
                    <img
                      src={hoveredIcon === `note-${task.id}` ? noteHover : note}
                      onMouseEnter={() => setHoveredIcon(`note-${task.id}`)}
                      onMouseLeave={() => setHoveredIcon("")}
                      className="iconTask"
                      alt="Note"
                    />
                  )}
                </div>

                <div className="d-flex gap-5 align-items-center">
                  <div className="d-flex flex-column align-items-center gross">
                    <span className="fw-bold fs-6">{task.completeBy}</span>
                  </div>
                  <div className="d-flex flex-column align-items-center gross">
                    <span className="fw-bold fs-4 text-success">
                      {getTimeLeft(task.completeBy)}
                    </span>
                  </div>
                  <div className="d-flex flex-column align-items-center gross">
                    <img
                      src={userMap[task.assignedTo]?.photo || samplePhoto}
                      className="taskPicAssi rounded-5 border border-2 border-primary"
                    />
                    <span className="fw-bold fs-6">
                      {userMap[task.assignedTo]?.name || "Unassigned"}
                    </span>
                  </div>
                  <div className="d-flex flex-column align-items-center gross">
                    <img
                      src={priorityIcons[task.priority] || ""}
                      className="priorityIcon"
                    />
                    <span className="fw-bold fs-6">{task.priority}</span>
                  </div>
                  <div className="d-flex flex-column align-items-center gross">
                    <img
                      src={statusIcon[task.status] || ""}
                      className="statusIcon"
                    />
                    <span className="fw-bold fs-6">{task.status}</span>
                  </div>
                </div>
              </div>

              {/* Confirm delete */}
              {deleteTaskId === task.id && (
                <div className="deleteTaskConfim">
                  <h3>Seguro que quieren eliminar la tarea</h3>
                  <button
                    onClick={async () => {
                      try {
                        if (task.status === "progress") {
                          alert("No puedes eliminar una tarea en progreso.");
                          setDeleteTaskId(null);
                          return;
                        }
                        const isAdmin = user.role === "admin";
                        const isMyPersonal =
                          task.type === "personal" &&
                          task.createdBy === user.uid;
                        if (!isAdmin && !isMyPersonal) {
                          alert("No tienes permiso para eliminar esta tarea.");
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
                  <button onClick={() => setDeleteTaskId(null)}>Keep</button>
                </div>
              )}

              {/* Editor */}
              {editTask === task.id && (
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
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TaskList;
