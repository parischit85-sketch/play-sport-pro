// =============================================
// FILE: src/hooks/useDebounce.js
// Hook per debouncing dei valori - Previene chiamate eccessive
// =============================================

import { useEffect, useState } from 'react';

/**
 * Hook per fare debounce di un valore
 * Utile per ridurre chiamate API o filtri costosi durante la digitazione
 *
 * @param {any} value - Il valore da debounciare
 * @param {number} delay - Il ritardo in millisecondi (default 300ms)
 * @returns {any} Il valore debounciato
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // Questa funzione viene chiamata solo dopo 500ms dall'ultima modifica
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Imposta un timer per aggiornare il valore debounciato
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancella il timer se value cambia prima che scada
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
