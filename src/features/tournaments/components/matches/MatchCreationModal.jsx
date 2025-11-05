import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, FileText, Users, ChevronDown } from 'lucide-react';
import { themeTokens } from '../../../../lib/theme';
import { DS_ANIMATIONS } from '../../../../lib/design-system';

function CustomSelect({ value, onChange, options, placeholder, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedLabel = options.find((opt) => opt.id === value)?.teamName || placeholder;

  console.log('🔍 CustomSelect Debug:', {
    value,
    options: options?.length || 0,
    optionsData: options,
    placeholder,
    disabled,
    selectedLabel
  });

  useEffect(() => {
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
        <ChevronDown className={`w-4 h-4 text-gray-400 ${DS_ANIMATIONS.fast} ${isOpen ? 'rotate-180' : ''}`} />
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

function MatchCreationModal({ tournament, clubId, teams, onClose, onSuccess }) {
  const T = themeTokens();
  const [formData, setFormData] = useState({
    team1Id: '',
    team2Id: '',
    scheduledDate: '',
    courtNumber: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('🎯 MatchCreationModal Debug:', {
    tournament: tournament?.id,
    clubId,
    teamsCount: teams?.length || 0,
    teams: teams,
    formData
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.team1Id || !formData.team2Id) {
      setError('Seleziona entrambe le squadre');
      return;
    }

    if (formData.team1Id === formData.team2Id) {
      setError('Le squadre devono essere diverse');
      return;
    }

    setLoading(true);

    console.log('🚀 MatchCreationModal Submit Debug:', {
      formData,
      tournamentId: tournament?.id,
      clubId,
      teamsCount: teams?.length,
      validation: {
        team1Selected: !!formData.team1Id,
        team2Selected: !!formData.team2Id,
        teamsDifferent: formData.team1Id !== formData.team2Id,
        dateSelected: !!formData.scheduledDate
      }
    });

    try {
      const { createMatch } = await import('../../services/matchService');

      const matchData = {
        type: 'standalone',
        team1Id: formData.team1Id,
        team2Id: formData.team2Id,
        scheduledDate: formData.scheduledDate || null,
        courtNumber: formData.courtNumber || null,
        notes: formData.notes || null,
        status: 'scheduled',
      };

      const result = await createMatch(clubId, tournament.id, matchData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Errore nella creazione della partita');
      }
    } catch (err) {
      console.error('Error creating match:', err);
      setError('Errore nella creazione della partita');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70">
      <div className={`${T.cardBg} rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700`}>
        <div className={`sticky top-0 ${T.cardBg} border-b border-gray-700 px-6 py-4 flex items-center justify-between`}>
          <h2 className={`text-xl font-bold text-white`}>Crea Partita</h2>
          <button onClick={onClose} className={`p-2 hover:bg-gray-700 rounded-lg ${DS_ANIMATIONS.fast}`} disabled={loading}>
            <X className={`w-5 h-5 text-gray-400`} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={`p-6 space-y-6 ${T.cardBg}`}>
          {error && (
            <div className="p-4 bg-rose-900/20 border border-rose-800 rounded-lg">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium text-gray-300 mb-2`}>
              <Users className={`w-4 h-4 text-gray-300`} />
              Squadra 1
            </label>
            <CustomSelect value={formData.team1Id} onChange={(val) => handleChange('team1Id', val)} options={teams} placeholder="Seleziona squadra..." disabled={loading} />
          </div>
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium text-gray-300 mb-2`}>
              <Users className={`w-4 h-4 text-gray-300`} />
              Squadra 2
            </label>
            <CustomSelect value={formData.team2Id} onChange={(val) => handleChange('team2Id', val)} options={teams.filter((team) => team.id !== formData.team1Id)} placeholder="Seleziona squadra..." disabled={loading || !formData.team1Id} />
          </div>
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium text-gray-300 mb-2`}>
              <Calendar className={`w-4 h-4 text-gray-300`} />
              Data e Ora (opzionale)
            </label>
            <input type="datetime-local" value={formData.scheduledDate} onChange={(e) => handleChange('scheduledDate', e.target.value)} className={`w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${DS_ANIMATIONS.fast}`} disabled={loading} style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium text-gray-300 mb-2`}>
              <MapPin className={`w-4 h-4 text-gray-300`} />
              Campo (opzionale)
            </label>
            <input type="text" value={formData.courtNumber} onChange={(e) => handleChange('courtNumber', e.target.value)} placeholder="Es. Campo 1" className={`w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${DS_ANIMATIONS.fast}`} disabled={loading} />
          </div>
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium text-gray-300 mb-2`}>
              <FileText className={`w-4 h-4 text-gray-300`} />
              Note (opzionale)
            </label>
            <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Aggiungi note sulla partita..." rows={3} className={`w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${DS_ANIMATIONS.fast} resize-none`} disabled={loading} />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className={`flex-1 px-4 py-2 border border-gray-600 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 ${DS_ANIMATIONS.fast}`} disabled={loading}>
              Annulla
            </button>
            <button type="submit" className={`flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg ${DS_ANIMATIONS.fast} disabled:opacity-50 disabled:cursor-not-allowed font-medium`} disabled={loading}>
              {loading ? 'Creazione...' : 'Crea Partita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default MatchCreationModal;
