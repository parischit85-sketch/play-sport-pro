// =============================================
// FILE: src/utils/court-validation.js
// Utility di validazione per campi e fasce orarie
// Sprint 1 - CHK-002, CHK-003, CHK-004
// =============================================

/**
 * Valida un oggetto court
 * @param {Object} court - Oggetto court da validare
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateCourt(court) {
  const errors = [];

  // Validazione nome campo
  if (!court.name || typeof court.name !== 'string') {
    errors.push('Nome campo è obbligatorio');
  } else if (court.name.trim().length < 2) {
    errors.push('Nome campo deve essere almeno 2 caratteri');
  } else if (court.name.trim().length > 100) {
    errors.push('Nome campo troppo lungo (max 100 caratteri)');
  }

  // Validazione courtType
  const validTypes = ['Indoor', 'Outdoor', 'Covered'];
  if (!court.courtType || !validTypes.includes(court.courtType)) {
    errors.push(`Tipologia campo deve essere una tra: ${validTypes.join(', ')}`);
  }

  // Validazione maxPlayers
  if (court.maxPlayers === undefined || court.maxPlayers === null) {
    errors.push('Numero massimo giocatori è obbligatorio');
  } else if (!Number.isInteger(court.maxPlayers) || court.maxPlayers < 1 || court.maxPlayers > 22) {
    errors.push('Numero massimo giocatori deve essere tra 1 e 22');
  }

  // Validazione hasHeating
  if (typeof court.hasHeating !== 'boolean') {
    errors.push('hasHeating deve essere un boolean');
  }

  // Validazione timeSlots
  if (!court.timeSlots) {
    errors.push('timeSlots è obbligatorio (può essere array vuoto)');
  } else if (!Array.isArray(court.timeSlots)) {
    errors.push('timeSlots deve essere un array');
  } else {
    // Valida ogni time slot
    court.timeSlots.forEach((slot, index) => {
      const slotErrors = validateTimeSlot(slot);
      if (!slotErrors.valid) {
        errors.push(`Fascia ${index + 1}: ${slotErrors.errors.join(', ')}`);
      }
    });

    // Rileva sovrapposizioni
    const overlaps = detectTimeSlotOverlaps(court.timeSlots);
    if (overlaps.length > 0) {
      overlaps.forEach(({ slot1Index, slot2Index, days }) => {
        errors.push(
          `Sovrapposizione rilevata tra "${court.timeSlots[slot1Index]?.label}" e "${court.timeSlots[slot2Index]?.label}" nei giorni: ${days.join(', ')}`
        );
      });
    }
  }

  // Validazione order
  if (court.order !== undefined && (!Number.isInteger(court.order) || court.order < 1)) {
    errors.push('order deve essere un numero intero >= 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida una singola fascia oraria
 * @param {Object} slot - Fascia oraria da validare
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateTimeSlot(slot) {
  const errors = [];

  // Validazione label
  if (!slot.label || typeof slot.label !== 'string') {
    errors.push('Nome fascia è obbligatorio');
  } else if (slot.label.trim().length < 2) {
    errors.push('Nome fascia deve essere almeno 2 caratteri');
  } else if (slot.label.trim().length > 50) {
    errors.push('Nome fascia troppo lungo (max 50 caratteri)');
  }

  // Validazione orari
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  
  if (!slot.from || !timeRegex.test(slot.from)) {
    errors.push('Orario inizio non valido (formato HH:mm)');
  }
  
  if (!slot.to || !timeRegex.test(slot.to)) {
    errors.push('Orario fine non valido (formato HH:mm)');
  }

  // Verifica che from < to
  if (slot.from && slot.to && slot.from >= slot.to) {
    errors.push('Orario fine deve essere dopo orario inizio');
  }

  // Validazione prezzo
  if (slot.eurPerHour === undefined || slot.eurPerHour === null) {
    errors.push('Prezzo orario è obbligatorio');
  } else if (typeof slot.eurPerHour !== 'number' || slot.eurPerHour < 0) {
    errors.push('Prezzo orario deve essere >= 0');
  } else if (slot.eurPerHour > 1000) {
    errors.push('Prezzo orario troppo alto (max €1000)');
  }

  // Validazione giorni
  if (!slot.days || !Array.isArray(slot.days)) {
    errors.push('Giorni della settimana sono obbligatori (array)');
  } else {
    const invalidDays = slot.days.filter((day) => !Number.isInteger(day) || day < 0 || day > 6);
    if (invalidDays.length > 0) {
      errors.push('Giorni non validi (devono essere 0-6 per Dom-Sab)');
    }
    if (slot.days.length === 0) {
      errors.push('Almeno un giorno deve essere selezionato');
    }
  }

  // Validazione isPromo
  if (slot.isPromo !== undefined && typeof slot.isPromo !== 'boolean') {
    errors.push('isPromo deve essere un boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Rileva sovrapposizioni tra fasce orarie
 * Due fasce si sovrappongono se:
 * 1. Hanno almeno un giorno in comune
 * 2. Gli orari si sovrappongono
 * 
 * @param {Array} timeSlots - Array di fasce orarie
 * @returns {Array} Array di oggetti { slot1Index, slot2Index, days } con le sovrapposizioni
 */
export function detectTimeSlotOverlaps(timeSlots) {
  if (!Array.isArray(timeSlots) || timeSlots.length < 2) {
    return [];
  }

  const overlaps = [];

  for (let i = 0; i < timeSlots.length; i++) {
    for (let j = i + 1; j < timeSlots.length; j++) {
      const slot1 = timeSlots[i];
      const slot2 = timeSlots[j];

      // Trova giorni in comune
      const commonDays = (slot1.days || []).filter((day) => (slot2.days || []).includes(day));

      if (commonDays.length === 0) {
        continue; // Nessun giorno in comune, non c'è sovrapposizione
      }

      // Verifica sovrapposizione oraria
      const hasTimeOverlap = checkTimeOverlap(slot1.from, slot1.to, slot2.from, slot2.to);

      if (hasTimeOverlap) {
        overlaps.push({
          slot1Index: i,
          slot2Index: j,
          days: commonDays.map((day) => getDayName(day)),
          timeOverlap: {
            slot1: `${slot1.from}-${slot1.to}`,
            slot2: `${slot2.from}-${slot2.to}`,
          },
        });
      }
    }
  }

  return overlaps;
}

/**
 * Verifica se due intervalli orari si sovrappongono
 * @param {string} start1 - Inizio primo intervallo (HH:mm)
 * @param {string} end1 - Fine primo intervallo (HH:mm)
 * @param {string} start2 - Inizio secondo intervallo (HH:mm)
 * @param {string} end2 - Fine secondo intervallo (HH:mm)
 * @returns {boolean} true se c'è sovrapposizione
 */
function checkTimeOverlap(start1, end1, start2, end2) {
  // Converte HH:mm in minuti dalla mezzanotte per confronto più facile
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  // Due intervalli si sovrappongono se:
  // start1 < end2 AND start2 < end1
  return s1 < e2 && s2 < e1;
}

/**
 * Ottiene il nome del giorno dalla settimana
 * @param {number} dayIndex - Indice giorno (0=Dom, 6=Sab)
 * @returns {string} Nome giorno
 */
function getDayName(dayIndex) {
  const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  return days[dayIndex] || 'Giorno sconosciuto';
}

/**
 * Sanitizza un oggetto court prima del salvataggio
 * Rimuove campi non validi, normalizza valori
 * @param {Object} court - Court da sanitizzare
 * @returns {Object} Court sanitizzato
 */
export function sanitizeCourt(court) {
  const sanitized = {
    id: court.id,
    name: (court.name || '').trim(),
    courtType: court.courtType || 'Indoor',
    maxPlayers: Math.max(1, Math.min(22, parseInt(court.maxPlayers) || 4)),
    hasHeating: Boolean(court.hasHeating),
    order: parseInt(court.order) || 1,
    timeSlots: Array.isArray(court.timeSlots)
      ? court.timeSlots.map(sanitizeTimeSlot).filter(Boolean)
      : [],
  };

  return sanitized;
}

/**
 * Sanitizza una fascia oraria
 * @param {Object} slot - Fascia da sanitizzare
 * @returns {Object|null} Fascia sanitizzata o null se non valida
 */
export function sanitizeTimeSlot(slot) {
  if (!slot || typeof slot !== 'object') {
    return null;
  }

  // Verifica campi obbligatori minimi
  if (!slot.from || !slot.to || !slot.label) {
    return null;
  }

  const sanitized = {
    id: slot.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    label: (slot.label || '').trim(),
    from: slot.from,
    to: slot.to,
    eurPerHour: Math.max(0, Math.min(1000, parseFloat(slot.eurPerHour) || 0)),
    days: Array.isArray(slot.days)
      ? slot.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
      : [],
    isPromo: Boolean(slot.isPromo),
  };

  // Verifica che ci sia almeno un giorno
  if (sanitized.days.length === 0) {
    return null;
  }

  return sanitized;
}

/**
 * Valida un array di courts e ritorna solo quelli validi
 * @param {Array} courts - Array di courts
 * @param {Object} options - Opzioni { throwOnError: boolean, autoSanitize: boolean }
 * @returns {Object} { valid: Court[], invalid: Court[], errors: Object[] }
 */
export function validateCourts(courts, options = {}) {
  const { throwOnError = false, autoSanitize = false } = options;

  if (!Array.isArray(courts)) {
    const error = new Error('courts deve essere un array');
    if (throwOnError) throw error;
    return { valid: [], invalid: [], errors: [{ error: error.message }] };
  }

  const valid = [];
  const invalid = [];
  const errors = [];

  courts.forEach((court, index) => {
    const validation = validateCourt(court);

    if (validation.valid) {
      valid.push(autoSanitize ? sanitizeCourt(court) : court);
    } else {
      invalid.push(court);
      errors.push({
        index,
        courtName: court.name || 'Senza nome',
        errors: validation.errors,
      });
    }
  });

  if (throwOnError && invalid.length > 0) {
    throw new Error(
      `Trovati ${invalid.length} campi non validi:\n${errors.map((e) => `- ${e.courtName}: ${e.errors.join(', ')}`).join('\n')}`
    );
  }

  return { valid, invalid, errors };
}

/**
 * Helper per log errori in development
 * @param {string} context - Contesto dell'errore
 * @param {Array} errors - Array di errori
 */
export function logValidationErrors(context, errors) {
  if (process.env.NODE_ENV === 'development' && errors.length > 0) {
    console.group(`🚨 Errori di validazione in ${context}`);
    errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error}`);
    });
    console.groupEnd();
  }
}

/**
 * Wrapper per validare e mostrare errori in UI
 * @param {Object} court - Court da validare
 * @param {Function} onError - Callback per mostrare errori
 * @returns {boolean} true se valido
 */
export function validateCourtWithUI(court, onError) {
  const validation = validateCourt(court);

  if (!validation.valid) {
    logValidationErrors(`Campo "${court.name}"`, validation.errors);
    
    if (typeof onError === 'function') {
      onError(validation.errors);
    }
    
    return false;
  }

  return true;
}
