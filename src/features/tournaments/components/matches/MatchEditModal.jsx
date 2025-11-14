/**
 * @fileoverview Match Edit Modal
 * Allows editing teams, date, court, notes, and players for existing matches
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Calendar, MapPin, FileText, UserPlus, ChevronDown } from 'lucide-react';
import { themeTokens } from '../../../../lib/theme.js';
import { DS_ANIMATIONS } from '../../../../lib/design-system.js';
import { scheduleMatch, updateMatchTeams } from '../../services/matchService.js';

const T = themeTokens();

/**
 * Custom Select Component for Teams (same UX as MatchCreationModal)
 */
function CustomSelect({ value, onChange, options, placeholder, disabled }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);
  const selectedLabel = options.find((opt) => opt.id === value)?.teamName || placeholder;

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white flex items-center justify-between ${DS_ANIMATIONS.fast} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-600'}`}
      >
        <span className={`${value ? 'text-white' : 'text-gray-400'}`}>{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 ${DS_ANIMATIONS.fast} ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 ${DS_ANIMATIONS.fast} border-b border-gray-700 last:border-b-0 ${value === option.id ? 'bg-emerald-600 text-white font-medium' : `bg-gray-800 text-white hover:bg-gray-700`}`}
            >
              {option.teamName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Match Edit Modal Component
 * @param {Object} props
 * @param {Object} props.match - The match to edit
 * @param {string} props.clubId
 * @param {string} props.tournamentId
 * @param {Array} props.teams - Available teams
 * @param {Function} props.onClose
 * @param {Function} props.onSuccess
 */
function MatchEditModal({ match, clubId, tournamentId, teams, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state - initialize with match data
  const [formData, setFormData] = useState({
    team1Id: match?.team1Id || '',
    team2Id: match?.team2Id || '',
    scheduledDate: match?.scheduledDate?.toDate
      ? match.scheduledDate.toDate().toISOString().slice(0, 16)
      : '',
    courtNumber: match?.courtNumber || '',
    notes: match?.notes || '',
  });

  // Reset form when match changes
  useEffect(() => {
    if (match) {
      setFormData({
        team1Id: match.team1Id || '',
        team2Id: match.team2Id || '',
        scheduledDate: match.scheduledDate?.toDate
          ? match.scheduledDate.toDate().toISOString().slice(0, 16)
          : '',
        courtNumber: match.courtNumber || '',
        notes: match.notes || '',
      });
    }
  }, [match]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.team1Id || !formData.team2Id) {
      setError('Seleziona entrambe le squadre');
      return;
    }

    if (formData.team1Id === formData.team2Id) {
      setError('Le squadre devono essere diverse');
      return;
    }

    setLoading(true);

    try {
      // Update teams if changed
      if (formData.team1Id !== match.team1Id || formData.team2Id !== match.team2Id) {
        const teamsResult = await updateMatchTeams(clubId, tournamentId, match.id, {
          team1Id: formData.team1Id,
          team2Id: formData.team2Id,
        });

        if (!teamsResult.success) {
          setError(teamsResult.error || "Errore nell'aggiornamento delle squadre");
          setLoading(false);
          return;
        }
      }

      // Update schedule if changed
      if (
        formData.scheduledDate !==
          (match.scheduledDate?.toDate()?.toISOString().slice(0, 16) || '') ||
        formData.courtNumber !== (match.courtNumber || '')
      ) {
        const scheduleResult = await scheduleMatch(
          clubId,
          tournamentId,
          match.id,
          formData.scheduledDate ? new Date(formData.scheduledDate) : null,
          formData.courtNumber
        );

        if (!scheduleResult.success) {
          setError(scheduleResult.error || "Errore nell'aggiornamento della programmazione");
          setLoading(false);
          return;
        }
      }

      // Update notes if changed (using updateDoc directly)
      if (formData.notes !== (match.notes || '')) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../../../services/firebase.js');
        const matchRef = doc(db, 'clubs', clubId, 'tournaments', tournamentId, 'matches', match.id);
        await updateDoc(matchRef, { notes: formData.notes });
      }

      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error updating match:', err);
      setError(err.message || "Errore durante l'aggiornamento della partita");
      setLoading(false);
    }
  };

  if (!match) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70">
      <div
        className={`${T.modalBackground} ${T.border} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 ${T.headerBg} border-b ${T.border} px-6 py-4 flex items-center justify-between backdrop-blur-sm`}
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Modifica Partita
          </h2>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-gray-700/50 rounded-lg ${DS_ANIMATIONS.fast} hover:ring-2 ring-gray-600`}
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-rose-900/20 border border-rose-800 rounded-lg">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          {/* Teams Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="match-edit-team1"
                className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"
              >
                <Users className="w-4 h-4 text-blue-400" />
                Squadra 1
              </label>
              <CustomSelect
                id="match-edit-team1"
                value={formData.team1Id}
                onChange={(val) => handleChange('team1Id', val)}
                options={teams}
                placeholder="Seleziona squadra..."
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="match-edit-team2"
                className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"
              >
                <Users className="w-4 h-4 text-blue-400" />
                Squadra 2
              </label>
              <CustomSelect
                id="match-edit-team2"
                value={formData.team2Id}
                onChange={(val) => handleChange('team2Id', val)}
                options={teams.filter((team) => team.id !== formData.team1Id)}
                placeholder="Seleziona squadra..."
                disabled={loading || !formData.team1Id}
              />
            </div>
          </div>

          {/* Schedule Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="match-edit-schedule"
                className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                Data e Ora
              </label>
              <input
                id="match-edit-schedule"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                className={`${T.input} w-full`}
                disabled={loading}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div>
              <label
                htmlFor="match-edit-court"
                className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"
              >
                <MapPin className="w-4 h-4 text-blue-400" />
                Campo
              </label>
              <input
                id="match-edit-court"
                type="text"
                value={formData.courtNumber}
                onChange={(e) => handleChange('courtNumber', e.target.value)}
                placeholder="Es. Campo 1"
                className={`${T.input} w-full`}
                disabled={loading}
              />
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label
              htmlFor="match-edit-notes"
              className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              Note
            </label>
            <textarea
              id="match-edit-notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Aggiungi note sulla partita..."
              rows={3}
              className={`${T.input} w-full resize-none`}
              disabled={loading}
            />
          </div>

          {/* Players Section - Info Only (actual editing would require more complex logic) */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <UserPlus className="w-4 h-4 text-blue-400" />
              Giocatori
            </div>
            <div className="p-4 bg-blue-900/10 border border-blue-800/30 rounded-lg">
              <p className="text-sm text-gray-400">
                I giocatori vengono gestiti automaticamente in base alle squadre selezionate. Per
                modificare la composizione delle squadre, usa il pulsante &quot;Modifica&quot; nella
                lista squadre.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`${T.btnGhost} flex-1`}
              disabled={loading}
            >
              Annulla
            </button>
            <button type="submit" className={`${T.btnPrimary} flex-1`} disabled={loading}>
              {loading ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default MatchEditModal;
