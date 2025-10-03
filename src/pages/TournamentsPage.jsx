// =============================================
// FILE: src/pages/TournamentsPage.jsx
// =============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useUI } from '@contexts/UIContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import CreaTornei from '@features/tornei/CreaTornei.jsx';

export default function TournamentsPage() {
  const navigate = useNavigate();
  const { clubId } = useClub();
  const { clubMode } = useUI();
  const { userRole, user, isClubAdmin } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);

  // Gli admin di club possono sempre accedere, anche senza clubMode attivato
  const canAccessTournaments = clubMode || isClubAdmin(clubId);

  if (!canAccessTournaments) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-6xl mb-4">🔒</div>
        <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Modalità Club Richiesta</h3>
        <p className={`${T.subtext} mb-4`}>
          {userRole === 'super_admin' || (user && user.userProfile?.role === 'admin')
            ? 'Per accedere alla creazione tornei, devi prima sbloccare la modalità club nella sezione Extra.'
            : 'Per accedere alla creazione tornei, è necessario avere privilegi di amministratore del club.'}
        </p>
        {(userRole === 'super_admin' || (user && user.userProfile?.role === 'admin')) && (
          <button onClick={() => navigate('/extra')} className={`${T.btnPrimary} px-6 py-3`}>
            Vai a Extra per sbloccare
          </button>
        )}
      </div>
    );
  }

  return <CreaTornei T={T} />;
}
