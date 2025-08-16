// src/components/TopBar.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
//import "../styles/topBar.css";
import TaskEstadistic from "./miniComponents/TaskEstadistic";
import { UserContext } from "../context/UserContext";
import { useNavigate, NavLink } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import logoFallback from "../assets/company-logo.png";
import samplePhoto from "../assets/sample.png";

function TopBar() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState(logoFallback);
  const [menuOpen, setMenuOpen] = useState(false);

  const userPhoto = user?.photo || samplePhoto;
  const userName = useMemo(() => {
    const full = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return full || (user?.email ?? "User");
  }, [user]);

  // Keys for localStorage
  const baseLogoKey = "companyLogo";
  const scopedLogoKey = useMemo(
    () => (user?.companyId ? `companyLogo:${user.companyId}` : null),
    [user?.companyId]
  );

  // 1) Seed from localStorage immediately if present (prevents flicker)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored =
      localStorage.getItem(baseLogoKey) ||
      (scopedLogoKey ? localStorage.getItem(scopedLogoKey) : null);
    if (stored) setLogoUrl(stored);
  }, [scopedLogoKey]);

  // 2) Subscribe to company doc to get live logo updates
  useEffect(() => {
    if (!user?.companyId) {
      setLogoUrl(logoFallback);
      return;
    }
    const ref = doc(db, "companies", user.companyId);
    const unsub = onSnapshot(
      ref,
      (snap) => setLogoUrl(snap.data()?.logo || logoFallback),
      () => setLogoUrl(logoFallback)
    );
    return () => unsub();
  }, [user?.companyId]);

  // 3) When we have a valid logoUrl, persist it to localStorage IF MISSING
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!logoUrl || logoUrl === logoFallback) return;

    // Save generic key
    if (!localStorage.getItem(baseLogoKey)) {
      localStorage.setItem(baseLogoKey, logoUrl);
    }
    // Save namespaced key (per company) if available
    if (scopedLogoKey && !localStorage.getItem(scopedLogoKey)) {
      localStorage.setItem(scopedLogoKey, logoUrl);
    }
  }, [logoUrl, scopedLogoKey]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="tb-wrapper">
      {/* Top row */}
      <div className="tb-bar">
        {/* Brand (logo + app) */}
        <div
          className="tb-brand"
          onClick={() => navigate("/dashboard")}
          role="button"
          tabIndex={0}
        >
          <img
            className="tb-logo"
            src={logoUrl || logoFallback}
            alt="Company"
          />
          <div className="tb-brand-text">
            <strong>Task-Hub</strong>
            <span className="tb-company">{user?.companyId || "—"}</span>
          </div>
        </div>

        {/* Center nav (desktop) */}
        <nav className="tb-nav">
          <NavLink to="/dashboard" className="tb-link">
            Dashboard
          </NavLink>
          <NavLink to="/settings" className="tb-link">
            Settings
          </NavLink>
          <NavLink to="/messages" className="tb-link">
            Messages
          </NavLink>
        </nav>

        {/* User block */}
        <div className="tb-user">
          <div className="tb-user-info">
            <span className="tb-user-name">{userName}</span>
            {user?.role && (
              <span className={`tb-role tb-role--${user.role}`}>
                {user.role}
              </span>
            )}
          </div>
          <img className="tb-avatar" src={userPhoto} alt="Avatar" />
          <button className="tb-logout" onClick={handleLogout}>
            Logout
          </button>

          {/* Mobile menu toggle */}
          <button
            className="tb-burger"
            aria-label="Open menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="tb-nav-mobile" onClick={() => setMenuOpen(false)}>
          <NavLink to="/dashboard" className="tb-link">
            Dashboard
          </NavLink>
          <NavLink to="/settings" className="tb-link">
            Settings
          </NavLink>
          <NavLink to="/messages" className="tb-link">
            Messages
          </NavLink>
          <button className="tb-logout w-100" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      )}

      {/* Stats row */}
      <div className="tb-stats">
        <TaskEstadistic />
      </div>
    </header>
  );
}

export default TopBar;
