import React from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import About from "../pages/About";

/**
 * Wrapper for the public homepage (About page).
 * If the user is authenticated, redirects them to their dashboard.
 */
export default function PublicHome() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.type === "therapist" ? "/t" : "/c", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return <About />;
}
