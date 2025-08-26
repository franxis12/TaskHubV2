import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
//import "../styles/dashboard.css";
import TaskList from "../components/TaskList";
import NavMenu from "../components/NavMenu";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import AddPublicTask from "../components/AddPublicTask";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  // Estado inicial según el viewport actual:
  const isMobileInit = typeof window !== "undefined" && window.innerWidth < 700;
  const [expanded, setExpanded] = useState(!isMobileInit);
  const [showPersonalForm, setShowPersonalForm] = useState(false);
  const [showPublicForm, setShowPublicForm] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="bg-pages w-screen h-screen flex">
      <NavMenu expanded={expanded} setExpanded={setExpanded} />
      <div className="w-screen mainSection">
        <TopBar expanded={expanded} setExpanded={setExpanded} />
        <TaskList
          showPublicForm={showPublicForm}
          setShowPublicForm={setShowPublicForm}
        />
      </div>
      {showPublicForm && (
        <AddPublicTask accion={() => setShowPublicForm(!showPublicForm)} />
      )}
    </div>
  );
}

export default Dashboard;
