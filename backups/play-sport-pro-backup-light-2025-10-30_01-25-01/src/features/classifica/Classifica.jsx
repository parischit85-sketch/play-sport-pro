// =============================================
// FILE: src/features/classifica/Classifica.jsx
// FUTURISTIC REDESIGN: Glassmorphism design with dark mode support
// =============================================
import { useMemo, useRef, useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@services/firebase.js';
import Section from '@components/ui/Section.jsx';
import ShareButtons from '@components/ui/ShareButtons.jsx';
import { TrendArrow } from '@components/ui/TrendArrow.jsx';
import ModernAreaChart from '@components/ui/charts/ModernAreaChart.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { DEFAULT_RATING } from '@lib/ids.js';

export default function Classifica({ players, matches, onOpenStats, T }) {
  const classificaRef = useRef(null);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const { playersById, matches: clubMatches, clubId, tournamentMatches } = useClub();
  
  // State per champEntries di tutti i giocatori
  const [allChampEntries, setAllChampEntries] = useState({});

  // Combina match normali + match di torneo (come in StatisticheGiocatore)
  const allMatchesIncludingTournaments = useMemo(() => {
    const regular = clubMatches || matches || [];
    const tournament = tournamentMatches || [];
    return [...regular, ...tournament];
  }, [clubMatches, matches, tournamentMatches]);

  // Classifica generale (RPA) - RIPRISTINATO: usa rating calcolati dinamicamente
  const rows = useMemo(() => {
    // Usa il ranking effettivo calcolato nel ClubContext (inclusi Punti Campionato)
    return [...players]
      .map((p) => {
        const effectiveRating =
          playersById?.[p.id]?.calculatedRating ?? p.rating ?? p.baseRating ?? 1500;
        return {
          ...p,
          rating: Number(effectiveRating),
          winRate:
            (p.wins || 0) + (p.losses || 0)
              ? ((p.wins || 0) / ((p.wins || 0) + (p.losses || 0))) * 100
              : 0,
        };
      })
      .sort((a, b) => b.rating - a.rating);
  }, [players, playersById]);

  // Carica champEntries per tutti i top 5 giocatori
  useEffect(() => {
    if (!clubId || !rows || rows.length === 0) {
      setAllChampEntries({});
      return;
    }

    const top5 = rows.slice(0, 5);
    const unsubscribers = [];

    top5.forEach((player) => {
      const entriesRef = collection(db, 'clubs', clubId, 'leaderboard', player.id, 'entries');
      const q = query(entriesRef, orderBy('createdAt', 'desc'));
      
      const unsub = onSnapshot(q, (snap) => {
        const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllChampEntries((prev) => ({
          ...prev,
          [player.id]: entries,
        }));
      });

      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [clubId, rows]);

  // Classifica Coppie - Algoritmo corretto per coppie reali
  const couplesStats = useMemo(() => {
    const coupleResults = new Map(); // key: "playerId1_playerId2", value: statistiche
    const MIN_MATCHES = 2; // Ridotto a 2 per mostrare più coppie

    // Step 1: Analizza ogni match per trovare tutte le coppie e i loro risultati
    for (const match of allMatchesIncludingTournaments) {
      // Validazione match
      if (
        !Array.isArray(match.teamA) ||
        !Array.isArray(match.teamB) ||
        match.teamA.length !== 2 ||
        match.teamB.length !== 2 ||
        !Array.isArray(match.sets) ||
        match.sets.length === 0
      ) {
        continue;
      }

      // Determina il vincitore
      let winner = null;
      if (match.winner === 'A' || match.winner === 'B') {
        winner = match.winner;
      } else if (match.sets && match.sets.length > 0) {
        const aSets = match.sets.reduce((acc, s) => {
          const a = Number(s?.a || 0);
          const b = Number(s?.b || 0);
          return acc + (a > b ? 1 : 0);
        }, 0);
        const bSets = match.sets.reduce((acc, s) => {
          const a = Number(s?.a || 0);
          const b = Number(s?.b || 0);
          return acc + (b > a ? 1 : 0);
        }, 0);

        if (aSets > bSets) winner = 'A';
        else if (bSets > aSets) winner = 'B';
      }

      if (!winner) continue;

      // Crea le chiavi per le due coppie (sempre ordinate)
      const coupleA = [...match.teamA].sort().join('_');
      const coupleB = [...match.teamB].sort().join('_');

      // Inizializza le coppie se non esistono
      [coupleA, coupleB].forEach((coupleKey) => {
        if (!coupleResults.has(coupleKey)) {
          const teamIds = coupleKey.split('_');
          const player1 = players.find((p) => p.id === teamIds[0]);
          const player2 = players.find((p) => p.id === teamIds[1]);

          coupleResults.set(coupleKey, {
            player1: {
              id: teamIds[0],
              name: player1?.name || 'Unknown',
            },
            player2: {
              id: teamIds[1],
              name: player2?.name || 'Unknown',
            },
            wins: 0,
            losses: 0,
            matches: 0,
            gamesWon: 0,
            gamesLost: 0,
            setsWon: 0,
            setsLost: 0,
          });
        }
      });

      // Calcola statistiche del match
      const totalGamesA = match.sets.reduce((acc, s) => acc + Number(s?.a || 0), 0);
      const totalGamesB = match.sets.reduce((acc, s) => acc + Number(s?.b || 0), 0);
      const totalSetsA = match.sets.reduce((acc, s) => {
        const a = Number(s?.a || 0);
        const b = Number(s?.b || 0);
        return acc + (a > b ? 1 : 0);
      }, 0);
      const totalSetsB = match.sets.reduce((acc, s) => {
        const a = Number(s?.a || 0);
        const b = Number(s?.b || 0);
        return acc + (b > a ? 1 : 0);
      }, 0);

      // Aggiorna le statistiche delle coppie
      const statsA = coupleResults.get(coupleA);
      const statsB = coupleResults.get(coupleB);

      statsA.matches++;
      statsB.matches++;

      if (winner === 'A') {
        // Coppia A vince
        statsA.wins++;
        statsA.gamesWon += totalGamesA;
        statsA.gamesLost += totalGamesB;
        statsA.setsWon += totalSetsA;
        statsA.setsLost += totalSetsB;

        // Coppia B perde
        statsB.losses++;
        statsB.gamesWon += totalGamesB;
        statsB.gamesLost += totalGamesA;
        statsB.setsWon += totalSetsB;
        statsB.setsLost += totalSetsA;
      } else {
        // Coppia B vince
        statsB.wins++;
        statsB.gamesWon += totalGamesB;
        statsB.gamesLost += totalGamesA;
        statsB.setsWon += totalSetsB;
        statsB.setsLost += totalSetsA;

        // Coppia A perde
        statsA.losses++;
        statsA.gamesWon += totalGamesA;
        statsA.gamesLost += totalGamesB;
        statsA.setsWon += totalSetsA;
        statsA.setsLost += totalSetsB;
      }
    }

    // Step 2: Converte in array e calcola le metriche finali
    const couplesArray = Array.from(coupleResults.entries()).map(([coupleKey, stats]) => {
      const winRate = stats.matches > 0 ? (stats.wins / stats.matches) * 100 : 0;
      const gameEfficiency =
        stats.gamesWon + stats.gamesLost > 0
          ? (stats.gamesWon / (stats.gamesWon + stats.gamesLost)) * 100
          : 0;
      const setEfficiency =
        stats.setsWon + stats.setsLost > 0
          ? (stats.setsWon / (stats.setsWon + stats.setsLost)) * 100
          : 0;

      return {
        key: coupleKey,
        players: [stats.player1.name, stats.player2.name],
        playerIds: [stats.player1.id, stats.player2.id],
        wins: stats.wins,
        losses: stats.losses,
        matches: stats.matches,
        winRate: winRate,
        gameEfficiency: gameEfficiency,
        setEfficiency: setEfficiency,
        gamesWon: stats.gamesWon,
        gamesLost: stats.gamesLost,
        setsWon: stats.setsWon,
        setsLost: stats.setsLost,
      };
    });

    // Step 3: Filtra e ordina
    const filteredCouples = couplesArray.filter((couple) => couple.matches >= MIN_MATCHES);

    return filteredCouples.sort((a, b) => {
      // 1. Prima per win rate (percentuale vittorie)
      if (Math.abs(b.winRate - a.winRate) > 0.1) {
        return b.winRate - a.winRate;
      }
      // 2. A parità di win rate, per numero vittorie assolute
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      // 3. A parità di vittorie, per game efficiency
      if (Math.abs(b.gameEfficiency - a.gameEfficiency) > 0.1) {
        return b.gameEfficiency - a.gameEfficiency;
      }
      // 4. A parità, per numero partite giocate (più esperienza)
      if (b.matches !== a.matches) {
        return b.matches - a.matches;
      }
      // 5. Ordine alfabetico per consistenza
      const nameA = `${a.players[0]} & ${a.players[1]}`.toLowerCase();
      const nameB = `${b.players[0]} & ${b.players[1]}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [players, allMatchesIncludingTournaments]);

  // Classifica Efficienza
  const efficiencyStats = useMemo(() => {
    const playerStats = new Map();

    allMatchesIncludingTournaments.forEach((match) => {
      const teamAWins = match.sets.reduce((acc, set) => acc + (set.a > set.b ? 1 : 0), 0);
      const teamBWins = match.sets.reduce((acc, set) => acc + (set.b > set.a ? 1 : 0), 0);

      // Calcola i game totali per efficienza
      const totalGamesA = match.sets.reduce((acc, set) => acc + set.a, 0);
      const totalGamesB = match.sets.reduce((acc, set) => acc + set.b, 0);

      // Assegna statistiche ai team
      match.teamA.forEach((playerId) => {
        if (!playerStats.has(playerId)) {
          const player = players.find((p) => p.id === playerId);
          playerStats.set(playerId, {
            id: playerId,
            name: player?.name || 'Unknown',
            wins: 0,
            losses: 0,
            gamesWon: 0,
            gamesLost: 0,
            matches: 0,
          });
        }
        const stats = playerStats.get(playerId);
        stats.matches++;
        if (teamAWins > teamBWins) {
          stats.wins++;
          stats.gamesWon += totalGamesA;
          stats.gamesLost += totalGamesB;
        } else {
          stats.losses++;
          stats.gamesWon += totalGamesA;
          stats.gamesLost += totalGamesB;
        }
      });

      match.teamB.forEach((playerId) => {
        if (!playerStats.has(playerId)) {
          const player = players.find((p) => p.id === playerId);
          playerStats.set(playerId, {
            id: playerId,
            name: player?.name || 'Unknown',
            wins: 0,
            losses: 0,
            gamesWon: 0,
            gamesLost: 0,
            matches: 0,
          });
        }
        const stats = playerStats.get(playerId);
        stats.matches++;
        if (teamBWins > teamAWins) {
          stats.wins++;
          stats.gamesWon += totalGamesB;
          stats.gamesLost += totalGamesA;
        } else {
          stats.losses++;
          stats.gamesWon += totalGamesB;
          stats.gamesLost += totalGamesA;
        }
      });
    });

    return Array.from(playerStats.values())
      .filter((player) => player.matches >= 3) // Minimo 3 partite
      .map((player) => ({
        ...player,
        winRate: (player.wins / player.matches) * 100,
        gameEfficiency: (player.gamesWon / (player.gamesWon + player.gamesLost)) * 100,
        efficiency:
          ((player.wins / player.matches) * 0.7 +
            (player.gamesWon / (player.gamesWon + player.gamesLost)) * 0.3) *
          100,
      }))
      .sort((a, b) => b.efficiency - a.efficiency);
  }, [players, allMatchesIncludingTournaments]);

  // Classifica Streak positive e Ingiocabili
  const streakStats = useMemo(() => {
    const playerStreaks = new Map();

    // Ordina le partite per data
    const sortedMatches = [...allMatchesIncludingTournaments].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    sortedMatches.forEach((match) => {
      const teamAWins = match.sets.reduce((acc, set) => acc + (set.a > set.b ? 1 : 0), 0);
      const teamBWins = match.sets.reduce((acc, set) => acc + (set.b > set.a ? 1 : 0), 0);

      const winners = teamAWins > teamBWins ? match.teamA : match.teamB;

      [...match.teamA, ...match.teamB].forEach((playerId) => {
        if (!playerStreaks.has(playerId)) {
          const player = players.find((p) => p.id === playerId);
          playerStreaks.set(playerId, {
            id: playerId,
            name: player?.name || 'Unknown',
            currentStreak: 0,
            bestWinStreak: 0,
            worstLossStreak: 0,
            streakType: 'none', // 'win', 'loss', 'none'
            isActive: true,
            totalWins: 0,
            totalLosses: 0,
            totalMatches: 0,
          });
        }

        const playerData = playerStreaks.get(playerId);
        const isWinner = winners.includes(playerId);
        playerData.totalMatches++;

        if (isWinner) {
          playerData.totalWins++;
          if (playerData.streakType === 'win') {
            playerData.currentStreak++;
          } else {
            playerData.currentStreak = 1;
            playerData.streakType = 'win';
          }
          if (playerData.currentStreak > playerData.bestWinStreak) {
            playerData.bestWinStreak = playerData.currentStreak;
          }
        } else {
          playerData.totalLosses++;
          if (playerData.streakType === 'loss') {
            playerData.currentStreak++;
          } else {
            playerData.currentStreak = 1;
            playerData.streakType = 'loss';
          }
          if (playerData.currentStreak > playerData.worstLossStreak) {
            playerData.worstLossStreak = playerData.currentStreak;
          }
        }
      });
    });

    const positiveStreaks = Array.from(playerStreaks.values())
      .filter((player) => player.bestWinStreak > 0)
      .sort((a, b) => {
        if (b.bestWinStreak !== a.bestWinStreak) return b.bestWinStreak - a.bestWinStreak;
        if (a.streakType === 'win' && b.streakType !== 'win') return -1;
        if (b.streakType === 'win' && a.streakType !== 'win') return 1;
        return b.currentStreak - a.currentStreak;
      });

    // Classifica "Ingiocabili" - Minor rapporto sconfitte/partite giocate
    const ingiocabili = Array.from(playerStreaks.values())
      .filter((player) => player.totalMatches >= 3) // Minimo 3 partite
      .map((player) => ({
        ...player,
        lossRatio: player.totalMatches > 0 ? (player.totalLosses / player.totalMatches) * 100 : 0,
        winRate: player.totalMatches > 0 ? (player.totalWins / player.totalMatches) * 100 : 0,
      }))
      .sort((a, b) => {
        // Ordina per minor rapporto sconfitte (migliori primi)
        if (a.lossRatio !== b.lossRatio) return a.lossRatio - b.lossRatio;
        // A parità, privilegia chi ha giocato di più
        return b.totalMatches - a.totalMatches;
      });

    return { positive: positiveStreaks, ingiocabili: ingiocabili };
  }, [players, allMatchesIncludingTournaments]);

  // Timeline per grafico evoluzione Top 5
  const { podiumTimeline, topPlayers } = useMemo(() => {
    const allMatches = clubMatches || matches || [];

    // 🔍 DEBUG: Verifica allChampEntries
    // Debug logging removed for production

    // Helper per convertire date Firestore/string/number
    const toDate = (d) => {
      if (!d) return null;
      if (typeof d === 'number') return new Date(d);
      if (d?.toDate) return d.toDate();
      return new Date(d);
    };

    // Prendi i top 5 giocatori
    const top5 = rows.slice(0, 5);
    if (top5.length === 0) return { podiumTimeline: [], topPlayers: [] };

    const topPlayers = top5.map((p) => ({ id: p.id, name: p.name, rating: p.rating }));

    // Costruisci timeline per ogni giocatore del top 5 (ESATTAMENTE come in Statistiche)
    const allTimelines = top5.map((player) => {
      const pid = player.id;

      // Combina match normali e tornei come "movimenti"
      const movements = [];

      // 1. Match normali (non di torneo) - USA deltaA/deltaB
      const regularMatches = allMatches.filter(
        (m) => (m.teamA?.includes(pid) || m.teamB?.includes(pid)) && !m.isTournamentMatch
      );

      regularMatches.forEach((m) => {
        const isTeamA = m.teamA?.includes(pid);
        const delta = isTeamA ? (m.deltaA ?? 0) : (m.deltaB ?? 0);
        movements.push({
          date: new Date(m.date),
          delta: delta,
          type: 'match',
          label: 'Match',
        });
      });

      // 2. Tornei come SINGOLO MOVIMENTO - USA entry.points TOTALI
      const playerEntries = allChampEntries[pid] || [];
      if (Array.isArray(playerEntries)) {
        playerEntries.forEach((entry) => {
          // Verifica se il giocatore ha partecipato a questo torneo
          const participated = entry.matchDetails?.some(
            (m) => m.teamA?.includes(pid) || m.teamB?.includes(pid)
          );

          if (participated) {
            // USA I PUNTI TOTALI DEL TORNEO (entry.points), NON i delta dei singoli match
            const tournamentPoints = Number(entry.points || 0);
            const date = toDate(entry.createdAt) || toDate(entry.appliedAt) || new Date();
            
            movements.push({
              date: date,
              delta: tournamentPoints,
              type: 'tournament',
              label: entry.tournamentName || 'Torneo',
            });
          }
        });
      }

      // Ordina per data
      movements.sort((a, b) => a.date - b.date);

      // Prendi solo gli ultimi 5 movimenti
      const lastMovements = movements.slice(-5);

      // Rating attuale (finale) del giocatore
      const currentRating = player.rating ?? DEFAULT_RATING;

      // Se non ha movimenti, restituisci solo il rating attuale
      if (lastMovements.length === 0) {
        return {
          playerId: pid,
          playerName: player.name,
          points: [{ date: null, label: 'Start', rating: Math.round(currentRating) }],
        };
      }

      // **NUOVA LOGICA: Mov. 5 = rating attuale, andiamo INDIETRO**
      const points = [];

      // Calcola rating iniziale sottraendo tutti i delta dal rating attuale
      let startRating = currentRating;
      for (let i = lastMovements.length - 1; i >= 0; i--) {
        startRating -= lastMovements[i].delta;
      }

      // Punto iniziale (Start)
      points.push({
        date: null,
        label: 'Start',
        rating: Math.round(startRating),
      });

      // Se ci sono meno di 5 movimenti, crea una linea retta fino al primo movimento
      const numMovements = lastMovements.length;
      if (numMovements < 5) {
        // Crea movimenti fittizi da Mov. 1 a Mov. (5 - numMovements) con rating = startRating
        for (let i = 1; i <= 5 - numMovements; i++) {
          points.push({
            date: null,
            label: `Mov. ${i}`,
            rating: Math.round(startRating),
          });
        }
      }

      // Ora aggiungi i movimenti REALI partendo dal rating iniziale
      let rating = startRating;
      const offset = 5 - numMovements; // Offset per etichette corrette
      for (let i = 0; i < lastMovements.length; i++) {
        rating += lastMovements[i].delta;
        points.push({
          date: null,
          label: `Mov. ${offset + i + 1}`,
          rating: Math.round(rating),
        });
      }

      return {
        playerId: pid,
        playerName: player.name,
        points: points,
      };
    });

    // Trova il numero massimo di punti tra tutti i giocatori
    const maxPoints = Math.max(...allTimelines.map((tl) => tl.points.length));

    // Costruisci array combinato con LABEL come xKey (esattamente come Statistiche)
    const combinedData = [];

    for (let i = 0; i < maxPoints; i++) {
      // Usa la label del primo giocatore che ha questo punto
      const firstPlayerWithPoint = allTimelines.find((tl) => i < tl.points.length);
      const label = firstPlayerWithPoint ? firstPlayerWithPoint.points[i].label : `Mov. ${i}`;

      const dataPoint = { label: label };

      // Aggiungi il rating di ogni giocatore per questo punto
      allTimelines.forEach((tl) => {
        if (i < tl.points.length) {
          // Il giocatore ha dati per questo punto
          dataPoint[tl.playerName] = tl.points[i].rating;
        } else {
          // Il giocatore non ha dati - usa il primo valore (linea piatta indietro)
          dataPoint[tl.playerName] = tl.points[0].rating;
        }
      });

      combinedData.push(dataPoint);
    }

    // DEBUG: Log dei dati del grafico
    // Debug logging removed for production

    return { podiumTimeline: combinedData, topPlayers };
  }, [rows, clubMatches, allChampEntries, matches]);

  const buildCaption = () => {
    const lines = [
      'Classifica Sporting Cat',
      ...rows.slice(0, 10).map((p, i) => `${i + 1}. ${p.name} — ${Math.round(p.rating)} pt`),
      '#SportingCat #Padel',
    ];
    return lines.join('\n');
  };
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}#classifica`
      : '';

  return (
    <Section
      title="Dashboard Classifiche"
      right={
        <ShareButtons
          size="sm"
          title="Classifica Sporting Cat"
          url={shareUrl}
          captureRef={classificaRef}
          captionBuilder={buildCaption}
          T={T}
        />
      }
      T={T}
    >
      <div ref={classificaRef} className="space-y-8">
        {/* Ranking RPA Card - Futuristic Design */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/30 p-6 pb-8 md:pb-28 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  🏆
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Ranking RPA
                </h3>
              </div>
              <button
                onClick={() => setShowAllPlayers(!showAllPlayers)}
                className={`px-4 py-2 text-sm rounded-xl border backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${
                  showAllPlayers
                    ? 'bg-blue-500/30 border-blue-400/50 text-blue-300 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-600/70 border-gray-600/50 text-gray-300 hover:bg-gray-600/70 shadow-lg'
                }`}
              >
                {showAllPlayers ? '📊 Mostra Top 10' : '📋 Mostra Tutti'}
              </button>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600/30 text-gray-300">
                    <th className="py-3 px-1 sm:px-2 font-semibold text-center">#</th>
                    <th className="py-3 px-1 sm:px-2 font-semibold text-left">Giocatore</th>
                    <th className="py-3 px-1 sm:px-2 font-semibold text-center">Ranking</th>
                    <th className="py-3 px-1 sm:px-2 font-semibold text-center">Vittorie</th>
                    <th className="py-3 px-1 sm:px-2 font-semibold text-center">Sconfitte</th>
                    <th className="py-3 px-1 sm:px-2 font-semibold text-center">% Vitt.</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllPlayers ? rows : rows.slice(0, 10)).map((p, idx) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-700/20 hover:bg-gray-700/30 transition-all duration-200"
                    >
                      <td className="py-3 px-1 sm:px-2 font-semibold text-gray-200 text-center">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-1 sm:px-2 text-left">
                        <button
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-left break-words"
                          onClick={() => onOpenStats(p.id)}
                        >
                          {p.name}
                        </button>
                      </td>
                      <td className="py-3 px-1 sm:px-2 font-bold text-white text-center">
                        {Math.round(p.rating)}
                        <TrendArrow total={p.trend5Total} pos={p.trend5Pos} neg={p.trend5Neg} />
                      </td>
                      <td className="py-3 px-1 sm:px-2 text-green-400 font-semibold text-center">
                        {p.wins || 0}
                      </td>
                      <td className="py-3 px-1 sm:px-2 text-red-400 font-semibold text-center">
                        {p.losses || 0}
                      </td>
                      <td className="py-3 px-1 sm:px-2 font-bold text-gray-200 text-center">
                        {p.winRate.toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Indicatore se ci sono più giocatori */}
              {!showAllPlayers && rows.length > 10 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllPlayers(true)}
                    className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-700/30"
                  >
                    ... e altri {rows.length - 10} giocatori
                  </button>
                </div>
              )}
            </div>

            {/* Grafico Evoluzione Rating Top 5 */}
            {podiumTimeline.length > 0 && (
              <div className="mt-6 bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-600/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg shadow-md">
                    📈
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    Evoluzione Rating - Top 5
                  </h4>
                </div>
                <ModernAreaChart
                  data={podiumTimeline}
                  chartId="classifica-top5"
                  title="Ultimi 10 movimenti"
                  multiPlayer={true}
                  top5Players={topPlayers}
                  xKey="label"
                  yKey="rating"
                />
              </div>
            )}
          </div>
        </div>

        {/* Grid per le altre classifiche - Futuristic Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mt-16 md:mt-24">
          {/* Coppie Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/30 p-4 md:p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  👥
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Migliori Coppie
                </h3>
              </div>

              <div className="mb-4 p-3 bg-amber-900/20 backdrop-blur-sm rounded-xl border border-amber-800/30">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 text-sm">ℹ️</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-200 mb-1">
                      Come funziona:
                    </p>
                    <p className="text-sm text-amber-300">
                      Ordinate per % vittorie. Solo coppie con ≥2 partite.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile layout - ultra compact single line */}
              <div className="block md:hidden space-y-2">
                {couplesStats.slice(0, 8).map((couple, idx) => (
                  <div
                    key={couple.key}
                    className="flex items-center justify-between py-2 px-3 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/20 hover:bg-gray-600/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-400 w-6">
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-100">
                        {couple.players[0].split(' ').pop()} & {couple.players[1].split(' ').pop()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400 font-semibold">
                        {couple.wins}V
                      </span>
                      <span className="text-red-400 font-semibold">
                        {couple.losses}S
                      </span>
                      <span className="font-bold text-amber-300">
                        {couple.winRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-600/30 text-gray-300">
                      <th className="py-3 pr-3 font-semibold">#</th>
                      <th className="py-3 pr-3 font-semibold">Coppia</th>
                      <th className="py-3 pr-3 font-semibold">V/S</th>
                      <th className="py-3 pr-3 font-semibold">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couplesStats.slice(0, 8).map((couple, idx) => (
                      <tr
                        key={couple.key}
                        className="border-b border-gray-700/20 hover:bg-gray-700/30 transition-all duration-200"
                      >
                        <td className="py-3 pr-3 font-semibold text-gray-200">
                          {idx + 1}
                        </td>
                        <td className="py-3 pr-3 font-medium text-sm text-gray-100">
                          {couple.players[0]} & {couple.players[1]}
                        </td>
                        <td className="py-3 pr-3 text-sm">
                          <span className="text-green-400 font-semibold">
                            {couple.wins}
                          </span>
                          /
                          <span className="text-red-400 font-semibold">
                            {couple.losses}
                          </span>
                        </td>
                        <td className="py-3 pr-3 font-bold text-amber-300">
                          {couple.winRate.toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Efficienza Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/30 p-4 md:p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  ⚡
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Classifica Efficienza
                </h3>
              </div>

              <div className="mb-4 p-3 bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-800/30">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 text-sm">⚡</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-200 mb-1">
                      Formula:
                    </p>
                    <p className="text-sm text-blue-300">
                      % vittorie (70%) + % game vinti (30%).
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile layout - ultra compact single line */}
              <div className="block md:hidden space-y-2">
                {efficiencyStats.slice(0, 8).map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between py-2 px-3 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/20 hover:bg-gray-600/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-400 w-6">
                        #{idx + 1}
                      </span>
                      <button
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                        onClick={() => onOpenStats(player.id)}
                      >
                        {player.name}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400 font-semibold">
                        {player.wins}V
                      </span>
                      <span className="text-red-400 font-semibold">
                        {player.losses}S
                      </span>
                      <span className="font-bold text-blue-300">
                        {player.efficiency.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-600/30 text-gray-300">
                      <th className="py-3 pr-3 font-semibold">#</th>
                      <th className="py-3 pr-3 font-semibold">Giocatore</th>
                      <th className="py-3 pr-3 font-semibold">Eff.</th>
                      <th className="py-3 pr-3 font-semibold">V/S</th>
                    </tr>
                  </thead>
                  <tbody>
                    {efficiencyStats.slice(0, 8).map((player, idx) => (
                      <tr
                        key={player.id}
                        className="border-b border-gray-700/20 hover:bg-gray-700/30 transition-all duration-200"
                      >
                        <td className="py-3 pr-3 font-semibold text-gray-200">
                          {idx + 1}
                        </td>
                        <td className="py-3 pr-3">
                          <button
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                            onClick={() => onOpenStats(player.id)}
                          >
                            {player.name}
                          </button>
                        </td>
                        <td className="py-3 pr-3 font-bold text-blue-400">
                          {player.efficiency.toFixed(1)}%
                        </td>
                        <td className="py-3 pr-3 text-sm">
                          <span className="text-green-400 font-semibold">
                            {player.wins}
                          </span>
                          /
                          <span className="text-red-400 font-semibold">
                            {player.losses}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Streak Positive Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/30 p-4 md:p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  🔥
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Streak Vittorie
                </h3>
              </div>

              <div className="mb-4 p-3 bg-green-900/20 backdrop-blur-sm rounded-xl border border-green-800/30">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-sm">🔥</span>
                  <div>
                    <p className="text-sm font-semibold text-green-200 mb-1">
                      Streak vittorie:
                    </p>
                    <p className="text-sm text-green-300">
                      Migliore serie consecutiva. 🔥 = serie attiva.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile layout - ultra compact single line */}
              <div className="block md:hidden space-y-2">
                {streakStats.positive.slice(0, 8).map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between py-2 px-3 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/20 hover:bg-gray-600/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-400 w-6">
                        #{idx + 1}
                      </span>
                      <button
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                        onClick={() => onOpenStats(player.id)}
                      >
                        {player.name}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {player.streakType === 'win' ? (
                        <span className="text-green-400 font-semibold">
                          🔥{player.currentStreak}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                      <span className="font-bold text-green-300">
                        {player.bestWinStreak}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-600/30 text-gray-300">
                      <th className="py-3 pr-3 font-semibold">#</th>
                      <th className="py-3 pr-3 font-semibold">Giocatore</th>
                      <th className="py-3 pr-3 font-semibold">Miglior</th>
                      <th className="py-3 pr-3 font-semibold">Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streakStats.positive.slice(0, 8).map((player, idx) => (
                      <tr
                        key={player.id}
                        className="border-b border-gray-700/20 hover:bg-gray-700/30 transition-all duration-200"
                      >
                        <td className="py-3 pr-3 font-semibold text-gray-200">
                          {idx + 1}
                        </td>
                        <td className="py-3 pr-3">
                          <button
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                            onClick={() => onOpenStats(player.id)}
                          >
                            {player.name}
                          </button>
                        </td>
                        <td className="py-3 pr-3 font-bold text-green-400">
                          {player.bestWinStreak}
                        </td>
                        <td className="py-3 pr-3">
                          {player.streakType === 'win' ? (
                            <span className="text-sm text-green-400 font-semibold">
                              🔥 +{player.currentStreak}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Ingiocabili Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/30 p-4 md:p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  🛡️
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Ingiocabili
                </h3>
              </div>

              <div className="mb-4 p-3 bg-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-800/30">
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 text-sm">🛡️</span>
                  <div>
                    <p className="text-sm font-semibold text-purple-200 mb-1">
                      Ingiocabili:
                    </p>
                    <p className="text-sm text-purple-300">
                      Minor % sconfitte. Più basso = più difficile da battere.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile layout - ultra compact single line */}
              <div className="block md:hidden space-y-2">
                {streakStats.ingiocabili.slice(0, 8).map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between py-2 px-3 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/20 hover:bg-gray-600/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-purple-400 w-6">
                        #{idx + 1}
                      </span>
                      <button
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                        onClick={() => onOpenStats(player.id)}
                      >
                        {player.name}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400 font-semibold">
                        {player.totalWins}V
                      </span>
                      <span className="text-red-400 font-semibold">
                        {player.totalLosses}S
                      </span>
                      <span className="font-bold text-purple-300">
                        {player.lossRatio.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-600/30 text-gray-300">
                      <th className="py-3 pr-3 font-semibold">#</th>
                      <th className="py-3 pr-3 font-semibold">Giocatore</th>
                      <th className="py-3 pr-3 font-semibold">% Sconf.</th>
                      <th className="py-3 pr-3 font-semibold">V/S</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streakStats.ingiocabili.slice(0, 8).map((player, idx) => (
                      <tr
                        key={player.id}
                        className="border-b border-gray-700/20 hover:bg-gray-700/30 transition-all duration-200"
                      >
                        <td className="py-3 pr-3 font-semibold text-gray-200">
                          {idx + 1}
                        </td>
                        <td className="py-3 pr-3">
                          <button
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                            onClick={() => onOpenStats(player.id)}
                          >
                            {player.name}
                          </button>
                        </td>
                        <td className="py-3 pr-3 font-bold text-purple-400">
                          {player.lossRatio.toFixed(1)}%
                        </td>
                        <td className="py-3 pr-3 text-sm">
                          <span className="text-green-400 font-semibold">
                            {player.totalWins}
                          </span>
                          /
                          <span className="text-red-400 font-semibold">
                            {player.totalLosses}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

