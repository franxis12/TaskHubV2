import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../auth/firebaseConfig";

function Login() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const canSubmit = emailValid && password.length >= 6 && !submitting;

  const errorFromCode = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "El correo no es válido.";
      case "auth/user-disabled":
        return "La cuenta está deshabilitada.";
      case "auth/user-not-found":
        return "No existe una cuenta con ese correo.";
      case "auth/wrong-password":
        return "Contraseña incorrecta.";
      case "auth/too-many-requests":
        return "Demasiados intentos. Intenta más tarde.";
      default:
        return "No se pudo iniciar sesión. Revisa tus datos e intenta de nuevo.";
    }
  };

  async function handleLogin(e) {
    e?.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(errorFromCode(err.code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1
            style={{ margin: 0, fontSize: "1.6rem", color: "var(--textColor)" }}
          >
            Iniciar sesión
          </h1>
          <p style={{ margin: 0, color: "var(--secondaryBlue)" }}>
            Bienvenido de vuelta a Task‑Hub
          </p>
        </div>

        {errorMsg && <div style={styles.alert}>{errorMsg}</div>}

        <form
          onSubmit={handleLogin}
          style={{ display: "grid", gap: "0.75rem" }}
        >
          <div>
            <label style={styles.label}>Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              style={styles.input}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label style={styles.label}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...styles.input, paddingRight: "3rem" }}
                autoComplete="current-password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                style={styles.eyeBtn}
                aria-label={
                  showPwd ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPwd ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <small style={{ color: "var(--secondaryBlue)" }}>
              Mínimo 6 caracteres.
            </small>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              ...styles.primaryBtn,
              opacity: canSubmit ? 1 : 0.6,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>¿No tienes cuenta?</span>
          <span style={styles.dividerLine} />
        </div>

        <button
          type="button"
          onClick={() => navigate("/register")}
          style={styles.secondaryBtn}
        >
          Crear cuenta
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          style={styles.linkBtn}
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    background: "var(--pagesBackground)",
    padding: "1rem",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "var(--componentsBG)",
    color: "var(--textColor)",
    border: "1px solid var(--boderComponents)",
    borderRadius: 16,
    padding: "1.5rem",
    boxShadow: "var(--shadowComponents)",
  },
  header: {
    marginBottom: "1rem",
    display: "grid",
    gap: "0.25rem",
  },
  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 14,
    color: "var(--secondaryBlue)",
  },
  input: {
    width: "100%",
    background: "var(--pagesBackground)",
    color: "var(--textColor)",
    border: "1px solid var(--boderComponents)",
    borderRadius: 10,
    padding: "0.75rem 0.9rem",
    outline: "none",
  },
  eyeBtn: {
    position: "absolute",
    right: 8,
    top: 6,
    height: 36,
    border: "1px solid var(--boderComponents)",
    background: "var(--pagesBackground)",
    color: "var(--textColor)",
    borderRadius: 8,
    padding: "0 0.6rem",
    cursor: "pointer",
  },
  primaryBtn: {
    width: "100%",
    padding: "0.8rem 1rem",
    background: "var(--primaryBlue)",
    color: "#000",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    boxShadow: "var(--shadowComponents)",
  },
  secondaryBtn: {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "transparent",
    color: "var(--textColor)",
    border: "1px solid var(--borderBlue)",
    borderRadius: 10,
    fontWeight: 600,
  },
  linkBtn: {
    width: "100%",
    marginTop: 8,
    background: "transparent",
    border: "none",
    color: "var(--primaryBlue)",
    cursor: "pointer",
    textDecoration: "underline",
  },
  alert: {
    marginBottom: "0.75rem",
    background: "var(--dangerActionsRedTransparent)",
    color: "var(--textColor)",
    border: "1px solid var(--borderRed)",
    borderRadius: 10,
    padding: "0.6rem 0.75rem",
    fontSize: 14,
  },
  divider: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 12,
    margin: "1rem 0",
  },
  dividerLine: { height: 1, background: "var(--boderComponents)" },
  dividerText: { fontSize: 12, color: "var(--secondaryBlue)" },
};

export default Login;
