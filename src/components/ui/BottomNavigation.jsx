// =============================================
// FILE: src/components/ui/BottomNavigation.jsx
// FUTURISTIC REDESIGN - Modern glassmorphism UI
// =============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingTypeModal from './BookingTypeModal.jsx';

export default function BottomNavigation({
  active,
  setActive,
  navigation = [],
  clubMode = false,
  currentClub = null,
  userRole = null,
}) {
  const [showClubMenu, setShowClubMenu] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const navigate = useNavigate();

  // Get dynamic club path - MUST be defined before use
  const clubId = currentClub?.id || 'sporting-cat'; // Fallback to sporting-cat
  const clubBasePath = `/club/${clubId}`;

  // Detect iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // Check if user is admin (club admin or super admin)
  const isAdmin =
    userRole === 'super_admin' || navigation.some((nav) => nav.clubAdmin || nav.admin);

  // Handle navigation clicks with iOS specific fixes
  const handleNavClick = (item, event) => {
    console.log('📱 [BottomNavigation] Item clicked:', {
      itemId: item.id,
      label: item.label,
      path: item.path,
      currentActive: active,
      isAlreadyActive: active === item.id,
      timestamp: new Date().toISOString(),
    });

    // Prevent default behavior and stop propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Special handling for "prenota" button - show modal instead of navigating
    if (item.id === 'prenota') {
      setShowBookingModal(true);
      return;
    }

    // Prevent navigation to same tab (especially for profile refresh issue)
    if (active === item.id) {
      console.log('⚠️ [BottomNavigation] Already on this tab, skipping');
      return;
    }

    // Set active immediately on iOS, with small delay on other platforms
    const delay = isIOS ? 0 : 50;
    console.log('⏱️ [BottomNavigation] Setting active with delay:', delay + 'ms');
    setTimeout(() => {
      setActive(item.id);
      if (showClubMenu) {
        setShowClubMenu(false);
      }
    }, delay);
  };

  const handleBookingTypeSelect = (type) => {
    const path = type === 'campo' ? `/club/${clubId}/booking` : `/club/${clubId}/lessons`;

    console.log('📱 [BottomNavigation] Booking type selected:', type, path);
    navigate(path);
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

  // Icon mapping function
  const getIconForNavItem = (navId) => {
    const iconMap = {
      dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      'club-dashboard': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      'prenota-campo': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      'prenota-lezione': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      classifica: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      stats: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      players: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      matches: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      tournaments: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      'admin-bookings': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      profile: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      auth: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
      ),
      prenota: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      clubs: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      admin: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    };

    return iconMap[navId] || iconMap.dashboard;
  };

  // Separate navigation items: public tabs vs admin tabs
  // Filter out admin-only and super-admin tabs from bottom nav
  let publicNavItems = navigation
    .filter((nav) => !nav.clubAdmin && !nav.admin)
    .map((nav) => ({
      id: nav.id,
      label: nav.label,
      path: nav.path,
      icon: getIconForNavItem(nav.id),
    }));

  // For normal users in club mode, replace separate booking tabs with single "Prenota" button
  if (!isAdmin && clubMode && currentClub) {
    // Remove "prenota-campo" and "prenota-lezione" tabs
    publicNavItems = publicNavItems.filter(
      (nav) => nav.id !== 'prenota-campo' && nav.id !== 'prenota-lezione'
    );

    // Create single "Prenota" button with prominent icon
    const prenotaButton = {
      id: 'prenota',
      label: 'Prenota',
      path: '#', // Dummy path since we'll handle click specially
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    };

    // Reorganize tabs in optimal order:
    // 1. Home (dashboard)
    // 2. Prenota (central/most used action)
    // 3. Home Circolo (club-dashboard)
    // 4. Classifica
    // 5. Statistiche

    const orderedItems = [];
    const dashboardItem = publicNavItems.find((nav) => nav.id === 'dashboard');
    const clubDashboardItem = publicNavItems.find((nav) => nav.id === 'club-dashboard');
    const classificaItem = publicNavItems.find((nav) => nav.id === 'classifica');
    const statsItem = publicNavItems.find((nav) => nav.id === 'stats');

    // Add in optimal order
    if (dashboardItem) orderedItems.push(dashboardItem);
    orderedItems.push(prenotaButton); // Prenota in center position
    if (clubDashboardItem) orderedItems.push(clubDashboardItem);
    if (classificaItem) orderedItems.push(classificaItem);
    if (statsItem) orderedItems.push(statsItem);

    // Add any remaining items that weren't explicitly ordered
    publicNavItems.forEach((item) => {
      if (!orderedItems.find((orderedItem) => orderedItem.id === item.id)) {
        orderedItems.push(item);
      }
    });

    publicNavItems = orderedItems;
  }

  // Admin tabs for the hamburger menu (only for admins)
  const adminNavItems = navigation
    .filter((nav) => nav.clubAdmin || nav.admin)
    .map((nav) => ({
      id: nav.id,
      label: nav.label,
      path: nav.path,
      icon: getIconForNavItem(nav.id),
    }));

  // Find profile/auth tab (always present)
  const profileTab = navigation.find((nav) => nav.id === 'profile' || nav.id === 'auth');
  const profileNavItem = profileTab ? {
    id: profileTab.id,
    label: profileTab.label,
    path: profileTab.path,
    icon: getIconForNavItem(profileTab.id),
  } : null;

  // Mobile nav shows:
  // - For admins: 3 public tabs + profile + hamburger (5 total)
  // - For normal users: 4 public tabs + profile (5 total)
  const maxPublicTabs = isAdmin ? 3 : 4;
  let mobileNavItems = publicNavItems.slice(0, maxPublicTabs);
  
  // Always add profile/auth tab if exists
  if (profileNavItem) {
    mobileNavItems.push(profileNavItem);
  }

  // Determine grid columns based on number of items + hamburger menu
  const totalItems = mobileNavItems.length + (isAdmin && adminNavItems.length > 0 ? 1 : 0);
  const gridColsClass = totalItems === 4 ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <div
      className="md:hidden bottom-nav-container bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-t border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/10 dark:shadow-black/20"
      style={{
        zIndex: 999999,
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: `calc(68px + env(safe-area-inset-bottom))`,
      }}
      onClick={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* Club Menu Overlay */}
      {showClubMenu && isAdmin && adminNavItems.length > 0 && (
        <div
          className="club-menu-container absolute bottom-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-t border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/20 dark:shadow-black/40"
          style={{ zIndex: 1000000 }}
        >
          <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto overscroll-contain" style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
          }}>
            <div className="flex justify-between items-center mb-3 sm:mb-4 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-10 pb-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Menu Admin
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {adminNavItems.length}
                </div>
              </div>
              <button
                onClick={toggleClubMenu}
                className="w-8 h-8 rounded-full bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 hover:bg-white/80 dark:hover:bg-gray-600/80 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pb-4">
              {adminNavItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-3.5 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 min-h-[56px] ${
                    active === item.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 border border-blue-200/30 dark:border-blue-600/30'
                      : 'bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 border border-white/30 dark:border-gray-600/30 shadow-lg hover:shadow-xl'
                  }`}
                  onClick={(e) => handleClubItemClick(item, e)}
                  style={{
                    WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                  }}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      active === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-sm sm:text-base font-medium truncate flex-1">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`grid ${gridColsClass} h-16 px-2`}>
        {mobileNavItems.map((item, index) => {
          // Special styling for the "Prenota" button (center button)
          const isPrenotaButton = item.id === 'prenota';

          return (
            <div
              key={item.id}
              className={`bottom-nav-item flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all duration-300 ${
                active === item.id
                  ? 'text-blue-500 dark:text-blue-400'
                  : isPrenotaButton
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              onClick={!isIOS ? (e) => handleNavClick(item, e) : undefined}
              onTouchEnd={isIOS ? (e) => handleNavClick(item, e) : undefined}
              style={{
                WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                minHeight: '48px',
                position: 'relative',
                zIndex: 1000000,
              }}
            >
              {/* Icon Container with special styling for Prenota button */}
              <div
                className={`relative flex items-center justify-center rounded-xl transition-all duration-300 ${
                  isPrenotaButton
                    ? 'w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 hover:shadow-xl hover:scale-110 transform scale-105'
                    : active === item.id
                      ? 'w-10 h-10 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-600/30 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 transform scale-110'
                      : 'w-10 h-10 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:backdrop-blur-sm hover:border hover:border-white/20 dark:hover:border-gray-600/20 hover:shadow-lg hover:transform hover:scale-105'
                }`}
              >
                {/* Active indicator dot */}
                {active === item.id && !isPrenotaButton && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg"></div>
                )}
                <div className={isPrenotaButton ? 'text-white' : ''}>{item.icon}</div>
              </div>
              <span
                className={`font-medium text-xs leading-tight ${
                  active === item.id || isPrenotaButton ? 'font-semibold' : ''
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}

        {/* Hamburger Menu Button (only when user is admin and has admin items) */}
        {isAdmin && adminNavItems.length > 0 && (
          <div
            className={`bottom-nav-item flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all duration-300 ${
              showClubMenu
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            onClick={!isIOS ? (e) => toggleClubMenu(e) : undefined}
            onTouchEnd={isIOS ? (e) => toggleClubMenu(e) : undefined}
            style={{
              WebkitTapHighlightColor: 'rgba(0,0,0,0)',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              minHeight: '48px',
              position: 'relative',
              zIndex: 1000000,
            }}
          >
            <div
              className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                showClubMenu
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-400/20 dark:to-pink-400/20 backdrop-blur-sm border border-purple-200/30 dark:border-purple-600/30 shadow-lg shadow-purple-100/30 dark:shadow-purple-900/20 transform scale-110'
                  : 'hover:bg-white/60 dark:hover:bg-gray-700/60 hover:backdrop-blur-sm hover:border hover:border-white/20 dark:hover:border-gray-600/20 hover:shadow-lg hover:transform hover:scale-105'
              }`}
            >
              {showClubMenu && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-lg"></div>
              )}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={showClubMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </div>
            <span
              className={`font-medium text-xs leading-tight ${showClubMenu ? 'font-semibold' : ''}`}
            >
              Menu
            </span>
          </div>
        )}
      </div>

      {/* Booking Type Modal */}
      <BookingTypeModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSelectType={handleBookingTypeSelect}
        clubId={clubId}
      />
    </div>
  );
}
