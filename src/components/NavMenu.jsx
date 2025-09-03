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

function NavMenu({ expanded, setExpanded }) {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  function handleLogout() {
    logout();
    navigate("/");
  }
  const [selectedTap, setSelectedTap] = useState("dashboard");

  const handleTap = (tap) => {
    setSelectedTap(tap);
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
    flex flex-col justify-between overflow-y-auto overflow-x-hidden
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

      {/* FAB en mobile cuando está cerrado */}
      {isMobile && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="fixed left-3 bottom-3 z-50 btn btn-primary btn-circle shadow-lg"
          aria-label="Abrir menú"
          title="Abrir menú"
        >
          ☰
        </button>
      )}

      <aside
        className={`${baseAside} ${positionClass} ${widthClass} `}
        aria-expanded={expanded}
      >
        {/* Encabezado: logo + cerrar en mobile */}
        <div className="flex flex-col gap-4">
          <div className="relative border-b-1">
            {isMobile && expanded && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="absolute -right-3 top-3 btn btn-xs btn-ghost border border-base-300 rounded-full z-50"
                aria-label="Cerrar menú"
                title="Cerrar"
              >
                ×
              </button>
            )}

            <div className="flex flex-col h-11 w-full items-start gap-3 mb-2  ">
              <Logo className="object-contain h-10 w-8" />

              {!expanded && (
                <span className="sr-only ">
                  {user?.companyId || "No companyId assigned"}
                </span>
              )}
            </div>
          </div>

          {/* Menú */}
          <nav className="w-full  flex flex-col  gap-1">
            <Button
              onClick={() => handleTap("dashboard")}
              icon={SVGIcons.home}
              color={selectedTap === "dashboard" ? "auto" : ""}
              position={"center"}
            >
              {expanded ? "Dashboard" : ""}
            </Button>

            <Button
              onClick={() => handleTap("team")}
              icon={SVGIcons.team}
              color={selectedTap === "team" ? "auto" : ""}
              position={"center"}
            >
              {expanded ? "Team" : ""}
            </Button>

            <Button
              onClick={() => handleTap("stats")}
              icon={SVGIcons.stast}
              color={selectedTap === "stats" ? "auto" : ""}
              position={"center"}
            >
              {expanded ? "Stats" : ""}
            </Button>
          </nav>
        </div>

        {/* Footer */}
        <div className="w-full flex flex-col gap-1">
          <Button
            onClick={() => handleTap("setting")}
            icon={SVGIcons.setting}
            color={selectedTap === "setting" ? "auto" : ""}
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
