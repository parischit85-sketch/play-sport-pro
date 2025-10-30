// =============================================
// FILE: src/features/tournaments/components/dashboard/TournamentEditModal.jsx
// Modal semplice per modificare le informazioni base del torneo
// =============================================

import React, { useMemo, useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { updateTournament } from '../../services/tournamentService';
import { getChampionshipApplyStatus } from '../../services/championshipApplyService';

export default function TournamentEditModal({ clubId, tournament, onClose, onSaved }) {
  const [isApplied, setIsApplied] = useState(false);
  const [checkingApplied, setCheckingApplied] = useState(true);

  useEffect(() => {
    async function checkApplied() {
      const status = await getChampionshipApplyStatus(clubId, tournament.id);
      setIsApplied(status.applied);
      setCheckingApplied(false);
    }
    checkApplied();
  }, [clubId, tournament.id]);
  const initial = useMemo(() => ({
    name: tournament?.name || '',
    description: tournament?.description || '',
    numberOfGroups: tournament?.configuration?.numberOfGroups || tournament?.groupsConfig?.numberOfGroups || 4,
    teamsPerGroup: tournament?.configuration?.teamsPerGroup || tournament?.groupsConfig?.teamsPerGroup || 4,
    qualifiedPerGroup: tournament?.configuration?.qualifiedPerGroup || 2,
    includeThirdPlaceMatch: tournament?.configuration?.includeThirdPlaceMatch ?? true,
    defaultRankingForNonParticipants:
      tournament?.configuration?.defaultRankingForNonParticipants ?? 1500,
    championshipPoints: {
      rpaMultiplier: tournament?.configuration?.championshipPoints?.rpaMultiplier ?? 1,
      groupPlacementPoints: {
        1: tournament?.configuration?.championshipPoints?.groupPlacementPoints?.[1] ?? 100,
        2: tournament?.configuration?.championshipPoints?.groupPlacementPoints?.[2] ?? 60,
        3: tournament?.configuration?.championshipPoints?.groupPlacementPoints?.[3] ?? 40,
        4: tournament?.configuration?.championshipPoints?.groupPlacementPoints?.[4] ?? 20,
      },
      knockoutProgressPoints: {
        round_of_16: tournament?.configuration?.championshipPoints?.knockoutProgressPoints?.round_of_16 ?? 10,
        quarter_finals: tournament?.configuration?.championshipPoints?.knockoutProgressPoints?.quarter_finals ?? 20,
        semi_finals: tournament?.configuration?.championshipPoints?.knockoutProgressPoints?.semi_finals ?? 40,
        finals: tournament?.configuration?.championshipPoints?.knockoutProgressPoints?.finals ?? 80,
        third_place: tournament?.configuration?.championshipPoints?.knockoutProgressPoints?.third_place ?? 15,
      },
    },
  }), [tournament]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Validazioni minime
      if (!form.name?.trim()) {
        setError('Il nome del torneo è obbligatorio');
        setSaving(false);
        return;
      }
      if (form.numberOfGroups < 1 || form.teamsPerGroup < 2) {
        setError('Configurazione gironi non valida');
        setSaving(false);
        return;
      }

      const updates = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        'configuration.numberOfGroups': Number(form.numberOfGroups),
        'configuration.teamsPerGroup': Number(form.teamsPerGroup),
        'configuration.qualifiedPerGroup': Number(form.qualifiedPerGroup),
        'configuration.includeThirdPlaceMatch': !!form.includeThirdPlaceMatch,
        'configuration.defaultRankingForNonParticipants': Number(form.defaultRankingForNonParticipants) || 1500,
        // Calcola maxTeams basato sulla nuova configurazione
        maxTeams: Number(form.numberOfGroups) * Number(form.teamsPerGroup),
        // Championship points config
        'configuration.championshipPoints.rpaMultiplier': Number(form.championshipPoints?.rpaMultiplier ?? 1),
        'configuration.championshipPoints.groupPlacementPoints.1': Number(form.championshipPoints?.groupPlacementPoints?.[1] ?? 100),
        'configuration.championshipPoints.groupPlacementPoints.2': Number(form.championshipPoints?.groupPlacementPoints?.[2] ?? 60),
        'configuration.championshipPoints.groupPlacementPoints.3': Number(form.championshipPoints?.groupPlacementPoints?.[3] ?? 40),
        'configuration.championshipPoints.groupPlacementPoints.4': Number(form.championshipPoints?.groupPlacementPoints?.[4] ?? 20),
        'configuration.championshipPoints.knockoutProgressPoints.round_of_16': Number(form.championshipPoints?.knockoutProgressPoints?.round_of_16 ?? 10),
        'configuration.championshipPoints.knockoutProgressPoints.quarter_finals': Number(form.championshipPoints?.knockoutProgressPoints?.quarter_finals ?? 20),
        'configuration.championshipPoints.knockoutProgressPoints.semi_finals': Number(form.championshipPoints?.knockoutProgressPoints?.semi_finals ?? 40),
        'configuration.championshipPoints.knockoutProgressPoints.finals': Number(form.championshipPoints?.knockoutProgressPoints?.finals ?? 80),
        'configuration.championshipPoints.knockoutProgressPoints.third_place': Number(form.championshipPoints?.knockoutProgressPoints?.third_place ?? 15),
      };

      const res = await updateTournament(clubId, tournament.id, updates);
      if (!res.success) {
        setError(res.error || 'Errore durante il salvataggio');
        setSaving(false);
        return;
      }

      onSaved?.();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900/50">
          <h3 className="text-lg font-semibold text-white">Modifica Torneo</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-800">
          {/* Sezione: Informazioni Base */}
          <div className="rounded-lg border border-gray-700 p-4">
            <div className="font-semibold text-gray-100 mb-3">Informazioni Base</div>
          {error && (
            <div className="p-3 rounded bg-red-900/20 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nome torneo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ranking default per non partecipanti</label>
                <input
                  type="number"
                  min={500}
                  max={3000}
                  step={50}
                  value={form.defaultRankingForNonParticipants}
                  onChange={(e) => setField('defaultRankingForNonParticipants', parseInt(e.target.value) || 1500)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">Usato per i giocatori del circolo non iscritti al torneo quando selezionati nelle squadre.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Descrizione</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descrizione"
              />
            </div>
          </div>

          {/* Sezione: Configurazione Gironi */}
          <div className="rounded-lg border border-gray-700 p-4">
            <div className="font-semibold text-gray-100 mb-3">Configurazione Gironi</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Gironi</label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={form.numberOfGroups}
                  onChange={(e) => setField('numberOfGroups', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Squadre/Girone</label>
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={form.teamsPerGroup}
                  onChange={(e) => setField('teamsPerGroup', parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Qualificati/Girone</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={form.qualifiedPerGroup}
                  onChange={(e) => setField('qualifiedPerGroup', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                id="includeThirdPlaceMatch"
                type="checkbox"
                checked={!!form.includeThirdPlaceMatch}
                onChange={(e) => setField('includeThirdPlaceMatch', e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded border-gray-600"
              />
              <label htmlFor="includeThirdPlaceMatch" className="text-sm text-gray-300">
                Includi finale 3°/4° posto
              </label>
            </div>
          </div>

          {/* Sezione: Punti Campionato */}
          <div className="rounded-lg border border-gray-700 p-4">
            <div className="font-semibold text-gray-100 mb-3">Punti Campionato (bozza)</div>
            
            {/* ⚠️ WARNING: Se il torneo è già applicato */}
            {isApplied && (
              <div className="mb-4 bg-red-900/20 border-2 border-red-700 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-200">
                  <div className="font-semibold mb-1">🔒 Configurazione Bloccata - Punti Già Applicati</div>
                  <p className="text-xs">
                    I campi sono <strong>disabilitati</strong> perché i punti campionato sono stati già applicati. 
                    Per modificare la configurazione, devi prima <strong>annullare l'applicazione</strong> dei punti, 
                    poi modificare i valori, e infine <strong>riapplicare</strong> i punti campionato.
                  </p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Moltiplicatore RPA</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.championshipPoints.rpaMultiplier}
                  onChange={(e) => setField('championshipPoints', {
                    ...form.championshipPoints,
                    rpaMultiplier: Number(e.target.value) || 0,
                  })}
                  disabled={isApplied}
                  className={`w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isApplied ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <p className="mt-1 text-xs text-gray-400">Somma dei delta RPA per match × moltiplicatore</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Piazzamento Girone</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1,2,3,4].map((pos) => (
                    <div key={pos} className="flex flex-col">
                      <span className="text-xs text-gray-400">{pos}°</span>
                      <input
                        type="number"
                        min={0}
                        value={form.championshipPoints.groupPlacementPoints[pos] || 0}
                        onChange={(e) => setField('championshipPoints', {
                          ...form.championshipPoints,
                          groupPlacementPoints: {
                            ...form.championshipPoints.groupPlacementPoints,
                            [pos]: Number(e.target.value) || 0,
                          },
                        })}
                        disabled={isApplied}
                        className={`px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isApplied ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Eliminazione Diretta (per vittoria)</label>
              <div className="grid md:grid-cols-5 gap-2">
                {[
                  { key: 'round_of_16', label: 'Ottavi' },
                  { key: 'quarter_finals', label: 'Quarti' },
                  { key: 'semi_finals', label: 'Semifinali' },
                  { key: 'finals', label: 'Finale' },
                  { key: 'third_place', label: '3°/4°' },
                ].map((r) => (
                  <div key={r.key} className="flex flex-col">
                    <span className="text-xs text-gray-400">{r.label}</span>
                    <input
                      type="number"
                      min={0}
                      value={form.championshipPoints.knockoutProgressPoints[r.key] || 0}
                      onChange={(e) => setField('championshipPoints', {
                        ...form.championshipPoints,
                        knockoutProgressPoints: {
                          ...form.championshipPoints.knockoutProgressPoints,
                          [r.key]: Number(e.target.value) || 0,
                        },
                      })}
                      disabled={isApplied}
                      className={`px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isApplied ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-700 bg-gray-900/50">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 hover:bg-gray-600">
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </div>
    </div>
  );
}

