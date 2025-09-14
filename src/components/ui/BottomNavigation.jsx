// =============================================
// FILE: src/components/ui/BottomNavigation.jsx
// FUTURISTIC REDESIGN - Modern glassmorphism UI
// =============================================
import React, { useState } from "react";

export default function BottomNavigation({
  active,
  setActive,
  navigation = [],
  clubMode = false,
}) {
  const [showClubMenu, setShowClubMenu] = useState(false);

  // Detect iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // Handle navigation clicks with iOS specific fixes
  const handleNavClick = (item, event) => {
    // Prevent default behavior and stop propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Prevent navigation to same tab (especially for profile refresh issue)
    if (active === item.id) {
      return;
    }

    // Set active immediately on iOS, with small delay on other platforms
    const delay = isIOS ? 0 : 50;
    setTimeout(() => {
      setActive(item.id);
      if (showClubMenu) {
        setShowClubMenu(false);
      }
    }, delay);
  };

  const toggleClubMenu = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setShowClubMenu(!showClubMenu);
  };

  const handleClubItemClick = (item, event) => {
    event.stopPropagation();
    event.preventDefault();
    setTimeout(() => {
      setActive(item.id);
      setShowClubMenu(false); // Chiudi solo quando si seleziona un'opzione
    }, 50);
  };

  // Mobile navigation items - always 5 base items
  const baseNavItems = [
    {
      id: "dashboard",
      label: "Home",
      path: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "prenota-campo",
      label: "Campo",
      path: "/booking",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "prenota-lezione",
      label: "Lezione",
      path: "/lessons",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      id: "classifica",
      label: "Classifica",
      path: "/classifica",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
    {
      id: "stats",
      label: "Stats",
      path: "/stats",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  // Club navigation items for the hamburger menu
  const clubNavItems = [
    {
      id: "giocatori",
      label: "Giocatori",
      path: "/players",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
    {
      id: "crea",
      label: "Crea Partita",
      path: "/matches/create",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
      ),
    },
    {
      id: "prenota",
      label: "Gestione Campi",
      path: "/booking-admin",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: "tornei",
      label: "Crea Tornei",
      path: "/tournaments",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profilo",
      path: "/profile",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "extra",
      label: "Extra",
      path: "/extra",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
      ),
    },
  ];

  // Main navigation items for bottom nav
  // Combine base and club items for mobile navigation
  const mobileNavItems = clubMode
    ? [
        ...baseNavItems.slice(0, 3), // Home, Campo, Lezione
        {
          id: "giocatori",
          label: "Players",
          path: "/players",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          ),
        },
        {
          id: "prenota",
          label: "Admin",
          path: "/admin/bookings",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ),
        },
      ]
    : baseNavItems;

  return (
    <div
      className="md:hidden bottom-nav-container bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-t border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/10 dark:shadow-black/20"
      style={{
        zIndex: 999999,
        paddingBottom: "env(safe-area-inset-bottom)",
        height: `calc(68px + env(safe-area-inset-bottom))`,
      }}
      onClick={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* Club Menu Overlay */}
      {showClubMenu && (
        <div
          className="club-menu-container absolute bottom-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-t border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/20 dark:shadow-black/40"
          style={{ zIndex: 1000000 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Menu Circolo
              </div>
              <button
                onClick={toggleClubMenu}
                className="w-8 h-8 rounded-full bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 hover:bg-white/80 dark:hover:bg-gray-600/80 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {clubNavItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    active === item.id
                      ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 border border-blue-200/30 dark:border-blue-600/30"
                      : "bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 border border-white/30 dark:border-gray-600/30 shadow-lg hover:shadow-xl"
                  }`}
                  onClick={(e) => handleClubItemClick(item, e)}
                  style={{
                    WebkitTapHighlightColor: "rgba(0,0,0,0)",
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                  }}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      active === item.id
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 h-16 px-2">
        {mobileNavItems.map((item, index) => (
          <div
            key={item.id}
            className={`bottom-nav-item flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all duration-300 ${
              active === item.id
                ? "text-blue-500 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
            onClick={!isIOS ? (e) => handleNavClick(item, e) : undefined}
            onTouchEnd={isIOS ? (e) => handleNavClick(item, e) : undefined}
            style={{
              WebkitTapHighlightColor: "rgba(0,0,0,0)",
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
              minHeight: "48px",
              position: "relative",
              zIndex: 1000000,
            }}
          >
            {/* Icon Container with glassmorphism effect for active state */}
            <div
              className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                active === item.id
                  ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-600/30 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 transform scale-110"
                  : "hover:bg-white/60 dark:hover:bg-gray-700/60 hover:backdrop-blur-sm hover:border hover:border-white/20 dark:hover:border-gray-600/20 hover:shadow-lg hover:transform hover:scale-105"
              }`}
            >
              {/* Active indicator dot */}
              {active === item.id && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg"></div>
              )}
              {item.icon}
            </div>
            <span
              className={`font-medium text-xs leading-tight ${
                active === item.id ? "font-semibold" : ""
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}

        {/* Hamburger Menu Button (only when club mode is active) */}
        {clubMode && (
          <div
            className={`bottom-nav-item flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all duration-300 ${
              showClubMenu
                ? "text-blue-500 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
            onClick={!isIOS ? (e) => toggleClubMenu(e) : undefined}
            onTouchEnd={isIOS ? (e) => toggleClubMenu(e) : undefined}
            style={{
              WebkitTapHighlightColor: "rgba(0,0,0,0)",
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
              minHeight: "48px",
              position: "relative",
              zIndex: 1000000,
            }}
          >
            <div
              className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                showClubMenu
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-400/20 dark:to-pink-400/20 backdrop-blur-sm border border-purple-200/30 dark:border-purple-600/30 shadow-lg shadow-purple-100/30 dark:shadow-purple-900/20 transform scale-110"
                  : "hover:bg-white/60 dark:hover:bg-gray-700/60 hover:backdrop-blur-sm hover:border hover:border-white/20 dark:hover:border-gray-600/20 hover:shadow-lg hover:transform hover:scale-105"
              }`}
            >
              {showClubMenu && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-lg"></div>
              )}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    showClubMenu
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </div>
            <span
              className={`font-medium text-xs leading-tight ${showClubMenu ? "font-semibold" : ""}`}
            >
              Menu
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
