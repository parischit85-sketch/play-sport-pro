// =============================================
// FILE: src/layouts/AppLayout.jsx
// =============================================
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext.jsx";
import { useUI } from "@contexts/UIContext.jsx";
import { useLeague } from "@contexts/LeagueContext.jsx";
import { themeTokens, LOGO_URL } from "@lib/theme.js";
import { LoadingOverlay } from "@components/LoadingSpinner.jsx";
import NotificationSystem from "@components/NotificationSystem.jsx";
import NavTabs from "@ui/NavTabs.jsx";
import BottomNavigation from "@ui/BottomNavigation.jsx";
import PWAInstallButton from "@components/PWAInstallButton.jsx";
import PWAFloatingButton from "@components/PWAFloatingButton.jsx";

export default function AppLayout() {
  const { user } = useAuth();
  const { clubMode, loading } = useUI();
  const { updatingFromCloud } = useLeague();
  const location = useLocation();
  const navigate = useNavigate();

  const T = React.useMemo(() => themeTokens(), []);

  // Navigation configuration
  const navigation = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", public: true },
    {
      id: "classifica",
      label: "Classifica",
      path: "/classifica",
      public: true,
    },
    { id: "stats", label: "Statistiche", path: "/stats", public: true },
    {
      id: "prenota-campo",
      label: "Prenota Campo",
      path: "/booking",
      public: true,
    },
    {
      id: "prenota-lezione",
      label: "Prenota Lezione",
      path: "/lessons",
      public: true,
    },
    ...(clubMode
      ? [
          { id: "giocatori", label: "Giocatori", path: "/players", club: true },
          {
            id: "crea",
            label: "Crea Partita",
            path: "/matches/create",
            club: true,
          },
          {
            id: "prenota",
            label: "Gestione Campi",
            path: "/admin/bookings",
            club: true,
          },
          {
            id: "tornei",
            label: "Crea Tornei",
            path: "/tournaments",
            club: true,
          },
        ]
      : []),
    {
      id: user ? "profile" : "auth",
      label: user ? "Profilo" : "Accedi",
      path: user ? "/profile" : "/login",
    },
    { id: "extra", label: "Extra", path: "/extra", public: true },
  ];

  const currentPath = location.pathname;
  const activeTab =
    navigation.find((nav) => nav.path === currentPath)?.id || "";

  const handleTabChange = (tabId) => {
    // Prevent navigation if already on the same tab (iOS fix for refresh issue)
    if (activeTab === tabId) {
      console.log(`Already on tab ${tabId}, preventing navigation`);
      return;
    }

    const nav = navigation.find((n) => n.id === tabId);
    if (nav) {
      console.log(`Navigating from ${activeTab} to ${tabId}`);
      // Use replace instead of push to prevent back stack issues on iOS
      navigate(nav.path, { replace: true });
    }
  };

  const isDashboard = currentPath === "/dashboard" || currentPath === "/";
  return (
    <div
      className={`min-h-screen safe-area-top safe-area-bottom ${T.text} ${isDashboard ? "bg-gradient-to-b from-neutral-50 via-white to-neutral-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" : T.pageBg}`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-20 ${T.headerBg} safe-area-left safe-area-right`}
      >
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-10 w-auto rounded-md shadow shrink-0 flex items-center">
              <img
                src={LOGO_URL}
                alt="Play-Sport.pro"
                className="h-10 w-auto select-none dark:bg-white dark:rounded-md dark:p-1"
                draggable={false}
              />
            </div>
            <div className="text-lg sm:text-2xl font-bold tracking-wide truncate text-neutral-900 dark:text-white">
              Sporting Cat
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* PWA Install Button - Hidden on desktop if NavTabs take space */}
            <div className="hidden sm:block">
              <PWAInstallButton className="text-xs px-3 py-1.5" />
            </div>

            <NavTabs
              active={activeTab}
              setActive={handleTabChange}
              clubMode={clubMode}
              T={T}
              user={user}
              navigation={navigation}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`max-w-[1800px] mx-auto px-3 sm:px-4 py-5 sm:py-6 safe-area-left safe-area-right ${
          // Add bottom padding on mobile to account for bottom navigation
          "pb-20 md:pb-5"
        }`}
      >
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavigation
        active={activeTab}
        setActive={handleTabChange}
        navigation={navigation}
        clubMode={clubMode}
      />

      {/* PWA Floating Button (Mobile Only) */}
      <PWAFloatingButton />

      {/* Global Components */}
      <NotificationSystem />
      <LoadingOverlay
        visible={loading || updatingFromCloud}
        message={updatingFromCloud ? "Sincronizzazione..." : "Caricamento..."}
      />
    </div>
  );
}
