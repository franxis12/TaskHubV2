// src/components/miniComponents/TaskEstadistic.jsx
import React, { useContext, useMemo } from "react";
import { StatsContext } from "../../context/StatsContext";

function StatCard({ label, value, colorVar, icon }) {
  return (
    <div
      className="grid grid-cols-[auto,1fr] items-center gap-3 rounded-xl border p-4 shadow-sm transition
                 hover:shadow-md hover:-translate-y-0.5"
      style={{
        borderColor: `var(${colorVar}, #334155)`,
        backgroundColor: `color-mix(in srgb, var(${colorVar}, #334155) 12%, transparent)`,
      }}
      aria-label={`${label}: ${value}`}
      title={`${label}: ${value}`}
    >
      <div
        className="grid h-[42px] w-[42px] place-items-center rounded-xl text-[22px] font-extrabold"
        style={{
          background: `color-mix(in srgb, var(${colorVar}, #334155) 18%, transparent)`,
          color: `var(${colorVar}, #e2e8f0)`,
        }}
      >
        {icon}
      </div>

      <div className="leading-none">
        <div className="text-[13px] text-slate-400">{label}</div>
        <div
          className="text-[28px] font-extrabold tracking-[0.5px]"
          style={{ color: `var(${colorVar}, #e2e8f0)` }}
        >
          {value ?? 0}
        </div>
      </div>
    </div>
  );
}

function CombinedBar({ completed = 0, pending = 0, missed = 0 }) {
  const total = completed + pending + missed;
  const pct = (v) => (total > 0 ? Math.max(0, (v / total) * 100) : 0);

  return (
    <div className="relative mt-3">
      <div className="h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
        {/* Completed */}
        <div
          className="h-full transition-all"
          style={{
            width: `${pct(completed)}%`,
            backgroundColor: "var(--primaryBlue, #38bdf8)",
          }}
          title={`Completed: ${completed} (${pct(completed).toFixed(0)}%)`}
        />
        {/* Pending (se apila encima con margen negativo igual al contenedor ya ocupado) */}
        <div
          className="h-full -mt-3 transition-all"
          style={{
            width: `${pct(pending) + pct(completed)}%`,
            background:
              "linear-gradient(to right, transparent " +
              `${pct(completed)}% , var(--warningActionsYellow, #f59e0b) ${pct(
                completed
              )}%)`,
          }}
          title={`Pending: ${pending} (${pct(pending).toFixed(0)}%)`}
        />
        {/* Missed */}
        <div
          className="-mt-3 h-full transition-all"
          style={{
            width: `${pct(missed) + pct(pending) + pct(completed)}%`,
            background:
              "linear-gradient(to right, transparent " +
              `${
                pct(pending) + pct(completed)
              }% , var(--dangerActionsRed, #ef4444) ${
                pct(pending) + pct(completed)
              }%)`,
          }}
          title={`Missed: ${missed} (${pct(missed).toFixed(0)}%)`}
        />
      </div>

      {total === 0 && (
        <div className="absolute inset-0 grid place-items-center text-[12px] text-slate-400">
          No data yet
        </div>
      )}

      {/* Leyenda compacta */}
      <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block h-2 w-2 rounded-sm"
            style={{ backgroundColor: "var(--primaryBlue, #38bdf8)" }}
          />
          Completed {pct(completed).toFixed(0)}%
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block h-2 w-2 rounded-sm"
            style={{ backgroundColor: "var(--warningActionsYellow, #f59e0b)" }}
          />
          Pending {pct(pending).toFixed(0)}%
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block h-2 w-2 rounded-sm"
            style={{ backgroundColor: "var(--dangerActionsRed, #ef4444)" }}
          />
          Missed {pct(missed).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export default function TaskEstadistic() {
  const stats = useContext(StatsContext);
  const company = stats?.company || { completed: 0, pending: 0, missed: 0 };

  const { completed, pending, missed } = useMemo(
    () => ({
      completed: company.completed || 0,
      pending: company.pending || 0,
      missed: company.missed || 0,
    }),
    [company.completed, company.pending, company.missed]
  );

  // Layout responsivo y respirado
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Completed"
          value={completed}
          colorVar="--primaryBlue"
          icon="✓"
        />
        <StatCard
          label="Pending"
          value={pending}
          colorVar="--warningActionsYellow"
          icon="•"
        />
        <StatCard
          label="Missed"
          value={missed}
          colorVar="--dangerActionsRed"
          icon="!"
        />
      </div>

      <CombinedBar completed={completed} pending={pending} missed={missed} />
    </div>
  );
}
