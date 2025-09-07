import React, { useMemo, useState } from 'react';
import Section from '@ui/Section.jsx';
import { DEFAULT_RATING, uid } from '@lib/ids.js';
import { byPlayerFirstAlpha } from '@lib/names.js';

export default function Giocatori({ state, setState, onOpenStats, playersById, T }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [startRank, setStartRank] = useState(String(DEFAULT_RATING));

  const players = Array.isArray(state?.players) ? state.players : [];
  const playersAlpha = useMemo(() => [...players].sort(byPlayerFirstAlpha), [players]);

  const add = () => {
    const fn = firstName.trim(); const ln = lastName.trim();
    if (!fn || !ln) return;
    const n = `${fn} ${ln}`.trim();
    const start = Number(startRank || DEFAULT_RATING) || DEFAULT_RATING;

    setState((s) => {
      const cur = Array.isArray(s?.players) ? s.players : [];
      return { ...(s || { players: [], matches: [] }), players: [...cur, { id: uid(), name: n, baseRating: start, rating: start }] };
    });

    setFirstName(''); setLastName(''); setStartRank(String(DEFAULT_RATING));
  };

  const remove = (id) => {
    if (!confirm('Rimuovere il giocatore?')) return;
    setState((s) => {
      const cur = Array.isArray(s?.players) ? s.players : [];
      return { ...(s || { players: [], matches: [] }), players: cur.filter((p) => p.id !== id) };
    });
  };

  return (
    <Section title="Giocatori" T={T}>
      {/* Form per aggiungere giocatori - mobile optimized */}
      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="space-y-3 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className={`text-xs ${T.subtext} mb-1`}>Nome</label>
            <input 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              placeholder="Nome" 
              className={`${T.input} w-full`} 
            />
          </div>
          <div className="flex flex-col">
            <label className={`text-xs ${T.subtext} mb-1`}>Cognome</label>
            <input 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              placeholder="Cognome" 
              className={`${T.input} w-full`} 
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col flex-1">
            <label className={`text-xs ${T.subtext} mb-1`}>Ranking iniziale</label>
            <input 
              type="number" 
              value={startRank} 
              onChange={(e) => setStartRank(e.target.value)} 
              className={`${T.input} w-full`} 
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className={`${T.btnPrimary} w-full sm:w-auto px-6`}>
              Aggiungi Giocatore
            </button>
          </div>
        </div>
      </form>

      {/* Lista giocatori - mobile optimized */}
      <div className="space-y-3">
        {playersAlpha.length === 0 ? (
          <div className={`text-center py-8 ${T.cardBg} ${T.border} rounded-xl`}>
            <div className="text-4xl mb-2">👥</div>
            <div className={`text-sm ${T.subtext}`}>Nessun giocatore presente.</div>
            <div className={`text-xs ${T.subtext} mt-1`}>Aggiungi il primo giocatore sopra per iniziare</div>
          </div>
        ) : (
          <>
            {/* Mobile cards (hidden on larger screens) */}
            <div className="block lg:hidden space-y-3">
              {playersAlpha.map((p) => {
                const liveRating = playersById?.[p.id]?.rating ?? p.rating ?? DEFAULT_RATING;
                return (
                  <div key={p.id} className={`rounded-xl ${T.cardBg} ${T.border} p-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <button 
                        type="button" 
                        onClick={() => onOpenStats?.(p.id)} 
                        className="font-semibold text-lg hover:opacity-80 transition truncate flex-1 text-left"
                      >
                        {p.name}
                      </button>
                      <div className="text-right">
                        <div className="font-bold text-blue-600 dark:text-blue-400">
                          {Number(liveRating).toFixed(2)}
                        </div>
                        <div className={`text-xs ${T.subtext}`}>Ranking</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => onOpenStats?.(p.id)} 
                        className={`${T.btnSecondary} flex-1 py-2 text-sm`}
                      >
                        📊 Statistiche
                      </button>
                      <button 
                        type="button" 
                        onClick={() => remove(p.id)} 
                        className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop grid (hidden on mobile) */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-3">
              {playersAlpha.map((p) => {
                const liveRating = playersById?.[p.id]?.rating ?? p.rating ?? DEFAULT_RATING;
                return (
                  <div key={p.id} className={`rounded-xl ${T.cardBg} ${T.border} p-3 flex items-center justify-between`}>
                    <div className="min-w-0 flex-1">
                      <button 
                        type="button" 
                        onClick={() => onOpenStats?.(p.id)} 
                        className="font-medium hover:opacity-80 transition truncate block"
                      >
                        {p.name}
                      </button>
                      <div className={`text-xs ${T.subtext}`}>Ranking: {Number(liveRating).toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        type="button" 
                        onClick={() => onOpenStats?.(p.id)} 
                        className={T.link}
                      >
                        Statistiche
                      </button>
                      <button 
                        type="button" 
                        onClick={() => remove(p.id)} 
                        className="text-rose-500 hover:opacity-80 text-sm"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats summary for mobile */}
            <div className="block lg:hidden mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className={`text-center text-sm ${T.subtext}`}>
                📊 Totale giocatori: <span className="font-semibold">{playersAlpha.length}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}

