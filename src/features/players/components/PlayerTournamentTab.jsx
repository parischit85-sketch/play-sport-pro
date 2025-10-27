// =============================================
// FILE: src/features/players/components/PlayerTournamentTab.jsx
// Tab per gestire la partecipazione al campionato
// =============================================

import React, { useState, useEffect } from 'react';
import { useClub } from '@contexts/ClubContext.jsx';
import { db } from '@services/firebase.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function PlayerTournamentTab({ player, onUpdate, T }) {
  const { clubId } = useClub();
  const [formData, setFormData] = useState({
    isParticipant: false,
    initialRanking: null,
    division: null,
    notes: '',
    isActive: true,
  });
  const [champEntries, setChampEntries] = useState([]);

  useEffect(() => {
    console.log('🏆 [PlayerTournamentTab] Loading data for player:', player?.id);
    console.log('🏆 [PlayerTournamentTab] player.tournamentData:', player?.tournamentData);
    console.log('🏆 [PlayerTournamentTab] player.rating (currentRanking):', player?.rating);

    if (player?.tournamentData) {
      setFormData({
        isParticipant: player.tournamentData.isParticipant || false,
        // 🔄 initialRanking: se non c'è, usa currentRanking che è sincronizzato con rating
        initialRanking:
          player.tournamentData.initialRanking || player.tournamentData.currentRanking || 1500,
        division: player.tournamentData.division || null,
        notes: player.tournamentData.notes || '',
        isActive:
          player.tournamentData.isActive !== undefined ? player.tournamentData.isActive : true,
      });
    } else {
      // Initialize with default
      setFormData((prev) => ({
        ...prev,
        initialRanking: 1500,
      }));
    }
  }, [player]);

  // 🧾 Storico punti campionato (per torneo) dal leaderboard/{playerId}/entries
  useEffect(() => {
    if (!clubId || !player?.id) return;
    try {
      const entriesRef = collection(db, 'clubs', clubId, 'leaderboard', player.id, 'entries');
      const q = query(entriesRef, orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setChampEntries(rows);
      });
      return () => unsub();
    } catch (e) {
      console.warn('⚠️ [PlayerTournamentTab] Failed to subscribe champ entries:', e);
    }
  }, [clubId, player?.id]);

  const handleSave = () => {
    console.log('💾 [PlayerTournamentTab] Saving with formData:', formData);
    console.log('💾 [PlayerTournamentTab] formData.initialRanking:', formData.initialRanking);
    console.log('💾 [PlayerTournamentTab] formData.isParticipant:', formData.isParticipant);

    // Ensure initialRanking is a valid number (not null/undefined/0)
    const validInitialRanking =
      formData.initialRanking && formData.initialRanking > 0
        ? formData.initialRanking
        : player.rating || 1500;

    // Check if initialRanking has changed from the current value
    const initialRankingChanged = player.tournamentData?.initialRanking !== validInitialRanking;

    const tournamentData = {
      ...player.tournamentData,
      isParticipant: formData.isParticipant,
      initialRanking: validInitialRanking,
      // 🔄 If initialRanking changed, reset currentRanking to the new initial value
      // Otherwise keep the current calculated rating
      currentRanking: initialRankingChanged ? validInitialRanking : (player.rating || validInitialRanking),
      division: formData.division || null,
      notes: formData.notes || '',
      isActive: formData.isActive,
      // Set joinedAt only if becoming participant for first time
      joinedAt: player.tournamentData?.joinedAt || (formData.isParticipant ? new Date() : null),
      activeSince: formData.isParticipant ? player.tournamentData?.activeSince || new Date() : null,
      // Keep existing stats
      totalMatches: player.tournamentData?.totalMatches || 0,
      wins: player.tournamentData?.wins || 0,
      losses: player.tournamentData?.losses || 0,
      winRate: player.tournamentData?.winRate || 0,
      points: player.tournamentData?.points || 0,
    };

    console.log('💾 [PlayerTournamentTab] Final tournamentData to save:', tournamentData);
    console.log('💾 [PlayerTournamentTab] initialRankingChanged:', initialRankingChanged);

    onUpdate({
      tournamentData,
      // If initialRanking changed, also update the profile rating to reset it
      ...(initialRankingChanged && { rating: validInitialRanking, baseRating: validInitialRanking })
    });
  };

  const stats = player?.tournamentData || {};
  const hasStats = stats.totalMatches > 0;
  
  // Calculate ranking change
  const rankingChange = stats.currentRanking && stats.initialRanking 
    ? stats.currentRanking - stats.initialRanking 
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Card - Tournament Status */}
      <div className={`${T.cardBg} ${T.border} rounded-2xl p-6 shadow-lg relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🏆</span>
                <h3 className={`text-2xl font-bold ${T.text}`}>Campionato</h3>
              </div>
              <p className={`text-sm ${T.subtext} max-w-2xl`}>
                Gestisci la partecipazione del giocatore al campionato del circolo
              </p>
            </div>
            
            {formData.isParticipant && (
              <div className="flex flex-col items-end gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="mr-1">✓</span>
                  PARTECIPANTE ATTIVO
                </span>
                {formData.isActive ? (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    In gara
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-semibold">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    Sospeso
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Toggle Participation */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border-2 border-blue-200/50 dark:border-blue-700/50 mb-6 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only"
                checked={formData.isParticipant}
                onChange={(e) => setFormData({ ...formData, isParticipant: e.target.checked })}
              />
              <div
                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                  formData.isParticipant
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 border-blue-600 shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover:border-blue-400 group-hover:scale-105'
                }`}
              >
                {formData.isParticipant && <span className="text-white text-lg font-bold">✓</span>}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`${T.label} font-bold text-base ${formData.isParticipant ? 'text-blue-700 dark:text-blue-300' : ''}`}
                >
                  Abilita partecipazione al campionato
                </span>
                {formData.isParticipant && <span className="text-lg">🎯</span>}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Il giocatore apparirà in Classifica, Statistiche e Crea Partita
              </p>
            </div>
          </label>
        </div>

        {/* Configuration Fields (only if participating) */}
        {formData.isParticipant && (
          <div className="space-y-4">
            {/* Initial Ranking */}
            <div>
              <label className={`block ${T.label} mb-2`}>🎯 Ranking Iniziale *</label>
              <input
                type="number"
                min="0"
                max="5000"
                step="10"
                value={formData.initialRanking || ''}
                onChange={(e) =>
                  setFormData({ ...formData, initialRanking: parseInt(e.target.value) || 0 })
                }
                className={`w-full p-3 ${T.input} rounded-lg border ${T.border} focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                placeholder="1500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ranking iniziale del giocatore (solitamente tra 1000 e 2500)
              </p>
            </div>

            {/* Division */}
            <div>
              <label className={`block ${T.label} mb-2`}>📊 Divisione/Categoria</label>
              <select
                value={formData.division || ''}
                onChange={(e) => setFormData({ ...formData, division: e.target.value || null })}
                className={`w-full p-3 ${T.input} rounded-lg border ${T.border} focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
              >
                <option value="">Nessuna divisione</option>
                <option value="A">Divisione A - Avanzato</option>
                <option value="B">Divisione B - Intermedio</option>
                <option value="C">Divisione C - Principiante</option>
                <option value="Open">Open - Tutti i livelli</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Opzionale: assegna il giocatore a una divisione specifica
              </p>
            </div>

            {/* Active Status */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-700/50">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      formData.isActive
                        ? 'bg-emerald-600 border-emerald-600 shadow-lg'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover:border-emerald-400'
                    }`}
                  >
                    {formData.isActive && <span className="text-white text-sm font-bold">✓</span>}
                  </div>
                </div>
                <div>
                  <span
                    className={`${T.label} font-semibold ${formData.isActive ? 'text-emerald-700 dark:text-emerald-300' : ''}`}
                  >
                    Partecipazione attiva
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Disattiva temporaneamente senza rimuovere dal campionato
                  </p>
                </div>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className={`block ${T.label} mb-2`}>📝 Note</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className={`w-full p-3 ${T.input} rounded-lg border ${T.border} focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none`}
                placeholder="Note sulla partecipazione al campionato..."
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            className="w-full py-3 px-6 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold transition-colors shadow-lg"
          >
            💾 Salva Configurazione Campionato
          </button>
        </div>
        </div>
      </div>

      {/* Statistics Card (only if participating and has stats) */}
      {formData.isParticipant && hasStats && (
        <div className={`${T.cardBg} ${T.border} rounded-2xl p-6 shadow-lg`}>
          <h4 className={`text-xl font-bold ${T.text} mb-6 flex items-center gap-3`}>
            <span className="text-2xl">📊</span>
            Statistiche Campionato
          </h4>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total Matches */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🎾</span>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Totali</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalMatches}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Partite</div>
            </div>

            {/* Wins */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">✅</span>
                <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">Vinte</div>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.wins}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Vittorie</div>
            </div>

            {/* Losses */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-5 border border-red-200 dark:border-red-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">❌</span>
                <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Perse</div>
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.losses}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Sconfitte</div>
            </div>

            {/* Win Rate */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🎯</span>
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">Ratio</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.winRate ? `${stats.winRate.toFixed(1)}%` : '0%'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Win Rate</div>
            </div>
          </div>

          {/* Ranking Evolution - Enhanced Visual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Initial Ranking */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-5 border-2 border-orange-200 dark:border-orange-700">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🎯</span>
                <div className="text-xs font-bold text-orange-900 dark:text-orange-200 uppercase tracking-wider">
                  Ranking Iniziale
                </div>
              </div>
              <div className="text-4xl font-black text-orange-600 dark:text-orange-400">
                {stats.initialRanking || 'N/A'}
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-300 mt-2 font-medium">
                Punto di partenza
              </div>
            </div>

            {/* Current Ranking */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border-2 border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🏆</span>
                <div className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  Ranking Attuale
                </div>
              </div>
              <div className="text-4xl font-black text-purple-600 dark:text-purple-400">
                {stats.currentRanking || stats.initialRanking || 'N/A'}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300 mt-2 font-medium">
                Posizione corrente
              </div>
            </div>

            {/* Progression */}
            <div className={`rounded-xl p-5 border-2 ${
              rankingChange > 0
                ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-green-300 dark:border-green-700'
                : rankingChange < 0
                ? 'bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-800/20 border-red-300 dark:border-red-700'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border-gray-300 dark:border-gray-700'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">
                  {rankingChange > 0 ? '📈' : rankingChange < 0 ? '📉' : '➡️'}
                </span>
                <div className={`text-xs font-bold uppercase tracking-wider ${
                  rankingChange > 0
                    ? 'text-green-900 dark:text-green-200'
                    : rankingChange < 0
                    ? 'text-red-900 dark:text-red-200'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Progressione
                </div>
              </div>
              <div className={`text-4xl font-black ${
                rankingChange > 0
                  ? 'text-green-600 dark:text-green-400'
                  : rankingChange < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {rankingChange > 0 ? '+' : ''}{rankingChange}
              </div>
              <div className={`text-xs mt-2 font-medium flex items-center gap-1 ${
                rankingChange > 0
                  ? 'text-green-700 dark:text-green-300'
                  : rankingChange < 0
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                <span className="text-lg">
                  {rankingChange > 0 ? '↗' : rankingChange < 0 ? '↘' : '→'}
                </span>
                {rankingChange > 0 ? 'In crescita' : rankingChange < 0 ? 'In calo' : 'Stabile'}
              </div>
            </div>
          </div>

          {/* Progress Bar Visual */}
          {stats.initialRanking && stats.currentRanking && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Progressione Visuale</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {rankingChange > 0 ? `+${Math.abs(rankingChange)}` : rankingChange < 0 ? `-${Math.abs(rankingChange)}` : '0'} punti
                </span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    rankingChange > 0 
                      ? 'bg-gradient-to-r from-green-400 to-green-600'
                      : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${Math.min(Math.abs(rankingChange) / 10, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Joined Date */}
          {stats.joinedAt && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="text-xs font-semibold text-blue-900 dark:text-blue-200">Membro dal</div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {new Date(stats.joinedAt).toLocaleDateString('it-IT', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🧾 Storico punti torneo (aggiunge una riga per ogni applicazione punti) */}
      <div className={`${T.cardBg} ${T.border} rounded-2xl p-6 shadow-lg`}>
        <h4 className={`text-xl font-bold ${T.text} mb-4 flex items-center gap-3`}>
          <span className="text-2xl">🧾</span>
          Storico punti torneo
        </h4>
        {champEntries.length === 0 ? (
          <div className="text-sm italic text-gray-500 dark:text-gray-400">Nessuna voce ancora</div>
        ) : (
          <ul className="space-y-2">
            {champEntries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">🏆</span>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold ${T.text} truncate`}>
                      Torneo: {e.tournamentName || '—'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {e.createdAt ? new Date(e.createdAt).toLocaleString('it-IT') : ''}
                    </div>
                  </div>
                </div>
                <div className="ml-4 shrink-0 text-right">
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400">+{Number(e.points || 0).toFixed(1)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">punti</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-2">Come funziona la partecipazione al campionato:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Abilita la partecipazione per far apparire il giocatore nelle classifiche</li>
              <li>Imposta il ranking iniziale in base al livello stimato del giocatore</li>
              <li>
                Il ranking verrà aggiornato automaticamente in base ai risultati delle partite
              </li>
              <li>Puoi disattivare temporaneamente la partecipazione senza perdere i dati</li>
              <li>Le statistiche vengono calcolate automaticamente dopo ogni partita</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
