/**
 * Enhanced form validation and UX utilities for Match Creation
 */

import { computeFromSets } from '@lib/rpa.js';

// Validation states
export const VALIDATION_STATES = {
  PRISTINE: 'pristine',
  VALID: 'valid',
  INVALID: 'invalid',
  LOADING: 'loading',
};

// Field validation rules
export const FIELD_VALIDATIONS = {
  PLAYER_REQUIRED: 'player_required',
  PLAYER_DUPLICATE: 'player_duplicate',
  SET_INCOMPLETE: 'set_incomplete',
  SET_INVALID: 'set_invalid',
  RESULT_INCOMPLETE: 'result_incomplete',
  DATE_INVALID: 'date_invalid',
};

/**
 * Validate player selection
 */
export const validatePlayers = (a1, a2, b1, b2) => {
  const errors = {};
  const warnings = {};

  // Check required players
  if (!a1)
    errors.a1 = { type: FIELD_VALIDATIONS.PLAYER_REQUIRED, message: 'Seleziona giocatore A1' };
  if (!a2)
    errors.a2 = { type: FIELD_VALIDATIONS.PLAYER_REQUIRED, message: 'Seleziona giocatore A2' };
  if (!b1)
    errors.b1 = { type: FIELD_VALIDATIONS.PLAYER_REQUIRED, message: 'Seleziona giocatore B1' };
  if (!b2)
    errors.b2 = { type: FIELD_VALIDATIONS.PLAYER_REQUIRED, message: 'Seleziona giocatore B2' };

  // Check for duplicates
  const selected = [a1, a2, b1, b2].filter(Boolean);
  const uniqueSelected = new Set(selected);

  if (selected.length !== uniqueSelected.size) {
    const duplicateMessage = 'Ogni giocatore può essere selezionato solo una volta';
    if (a1 && (a1 === a2 || a1 === b1 || a1 === b2)) {
      errors.a1 = { type: FIELD_VALIDATIONS.PLAYER_DUPLICATE, message: duplicateMessage };
    }
    if (a2 && (a2 === b1 || a2 === b2)) {
      errors.a2 = { type: FIELD_VALIDATIONS.PLAYER_DUPLICATE, message: duplicateMessage };
    }
    if (b1 && b1 === b2) {
      errors.b1 = { type: FIELD_VALIDATIONS.PLAYER_DUPLICATE, message: duplicateMessage };
    }
  }

  return { errors, warnings, isValid: Object.keys(errors).length === 0 };
};

/**
 * Validate sets input
 */
export const validateSets = (sets) => {
  const errors = {};
  const warnings = {};

  // Check each set
  sets.forEach((set, index) => {
    const { a, b } = set;
    const aVal = parseInt(a) || 0;
    const bVal = parseInt(b) || 0;

    // Both values should be provided if one is provided
    if ((a !== '' && b === '') || (a === '' && b !== '')) {
      errors[`set${index}`] = {
        type: FIELD_VALIDATIONS.SET_INCOMPLETE,
        message: `Completa il set ${index + 1}`,
      };
    }

    // Check realistic values
    if (aVal > 0 || bVal > 0) {
      if (aVal > 7 || bVal > 7) {
        warnings[`set${index}`] = {
          type: FIELD_VALIDATIONS.SET_INVALID,
          message: `Set ${index + 1}: valori molto alti (>7)`,
        };
      }

      // Check for invalid results (both 0)
      if (aVal === 0 && bVal === 0) {
        errors[`set${index}`] = {
          type: FIELD_VALIDATIONS.SET_INVALID,
          message: `Set ${index + 1}: inserisci almeno un punto`,
        };
      }
    }
  });

  // Check overall result
  const rr = computeFromSets(sets);
  const filledSets = sets.filter((s) => s.a !== '' && s.b !== '');

  if (filledSets.length > 0 && !rr.winner) {
    errors.result = {
      type: FIELD_VALIDATIONS.RESULT_INCOMPLETE,
      message: 'Risultato non valido: una partita non può finire in parità',
    };
  }

  if (filledSets.length < 2 && rr.winner) {
    warnings.result = {
      type: FIELD_VALIDATIONS.SET_INCOMPLETE,
      message: 'Considera di aggiungere più set per una partita completa',
    };
  }

  return {
    errors,
    warnings,
    isValid: Object.keys(errors).length === 0,
    result: rr,
  };
};

/**
 * Validate date input
 */
export const validateDate = (dateString) => {
  const errors = {};
  const warnings = {};

  if (!dateString) {
    errors.date = {
      type: FIELD_VALIDATIONS.DATE_INVALID,
      message: 'Seleziona data e ora',
    };
    return { errors, warnings, isValid: false };
  }

  const date = new Date(dateString);
  const now = new Date();

  // Check if date is valid
  if (isNaN(date.getTime())) {
    errors.date = {
      type: FIELD_VALIDATIONS.DATE_INVALID,
      message: 'Data non valida',
    };
    return { errors, warnings, isValid: false };
  }

  // Check if date is in the future (warning)
  if (date > now) {
    warnings.date = {
      type: FIELD_VALIDATIONS.DATE_INVALID,
      message: 'Data nel futuro: sicuro che la partita è già stata giocata?',
    };
  }

  // Check if date is too old (warning)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (date < thirtyDaysAgo) {
    warnings.date = {
      type: FIELD_VALIDATIONS.DATE_INVALID,
      message: 'Data più vecchia di 30 giorni',
    };
  }

  return { errors, warnings, isValid: Object.keys(errors).length === 0 };
};

/**
 * Complete form validation
 */
export const validateMatchForm = (formData) => {
  const { a1, a2, b1, b2, sets } = formData;

  const playerValidation = validatePlayers(a1, a2, b1, b2);
  const setsValidation = validateSets(sets);
  // Date validation removed - default date is acceptable

  const allErrors = {
    ...playerValidation.errors,
    ...setsValidation.errors,
  };

  const allWarnings = {
    ...playerValidation.warnings,
    ...setsValidation.warnings,
  };

  const isFormValid = Object.keys(allErrors).length === 0;
  const canSubmit = isFormValid && setsValidation.result?.winner;

  return {
    errors: allErrors,
    warnings: allWarnings,
    isValid: isFormValid,
    canSubmit,
    result: setsValidation.result,
    summary: {
      playersSelected: [a1, a2, b1, b2].filter(Boolean).length,
      setsCompleted: sets.filter((s) => s.a !== '' && s.b !== '').length,
      hasWinner: !!setsValidation.result?.winner,
    },
  };
};

/**
 * Get field validation state for styling
 */
export const getFieldState = (fieldName, validation) => {
  if (validation.errors[fieldName]) {
    return VALIDATION_STATES.INVALID;
  }

  // Check if field has value and is valid
  const hasWarning = validation.warnings[fieldName];
  if (hasWarning) {
    return VALIDATION_STATES.VALID; // Still valid but with warning
  }

  return VALIDATION_STATES.PRISTINE;
};

/**
 * Get progress percentage for form completion
 */
export const getFormProgress = (validation) => {
  const { summary } = validation;
  let progress = 0;

  // Players: 40% (10% each)
  progress += (summary.playersSelected / 4) * 40;

  // Sets: 40% (need at least 2 sets for valid match)
  progress += Math.min(summary.setsCompleted / 2, 1) * 40;

  // Valid result: 20%
  if (summary.hasWinner) {
    progress += 20;
  }

  return Math.round(progress);
};

/**
 * Get user-friendly progress message
 */
export const getProgressMessage = (validation) => {
  const { summary, canSubmit } = validation;

  if (canSubmit) {
    return { type: 'success', message: '✅ Partita pronta per il salvataggio!' };
  }

  if (summary.playersSelected < 4) {
    return {
      type: 'info',
      message: `👥 Seleziona ${4 - summary.playersSelected} giocatori rimanenti`,
    };
  }

  if (summary.setsCompleted < 2) {
    return {
      type: 'info',
      message: '🎾 Inserisci i risultati dei set',
    };
  }

  if (!summary.hasWinner) {
    return {
      type: 'warning',
      message: '🏆 Il risultato non determina un vincitore',
    };
  }

  return { type: 'info', message: '📝 Completa tutti i campi' };
};

export default {
  validatePlayers,
  validateSets,
  validateDate,
  validateMatchForm,
  getFieldState,
  getFormProgress,
  getProgressMessage,
  VALIDATION_STATES,
  FIELD_VALIDATIONS,
};
