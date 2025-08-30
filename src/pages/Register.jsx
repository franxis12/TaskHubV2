import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "../auth/firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

function Register() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const storage = getStorage();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [role, setRole] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const canStep1 = name.trim() && apellido.trim() && emailValid;
  const canStep2 = password.length >= 6 && password === confirmPassword;
  //const canStep3 = true;
  const canStep4 = role && companyId.trim();

  useEffect(() => {
    if (!photoFile) return setPhotoPreview("");
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  useEffect(() => {
    if (!logoFile) return setLogoPreview("");
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const mapError = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "El correo ya está en uso.";
      case "auth/weak-password":
        return "La contraseña debe tener al menos 6 caracteres.";
      case "auth/invalid-email":
        return "El correo no es válido.";
      default:
        return "Ocurrió un error al registrar.";
    }
  };

  async function handleRegister(e) {
    e.preventDefault();
    if (!canStep4 || submitting) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (role === "admin") {
        const existingCompany = await getDoc(doc(db, "companies", companyId));
        if (existingCompany.exists()) throw new Error("COMPANY_EXISTS");
      } else if (role === "member") {
        const companyDoc = await getDoc(doc(db, "companies", companyId));
        if (!companyDoc.exists()) throw new Error("COMPANY_NOT_FOUND");
      }

      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const firebaseUser = userCred.user;
      await sendEmailVerification(firebaseUser);

      let photoURL = "";
      if (photoFile) {
        const photoRef = ref(storage, `users/${firebaseUser.uid}/profile.jpg`);
        await uploadBytes(photoRef, photoFile);
        photoURL = await getDownloadURL(photoRef);
      }

      let logoURL = "";
      if (role === "admin" && logoFile) {
        const logoRef = ref(storage, `companies/${companyId}/logo.jpg`);
        await uploadBytes(logoRef, logoFile);
        logoURL = await getDownloadURL(logoRef);
      }

      await setDoc(doc(db, "users", firebaseUser.uid), {
        firstName: name.trim(),
        lastName: apellido.trim(),
        email: firebaseUser.email,
        photo: photoURL,
        role,
        companyId: companyId.trim(),
        pendingApproval: role === "member",
        stats: {
          personal: { completed: 0, pending: 0, missed: 0, completedLate: 0 },
          company: { completed: 0, pending: 0, missed: 0, completedLate: 0 },
        },
        createdAt: serverTimestamp(),
      });

      if (role === "admin") {
        await setDoc(doc(db, "companies", companyId.trim()), {
          createdBy: firebaseUser.uid,
          logo: logoURL,
          theme: "default",
          createdAt: serverTimestamp(),
        });
      }

      setSuccessMsg(
        "Registro exitoso. Revisa tu correo para verificar tu cuenta."
      );
      navigate("/verify-email");
    } catch (err) {
      if (err.message === "COMPANY_EXISTS")
        setErrorMsg("Ese código de empresa ya existe. Elige otro.");
      else if (err.message === "COMPANY_NOT_FOUND")
        setErrorMsg("El código de empresa ingresado no existe.");
      else setErrorMsg(mapError(err.code));
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
            Crear cuenta
          </h1>
          <p style={{ margin: 0, color: "var(--secondaryBlue)" }}>
            Únete a Task‑Hub en pocos pasos
          </p>
        </div>

        <div style={styles.steps}>
          {["Datos", "Seguridad", "Foto", "Empresa"].map((label, i) => {
            const idx = i + 1;
            const active = step === idx;
            const done = step > idx;
            return (
              <div key={label} style={styles.stepItem}>
                <div
                  style={{
                    ...styles.stepDot,
                    background: done
                      ? "var(--availableColor)"
                      : active
                      ? "var(--primaryBlue)"
                      : "transparent",
                    borderColor: active
                      ? "var(--borderBlue)"
                      : "var(--boderComponents)",
                    color: active ? "#000" : "var(--textColor)",
                  }}
                >
                  {done ? "✓" : idx}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: active ? "var(--textColor)" : "var(--secondaryBlue)",
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {errorMsg && <div style={styles.alertError}>{errorMsg}</div>}
        {successMsg && <div style={styles.alertOk}>{successMsg}</div>}

        <form
          onSubmit={handleRegister}
          style={{ display: "grid", gap: "0.9rem" }}
        >
          {step === 1 && (
            <>
              <div>
                <label style={styles.label}>Nombre</label>
                <input
                  style={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Apellido</label>
                <input
                  style={styles.input}
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Tu apellido"
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Correo</label>
                <input
                  type="email"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
                {!emailValid && email.length > 0 && (
                  <small style={{ color: "var(--dangerActionsRed)" }}>
                    Ingresa un correo válido.
                  </small>
                )}
              </div>

              <div style={styles.rowBtns}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    ...styles.primaryBtn,
                    opacity: canStep1 ? 1 : 0.6,
                    cursor: canStep1 ? "pointer" : "not-allowed",
                  }}
                  disabled={!canStep1}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label style={styles.label}>Contraseña</label>
                <input
                  type="password"
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Confirmar contraseña</label>
                <input
                  type="password"
                  style={styles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  minLength={6}
                  required
                />
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <small style={{ color: "var(--dangerActionsRed)" }}>
                      Las contraseñas no coinciden.
                    </small>
                  )}
              </div>

              <div style={styles.rowBtns}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={styles.secondaryBtn}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={{
                    ...styles.primaryBtn,
                    opacity: canStep2 ? 1 : 0.6,
                    cursor: canStep2 ? "pointer" : "not-allowed",
                  }}
                  disabled={!canStep2}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label style={styles.label}>Tu foto (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  style={styles.fileInput}
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="preview"
                    style={styles.preview}
                  />
                )}
              </div>

              <div style={styles.rowBtns}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={styles.secondaryBtn}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  style={styles.primaryBtn}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <label style={styles.label}>Rol</label>
                <div style={{ display: "flex", gap: 16 }}>
                  <label style={styles.radio}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === "admin"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    Admin
                  </label>
                  <label style={styles.radio}>
                    <input
                      type="radio"
                      name="role"
                      value="member"
                      checked={role === "member"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    Miembro
                  </label>
                </div>
              </div>

              {role && (
                <div>
                  <label style={styles.label}>
                    {role === "admin"
                      ? "Crea un código de empresa"
                      : "Código de empresa"}
                  </label>
                  <input
                    style={styles.input}
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    placeholder="Ej: ACME-2025"
                  />
                </div>
              )}

              {role === "admin" && (
                <div>
                  <label style={styles.label}>
                    Logo de la empresa (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    style={styles.fileInput}
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                  {logoPreview && (
                    <img src={logoPreview} alt="logo" style={styles.preview} />
                  )}
                </div>
              )}

              <div style={styles.rowBtns}>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={styles.secondaryBtn}
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.primaryBtn,
                    opacity: canStep4 && !submitting ? 1 : 0.6,
                    cursor: canStep4 && !submitting ? "pointer" : "not-allowed",
                  }}
                  disabled={!canStep4 || submitting}
                >
                  {submitting ? "Creando cuenta..." : "Registrarse"}
                </button>
              </div>
            </>
          )}
        </form>

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={styles.linkBtn}
          disabled={submitting}
        >
          ← Ya tengo cuenta
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
    maxWidth: 520,
    background: "var(--componentsBG)",
    color: "var(--textColor)",
    border: "1px solid var(--boderComponents)",
    borderRadius: 16,
    padding: "1.5rem",
    boxShadow: "var(--shadowComponents)",
  },
  header: { marginBottom: "1rem", display: "grid", gap: "0.25rem" },
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    marginBottom: 16,
  },
  stepItem: { display: "grid", justifyItems: "center", gap: 6 },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 999,
    border: "1px solid var(--boderComponents)",
    display: "grid",
    placeItems: "center",
    fontSize: 14,
    background: "transparent",
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
  fileInput: {
    width: "100%",
    background: "var(--pagesBackground)",
    color: "var(--textColor)",
    border: "1px solid var(--boderComponents)",
    borderRadius: 10,
    padding: "0.6rem 0.9rem",
  },
  preview: {
    marginTop: 10,
    width: "100%",
    height: 80,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid var(--boderComponents)",
  },
  primaryBtn: {
    padding: "0.8rem 1rem",
    background: "var(--primaryBlue)",
    color: "#000",
    border: "none",
    borderRadius: 10,
    fontWeight: 800,
    boxShadow: "var(--shadowComponents)",
  },
  secondaryBtn: {
    padding: "0.8rem 1rem",
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
  rowBtns: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
  },
  alertError: {
    marginBottom: "0.75rem",
    background: "var(--dangerActionsRedTransparent)",
    color: "var(--textColor)",
    border: "1px solid var(--borderRed)",
    borderRadius: 10,
    padding: "0.6rem 0.75rem",
    fontSize: 14,
  },
  alertOk: {
    marginBottom: "0.75rem",
    background: "rgba(22,163,74,.15)",
    color: "var(--availableColor)",
    border: "1px solid #16a34a",
    borderRadius: 10,
    padding: "0.6rem 0.75rem",
    fontSize: 14,
  },
  radio: { display: "flex", alignItems: "center", gap: 8 },
};

export default Register;
