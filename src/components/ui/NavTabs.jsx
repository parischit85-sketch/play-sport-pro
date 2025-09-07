// =============================================
// FILE: src/components/ui/NavTabs.jsx
// =============================================
import React from 'react';

export default function NavTabs({ active, setActive, clubMode, T, user, navigation }) {
  // Use provided navigation or fallback to default tabs
  const tabs = navigation || [
    { id: 'classifica', label: 'Classifica' },
    { id: 'stats',      label: 'Statistiche' },
    { id: 'prenota-campo', label: 'Prenota Campo' },
    ...(clubMode ? [
      { id: 'giocatori', label: 'Giocatori' },
      { id: 'crea',      label: 'Crea Partita' },
      { id: 'prenota',   label: 'Gestione Campi' },
      { id: 'tornei',    label: 'Crea Tornei' },
    ] : []),
    { id: user ? 'profile' : 'auth', label: user ? 'Profilo' : 'Accedi' },
    { id: 'extra',      label: 'Extra' },
  ];

  return (
    <nav className="hidden md:flex gap-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setActive(t.id)}
          className={`px-3 py-1.5 rounded-xl text-sm transition ring-1 ${active === t.id ? T.btnPrimary : T.ghostRing}`}
          aria-current={active === t.id ? 'page' : undefined}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
