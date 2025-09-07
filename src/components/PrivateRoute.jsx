// src/routes/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";

/**
 * Props:
 * - requireRole: string | string[] (optional) -> e.g., "admin" or ["admin","manager"]
 * - allowUnverified: boolean (default false) -> if true, do not force email verification
 * - requireApproved: boolean (default true) -> if true, redirect when pendingApproval
 */
function PrivateRoute({
  children,
  requireRole,
  allowUnverified = false,
  requireApproved = true,
}) {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  // 1) While context is loading, don't decide
  if (loading) {
    return null; // or a spinner/skeleton
  }

  // 2) No session -> go to login, preserving "from"
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3) Email not verified (if applicable)
  if (
    !allowUnverified &&
    user.emailVerified === false &&
    location.pathname !== "/verify-email"
  ) {
    return <Navigate to="/verify-email" replace state={{ from: location }} />;
  }

  // 4) Account approval (if applicable)
  if (
    requireApproved &&
    user.pendingApproval &&
    location.pathname !== "/await-approval"
  ) {
    return <Navigate to="/await-approval" replace state={{ from: location }} />;
  }

  // 5) Role guard (if requested)
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
