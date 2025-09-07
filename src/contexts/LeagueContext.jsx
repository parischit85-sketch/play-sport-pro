// =============================================
// FILE: src/contexts/LeagueContext.jsx
// =============================================
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { loadLeague, saveLeague, subscribeLeague } from '@services/cloud.js';
import { recompute } from '@lib/ranking.js';
import { getDefaultBookingConfig } from '@data/seed.js';

// Stato vuoto iniziale invece dei seed data
function getEmptyState() {
  return {
    players: [],
    matches: [],
    courts: [],
    bookings: [],
    bookingConfig: getDefaultBookingConfig()
  };
}
import { LS_KEY } from '@lib/ids.js';
import { useAuth } from './AuthContext.jsx';

const LeagueContext = createContext(null);

export const useLeague = () => {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
};

export function LeagueProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingFromCloud, setUpdatingFromCloud] = useState(false);
  
  const [leagueId, setLeagueId] = useState(
    localStorage.getItem(LS_KEY + '-leagueId') || 'lega-andrea-2025'
  );

  // Client ID for conflict resolution
  const clientIdRef = useRef(null);
  if (!clientIdRef.current) {
    const saved = (() => {
      try {
        return localStorage.getItem('ml-client-id');
      } catch {
        return null;
      }
    })();
    if (saved) clientIdRef.current = saved;
    else {
      const nid = Math.random().toString(36).slice(2, 10);
      clientIdRef.current = nid;
      try {
        localStorage.setItem('ml-client-id', nid);
      } catch {
        void 0;
      }
    }
  }

  const muteCloudUntilRef = useRef(0);
  const lastSavedStateRef = useRef(null);

  // Persist league ID
  useEffect(() => {
    localStorage.setItem(LS_KEY + '-leagueId', leagueId);
  }, [leagueId]);

  // Safe state setter with metadata
  const setStateSafe = (updater) => {
    setState((prev) => {
      const base = typeof updater === 'function' ? updater(prev) : updater;
      const stamp = Date.now();
      const nextRev = (prev?._rev || 0) + 1;
      muteCloudUntilRef.current = stamp + 2000; // 2s
      return { 
        ...base, 
        _updatedAt: stamp, 
        _rev: nextRev, 
        _lastWriter: clientIdRef.current 
      };
    });
  };

  // Initial load
  useEffect(() => {
    if (authLoading) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // If authenticated, try to load from cloud
        if (user) {
          const fromCloud = await loadLeague(leagueId);
          const valid =
            fromCloud &&
            typeof fromCloud === 'object' &&
            Array.isArray(fromCloud.players) &&
            Array.isArray(fromCloud.matches);
          
          if (valid) {
            const migrated = { ...fromCloud };
            if (!Array.isArray(migrated.courts)) migrated.courts = [];
            if (!Array.isArray(migrated.bookings)) migrated.bookings = [];
            if (!migrated.bookingConfig) migrated.bookingConfig = getDefaultBookingConfig();
            if (!migrated.bookingConfig.pricing)
              migrated.bookingConfig.pricing = getDefaultBookingConfig().pricing;
            if (!migrated.bookingConfig.addons)
              migrated.bookingConfig.addons = getDefaultBookingConfig().addons;
            
            setState(migrated);
            
            // Update reference
            const relevantFields = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
            lastSavedStateRef.current = relevantFields.reduce((acc, field) => {
              acc[field] = migrated[field];
              return acc;
            }, {});

            try {
              localStorage.setItem(LS_KEY, JSON.stringify(migrated));
            } catch {
              void 0;
            }
            return;
          }
        }

        // Try localStorage
        try {
          const localData = localStorage.getItem(LS_KEY);
          if (localData) {
            const parsed = JSON.parse(localData);
            if (parsed && Array.isArray(parsed.players) && Array.isArray(parsed.matches)) {
              setState(parsed);
              
              const relevantFields = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
              lastSavedStateRef.current = relevantFields.reduce((acc, field) => {
                acc[field] = parsed[field] || [];
                return acc;
              }, {});
              return;
            }
          }
        } catch {
          // Ignore localStorage errors
        }

        // Stato vuoto invece dei seed data automatici
        const initial = getEmptyState();
        setState(initial);

        const relevantFields = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
        lastSavedStateRef.current = relevantFields.reduce((acc, field) => {
          acc[field] = initial[field] || [];
          return acc;
        }, {});

        console.log('� App inizializzata con stato vuoto - aggiungi i tuoi dati!');
        
        // Salva solo in localStorage
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(initial));
        } catch {
          void 0;
        }
      } catch (err) {
        console.error('League load error:', err);
        setError(err);
        const fallback = getEmptyState();
        setState(fallback);
      } finally {
        setLoading(false);
      }
    })();
  }, [leagueId, user, authLoading]);

  // Cloud subscription
  useEffect(() => {
    if (!leagueId || !user || authLoading) return;
    
    let unsub = null;
    try {
      unsub = subscribeLeague(leagueId, (cloudState) => {
        const valid =
          cloudState &&
          typeof cloudState === 'object' &&
          Array.isArray(cloudState.players) &&
          Array.isArray(cloudState.matches);
        
        if (!valid) return;
        if (Date.now() < muteCloudUntilRef.current) return;

        const migrated = { ...cloudState };
        if (!Array.isArray(migrated.courts)) migrated.courts = [];
        if (!Array.isArray(migrated.bookings)) migrated.bookings = [];
        if (!migrated.bookingConfig) migrated.bookingConfig = getDefaultBookingConfig();
        if (!migrated.bookingConfig.pricing)
          migrated.bookingConfig.pricing = getDefaultBookingConfig().pricing;
        if (!migrated.bookingConfig.addons)
          migrated.bookingConfig.addons = getDefaultBookingConfig().addons;

        setUpdatingFromCloud(true);
        setState((prev) => {
          const localRev = prev?._rev ?? 0;
          const cloudRev = migrated?._rev ?? 0;
          const localTs = prev?._updatedAt ?? 0;
          const cloudTs = migrated?._updatedAt ?? 0;
          const cloudIsNewer = cloudRev > localRev || (cloudRev === localRev && cloudTs > localTs);

          if (cloudIsNewer) {
            const relevantFields = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
            lastSavedStateRef.current = relevantFields.reduce((acc, field) => {
              acc[field] = migrated[field];
              return acc;
            }, {});
          }

          return cloudIsNewer ? migrated : prev;
        });
        setUpdatingFromCloud(false);
      });
    } catch (e) {
      console.error('Subscribe error:', e);
    }
    return () => unsub && unsub();
  }, [leagueId, user, authLoading]);

  // Auto-save
  useEffect(() => {
    if (!state || updatingFromCloud || !user) return;

    const relevantFields = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
    const currentDataSignature = relevantFields.reduce((acc, field) => {
      acc[field] = state[field];
      return acc;
    }, {});

    const lastSavedSignature = lastSavedStateRef.current;
    const hasChanges =
      !lastSavedSignature ||
      relevantFields.some(
        (field) =>
          JSON.stringify(currentDataSignature[field]) !== JSON.stringify(lastSavedSignature[field])
      );

    if (hasChanges) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(state));

        const toSave = {
          ...state,
          _updatedAt: Date.now(),
          _lastWriter: clientIdRef.current,
          _rev: (state._rev || 0) + 1,
        };

        const t = setTimeout(async () => {
          try {
            await saveLeague(leagueId, toSave);
            lastSavedStateRef.current = currentDataSignature;
          } catch (e) {
            console.error('Cloud save error:', e);
          }
        }, 800);

        return () => clearTimeout(t);
      } catch (e) {
        console.error('LocalStorage save error:', e);
      }
    }
  }, [state, leagueId, updatingFromCloud, user]);

  // Compute derived data
  const derived = React.useMemo(
    () =>
      state ? recompute(state.players || [], state.matches || []) : { players: [], matches: [] },
    [state]
  );

  const playersById = React.useMemo(
    () => Object.fromEntries((derived.players || []).map((p) => [p.id, p])),
    [derived]
  );

  const value = {
    state,
    setState: setStateSafe,
    derived,
    playersById,
    leagueId,
    setLeagueId,
    loading,
    error,
    updatingFromCloud,
  };

  return (
    <LeagueContext.Provider value={value}>
      {children}
    </LeagueContext.Provider>
  );
}
