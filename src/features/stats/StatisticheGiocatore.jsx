// =============================================
// FILE: src/features/stats/StatisticheGiocatore.jsx
// FUTURISTIC DESIGN - Modern UI with glassmorphism
// =============================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Section from '@ui/Section.jsx';
import StatsCard from '@ui/StatsCard.jsx';
import ShareButtons from '@ui/ShareButtons.jsx';
import ModernAreaChart from '@ui/charts/ModernAreaChart.jsx';
import Modal from '@ui/Modal.jsx';
import { byPlayerFirstAlpha, surnameOf, IT_COLLATOR } from '@lib/names.js';
import { DEFAULT_RATING } from '@lib/ids.js';
import { computeFromSets, rpaFactor, rpaBracketText } from '@lib/rpa.js';
import { FormulaRPA } from '@ui/formulas/FormulaRPA.jsx';

export default function StatisticheGiocatore({
  players,
  matches,
  selectedPlayerId,
  onSelectPlayer,
  onShowFormula,
  T,
}) {
  const statsRef = useRef(null);
  const [pid, setPid] = useState(selectedPlayerId || players[0]?.id || '');
  const [comparePlayerId, setComparePlayerId] = useState('');
  // Filtri periodo richiesti: 1w, 2w, 30d, 3m, 6m, all
  const [timeFilter, setTimeFilter] = useState('all');
  // Match espanso nello storico
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  // Modal RPA formula
  const [showRpaModal, setShowRpaModal] = useState(false);
  const [currentMatchForRpa, setCurrentMatchForRpa] = useState(null);

  useEffect(() => {
    if (selectedPlayerId) setPid(selectedPlayerId);
  }, [selectedPlayerId]);

  const nameById = (id) => players.find((p) => p.id === id)?.name || id;
  const player = players.find((p) => p.id === pid) || null;
  const comparePlayer = players.find((p) => p.id === comparePlayerId) || null;

  // Filtro temporale per le partite
  const filteredMatches = useMemo(() => {
    if (timeFilter === 'all') return matches;
    const now = new Date();
    const from = new Date();
    switch (timeFilter) {
      case '1w':
        from.setDate(now.getDate() - 7);
        break;
      case '2w':
        from.setDate(now.getDate() - 14);
        break;
      case '30d':
        from.setDate(now.getDate() - 30);
        break;
      case '3m':
        from.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        from.setMonth(now.getMonth() - 6);
        break;
      default:
        return matches;
    }
    return (matches || []).filter((m) => new Date(m.date) >= from);
  }, [matches, timeFilter]);

  console.log('📊 [DEBUG] Filtered matches:', {
    originalCount: matches?.length || 0,
    filteredCount: filteredMatches?.length || 0,
    timeFilter,
    sampleMatch: filteredMatches?.[0],
  });

  const sortedByRating = useMemo(() => {
    return [...players]
      .map((p) => ({
        ...p,
        liveRating: p.rating,
      }))
      .sort((a, b) => b.liveRating - a.liveRating);
  }, [players]);

  const position = player ? sortedByRating.findIndex((p) => p.id === player.id) + 1 : null;
  const totalPlayed = (player?.wins || 0) + (player?.losses || 0);
  const winPct = totalPlayed ? Math.round((player.wins / totalPlayed) * 100) : 0;

  // Statistiche avanzate del giocatore (usa filteredMatches)
  const advancedStats = useMemo(() => {
    console.log('📊 [DEBUG] Computing advanced stats for player:', pid);

    if (!pid) {
      console.log('📊 [DEBUG] No player ID selected');
      return null;
    }

    const playerMatches = (filteredMatches || []).filter(
      (m) => (m.teamA || []).includes(pid) || (m.teamB || []).includes(pid)
    );

    console.log('📊 [DEBUG] Player matches found:', {
      playerId: pid,
      matchesCount: playerMatches.length,
      sampleMatch: playerMatches[0],
    });

    if (playerMatches.length === 0) {
      console.log('📊 [DEBUG] No matches found for player');
      return null;
    }

    let maxWinStreak = 0;
    let maxLoseStreak = 0;
    let currentWinStreak = 0;
    let currentLoseStreak = 0;
    let wins = 0;
    let losses = 0;
    let totalDelta = 0;
    let gamesWon = 0;
    let gamesLost = 0;
    let closeMatches = 0; // 2-1 o 1-2
    let dominantWins = 0; // 2-0

    const sortedMatches = [...playerMatches].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedMatches.forEach((m) => {
      const isA = (m.teamA || []).includes(pid);
      const won = (isA && m.winner === 'A') || (!isA && m.winner === 'B');
      const delta = isA ? m.deltaA || 0 : m.deltaB || 0;

      totalDelta += delta;

      if (won) {
        wins++;
        currentWinStreak++;
        currentLoseStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);

        if ((isA && m.setsA === 2 && m.setsB === 0) || (!isA && m.setsB === 2 && m.setsA === 0)) {
          dominantWins++;
        }
      } else {
        losses++;
        currentLoseStreak++;
        currentWinStreak = 0;
        maxLoseStreak = Math.max(maxLoseStreak, currentLoseStreak);
      }

      // Calcola close matches (2-1 o 1-2)
      if ((m.setsA === 2 && m.setsB === 1) || (m.setsA === 1 && m.setsB === 2)) {
        closeMatches++;
      }

      // Calcola games
      if (isA) {
        gamesWon += m.gamesA || 0;
        gamesLost += m.gamesB || 0;
      } else {
        gamesWon += m.gamesB || 0;
        gamesLost += m.gamesA || 0;
      }
    });

    // Streak attuale sul periodo filtrato (continua finché non cambia risultato)
    let currentStreakCount = 0;
    let lastResult = null;
    for (let i = sortedMatches.length - 1; i >= 0; i--) {
      const m = sortedMatches[i];
      const isA = (m.teamA || []).includes(pid);
      const won = (isA && m.winner === 'A') || (!isA && m.winner === 'B');
      if (lastResult === null) {
        lastResult = won;
        currentStreakCount = 1;
      } else if (lastResult === won) {
        currentStreakCount++;
      } else {
        break;
      }
    }

    const avgDelta = totalDelta / playerMatches.length;
    const gameEfficiency = gamesWon + gamesLost > 0 ? (gamesWon / (gamesWon + gamesLost)) * 100 : 0;
    const dominanceRate = wins > 0 ? (dominantWins / wins) * 100 : 0;
    const clutchRate = closeMatches > 0 ? ((wins - dominantWins) / closeMatches) * 100 : 0;

    return {
      wins,
      losses,
      winRate: wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0,
      currentStreak:
        lastResult === null ? 0 : lastResult ? currentStreakCount : -currentStreakCount,
      maxWinStreak,
      maxLoseStreak,
      avgDelta: Math.round(avgDelta * 10) / 10,
      gameEfficiency: Math.round(gameEfficiency * 10) / 10,
      dominanceRate: Math.round(dominanceRate * 10) / 10,
      clutchRate: Math.round(clutchRate * 10) / 10,
      totalMatches: playerMatches.length,
      closeMatches,
      dominantWins,
    };
  }, [pid, filteredMatches]);

  // Nessun radar o barre: design semplificato come richiesto

  // Usa il nuovo componente StatsCard unificato
  const StatCard = ({ label, value, sub, trend, color = 'default' }) => (
    <StatsCard
      label={label}
      value={value}
      subtitle={sub}
      trend={trend}
      color={color}
      size="lg"
      T={T}
    />
  );

  const playersAlpha = useMemo(() => [...players].sort(byPlayerFirstAlpha), [players]);

  // Timeline rating personale
  const timeline = useMemo(() => {
    if (!pid) return [];

    // Usa i rating computati da props
    const current = new Map(players.map((p) => [p.id, p.rating]));

    const points = [];
    points.push({
      date: null,
      label: 'Start',
      rating: Math.round(current.get(pid) ?? DEFAULT_RATING),
    });

    const byDate = [...(filteredMatches || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    for (const m of byDate) {
      const rr = computeFromSets(m.sets);
      const add = (id, d) => current.set(id, (current.get(id) ?? DEFAULT_RATING) + d);
      const deltaA = m.deltaA ?? 0,
        deltaB = m.deltaB ?? 0;
      add(m.teamA[0], deltaA);
      add(m.teamA[1], deltaA);
      add(m.teamB[0], deltaB);
      add(m.teamB[1], deltaB);
      if (m.teamA.includes(pid) || m.teamB.includes(pid)) {
        points.push({
          date: new Date(m.date),
          label: new Date(m.date).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          rating: Math.round(current.get(pid) ?? DEFAULT_RATING),
        });
      }
    }
    return points;
  }, [pid, players, filteredMatches]);

  // Timeline per il giocatore di confronto
  const compareTimeline = useMemo(() => {
    if (!comparePlayerId) return [];

    // Usa i rating computati da props
    const current = new Map(players.map((p) => [p.id, p.rating]));

    const points = [];
    points.push({
      date: null,
      label: 'Start',
      rating: Math.round(current.get(comparePlayerId) ?? DEFAULT_RATING),
    });

    const byDate = [...(filteredMatches || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

    for (const m of byDate) {
      const rr = computeFromSets(m.sets);
      const add = (id, d) => current.set(id, (current.get(id) ?? DEFAULT_RATING) + d);
      const deltaA = m.deltaA ?? 0,
        deltaB = m.deltaB ?? 0;
      add(m.teamA[0], deltaA);
      add(m.teamA[1], deltaA);
      add(m.teamB[0], deltaB);
      add(m.teamB[1], deltaB);

      if (m.teamA.includes(comparePlayerId) || m.teamB.includes(comparePlayerId)) {
        points.push({
          date: new Date(m.date),
          label: new Date(m.date).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          rating: Math.round(current.get(comparePlayerId) ?? DEFAULT_RATING),
        });
      }
    }
    return points;
  }, [comparePlayerId, players, filteredMatches]);

  // Timeline combinata per il grafico di confronto
  const combinedTimeline = useMemo(() => {
    if (!comparePlayerId)
      return timeline.map((point) => ({ ...point, playerRating: point.rating }));

    // Crea un array di tutte le date uniche
    const allDates = new Set();
    timeline.forEach((point) => {
      if (point.date) allDates.add(point.date.getTime());
    });
    compareTimeline.forEach((point) => {
      if (point.date) allDates.add(point.date.getTime());
    });

    // Ordina le date
    const sortedDates = Array.from(allDates).sort();

    // Mappa per tracking dei rating correnti
    let playerRating = timeline[0]?.rating ?? DEFAULT_RATING;
    let compareRating = compareTimeline[0]?.rating ?? DEFAULT_RATING;

    const combined = [];

    // Punto iniziale
    combined.push({
      date: null,
      label: 'Start',
      playerRating: playerRating,
      compareRating: compareRating,
      rating: playerRating, // Per compatibilità
    });

    let playerIndex = 1; // Skip del punto iniziale
    let compareIndex = 1; // Skip del punto iniziale

    for (const dateTime of sortedDates) {
      const date = new Date(dateTime);

      // Aggiorna rating del player principale se c'è un punto in questa data
      while (
        playerIndex < timeline.length &&
        timeline[playerIndex].date &&
        timeline[playerIndex].date.getTime() <= dateTime
      ) {
        playerRating = timeline[playerIndex].rating;
        playerIndex++;
      }

      // Aggiorna rating del player di confronto se c'è un punto in questa data
      while (
        compareIndex < compareTimeline.length &&
        compareTimeline[compareIndex].date &&
        compareTimeline[compareIndex].date.getTime() <= dateTime
      ) {
        compareRating = compareTimeline[compareIndex].rating;
        compareIndex++;
      }

      combined.push({
        date: date,
        label: date.toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        playerRating: playerRating,
        compareRating: compareRating,
        rating: playerRating, // Per compatibilità con la linea principale
      });
    }

    return combined;
  }, [timeline, compareTimeline, comparePlayerId]);

  const partnerAndOppStats = useMemo(() => {
    if (!pid)
      return {
        mates: [],
        opps: [],
        topMates: [],
        worstMates: [],
        topOpps: [],
        worstOpps: [],
      };
    const played = (filteredMatches || []).filter(
      (m) => (m.teamA || []).includes(pid) || (m.teamB || []).includes(pid)
    );
    const matesMap = new Map();
    const oppsMap = new Map();

    const bump = (map, id, won) => {
      if (!id) return;
      const cur = map.get(id) || { wins: 0, losses: 0 };
      if (won) cur.wins++;
      else cur.losses++;
      map.set(id, cur);
    };

    for (const m of played) {
      const isA = (m.teamA || []).includes(pid);
      const won = (isA && m.winner === 'A') || (!isA && m.winner === 'B');
      const mate = isA
        ? (m.teamA || []).find((x) => x !== pid)
        : (m.teamB || []).find((x) => x !== pid);
      const foes = isA ? m.teamB || [] : m.teamA || [];
      if (mate) bump(matesMap, mate, won);
      for (const f of foes) bump(oppsMap, f, won);
    }

    const toArr = (map) =>
      [...map.entries()]
        .map(([id, v]) => {
          const total = v.wins + v.losses;
          const wp = total ? Math.round((v.wins / total) * 100) : 0;
          return {
            id,
            name: nameById(id),
            wins: v.wins,
            losses: v.losses,
            total,
            winPct: wp,
          };
        })
        .sort(
          (a, b) => b.total - a.total || b.winPct - a.winPct || IT_COLLATOR.compare(a.name, b.name)
        );

    const mates = toArr(matesMap);
    const opps = toArr(oppsMap);

    // Top 5 classifiche (senza vincolo minimo partite)
    const topMates = mates.sort((a, b) => b.winPct - a.winPct).slice(0, 5);

    const worstMates = mates.sort((a, b) => a.winPct - b.winPct).slice(0, 5);

    const topOpps = opps.sort((a, b) => b.winPct - a.winPct).slice(0, 5);

    const worstOpps = opps.sort((a, b) => a.winPct - b.winPct).slice(0, 5);

    return {
      mates,
      opps,
      topMates,
      worstMates,
      topOpps,
      worstOpps,
    };
  }, [pid, filteredMatches, players]);

  const RecordBar = ({ wins, losses }) => {
    const total = wins + losses || 1;
    const w = Math.round((wins / total) * 100);
    const l = 100 - w;
    return (
      <div className="w-full h-1.5 sm:h-2 rounded-full overflow-hidden flex">
        <div style={{ width: `${w}%` }} className="bg-emerald-500" />
        <div style={{ width: `${l}%` }} className="bg-rose-500" />
      </div>
    );
  };

  const PersonRow = ({ item }) => (
    <div className={`rounded-xl ${T.cardBg} ${T.border} p-3 flex items-center gap-3`}>
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{item.name}</div>
        <div className={`text-xs ${T.subtext}`}>
          {item.total} partite • Win rate {item.winPct}%
        </div>
      </div>
      <div className="w-24 sm:w-32">
        <RecordBar wins={item.wins} losses={item.losses} />
      </div>
      <div className="text-xs shrink-0">
        <span className="text-emerald-500 font-semibold">+{item.wins}</span>
        <span className={`mx-1 ${T.subtext}`}>/</span>
        <span className="text-rose-500 font-semibold">-{item.losses}</span>
      </div>
    </div>
  );

  // UI helpers

  const buildCaption = () => {
    const lines = [
      `Statistiche — ${player ? player.name : ''}`,
      `Ranking: ${player ? Math.round(player.rating) : '-'}`,
      `Record: ${advancedStats?.wins || 0}–${advancedStats?.losses || 0} (${Math.round(advancedStats?.winRate || 0)}%)`,
      `Game Eff.: ${advancedStats ? advancedStats.gameEfficiency : 0}% • Δ medio: ${advancedStats ? advancedStats.avgDelta : 0}`,
      '#SportingCat #Padel',
    ];
    return lines.join('\n');
  };
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}#stats-${pid || ''}`
      : '';

  // Componente Modal RPA
  const RPAModal = () => {
    const match = currentMatchForRpa;
    if (!match) return null;

    const isA = (match.teamA || []).includes(pid);
    const won = (isA && match.winner === 'A') || (!isA && match.winner === 'B');
    const delta = isA ? (match.deltaA ?? 0) : (match.deltaB ?? 0);
    const selfTeamNames = (isA ? match.teamA : match.teamB).map((id) => nameById(id));
    const oppTeamNames = (isA ? match.teamB : match.teamA).map((id) => nameById(id));

    // Calcola i dettagli per questa partita specifica
    const teamARating = Math.round(match.sumA || 0);
    const teamBRating = Math.round(match.sumB || 0);
    const gap = Math.round(match.gap || 0);
    const factor = match.factor || 1;
    const base = match.base || 0;
    const gd = match.gd || 0;
    const points = Math.abs(Math.round(delta));

    return (
      <Modal
        open={showRpaModal}
        onClose={() => {
          setShowRpaModal(false);
          setCurrentMatchForRpa(null);
        }}
        title="Sistema RPA - Ranking Points Algorithm"
        size="lg"
        T={T}
      >
        <div className="space-y-6">
          {/* Spiegazione Sistema RPA */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🎯 Cos'è il Sistema RPA?
            </h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed mb-3">
              Il <strong>Ranking Points Algorithm (RPA)</strong> è un sistema di punteggio dinamico
              che assegna punti in base alla differenza di livello tra le squadre e al risultato
              della partita. Più forte è l'avversario sconfitto, più punti si guadagnano!
            </p>

            {/* Formula Base */}
            <div className="bg-white dark:bg-blue-800/30 p-3 rounded border">
              <div className="text-center text-lg font-bold text-blue-600 dark:text-blue-300 mb-2">
                Punti = (Base + DG) × Factor
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-200 space-y-1">
                <div>
                  <strong>Base</strong> = (Ranking TeamA + Ranking TeamB) ÷ 100
                </div>
                <div>
                  <strong>DG</strong> = Differenza Game tra vincitori e perdenti
                </div>
                <div>
                  <strong>Factor</strong> = Moltiplicatore basato sul Gap di ranking
                </div>
              </div>
            </div>
          </div>

          {/* Scaglioni Factor - Versione Compatta */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              ⚖️ Scaglioni Factor
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border text-center">
                <div className="font-mono text-red-600 font-bold">≤-1500</div>
                <div className="text-red-600 font-semibold">0.6-0.75</div>
                <div className="text-[10px] text-red-700">Molto più debole</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border text-center">
                <div className="font-mono text-yellow-700 font-bold">-300~+300</div>
                <div className="text-yellow-700 font-semibold">0.9-1.1</div>
                <div className="text-[10px] text-yellow-800">Equilibrato</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border text-center">
                <div className="font-mono text-green-600 font-bold">≥+1500</div>
                <div className="text-green-600 font-semibold">1.25-1.6</div>
                <div className="text-[10px] text-green-700">Molto più forte</div>
              </div>
            </div>
          </div>

          {/* Dettaglio Partita */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              � Partita Analizzata
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div
                className={`p-3 rounded-lg ${won && isA ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300' : !won && !isA ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300' : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300'}`}
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100">Team A</div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                  {match.teamA?.map((id) => nameById(id)).join(' & ')}
                </div>
                <div className="text-lg font-bold text-blue-600">Rating: {teamARating}</div>
                <div className="text-xs">
                  Sets: {match.setsA} • Games: {match.gamesA}
                </div>
              </div>
              <div
                className={`p-3 rounded-lg ${won && !isA ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300' : !won && isA ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300' : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300'}`}
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100">Team B</div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                  {match.teamB?.map((id) => nameById(id)).join(' & ')}
                </div>
                <div className="text-lg font-bold text-blue-600">Rating: {teamBRating}</div>
                <div className="text-xs">
                  Sets: {match.setsB} • Games: {match.gamesB}
                </div>
              </div>
            </div>
            {match.date && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                📅{' '}
                {new Date(match.date).toLocaleDateString('it-IT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
          </div>

          {/* Risultato per il giocatore */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-700">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
              🎯 Risultato per {nameById(pid)}
            </h4>
            <div className="text-center">
              <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">
                {won ? '🏆 Vittoria!' : '💔 Sconfitta'}
              </div>
              <div
                className={`text-3xl font-bold ${delta >= 0 ? 'text-green-600' : 'text-red-600'} mb-2`}
              >
                {delta >= 0 ? '+' : ''}
                {Math.round(delta)} punti
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 bg-white dark:bg-purple-900/20 p-2 rounded">
                {won
                  ? gap > 300
                    ? '🚀 Ottima vittoria contro avversari più forti!'
                    : gap < -300
                      ? '⚠️ Vittoria facile, pochi punti guadagnati'
                      : '✅ Vittoria equilibrata, punti standard'
                  : gap > 300
                    ? '😓 Sconfitta comprensibile contro avversari forti'
                    : gap < -300
                      ? '😱 Brutta sconfitta, molti punti persi!'
                      : '📉 Sconfitta equilibrata, punti standard persi'}
              </div>
            </div>
          </div>

          {/* Punti Chiave Compatti */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border text-xs">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">
              💡 Punti Chiave
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                • <strong>Battere i forti</strong>: Factor {'>'} 1.0 = Più punti
              </div>
              <div>
                • <strong>Vittorie nette</strong>: DG alta = Bonus punti
              </div>
              <div>
                • <strong>Avversari deboli</strong>: Factor {'<'} 1.0 = Meno punti
              </div>
              <div>
                • <strong>Perdere</strong>: Stessi punti ma negativi
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <Section
      title="📊 Statistiche Giocatore"
      right={
        <ShareButtons
          size="sm"
          title={`Statistiche — ${player ? player.name : ''}`}
          url={shareUrl}
          captureRef={statsRef}
          captionBuilder={buildCaption}
          T={T}
        />
      }
      T={T}
    >
      <div ref={statsRef} className="space-y-8">
        {/* Header con controlli - Futuristic Design */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl">
          {/* Controlli in una riga su desktop, stack su mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                Giocatore
              </div>
              <select
                value={pid}
                onChange={(e) => {
                  setPid(e.target.value);
                  onSelectPlayer?.(e.target.value);
                }}
                className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 text-sm"
              >
                {playersAlpha.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
                Periodo
              </div>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm"
              >
                <option value="1w">1 settimana</option>
                <option value="2w">2 settimane</option>
                <option value="30d">30 giorni</option>
                <option value="3m">3 mesi</option>
                <option value="6m">6 mesi</option>
                <option value="all">Tutto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards - Modern Grid with Glassmorphism - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-xl rounded-2xl border border-blue-200/30 dark:border-blue-700/30 p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                Posizione
              </span>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {position ?? '-'}
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 backdrop-blur-xl rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30 p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                Ranking
              </span>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {player ? Math.round(player.rating) : '-'}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 backdrop-blur-xl rounded-2xl border border-purple-200/30 dark:border-purple-700/30 p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                Win Rate
              </span>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {`${advancedStats ? Math.round(advancedStats.winRate) : 0}%`}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {`${advancedStats?.wins || 0}–${advancedStats?.losses || 0}`}
            </div>
          </div>
        </div>
        {/* Metriche Avanzate - Futuristic Grid - Mobile Optimized */}
        {advancedStats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 backdrop-blur-xl rounded-2xl border border-orange-200/30 dark:border-orange-700/30 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  Efficienza Game
                </span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                {`${advancedStats.gameEfficiency}%`}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                % game vinti
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 backdrop-blur-xl rounded-2xl border border-cyan-200/30 dark:border-cyan-700/30 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  Δ Medio
                </span>
              </div>
              <div
                className={`text-lg sm:text-2xl font-bold ${
                  advancedStats.avgDelta > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {advancedStats.avgDelta > 0
                  ? `+${advancedStats.avgDelta}`
                  : `${advancedStats.avgDelta}`}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                punti per partita
              </div>
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 backdrop-blur-xl rounded-2xl border border-rose-200/30 dark:border-rose-700/30 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  Striscia Record
                </span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                {advancedStats.maxWinStreak}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                vittorie consecutive (migliore)
              </div>
            </div>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 backdrop-blur-xl rounded-2xl border border-violet-200/30 dark:border-violet-700/30 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Striscia Attiva
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  advancedStats.currentStreak > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : advancedStats.currentStreak < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {advancedStats.currentStreak > 0 && '+'}
                {advancedStats.currentStreak}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {advancedStats.currentStreak > 0
                  ? 'vittorie consecutive (attuale)'
                  : advancedStats.currentStreak < 0
                    ? 'sconfitte consecutive (attuale)'
                    : 'nessuna striscia attiva'}
              </div>
            </div>
          </div>
        )}

        {/* Grafico ranking - Futuristic Design */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              Andamento Ranking
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {timeFilter === 'all' ? 'Tutte le partite' : 'Periodo selezionato'}
            </span>
          </div>
          <ModernAreaChart
            data={combinedTimeline}
            dataKey="playerRating"
            compareDataKey={comparePlayerId ? 'compareRating' : null}
            comparePlayerName={
              comparePlayerId ? players.find((p) => p.id === comparePlayerId)?.name : null
            }
            chartId={`player-${pid}`}
            color="success"
            title="Evoluzione del rating"
            multiPlayer={false}
            xKey="label"
            yKey="rating"
            top5Players={[]}
          />
        </div>

        {/* Confronto diretto - Mobile Optimized */}
        <div className={`rounded-2xl ${T.cardBg} ${T.border} p-3 sm:p-4 mb-6`}>
          <div className="space-y-3 mb-4">
            <div className="font-medium">Confronto diretto</div>
            <select
              value={comparePlayerId}
              onChange={(e) => setComparePlayerId(e.target.value)}
              className={`${T.input} w-full text-sm`}
            >
              <option value="">Seleziona un giocatore…</option>
              {playersAlpha
                .filter((p) => p.id !== pid)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          {comparePlayerId ? (
            (() => {
              const cp = players.find((p) => p.id === comparePlayerId);
              // Calcola advanced per compare usando gli stessi filtri
              const cmpMatches = (filteredMatches || []).filter(
                (m) => (m.teamA || []).includes(cp.id) || (m.teamB || []).includes(cp.id)
              );
              let cWins = 0,
                cLosses = 0,
                cTotalDelta = 0,
                cGamesWon = 0,
                cGamesLost = 0;
              let cMaxWin = 0,
                cMaxLose = 0,
                cCurWin = 0,
                cCurLose = 0;
              const cmpSorted = [...cmpMatches].sort((a, b) => new Date(a.date) - new Date(b.date));
              cmpSorted.forEach((m) => {
                const isA = (m.teamA || []).includes(cp.id);
                const won = (isA && m.winner === 'A') || (!isA && m.winner === 'B');
                const delta = isA ? m.deltaA || 0 : m.deltaB || 0;
                if (won) {
                  cWins++;
                  cCurWin++;
                  cCurLose = 0;
                  cMaxWin = Math.max(cMaxWin, cCurWin);
                } else {
                  cLosses++;
                  cCurLose++;
                  cCurWin = 0;
                  cMaxLose = Math.max(cMaxLose, cCurLose);
                }
                if (isA) {
                  cGamesWon += m.gamesA || 0;
                  cGamesLost += m.gamesB || 0;
                } else {
                  cGamesWon += m.gamesB || 0;
                  cGamesLost += m.gamesA || 0;
                }
                cTotalDelta += delta;
              });
              let cCurrentStreak = 0;
              let last = null;
              for (let i = cmpSorted.length - 1; i >= 0; i--) {
                const m = cmpSorted[i];
                const isA = (m.teamA || []).includes(cp.id);
                const won = (isA && m.winner === 'A') || (!isA && m.winner === 'B');
                if (last === null) {
                  last = won;
                  cCurrentStreak = 1;
                } else if (last === won) {
                  cCurrentStreak++;
                } else break;
              }
              cCurrentStreak = last === null ? 0 : last ? cCurrentStreak : -cCurrentStreak;
              const cWinRate =
                cWins + cLosses > 0 ? Math.round((cWins / (cWins + cLosses)) * 100) : 0;
              const cGameEff =
                cGamesWon + cGamesLost > 0
                  ? Math.round((cGamesWon / (cGamesWon + cGamesLost)) * 1000) / 10
                  : 0;
              const cAvgDelta =
                cWins + cLosses > 0 ? Math.round((cTotalDelta / (cWins + cLosses)) * 10) / 10 : 0;

              const compareData = [
                {
                  metric: 'Ranking',
                  player1: player ? Math.round(player.rating) : '-',
                  player2: cp ? Math.round(cp.rating) : '-',
                  diff: player && cp ? Math.round(player.rating - cp.rating) : '-',
                },
                {
                  metric: 'Win Rate',
                  player1: `${advancedStats ? Math.round(advancedStats.winRate) : 0}%`,
                  player2: `${cWinRate}%`,
                  diff: `${advancedStats ? Math.round(advancedStats.winRate - cWinRate) : 0}%`,
                },
                {
                  metric: 'Partite',
                  player1: advancedStats ? advancedStats.totalMatches : 0,
                  player2: cWins + cLosses,
                  diff: advancedStats ? advancedStats.totalMatches - (cWins + cLosses) : 0,
                },
                {
                  metric: 'Eff. game',
                  player1: `${advancedStats ? advancedStats.gameEfficiency : 0}%`,
                  player2: `${cGameEff}%`,
                  diff: `${advancedStats ? Math.round((advancedStats.gameEfficiency - cGameEff) * 10) / 10 : 0}%`,
                },
                {
                  metric: 'Δ medio',
                  player1: advancedStats ? advancedStats.avgDelta : 0,
                  player2: cAvgDelta,
                  diff: advancedStats
                    ? Math.round((advancedStats.avgDelta - cAvgDelta) * 10) / 10
                    : 0,
                },
              ];

              return (
                <div className="space-y-3">
                  {/* Mobile Card Layout */}
                  <div className="space-y-3 sm:hidden">
                    {compareData.map((row, index) => (
                      <div key={index} className={`rounded-lg p-3 ${T.cardBg} border ${T.border}`}>
                        <div className="font-medium text-sm mb-2">{row.metric}</div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div>
                            <div className="font-semibold">{row.player1}</div>
                            <div className="text-xs text-gray-500 truncate">{player?.name}</div>
                          </div>
                          <div>
                            <div className="font-semibold">{row.player2}</div>
                            <div className="text-xs text-gray-500 truncate">{cp?.name}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-600">{row.diff}</div>
                            <div className="text-xs text-gray-500">Diff</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${T.border} ${T.tableHeadText}`}>
                          <th className="text-left py-2">Metrica</th>
                          <th className="text-center py-2">{player?.name || '-'}</th>
                          <th className="text-center py-2">{cp?.name || '-'}</th>
                          <th className="text-center py-2">Diff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareData.map((row, index) => (
                          <tr key={index} className="border-b border-black/5">
                            <td className="py-2 font-medium">{row.metric}</td>
                            <td className="text-center py-2">{row.player1}</td>
                            <td className="text-center py-2">{row.player2}</td>
                            <td className="text-center py-2">{row.diff}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className={`text-sm ${T.subtext}`}>
              Seleziona un giocatore per confrontare le statistiche
            </div>
          )}
        </div>

        {/* Mini Classifiche - Mobile Optimized */}
        <div className="space-y-6">
          {/* Top 5 Compagni */}
          <div className="space-y-3">
            <h3 className="font-medium text-base flex items-center gap-2">
              <span className="text-emerald-600">🏆</span>
              Top 5 Compagni
            </h3>
            {partnerAndOppStats.topMates.length > 0 ? (
              <div className={`rounded-xl ${T.cardBg} ${T.border} p-3 sm:p-4`}>
                <div className="space-y-3">
                  {partnerAndOppStats.topMates.map((mate, index) => (
                    <div key={mate.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-600'
                              : index === 1
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                : index === 2
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm truncate">{mate.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-emerald-600 text-sm">
                          {Math.round(mate.winPct)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {mate.wins}V-{mate.losses}S
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`text-sm ${T.subtext} text-center py-6`}>
                Nessun compagno disponibile
              </div>
            )}
          </div>

          {/* Worst 5 Compagni */}
          <div className="space-y-3">
            <h3 className="font-medium text-base flex items-center gap-2">
              <span className="text-rose-600">😞</span>
              Worst 5 Compagni
            </h3>
            {partnerAndOppStats.worstMates.length > 0 ? (
              <div className={`rounded-xl ${T.cardBg} ${T.border} p-3 sm:p-4`}>
                <div className="space-y-3">
                  {partnerAndOppStats.worstMates.map((mate, index) => (
                    <div key={mate.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? 'bg-red-100 text-red-600'
                              : index === 1
                                ? 'bg-orange-100 text-orange-600'
                                : index === 2
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm truncate">{mate.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-rose-600 text-sm">
                          {Math.round(mate.winPct)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {mate.wins}V-{mate.losses}S
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`text-sm ${T.subtext} text-center py-6`}>
                Nessun compagno disponibile
              </div>
            )}
          </div>

          {/* Top 5 Avversari */}
          <div className="space-y-3">
            <h3 className="font-medium text-base flex items-center gap-2">
              <span className="text-emerald-600">🎯</span>
              Top 5 Avversari Preferiti
            </h3>
            {partnerAndOppStats.topOpps.length > 0 ? (
              <div className={`rounded-xl ${T.cardBg} ${T.border} p-3 sm:p-4`}>
                <div className="space-y-3">
                  {partnerAndOppStats.topOpps.map((opp, index) => (
                    <div key={opp.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-600'
                              : index === 1
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                : index === 2
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm truncate">{opp.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-emerald-600 text-sm">
                          {Math.round(opp.winPct)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {opp.wins}V-{opp.losses}S
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`text-sm ${T.subtext} text-center py-6`}>
                Nessun avversario disponibile
              </div>
            )}
          </div>

          {/* Worst 5 Avversari */}
          <div className="space-y-3">
            <h3 className="font-medium text-base flex items-center gap-2">
              <span className="text-rose-600">💀</span>
              Top 5 Bestie Nere
            </h3>
            {partnerAndOppStats.worstOpps.length > 0 ? (
              <div className={`rounded-xl ${T.cardBg} ${T.border} p-3 sm:p-4`}>
                <div className="space-y-3">
                  {partnerAndOppStats.worstOpps.map((opp, index) => (
                    <div key={opp.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? 'bg-red-100 text-red-600'
                              : index === 1
                                ? 'bg-orange-100 text-orange-600'
                                : index === 2
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm truncate">{opp.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-rose-600 text-sm">
                          {Math.round(opp.winPct)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {opp.wins}V-{opp.losses}S
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`text-sm ${T.subtext} text-center py-6`}>
                Nessun avversario disponibile
              </div>
            )}
          </div>
        </div>

        {/* Storico Partite - Futuristic Design */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              Storico Partite {timeFilter !== 'all' ? '(periodo filtrato)' : ''}
            </h3>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
              {
                (filteredMatches || []).filter(
                  (m) => (m.teamA || []).includes(pid) || (m.teamB || []).includes(pid)
                ).length
              }{' '}
              partite
            </div>
          </div>
          <div className="space-y-4">
            {(filteredMatches || [])
              .filter((m) => (m.teamA || []).includes(pid) || (m.teamB || []).includes(pid))
              .slice()
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((m) => {
                const isA = (m.teamA || []).includes(pid);
                const delta = isA ? (m.deltaA ?? 0) : (m.deltaB ?? 0);
                const won = (isA && m.winner === 'A') || (!isA && m.winner === 'B');
                const selfTeam = (isA ? m.teamA : m.teamB)
                  .map((id) => surnameOf(nameById(id)))
                  .join(' & ');
                const oppTeam = (isA ? m.teamB : m.teamA)
                  .map((id) => surnameOf(nameById(id)))
                  .join(' & ');
                const selfTeamFull = (isA ? m.teamA : m.teamB)
                  .map((id) => nameById(id))
                  .join(' & ');
                const oppTeamFull = (isA ? m.teamB : m.teamA).map((id) => nameById(id)).join(' & ');
                const selfCls = won
                  ? 'text-emerald-600 font-semibold'
                  : 'text-rose-600 font-semibold';
                const oppCls = won
                  ? 'text-rose-600 font-semibold'
                  : 'text-emerald-600 font-semibold';
                const isExpanded = expandedMatchId === m.id;

                return (
                  <div
                    key={m.id}
                    className={`relative rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-500/60 shadow-blue-500/20' : ''}`}
                  >
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

                    {/* Riga compatta mobile-optimized */}
                    <div
                      className="relative p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent transition-all duration-300"
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedMatchId(isExpanded ? null : m.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedMatchId((prev) => (prev === m.id ? null : m.id));
                        }
                      }}
                      aria-expanded={isExpanded}
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border ${
                              won
                                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-500/20 border-rose-400/30 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {won ? '✨ Vittoria' : '❌ Sconfitta'}
                          </span>
                          {m.date && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                              {new Date(m.date).toLocaleDateString('it-IT', {
                                day: '2-digit',
                                month: 'short',
                                year: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                        <div className="text-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div
                              className={`${selfCls} font-semibold bg-gradient-to-r from-current to-current bg-clip-text`}
                            >
                              {selfTeam}
                            </div>
                            <div className="hidden sm:block text-gray-400 dark:text-gray-500">
                              vs
                            </div>
                            <div
                              className={`${oppCls} font-semibold bg-gradient-to-r from-current to-current bg-clip-text`}
                            >
                              {oppTeam}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                          Sets {isA ? m.setsA : m.setsB}–{isA ? m.setsB : m.setsA} • Games{' '}
                          {isA ? m.gamesA : m.gamesB}–{isA ? m.gamesB : m.gamesA}
                        </div>
                      </div>
                      <div className="shrink-0 text-right flex items-center gap-3">
                        <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-800/50 backdrop-blur-sm rounded-2xl px-3 py-2 border border-white/20 dark:border-gray-600/30">
                          <div
                            className={`text-lg font-bold bg-gradient-to-r ${
                              delta >= 0
                                ? 'from-emerald-500 to-green-600 text-transparent bg-clip-text'
                                : 'from-rose-500 to-red-600 text-transparent bg-clip-text'
                            }`}
                          >
                            {delta >= 0 ? '+' : ''}
                            {Math.round(delta)}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            punti
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentMatchForRpa(m);
                            setShowRpaModal(true);
                          }}
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
                          title="Spiegazione formula RPA"
                        >
                          ?
                        </button>
                        <div
                          className={`text-gray-400 dark:text-gray-300 text-sm transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* Dettagli espansi - Mobile Optimized */}
                    {isExpanded && (
                      <div className="border-t border-white/20 dark:border-gray-700/30 bg-gradient-to-b from-gray-50/50 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-900/40 backdrop-blur-sm">
                        <div className="p-4 space-y-4">
                          {/* Squadre - Stacked su mobile */}
                          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 text-sm">
                            <div
                              className={`p-4 rounded-2xl border backdrop-blur-sm ${
                                won
                                  ? 'border-emerald-400/30 bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/40 dark:to-emerald-800/30'
                                  : 'border-gray-300/30 bg-gradient-to-br from-white/60 to-gray-50/40 dark:from-gray-700/40 dark:to-gray-800/30'
                              }`}
                            >
                              <div className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                {won && <span className="text-emerald-500">👑</span>}
                                {selfTeamFull}
                              </div>
                              <div className="text-xs text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                Sets: {isA ? m.setsA : m.setsB} • Games: {isA ? m.gamesA : m.gamesB}
                              </div>
                            </div>
                            <div
                              className={`p-4 rounded-2xl border backdrop-blur-sm ${
                                !won
                                  ? 'border-emerald-400/30 bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/40 dark:to-emerald-800/30'
                                  : 'border-gray-300/30 bg-gradient-to-br from-white/60 to-gray-50/40 dark:from-gray-700/40 dark:to-gray-800/30'
                              }`}
                            >
                              <div className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                {!won && <span className="text-emerald-500">👑</span>}
                                {oppTeamFull}
                              </div>
                              <div className="text-xs text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                Sets: {isA ? m.setsB : m.setsA} • Games: {isA ? m.gamesB : m.gamesA}
                              </div>
                            </div>
                          </div>

                          {/* Set dettaglio - Mobile scroll */}
                          {Array.isArray(m.sets) && m.sets.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">
                                  📊
                                </span>
                                Set per set:
                              </div>
                              <div className="flex gap-3 overflow-x-auto pb-2">
                                {m.sets.map((s, i) => (
                                  <div
                                    key={`${m.id}-set-${i}`}
                                    className="px-4 py-3 bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-gray-700/60 dark:to-gray-800/40 rounded-2xl text-sm border border-white/30 dark:border-gray-600/30 text-gray-900 dark:text-white font-semibold shrink-0 backdrop-blur-sm shadow-lg"
                                  >
                                    <div className="text-center">
                                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                        Set {i + 1}
                                      </span>
                                      <span className="text-lg">
                                        {s.a}–{s.b}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Formula compatta - Mobile collapsible */}
                          <div className="border-t border-white/20 dark:border-gray-700/30 pt-4">
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                              <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-transparent bg-clip-text">
                                🧮
                              </span>
                              Calcolo punti RPA:
                            </div>
                            <div className="text-sm space-y-3 text-gray-800 dark:text-gray-100">
                              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-2xl border border-blue-200/30 dark:border-blue-700/30 backdrop-blur-sm">
                                <strong className="text-blue-700 dark:text-blue-300">
                                  Rating:
                                </strong>{' '}
                                A={Math.round(m.sumA || 0)} vs B=
                                {Math.round(m.sumB || 0)} (Gap: {Math.round(m.gap || 0)})
                              </div>
                              <div className="bg-gradient-to-r from-purple-50/80 to-violet-50/60 dark:from-purple-900/20 dark:to-violet-900/20 p-3 rounded-2xl border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm">
                                <strong className="text-purple-700 dark:text-purple-300">
                                  Calcolo:
                                </strong>{' '}
                                Base: {(m.base || 0).toFixed(1)} • DG: {m.gd || 0} • Factor:{' '}
                                {(m.factor || 1).toFixed(2)}
                              </div>
                              <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/60 dark:from-emerald-900/20 dark:to-green-900/20 p-3 rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30 backdrop-blur-sm">
                                <strong className="text-emerald-700 dark:text-emerald-300">
                                  Risultato:
                                </strong>{' '}
                                <span
                                  className={`font-bold text-lg ${
                                    delta >= 0
                                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-transparent bg-clip-text'
                                      : 'bg-gradient-to-r from-rose-600 to-red-600 text-transparent bg-clip-text'
                                  }`}
                                >
                                  {delta >= 0 ? '+' : ''}
                                  {Math.round(delta)} punti
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Modal RPA */}
      <RPAModal />
    </Section>
  );
}
