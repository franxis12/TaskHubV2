// src/components/miniComponents/TaskEstadistic.jsx
import React, { useContext, useMemo } from "react";
import { StatsContext } from "../context/StatsContext";

function StatCard({ label, value, colorVar, icon }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl border p-2 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
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

      <div className="flex items-baseline gap-2 leading-none whitespace-nowrap">
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

  // Solo las tarjetas (sin la barra combinada)
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
    </div>
  );
}
