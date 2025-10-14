// =============================================
// FILE: src/components/ui/NavTabs.jsx
// =============================================
import React from 'react';

export default function NavTabs({
  active,
  setActive,
  clubMode,
  userRole,
  currentClub,
  T,
  user,
  navigation,
}) {
  // Use provided navigation array directly since it's already configured in AppLayout
  const tabs = navigation || [];

  // Separate tabs into public and admin sections
  const publicTabs = tabs.filter((t) => !t.clubAdmin && !t.admin);
  const adminTabs = tabs.filter((t) => t.clubAdmin || t.admin);

  return (
    <nav className="hidden md:flex gap-3 items-center">
      {/* Public tabs */}
      <div className="flex gap-1">
        {publicTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              console.log('🔘 [NavTabs] Tab clicked:', {
                tabId: t.id,
                label: t.label,
                path: t.path,
                currentActive: active,
                timestamp: new Date().toISOString(),
              });
              setActive(t.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-sm transition ring-1 ${active === t.id ? T.btnPrimary : T.ghostRing}`}
            aria-current={active === t.id ? 'page' : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Admin tabs - visually separated with purple gradient styling */}
      {adminTabs.length > 0 && (
        <>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <div className="flex gap-1">
            {adminTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  console.log('🔘 [NavTabs] Admin tab clicked:', {
                    tabId: t.id,
                    label: t.label,
                    path: t.path,
                    currentActive: active,
                    timestamp: new Date().toISOString(),
                  });
                  setActive(t.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-sm transition ${
                  active === t.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg ring-1 ring-purple-400/50'
                    : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 ring-1 ring-purple-400 dark:ring-purple-500'
                }`}
                aria-current={active === t.id ? 'page' : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}
