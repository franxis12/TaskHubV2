import React from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
//import "../styles/dashboard.css";
import TaskList from "../components/TaskList";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="dashboard">
      <TopBar />
      <TaskList />
    </div>
  );
}

export default Dashboard;
