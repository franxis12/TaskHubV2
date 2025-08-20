// src/components/NavMenu.jsx
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import logoFallback from "../assets/company-logo.png";
import Button from "../Utils/Button";

function NavMenu() {
  const { user } = useContext(UserContext);
  const [logoUrl, setLogoUrl] = useState(logoFallback);
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Suscripción al logo en vivo (solo DB)
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

  // Tracking de ancho de pantalla
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobile(window.innerWidth < 700);
    onResize(); // set inicial
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fijar expandido/colapsado según el modo
  useEffect(() => {
    setExpanded(!isMobile); // en mobile => false (colapsado), desktop => true
  }, [isMobile]);

  const widthClass = expanded ? "w-45 p-3" : "w-16 p-2";

  return (
    <aside
      className={`sticky left-0 top-0 h-screen ${widthClass} shrink-0
                  flex flex-col justify-between overflow-y-auto overflow-x-hidden
                  bg-base-100 transition-all duration-300 ease-in-out`}
      aria-expanded={expanded}
    >
      {/* Encabezado: logo + toggle */}
      <div className="relative ">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="absolute -right-2 top-1 btn btn-xs btn-ghost border border-base-300 rounded-full"
          aria-label={expanded ? "Collapse menu" : "Expand menu"}
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? "x" : "⟩"}
        </button>

        <div
          className={`flex flex-col ${
            expanded ? "items-start gap-3" : "items-center justify-center"
          } mb-4`}
        >
          <img
            src={logoUrl || logoFallback}
            alt="Company logo"
            className={`object-contain ${
              expanded ? "h-12 w-30" : "h-10 w-10 hidden"
            } rounded-md`}
          />
          {expanded && (
            <div className="leading-tight">
              <h1 className="text-xl font-bold">Welcome to Taskitin</h1>
              <span className="block text-xs text-slate-500">
                {user?.companyId || "No companyId assigned"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Menú */}
      <nav className="w-full gap-2 flex flex-col">
        <Button
          btnName={expanded && "Dashboard"}
          hasIcon
          iconPicked={"dashboard"}
          classNameExtra={expanded ? "justify-start" : "justify-center"}
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

      {/* Footer */}
      <div className="w-full">
        <button className="btn btn-ghost w-full justify-start gap-2">
          <span className="h-5 w-5 inline-block">⚙️</span>
          {expanded && "Settings"}
        </button>
      </div>
    </aside>
  );
}

export default NavMenu;
