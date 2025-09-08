// src/pages/Setting.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { auth } from "../auth/firebaseConfig";
import Button from "../Utils/Button";
//import { sendEmailVerification } from "firebase/auth";

function Setting() {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  const user = auth.currentUser;
  const email = useMemo(() => user?.email ?? "", [user?.email]);

  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds to resend
  const [visible, setVisible] = useState(false);
  // If there is no user, redirect to login
  useEffect(() => {
    if (!auth.currentUser) navigate("/login");
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
          "Aún no está verificado. Revisa tu correo o reenvía el enlace."
        );
      }
    } catch (e) {
      setMessage("No se pudo revisar el estado. Intenta de nuevo. " + e);
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
    <div className="w-full h-full flex p-3 flex-col">
      <div className="w-full">
        <h3 className="text-2xl font-bold">Settings</h3>
      </div>
      <div className="w-full bg-gray-400/20 h-full rounded-2xl grid grid-cols-12 overflow-hidden">
        <div className="col-span-3">
          {" "}
          <Button color={"neutro"}>Personal info</Button>
        </div>
        <div className="col-span-9 "></div>
      </div>
    </div>
  );
}

export default Setting;
