import React, { useMemo, useState } from "react";
import Section from "@ui/Section.jsx";
import { byPlayerFirstAlpha } from "@lib/names.js";
import { DEFAULT_RATING, uid } from "@lib/ids.js";
import { computeFromSets, rpaFactor } from "@lib/rpa.js";
import MatchRow from "@features/matches/MatchRow.jsx";
import { FormulaIntro } from "@ui/formulas/FormulaIntro.jsx";
import { FormulaExplainer } from "@ui/formulas/FormulaExplainer.jsx";

const toLocalInputValue = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  const dt = new Date(d);
  const y = dt.getFullYear(),
    m = pad(dt.getMonth() + 1),
    day = pad(dt.getDate());
  const hh = pad(dt.getHours()),
    mm = pad(dt.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
};

function PlayerSelect({ players, value, onChange, disabledIds, T }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${T.input} pr-8 w-full`}
    >
      <option value="">—</option>
      {players.map((p) => (
        <option key={p.id} value={p.id} disabled={disabledIds?.has(p.id)}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export default function CreaPartita({
  state,
  setState,
  playersById,
  onShowFormula,
  derivedMatches,
  T,
}) {
  const players = state.players;
  const playersAlpha = useMemo(
    () => [...players].sort(byPlayerFirstAlpha),
    [players],
  );

  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");
  const [b1, setB1] = useState("");
  const [b2, setB2] = useState("");
  const [sets, setSets] = useState([
    { a: "", b: "" },
    { a: "", b: "" },
    { a: "", b: "" },
  ]);
  const [when, setWhen] = useState(toLocalInputValue(new Date()));

  const rr = computeFromSets(sets);
  const ready = a1 && a2 && b1 && b2 && rr.winner;

  // Ranking coppie live
  const rA1 = a1 ? (playersById[a1]?.rating ?? DEFAULT_RATING) : null;
  const rA2 = a2 ? (playersById[a2]?.rating ?? DEFAULT_RATING) : null;
  const rB1 = b1 ? (playersById[b1]?.rating ?? DEFAULT_RATING) : null;
  const rB2 = b2 ? (playersById[b2]?.rating ?? DEFAULT_RATING) : null;
  const sumA = rA1 != null && rA2 != null ? rA1 + rA2 : null;
  const sumB = rB1 != null && rB2 != null ? rB1 + rB2 : null;
  const pairAText =
    sumA != null
      ? `${Math.round(sumA)} (${Math.round(rA1)} + ${Math.round(rA2)})`
      : "—";
  const pairBText =
    sumB != null
      ? `${Math.round(sumB)} (${Math.round(rB1)} + ${Math.round(rB2)})`
      : "—";

  const showPreviewFormula = () => {
    const nameA1 = playersById[a1]?.name || "—";
    const nameA2 = playersById[a2]?.name || "—";
    const nameB1 = playersById[b1]?.name || "—";
    const nameB2 = playersById[b2]?.name || "—";

    const sA1 = a1 ? (playersById[a1]?.rating ?? DEFAULT_RATING) : null;
    const sA2 = a2 ? (playersById[a2]?.rating ?? DEFAULT_RATING) : null;
    const sB1 = b1 ? (playersById[b1]?.rating ?? DEFAULT_RATING) : null;
    const sB2 = b2 ? (playersById[b2]?.rating ?? DEFAULT_RATING) : null;

    const sumA = sA1 != null && sA2 != null ? sA1 + sA2 : null;
    const sumB = sB1 != null && sB2 != null ? sB1 + sB2 : null;

    const rrLocal = computeFromSets(sets || []);

    if (!rrLocal.winner || sumA == null || sumB == null) {
      onShowFormula(
        <FormulaIntro
          sumA={sumA}
          sumB={sumB}
          teamALabel={`${nameA1} + ${nameA2}`}
          teamBLabel={`${nameB1} + ${nameB2}`}
        />,
      );
      return;
    }

    const gap = rrLocal.winner === "A" ? sumB - sumA : sumA - sumB;
    const factor = rpaFactor(gap);
    const GD =
      rrLocal.winner === "A"
        ? rrLocal.gamesA - rrLocal.gamesB
        : rrLocal.gamesB - rrLocal.gamesA;
    const base = (sumA + sumB) / 100;
    const P = Math.round((base + GD) * factor);

    onShowFormula(
      <FormulaExplainer
        sumA={sumA}
        sumB={sumB}
        gap={gap}
        factor={factor}
        GD={GD}
        P={P}
        winner={rrLocal.winner}
        sets={sets}
        teamALabel={`${nameA1} + ${nameA2}`}
        teamBLabel={`${nameB1} + ${nameB2}`}
      />,
    );
  };

  const addMatch = () => {
    if (!ready)
      return alert(
        "Seleziona 4 giocatori e inserisci i set (best of 3). Il risultato non può finire 1-1.",
      );
    const normSets = (sets || []).map((s) => ({
      a: +(s?.a || 0),
      b: +(s?.b || 0),
    }));
    const date = new Date(when || Date.now()).toISOString();
    setState((s) => ({
      ...s,
      matches: [
        ...s.matches,
        { id: uid(), date, teamA: [a1, a2], teamB: [b1, b2], sets: normSets },
      ],
    }));
    setA1("");
    setA2("");
    setB1("");
    setB2("");
    setSets([
      { a: "", b: "" },
      { a: "", b: "" },
      { a: "", b: "" },
    ]);
    setWhen(toLocalInputValue(new Date()));
  };

  const delMatch = (id) => {
    if (!confirm("Cancellare la partita?")) return;
    setState((s) => ({ ...s, matches: s.matches.filter((m) => m.id !== id) }));
  };

  return (
    <>
      <Section title="Crea Partita" T={T}>
        {/* Team selection - mobile optimized */}
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
          <div className={`rounded-xl ${T.cardBg} ${T.border} p-4`}>
            <div className="font-medium flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <span className="flex items-center gap-2">
                🅰️ <span>Team A</span>
              </span>
              <span
                className={`text-xs ${T.subtext} bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full`}
              >
                Ranking: <b>{pairAText}</b>
              </span>
            </div>
            <div className="space-y-2">
              <PlayerSelect
                T={T}
                players={playersAlpha}
                value={a1}
                onChange={setA1}
                disabledIds={new Set([a2, b1, b2].filter(Boolean))}
              />
              <PlayerSelect
                T={T}
                players={playersAlpha}
                value={a2}
                onChange={setA2}
                disabledIds={new Set([a1, b1, b2].filter(Boolean))}
              />
            </div>
          </div>

          <div className={`rounded-xl ${T.cardBg} ${T.border} p-4`}>
            <div className="font-medium flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <span className="flex items-center gap-2">
                🅱️ <span>Team B</span>
              </span>
              <span
                className={`text-xs ${T.subtext} bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full`}
              >
                Ranking: <b>{pairBText}</b>
              </span>
            </div>
            <div className="space-y-2">
              <PlayerSelect
                T={T}
                players={playersAlpha}
                value={b1}
                onChange={setB1}
                disabledIds={new Set([a1, a2, b2].filter(Boolean))}
              />
              <PlayerSelect
                T={T}
                players={playersAlpha}
                value={b2}
                onChange={setB2}
                disabledIds={new Set([a1, a2, b1].filter(Boolean))}
              />
            </div>
          </div>
        </div>

        {/* Date and Result section - mobile optimized */}
        <div className="mt-6 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
          <div className={`rounded-xl ${T.cardBg} ${T.border} p-4`}>
            <div className="font-medium mb-3 flex items-center gap-2">
              📅 Data e ora
            </div>
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className={`${T.input} w-full`}
            />
          </div>

          <div className={`rounded-xl ${T.cardBg} ${T.border} p-4`}>
            <div className="font-medium mb-3 flex items-center gap-2">
              🏆 Risultato (best of 3)
            </div>

            {/* Mobile-friendly result input */}
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">Set {i + 1}:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="number"
                      min="0"
                      placeholder="A"
                      className={`${T.input} w-16 text-center`}
                      value={sets[i].a}
                      onChange={(e) =>
                        setSets((prev) =>
                          prev.map((s, j) =>
                            j === i ? { ...s, a: e.target.value } : s,
                          ),
                        )
                      }
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="B"
                      className={`${T.input} w-16 text-center`}
                      value={sets[i].b}
                      onChange={(e) =>
                        setSets((prev) =>
                          prev.map((s, j) =>
                            j === i ? { ...s, b: e.target.value } : s,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`mt-3 text-xs ${T.subtext} bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg`}
            >
              💡 Se dopo 2 set è 1–1, inserisci il 3° set per decidere.
            </div>
          </div>
        </div>

        {/* Match summary */}
        <div
          className={`mt-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 ${T.border}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-medium mb-1">Riepilogo partita:</div>
              <div className={T.subtext}>
                Sets:{" "}
                <span className="font-mono">
                  {rr.setsA}-{rr.setsB}
                </span>{" "}
                | Games:{" "}
                <span className="font-mono">
                  {rr.gamesA}-{rr.gamesB}
                </span>
                {rr.winner && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      rr.winner === "A"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    🏆 Vince Team {rr.winner}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={addMatch}
            disabled={!ready}
            className={`${T.btnPrimary} flex-1 sm:flex-none ${!ready ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            💾 Salva partita
          </button>
          <button
            type="button"
            onClick={showPreviewFormula}
            className={`${T.btnGhost} flex-1 sm:flex-none`}
          >
            🧮 Mostra formula punti
          </button>
        </div>
      </Section>

      <Section title="Ultime partite" T={T}>
        <div className="space-y-3">
          {(derivedMatches || []).length === 0 ? (
            <div
              className={`text-center py-8 ${T.cardBg} ${T.border} rounded-xl`}
            >
              <div className="text-4xl mb-2">🎾</div>
              <div className={`text-sm ${T.subtext}`}>
                Nessuna partita ancora giocata
              </div>
              <div className={`text-xs ${T.subtext} mt-1`}>
                Crea la prima partita sopra per iniziare
              </div>
            </div>
          ) : (
            (derivedMatches || [])
              .slice(-20)
              .reverse()
              .map((m) => (
                <MatchRow
                  key={m.id}
                  m={m}
                  playersById={playersById}
                  onShowFormula={onShowFormula}
                  onDelete={() => delMatch(m.id)}
                  T={T}
                />
              ))
          )}
        </div>
      </Section>
    </>
  );
}
