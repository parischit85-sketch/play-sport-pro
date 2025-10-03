// =============================================
// FILE: src/router/AppRouter.jsx
// =============================================
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext.jsx';
import { UIProvider } from '@contexts/UIContext.jsx';
import { ClubProvider } from '@contexts/ClubContext.jsx';
import ErrorBoundary from '@components/ErrorBoundary.jsx';
import { LoadingPage } from '@components/LoadingSpinner.jsx';
import { ProtectedRoute, PublicRoute, AuthAwareRoute } from '@components/ProtectedRoute.jsx';
import AppLayout from '@layouts/AppLayout.jsx';
import { trackPageView } from '@lib/analytics.js';

// Lazy load pages for better performance
const LoginPage = React.lazy(() => import('@pages/LoginPage.jsx'));
const RegisterPage = React.lazy(() => import('@pages/RegisterPage.jsx'));
const LandingPage = React.lazy(() => import('@pages/LandingPage.jsx'));
const DashboardHomePage = React.lazy(() => import('@pages/DashboardHomePage.jsx'));
const DashboardPage = React.lazy(() => import('@pages/DashboardPage.jsx'));
const ClassificaPage = React.lazy(() => import('@pages/ClassificaPage.jsx'));
const StatsPage = React.lazy(() => import('@pages/StatsPage.jsx'));
const BookingPage = React.lazy(() => import('@pages/BookingPage.jsx'));
const LessonBookingPage = React.lazy(() => import('@pages/LessonBookingPage.jsx'));
const UnifiedBookingFlow = React.lazy(() => import('@components/booking/UnifiedBookingFlow.jsx'));
const PlayersPage = React.lazy(() => import('@pages/PlayersPage.jsx'));
const MatchesPage = React.lazy(() => import('@pages/MatchesPage.jsx'));
const TournamentsPage = React.lazy(() => import('@pages/TournamentsPage.jsx'));
import ProfilePage from '@pages/ProfilePage.jsx';
// ExtraPage removed - functionality integrated into AdminBookingsPage settings
const AdminBookingsPage = React.lazy(() => import('@pages/AdminBookingsPage.jsx'));
const DarkModeTestPage = React.lazy(() => import('@pages/DarkModeTestPage.jsx'));

// Bootstrap page
const Bootstrap = React.lazy(() => import('@pages/Bootstrap.jsx'));

// Club features
const ClubSearch = React.lazy(() => import('@features/clubs/ClubSearch.jsx'));
const ClubDashboard = React.lazy(() => import('@features/clubs/ClubDashboard.jsx'));
const ClubPreview = React.lazy(() => import('@features/clubs/ClubPreview.jsx'));
const AdminClubDashboard = React.lazy(() => import('@features/admin/AdminClubDashboard.jsx'));

// Admin pages
const AdminLogin = React.lazy(() => import('@pages/admin/AdminLogin.jsx'));
const AdminDashboard = React.lazy(() => import('@pages/admin/AdminDashboard.jsx'));
const ClubsManagement = React.lazy(() => import('@pages/admin/ClubsManagement.jsx'));
const ClubSettings = React.lazy(() => import('@pages/admin/ClubSettings.jsx'));
const UsersManagement = React.lazy(() => import('@pages/admin/UsersManagement.jsx'));
const AdminProtectedRoute = React.lazy(() => import('@components/admin/AdminProtectedRoute.jsx'));

// Legacy admin pages (keep existing)
const AdminDashboardPage = React.lazy(() => import('@pages/AdminDashboardPage.jsx'));
const AdminClubsPage = React.lazy(() => import('@features/admin/AdminClubsPage.jsx'));
const AdminClubEditPage = React.lazy(() => import('@features/admin/AdminClubEditPage.jsx'));
const AdminClubDetailPage = React.lazy(() => import('@features/admin/AdminClubDetailPage.jsx'));
const AdminUsersPage = React.lazy(() => import('@features/admin/AdminUsersPage.jsx'));
const ClubUsersPage = React.lazy(() => import('@features/admin/ClubUsersPage.jsx'));

// Analytics page tracking component
function AnalyticsPageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Get page title from route or use default
    const pageTitle = document.title || 'PlaySport';
    trackPageView(pageTitle, location.pathname + location.search);
  }, [location]);

  return null;
}

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <Router>
        <AnalyticsPageTracker />
        <AuthProvider>
          <UIProvider>
            <Suspense fallback={<LoadingPage />}>
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />

                {/* Main App Routes - Landing page for unauthenticated, protected routes for authenticated */}
                <Route
                  path="/*"
                  element={
                    <AuthAwareRoute>
                      <AppLayout />
                    </AuthAwareRoute>
                  }
                >
                  {/* Nested routes that render inside AppLayout's <Outlet /> */}
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />

                  {/* Profile Route - Allow access even with incomplete profile */}
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute requireProfile={false}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="prenota" element={<UnifiedBookingFlow />} />
                  <Route path="clubs/search" element={<ClubSearch />} />
                  <Route path="club/:clubId/preview" element={<ClubPreview />} />

                  {/* Club-specific routes */}
                  <Route path="club/:clubId/dashboard" element={<ClubDashboard />} />
                  <Route path="club/:clubId/booking" element={<BookingPage />} />
                  <Route path="club/:clubId/lessons" element={<LessonBookingPage />} />
                  <Route path="club/:clubId/classifica" element={<ClassificaPage />} />
                  <Route path="club/:clubId/stats" element={<StatsPage />} />
                  <Route path="club/:clubId/players" element={<PlayersPage />} />
                  <Route path="club/:clubId/matches/*" element={<MatchesPage />} />
                  <Route path="club/:clubId/tournaments" element={<TournamentsPage />} />
                  <Route path="club/:clubId/admin/bookings" element={<AdminBookingsPage />} />
                  <Route path="club/:clubId/admin/dashboard" element={<AdminClubDashboard />} />

                  {/* Utility routes */}
                  <Route path="bootstrap" element={<Bootstrap />} />
                  <Route path="dark-mode-test" element={<DarkModeTestPage />} />
                </Route>

                {/* Admin Routes - New System */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/*"
                  element={
                    <AdminProtectedRoute>
                      <Routes>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="clubs" element={<ClubsManagement />} />
                        <Route path="clubs/:clubId/settings" element={<ClubSettings />} />
                        <Route path="users" element={<UsersManagement />} />
                      </Routes>
                    </AdminProtectedRoute>
                  }
                />

                {/* Legacy Admin Routes */}
                <Route
                  path="/legacy-admin/*"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <Routes>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="clubs" element={<AdminClubsPage />} />
                        <Route path="clubs/new" element={<AdminClubEditPage />} />
                        <Route path="clubs/:clubId" element={<AdminClubDetailPage />} />
                        <Route path="clubs/:clubId/edit" element={<AdminClubEditPage />} />
                        <Route path="clubs/:clubId/users" element={<ClubUsersPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        {/* <Route path="affiliations" element={<AdminAffiliationsPage />} /> DEPRECATED */}
                      </Routes>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </UIProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
