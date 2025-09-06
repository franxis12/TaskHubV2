// src/components/TopBar.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../context/UserContext";
import { NavLink } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";
import { myImage, SVGIcons } from "../importFiles/imports";
import { tailwindClass } from "../importFiles/tailwindStyles";

function TopBar({ expanded, setExpanded }) {
  const { user } = useContext(UserContext);
  const [logoUrl, setLogoUrl] = useState("");

  // (Optional) If you have this effect duplicated elsewhere, keep only one.
  useEffect(() => {
    if (!user?.companyId) {
      return;
    }
    const ref = doc(db, "companies", user.companyId);
    const unsub = onSnapshot(ref, (snap) => setLogoUrl(snap.data()?.logo));
    return () => unsub();
  }, [user?.companyId]);

  const userName = useMemo(() => {
    const full = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return full || (user?.email ?? "User");
  }, [user]);

  const roleBadgeClasses = useMemo(() => {
    const r = (user?.role || "").toLowerCase();
    const base =
      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
    const palette = {
      admin: tailwindClass.accountType.admin,
      member: tailwindClass.accountType.member,
    };
    return `${base} ${
      palette[r] || "bg-slate-100 text-slate-700 border-slate-200"
    }`;
  }, [user?.role]);

  return (
    <div className="bg-[var(--bg-color-component)] flex items-center justify-between max-h-20">
      <div className="flex gap-5 w-full ">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w5 h5"
          aria-label={expanded ? "Collapse menu" : "Expand menu"}
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <SVGIcons.menu.close className="w-6 h-6" />
          ) : (
            <SVGIcons.menu.open className="w-6 h-6" />
          )}
        </button>

        {logoUrl && (
          <div className="flex h-full w-auto items-end gap-2">
            <img
              src={logoUrl}
              alt="Company logo"
              className="object-contain h-10 rounded-md"
            />
            <span
              className="block text-xs text-slate-500"
              title={"Company ID: " + user?.companyId}
            >
              {user?.companyId || "No companyId assigned"}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 p-3 w-2/6 justify-end">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-sm font-medium tx-color">{userName}</span>
          {user?.role && <span className={roleBadgeClasses}>{user.role}</span>}
        </div>
        <img
          className="h-9 w-9 rounded-full object-cover border-2 ring-1 ring-slate-200"
          src={user?.photo || myImage.defaultUser}
          alt="Avatar"
        />
        {/* Logout (desktop) */}
      </div>
    </div>
  );
}

export default TopBar;
