import React, { useMemo, useState } from 'react';
import { ChevronRight, Crown } from 'lucide-react';
import { KNOCKOUT_ROUND, KNOCKOUT_ROUND_NAMES } from '../../utils/tournamentConstants';
import TeamPickerModal from './TeamPickerModal';

/**
 * VisualBracketEditor
 * - Visualizza il tabellone in colonne di round
 * - Consente l'assegnazione delle squadre SOLO nel primo round (slot iniziali)
 * - Supporta BYE (selezione dedicata nella select)
 */
function VisualBracketEditor({
  startingRound,
  standings,
  slots, // array di length N (16/8/4/2)
  onChangeSlot, // (index, teamId|'BYE'|'') => void
  teamsPerGroup = 2,
}) {
  const totalSlots = slots.length;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlotIndex, setPickerSlotIndex] = useState(null);

  // Calcola il numero di partite per round a partire dal round iniziale
  const rounds = useMemo(() => buildRounds(totalSlots, startingRound), [totalSlots, startingRound]);

  // Mappa slot index -> coppia match (solo primo round)
  const firstRoundPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < totalSlots / 2; i++) {
      pairs.push([i * 2, i * 2 + 1]);
    }
    return pairs;
  }, [totalSlots]);

  // Keep selected set available if needed in future (currently managed inside TeamPickerModal)
  // const selectedTeamIds = useMemo(() => new Set(slots.filter((s) => s && s !== 'BYE')), [slots]);

  const openPicker = (slotIndex) => {
    setPickerSlotIndex(slotIndex);
    setPickerOpen(true);
  };
  const closePicker = () => {
    setPickerOpen(false);
    setPickerSlotIndex(null);
  };
  const handlePick = (value) => {
    if (pickerSlotIndex !== null && pickerSlotIndex !== undefined) {
      onChangeSlot(pickerSlotIndex, value);
    }
  };

  const renderTeamSelect = (slotIndex, label) => {
    const value = slots[slotIndex];
    const current = standings.find((s) => s.teamId === value);
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => openPicker(slotIndex)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 text-left px-3 py-2 text-sm text-gray-100 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          title="Seleziona dalla classifica del girone"
        >
          {value === '' && <span className="text-gray-400">— {label} —</span>}
          {value === 'BYE' && <span className="text-amber-300">BYE</span>}
          {value && value !== 'BYE' && (
            <span>
              {current
                ? `${current.teamName} · Girone ${current.groupId} · Pos ${current.position}`
                : value}
            </span>
          )}
        </button>
      </div>
    );
  };

  const renderFirstRound = () => (
    <div className="flex flex-col gap-6 min-w-[260px]">
      <RoundHeader title={rounds[0].label} count={firstRoundPairs.length} />
      {firstRoundPairs.map(([a, b], idx) => (
        <div
          key={idx}
          className="relative bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-sm"
        >
          <div className="text-xs text-gray-400 mb-1">Match {idx + 1}</div>
          <div className="flex flex-col gap-2">
            {renderTeamSelect(a, `Slot ${a + 1}`)}
            <div className="text-center text-[10px] uppercase tracking-wide text-gray-400">VS</div>
            {renderTeamSelect(b, `Slot ${b + 1}`)}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPlaceholderRound = (roundIndex) => {
    const prevCount = roundIndex === 0 ? firstRoundPairs.length : rounds[roundIndex - 1].matches;
    const currCount = rounds[roundIndex].matches;
    return (
      <div className="flex flex-col gap-6 min-w-[220px]">
        <RoundHeader title={rounds[roundIndex].label} count={currCount} />
        {Array.from({ length: currCount }).map((_, idx) => (
          <div
            key={idx}
            className="bg-gray-900/40 border border-dashed border-gray-700 rounded-lg p-4 text-center text-xs text-gray-400"
          >
            Match {idx + 1}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="inline-flex gap-4 md:gap-8 p-2 md:p-3">
          {renderFirstRound()}
          {rounds.slice(1).map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center">
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
              </div>
              {renderPlaceholderRound(i + 1)}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Team picker modal */}
      <TeamPickerHost
        open={pickerOpen}
        slotIndex={pickerSlotIndex}
        standings={standings}
        slots={slots}
        onPick={handlePick}
        onClose={closePicker}
        teamsPerGroup={teamsPerGroup}
      />
    </>
  );
}

function RoundHeader({ title, count }) {
  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-900/40 to-blue-900/40 rounded-lg px-4 py-2 border border-primary-800">
      <div className="flex items-center gap-2 justify-center">
        <Crown className="w-4 h-4 text-primary-600" />
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>
      <div className="text-[11px] text-gray-400 text-center mt-1">
        {count} {count === 1 ? 'partita' : 'partite'}
      </div>
    </div>
  );
}

function buildRounds(totalSlots, startingRound) {
  const seq = [];
  // number of matches in first round = totalSlots / 2
  const firstMatches = Math.max(1, totalSlots / 2);
  const mapLabel = (code) => KNOCKOUT_ROUND_NAMES[code] || 'Round';

  // Decide sequence by startingRound and total slots
  if (startingRound === KNOCKOUT_ROUND.ROUND_OF_16) {
    seq.push({
      code: KNOCKOUT_ROUND.ROUND_OF_16,
      label: mapLabel(KNOCKOUT_ROUND.ROUND_OF_16),
      matches: firstMatches,
    });
    seq.push({
      code: KNOCKOUT_ROUND.QUARTER_FINALS,
      label: mapLabel(KNOCKOUT_ROUND.QUARTER_FINALS),
      matches: Math.max(1, firstMatches / 2),
    });
    seq.push({
      code: KNOCKOUT_ROUND.SEMI_FINALS,
      label: mapLabel(KNOCKOUT_ROUND.SEMI_FINALS),
      matches: Math.max(1, firstMatches / 4),
    });
    seq.push({ code: KNOCKOUT_ROUND.FINALS, label: mapLabel(KNOCKOUT_ROUND.FINALS), matches: 1 });
  } else if (startingRound === KNOCKOUT_ROUND.QUARTER_FINALS) {
    seq.push({
      code: KNOCKOUT_ROUND.QUARTER_FINALS,
      label: mapLabel(KNOCKOUT_ROUND.QUARTER_FINALS),
      matches: firstMatches,
    });
    seq.push({
      code: KNOCKOUT_ROUND.SEMI_FINALS,
      label: mapLabel(KNOCKOUT_ROUND.SEMI_FINALS),
      matches: Math.max(1, firstMatches / 2),
    });
    seq.push({ code: KNOCKOUT_ROUND.FINALS, label: mapLabel(KNOCKOUT_ROUND.FINALS), matches: 1 });
  } else if (startingRound === KNOCKOUT_ROUND.SEMI_FINALS) {
    seq.push({
      code: KNOCKOUT_ROUND.SEMI_FINALS,
      label: mapLabel(KNOCKOUT_ROUND.SEMI_FINALS),
      matches: firstMatches,
    });
    seq.push({ code: KNOCKOUT_ROUND.FINALS, label: mapLabel(KNOCKOUT_ROUND.FINALS), matches: 1 });
  } else if (startingRound === KNOCKOUT_ROUND.FINALS) {
    seq.push({ code: KNOCKOUT_ROUND.FINALS, label: mapLabel(KNOCKOUT_ROUND.FINALS), matches: 1 });
  } else {
    seq.push({ code: startingRound, label: mapLabel(startingRound), matches: firstMatches });
  }
  return seq;
}

export default VisualBracketEditor;

function TeamPickerHost({ open, slotIndex, standings, slots, onPick, onClose, teamsPerGroup }) {
  if (!open) return null;
  const currentValue = slots[slotIndex];
  // Exclude current slot's team from the disabled set so it can be re-selected
  const ids = new Set(slots.filter((s, i) => i !== slotIndex && s && s !== 'BYE'));
  return (
    <TeamPickerModal
      isOpen={open}
      onClose={onClose}
      onSelect={(val) => onPick(val)}
      standings={standings}
      selectedTeamIds={ids}
      allowBye
      teamsPerGroup={teamsPerGroup}
    />
  );
}
