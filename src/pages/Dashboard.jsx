import React from "react";
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

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="bg-pages w-screen h-screen flex">
      <NavMenu />
      <div className="w-full mainSection">
        <TopBar />

        <TaskList />
      </div>
    </div>
  );
}

export default Dashboard;
