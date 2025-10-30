// =============================================
// FILE: src/hooks/useAutoSave.js
// Custom hook for auto-saving form data to localStorage
// =============================================
import { useEffect, useRef, useCallback } from 'react';

/**
 * Auto-save hook that saves data to localStorage at regular intervals
 * @param {string} key - localStorage key
 * @param {Object} data - Data to save
 * @param {number} interval - Save interval in milliseconds (default: 30000 = 30s)
 * @param {boolean} enabled - Whether auto-save is enabled (default: true)
 */
export default function useAutoSave(key, data, interval = 30000, enabled = true) {
  const timerRef = useRef(null);
  const lastSaveRef = useRef(null);

  // Save function
  const save = useCallback(() => {
    try {
      const dataToSave = {
        ...data,
        _savedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(dataToSave));
      lastSaveRef.current = new Date();
      console.log(`💾 Auto-saved draft to localStorage: ${key}`);
      return true;
    } catch (error) {
      console.error('Auto-save error:', error);
      return false;
    }
  }, [key, data]);

  // Load function
  const load = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log(`📂 Loaded draft from localStorage: ${key}`, parsed);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Auto-load error:', error);
      return null;
    }
  }, [key]);

  // Clear function
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️  Cleared draft from localStorage: ${key}`);
      return true;
    } catch (error) {
      console.error('Auto-clear error:', error);
      return false;
    }
  }, [key]);

  // Get last save time
  const getLastSaveTime = useCallback(() => {
    return lastSaveRef.current;
  }, []);

  // Setup auto-save timer
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Setup new timer
    timerRef.current = setInterval(() => {
      save();
    }, interval);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, interval, save]);

  // Save on unmount (cleanup)
  useEffect(() => {
    return () => {
      if (enabled) {
        save();
      }
    };
  }, [enabled, save]);

  return {
    save,
    load,
    clear,
    getLastSaveTime,
  };
}
