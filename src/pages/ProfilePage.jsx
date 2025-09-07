// =============================================
// FILE: src/pages/ProfilePage.jsx
// =============================================
import React from 'react';
import { themeTokens } from '@lib/theme.js';
import { useLeague } from '@contexts/LeagueContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';
import Profile from '@features/profile/Profile.jsx';

export default function ProfilePage() {
  const T = React.useMemo(() => themeTokens(), []);
  const { 
    state, 
    setState, 
    derived, 
    leagueId, 
    setLeagueId 
  } = useLeague();
  const { 
    clubMode, 
    setClubMode 
  } = useUI();

  return (
    <Profile 
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
