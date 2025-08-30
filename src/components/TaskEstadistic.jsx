// src/components/TaskEstadistic.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { StatsContext } from "../context/StatsContext";
import { UserContext } from "../context/UserContext";
import { db } from "../auth/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import samplePhoto from "../assets/sample.png";

function pickPhoto(obj) {
  if (!obj) return "";
  return (
    obj.photo ||
    obj.photoURL ||
    obj.avatar ||
    obj.image ||
    obj.picture ||
    obj.url ||
    ""
  );
}

export default function TaskEstadistic() {
  const stats = useContext(StatsContext);
  const { user } = useContext(UserContext);

  // Pestaña activa: team / company / personal
  const [view, setView] = useState("company"); // por defecto "company"

  // --- Stats del usuario actual (de tus contextos) ---
  const companyStats = useMemo(() => {
    return (
      stats?.company || {
        completed: 0,
        pending: 0,
        missed: 0,
      }
    );
  }, [stats]);
  const personalStats = useMemo(() => {
    return (
      stats?.personal || {
        completed: 0,
        pending: 0,
        missed: 0,
      }
    );
  }, [stats]);

  // --- Suscripción a TODOS los usuarios de la misma compañía para sumar COMPANY ---
  const [members, setMembers] = useState([]); // [{photo, company:{completed,pending,missed}}]
  useEffect(() => {
    if (!user?.companyId) {
      setMembers([]);
      return;
    }
    const qUsers = query(
      collection(db, "users"),
      where("companyId", "==", user.companyId)
    );
    const unsub = onSnapshot(qUsers, (snap) => {
      const arr = snap.docs.map((d) => {
        const data = d.data() || {};
        const photo = pickPhoto(data) || samplePhoto;
        const comp = data?.stats?.company || {
          completed: 0,
          pending: 0,
          missed: 0,
        };
        return { photo, company: comp };
      });
      setMembers(arr);
    });
    return () => unsub();
  }, [user?.companyId]);

  // TEAM = suma de TODAS las company de todos los miembros (incluye al usuario)
  const teamCompanySum = useMemo(() => {
    return members.reduce(
      (acc, m) => ({
        completed: acc.completed + Number(m.company?.completed || 0),
        pending: acc.pending + Number(m.company?.pending || 0),
        missed: acc.missed + Number(m.company?.missed || 0),
      }),
      { completed: 0, pending: 0, missed: 0 }
    );
  }, [members]);

  // Escoger stats según la pestaña
  const activeStats = useMemo(() => {
    if (view === "team") return teamCompanySum; // TODAS las de company de todos
    if (view === "company")
      return {
        completed: Number(companyStats.completed || 0), // SOLO company del usuario
        pending: Number(companyStats.pending || 0),
        missed: Number(companyStats.missed || 0),
      };
    // personal: SOLO personales del usuario
    return {
      completed: Number(personalStats.completed || 0),
      pending: Number(personalStats.pending || 0),
      missed: Number(personalStats.missed || 0),
    };
  }, [view, teamCompanySum, companyStats, personalStats]);

  const completed = Number(activeStats.completed || 0);
  const pending = Number(activeStats.pending || 0);
  const missed = Number(activeStats.missed || 0);

  const total = Math.max(1, completed + pending + missed);
  const pct = {
    completed: Math.round((completed / total) * 100),
    pending: Math.round((pending / total) * 100),
    missed: Math.round((missed / total) * 100),
  };

  // Avatares
  const userAvatar = pickPhoto(user) || samplePhoto;

  // Fotos del equipo para collage/stack
  const teamPhotosRaw = members.map((m) => m.photo || samplePhoto);
  const gridPhotos = useMemo(() => {
    const base = teamPhotosRaw.slice(0, 4);
    if (base.length < 4) {
      const fill = Array.from({ length: 4 - base.length }, () => samplePhoto);
      return [...base, ...fill];
    }
    return base;
  }, [teamPhotosRaw]);
  const stackPhotos = teamPhotosRaw.slice(0, 6);
  const extra = Math.max(0, teamPhotosRaw.length - stackPhotos.length);

  return (
    <div className="flex flex-col gap-2 col-span-12 ">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 p-3 shadowBottom ">
        <h3 className="text-lg font-semibold">Stats</h3>

        {/* Toggle Team / Company / Personal */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-full ${
              view === "team"
                ? "bg-black text-white"
                : "bg-white text-slate-800"
            }`}
            onClick={() => setView("team")}
            title="Todas las tareas Company de todos los miembros"
          >
            Team
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-full ${
              view === "company"
                ? "bg-black text-white"
                : "bg-white text-slate-800"
            }`}
            onClick={() => setView("company")}
            title="Solo tus tareas Company"
          >
            Company
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-full ${
              view === "personal"
                ? "bg-black text-white"
                : "bg-white text-slate-800"
            }`}
            onClick={() => setView("personal")}
            title="Solo tus tareas Personales"
          >
            Personal
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-12 gap-3 h-full items-center p-3  ">
        {/* Barras (col 8) */}
        <div className="col-span-7 h-full flex items-end  w-full gap-2">
          {/* Complete (teal) */}
          <div className="flex flex-col items-center  justify-end h-full  rounded-3xl  w-full min-w-5 ">
            <span className="font-extrabold text-md text-[var(--greenMain)]">
              {completed}
            </span>
            <div
              className="w-full min-w-5 max-w-16 rounded-3xl bg-teal  transition-height duration-500 ease-in-out "
              style={{ height: `${pct.completed}%` }}
              title={`Complete: ${pct.completed}%`}
              aria-label={`Complete: ${pct.completed}%`}
            />
          </div>

          {/* Pending (yellow) */}
          <div className="flex flex-col items-center justify-end h-full  rounded-3xl  w-full min-w-5 ">
            <span className="font-extrabold text-md text-[var(--yellow)]">
              {pending}
            </span>

            <div
              className="w-full min-w-5 max-w-16 rounded-3xl bg-yellow  transition-height duration-500 ease-in-out"
              style={{ height: `${pct.pending}%` }}
              title={`Pending: ${pct.pending}%`}
              aria-label={`Pending: ${pct.pending}%`}
            />
          </div>

          {/* Missed (orange) */}
          <div className="flex flex-col items-center justify-end h-full rounded-3xl w-full min-w-5 ">
            <span className="font-extrabold text-md text-[var(--orange)]">
              {missed}
            </span>

            <div
              className="w-full min-w-5 max-w-16  rounded-3xl bg-orange  transition-height duration-500 ease-in-out"
              style={{ height: `${pct.missed}%` }}
              title={`Missed: ${pct.missed}%`}
              aria-label={`Missed: ${pct.missed}%`}
            />
          </div>
        </div>

        {/* Avatar / Collage + leyenda (col 4) */}
        <div className="col-span-5  h-full flex flex-col items-center justify-between gap-4 w-full  ">
          {/* Contenedor circular con borde teal */}
          <div
            className={`p-1 border-teal-2 transition-all duration-500 ease-in-out
                   ${
                     view === "team" ? "rounded-3xl" : "rounded-[50%]"
                   } overflow-hidden aspect-square object-contain`}
          >
            {view === "personal" || view === "company" ? (
              <img
                src={userAvatar}
                alt="user"
                className={`h-28 w-28 object-cover bg-white transition-all duration-500 ease-in-out
                   ${
                     view === "team" ? "rounded-3xl" : "rounded-[50%]"
                   } object-contain`}
              />
            ) : (
              <div
                className={`h-28 w-28 overflow-hidden bg-white flex flex-wrap transition-all duration-500 ease-in-out
                    ${
                      view === "team" ? "rounded-3xl" : "rounded-[50%]"
                    }  object-contain`}
              >
                {gridPhotos.map((src, i) => (
                  <img
                    key={`g${i}`}
                    src={src || samplePhoto}
                    alt={`member ${i + 1}`}
                    className="h-1/2 w-1/2 object-contain "
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stack de avatares (Team y Company) */}
          {(view === "team" || view === "company") &&
            stackPhotos.length > 0 && (
              <div className="flex items-center -space-x-3">
                {stackPhotos.map((src, i) => (
                  <img
                    key={`s${i}`}
                    src={src || samplePhoto}
                    alt={`member ${i + 1}`}
                    className="h-8 w-8 rounded-full border-2 border-white shadow"
                  />
                ))}
                {extra > 0 && (
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 text-slate-700 text-[11px] font-semibold grid place-items-center shadow">
                    +{extra}
                  </div>
                )}
              </div>
            )}

          {/* Leyenda */}
          <div className="w-full grid grid-cols-2 gap-x-2 gap-y-1 min-w-30">
            <div className="text-sm text-[var(--orange)] font-semibold  ">
              Missed
            </div>
            <div className="flex items-center justify-end gap-2 ">
              <span className="text-sm">{pct.missed}%</span>
              <span className="inline-block h-3 w-3 rounded-full bg-orange" />
            </div>

            <div className="text-sm text-[var(--yellow)] font-semibold">
              Pending
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm">{pct.pending}%</span>
              <span className="inline-block h-3 w-3 rounded-full bg-yellow" />
            </div>

            <div className="text-sm text-[var(--greenMain)] font-semibold">
              Complete
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm">{pct.completed}%</span>
              <span className="inline-block h-3 w-3 rounded-full bg-[var(--greenMain)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
