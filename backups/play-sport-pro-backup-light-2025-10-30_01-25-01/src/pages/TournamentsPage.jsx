// =============================================
// FILE: src/pages/TournamentsPage.jsx
// =============================================
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useUI } from '@contexts/UIContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import TournamentsPageComponent from '@features/tournaments/components/TournamentsPage.jsx';

/**
 * Tournament System Entry Point (Page Wrapper)
 *
 * This page wraps the tournament management system with authentication
 * and club context checks. It ensures only authorized users can access
 * tournament management features.
 *
 * @returns {JSX.Element} Tournament management page
 */
export default function TournamentsPage() {
  const navigate = useNavigate();
  const { clubId: urlClubId } = useParams();
  const { clubId: contextClubId } = useClub();
  const { clubMode } = useUI();
  const { userRole, user, isClubAdmin } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);

  // Determine which clubId to use (prefer URL param)
  const activeClubId = urlClubId || contextClubId;

  // Gli admin di club possono sempre accedere, gli utenti normali possono visualizzare
  const canAccessTournaments = clubMode || isClubAdmin(activeClubId) || userRole !== 'super_admin';
  const adminForClub = isClubAdmin(activeClubId);

  // Show access denied message if user doesn't have permissions
  if (!canAccessTournaments) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-6xl mb-4">🔒</div>
        <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Autorizzazione Richiesta</h3>
        <p className={`${T.subtext} mb-4`}>
          {userRole === 'super_admin' || (user && user.userProfile?.role === 'admin')
            ? 'Per gestire i tornei, devi attivare la modalità club.'
            : 'Per gestire i tornei è necessario essere amministratore del club.'}
        </p>
        {activeClubId && (
          <button
            onClick={() => navigate(`/club/${activeClubId}/dashboard`)}
            className={`${T.btnPrimary} px-6 py-3`}
          >
            Torna alla Dashboard
          </button>
        )}
      </div>
    );
  }

  // Show error if no club context
  if (!activeClubId) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Club Non Selezionato</h3>
        <p className={`${T.subtext} mb-4`}>Devi selezionare un club per gestire i tornei.</p>
        <button onClick={() => navigate('/clubs/search')} className={`${T.btnPrimary} px-6 py-3`}>
          Cerca Club
        </button>
      </div>
    );
  }

  // Render the main tournament management component
  return <TournamentsPageComponent clubId={activeClubId} isAdmin={adminForClub} />;
}

