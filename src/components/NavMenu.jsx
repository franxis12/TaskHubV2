// src/components/NavMenu.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import logoFallback from "../assets/LOGO.svg";
import Button from "../Utils/Button";
import LogoExpand from "../assets/LogoExpand.svg?react";
import Logo from "../assets/LOGO.svg?react";

function NavMenu({ expanded, setExpanded }) {
  const { user, logout } = useContext(UserContext);

  // (Si usas el logo de DB en otro sitio, mantenemos esto)
  const [logoUrl, setLogoUrl] = useState(logoFallback);

  // Estado mobile inicial sin causar parpadeo
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 700
  );

  // Transiciones desactivadas en el primer render (evita "pestañeo")
  const [transitionsOn, setTransitionsOn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setTransitionsOn(true), 0);
    return () => clearTimeout(id);
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  // Suscripción al logo (opcional)
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

  // Resize: solo actuamos cuando CRUZAMOS el umbral (sin tocar el primer render)
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
        // En mobile cerramos; en desktop abrimos (solo cuando cruzamos el umbral)
        setExpanded(next ? false : true);
      }
    };

    const onResize = () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      t = setTimeout(() => {
        raf = requestAnimationFrame(handle);
      }, 120); // debounce suave
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [setExpanded]);

  // Clases de tamaño
  const MOBILE_WIDTH = "w-56 p-2"; // más angosto en mobile (11rem)
  const DESKTOP_EXPANDED = "w-40 p-3"; // respeta tu ancho desktop
  const DESKTOP_COLLAPSED = "w-16 p-2";

  const baseAside = `
    h-screen ml-1 rounded-2xl shrink-0 bg-white
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
      {/* Backdrop en mobile cuando está abierto */}
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

            <div className="flex flex-col h-11 items-start gap-3 mb-2  ">
              {expanded ? (
                <LogoExpand className="object-contain h-12 w-32" />
              ) : (
                <Logo className="object-contain h-10 w-8" />
              )}
              {!expanded && (
                <span className="sr-only">
                  {user?.companyId || "No companyId assigned"}
                </span>
              )}
            </div>
          </div>

          {/* Menú */}
          <nav className="w-full  flex flex-col ">
            <Button
              btnName={expanded && "Dashboard"}
              hasIcon
              iconPicked={"dashboard"}
              classNameExtra={
                expanded ? "justify-start selected" : "justify-center selected"
              } //Selected class for selected pages
              btnType={"primary"}
            />
            <Button
              btnName={expanded && "Team"}
              hasIcon
              iconPicked={"user"}
              classNameExtra={expanded ? "justify-start" : "justify-center"}
              btnType={"primary"}
            />
            <Button
              btnName={expanded && "Stats"}
              hasIcon
              iconPicked={"info"}
              classNameExtra={expanded ? "justify-start" : "justify-center"}
              btnType={"primary"}
            />
          </nav>
        </div>

        {/* Footer */}
        <div className="w-full ">
          <Button
            btnName={expanded && "Logout"}
            hasIcon
            iconPicked={"setting"}
            classNameExtra={
              expanded ? "justify-start w-full" : "justify-center w-full"
            }
            btnType={"primary"}
            onClick={handleLogout}
          />
        </div>
      </aside>
    </>
  );
}

export default NavMenu;
