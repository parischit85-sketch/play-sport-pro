// =============================================
// FILE: src/router/AppRouter.jsx
// =============================================
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext.jsx';
import { LeagueProvider } from '@contexts/LeagueContext.jsx';
import { UIProvider } from '@contexts/UIContext.jsx';
import ErrorBoundary from '@components/ErrorBoundary.jsx';
import { LoadingPage } from '@components/LoadingSpinner.jsx';
import { ProtectedRoute, PublicRoute } from '@components/ProtectedRoute.jsx';
import AppLayout from '@layouts/AppLayout.jsx';

// Lazy load pages for better performance
const LoginPage = React.lazy(() => import('@pages/LoginPage.jsx'));
const DashboardPage = React.lazy(() => import('@pages/DashboardPage.jsx'));
const ClassificaPage = React.lazy(() => import('@pages/ClassificaPage.jsx'));
const StatsPage = React.lazy(() => import('@pages/StatsPage.jsx'));
const BookingPage = React.lazy(() => import('@pages/BookingPage.jsx'));
const PlayersPage = React.lazy(() => import('@pages/PlayersPage.jsx'));
const MatchesPage = React.lazy(() => import('@pages/MatchesPage.jsx'));
const TournamentsPage = React.lazy(() => import('@pages/TournamentsPage.jsx'));
const ProfilePage = React.lazy(() => import('@pages/ProfilePage.jsx'));
const ExtraPage = React.lazy(() => import('@pages/ExtraPage.jsx'));
const AdminBookingsPage = React.lazy(() => import('@pages/AdminBookingsPage.jsx'));

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <LeagueProvider>
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

                  {/* Protected Routes with Layout */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    {/* Default redirect to dashboard */}
                    <Route index element={<Navigate to="dashboard" replace />} />
                    
                    {/* Dashboard */}
                    <Route path="dashboard" element={<DashboardPage />} />
                    
                    {/* Public League Routes */}
                    <Route path="classifica" element={<ClassificaPage />} />
                    <Route path="stats" element={<StatsPage />} />
                    <Route path="booking" element={<BookingPage />} />
                    <Route path="extra" element={<ExtraPage />} />
                    
                    {/* Club Mode Routes */}
                    <Route path="players" element={<PlayersPage />} />
                    <Route path="matches/create" element={<MatchesPage />} />
                    <Route path="tournaments" element={<TournamentsPage />} />
                    <Route path="admin/bookings" element={<AdminBookingsPage />} />
                    
                    {/* User Routes */}
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </UIProvider>
          </LeagueProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
