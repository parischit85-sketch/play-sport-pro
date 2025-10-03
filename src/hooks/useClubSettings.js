// =============================================
// FILE: src/hooks/useClubSettings.js
// Hook React per gestire le impostazioni per club (booking + lesson)
// Usa subscribeClubSettings per realtime e espone updater patch-based
// =============================================
import { useEffect, useState, useCallback } from 'react';
import {
  subscribeClubSettings,
  patchBookingConfig,
  patchLessonConfig,
  getClubSettings,
} from '@services/club-settings.js';

export function useClubSettings({ clubId, autoSubscribe = true } = {}) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(!!clubId);
  const [error, setError] = useState(null);

  // Initial fetch + subscription
  useEffect(() => {
    if (!clubId) return;
    let unsub = null;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const base = await getClubSettings(clubId);
        if (!cancelled) setSettings(base);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    if (autoSubscribe) {
      unsub = subscribeClubSettings(clubId, (s) => setSettings(s));
    }
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [clubId, autoSubscribe]);

  const updateBooking = useCallback(async (patch, meta) => {
    if (!clubId) throw new Error('clubId mancante in updateBooking');
    await patchBookingConfig(clubId, patch, meta);
  }, [clubId]);

  const updateLesson = useCallback(async (patch, meta) => {
    if (!clubId) throw new Error('clubId mancante in updateLesson');
    await patchLessonConfig(clubId, patch, meta);
  }, [clubId]);

  return {
    bookingConfig: settings?.bookingConfig || null,
    lessonConfig: settings?.lessonConfig || null,
    settings,
    loading,
    error,
    updateBookingConfig: updateBooking,
    updateLessonConfig: updateLesson,
  };
}

export default useClubSettings;
