// =============================================
// FILE: src/pages/PlayersPage.jsx
// =============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useClub } from '@contexts/ClubContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useCalculatedPlayerRatings } from '@hooks/useCalculatedPlayerRatings.js';
import PlayersCRM from '@features/players/PlayersCRM.jsx';

export default function PlayersPage() {
  const navigate = useNavigate();
  const {
    players,
    playersById,
    clubId,
    playersLoaded,
    loadPlayers,
    addPlayer,
    updatePlayer,
    deletePlayer,
    loadingStates,
    matches,
    matchesLoaded,
    leaderboard,
  } = useClub();
  const { clubMode } = useUI();
  const { userRole, user, isClubAdmin } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);

  // Gli admin di club possono sempre accedere, anche senza clubMode attivato
  const canAccessPlayers = clubMode || isClubAdmin(clubId);

  // 🎯 Calcola i ranking reali dalle partite usando hook ottimizzato
  const { playersWithRatings, playersByIdWithRatings } = useCalculatedPlayerRatings(
    players,
    matches,
    clubId,
    leaderboard
  );

  // I dati si caricano automaticamente nel ClubContext quando cambia clubId

  const handleOpenStats = (playerId) => {
    if (clubId) {
      navigate(`/club/${clubId}/stats?player=${playerId}`);
    } else {
      navigate(`/stats?player=${playerId}`);
    }
  };

  // Mostra indicatore di caricamento se i giocatori non sono ancora stati caricati
  const isLoadingPlayers = loadingStates?.players || (!playersLoaded && canAccessPlayers && clubId);

  if (!canAccessPlayers) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-6xl mb-4">🔒</div>
        <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Modalità Club Richiesta</h3>
        <p className={`${T.subtext} mb-4`}>
          {userRole === 'super_admin' || (user && user.userProfile?.role === 'admin')
            ? 'Per accedere al CRM giocatori, devi prima sbloccare la modalità club nella sezione Extra.'
            : 'Per accedere al CRM giocatori, è necessario avere privilegi di amministratore del club.'}
        </p>
        {(userRole === 'super_admin' || (user && user.userProfile?.role === 'admin')) && (
          <button onClick={() => navigate('/extra')} className={`${T.btnPrimary} px-6 py-3`}>
            Vai a Extra per sbloccare
          </button>
        )}
      </div>
    );
  }

  // Mostra indicatore di caricamento se necessario
  if (isLoadingPlayers) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-6xl mb-4">⏳</div>
        <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Caricamento Giocatori...</h3>
        <p className={`${T.subtext}`}>Sto caricando la lista dei giocatori del club</p>
      </div>
    );
  }

  const handleAddPlayer = async (playerData) => {
    try {
      await addPlayer(playerData, user);
    } catch (error) {
      console.error('Error adding player:', error);
      alert("Errore durante l'aggiunta del giocatore: " + error.message);
    }
  };

  const handleUpdatePlayer = async (playerId, updates) => {
    try {
      await updatePlayer(playerId, updates);
    } catch (error) {
      console.error('Error updating player:', error);
      alert("Errore durante l'aggiornamento del giocatore: " + error.message);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    try {
      if (
        confirm(
          'Sei sicuro di voler eliminare questo giocatore? Questa azione non può essere annullata.'
        )
      ) {
        await deletePlayer(playerId);
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      alert("Errore durante l'eliminazione del giocatore: " + error.message);
    }
  };

  return (
    <PlayersCRM
      key={playersWithRatings.length}
      T={T}
      state={{ players: playersWithRatings, clubId }}
      setState={() => {
        /* Legacy prop - now using direct Firebase functions */
      }}
      onOpenStats={handleOpenStats}
      playersById={playersByIdWithRatings}
      onAddPlayer={handleAddPlayer}
      onUpdatePlayer={handleUpdatePlayer}
      onDeletePlayer={handleDeletePlayer}
      isLoading={isLoadingPlayers}
    />
  );
}
