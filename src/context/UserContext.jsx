// src/context/UserContext.jsx
import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { auth, db } from "../auth/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // datos combinados: auth + firestore
  const [loading, setLoading] = useState(true); // bloquea UI hasta resolver estado inicial

  // Guarda el último unsubscribe del userDoc para limpiarlo al cambiar de cuenta
  const [unsubUserDoc, setUnsubUserDoc] = useState(null);

  // Forzar recarga manual del doc de usuario (útil después de un flow que lo modifique)
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setUser((prev) => ({
        uid,
        email: auth.currentUser.email,
        emailVerified: !!auth.currentUser.emailVerified,
        ...snap.data(),
      }));
    }
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Limpia listener previo del doc si había
      if (unsubUserDoc) {
        unsubUserDoc();
        setUnsubUserDoc(null);
      }

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const uid = firebaseUser.uid;
      const email = firebaseUser.email || "";
      const emailVerified = !!firebaseUser.emailVerified;

      // Suscríbete en tiempo real al doc de usuario
      const ref = doc(db, "users", uid);

      // Asegura doc base si no existe (evita nulls en la app)
      const snapOnce = await getDoc(ref);
      if (!snapOnce.exists()) {
        await setDoc(
          ref,
          {
            // mínimos necesarios para tu app
            firstName: "",
            lastName: "",
            role: "member",
            companyId: "",
            photo: "",
            createdAt: serverTimestamp(),
            stats: {
              company: { completed: 0, pending: 0, missed: 0 },
              personal: { completed: 0, pending: 0, missed: 0 },
            },
          },
          { merge: true }
        );
      }

      const unsub = onSnapshot(
        ref,
        (snap) => {
          const data = snap.data() || {};
          setUser({
            uid,
            email,
            emailVerified,
            ...data,
          });
          setLoading(false);
        },
        (err) => {
          console.error("onSnapshot(users/{uid}) error:", err);
          // si falla, al menos deja pasar la UI con lo que tengamos
          setUser({
            uid,
            email,
            emailVerified,
            ...snapOnce.data(),
          });
          setLoading(false);
        }
      );

      setUnsubUserDoc(() => unsub);
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // se inicializa una vez

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      setUser(null);
      if (unsubUserDoc) {
        unsubUserDoc();
        setUnsubUserDoc(null);
      }
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshUser,
      logout,
    }),
    [user, loading, refreshUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
