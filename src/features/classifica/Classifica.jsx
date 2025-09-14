// =============================================
// FILE: src/features/classifica/Classifica.jsx
// FUTURISTIC REDESIGN: Glassmorphism design with dark mode support
// =============================================
import React, { useMemo, useRef, useState } from "react";
import Section from "@ui/Section.jsx";
import { TrendArrow } from "@ui/TrendArrow.jsx";
import ModernMultiLineChart from "@ui/charts/ModernMultiLineChart.jsx";
import MobileRankingChart from "@ui/charts/MobileRankingChart.jsx";
import ShareButtons from "@ui/ShareButtons.jsx";
import { buildPodiumTimeline } from "@lib/ranking.js";

export default function Classifica({ players, matches, onOpenStats, T }) {
  const classificaRef = useRef(null);
  const [selectedTopCount, setSelectedTopCount] = useState(3);
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  // Classifica generale (RPA)
  const rows = useMemo(
    () =>
      [...players]
        .map((p) => ({
          ...p,
          winRate:
            (p.wins || 0) + (p.losses || 0)
              ? ((p.wins || 0) / ((p.wins || 0) + (p.losses || 0))) * 100
              : 0,
        }))
        .sort((a, b) => b.rating - a.rating),
    [players],
  );

  // Classifica Coppie
  const couplesStats = useMemo(() => {
    const couples = new Map();
    const MIN_MATCHES = 3; // soglia minima per considerare la coppia

    for (const match of matches) {
      if (
        !Array.isArray(match.teamA) ||
        !Array.isArray(match.teamB) ||
        match.teamA.length !== 2 ||
        match.teamB.length !== 2
      )
        continue;

      // Chiavi coppia ordinate senza mutare i dati del match
      const [a1, a2] = [...match.teamA].sort();
      const [b1, b2] = [...match.teamB].sort();
      const keyA = `${a1}_${a2}`;
      const keyB = `${b1}_${b2}`;

      if (!couples.has(keyA)) {
        const pa1 = players.find((p) => p.id === a1);
        const pa2 = players.find((p) => p.id === a2);
        couples.set(keyA, {
          key: keyA,
          players: [pa1?.name || "Unknown", pa2?.name || "Unknown"],
          wins: 0,
          losses: 0,
          matches: 0,
        });
      }
      if (!couples.has(keyB)) {
        const pb1 = players.find((p) => p.id === b1);
        const pb2 = players.find((p) => p.id === b2);
        couples.set(keyB, {
          key: keyB,
          players: [pb1?.name || "Unknown", pb2?.name || "Unknown"],
          wins: 0,
          losses: 0,
          matches: 0,
        });
      }

      const cA = couples.get(keyA);
      const cB = couples.get(keyB);
      cA.matches++;
      cB.matches++;

      // Usa il winner calcolato (derivato da recompute). Fallback ai set se assente.
      let winner = match.winner;
      if (!winner && Array.isArray(match.sets)) {
        const aSets = match.sets.reduce(
          (acc, s) => acc + (s.a > s.b ? 1 : 0),
          0,
        );
        const bSets = match.sets.reduce(
          (acc, s) => acc + (s.b > s.a ? 1 : 0),
          0,
        );
        winner = aSets > bSets ? "A" : "B";
      }

      if (winner === "A") {
        cA.wins++;
        cB.losses++;
      } else if (winner === "B") {
        cB.wins++;
        cA.losses++;
      }
    }

    return Array.from(couples.values())
      .map((c) => ({
        ...c,
        winRate: c.matches > 0 ? (c.wins / c.matches) * 100 : 0,
      }))
      .filter((c) => c.matches >= MIN_MATCHES)
      .sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.matches !== a.matches) return b.matches - a.matches;
        const an = `${a.players[0]} & ${a.players[1]}`.toLowerCase();
        const bn = `${b.players[0]} & ${b.players[1]}`.toLowerCase();
        return an.localeCompare(bn);
      });
  }, [players, matches]);

  // Classifica Efficienza
  const efficiencyStats = useMemo(() => {
    const playerStats = new Map();

    matches.forEach((match) => {
      const allPlayers = [...match.teamA, ...match.teamB];
      const teamAWins = match.sets.reduce(
        (acc, set) => acc + (set.a > set.b ? 1 : 0),
        0,
      );
      const teamBWins = match.sets.reduce(
        (acc, set) => acc + (set.b > set.a ? 1 : 0),
        0,
      );

      const winningTeam = teamAWins > teamBWins ? match.teamA : match.teamB;
      const losingTeam = teamAWins > teamBWins ? match.teamB : match.teamA;

      // Calcola i game totali per efficienza
      const totalGamesA = match.sets.reduce((acc, set) => acc + set.a, 0);
      const totalGamesB = match.sets.reduce((acc, set) => acc + set.b, 0);

      // Assegna statistiche ai team
      match.teamA.forEach((playerId) => {
        if (!playerStats.has(playerId)) {
          const player = players.find((p) => p.id === playerId);
          playerStats.set(playerId, {
            id: playerId,
            name: player?.name || "Unknown",
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
            name: player?.name || "Unknown",
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
        gameEfficiency:
          (player.gamesWon / (player.gamesWon + player.gamesLost)) * 100,
        efficiency:
          ((player.wins / player.matches) * 0.7 +
            (player.gamesWon / (player.gamesWon + player.gamesLost)) * 0.3) *
          100,
      }))
      .sort((a, b) => b.efficiency - a.efficiency);
  }, [players, matches]);

  // Classifica Streak positive e Ingiocabili
  const streakStats = useMemo(() => {
    const playerStreaks = new Map();

    // Ordina le partite per data
    const sortedMatches = [...matches].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    sortedMatches.forEach((match) => {
      const teamAWins = match.sets.reduce(
        (acc, set) => acc + (set.a > set.b ? 1 : 0),
        0,
      );
      const teamBWins = match.sets.reduce(
        (acc, set) => acc + (set.b > set.a ? 1 : 0),
        0,
      );

      const winners = teamAWins > teamBWins ? match.teamA : match.teamB;
      const losers = teamAWins > teamBWins ? match.teamB : match.teamA;

      [...match.teamA, ...match.teamB].forEach((playerId) => {
        if (!playerStreaks.has(playerId)) {
          const player = players.find((p) => p.id === playerId);
          playerStreaks.set(playerId, {
            id: playerId,
            name: player?.name || "Unknown",
            currentStreak: 0,
            bestWinStreak: 0,
            worstLossStreak: 0,
            streakType: "none", // 'win', 'loss', 'none'
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
          if (playerData.streakType === "win") {
            playerData.currentStreak++;
          } else {
            playerData.currentStreak = 1;
            playerData.streakType = "win";
          }
          if (playerData.currentStreak > playerData.bestWinStreak) {
            playerData.bestWinStreak = playerData.currentStreak;
          }
        } else {
          playerData.totalLosses++;
          if (playerData.streakType === "loss") {
            playerData.currentStreak++;
          } else {
            playerData.currentStreak = 1;
            playerData.streakType = "loss";
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
        if (b.bestWinStreak !== a.bestWinStreak)
          return b.bestWinStreak - a.bestWinStreak;
        if (a.streakType === "win" && b.streakType !== "win") return -1;
        if (b.streakType === "win" && a.streakType !== "win") return 1;
        return b.currentStreak - a.currentStreak;
      });

    // Classifica "Ingiocabili" - Minor rapporto sconfitte/partite giocate
    const ingiocabili = Array.from(playerStreaks.values())
      .filter((player) => player.totalMatches >= 3) // Minimo 3 partite
      .map((player) => ({
        ...player,
        lossRatio:
          player.totalMatches > 0
            ? (player.totalLosses / player.totalMatches) * 100
            : 0,
        winRate:
          player.totalMatches > 0
            ? (player.totalWins / player.totalMatches) * 100
            : 0,
      }))
      .sort((a, b) => {
        // Ordina per minor rapporto sconfitte (migliori primi)
        if (a.lossRatio !== b.lossRatio) return a.lossRatio - b.lossRatio;
        // A parità, privilegia chi ha giocato di più
        return b.totalMatches - a.totalMatches;
      });

    return { positive: positiveStreaks, ingiocabili: ingiocabili };
  }, [players, matches]);

  const topPlayers = rows.slice(0, selectedTopCount);
  const topIds = topPlayers.map((p) => p.id);
  const topKeys = topPlayers.map((p) => p.name);
  const topRankings = topPlayers.map((p, index) => ({
    name: p.name,
    position: index + 1,
  }));

  // Usa i rating attuali della classifica per sincronizzare con il grafico
  const chartData = useMemo(() => {
    const timeline = buildPodiumTimeline(players, matches, topIds);

    // Verifica che l'ultimo punto del grafico corrisponda ai rating attuali
    if (timeline.length > 0) {
      const lastPoint = timeline[timeline.length - 1];
      topPlayers.forEach((player) => {
        // Sincronizza l'ultimo valore del grafico con il rating attuale della classifica
        lastPoint[player.name] = Math.round(player.rating);
      });
    }

    return timeline;
  }, [players, matches, topIds, topPlayers]);

  const buildCaption = () => {
    const lines = [
      "Classifica Sporting Cat",
      ...topPlayers.map(
        (p, i) => `${i + 1}. ${p.name} — ${Math.round(p.rating)} pt`,
      ),
      "#SportingCat #Padel",
    ];
    return lines.join("\n");
  };
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}#classifica`
      : "";

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
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  🏆
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Ranking RPA
                </h3>
              </div>
              <button
                onClick={() => setShowAllPlayers(!showAllPlayers)}
                className={`px-4 py-2 text-sm rounded-xl border backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${
                  showAllPlayers
                    ? "bg-blue-500/20 border-blue-300/50 text-blue-700 dark:bg-blue-500/30 dark:border-blue-400/50 dark:text-blue-300 shadow-lg shadow-blue-500/20"
                    : "bg-white/50 border-gray-200/50 text-gray-700 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600/70 shadow-lg"
                }`}
              >
                {showAllPlayers ? "📊 Mostra Top 10" : "📋 Mostra Tutti"}
              </button>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-white/20 dark:border-gray-600/30 text-gray-600 dark:text-gray-300">
                    <th className="py-3 pr-3 font-semibold">#</th>
                    <th className="py-3 pr-3 font-semibold">Giocatore</th>
                    <th className="py-3 pr-3 font-semibold">Ranking</th>
                    <th className="py-3 pr-3 font-semibold">Vittorie</th>
                    <th className="py-3 pr-3 font-semibold">Sconfitte</th>
                    <th className="py-3 pr-3 font-semibold">% Vittorie</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllPlayers ? rows : rows.slice(0, 10)).map((p, idx) => (
                    <tr
                      key={p.id}
                      className="border-b border-white/10 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-200"
                    >
                      <td className="py-3 pr-3 font-semibold text-gray-800 dark:text-gray-200">
                        {idx + 1}
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline"
                          onClick={() => onOpenStats(p.id)}
                        >
                          {p.name}
                        </button>
                      </td>
                      <td className="py-3 pr-3 font-bold text-gray-900 dark:text-white">
                        {p.rating.toFixed(2)}
                        <TrendArrow
                          total={p.trend5Total}
                          pos={p.trend5Pos}
                          neg={p.trend5Neg}
                        />
                      </td>
                      <td className="py-3 pr-3 text-green-600 dark:text-green-400 font-semibold">
                        {p.wins || 0}
                      </td>
                      <td className="py-3 pr-3 text-red-600 dark:text-red-400 font-semibold">
                        {p.losses || 0}
                      </td>
                      <td className="py-3 pr-3 font-bold text-gray-800 dark:text-gray-200">
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
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/30"
                  >
                    ... e altri {rows.length - 10} giocatori
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
              <div className="font-semibold text-lg bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Andamento del ranking
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Mostra:
                </span>
                <select
                  value={selectedTopCount}
                  onChange={(e) => setSelectedTopCount(Number(e.target.value))}
                  className="text-sm px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200"
                >
                  <option value={3}>Top 3</option>
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                </select>
              </div>
            </div>
            {/* Usa il nuovo grafico mobile-ottimizzato per tutte le piattaforme */}
            <MobileRankingChart
              data={chartData}
              seriesKeys={topKeys}
              chartId="classifica-universal"
              title={`Evoluzione del Top ${selectedTopCount}`}
              selectedCount={selectedTopCount}
              playerRankings={topRankings}
            />
          </div>
        </div>

        {/* Grid per le altre classifiche - Futuristic Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          {/* Coppie Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  👥
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Migliori Coppie
                </h3>
              </div>

              <div className="mb-4 p-3 bg-amber-50/70 dark:bg-amber-900/20 backdrop-blur-sm rounded-xl border border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 text-sm">ℹ️</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                      Come funziona:
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Ordinate per % vittorie. Solo coppie con ≥3 partite.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile layout - ultra compact single line */}
              <div className="block md:hidden space-y-2">
                {couplesStats.slice(0, 8).map((couple, idx) => (
                  <div
                    key={couple.key}
                    className="flex items-center justify-between py-2 px-3 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/50 dark:hover:bg-gray-600/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400 w-6">
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {couple.players[0].split(" ").pop()} &{" "}
                        {couple.players[1].split(" ").pop()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {couple.wins}V
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        {couple.losses}S
                      </span>
                      <span className="font-bold text-amber-700 dark:text-amber-300">
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
                    <tr className="text-left border-b border-white/20 dark:border-gray-600/30 text-gray-600 dark:text-gray-300">
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
                        className="border-b border-white/10 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-200"
                      >
                        <td className="py-3 pr-3 font-semibold text-gray-800 dark:text-gray-200">
                          {idx + 1}
                        </td>
                        <td className="py-3 pr-3 font-medium text-sm text-gray-900 dark:text-gray-100">
                          {couple.players[0]} & {couple.players[1]}
                        </td>
                        <td className="py-3 pr-3 text-sm">
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            {couple.wins}
                          </span>
                          /
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            {couple.losses}
                          </span>
                        </td>
                        <td className="py-3 pr-3 font-bold text-amber-700 dark:text-amber-300">
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
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  ⚡
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Classifica Efficienza
                </h3>
              </div>

              <div className="mb-4 p-3 bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 text-sm">⚡</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                      Formula:
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
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
                    className="flex items-center justify-between py-2 px-3 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/50 dark:hover:bg-gray-600/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 w-6">
                        #{idx + 1}
                      </span>
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                        onClick={() => onOpenStats(player.id)}
                      >
                        {player.name}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {player.wins}V
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        {player.losses}S
                      </span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">
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
                    <tr className="text-left border-b border-white/20 dark:border-gray-600/30 text-gray-600 dark:text-gray-300">
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
                        className="border-b border-white/10 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-200"
                      >
                        <td className="py-3 pr-3 font-semibold text-gray-800 dark:text-gray-200">
                          {idx + 1}
                        </td>
                        <td className="py-3 pr-3">
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                            onClick={() => onOpenStats(player.id)}
                          >
                            {player.name}
                          </button>
                        </td>
                        <td className="py-3 pr-3 font-bold text-blue-600 dark:text-blue-400">
                          {player.efficiency.toFixed(1)}%
                        </td>
                        <td className="py-3 pr-3 text-sm">
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            {player.wins}
                          </span>
                          /
                          <span className="text-red-600 dark:text-red-400 font-semibold">
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
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  🔥
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Streak Vittorie
                </h3>
              </div>

              <div className="mb-4 p-3 bg-green-50/70 dark:bg-green-900/20 backdrop-blur-sm rounded-xl border border-green-200/50 dark:border-green-800/30">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-sm">🔥</span>
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                      Streak vittorie:
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
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
                    className="flex items-center justify-between py-2 px-3 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/50 dark:hover:bg-gray-600/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400 w-6">
                        #{idx + 1}
                      </span>
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                        onClick={() => onOpenStats(player.id)}
                      >
                        {player.name}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {player.streakType === "win" ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          🔥{player.currentStreak}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                      <span className="font-bold text-green-700 dark:text-green-300">
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
                    <tr className="text-left border-b border-white/20 dark:border-gray-600/30 text-gray-600 dark:text-gray-300">
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
                        className="border-b border-white/10 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-200"
                      >
                        <td className="py-3 pr-3 font-semibold text-gray-800 dark:text-gray-200">
                          {idx + 1}
                        </td>
                        <td className="py-3 pr-3">
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                            onClick={() => onOpenStats(player.id)}
                          >
                            {player.name}
                          </button>
                        </td>
                        <td className="py-3 pr-3 font-bold text-green-600 dark:text-green-400">
                          {player.bestWinStreak}
                        </td>
                        <td className="py-3 pr-3">
                          {player.streakType === "win" ? (
                            <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
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
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  🛡️
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Ingiocabili
                </h3>
              </div>

              <div className="mb-4 p-3 bg-purple-50/70 dark:bg-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-200/50 dark:border-purple-800/30">
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 text-sm">🛡️</span>
                  <div>
                    <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
                      Ingiocabili:
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
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
                    className="flex items-center justify-between py-2 px-3 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/50 dark:hover:bg-gray-600/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400 w-6">
                        #{idx + 1}
                      </span>
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                        onClick={() => onOpenStats(player.id)}
                      >
                        {player.name}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {player.totalWins}V
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        {player.totalLosses}S
                      </span>
                      <span className="font-bold text-purple-700 dark:text-purple-300">
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
                    <tr className="text-left border-b border-white/20 dark:border-gray-600/30 text-gray-600 dark:text-gray-300">
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
                        className="border-b border-white/10 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-200"
                      >
                        <td className="py-3 pr-3 font-semibold text-gray-800 dark:text-gray-200">
                          {idx + 1}
                        </td>
                        <td className="py-3 pr-3">
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline text-sm"
                            onClick={() => onOpenStats(player.id)}
                          >
                            {player.name}
                          </button>
                        </td>
                        <td className="py-3 pr-3 font-bold text-purple-600 dark:text-purple-400">
                          {player.lossRatio.toFixed(1)}%
                        </td>
                        <td className="py-3 pr-3 text-sm">
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            {player.totalWins}
                          </span>
                          /
                          <span className="text-red-600 dark:text-red-400 font-semibold">
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
