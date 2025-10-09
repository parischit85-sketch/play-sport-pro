// =============================================
// FILE: src/pages/DashboardPage.jsx
// =============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { useClubAdminRedirect } from '../hooks/useClubAdminRedirect.js';
import PWABanner from '../components/ui/PWABanner.jsx';
import StatsCard from '@ui/StatsCard.jsx';
import BookingTypeModal from '../components/ui/BookingTypeModal.jsx';

// Lazy load heavy components
const UserBookingsCard = React.lazy(() => import('@ui/UserBookingsCard.jsx'));
const RecentClubsCard = React.lazy(() => import('../components/ui/RecentClubsCard.jsx'));
const InstructorDashboard = React.lazy(
  () => import('@features/instructor/InstructorDashboard.jsx')
);

// Performance optimized quick actions
const QuickAction = React.memo(({ action, T }) => (
  <button
    onClick={action.action}
    className={`relative bg-emerald-50/70 dark:bg-gray-800/70 backdrop-blur-xl border border-emerald-200/40 dark:border-gray-600/40 hover:border-emerald-300/60 dark:hover:border-gray-500/60 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group text-center overflow-hidden`}
  >
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 dark:from-gray-700/30 via-transparent to-transparent pointer-events-none" />

    <div className="relative">
      <div
        className={`${action.iconWrap} w-12 h-12 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto rounded-xl shadow-lg`}
      >
        {action.icon}
      </div>
      <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white text-center">
        {action.title}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-300 text-center leading-relaxed">
        {action.description}
      </p>
    </div>
  </button>
));

QuickAction.displayName = 'QuickAction';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, userRole, userAffiliations } = useAuth();
  const { players, matches, clubId, playersLoaded, isUserInstructor } = useClub();
  const T = React.useMemo(() => themeTokens(), []);
  const [showBookingModal, setShowBookingModal] = useState(false);

  console.log('🏠 [DashboardPage] Rendering:', {
    clubId,
    hasPlayers: !!players,
    playersCount: players?.length,
    userRole,
    timestamp: new Date().toISOString(),
  });

  // Hook per redirect automatico dei CLUB_ADMIN
  useClubAdminRedirect();

  // Check if user is instructor in current club
  // IMPORTANTE: usa isUserInstructor da ClubContext che controlla i players del circolo corrente
  // e verifica solo dopo che i players sono caricati per evitare falsi positivi
  // ⚠️ INOLTRE: mostra InstructorDashboard SOLO quando c'è un clubId (non nella dashboard principale)
  const isInstructor = clubId && playersLoaded && isUserInstructor(user?.uid);

  console.log('👨‍🏫 [DashboardPage] Instructor check:', {
    clubId,
    userId: user?.uid,
    playersLoaded,
    isInstructor,
    userInPlayers: players?.find(p => p.id === user?.uid),
  });

  // Handle booking type selection - same logic as BottomNavigation
  const handleBookingTypeSelect = (type, selectedClubId) => {
    // Use selectedClubId from modal if available, otherwise use 'sporting-cat' as fallback
    const targetClubId = selectedClubId || 'sporting-cat';
    const path = type === 'campo' ? `/club/${targetClubId}/booking` : `/club/${targetClubId}/lessons`;

    console.log('📱 [DashboardPage] Booking type selected:', type, 'for club:', targetClubId, path);
    navigate(path);
  };

  // Memoized quick actions to prevent recreating on every render (solo Cerca Circoli e Prenota)
  const quickActions = React.useMemo(
    () => [
      {
        title: 'Cerca Circoli',
        description: 'Trova e affiliati a nuovi circoli',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              strokeWidth={1.5}
            />
          </svg>
        ),
        action: () => navigate('/clubs/search'),
        iconWrap:
          'bg-gradient-to-r from-blue-50/80 to-cyan-50/60 dark:from-blue-900/40 dark:to-cyan-900/30 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/30',
      },
      {
        title: 'Prenota Campo/Lezione',
        description: 'Prenota subito un campo o una lezione',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth={1.5} />
            <path d="M8 3v4M16 3v4M3 9h18" strokeWidth={1.5} />
            <path d="M12 13v6M9 16h6" strokeWidth={1.5} />
          </svg>
        ),
        action: () => setShowBookingModal(true), // Apri modal come in BottomNavigation
        iconWrap:
          'bg-gradient-to-r from-emerald-50/80 to-green-50/60 dark:from-emerald-900/40 dark:to-green-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/30',
      },
    ],
    [navigate]
  );

  // Quick loading fallback for immediate UI
  if (!players) {
    // simple loading fallback until ClubContext guarantees players array
    return (
      <div className="space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4">
        <PWABanner />
        <div className="animate-pulse space-y-6">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl h-32 border border-white/20 dark:border-gray-700/20 shadow-xl"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl h-24 border border-white/20 dark:border-gray-700/20 shadow-xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 overflow-x-hidden">
      {/* PWA Install Banner */}
      <PWABanner />

      {/* Instructor Dashboard - Full Width */}
      {isInstructor ? (
        <div className="p-2">
          <React.Suspense
            fallback={
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl animate-pulse">
                <div className="h-8 bg-gray-200/80 dark:bg-gray-600/60 rounded w-64 mb-6"></div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-200/60 dark:bg-gray-600/40 rounded-2xl"></div>
                  ))}
                </div>
                <div className="h-96 bg-gray-200/60 dark:bg-gray-600/40 rounded-2xl"></div>
              </div>
            }
          >
            <InstructorDashboard />
          </React.Suspense>
        </div>
      ) : (
        <>
          {/* Desktop: Layout fianco a fianco */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start lg:p-2">
            {/* Messaggio di benvenuto quando non si è in un club */}
            {/* Le tue prenotazioni - Desktop (Lazy loaded) */}
            <div>
              <React.Suspense
                fallback={
                  <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/60 dark:to-gray-800/40 rounded-2xl p-6 animate-pulse backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
                    <div className="h-4 bg-gray-200/80 dark:bg-gray-600/60 rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-20 bg-gray-200/60 dark:bg-gray-600/40 rounded-lg"
                        ></div>
                      ))}
                    </div>
                  </div>
                }
              >
                <UserBookingsCard user={user} T={T} />
              </React.Suspense>
            </div>

            {/* I tuoi circoli - Desktop (Lazy loaded) */}
            <div>
              <React.Suspense
                fallback={
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl animate-pulse">
                    <div className="h-4 bg-gray-200/80 dark:bg-gray-600/60 rounded w-32 mb-4"></div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="min-w-[280px] h-32 bg-gray-200/60 dark:bg-gray-600/40 rounded-2xl flex-shrink-0"
                        ></div>
                      ))}
                    </div>
                  </div>
                }
              >
                <RecentClubsCard user={user} />
              </React.Suspense>
            </div>

            {/* Azioni Rapide - Desktop (griglia 2x2) */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                Azioni Rapide
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <QuickAction key={action.title} action={action} T={T} />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet: Layout verticale */}
          <div className="lg:hidden space-y-1 p-1">
            {/* Le tue prenotazioni - Mobile (Lazy loaded) */}
            <div>
              <React.Suspense
                fallback={
                  <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/60 dark:to-gray-800/40 rounded-2xl p-4 animate-pulse backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
                    <div className="h-3 bg-gray-200/80 dark:bg-gray-600/60 rounded w-24 mb-3"></div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="min-w-[200px] h-24 bg-gray-200/60 dark:bg-gray-600/40 rounded-lg flex-shrink-0"
                        ></div>
                      ))}
                    </div>
                  </div>
                }
              >
                <UserBookingsCard user={user} T={T} compact={true} />
              </React.Suspense>
            </div>

            {/* I tuoi circoli - Mobile (Lazy loaded) */}
            <div>
              <React.Suspense
                fallback={
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-4 shadow-2xl animate-pulse">
                    <div className="h-3 bg-gray-200/80 dark:bg-gray-600/60 rounded w-24 mb-3"></div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="min-w-[240px] h-28 bg-gray-200/60 dark:bg-gray-600/40 rounded-2xl flex-shrink-0"
                        ></div>
                      ))}
                    </div>
                  </div>
                }
              >
                <RecentClubsCard user={user} />
              </React.Suspense>
            </div>

            {/* Azioni Rapide - Mobile (griglia 2x2) */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                Azioni Rapide
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <QuickAction key={action.title} action={action} T={T} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Booking Type Modal - same as BottomNavigation */}
      <BookingTypeModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSelectType={handleBookingTypeSelect}
        clubId={null} // null to show club selection
      />
    </div>
  );
}
