// =============================================
// FILE: src/utils/navigation.js
// =============================================

/**
 * Navigation utilities to prevent routing loops
 */

let isNavigating = false;
let lastNavigation = null;

export function preventRoutingLoop(targetPath) {
  const now = Date.now();

  // Prevent rapid consecutive navigations to the same path
  if (
    isNavigating &&
    lastNavigation === targetPath &&
    now - lastNavigation < 100
  ) {
    console.warn("🔄 Preventing potential routing loop to:", targetPath);
    return false;
  }

  isNavigating = true;
  lastNavigation = targetPath;

  // Reset flag after a short delay
  setTimeout(() => {
    isNavigating = false;
  }, 200);

  return true;
}

export function shouldRedirect(currentPath, targetPath, isAuthenticated) {
  // Don't redirect if already on target path
  if (currentPath === targetPath) {
    return false;
  }

  // Don't redirect if navigation is in progress
  if (isNavigating) {
    return false;
  }

  return true;
}

export function getRedirectPath(location, isAuthenticated) {
  const currentPath = location.pathname;

  if (!isAuthenticated) {
    return currentPath === "/login" ? null : "/login";
  }

  // If authenticated and on login page, redirect to intended destination
  if (currentPath === "/login") {
    const from = location.state?.from?.pathname;
    return from && from !== "/login" ? from : "/dashboard";
  }

  // Allow authenticated users to stay on landing page (/) - don't redirect to dashboard
  // This allows logged-in users to view the landing page if they want to
  if (currentPath === "/") {
    return null; // Don't redirect
  }

  return null;
}
