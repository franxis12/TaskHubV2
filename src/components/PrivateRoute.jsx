// src/routes/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";

/**
 * Props:
 * - requireRole: string | string[] (opcional) -> ej: "admin" o ["admin","manager"]
 * - allowUnverified: boolean (default false) -> si true, no fuerza verificación de email
 * - requireApproved: boolean (default true) -> si true, redirige si pendingApproval
 */
function PrivateRoute({
  children,
  requireRole,
  allowUnverified = false,
  requireApproved = true,
}) {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  // 1) Mientras carga el contexto, no decidir
  if (loading) {
    return null; // o un spinner/skeleton
  }

  // 2) Si no hay sesión -> al login, guardando "from"
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3) Email no verificado (si aplica)
  if (!allowUnverified && user.emailVerified === false && location.pathname !== "/verify-email") {
    return <Navigate to="/verify-email" replace state={{ from: location }} />;
  }

  // 4) Aprobación de cuenta (si aplica)
  if (requireApproved && user.pendingApproval && location.pathname !== "/await-approval") {
    return <Navigate to="/await-approval" replace state={{ from: location }} />;
  }

  // 5) Guardia por rol (si se pide)
  if (requireRole) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  // OK
  return children;
}

export default PrivateRoute;