// =============================================
// FILE: src/components/ProtectedRoute.jsx
// =============================================
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext.jsx";
import { LoadingPage } from "./LoadingSpinner.jsx";
import { getRedirectPath, shouldRedirect } from "../utils/navigation.js";
import LandingPage from "@pages/LandingPage.jsx";

// Simple in-memory log guards to reduce noisy repeated logs during re-renders
let _prLastStateLog = 0;
let _prLastPath = null;
let _prLastRoleCheckLog = 0;
const PR_LOG_INTERVAL = 4000; // ms minimal interval for state log per path

export function ProtectedRoute({ children, requireProfile = true, allowedRoles = null }) {
  const { user, userProfile, isAuthenticated, isProfileComplete, loading, userRole, hasRole, isClubAdmin, getFirstAdminClub } =
    useAuth();
  const location = useLocation();

  console.log('🛡️ [ProtectedRoute] Rendering:', {
    path: location.pathname,
    isAuthenticated,
    loading,
    requireProfile,
    allowedRoles,
    timestamp: new Date().toISOString()
  });

  // Show loading while auth state is being determined
  if (loading) {
    console.log('⏳ [ProtectedRoute] Loading auth state...');
    return <LoadingPage message="Verifica autenticazione..." />;
  }

  // Redirect to login if not authenticated (since AuthAwareRoute handles landing page)
  if (!isAuthenticated) {
    const redirectPath = "/login";
    if (shouldRedirect(location.pathname, redirectPath, false)) {
      return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }
  }

  // Check if user is admin of any club (admins can bypass profile completion)
  const firstAdminClubId = getFirstAdminClub ? getFirstAdminClub() : null;
  const isUserClubAdmin = firstAdminClubId && isClubAdmin(firstAdminClubId);

  // If profile is required but not complete, redirect to profile (skip for club admins)
  // Allow access if user has at least a firstName (partial profile completion)
  if (
    isAuthenticated &&
    requireProfile &&
    userProfile !== null &&
    !isProfileComplete &&
    !isUserClubAdmin &&
    !userProfile?.firstName // Only redirect if they don"t even have a firstName
  ) {
    console.log("🔄 ProtectedRoute: Profile incomplete, redirecting to profile", {
      requireProfile,
      userProfile,
      isProfileComplete,
      isUserClubAdmin,
      hasFirstName: !!userProfile?.firstName,
      currentPath: location.pathname
    });
    const redirectPath = "/profile";
    if (shouldRedirect(location.pathname, redirectPath, true)) {
      return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles) {
    if (!allowedRoles.includes(userRole)) {
      console.warn("❌ ProtectedRoute: access denied, redirecting to /dashboard", {
        path: location.pathname,
        required: allowedRoles,
        have: userRole
      });
      return <Navigate to="/dashboard" replace />;
    } else {
      console.log("✅ ProtectedRoute: access granted", { path: location.pathname, role: userRole });
    }
  }

  // Render children if all checks pass
  return children;
}

export function AuthAwareRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while auth state is being determined
  if (loading) {
    return <LoadingPage message="Verifica autenticazione..." />;
  }

  // If not authenticated, show landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // If authenticated, show the protected app layout
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}

export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while auth state is being determined
  if (loading) {
    return <LoadingPage message="Verifica autenticazione..." />;
  }

  // If authenticated, redirect to dashboard (don"t show public pages)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show the public page (login, register, etc.)
  return children;
}
