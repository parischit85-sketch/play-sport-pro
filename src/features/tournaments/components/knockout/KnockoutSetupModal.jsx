import React, { useEffect, useMemo, useState } from 'react';
import { X, Settings, Info, Sparkles } from 'lucide-react';
import { KNOCKOUT_ROUND, KNOCKOUT_ROUND_NAMES } from '../../utils/tournamentConstants';
import { getStandings } from '../../services/standingsService';
import { startManualKnockout } from '../../services/manualBracketService';
import VisualBracketEditor from './VisualBracketEditor';

function KnockoutSetupModal({ clubId, tournament, onClose, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [standings, setStandings] = useState([]);
  const [startingRound, setStartingRound] = useState(KNOCKOUT_ROUND.ROUND_OF_16);
  const [includeThirdPlace, setIncludeThirdPlace] = useState(
    tournament?.configuration?.includeThirdPlaceMatch ?? true
  );

  // Slots = number of teams for the chosen starting round
  const slotsCount = useMemo(() => {
    switch (startingRound) {
      case KNOCKOUT_ROUND.ROUND_OF_16:
        return 16;
      case KNOCKOUT_ROUND.QUARTER_FINALS:
        return 8;
      case KNOCKOUT_ROUND.SEMI_FINALS:
        return 4;
      case KNOCKOUT_ROUND.FINALS:
        return 2;
      default:
        return 8;
    }
  }, [startingRound]);

  const [slots, setSlots] = useState([]); // each element: teamId or 'BYE' or ''

  useEffect(() => {
    setSlots(Array(slotsCount).fill(''));
  }, [slotsCount]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStandings(clubId, tournament.id);
        setStandings(data || []);
      } catch (e) {
        console.error(e);
        setError('Errore nel caricamento delle classifiche');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clubId, tournament.id]);

  const selectedTeamIds = useMemo(() => new Set(slots.filter((s) => s && s !== 'BYE')), [slots]);

  const handleSlotChange = (idx, value) => {
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleAutoSeed = () => {
    // Semplice pre-riempimento: prende le prime N squadre per slot in ordine standings
    const take = Math.min(slotsCount, standings.length);
    const seeded = Array(slotsCount).fill('');
    for (let i = 0; i < take; i++) {
      seeded[i] = standings[i].teamId;
    }
    setSlots(seeded);
  };

  const canSave = useMemo(() => {
    // Allow saving even with BYEs or empty slots (treated as BYE)
    // but avoid duplicate team selections
    if (selectedTeamIds.size !== slots.filter((s) => s && s !== 'BYE').length) return false;
    // Must have at least 2 non-BYE teams overall
    const teamsCount = slots.filter((s) => s && s !== 'BYE').length;
    return teamsCount >= 2;
  }, [slots, selectedTeamIds]);

  const onSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      // Normalize slots: '' -> BYE (null)
      const normalizedSlots = slots.map((s) => (s === '' || s === 'BYE' ? null : s));
      const res = await startManualKnockout(clubId, tournament.id, {
        startingRound,
        includeThirdPlace,
        slots: normalizedSlots,
      });
      if (res.success) {
        onComplete?.();
        onClose?.();
      } else {
        setError(res.error || 'Errore nella creazione del tabellone');
      }
    } catch (e) {
      console.error(e);
      setError('Errore nella creazione del tabellone');
    } finally {
      setSaving(false);
    }
  };

  const roundOptions = [
    { value: KNOCKOUT_ROUND.ROUND_OF_16, label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.ROUND_OF_16] },
    { value: KNOCKOUT_ROUND.QUARTER_FINALS, label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.QUARTER_FINALS] },
    { value: KNOCKOUT_ROUND.SEMI_FINALS, label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.SEMI_FINALS] },
    { value: KNOCKOUT_ROUND.FINALS, label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div className="w-full max-w-7xl bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configura Tabellone Manuale
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Round iniziale</label>
              <select
                value={startingRound}
                onChange={(e) => setStartingRound(e.target.value)}
                className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {roundOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Opzioni</label>
              <div className="mt-2 flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeThirdPlace}
                    onChange={(e) => setIncludeThirdPlace(e.target.checked)}
                  />
                  <span className="text-gray-700 dark:text-gray-300">Includi Finale 3°/4° posto</span>
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Puoi impostare BYE per far avanzare automaticamente una squadra
                </div>
                <button
                  type="button"
                  onClick={handleAutoSeed}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 rounded border border-amber-200 dark:border-amber-800"
                  title="Riempie gli slot con le prime squadre in classifica"
                >
                  <Sparkles className="w-4 h-4" /> Auto-seeding rapido
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Configura abbinamenti iniziali</h4>
            {loading ? (
              <div className="py-8 text-center text-gray-500">Caricamento classifiche…</div>
            ) : (
              <VisualBracketEditor
                startingRound={startingRound}
                standings={standings}
                slots={slots}
                onChangeSlot={handleSlotChange}
                teamsPerGroup={tournament?.teamsPerGroup || 2}
              />
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Annulla</button>
          <button
            onClick={onSubmit}
            disabled={!canSave || saving}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
          >
            {saving ? 'Creazione…' : 'Crea Tabellone'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default KnockoutSetupModal;
