// src/components/TopBar.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
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

  // 3) Persist logo to localStorage IF MISSING
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!logoUrl || logoUrl === logoFallback) return;

    if (!localStorage.getItem(baseLogoKey)) {
      localStorage.setItem(baseLogoKey, logoUrl);
    }
    if (scopedLogoKey && !localStorage.getItem(scopedLogoKey)) {
      localStorage.setItem(scopedLogoKey, logoUrl);
    }
  }, [logoUrl, scopedLogoKey]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const roleBadgeClasses = useMemo(() => {
    const r = (user?.role || "").toLowerCase();
    const base =
      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
    const palette = {
      admin: "bg-red-100 text-red-700 border-red-200",
      manager: "bg-amber-100 text-amber-700 border-amber-200",
      member: "bg-blue-100 text-blue-700 border-blue-200",
      guest: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return `${base} ${
      palette[r] || "bg-slate-100 text-slate-700 border-slate-200"
    }`;
  }, [user?.role]);

  const navLinkClasses = ({ isActive }) =>
    [
      "transition-colors rounded-md px-3 py-2 text-sm font-medium",
      isActive
        ? "text-slate-900 bg-slate-100"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b">
      {/* Top row */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-14 items-center justify-between gap-3">
          {/* Brand (logo + app) */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => navigate("/dashboard")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/dashboard")}
          >
            <img
              className="h-9 w-9 rounded-lg object-contain bg-white ring-1 ring-black/5"
              src={logoUrl || logoFallback}
              alt="Company"
            />
            <div className="leading-tight">
              <strong className="block text-sm font-semibold tracking-tight text-slate-900">
                Task-Hub
              </strong>
              <span className="block text-xs text-slate-500">
                {user?.companyId || "—"}
              </span>
            </div>
          </div>

          {/* Center nav (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClasses}>
              Dashboard
            </NavLink>
            <NavLink to="/settings" className={navLinkClasses}>
              Settings
            </NavLink>
            <NavLink to="/messages" className={navLinkClasses}>
              Messages
            </NavLink>
          </nav>

          {/* User block */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium text-slate-900">
                {userName}
              </span>
              {user?.role && (
                <span className={roleBadgeClasses}>{user.role}</span>
              )}
            </div>
            <img
              className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
              src={userPhoto}
              alt="Avatar"
            />

            {/* Logout (desktop) */}
            <button
              className="hidden md:inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
              onClick={handleLogout}
            >
              Logout
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden inline-flex flex-col gap-1.5 p-2 rounded-md hover:bg-slate-100"
              aria-label="Open menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="h-0.5 w-5 bg-slate-700 rounded" />
              <span className="h-0.5 w-5 bg-slate-700 rounded" />
              <span className="h-0.5 w-5 bg-slate-700 rounded" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav
          className="md:hidden border-t bg-white shadow-sm"
          onClick={() => setMenuOpen(false)}
        >
          <div className="mx-auto max-w-7xl px-3 py-2 flex flex-col gap-1">
            <NavLink to="/dashboard" className={navLinkClasses}>
              Dashboard
            </NavLink>
            <NavLink to="/settings" className={navLinkClasses}>
              Settings
            </NavLink>
            <NavLink to="/messages" className={navLinkClasses}>
              Messages
            </NavLink>
            <button
              className="mt-1 inline-flex w-full justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </nav>
      )}

      {/* Stats row */}
      <div className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-3">
          <TaskEstadistic />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
