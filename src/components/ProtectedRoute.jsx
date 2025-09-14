// =============================================
// FILE: src/components/ProtectedRoute.jsx
// =============================================
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext.jsx";
import { LoadingPage } from "./LoadingSpinner.jsx";
import { getRedirectPath, shouldRedirect } from "../utils/navigation.js";

export function ProtectedRoute({ children, requireProfile = true }) {
  const { user, userProfile, isAuthenticated, isProfileComplete, loading } =
    useAuth();
  const location = useLocation();

  // Show loading while auth state is being determined
  if (loading) {
    return <LoadingPage message="Verifica autenticazione..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const redirectPath = "/login";
    if (shouldRedirect(location.pathname, redirectPath, false)) {
      return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }
  }

  // If profile is required but not complete, redirect to profile
  if (
    isAuthenticated &&
    requireProfile &&
    userProfile !== null &&
    !isProfileComplete
  ) {
    const redirectPath = "/profile";
    if (shouldRedirect(location.pathname, redirectPath, true)) {
      return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }
  }

  // Render children if all checks pass
  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being determined
  if (loading) {
    return <LoadingPage message="Verifica autenticazione..." />;
  }

  // If authenticated, redirect to intended page or dashboard
  if (isAuthenticated) {
    const redirectPath = getRedirectPath(location, true);
    if (redirectPath && shouldRedirect(location.pathname, redirectPath, true)) {
      return <Navigate to={redirectPath} replace />;
    }
  }

  // Render children if not authenticated
  return children;
}
