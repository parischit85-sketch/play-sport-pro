// =============================================
// FILE: src/pages/DashboardHomePage.jsx
// =============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { useClubAdminRedirect } from '../hooks/useClubAdminRedirect.js';
import PWABanner from '../components/ui/PWABanner.jsx';

// Lazy load heavy components
const UserBookingsCard = React.lazy(() => import('@ui/UserBookingsCard.jsx'));

// Performance optimized quick actions
const QuickAction = React.memo(({ action, T }) => (
  <button
    onClick={action.action}
    className={`relative bg-emerald-50/70/70 backdrop-blur-xl border border-emerald-200/40  hover:border-emerald-300/60  p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group text-center overflow-hidden`}
  >
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30  via-transparent to-transparent pointer-events-none" />

    <div className="relative">
      <div
        className={`${action.iconWrap} w-12 h-12 backdrop-blur-sm border border-white/20  flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto rounded-xl shadow-lg`}
      >
        {action.icon}
      </div>
      <h3 className="font-bold text-base mb-2 text-gray-900  text-center">
        {action.title}
      </h3>
      <p className="text-xs text-gray-600  text-center leading-relaxed">
        {action.description}
      </p>
    </div>
  </button>
));

QuickAction.displayName = 'QuickAction';

export default function DashboardHomePage() {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { players, matches } = useClub();
  const T = React.useMemo(() => themeTokens(), []);

  // Hook per redirect automatico dei CLUB_ADMIN
  useClubAdminRedirect();

  // Memoized quick actions to prevent recreating on every render
  const quickActions = React.useMemo(
    () => [
      {
        title: 'Cerca Club',
        description: 'Trova e affiliati a nuovi club',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              strokeWidth={1.5}
            />
          </svg>
        ),
        action: () => navigate('/search-clubs'),
        iconWrap:
          'bg-gradient-to-r from-blue-50/80 to-cyan-50/60   text-blue-600  border-blue-200/50 
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
        action: () => navigate('/prenota'),
        iconWrap:
          'bg-gradient-to-r from-emerald-50/80 to-green-50/60   text-emerald-600  border-emerald-200/50 
      },
    ],
    [navigate]
  );

  // Quick loading fallback for immediate UI
  if (!players) {
    // simple loading fallback until ClubContext guarantees players array
    return (
      <div className="space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100    p-4">
        <PWABanner />
        <div className="animate-pulse space-y-6">
          <div className="bg-white/60/60 backdrop-blur-xl rounded-3xl h-32 border border-white/20  shadow-xl"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/60/60 backdrop-blur-xl rounded-2xl h-24 border border-white/20  shadow-xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100   
      {/* PWA Install Banner */}
      <PWABanner />

      {/* Desktop: Layout fianco a fianco */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start lg:p-2">
        {/* Le tue prenotazioni - Desktop (Lazy loaded) */}
        <div>
          <React.Suspense
            fallback={
              <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/60   rounded-2xl p-6 animate-pulse backdrop-blur-sm border border-white/30 
                <div className="h-4 bg-gray-200/80/60 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-gray-200/60/40 rounded-lg"
                    ></div>
                  ))}
                </div>
              </div>
            }
          >
            <UserBookingsCard user={user} T={T} />
          </React.Suspense>
        </div>

        {/* Azioni Rapide - Desktop (griglia) */}
        <div className="bg-white/80/80 backdrop-blur-xl rounded-3xl border border-white/20  p-6 shadow-2xl">
          <h3 className="text-xl font-bold mb-6 text-gray-900  flex items-center gap-3">
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
              <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/60   rounded-2xl p-4 animate-pulse backdrop-blur-sm border border-white/30 
                <div className="h-3 bg-gray-200/80/60 rounded w-24 mb-3"></div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="min-w-[200px] h-24 bg-gray-200/60/40 rounded-lg flex-shrink-0"
                    ></div>
                  ))}
                </div>
              </div>
            }
          >
            <UserBookingsCard user={user} T={T} compact={true} />
          </React.Suspense>
        </div>

        {/* Azioni Rapide - Mobile (griglia 2x2) */}
        <div className="bg-white/80/80 backdrop-blur-xl rounded-3xl border border-white/20  p-6 shadow-2xl">
          <h3 className="text-xl font-bold mb-6 text-gray-900  flex items-center gap-3">
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
    </div>
  );
}

