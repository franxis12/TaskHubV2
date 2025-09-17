// src/pages/VerifyEmail.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { auth } from "../auth/firebaseConfig";
import { sendEmailVerification } from "firebase/auth";

function VerifyEmail() {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  const user = auth.currentUser;
  const email = useMemo(() => user?.email ?? "", [user?.email]);

  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds to resend

  // If there is no user, redirect to login
  useEffect(() => {
    if (!auth.currentUser) navigate("/login");
  }, [navigate]);

  // Auto-check every 5s
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

  // Cooldown timer
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
          "Your email is not verified yet. Check your inbox or resend the link."
        );
      }
    } catch (e) {
      setMessage("Could not check status. Try again.");
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
      setMessage("Verification email sent. Check your inbox (and spam). ");
      setCooldown(30); // 30s wait before resending
    } catch (e) {
      setMessage("Error resending email. Try again later.");
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
        <h1 style={st.title}>Verify your email</h1>
        <p style={st.lead}>We sent a verification link to:</p>
        <div style={st.badge}>{email || "—"}</div>

        <div style={st.infoBox}>
          <ul style={st.list}>
            <li>Open the email and click “Verify”.</li>
            <li>If you don't see it, check your spam folder.</li>
            <li>You can resend the email or refresh the status here.</li>
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
              ? "Sending..."
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend email"}
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
            {checking ? "Checking..." : "I've verified, refresh"}
          </button>
        </div>

        <div style={st.footerRow}>
          <button onClick={handleLogout} style={st.linkBtn}>
            Log out
          </button>
          <button onClick={() => navigate("/login")} style={st.linkBtn}>
            ← Back to login
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
