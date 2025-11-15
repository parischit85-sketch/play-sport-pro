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
    // All slots must be filled (either team or BYE), no empty slots allowed
    // Check if any slot is empty
    if (slots.some((s) => s === '')) return false;
    // Avoid duplicate team selections
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
      // Keep 'BYE' as-is when admin explicitly selects it
      // Keep teamIds as-is
      // Empty strings should not exist due to validation
      const normalizedSlots = slots.map((s) => s);
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
    {
      value: KNOCKOUT_ROUND.QUARTER_FINALS,
      label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.QUARTER_FINALS],
    },
    { value: KNOCKOUT_ROUND.SEMI_FINALS, label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.SEMI_FINALS] },
    { value: KNOCKOUT_ROUND.FINALS, label: KNOCKOUT_ROUND_NAMES[KNOCKOUT_ROUND.FINALS] },
  ];

  return (
    // Modal full-screen on mobile, centered panel on larger screens
    <div
      className="fixed inset-0 z-50 bg-black/60 flex flex-col sm:flex sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full h-full sm:h-auto sm:max-w-7xl bg-gray-900 sm:rounded-xl shadow-xl border border-gray-700 flex flex-col"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700 sticky top-0 bg-gray-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-white">Configura Tabellone Manuale</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {/* Scrollable content area */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label htmlFor="roundSelect" className="text-sm font-medium text-gray-300">
                Round iniziale
              </label>
              <select
                id="roundSelect"
                value={startingRound}
                onChange={(e) => setStartingRound(e.target.value)}
                aria-label="Round iniziale"
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 text-white"
              >
                {roundOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm font-medium text-gray-300">Opzioni</div>
              <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeThirdPlace}
                    onChange={(e) => setIncludeThirdPlace(e.target.checked)}
                  />
                  <span className="text-gray-300">Includi Finale 3°/4° posto</span>
                </label>
                <div className="text-xs text-gray-400 inline-flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Puoi impostare BYE per far avanzare automaticamente una squadra
                </div>
                <button
                  type="button"
                  onClick={handleAutoSeed}
                  className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-amber-900/30 text-amber-200 rounded border border-amber-800 w-full sm:w-auto"
                  title="Riempie gli slot con le prime squadre in classifica"
                >
                  <Sparkles className="w-4 h-4" /> Auto-seeding rapido
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2">
              Configura abbinamenti iniziali
            </h4>
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
        {/* Footer actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-700 flex items-center justify-end gap-2 sm:gap-3 sticky bottom-0 bg-gray-900/95 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
          >
            Annulla
          </button>
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
