import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

/**
 * Wraps protected routes — redirects to /login if unauthenticated.
 * Uses useEffect + useNavigate to avoid the infinite re-render loop
 * that <Navigate /> can cause when rendered inside a layout route.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true, state: { from: location.pathname } });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  if (!isAuthenticated) {
    // Render nothing while the redirect effect fires
    return null;
  }

  return <>{children}</>;
}