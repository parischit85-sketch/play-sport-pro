// =============================================
// FILE: src/pages/ExtraPage.jsx
// =============================================
import React from 'react';
import { themeTokens } from '@lib/theme.js';
import { useUI } from '@contexts/UIContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import Extra from '@features/extra/Extra.jsx';

export default function ExtraPage() {
  const { players, matches, courts, clubId } = useClub();
  const { clubMode, setClubMode } = useUI();
  const { userRole, isClubAdmin } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);

  return (
    <Extra
      T={T}
      state={{ players, matches, courts }}
      setState={() => {}}
      derived={{ players, matches }}
      leagueId={null}
      setLeagueId={() => {}}
      clubMode={clubMode}
      setClubMode={setClubMode}
      userRole={userRole}
      isClubAdmin={isClubAdmin}
      clubId={clubId}
    />
  );
}
