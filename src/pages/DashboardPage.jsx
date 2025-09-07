// =============================================
// FILE: src/pages/DashboardPage.jsx
// =============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useLeague } from '@contexts/LeagueContext.jsx';
import ProfileDropdown from '@components/ui/ProfileDropdown.jsx';
import PWABanner from '../components/ui/PWABanner.jsx';
import StatsCard from '@ui/StatsCard.jsx';

// Lazy load heavy components
const UserBookingsCard = React.lazy(() => import('@ui/UserBookingsCard.jsx'));

// Memoized components for performance
const QuickAction = React.memo(({ action, T }) => (
  <button
    onClick={action.action}
    className={`bg-white ring-1 ring-black/10 hover:ring-black/20 p-5 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group text-center`}
  >
    <div className={`${action.iconWrap} w-11 h-11 ${T.borderLg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform mx-auto`}>
      {action.icon}
    </div>
    <h3 className="font-bold text-base mb-1 text-gray-900 dark:text-white text-center">
      {action.title}
    </h3>
    <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
      {action.description}
    </p>
  </button>
));

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, loading: leagueLoading } = useLeague();
  const T = React.useMemo(() => themeTokens(), []);

  // Memoized quick actions to prevent recreating on every render
  const quickActions = React.useMemo(() => [
    {
      title: 'Prenota Campo',
      description: 'Prenota subito un campo disponibile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth={1.5} />
          <path d="M8 3v4M16 3v4M3 9h18" strokeWidth={1.5} />
          <path d="M12 13v6M9 16h6" strokeWidth={1.5} />
        </svg>
      ),
      action: () => navigate('/booking'),
      iconWrap: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
    },
    {
      title: 'Classifica',
      description: 'Visualizza ranking RPA',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M5 6h14v2a5 5 0 01-5 5h-4a5 5 0 01-5-5V6z" strokeWidth={1.5} />
          <path d="M8 21h8M10 21v-3a2 2 0 012-2 2 2 0 012 2v3" strokeWidth={1.5} />
          <path d="M19 8a3 3 0 003-3V4h-3" strokeWidth={1.5} />
          <path d="M5 8a3 3 0 01-3-3V4h3" strokeWidth={1.5} />
        </svg>
      ),
      action: () => navigate('/classifica'),
      iconWrap: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
    },
    {
      title: 'Statistiche',
      description: 'Analisi avanzate e grafici',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 20h18" strokeWidth={1.5} />
          <path d="M4 14l4-4 4 3 5-6 3 2" strokeWidth={1.5} />
          <circle cx="8" cy="10" r="1" fill="currentColor" />
          <circle cx="12" cy="13" r="1" fill="currentColor" />
          <circle cx="17" cy="7" r="1" fill="currentColor" />
        </svg>
      ),
      action: () => navigate('/stats'),
      iconWrap: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200',
    }
  ], [navigate]);

  // Quick loading fallback for immediate UI
  if (leagueLoading) {
    return (
      <div className="space-y-1">
        <PWABanner />
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 rounded-xl h-32"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 rounded-2xl h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* PWA Install Banner */}
      <PWABanner />
      
      {/* Desktop: Layout fianco a fianco */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
        {/* Le tue prenotazioni - Desktop (Lazy loaded) */}
        <div>
          <React.Suspense fallback={
            <div className="bg-gray-100 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          }>
            <UserBookingsCard user={user} state={state} T={T} />
          </React.Suspense>
        </div>
          
        {/* Azioni Rapide - Desktop (griglia 2x2) */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Azioni Rapide
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <QuickAction key={action.title} action={action} T={T} />
            ))}
            {/* ProfileDropdown nella griglia 2x2 */}
            <ProfileDropdown 
              onProfileClick={() => navigate('/profile')}
              onBackupClick={() => navigate('/extra')}
            />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: Layout verticale */}
      <div className="lg:hidden space-y-2">
        {/* Le tue prenotazioni - Mobile (Lazy loaded) */}
        <div>
          <React.Suspense fallback={
            <div className="bg-gray-100 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="min-w-[200px] h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
                ))}
              </div>
            </div>
          }>
            <UserBookingsCard user={user} state={state} T={T} compact={true} />
          </React.Suspense>
        </div>
        
        {/* Azioni Rapide - Mobile (griglia 2x2) */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Azioni Rapide
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <QuickAction key={action.title} action={action} T={T} />
            ))}
            {/* ProfileDropdown nella griglia 2x2 mobile */}
            <ProfileDropdown 
              onProfileClick={() => navigate('/profile')}
              onBackupClick={() => navigate('/extra')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
