// src/components/TaskEstadistic.jsx
import React, { useContext, useMemo, useState } from "react";
import { StatsContext } from "../context/StatsContext";
import samplePhoto from "../assets/sample.png";

export default function TaskEstadistic() {
  const stats = useContext(StatsContext);

  // Datos (team / you). Si no hay 'me' en el contexto, caer a 'company'.
  const team = stats?.company || { completed: 0, pending: 0, missed: 0 };
  const me = stats?.me ||
    stats?.user || {
      completed: team.completed,
      pending: team.pending,
      missed: team.missed,
    };

  const [view, setView] = useState("you"); // "you" por defecto como en el mock

  const { completed, pending, missed } = useMemo(() => {
    const src = view === "you" ? me : team;
    return {
      completed: Number(src?.completed || 0),
      pending: Number(src?.pending || 0),
      missed: Number(src?.missed || 0),
    };
  }, [view, me, team]);

  const total = Math.max(1, completed + pending + missed);
  const pct = {
    completed: Math.round((completed / total) * 100),
    pending: Math.round((pending / total) * 100),
    missed: Math.round((missed / total) * 100),
  };

  const avatar =
    stats?.me?.photo || stats?.user?.photo || stats?.photo || samplePhoto;

  return (
    <div className="w-full col-span-3 rounded-2xl p-3  ring-1 ring-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Stats</h3>

        {/* Toggle Team / You */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-full ${
              view === "team"
                ? "bg-black text-white"
                : "bg-white text-slate-800"
            }`}
            onClick={() => setView("team")}
          >
            Team
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-full ${
              view === "you" ? "bg-black text-white" : "bg-white text-slate-800"
            }`}
            onClick={() => setView("you")}
          >
            You
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-12 gap-3 h-full items-center">
        {/* Barras (col 8) */}
        <div className="col-span-8">
          <div className="flex items-end gap-6 h-56 rounded-2xl p-3 ">
            {/* Complete (teal) */}
            <div className="flex flex-col justify-end h-full">
              <div
                className="w-16 rounded-3xl bg-teal"
                style={{ height: `${pct.completed}%` }}
                title={`Complete: ${pct.completed}%`}
                aria-label={`Complete: ${pct.completed}%`}
              />
            </div>

            {/* Pending (yellow) */}
            <div className="flex flex-col justify-end h-full">
              <div
                className="w-16 rounded-3xl bg-yellow"
                style={{ height: `${pct.pending}%` }}
                title={`Pending: ${pct.pending}%`}
                aria-label={`Pending: ${pct.pending}%`}
              />
            </div>

            {/* Missed (orange) */}
            <div className="flex flex-col justify-end h-full">
              <div
                className="w-16 rounded-3xl bg-orange"
                style={{ height: `${pct.missed}%` }}
                title={`Missed: ${pct.missed}%`}
                aria-label={`Missed: ${pct.missed}%`}
              />
            </div>
          </div>
        </div>

        {/* Avatar + leyenda (col 4) */}
        <div className="col-span-4">
          <div className="flex flex-col items-center gap-4">
            {/* Avatar con borde teal */}
            <div className="p-1 rounded-full border-teal-2">
              <img
                src={avatar}
                alt="user"
                className="h-28 w-28 rounded-full object-cover"
              />
            </div>

            {/* Leyenda */}
            <div className="w-full grid grid-cols-2 gap-x-2 gap-y-1">
              <div className="text-sm">Missed</div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm">{pct.missed}%</span>
                <span className="inline-block h-3 w-3 rounded-full bg-orange" />
              </div>

              <div className="text-sm">Pending</div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm">{pct.pending}%</span>
                <span className="inline-block h-3 w-3 rounded-full bg-yellow" />
              </div>

              <div className="text-sm">Complete</div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm">{pct.completed}%</span>
                <span className="inline-block h-3 w-3 rounded-full bg-teal" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
