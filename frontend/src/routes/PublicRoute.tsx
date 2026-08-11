import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Public-only routes (landing, auth).
 * If the user is already authenticated, redirect to the app dashboard.
 */
export const PublicRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
