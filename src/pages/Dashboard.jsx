import React, { useState } from "react";
import TopBar from "../components/TopBar";
import TaskList from "../components/TaskList";
import NavMenu from "../components/NavMenu";
import AddPublicTask from "../components/AddPublicTask";
import PersonalTaskForm from "../components/PersonalTaskForm";

function Dashboard() {
  const isMobileInit = typeof window !== "undefined" && window.innerWidth < 700;
  const [expanded, setExpanded] = useState(isMobileInit);
  const [showPersonalForm, setShowPersonalForm] = useState(false);
  const [showPublicForm, setShowPublicForm] = useState(false);
  const [tap, setTap] = useState("dashboard");
  const [chatVisivility, setChatVisivility] = useState(!isMobileInit);
  console.log(tap);

  return (
    <div className="bg-pages w-screen h-screen flex">
      <NavMenu
        expanded={expanded}
        setExpanded={setExpanded}
        tap={tap}
        setTap={setTap}
      />
      <div className="w-screen mainSection">
        <TopBar expanded={expanded} setExpanded={setExpanded} />
        <TaskList
          showPublicForm={showPublicForm}
          setShowPublicForm={setShowPublicForm}
          showPersonalForm={showPersonalForm}
          setShowPersonalForm={setShowPersonalForm}
          tap={tap}
          setTap={setTap}
          chatVisivility={chatVisivility}
          setChatVisivility={setChatVisivility}
        />
      </div>

      {showPublicForm && (
        <AddPublicTask accion={() => setShowPublicForm(!showPublicForm)} />
      )}
      {showPersonalForm && (
        <PersonalTaskForm
          onClose={() => setShowPersonalForm(false)}
          onCreated={() => {}}
        />
      )}
    </div>
  );
}

export default Dashboard;
