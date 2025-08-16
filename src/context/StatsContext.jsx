// src/context/StatsContext.jsx
import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { UserContext } from "../context/UserContext";
import { db } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";

export const StatsContext = createContext(null);

// Hook de conveniencia
export function useStats() {
  return useContext(StatsContext);
}

export function StatsProvider({ children }) {
  const { user } = useContext(UserContext);

  // Flags
  const [loading, setLoading] = useState(true);

  // Company stats (dashboard “compañía” del usuario)
  const [cCompleted, setCCompleted] = useState(0);
  const [cPending, setCPending] = useState(0);
  const [cMissed, setCMissed] = useState(0);

  // Personal stats (del propio usuario)
  const [pCompleted, setPCompleted] = useState(0);
  const [pPending, setPPending] = useState(0);
  const [pMissed, setPMissed] = useState(0);

  useEffect(() => {
    // si no hay usuario, resetea y marca listo
    if (!user?.uid) {
      setCCompleted(0); setCPending(0); setCMissed(0);
      setPCompleted(0); setPPending(0); setPMissed(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data() || {};
        const stats = data.stats || {};

        const company = stats.company || {};
        setCCompleted(company.completed || 0);
        setCPending(company.pending || 0);
        setCMissed(company.missed || 0);

        const personal = stats.personal || {};
        setPCompleted(personal.completed || 0);
        setPPending(personal.pending || 0);
        setPMissed(personal.missed || 0);

        setLoading(false);
      },
      // si hay error (p.ej. reglas), no rompas la UI
      () => setLoading(false)
    );

    return () => unsub();
  }, [user?.uid]);

  // “Bumpers” opcionales: por defecto escriben al usuario actual,
  // pero puedes pasar un targetUid para ajustar el doc de otra persona (admin/acciones).
  const bumpCompany = async (field, delta = 1, targetUid = user?.uid) => {
    if (!targetUid) return;
    // Optimista solo si es el usuario actual
    if (targetUid === user?.uid) {
      if (field === "completed") setCCompleted((v) => v + delta);
      if (field === "pending") setCPending((v) => v + delta);
      if (field === "missed") setCMissed((v) => v + delta);
    }
    await updateDoc(doc(db, "users", targetUid), {
      [`stats.company.${field}`]: increment(delta),
    });
  };

  const bumpPersonal = async (field, delta = 1, targetUid = user?.uid) => {
    if (!targetUid) return;
    if (targetUid === user?.uid) {
      if (field === "completed") setPCompleted((v) => v + delta);
      if (field === "pending") setPPending((v) => v + delta);
      if (field === "missed") setPMissed((v) => v + delta);
    }
    await updateDoc(doc(db, "users", targetUid), {
      [`stats.personal.${field}`]: increment(delta),
    });
  };

  const value = useMemo(
    () => ({
      loading,
      company: {
        completed: cCompleted,
        pending: cPending,
        missed: cMissed,
        bump: bumpCompany,
      },
      personal: {
        completed: pCompleted,
        pending: pPending,
        missed: pMissed,
        bump: bumpPersonal,
      },
    }),
    [loading, cCompleted, cPending, cMissed, pCompleted, pPending, pMissed]
  );

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}