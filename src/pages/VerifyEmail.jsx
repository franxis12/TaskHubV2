// src/pages/VerifyEmail.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { auth } from "../firebaseConfig";
import { sendEmailVerification } from "firebase/auth";

function VerifyEmail() {
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

  // Autochequeo cada 5s
  useEffect(() => {
    const id = setInterval(async () => {
      if (!auth.currentUser) return;
      try {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          navigate("/dashboard");
        }
      } catch {}
    }, 5000);
    return () => clearInterval(id);
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
    <div style={st.page}>
      <div style={st.card}>
        <h1 style={st.title}>Verifica tu correo</h1>
        <p style={st.lead}>Te enviamos un enlace de verificación a:</p>
        <div style={st.badge}>{email || "—"}</div>

        <div style={st.infoBox}>
          <ul style={st.list}>
            <li>Abre el correo y haz clic en “Verificar”.</li>
            <li>Si no lo ves, revisa la carpeta de spam.</li>
            <li>Puedes reenviar el correo o refrescar el estado aquí mismo.</li>
          </ul>
        </div>

        {message && <div style={st.message}>{message}</div>}

        <div style={st.actions}>
          <button
            onClick={handleResend}
            disabled={sending || cooldown > 0}
            style={{
              ...st.primaryBtn,
              opacity: sending || cooldown > 0 ? 0.7 : 1,
              cursor: sending || cooldown > 0 ? "not-allowed" : "pointer",
            }}
          >
            {sending
              ? "Enviando..."
              : cooldown > 0
              ? `Reenviar en ${cooldown}s`
              : "Reenviar correo"}
          </button>
          <button
            onClick={checkNow}
            disabled={checking}
            style={{
              ...st.secondaryBtn,
              opacity: checking ? 0.7 : 1,
              cursor: checking ? "wait" : "pointer",
            }}
          >
            {checking ? "Revisando..." : "Ya verifiqué, refrescar"}
          </button>
        </div>

        <div style={st.footerRow}>
          <button onClick={handleLogout} style={st.linkBtn}>
            Cerrar sesión
          </button>
          <button onClick={() => navigate("/login")} style={st.linkBtn}>
            ← Volver al login
          </button>
        </div>
      </div>
    </div>
  );
}

const st = {
  page: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    background: "var(--pagesBackground)",
    color: "var(--textColor)",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "var(--componentsBG)",
    border: "1px solid var(--boderComponents)",
    borderRadius: 16,
    boxShadow: "var(--shadowComponents)",
    padding: 20,
    display: "grid",
    gap: 12,
  },
  title: { margin: 0, fontSize: 24 },
  lead: { margin: 0, opacity: 0.9 },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid var(--borderBlue)",
    background: "var(--primaryBlueTransparent)",
    color: "var(--textColor)",
    fontWeight: 600,
    width: "fit-content",
  },
  infoBox: {
    border: "1px solid var(--boderComponents)",
    borderRadius: 12,
    padding: 12,
    background: "transparent",
  },
  list: { margin: 0, paddingLeft: 18, lineHeight: 1.6, opacity: 0.95 },
  message: {
    background: "#1f2937",
    color: "#c7f9cc",
    border: "1px solid #16a34a",
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 14,
  },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 },
  primaryBtn: {
    background: "var(--primaryBlue)",
    color: "#000",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontWeight: 800,
    boxShadow: "var(--shadowComponents)",
  },
  secondaryBtn: {
    background: "transparent",
    color: "var(--textColor)",
    border: "1px solid var(--borderBlue)",
    borderRadius: 10,
    padding: "10px 16px",
    fontWeight: 700,
  },
  footerRow: {
    marginTop: 6,
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
  },
  linkBtn: {
    background: "transparent",
    color: "var(--primaryBlue)",
    border: "none",
    padding: 0,
    textDecoration: "underline",
    cursor: "pointer",
  },
};

export default VerifyEmail;
