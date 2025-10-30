// =============================================
// FILE: src/components/ClubSwitcher.jsx
// =============================================
import React from 'react';
import { useClub } from '@contexts/ClubContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';

/**
 * ClubSwitcher
 * Mostra elenco club affiliati (approvati) e consente il cambio rapido.
 */
export default function ClubSwitcher({ className = '' }) {
  const { clubId, selectClub, hasClub } = useClub();
  const { userAffiliations, AFFILIATION_STATUS, isClubAdmin, getFirstAdminClub } = useAuth();

  const approved = React.useMemo(() => {
    const approvedAffiliations = (userAffiliations || []).filter(
      (a) => a.status === AFFILIATION_STATUS.APPROVED
    );

    // Rimuovi duplicati per clubId (mantieni quello con ruolo più alto)
    const uniqueClubs = new Map();
    approvedAffiliations.forEach((a) => {
      const existing = uniqueClubs.get(a.clubId);
      if (!existing || (a.role === 'admin' && existing.role !== 'admin')) {
        uniqueClubs.set(a.clubId, a);
      }
    });

    return Array.from(uniqueClubs.values());
  }, [userAffiliations]);

  // Nascondi il switcher se non ci sono affiliazioni approvate
  if (!approved.length) return null;

  // Se l'utente è admin di un club, considera quello come club corrente
  const firstAdminClubId = getFirstAdminClub ? getFirstAdminClub() : null;
  const currentClubId = clubId || firstAdminClubId;

  // Nascondi il switcher se l'utente è admin del club corrente
  if (currentClubId && isClubAdmin(currentClubId)) return null;

  return (
    <div className={`relative ${className}`}>
      <select
        className="text-sm bg-white bg-gray-800 border border-gray-300 border-gray-600 rounded-md px-2 py-1 text-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        value={currentClubId || ''}
        onChange={(e) => selectClub(e.target.value)}
      >
        <option value="">Seleziona Club</option>
        {approved.map((a) => (
          <option key={a.clubId} value={a.clubId}>
            {a.clubName || a.clubId}
          </option>
        ))}
      </select>
    </div>
  );
}

