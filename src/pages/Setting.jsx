// src/pages/VerifyEmail.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { auth } from "../firebaseConfig";
//import { sendEmailVerification } from "firebase/auth";

function Setting() {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  const user = auth.currentUser;
  const email = useMemo(() => user?.email ?? "", [user?.email]);

  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // segs para reenviar

  // Si no hay usuario, manda a login
  useEffect(() => {
    if (!auth.currentUser) navigate("/login");
  }, [navigate]);

  // Temporizador de cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const checkNow = async () => {
    if (!auth.currentUser) return;
    setChecking(true);
    setMessage("");
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        navigate("/dashboard");
      } else {
        setMessage(
          "Aún no está verificado. Revisa tu correo o reenvía el enlace."
        );
      }
    } catch (e) {
      setMessage("No se pudo revisar el estado. Intenta de nuevo.");
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (!auth.currentUser || cooldown > 0) return;
    setSending(true);
    setMessage("");
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage(
        "Correo de verificación reenviado. Revisa tu bandeja (y spam)."
      );
      setCooldown(30); // 30s de espera para reenviar
    } catch (e) {
      setMessage("Error al reenviar el correo. Intenta más tarde.");
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <div>
      <h1>Setting</h1>
      <button className="btn" onClick={() => navigate("/dashboard")}>
        Dash
      </button>
    </div>
  );
}

export default Setting;
