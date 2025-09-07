// =============================================
// FILE: src/pages/ClassificaPage.jsx
// =============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useLeague } from '@contexts/LeagueContext.jsx';
import Classifica from '@features/classifica/Classifica.jsx';

export default function ClassificaPage() {
  const navigate = useNavigate();
  const { derived } = useLeague();
  const T = React.useMemo(() => themeTokens(), []);

  const handleOpenStats = (playerId) => {
    navigate(`/stats?player=${playerId}`);
  };

  return (
    <Classifica
      T={T}
      players={derived.players}
      matches={derived.matches}
      onOpenStats={handleOpenStats}
    />
  );
}
