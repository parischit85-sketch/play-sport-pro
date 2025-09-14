// =============================================
// FILE: src/pages/DashboardPage.jsx
// =============================================
import React from "react";
import { useNavigate } from "react-router-dom";
import { themeTokens } from "@lib/theme.js";
import { useAuth } from "@contexts/AuthContext.jsx";
import { useLeague } from "@contexts/LeagueContext.jsx";
import ProfileDropdown from "@components/ui/ProfileDropdown.jsx";
import PWABanner from "../components/ui/PWABanner.jsx";
import StatsCard from "@ui/StatsCard.jsx";

// Lazy load heavy components
const UserBookingsCard = React.lazy(() => import("@ui/UserBookingsCard.jsx"));

// Performance optimized quick actions
const QuickAction = React.memo(({ action, T }) => (
  <button
    onClick={action.action}
    className={`relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-white/30 dark:border-gray-600/30 hover:border-white/50 dark:hover:border-gray-500/50 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group text-center overflow-hidden`}
  >
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

    <div className="relative">
      <div
        className={`${action.iconWrap} w-12 h-12 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto rounded-xl shadow-lg`}
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

QuickAction.displayName = "QuickAction";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, loading: leagueLoading } = useLeague();
  const T = React.useMemo(() => themeTokens(), []);

  // Memoized quick actions to prevent recreating on every render
  const quickActions = React.useMemo(
    () => [
      {
        title: "Prenota Campo",
        description: "Prenota subito un campo disponibile",
        icon: (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth={1.5} />
            <path d="M8 3v4M16 3v4M3 9h18" strokeWidth={1.5} />
            <path d="M12 13v6M9 16h6" strokeWidth={1.5} />
          </svg>
        ),
        action: () => navigate("/booking"),
        iconWrap:
          "bg-gradient-to-r from-emerald-50/80 to-green-50/60 dark:from-emerald-900/40 dark:to-green-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/30",
      },
      {
        title: "Classifica",
        description: "Visualizza ranking RPA",
        icon: (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 6h14v2a5 5 0 01-5 5h-4a5 5 0 01-5-5V6z"
              strokeWidth={1.5}
            />
            <path
              d="M8 21h8M10 21v-3a2 2 0 012-2 2 2 0 012 2v3"
              strokeWidth={1.5}
            />
            <path d="M19 8a3 3 0 003-3V4h-3" strokeWidth={1.5} />
            <path d="M5 8a3 3 0 01-3-3V4h3" strokeWidth={1.5} />
          </svg>
        ),
        action: () => navigate("/classifica"),
        iconWrap:
          "bg-gradient-to-r from-amber-50/80 to-orange-50/60 dark:from-amber-900/40 dark:to-orange-900/30 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/30",
      },
      {
        title: "Statistiche",
        description: "Analisi avanzate e grafici",
        icon: (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 20h18" strokeWidth={1.5} />
            <path d="M4 14l4-4 4 3 5-6 3 2" strokeWidth={1.5} />
            <circle cx="8" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="13" r="1" fill="currentColor" />
            <circle cx="17" cy="7" r="1" fill="currentColor" />
          </svg>
        ),
        action: () => navigate("/stats"),
        iconWrap:
          "bg-gradient-to-r from-indigo-50/80 to-purple-50/60 dark:from-indigo-900/40 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-500/30",
      },
    ],
    [navigate],
  );

  // Quick loading fallback for immediate UI
  if (leagueLoading) {
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
    <div className="space-y-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* PWA Install Banner */}
      <PWABanner />

      {/* Desktop: Layout fianco a fianco */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start lg:p-2">
        {/* Le tue prenotazioni - Desktop (Lazy loaded) */}
        <div className="bg-gradient-to-br from-slate-50/95 via-blue-50/90 to-indigo-50/95 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-700/95 backdrop-blur-xl rounded-3xl border-2 border-blue-200/50 dark:border-blue-700/50 p-6 shadow-2xl shadow-blue-100/40 dark:shadow-blue-900/40">
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
            <UserBookingsCard user={user} state={state} T={T} />
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
            {/* ProfileDropdown nella griglia 2x2 */}
            <ProfileDropdown
              onProfileClick={() => navigate("/profile")}
              onBackupClick={() => navigate("/extra")}
            />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: Layout verticale */}
      <div className="lg:hidden space-y-1 p-1">
        {/* Le tue prenotazioni - Mobile (Lazy loaded) */}
        <div className="bg-gradient-to-br from-slate-50/95 via-blue-50/90 to-indigo-50/95 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-700/95 backdrop-blur-xl rounded-3xl border-2 border-blue-200/50 dark:border-blue-700/50 p-6 shadow-2xl shadow-blue-100/40 dark:shadow-blue-900/40">
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
            <UserBookingsCard user={user} state={state} T={T} compact={true} />
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
            {/* ProfileDropdown nella griglia 2x2 mobile */}
            <ProfileDropdown
              onProfileClick={() => navigate("/profile")}
              onBackupClick={() => navigate("/extra")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
