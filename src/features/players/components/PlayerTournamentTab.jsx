// =============================================
// FILE: src/features/players/components/PlayerTournamentTab.jsx
// Tab per gestire la partecipazione al campionato
// =============================================

import React, { useState, useEffect } from 'react';

export default function PlayerTournamentTab({ player, onUpdate, T }) {
  const [formData, setFormData] = useState({
    isParticipant: false,
    initialRanking: null,
    division: null,
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    console.log('🏆 [PlayerTournamentTab] Loading data for player:', player?.id);
    console.log('🏆 [PlayerTournamentTab] player.tournamentData:', player?.tournamentData);
    console.log('🏆 [PlayerTournamentTab] player.rating (currentRanking):', player?.rating);
    
    if (player?.tournamentData) {
      setFormData({
        isParticipant: player.tournamentData.isParticipant || false,
        // 🔄 initialRanking: se non c'è, usa currentRanking che è sincronizzato con rating
        initialRanking: player.tournamentData.initialRanking || player.tournamentData.currentRanking || 1500,
        division: player.tournamentData.division || null,
        notes: player.tournamentData.notes || '',
        isActive: player.tournamentData.isActive !== undefined ? player.tournamentData.isActive : true,
      });
    } else {
      // Initialize with default
      setFormData(prev => ({
        ...prev,
        initialRanking: 1500,
      }));
    }
  }, [player]);

  const handleSave = () => {
    console.log('💾 [PlayerTournamentTab] Saving with formData:', formData);
    console.log('💾 [PlayerTournamentTab] formData.initialRanking:', formData.initialRanking);
    console.log('💾 [PlayerTournamentTab] formData.isParticipant:', formData.isParticipant);
    
    // Ensure initialRanking is a valid number (not null/undefined/0)
    const validInitialRanking = formData.initialRanking && formData.initialRanking > 0 
      ? formData.initialRanking 
      : (player.rating || 1500);
    
    const tournamentData = {
      ...player.tournamentData,
      isParticipant: formData.isParticipant,
      initialRanking: validInitialRanking,
      // 🔄 currentRanking = player.rating (valore calcolato dalle partite)
      // Se non esiste player.rating, usa initialRanking come fallback
      currentRanking: player.rating || validInitialRanking,
      division: formData.division || null,
      notes: formData.notes || '',
      isActive: formData.isActive,
      // Set joinedAt only if becoming participant for first time
      joinedAt: player.tournamentData?.joinedAt || (formData.isParticipant ? new Date() : null),
      activeSince: formData.isParticipant ? (player.tournamentData?.activeSince || new Date()) : null,
      // Keep existing stats
      totalMatches: player.tournamentData?.totalMatches || 0,
      wins: player.tournamentData?.wins || 0,
      losses: player.tournamentData?.losses || 0,
      winRate: player.tournamentData?.winRate || 0,
      points: player.tournamentData?.points || 0,
    };

    console.log('💾 [PlayerTournamentTab] Final tournamentData to save:', tournamentData);

    onUpdate({
      tournamentData,
    });
  };

  const stats = player?.tournamentData || {};
  const hasStats = stats.totalMatches > 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={`${T.cardBg} ${T.border} rounded-lg p-6`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold ${T.text} mb-2`}>
              🏆 Partecipazione Campionato
            </h3>
            <p className={`text-sm ${T.subtext}`}>
              Abilita questo giocatore a partecipare al campionato del circolo
            </p>
          </div>
          {formData.isParticipant && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              ✓ Partecipante
            </span>
          )}
        </div>

        {/* Toggle Participation */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50 mb-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={formData.isParticipant}
                onChange={(e) => setFormData({ ...formData, isParticipant: e.target.checked })}
              />
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                  formData.isParticipant
                    ? 'bg-blue-600 border-blue-600 shadow-lg'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                }`}
              >
                {formData.isParticipant && (
                  <span className="text-white text-sm font-bold">✓</span>
                )}
              </div>
            </div>
            <div>
              <span className={`${T.label} font-semibold ${formData.isParticipant ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                Abilita partecipazione al campionato
              </span>
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
              <label className={`block ${T.label} mb-2`}>
                🎯 Ranking Iniziale *
              </label>
              <input
                type="number"
                min="0"
                max="5000"
                step="10"
                value={formData.initialRanking || ''}
                onChange={(e) => setFormData({ ...formData, initialRanking: parseInt(e.target.value) || 0 })}
                className={`w-full p-3 ${T.input} rounded-lg border ${T.border} focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                placeholder="1500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ranking iniziale del giocatore (solitamente tra 1000 e 2500)
              </p>
            </div>

            {/* Division */}
            <div>
              <label className={`block ${T.label} mb-2`}>
                📊 Divisione/Categoria
              </label>
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
                    {formData.isActive && (
                      <span className="text-white text-sm font-bold">✓</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className={`${T.label} font-semibold ${formData.isActive ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
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
              <label className={`block ${T.label} mb-2`}>
                📝 Note
              </label>
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

      {/* Statistics Card (only if participating and has stats) */}
      {formData.isParticipant && hasStats && (
        <div className={`${T.cardBg} ${T.border} rounded-lg p-6`}>
          <h4 className={`text-lg font-bold ${T.text} mb-4`}>
            📊 Statistiche Campionato
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Matches */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalMatches}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Partite Totali
              </div>
            </div>

            {/* Wins */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.wins}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Vittorie
              </div>
            </div>

            {/* Losses */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.losses}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Sconfitte
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.winRate ? `${stats.winRate.toFixed(1)}%` : '0%'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Win Rate
              </div>
            </div>
          </div>

          {/* Ranking Evolution */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Ranking Iniziale
              </div>
              <div className={`text-xl font-bold ${T.text}`}>
                {stats.initialRanking || 'N/A'}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Ranking Attuale
              </div>
              <div className={`text-xl font-bold ${T.text}`}>
                {stats.currentRanking || stats.initialRanking || 'N/A'}
              </div>
              {stats.currentRanking && stats.initialRanking && (
                <div className={`text-sm mt-1 ${stats.currentRanking >= stats.initialRanking ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.currentRanking >= stats.initialRanking ? '↑' : '↓'} {Math.abs(stats.currentRanking - stats.initialRanking)} punti
                </div>
              )}
            </div>
          </div>

          {/* Joined Date */}
          {stats.joinedAt && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              📅 Partecipa dal: {new Date(stats.joinedAt).toLocaleDateString('it-IT')}
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-2">Come funziona la partecipazione al campionato:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Abilita la partecipazione per far apparire il giocatore nelle classifiche</li>
              <li>Imposta il ranking iniziale in base al livello stimato del giocatore</li>
              <li>Il ranking verrà aggiornato automaticamente in base ai risultati delle partite</li>
              <li>Puoi disattivare temporaneamente la partecipazione senza perdere i dati</li>
              <li>Le statistiche vengono calcolate automaticamente dopo ogni partita</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
