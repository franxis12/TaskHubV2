import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Setting from "./pages/Setting";
import AwayAproval from "./pages/AwayAproval";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

import { UserProvider } from "./context/UserContext";
import PrivateRoute from "./components/PrivateRoute";
import { StatsProvider } from "./context/StatsContext";
import app from "./auth/firebaseConfig";

function App() {
  return (
    <UserProvider>
      <StatsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/await-approval"
              element={
                <PrivateRoute>
                  <AwayAproval />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </StatsProvider>
    </UserProvider>
  );
}

export default App;
