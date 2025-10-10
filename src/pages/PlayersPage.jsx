// =============================================
// FILE: src/pages/PlayersPage.jsx
// =============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useClub } from '@contexts/ClubContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import { computeClubRanking } from '@lib/ranking-club.js';
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
  } = useClub();
  const { clubMode } = useUI();
  const { userRole, user, isClubAdmin } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);

  // Gli admin di club possono sempre accedere, anche senza clubMode attivato
  const canAccessPlayers = clubMode || isClubAdmin(clubId);

  // 🎯 Calcola i ranking reali dalle partite (come in Classifica)
  const playersWithRealRating = React.useMemo(() => {
    if (!clubId || !players || !matchesLoaded) return players;

    // Filtra i giocatori del torneo
    const tournamentPlayers = players.filter(
      (p) => p.tournamentData?.isParticipant === true && p.tournamentData?.isActive === true
    );

    if (tournamentPlayers.length === 0) return players;

    // Calcola i ranking reali
    const rankingData = computeClubRanking(tournamentPlayers, matches, clubId);
    const rankingMap = new Map(rankingData.players.map((p) => [p.id, p.rating]));

    // Applica i rating calcolati ai giocatori
    return players.map((p) => ({
      ...p,
      calculatedRating: rankingMap.get(p.id) || p.rating,
    }));
  }, [clubId, players, matches, matchesLoaded]);

  // Crea playersById con i rating calcolati
  const playersByIdWithRating = React.useMemo(() => {
    const map = {};
    playersWithRealRating.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [playersWithRealRating]);

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
      await addPlayer(playerData);
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
      T={T}
      state={{ players: playersWithRealRating }}
      setState={() => {
        /* Legacy prop - now using direct Firebase functions */
      }}
      onOpenStats={handleOpenStats}
      playersById={playersByIdWithRating}
      onAddPlayer={handleAddPlayer}
      onUpdatePlayer={handleUpdatePlayer}
      onDeletePlayer={handleDeletePlayer}
    />
  );
}
