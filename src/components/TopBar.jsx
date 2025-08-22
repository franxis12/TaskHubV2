// src/components/TopBar.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import TaskEstadistic from "./TaskEstadistic";
import { UserContext } from "../context/UserContext";
import { useNavigate, NavLink } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import logoFallback from "../assets/company-logo.png";
import samplePhoto from "../assets/sample.png";
import OpenMenu from "../assets/iconsV2/bars-solid-full.svg?react";
import CloseMenu from "../assets/iconsV2/ellipsis-vertical-solid-full.svg?react";

// Recibir props correctamente
function TopBar({ expanded, setExpanded }) {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState(logoFallback);
  const [menuOpen, setMenuOpen] = useState(false);

  // (Opcional) Tienes este mismo efecto duplicado; deja solo uno.
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

  const userName = useMemo(() => {
    const full = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return full || (user?.email ?? "User");
  }, [user]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const roleBadgeClasses = useMemo(() => {
    const r = (user?.role || "").toLowerCase();
    const base =
      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
    const palette = {
      admin: "bg-orange-trasparent border-orange-2 text-orange",
      manager: "bg-amber-500 text-amber-700 border-amber-200",
      member: "bg-teal-trasparent border-teal-2 text-teal",
      guest: "bg-red-500 text-red-600 border-red-200",
    };
    return `${base} ${
      palette[r] || "bg-slate-100 text-slate-700 border-slate-200"
    }`;
  }, [user?.role]);

  const navLinkClasses = ({ isActive }) =>
    [
      "transition-colors text-white rounded-md px-3 py-2 text-sm font-medium btn border-opacity-0",
      isActive
        ? "btn-primary"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
    ].join(" ");

  return (
    <div className="bg-color flex items-center justify-between">
      <div className="flex gap-5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w5 h5"
          aria-label={expanded ? "Collapse menu" : "Expand menu"}
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <CloseMenu className="w-6 h-6" />
          ) : (
            <OpenMenu className="w-6 h-6" />
          )}
        </button>

        <div className="flex flex-col h-10 items-end">
          <img
            src={logoUrl || logoFallback}
            alt="Company logo"
            className="object-contain h-8 w-25 rounded-md"
          />
          <span className="block text-xs text-slate-500">
            {user?.companyId || "No companyId assigned"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-sm font-medium tx-color">{userName}</span>
          {user?.role && <span className={roleBadgeClasses}>{user.role}</span>}
        </div>
        <img
          className="h-9 w-9 rounded-full object-cover border-2 ring-1 ring-slate-200"
          src={user?.photo || samplePhoto}
          alt="Avatar"
        />
        {/* Logout (desktop) */}
      </div>
    </div>
  );
}

export default TopBar;
