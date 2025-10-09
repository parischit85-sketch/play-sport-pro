// =============================================
// FILE: src/layouts/AppLayout.jsx
// =============================================
import React from 'react';
import { getUserLocation, LocationStatus } from '../utils/location-service.js';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';
import { ClubProvider, useClub } from '@contexts/ClubContext.jsx';
import ClubSwitcher from '@components/ClubSwitcher.jsx';
import { themeTokens, LOGO_URL } from '@lib/theme.js';
import { LoadingOverlay } from '@components/LoadingSpinner.jsx';
import NotificationSystem from '@components/NotificationSystem.jsx';
import NavTabs from '@ui/NavTabs.jsx';
import BottomNavigation from '@ui/BottomNavigation.jsx';
import ProfileButton from '@ui/ProfileButton.jsx';
import PWAInstallButton from '@components/PWAInstallButton.jsx';
import PWAFloatingButton from '@components/PWAFloatingButton.jsx';
import PWAInstallPrompt from '@ui/PWAInstallPrompt.jsx';
import BookingTypeModal from '@ui/BookingTypeModal.jsx';
import { logout } from '@services/auth.jsx';

function AppLayoutInner() {
  const { user, userRole, isClubAdmin, getFirstAdminClub } = useAuth();
  const { clubMode, loading } = useUI();
  const { clubId, club, hasClub, exitClub } = useClub();
  const location = useLocation();
  const navigate = useNavigate();

  const T = React.useMemo(() => themeTokens(), []);

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = React.useState(false);

  // One-time geolocation permission preflight on first app access
  React.useEffect(() => {
    // Execute only once per device/browser until user resets storage
    const FLAG_KEY = 'geoPermissionAskedV1';
    if (localStorage.getItem(FLAG_KEY)) return;

    // Avoid triggering on routes where a modal might already request location (defensive)
    const skipPaths = ['/login', '/register'];
    if (skipPaths.includes(location.pathname)) return;

    // Mark flag early to prevent multiple fast mounts (e.g. StrictMode double invoke in dev)
    localStorage.setItem(FLAG_KEY, '1');

    let cancelled = false;

    const run = async () => {
      try {
        // Lightweight permission state probe before invoking real prompt
        let permissionState = 'prompt';
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const perm = await navigator.permissions.query({ name: 'geolocation' });
            permissionState = perm.state; // granted | denied | prompt
          } catch {
            // ignore error
          }
        }

        // If already granted we can prefetch coords silently (fast UX later)
        if (permissionState === 'granted') {
          const result = await getUserLocation({
            timeout: 5000,
            highAccuracy: false,
            cache: true,
            cacheTTL: 180000,
          });
          if (!cancelled && result.status === LocationStatus.SUCCESS) {
            console.log(
              '🌍 [AppLayout] Prefetched location (permission already granted). Accuracy:',
              result.accuracy
            );
          }
          return; // Done.
        }

        // If denied we do nothing now (user can trigger manually in flows)
        if (permissionState === 'denied') {
          console.log('🚫 [AppLayout] Geolocation already denied. Skipping auto prompt.');
          return;
        }

        // Show a subtle, non-blocking toast / notification BEFORE triggering the native prompt
        // so user understands why. Using NotificationSystem context if available via window event.
        try {
          window.dispatchEvent(
            new CustomEvent('notify', {
              detail: {
                type: 'info',
                message:
                  'Vuoi trovare rapidamente i circoli vicini? Attiva la geolocalizzazione (puoi sempre inserirla manualmente dopo).',
              },
            })
          );
        } catch {
          // Ignore notification error
        }

        // Small delay to allow user to read the toast (1.2s) before native permission prompt
        await new Promise((r) => setTimeout(r, 1200));
        if (cancelled) return;

        const result = await getUserLocation({
          timeout: 7000,
          highAccuracy: false,
          cache: true,
          cacheTTL: 180000,
        });
        if (cancelled) return;

        switch (result.status) {
          case LocationStatus.SUCCESS:
            console.log(
              '✅ [AppLayout] Geolocation granted on first-run. Accuracy:',
              result.accuracy
            );
            window.dispatchEvent(
              new CustomEvent('notify', {
                detail: {
                  type: 'success',
                  message: 'Posizione rilevata! Puoi cercare i circoli vicini.',
                },
              })
            );
            break;
          case LocationStatus.PERMISSION_DENIED:
            window.dispatchEvent(
              new CustomEvent('notify', {
                detail: {
                  type: 'warning',
                  message: 'Hai negato il permesso GPS. Potrai sempre usare la ricerca per città.',
                },
              })
            );
            break;
          case LocationStatus.TIMEOUT:
          case LocationStatus.POSITION_UNAVAILABLE:
            window.dispatchEvent(
              new CustomEvent('notify', {
                detail: {
                  type: 'warning',
                  message:
                    'Non siamo riusciti a ottenere la posizione. Puoi inserirla manualmente.',
                },
              })
            );
            break;
          case LocationStatus.BLOCKED_BY_POLICY:
            window.dispatchEvent(
              new CustomEvent('notify', {
                detail: {
                  type: 'error',
                  message: 'Il server blocca la geolocalizzazione. (Controlla Permissions-Policy)',
                },
              })
            );
            break;
          default:
            // Do nothing; avoid noise
            break;
        }
      } catch (e) {
        console.warn('⚠️ [AppLayout] First-run geolocation preflight error:', e);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // Auto-scroll to top on route change (for programmatic navigation like clicking on players)
  React.useEffect(() => {
    console.log('📍 [AppLayout] Route changed:', {
      pathname: location.pathname,
      search: location.search,
      clubId,
      hasClub,
      club: club?.name,
      timestamp: new Date().toISOString(),
    });
    window.scrollTo(0, 0);
  }, [location.pathname, location.search, clubId, hasClub, club]);

  const handleLogout = async () => {
    try {
      await logout();
      // Forza il reindirizzamento alla landing page dopo logout
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  // Check if user is admin of current club or any club
  const firstAdminClubId = getFirstAdminClub ? getFirstAdminClub() : null;
  const effectiveClubId = clubId || firstAdminClubId;
  const isCurrentClubAdmin =
    effectiveClubId && (userRole === 'super_admin' || isClubAdmin(effectiveClubId));

  // Navigation configuration - based on club selection and user permissions
  const navigation = React.useMemo(() => {
    const baseNavigation = [
      // Show Dashboard instead of Home for club admins
      {
        id: 'dashboard',
        label: isCurrentClubAdmin ? 'Dashboard Admin' : 'Home',
        path:
          isCurrentClubAdmin && effectiveClubId
            ? `/club/${effectiveClubId}/admin/dashboard`
            : '/dashboard',
        public: true,
      },
    ];

    // If no club is selected AND user is not an admin, show only basic navigation
    if (!hasClub && !isCurrentClubAdmin) {
      baseNavigation.push(
        {
          id: 'clubs',
          label: 'Cerca Circoli',
          path: '/clubs/search',
          public: true,
        },
        {
          id: 'prenota',
          label: 'Prenota',
          path: '/prenota',
          public: true,
        }
      );
    } else {
      // If club is selected OR user is admin, show club-specific tabs
      const validClubId = clubId && !['default-club'].includes(clubId) ? clubId : effectiveClubId;

      if (validClubId) {
        // Add "Home Circolo" tab for club-specific dashboard
        baseNavigation.push({
          id: 'club-dashboard',
          label: 'Home Circolo',
          path: `/club/${validClubId}/dashboard`,
          public: true,
        });

        // Basic tabs for all users
        baseNavigation.push(
          {
            id: 'prenota-campo',
            label: 'Prenota Campo',
            path: `/club/${validClubId}/booking`,
            public: true,
          },
          {
            id: 'prenota-lezione',
            label: 'Prenota Lezione',
            path: `/club/${validClubId}/lessons`,
            public: true,
          },
          {
            id: 'classifica',
            label: 'Classifica',
            path: `/club/${validClubId}/classifica`,
            public: true,
          },
          {
            id: 'stats',
            label: 'Statistiche',
            path: `/club/${validClubId}/stats`,
            public: true,
          }
        );

        // Additional tabs for club administrators
        if (isCurrentClubAdmin) {
          baseNavigation.push(
            {
              id: 'players',
              label: 'Giocatori',
              path: `/club/${validClubId}/players`,
              clubAdmin: true,
            },
            {
              id: 'matches',
              label: 'Partite',
              path: `/club/${validClubId}/matches/create`,
              clubAdmin: true,
            },
            {
              id: 'tournaments',
              label: 'Tornei',
              path: `/club/${validClubId}/tournaments`,
              clubAdmin: true,
            },
            {
              id: 'admin-bookings',
              label: 'Gestione Campi',
              path: `/club/${validClubId}/admin/bookings`,
              clubAdmin: true,
            }
          );
        }
      } else {
        // Use global routes when no valid club is selected
        baseNavigation.push(
          {
            id: 'prenota-campo',
            label: 'Prenota Campo',
            path: '/booking',
            public: true,
          },
          {
            id: 'prenota-lezione',
            label: 'Prenota Lezione',
            path: '/lessons',
            public: true,
          }
        );
      }
    }

    // REMOVED: Profile/auth tab now in ProfileButton (top-right header)
    // No longer needed in bottom navigation

    // Add super admin navigation
    if (userRole === 'super_admin') {
      baseNavigation.push({
        id: 'admin',
        label: 'Super Admin',
        path: '/admin',
        admin: true,
      });
    }

    // Extra functionality now integrated into Gestione Campi as settings modal

    return baseNavigation;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    userRole,
    hasClub,
    clubId,
    isClubAdmin,
    isCurrentClubAdmin,
    effectiveClubId,
    firstAdminClubId,
  ]);

  const currentPath = location.pathname;
  const activeTab = navigation.find((nav) => nav.path === currentPath)?.id || '';

  const handleTabChange = (tabId) => {
    console.log('🔄 [AppLayout] handleTabChange called:', {
      newTabId: tabId,
      currentTabId: activeTab,
      currentPath: location.pathname,
      clubId,
      hasClub,
      timestamp: new Date().toISOString(),
    });

    // Intercept "prenota" tab to open BookingTypeModal instead of navigating
    if (tabId === 'prenota') {
      console.log('🎯 [AppLayout] Opening BookingTypeModal for prenota tab');
      setShowBookingModal(true);
      return;
    }

    // Prevent navigation if already on the same tab (iOS fix for refresh issue)
    if (activeTab === tabId) {
      console.log('⚠️ [AppLayout] Already on tab, skipping navigation:', tabId);
      return;
    }

    const nav = navigation.find((n) => n.id === tabId);

    if (nav) {
      console.log('✅ [AppLayout] Navigating to:', {
        tabId,
        path: nav.path,
        label: nav.label,
        method: 'replace',
      });

      // Scroll to top when changing tabs
      window.scrollTo(0, 0);

      // Use replace instead of push to prevent back stack issues on iOS
      navigate(nav.path, { replace: true });
    } else {
      console.error('❌ [AppLayout] Tab not found in navigation:', tabId);
    }
  };

  const isDashboard = currentPath === '/dashboard' || currentPath === '/';
  return (
    <div
      className={`min-h-screen safe-area-top safe-area-bottom ${T.text} ${isDashboard ? 'bg-gradient-to-b from-neutral-50 via-white to-neutral-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900' : T.pageBg}`}
    >
      {/* Header */}
      <header className={`sticky top-0 z-20 ${T.headerBg} safe-area-left safe-area-right`}>
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
            {club && clubId && (
              <div className="flex items-center gap-2 min-w-0">
                {/* Club Logo */}
                {club.logoUrl ? (
                  <img
                    src={club.logoUrl}
                    alt={`${club.name} logo`}
                    className="h-8 w-8 rounded-lg object-cover shadow-sm border border-white/20 dark:border-gray-600/20"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm border border-white/20 dark:border-gray-600/20">
                    <span className="text-white text-sm font-bold">🏓</span>
                  </div>
                )}
                <div
                  className="text-lg sm:text-2xl font-bold tracking-wide truncate text-neutral-900 dark:text-white"
                  title={club?.name}
                >
                  {club.name}
                </div>
                {/* Nascondi il bottone di uscita per gli admin club */}
                {!isClubAdmin(clubId) && (
                  <button
                    onClick={() => {
                      exitClub();
                    }}
                    className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                    title="Esci dal circolo"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
            {/* Nascondi il ClubSwitcher quando non siamo in un club specifico */}
            {clubId && !isClubAdmin(clubId) && <ClubSwitcher className="ml-2 hidden sm:block" />}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Profile Button - Always visible on the right */}
            <ProfileButton />

            {/* Admin Portal Button - Solo per admin autorizzati */}
            {user && ['paris.andrea@live.it', 'admin@playsport.it'].includes(user.email) && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                title="Portale Admin PlaySport"
              >
                <span>🛡️</span>
                <span>Admin</span>
              </button>
            )}

            {/* Logout Button - Solo per utenti autenticati */}
            {user && (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors"
                title="Esci dall'account"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            )}

            {/* PWA Install Button - Hidden on desktop if NavTabs take space */}
            <div className="hidden sm:block">
              <PWAInstallButton className="text-xs px-3 py-1.5" />
            </div>

            <NavTabs
              active={activeTab}
              setActive={handleTabChange}
              clubMode={clubMode || hasClub}
              userRole={userRole}
              currentClub={club}
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
          'pb-20 md:pb-5'
        }`}
      >
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavigation
        active={activeTab}
        setActive={handleTabChange}
        navigation={navigation}
        clubMode={clubMode || hasClub}
        isInitialDashboard={false}
        userRole={userRole}
        currentClub={club}
      />

      {/* PWA Floating Button (Mobile Only) */}
      <PWAFloatingButton />

      {/* PWA Install Prompt with Permissions (Auto-show on first access) */}
      <PWAInstallPrompt />

      {/* Global Components */}
      <NotificationSystem />
      <LoadingOverlay visible={loading} message={'Caricamento...'} />

      {/* Booking Type Modal */}
      <BookingTypeModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSelectType={(type, selectedClubId) => {
          const targetClubId = selectedClubId || 'sporting-cat';
          const path =
            type === 'campo' ? `/club/${targetClubId}/booking` : `/club/${targetClubId}/lessons`;
          navigate(path);
          setShowBookingModal(false);
        }}
      />
    </div>
  );
}

export default function AppLayout() {
  return (
    <ClubProvider>
      <AppLayoutInner />
    </ClubProvider>
  );
}
