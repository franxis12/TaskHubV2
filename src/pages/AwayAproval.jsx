// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function AwayAproval() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      <h1>Away Aprobal</h1>
      <button
        className="btn btn-prima m-10"
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </button>
      <button className="btn btn-prima m-10" onClick={() => navigate("/")}>
        Landing
      </button>
    </div>
  );
}

export default AwayAproval;
