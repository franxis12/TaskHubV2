// src/components/TeamMembers.jsx
//import { useMemo } from "react";
import React, { useEffect, useState, useContext } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";
import { UserContext } from "../context/UserContext";
import { myImage, SVGIcons } from "../importFiles/imports";
import { tailwindClass } from "../importFiles/tailwindStyles";
import MemberMiniStats from "./MemberMiniStats";
import Button from "../Utils/Button";

function TeamMembers({
  tasks = [],
  onMemberClick,
  tap,
  setTap,
  mobile,

  setChatVisivility,
  chatVisivility,
}) {
  const { user } = useContext(UserContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live-load company members
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
          photo: data.photo || myImage.defaultUser,
          role: data.role || "member",
          email: data.email || "",
        };
      });
      setMembers(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleChatVisivility = () => {
    setChatVisivility();
    setTap("team");
  };

  // Counts map if tasks are passed as prop
  /*const assignedMap = useMemo(() => {
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
  }, [tasks]);*/

  // (Per-member stats moved to MemberMiniStats)

  return (
    <div className="flex flex-col p-2 col-span-3">
      {/* Block title (lightweight, without touching global styles) */}
      <div className="w-full flex justify-between h-12 ">
        <h3 className="font-semibold ml-3 mt-2">Team members</h3>
        {!chatVisivility && (
          <Button
            icon={SVGIcons.chat}
            color={"iconGreen"}
            onClick={handleChatVisivility}
          />
        )}
      </div>

      {/* List */}
      <div className="flex   gap-2 flex-col ">
        {loading ? (
          <div className="w-full flex items-center justify-center h-full">
            <h3 className="text-lg font-medium text-slate-700">
              Loading members…
            </h3>
          </div>
        ) : members.length === 0 ? (
          <div className="w-full flex items-center justify-center h-full">
            <h3 className="text-lg font-medium text-slate-700">No members</h3>
          </div>
        ) : (
          members.map((m) => {
            //const counts = assignedMap[m.uid] || { tasks: 0, subtasks: 0 };
            return (
              <button
                key={m.uid}
                type="button"
                onClick={() => onMemberClick?.(m.uid)}
                className={`w-full h-25
                   md:w-full rounded-3xl border border-slate-600/40  p-2 text-left hover:shadow-sm transition-shadow flex justify-between `}
                title={m.email || m.name}
              >
                <div className="flex items-center gap-3 ">
                  <img
                    src={m.photo || myImage.defaultUser}
                    alt={m.name}
                    className="h-12 w-12 rounded-full border-2 border-blue-500 object-cover"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--textColor)] truncate">
                      {m.name}
                    </div>
                    <div
                      className={
                        m.role === "admin"
                          ? tailwindClass.accountType.admin
                          : tailwindClass.accountType.member
                      }
                    >
                      {m.role}
                    </div>
                  </div>
                </div>

                {/* Simple metrics (only if tasks are provided)
                {Array.isArray(tasks) && tasks.length > 0 && (
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                    <span className="rounded-full border px-2 py-0.5 bg-white">
                      Tasks: <b>{counts.tasks}</b>
                    </span>
                    <span className="rounded-full border px-2 py-0.5 bg-white">
                      Sub-tasks: <b>{counts.subtasks}</b>
                    </span>
                  </div>
                )}*/}
                {/* Mini bars (separate component) */}
                <MemberMiniStats
                  tasks={tasks}
                  memberId={m.uid}
                  scope="public"
                  includeSubtasks={true}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TeamMembers;
