// =============================================
// FILE: src/components/ui/BottomNavigation.jsx
// =============================================
import React, { useState, useEffect } from 'react';

export default function BottomNavigation({ active, setActive, navigation = [], clubMode = false }) {
  const [showClubMenu, setShowClubMenu] = useState(false);

  // Non chiudere automaticamente il menu - rimane aperto fino a selezione
  // Mobile navigation items - always 4 base items
  const baseNavItems = [
    { 
      id: 'dashboard', 
      label: 'Home', 
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'prenota-campo', 
      label: 'Prenota', 
      path: '/booking',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'classifica', 
      label: 'Classifica', 
      path: '/classifica',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    { 
      id: 'stats', 
      label: 'Statistiche', 
      path: '/stats',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  // Club navigation items for the hamburger menu
  const clubNavItems = [
    { 
      id: 'giocatori', 
      label: 'Giocatori', 
      path: '/players',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    { 
      id: 'crea', 
      label: 'Crea Partita', 
      path: '/matches/create',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      )
    },
    { 
      id: 'prenota', 
      label: 'Gestione Campi', 
      path: '/booking-admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      id: 'tornei', 
      label: 'Crea Tornei', 
      path: '/tournaments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'profile', 
      label: 'Profilo', 
      path: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'extra', 
      label: 'Extra', 
      path: '/extra',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      )
    }
  ];

  // Main navigation items for bottom nav
  const mobileNavItems = baseNavItems;

  const handleNavClick = (item) => {
    setActive(item.id);
    if (showClubMenu) {
      setShowClubMenu(false); // Chiudi il menu se è aperto
    }
  };

  const toggleClubMenu = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setShowClubMenu(!showClubMenu);
  };

  const handleClubItemClick = (item, event) => {
    event.stopPropagation();
    event.preventDefault();
    setActive(item.id);
    setShowClubMenu(false); // Chiudi solo quando si seleziona un'opzione
  };

  return (
    <div 
      className="md:hidden bottom-nav-container bg-white border-t border-gray-200"
      style={{
        zIndex: 999999,
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: `calc(64px + env(safe-area-inset-bottom))`,
      }}
      onClick={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* Club Menu Overlay */}
      {showClubMenu && (
        <div 
          className="club-menu-container absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
          style={{ zIndex: 1000000 }}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium text-gray-500">Menu Circolo</div>
              <button
                onClick={toggleClubMenu}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {clubNavItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                    active === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={(e) => handleClubItemClick(item, e)}
                  style={{
                    WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                  }}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`grid h-16 ${clubMode ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {mobileNavItems.map((item) => (
          <div
            key={item.id}
            className={`bottom-nav-item flex flex-col items-center justify-center space-y-1 ${
              active === item.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600'
            }`}
            onClick={() => handleNavClick(item)}
            onTouchEnd={() => handleNavClick(item)}
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
            {item.icon}
            <span className={`font-medium ${clubMode ? 'text-xs' : 'text-xs'}`}>{item.label}</span>
          </div>
        ))}
        
        {/* Hamburger Menu Button (only when club mode is active) */}
        {clubMode && (
          <div
            className={`bottom-nav-item flex flex-col items-center justify-center space-y-1 cursor-pointer ${
              showClubMenu
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600'
            }`}
            onClick={toggleClubMenu}
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs font-medium">Menu</span>
          </div>
        )}
      </div>
    </div>
  );
}
