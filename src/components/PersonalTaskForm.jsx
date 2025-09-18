// src/components/PersonalTaskForm.jsx
import React, { useState, useContext, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";
import { UserContext } from "../context/UserContext";
import { SVGIcons } from "../importFiles/imports";
import Button from "../Utils/Button";
import Inputs from "../Utils/Inputs";
import Selects from "../Utils/Selects";
import TextArea from "../Utils/TextArea";

function PersonalTaskForm({
  onClose,
  onCreated,
  setShowPublicForm,
  setShowPersonalForm,
}) {
  const { user } = useContext(UserContext);

  // Main fields
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [completeBy, setCompleteBy] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Subtasks
  const [subTaskMenu, setSubTaskMenu] = useState(false);
  const [animation, setAnimation] = useState(false);
  const [stName, setStName] = useState("");
  const [stPriority, setStPriority] = useState("medium");
  const [stCompleteBy, setStCompleteBy] = useState("");
  const [stNotes, setStNotes] = useState("");
  const [subTasks, setSubTasks] = useState([]); // {name, priority, completeBy, notes, status, assignedTo}

  // Accordion animation
  useEffect(() => {
    if (subTaskMenu) {
      setAnimation(true);
    } else {
      const t = setTimeout(() => setAnimation(false), 700); // igual a duration-700
      return () => clearTimeout(t);
    }
  }, [subTaskMenu]);

  // Cmd/Ctrl + Enter => submit
  useEffect(() => {
    const handler = (e) => {
      const isMetaEnter = (e.metaKey || e.ctrlKey) && e.key === "Enter";
      if (isMetaEnter && !submitting && taskName.trim()) {
        document.getElementById("personal-task-submit")?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submitting, taskName]);

  // Assignment defaults to current user; no UI needed

  const handleFormSwitch = (e) => {
    e?.preventDefault?.();
    if (setShowPublicForm && setShowPersonalForm) {
      setShowPublicForm(true);
      setShowPersonalForm(false);
    }
  };

  const copyFromMain = () => {
    setStPriority(priority);
    setStCompleteBy(completeBy);
  };

  const handleAddSubTask = () => {
    const name = stName.trim();
    if (!name || subTasks.length >= 10) return;
    setSubTasks((prev) => [
      ...prev,
      {
        name,
        priority: stPriority || "medium",
        completeBy: stCompleteBy || "",
        notes: stNotes?.trim() || "",
        status: "pending",
        // Important: owner can change status
        assignedTo: user?.uid || null,
      },
    ]);
    setStName("");
    setStNotes("");
    // Leave priority/date to add several similar ones
  };

  const handleRemoveSubTask = (idx) => {
    setSubTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    if (!user?.uid || !user?.companyId) {
      alert("The user uid/companyId is missing.");
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, "tasks"), {
        // Identity / ownership
        type: "personal",
        companyId: user.companyId,
        createdBy: user.uid,
        assignedTo: user.uid, // owner
        // Content
        taskName: taskName.trim(),
        notes: notes || "",
        priority,
        // Dates
        createdAt: serverTimestamp(),
        completeBy: completeBy || "",
        completedAt: null,
        // Status + flags
        status: "pending",
        pendingCounted: false,
        completedCounted: false,
        missedCounted: false,
        // Subtasks
        subTasks,
      });

      // Reset
      setTaskName("");
      setPriority("medium");
      setCompleteBy("");
      setNotes("");
      setSubTasks([]);
      setStName("");
      setStPriority("medium");
      setStCompleteBy("");
      setStNotes("");

      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error("Error creating personal task:", err);
      alert("We couldn't create the task.");
    } finally {
      setSubmitting(false);
    }
  };

  const prioritis = [
    { uid: "l", name: "low" },
    { uid: "m", name: "medium" },
    { uid: "h", name: "high" },
  ];

  return (
    <div className="fixed inset-0 z-[4000] bg-black/50 overflow-y-auto overscroll-contain">
      {/* Wrapper: top on mobile, centered on md+ */}
      <div
        className="min-h-svh flex items-start md:items-center justify-center p-4 md:p-6"
        style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
      >
        {/* Modal container */}
        <div
          className="w-full md:w-[90vw] max-w-4xl rounded-3xl p-4 no-scrollbar bg-principal border border-slate-100/30  shadow-lg "
          style={{
            color: "var(--textColor)",
            maxHeight: "calc(100svh - 2rem)",
            overflow: "auto",
          }}
        >
          <form
            className="flex flex-col gap-4 rounded-2xl"
            onSubmit={handleCreate}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <h2 className="font-bold text-xl">Personal Task Form</h2>{" "}
                <Button
                  icon={SVGIcons.public}
                  iconRight
                  iconSize={"4"}
                  onClick={handleFormSwitch}
                  color={"link"}
                >
                  Create public task
                </Button>
              </span>
              <Button
                icon={SVGIcons.x}
                color={"orange"}
                iconSize={"4"}
                onClick={onClose}
              />
            </div>
            <Inputs
              id={"taskname"}
              label="Task name"
              icon={SVGIcons.personal}
              iconSize={"6"}
              placeholder="Enter your task name here"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />

            {/* Two main columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-3">
                {/* Date */}
                <Inputs
                  type={"date"}
                  icon={SVGIcons.calendar}
                  iconSize={"6"}
                  id={"taskdate"}
                  label={"Due date"}
                  value={completeBy}
                  onChange={(e) => setCompleteBy(e.target.value)}
                />

                {/* Priority */}
                <Selects
                  map={prioritis}
                  id="priority"
                  label={"Priority "}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  valueKey={"name"}
                  labelKey={"name"}
                  className="selectBase"
                  icon={
                    priority === "high"
                      ? SVGIcons.priority.high
                      : priority === "medium"
                      ? SVGIcons.priority.med
                      : priority === "low"
                      ? SVGIcons.priority.low
                      : SVGIcons.question
                  }
                  iconSize={"6"}
                  iconColor={
                    priority === "high"
                      ? "orange"
                      : priority === "medium"
                      ? "yellow"
                      : priority === "low"
                      ? "green"
                      : ""
                  }
                />
              </div>

              {/* Right column */}
              <div className="space-y-3">
                {/* Notes */}
                <TextArea
                  icon={SVGIcons.note}
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  iconSize={"6"}
                  placeholder="Enter here your notes"
                />
              </div>
            </div>

            {/* Subtasks */}
            {subTaskMenu ? (
              <div
                className={`${
                  animation ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden transition-all duration-700 ease-in-out rounded-2xl border border-slate-200 p-3 bg-white/10`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="labelBase m-0 text-[var(--textColor)] font-medium">
                    Sub-tasks{" "}
                    <span className="text-slate-400">
                      ({subTasks.length}/10)
                    </span>
                  </label>
                  <div className="gap-2 flex">
                    <Button
                      type="button"
                      color=""
                      onClick={copyFromMain}
                      title="Copy priority & date from main"
                    >
                      Copy from main
                    </Button>
                    <Button
                      onClick={() => setSubTaskMenu(false)}
                      type="button"
                      color={"orange"}
                      icon={SVGIcons.x}
                    />
                  </div>
                </div>

                {/* Subtask form */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                  <input
                    type="text"
                    value={stName}
                    onChange={(e) => setStName(e.target.value)}
                    className="inputBase text-lg border-b-2"
                    placeholder="Enter Sub-task name"
                    maxLength={100}
                  />
                  <div className="pl-3 h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl">
                    <select
                      value={stPriority}
                      onChange={(e) => setStPriority(e.target.value)}
                      className="selectBase"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="pl-4 h-10 flex items-center bg-[var(--color-input)] gap-2 border border-slate-600/25 rounded-xl">
                    <input
                      type="date"
                      value={stCompleteBy}
                      onChange={(e) => setStCompleteBy(e.target.value)}
                      className="flex items-center"
                    />
                  </div>
                  {/* No assignee selector for subtasks; defaults to owner */}
                  <Button
                    type="button"
                    onClick={handleAddSubTask}
                    color={"green"}
                    disabled={!stName.trim() || subTasks.length >= 10}
                    title="Add sub-task"
                  >
                    Add Sub-task
                  </Button>
                </div>

                <div className="flex flex-col items-start gap-2 border bg-[var(--color-input)] border-slate-600/25 rounded-xl">
                  <span className="text-black px-2 py-1 flex bg-slate-200 w-full rounded-t-xl items-center gap-2">
                    <SVGIcons.note className="h-6 w-6" />
                    Sub-task notes
                    <span className="text-slate-600 ">(Optional)</span>
                  </span>
                  <textarea
                    value={stNotes}
                    onChange={(e) => setStNotes(e.target.value)}
                    className="textAreaBase mb-2 min-h-[60px]"
                    placeholder="Enter your notes here"
                    maxLength={400}
                  />
                </div>

                {subTasks.length > 0 && (
                  <ul className="space-y-1 mt-2">
                    {subTasks.map((st, idx) => (
                      <li
                        key={`${st.name}-${idx}`}
                        className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {idx + 1}. {st.name}
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                            <span>Priority: {st.priority}</span>
                            {st.completeBy && (
                              <span>• Due: {st.completeBy}</span>
                            )}
                            {st.notes && <span>• Notes: {st.notes}</span>}
                            <span>• Assigned: You</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleRemoveSubTask(idx)}
                          color={"orange"}
                          title="Remove"
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-3 bg-white/50">
                <div
                  onClick={() => setSubTaskMenu(true)}
                  className="flex flex-col h-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 cursor-pointer"
                >
                  <span>Add Sub-Tasks</span>
                  <SVGIcons.plus className="w-5 h-5 border rounded-3xl" />
                </div>

                {subTasks.map((st, idx) => (
                  <li
                    key={`${st.name}-${idx}`}
                    className="flex items-start justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                  >
                    <div className="flex">
                      <div className="h-full w-5">
                        <div className="bg-black text-white w-5 rounded-sm items-center flex justify-center">
                          {idx + 1}
                        </div>
                        <SVGIcons.arrowTurn.right className="w-4 h-full mr-3 ml-2" />
                      </div>
                      <div className="min-w-0 flex-1 ml-3">
                        <div className="text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                          <span>Assigned: You</span>
                        </div>
                        <div className="font-medium truncate mb-1">
                          {st.name}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                id="personal-task-submit"
                type="submit"
                color={`green`}
                icon={submitting && SVGIcons.status.progress}
                animation={"spin"}
                disabled={submitting || !taskName.trim()}
                title="Cmd/Ctrl + Enter to create"
              >
                {submitting ? "Creating..." : "Create personal task"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PersonalTaskForm;
