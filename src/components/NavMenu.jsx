// src/components/NavMenu.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

//import { doc, onSnapshot } from "firebase/firestore";
//import { db } from "../firebaseConfig";
import Button from "../Utils/Button";
import LogoExpand from "../assets/LogoExpand.svg?react";
import Logo from "../assets/LOGO.svg?react";
import { SVGIcons } from "../importFiles/imports";

function NavMenu({ expanded, setExpanded, tap, setTap }) {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  function handleLogout() {
    logout();
    navigate("/");
  }

  const handleTap = (tapSelect) => {
    setTap(tapSelect);
  };

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 700
  );

  // transition false to prevent flashing Screen
  const [transitionsOn, setTransitionsOn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setTransitionsOn(true), 0);
    return () => clearTimeout(id);
  }, []);

  const prevIsMobile = useRef(isMobile);
  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;
    let t = 0;

    const handle = () => {
      const next = window.innerWidth < 700;
      if (next !== prevIsMobile.current) {
        prevIsMobile.current = next;
        setIsMobile(next);
        setExpanded(next ? false : true);
      }
    };

    const onResize = () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      t = setTimeout(() => {
        raf = requestAnimationFrame(handle);
      }, 120);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [setExpanded]);

  const MOBILE_WIDTH = "w-56 p-2";
  const DESKTOP_EXPANDED = "w-40 p-3";
  const DESKTOP_COLLAPSED = "w-16 p-2";

  const baseAside = `
    h-screen ml-1 rounded-2xl shrink-0 bg-[var(--bg-color-component)]
    flex flex-col justify-between  overflow-y-auto overflow-x-hidden
    ${
      transitionsOn
        ? "transition-all duration-300 ease-in-out"
        : "transition-none"
    }
  `;

  const positionClass = isMobile
    ? `fixed inset-y-0 left-0 z-40 transform ${
        expanded ? "translate-x-0" : "-translate-x-full"
      }`
    : "sticky left-0 top-0";

  const widthClass = isMobile
    ? MOBILE_WIDTH
    : expanded
    ? DESKTOP_EXPANDED
    : DESKTOP_COLLAPSED;

  return (
    <>
      {/* Backdrop mobile when menu open */}
      {isMobile && expanded && (
        <div
          className="fixed inset-0 z-30 bg-black/30"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${baseAside} ${positionClass} ${widthClass}  `}
        aria-expanded={expanded}
      >
        {/* Encabezado: logo + cerrar en mobile */}
        <div className="flex flex-col gap-4">
          <div className="relative border-b-1 flex">
            <div className="flex flex-col h-11 w-full items-start gap-3 mb-2  ">
              <Logo className="object-contain h-10 w-8" />

              {!expanded && (
                <span className="sr-only ">
                  {user?.companyId || "No companyId assigned"}
                </span>
              )}
            </div>
            {isMobile && expanded && (
              <Button
                iconSize={4}
                type="button"
                onClick={() => setExpanded(false)}
                className="absolute -right-3 top-3 btn btn-xs btn-ghost border border-base-300 rounded-full z-50"
                ariaLabel="Close menu"
                icon={SVGIcons.x}
                title="Cerrar"
              />
            )}
          </div>

          {/* Menú */}
          <nav className="w-full  flex flex-col  gap-1">
            <Button
              onClick={() => handleTap("dashboard")}
              icon={SVGIcons.home}
              color={tap === "dashboard" ? "auto" : ""}
              position={expanded ? "left" : "center"}
            >
              {expanded ? "Dashboard" : ""}
            </Button>

            <Button
              onClick={() => handleTap("team")}
              icon={SVGIcons.team}
              color={tap === "team" ? "auto" : ""}
              position={expanded ? "left" : "center"}
            >
              {expanded ? "Team" : ""}
            </Button>

            <Button
              onClick={() => handleTap("stats")}
              icon={SVGIcons.stast}
              color={tap === "stats" ? "auto" : ""}
              position={expanded ? "left" : "center"}
            >
              {expanded ? "Stats" : ""}
            </Button>

            <Button
              onClick={() => handleTap("assigned")}
              icon={SVGIcons.personal}
              color={tap === "assigned" ? "auto" : ""}
              position={expanded ? "left" : "center"}
            >
              {expanded ? "Assigned" : ""}
            </Button>
            <Button
              onClick={() => handleTap("alltask")}
              icon={SVGIcons.tasklist}
              color={tap === "alltask" ? "auto" : ""}
              position={expanded ? "left" : "center"}
            >
              {expanded ? "All Tasks" : ""}
            </Button>
          </nav>
        </div>

        {/* Footer */}
        <div className="w-full flex flex-col gap-1">
          <Button
            onClick={() => handleTap("settings")}
            icon={SVGIcons.setting}
            color={tap === "settings" ? "auto" : ""}
            position={"center"}
          >
            {expanded ? "Setting" : ""}
          </Button>
          <Button
            color={"orange"}
            onClick={handleLogout}
            icon={SVGIcons.logout}
            position={"center"}
          >
            {expanded ? "Logout" : ""}
          </Button>
        </div>
      </aside>
    </>
  );
}

export default NavMenu;
