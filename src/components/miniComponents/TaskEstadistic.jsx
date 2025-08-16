// src/components/miniComponents/TaskEstadistic.jsx
import React, { useContext, useMemo } from "react";
import { StatsContext } from "../../context/StatsContext";
//import "../../styles/taskEstadistic.css";

function StatCard({ label, value, colorVar, icon }) {
  return (
    <div
      className="stat-card rounded-4"
      style={{
        border: `1px solid var(${colorVar}, #334155)`,
        backgroundColor: `color-mix(in srgb, var(${colorVar}, #334155) 12%, transparent)`,
        padding: "1rem",
        flex: 1,
        minWidth: 140,
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: ".75rem",
        alignItems: "center",
      }}
      aria-label={`${label}: ${value}`}
      title={`${label}: ${value}`}
    >
      <div
        style={{
          width: 42,
          height: 42,
          display: "grid",
          placeItems: "center",
          borderRadius: 12,
          background: `color-mix(in srgb, var(${colorVar}, #334155) 18%, transparent)`,
          color: `var(${colorVar}, #e2e8f0)`,
          fontSize: 22,
          fontWeight: 800,
        }}
      >
        {icon}
      </div>
      <div style={{ lineHeight: 1 }}>
        <div style={{ color: "#94a3b8", fontSize: 13 }}>{label}</div>
        <div
          style={{
            color: `var(${colorVar}, #e2e8f0)`,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: 0.5,
          }}
        >
          {value ?? 0}
        </div>
      </div>
    </div>
  );
}

function CombinedBar({ completed = 0, pending = 0, missed = 0 }) {
  const total = completed + pending + missed;
  const pct = (v) => (total > 0 ? (v / total) * 100 : 0);

  return (
    <div className="combined-slider-container" style={{ marginTop: 12 }}>
      <div
        className="slider-segment"
        style={{
          width: `${pct(completed)}%`,
          backgroundColor: "var(--primaryBlue, #38bdf8)",
        }}
        title={`Completed: ${completed} (${pct(completed).toFixed(0)}%)`}
      />
      <div
        className="slider-segment"
        style={{
          width: `${pct(pending)}%`,
          backgroundColor: "var(--warningActionsYellow, #f59e0b)",
        }}
        title={`Pending: ${pending} (${pct(pending).toFixed(0)}%)`}
      />
      <div
        className="slider-segment"
        style={{
          width: `${pct(missed)}%`,
          backgroundColor: "var(--dangerActionsRed, #ef4444)",
        }}
        title={`Missed: ${missed} (${pct(missed).toFixed(0)}%)`}
      />
      {total === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#94a3b8",
            fontSize: 12,
          }}
        >
          No data yet
        </div>
      )}
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

  return (
    <div className="stadisticDiv" style={{ display: "grid", gap: 12 }}>
      <div
        className="stadistics"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
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
