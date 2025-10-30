/**
 * Custom hook for enhanced match creation form management
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { validateMatchForm } from '../lib/match-validation';
import analyticsModule from '../lib/analytics';

export const useMatchForm = (players = [], onSubmit) => {
  // Form state
  const [formData, setFormData] = useState({
    a1: '',
    a2: '',
    b1: '',
    b2: '',
    data: '',
    sets: [
      { a: '', b: '' },
      { a: '', b: '' },
      { a: '', b: '' },
    ],
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastValidation, setLastValidation] = useState(null);

  // Real-time validation
  const validation = useMemo(() => {
    const result = validateMatchForm(formData);
    return result;
  }, [formData]);

  // Track form progress for analytics
  useEffect(() => {
    if (lastValidation?.progress !== validation.progress) {
      analyticsModule.trackEvent('match_form_progress', { progress: validation.progress });
      setLastValidation(validation);
    }
  }, [validation.progress, lastValidation]);

  // Player management
  const getDisabledPlayerIds = useCallback(
    (currentField) => {
      const selected = new Set();
      if (formData.a1 && formData.a1 !== currentField) selected.add(formData.a1);
      if (formData.a2 && formData.a2 !== currentField) selected.add(formData.a2);
      if (formData.b1 && formData.b1 !== currentField) selected.add(formData.b1);
      if (formData.b2 && formData.b2 !== currentField) selected.add(formData.b2);
      return selected;
    },
    [formData]
  );

  // Players by ID lookup
  const playersById = useMemo(() => {
    return players.reduce((acc, player) => {
      acc[player.id] = player;
      return acc;
    }, {});
  }, [players]);

  // Form field updaters
  const updatePlayer = useCallback(
    (field, playerId) => {
      setFormData((prev) => ({
        ...prev,
        [field]: playerId,
      }));

      // Track player selection analytics
      analyticsModule.trackEvent('match_form', {
        action: 'player_selected',
        field,
        playerSelected: !!playerId,
        totalSelected: Object.values({ ...formData, [field]: playerId }).filter(Boolean).length,
      });
    },
    [formData]
  );

  const updateSet = useCallback((setIndex, team, value) => {
    const numValue = value === '' ? '' : parseInt(value, 10);

    setFormData((prev) => ({
      ...prev,
      sets: prev.sets.map((set, index) =>
        index === setIndex ? { ...set, [team]: numValue } : set
      ),
    }));

    // Track set input analytics
    analyticsModule.trackEvent('match_form', {
      action: 'set_input',
      setIndex,
      team,
      hasValue: value !== '',
    });
  }, []);

  const updateDate = useCallback((date) => {
    setFormData((prev) => ({
      ...prev,
      data: date,
    }));
  }, []);

  // Toast management
  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    setToast({ message, type, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Form submission
  const handleSubmit = useCallback(async () => {
    console.log('🚀 handleSubmit called', { canSubmit: validation.canSubmit, isSubmitting });

    if (!validation.canSubmit || isSubmitting) {
      console.log('❌ handleSubmit blocked', { canSubmit: validation.canSubmit, isSubmitting });
      return;
    }

    console.log('✅ handleSubmit proceeding with submission...');
    setIsSubmitting(true);

    try {
      // Track submission attempt
      analyticsModule.trackEvent('match_form', {
        action: 'submit_attempt',
        progress: validation.progress,
        hasWinner: validation.summary.hasWinner,
        playersSelected: validation.summary.playersSelected,
      });

      await onSubmit(formData, validation.result);

      // Track successful submission
      analyticsModule.trackEvent('match_form', {
        action: 'submit_success',
        progress: validation.progress,
        winner: validation.result?.winner,
        setsPlayed: validation.summary.setsCompleted,
      });

      showToast('Partita salvata con successo!', 'success');

      // Reset form
      setFormData({
        a1: '',
        a2: '',
        b1: '',
        b2: '',
        data: '',
        sets: [
          { a: '', b: '' },
          { a: '', b: '' },
          { a: '', b: '' },
        ],
      });
    } catch (error) {
      console.error('Error submitting match:', error);

      // Track submission error
      analyticsModule.trackEvent('match_form', {
        action: 'submit_error',
        error: error.message,
        progress: validation.progress,
      });

      showToast('Errore nel salvare la partita. Riprova.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validation, isSubmitting, onSubmit, showToast]);

  // Form reset
  const resetForm = useCallback(() => {
    setFormData({
      a1: '',
      a2: '',
      b1: '',
      b2: '',
      data: '',
      sets: [
        { a: '', b: '' },
        { a: '', b: '' },
        { a: '', b: '' },
      ],
    });
    setToast(null);

    analyticsModule.trackEvent('match_form', { action: 'reset' });
  }, []);

  // Validation helpers
  const getFieldError = useCallback(
    (field) => {
      return validation.errors[field];
    },
    [validation.errors]
  );

  const getFieldWarning = useCallback(
    (field) => {
      return validation.warnings[field];
    },
    [validation.warnings]
  );

  const hasFieldIssue = useCallback(
    (field) => {
      return !!(validation.errors[field] || validation.warnings[field]);
    },
    [validation.errors, validation.warnings]
  );

  // Auto-save draft (localStorage)
  useEffect(() => {
    const saveDraft = () => {
      if (validation.progress > 10) {
        // Only save if form has meaningful progress
        localStorage.setItem(
          'matchFormDraft',
          JSON.stringify({
            formData,
            timestamp: Date.now(),
          })
        );
      }
    };

    const timeoutId = setTimeout(saveDraft, 1000); // Debounced save
    return () => clearTimeout(timeoutId);
  }, [formData, validation.progress]);

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem('matchFormDraft');
      if (draft) {
        const parsed = JSON.parse(draft);
        const age = Date.now() - parsed.timestamp;

        // Only restore if draft is less than 1 hour old
        if (age < 60 * 60 * 1000) {
          setFormData(parsed.formData);
          showToast('Bozza ripristinata', 'info', 3000);
        } else {
          localStorage.removeItem('matchFormDraft');
        }
      }
    } catch (error) {
      console.warn('Failed to restore form draft:', error);
      localStorage.removeItem('matchFormDraft');
    }
  }, [showToast]);

  return {
    // Form state
    formData,
    validation,
    isSubmitting,
    toast,

    // Computed values
    playersById,

    // Form actions
    updatePlayer,
    updateSet,
    updateDate,
    handleSubmit,
    resetForm,

    // Player management
    getDisabledPlayerIds,

    // Validation helpers
    getFieldError,
    getFieldWarning,
    hasFieldIssue,

    // Toast management
    showToast,
    hideToast,

    // Utilities
    canSubmit: validation.canSubmit && !isSubmitting,
    progress: validation.progress,
    summary: validation.summary,
  };
};
