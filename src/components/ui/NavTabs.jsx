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

  return (
    <nav className="hidden md:flex gap-1">
      {tabs.map((t) => (
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
    </nav>
  );
}
