// =============================================
// FILE: src/pages/ClassificaPage.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase.js';
import { themeTokens } from '@lib/theme.js';
import { useClub } from '@contexts/ClubContext.jsx';
import { computeClubRanking } from '@lib/ranking-club.js';
import Classifica from '@features/classifica/Classifica.jsx';

export default function ClassificaPage() {
  const navigate = useNavigate();
  const { clubId, players, playersLoaded, matches, matchesLoaded, leaderboard } = useClub();
  const [tournamentMatches, setTournamentMatches] = useState([]);
  const T = React.useMemo(() => themeTokens(), []);

  const handleOpenStats = (playerId) => {
    if (clubId) {
      navigate(`/club/${clubId}/stats?player=${playerId}`);
    } else {
      navigate(`/stats?player=${playerId}`);
    }
  };

  // Load tournament matchDetails from leaderboard entries
  useEffect(() => {
    if (!clubId || !playersLoaded) return;

    const loadTournamentMatches = async () => {
      try {
        console.time('⚡ [ClassificaPage] Parallel loading tournament matches');
        const allMatches = [];
        const matchIds = new Set();

        // 🚀 OTTIMIZZAZIONE: Carica tutte le entries in PARALLELO invece di sequenzialmente
        const playerPromises = players.map(async (player) => {
          try {
            const entriesRef = collection(db, 'clubs', clubId, 'leaderboard', player.id, 'entries');
            const entriesSnap = await getDocs(entriesRef);
            return { playerId: player.id, docs: entriesSnap.docs };
          } catch (e) {
            console.warn(`Failed to load entries for player ${player.id}:`, e);
            return { playerId: player.id, docs: [] };
          }
        });

        // Attendi tutte le query in parallelo
        const results = await Promise.all(playerPromises);

        // Processa i risultati
        for (const { docs } of results) {
          for (const entryDoc of docs) {
            const entry = entryDoc.data();
            if (Array.isArray(entry.matchDetails)) {
              console.log(
                `📊 [ClassificaPage] Entry ${entryDoc.id}: ${entry.matchDetails.length} matchDetails`
              );
              for (const match of entry.matchDetails) {
                // Avoid duplicates
                if (!matchIds.has(match.matchId || match.id)) {
                  console.log(`  ✅ Adding match: ${match.matchId || match.id}`);
                  allMatches.push(match);
                  matchIds.add(match.matchId || match.id);
                }
              }
            }
          }
        }

        console.timeEnd('⚡ [ClassificaPage] Parallel loading tournament matches');
        console.log(`🏆 [ClassificaPage] Total tournament matches loaded: ${allMatches.length}`);
        if (allMatches.length > 0) {
          console.log(`  First match keys:`, Object.keys(allMatches[0]).join(', '));
        }
        setTournamentMatches(allMatches);
      } catch (e) {
        console.warn('Failed to load tournament matches:', e);
      }
    };

    loadTournamentMatches();
  }, [clubId, players, playersLoaded]);

  // I dati si caricano automaticamente nel ClubContext quando cambia clubId

  const rankingData = React.useMemo(() => {
    if (!clubId) return { players: [], matches: [] };
    const srcPlayers = playersLoaded ? players : [];
    const srcMatches = matchesLoaded ? matches : [];

    // 🏆 FILTRO CAMPIONATO: Solo giocatori che partecipano attivamente al campionato
    const tournamentPlayers = srcPlayers.filter(
      (player) =>
        player.tournamentData?.isParticipant === true && player.tournamentData?.isActive === true
    );

    console.log('🎯 [ClassificaPage] ========== CALCOLO RANKING ==========');
    console.log('📊 Tournament players:', tournamentPlayers.length);
    console.log('📊 Regular matches:', srcMatches.length);
    console.log('📊 Tournament matches:', tournamentMatches.length);
    console.log('📊 Leaderboard entries:', Object.keys(leaderboard || {}).length);

    // Combine regular matches with tournament matches
    const combinedMatches = [...srcMatches, ...tournamentMatches];

    const ranking = computeClubRanking(tournamentPlayers, combinedMatches, clubId, {
      leaderboardMap: leaderboard,
    });

    console.log('🏆 [ClassificaPage] Ranking calcolato:');
    ranking.players.slice(0, 5).forEach((p, i) => {
      console.log(
        `  ${i + 1}. ${p.name}: rating=${p.rating}, baseRating=${p.baseRating || p.rating}`
      );
    });
    console.log('==========================================');

    return ranking;
  }, [clubId, players, playersLoaded, matches, matchesLoaded, leaderboard, tournamentMatches]);

  return (
    <Classifica
      T={T}
      players={rankingData.players}
      matches={rankingData.matches}
      onOpenStats={handleOpenStats}
    />
  );
}
