// src/components/TeamMembers.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { UserContext } from "../context/UserContext";

import samplePhoto from "../assets/sample.png";

function TeamMembers({ tasks = [], onMemberClick }) {
  const { user } = useContext(UserContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar miembros de la compañía en vivo
  useEffect(() => {
    if (!user?.companyId) return;
    const q = query(
      collection(db, "users"),
      where("companyId", "==", user.companyId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data() || {};
        const name =
          `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
          data.displayName ||
          "Sin nombre";
        return {
          uid: d.id,
          name,
          photo: data.photo || samplePhoto,
          role: data.role || "member",
          email: data.email || "",
        };
      });
      setMembers(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Map de conteos si recibimos tasks como prop
  const assignedMap = useMemo(() => {
    if (!Array.isArray(tasks) || tasks.length === 0) return {};
    const map = {};
    for (const t of tasks) {
      if (t?.assignedTo) {
        map[t.assignedTo] = map[t.assignedTo] || { tasks: 0, subtasks: 0 };
        map[t.assignedTo].tasks += 1;
      }
      if (Array.isArray(t?.subTasks)) {
        for (const st of t.subTasks) {
          const uid = st?.assignedTo;
          if (!uid) continue;
          map[uid] = map[uid] || { tasks: 0, subtasks: 0 };
          map[uid].subtasks += 1;
        }
      }
    }
    return map;
  }, [tasks]);

  return (
    <div className="w-full">
      {/* Título del bloque (ligero, sin tocar tus estilos globales) */}
      <div className="flex items-start justify-between col-span-3 p-2 shadowBottom divTitle ">
        <h3 className="font-semibold ml-3 mt-2">Team Members</h3>
      </div>

      {/* Lista */}
      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {loading ? (
          <div className="flex min-h-40 w-full items-center justify-center rounded-xl border bg-[var(--componentsBG)] col-span-full">
            <h3 className="text-lg font-medium text-slate-700">
              Cargando miembros…
            </h3>
          </div>
        ) : members.length === 0 ? (
          <div className="flex min-h-40 w-full items-center justify-center rounded-xl border bg-[var(--componentsBG)] col-span-full">
            <h3 className="text-lg font-medium text-slate-700">
              No hay miembros
            </h3>
          </div>
        ) : (
          members.map((m) => {
            const counts = assignedMap[m.uid] || { tasks: 0, subtasks: 0 };
            return (
              <button
                key={m.uid}
                type="button"
                onClick={() => onMemberClick?.(m.uid)}
                className="w-full rounded-xl border bg-[var(--componentsBG)] p-3 text-left hover:shadow-sm transition-shadow"
                title={m.email || m.name}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={m.photo || samplePhoto}
                    alt={m.name}
                    className="h-12 w-12 rounded-full border-2 border-blue-500 object-cover"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {m.name}
                    </div>
                    <div className="text-xs text-slate-500 capitalize truncate">
                      {m.role}
                    </div>
                  </div>
                </div>

                {/* Métricas simples (solo si llegan tasks) */}
                {Array.isArray(tasks) && tasks.length > 0 && (
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                    <span className="rounded-full border px-2 py-0.5 bg-white">
                      Tareas: <b>{counts.tasks}</b>
                    </span>
                    <span className="rounded-full border px-2 py-0.5 bg-white">
                      Sub-tasks: <b>{counts.subtasks}</b>
                    </span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TeamMembers;
