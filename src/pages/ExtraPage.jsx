// =============================================
// FILE: src/pages/ExtraPage.jsx
// =============================================
import React from 'react';
import { themeTokens } from '@lib/theme.js';
import { useLeague } from '@contexts/LeagueContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';
import Extra from '@features/extra/Extra.jsx';

export default function ExtraPage() {
  const { state, setState, derived, leagueId, setLeagueId } = useLeague();
  const { clubMode, setClubMode } = useUI();
  const T = React.useMemo(() => themeTokens(), []);

  return (
    <Extra
      T={T}
      state={state}
      setState={setState}
      derived={derived}
      leagueId={leagueId}
      setLeagueId={setLeagueId}
      clubMode={clubMode}
      setClubMode={setClubMode}
    />
  );
}
