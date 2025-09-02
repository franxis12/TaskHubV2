// src/components/MemberMiniStats.jsx
import React, { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";

// Renderiza 3 barras verticales (completed, pending, missed)
// Fuente: users/{memberId}.stats.company (y opcionalmente .personal)
// scope: 'public' | 'personal' | 'all' (default 'public')
function MemberMiniStats({ memberId, scope = "public" }) {
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    if (!memberId) return;
    const ref = doc(db, "users", memberId);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() || {};
      setUserStats(data.stats || null);
    });
    return () => unsub();
  }, [memberId]);

  const { completed, pending, missed } = useMemo(() => {
    const s = userStats || {};
    const company = s.company || {}; // { completed, pending, missed }
    const personal = s.personal || {}; // opcional

    const toNum = (v) => Number(v || 0);
    if (scope === "public") {
      return {
        completed: toNum(company.completed),
        pending: toNum(company.pending),
        missed: toNum(company.missed),
      };
    }
    if (scope === "personal") {
      return {
        completed: toNum(personal.completed),
        pending: toNum(personal.pending),
        missed: toNum(personal.missed),
      };
    }
    // all: combina ambas si existen
    return {
      completed: toNum(company.completed) + toNum(personal.completed),
      pending: toNum(company.pending) + toNum(personal.pending),
      missed: toNum(company.missed) + toNum(personal.missed),
    };
  }, [userStats, scope]);

  const total = Math.max(1, completed + pending + missed);
  const pct = {
    completed: Math.round((completed / total) * 100),
    pending: Math.round((pending / total) * 100),
    missed: Math.round((missed / total) * 100),
  };

  return (
    <div className=" flex items-end h-3/4 md:h-full  gap-2 w-full max-w-30 ">
      {/* Completed (teal) */}
      <div className="flex flex-col items-center justify-end h-full w-full min-w-4">
        <span className="text-[10px] font-bold text-[var(--greenMain)]">
          {completed}
        </span>
        <div
          className="w-full max-w-10 rounded-xl bg-teal transition-height duration-300"
          style={{ height: `${pct.completed}%` }}
          title={`Complete: ${pct.completed}%`}
          aria-label={`Complete: ${pct.completed}%`}
        />
      </div>
      {/* Pending (yellow) */}
      <div className="flex flex-col items-center justify-end h-full w-full min-w-4">
        <span className="text-[10px] font-bold text-[var(--yellow)]">
          {pending}
        </span>
        <div
          className="w-full max-w-10 rounded-xl bg-yellow transition-height duration-300"
          style={{ height: `${pct.pending}%` }}
          title={`Pending: ${pct.pending}%`}
          aria-label={`Pending: ${pct.pending}%`}
        />
      </div>
      {/* Missed (orange) */}
      <div className="flex flex-col items-center justify-end h-full w-full min-w-4">
        <span className="text-[10px] font-bold text-[var(--orange)]">
          {missed}
        </span>
        <div
          className="w-full max-w-10 rounded-xl bg-orange transition-height duration-300"
          style={{ height: `${pct.missed}%` }}
          title={`Missed: ${pct.missed}%`}
          aria-label={`Missed: ${pct.missed}%`}
        />
      </div>
    </div>
  );
}

export default MemberMiniStats;
