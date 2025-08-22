import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
//import "../styles/dashboard.css";
import TaskList from "../components/TaskList";
import NavMenu from "../components/NavMenu";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  // Estado inicial según el viewport actual:
  const isMobileInit = typeof window !== "undefined" && window.innerWidth < 700;
  const [expanded, setExpanded] = useState(!isMobileInit);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="bg-pages w-screen h-screen flex">
      <NavMenu expanded={expanded} setExpanded={setExpanded} />
      <div className="w-full mainSection">
        <TopBar expanded={expanded} setExpanded={setExpanded} />
        <TaskList />
      </div>
    </div>
  );
}

export default Dashboard;
