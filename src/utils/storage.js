// FILE: src/utils/storage.js
// Namespacing localStorage chiavi multi-club + migrazione semplice

const GLOBAL_PREFIX = 'psp:v1';

function buildKey(key, clubId) {
  if (!clubId) return `${GLOBAL_PREFIX}:${key}`; // chiavi globali
  return `${GLOBAL_PREFIX}:${clubId}:${key}`;
}

export function lsGet(key, { clubId, parse = true } = {}) {
  try {
    const raw = localStorage.getItem(buildKey(key, clubId));
    if (!raw) return null;
    
    // Se non dobbiamo fare parsing, restituisci raw
    if (!parse) return raw;
    
    // Se sembra JSON (inizia con { o [), prova il parsing
    if (raw.startsWith('{') || raw.startsWith('[') || raw === 'null' || raw === 'true' || raw === 'false') {
      return JSON.parse(raw);
    }
    
    // Se è un numero, convertilo
    if (!isNaN(raw) && !isNaN(parseFloat(raw))) {
      return parseFloat(raw);
    }
    
    // Altrimenti restituisci la stringa così com'è
    return raw;
  } catch (e) {
    console.warn('lsGet error', key, e); 
    // In caso di errore, restituisci la stringa raw senza parsing
    const raw = localStorage.getItem(buildKey(key, clubId));
    return raw || null;
  }
}

export function lsSet(key, value, { clubId } = {}) {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(buildKey(key, clubId), serialized);
  } catch (e) {
    console.warn('lsSet error', key, e);
  }
}

export function lsRemove(key, { clubId } = {}) {
  try { localStorage.removeItem(buildKey(key, clubId)); } catch (_) {}
}

// Migrazione basica di chiavi legacy -> namespaced (una sola volta)
const MIGRATION_FLAG = `${GLOBAL_PREFIX}:storage-migrated`;

export function runLocalStorageMigration(currentClubId) {
  try {
    if (localStorage.getItem(MIGRATION_FLAG)) return;
    // Esempio: migrare chiavi known senza club a globali
    const legacyKeys = [
      'selectedClubId',
      'paris-league-v1',
      'padel-bookings',
      'unified-bookings',
      'lessonBookings',
      'lesson-bookings'
    ];
    legacyKeys.forEach(k => {
      const v = localStorage.getItem(k);
      if (v != null) {
        // Manteniamo valore come global se non ha club esplicito.
        localStorage.setItem(buildKey(k, null), v);
      }
    });
    localStorage.setItem(MIGRATION_FLAG, '1');
  } catch (e) {
    console.warn('LocalStorage migration error', e);
  }
}

export default { lsGet, lsSet, lsRemove, runLocalStorageMigration };