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
  const [user, setUser] = useState(null); // combined: auth + Firestore user doc
  const [loading, setLoading] = useState(true); // gate UI until initial state is resolved

  // Keep last userDoc unsubscribe to cleanup on account change
  const [unsubUserDoc, setUnsubUserDoc] = useState(null);

  // Force manual reload of the user doc (useful after flows that modify it)
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
      // Cleanup previous doc listener if present
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

      // Subscribe to the user doc in realtime
      const ref = doc(db, "users", uid);

      // Do not create a base doc here to avoid race conditions
      // with the registration flow which writes the complete data.
      const snapOnce = await getDoc(ref);

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
          // If it fails, at least allow the UI with what we have
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
  }, []); // initialize once

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
