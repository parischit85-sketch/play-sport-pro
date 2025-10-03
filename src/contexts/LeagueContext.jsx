// =============================================
// FILE: src/contexts/LeagueContext.jsx
// =============================================
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { loadLeague, saveLeague, subscribeLeague } from "@services/cloud.js";
import { recompute } from "@lib/ranking.js";
import { getDefaultBookingConfig } from "@data/seed.js";

// Stato vuoto iniziale invece dei seed data
function getEmptyState() {
  return {
    players: [],
    matches: [],
    courts: [],
    bookings: [],
    bookingConfig: getDefaultBookingConfig(),
  };
}
import { LS_KEY } from "@lib/ids.js";
import { useAuth } from "./AuthContext.jsx";

const LeagueContext = createContext(null);

export const useLeague = () => {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error("useLeague must be used within a LeagueProvider");
  }
  return context;
};

export function LeagueProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingFromCloud, setUpdatingFromCloud] = useState(false);

  // Club selection state
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedClubLoading, setSelectedClubLoading] = useState(false);

  const [leagueId, setLeagueId] = useState(
    localStorage.getItem(LS_KEY + "-leagueId") || "lega-andrea-2025",
  );

  // Client ID for conflict resolution
  const clientIdRef = useRef(null);
  if (!clientIdRef.current) {
    const saved = (() => {
      try {
        return localStorage.getItem("ml-client-id");
      } catch {
        return null;
      }
    })();
    if (saved) clientIdRef.current = saved;
    else {
      const nid = Math.random().toString(36).slice(2, 10);
      clientIdRef.current = nid;
      try {
        localStorage.setItem("ml-client-id", nid);
      } catch {
        void 0;
      }
    }
  }

  const muteCloudUntilRef = useRef(0);
  const lastSavedStateRef = useRef(null);

  // Persist league ID
  useEffect(() => {
    localStorage.setItem(LS_KEY + "-leagueId", leagueId);
  }, [leagueId]);

  // Safe state setter with metadata
  const setStateSafe = (updater) => {
    setState((prev) => {
      const base = typeof updater === "function" ? updater(prev) : updater;
      const stamp = Date.now();
      const nextRev = (prev?._rev || 0) + 1;
      muteCloudUntilRef.current = stamp + 2000; // 2s
      return {
        ...base,
        _updatedAt: stamp,
        _rev: nextRev,
        _lastWriter: clientIdRef.current,
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
            typeof fromCloud === "object" &&
            Array.isArray(fromCloud.players) &&
            Array.isArray(fromCloud.matches);

          if (valid) {
            const migrated = { ...fromCloud };
            if (!Array.isArray(migrated.courts)) migrated.courts = [];
            if (!Array.isArray(migrated.bookings)) migrated.bookings = [];
            if (!migrated.bookingConfig)
              migrated.bookingConfig = getDefaultBookingConfig();
            if (!migrated.bookingConfig.pricing)
              migrated.bookingConfig.pricing =
                getDefaultBookingConfig().pricing;
            if (!migrated.bookingConfig.addons)
              migrated.bookingConfig.addons = getDefaultBookingConfig().addons;

            setState(migrated);

            // Update reference
            const relevantFields = [
              "players",
              "matches",
              "courts",
              "bookings",
              "bookingConfig",
            ];
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
            if (
              parsed &&
              Array.isArray(parsed.players) &&
              Array.isArray(parsed.matches)
            ) {
              setState(parsed);

              const relevantFields = [
                "players",
                "matches",
                "courts",
                "bookings",
                "bookingConfig",
              ];
              lastSavedStateRef.current = relevantFields.reduce(
                (acc, field) => {
                  acc[field] = parsed[field] || [];
                  return acc;
                },
                {},
              );
              return;
            }
          }
        } catch {
          // Ignore localStorage errors
        }

        // Stato vuoto invece dei seed data automatici
        const initial = getEmptyState();
        setState(initial);

        const relevantFields = [
          "players",
          "matches",
          "courts",
          "bookings",
          "bookingConfig",
        ];
        lastSavedStateRef.current = relevantFields.reduce((acc, field) => {
          acc[field] = initial[field] || [];
          return acc;
        }, {});

        console.log(
          "� App inizializzata con stato vuoto - aggiungi i tuoi dati!",
        );

        // Salva solo in localStorage
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(initial));
        } catch {
          void 0;
        }
      } catch (err) {
        console.error("League load error:", err);
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
          typeof cloudState === "object" &&
          Array.isArray(cloudState.players) &&
          Array.isArray(cloudState.matches);

        if (!valid) return;
        if (Date.now() < muteCloudUntilRef.current) return;

        const migrated = { ...cloudState };
        if (!Array.isArray(migrated.courts)) migrated.courts = [];
        if (!Array.isArray(migrated.bookings)) migrated.bookings = [];
        if (!migrated.bookingConfig)
          migrated.bookingConfig = getDefaultBookingConfig();
        if (!migrated.bookingConfig.pricing)
          migrated.bookingConfig.pricing = getDefaultBookingConfig().pricing;
        if (!migrated.bookingConfig.addons)
          migrated.bookingConfig.addons = getDefaultBookingConfig().addons;
        if (!migrated.lessonConfig) migrated.lessonConfig = {};

        setUpdatingFromCloud(true);
        setState((prev) => {
          const localRev = prev?._rev ?? 0;
          const cloudRev = migrated?._rev ?? 0;
          const localTs = prev?._updatedAt ?? 0;
          const cloudTs = migrated?._updatedAt ?? 0;
          const cloudIsNewer =
            cloudRev > localRev || (cloudRev === localRev && cloudTs > localTs);

          if (cloudIsNewer) {
            const relevantFields = [
              "players",
              "matches",
              "courts",
              "bookings",
              "bookingConfig",
              "lessonConfig",
            ];
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
      console.error("Subscribe error:", e);
    }
    return () => unsub && unsub();
  }, [leagueId, user, authLoading]);

  // Auto-save
  useEffect(() => {
    if (!state || updatingFromCloud || !user) return;

    const relevantFields = [
      "players",
      "matches",
      "courts",
      "bookings",
      "bookingConfig",
      "lessonConfig",
    ];
    const currentDataSignature = relevantFields.reduce((acc, field) => {
      acc[field] = state[field];
      return acc;
    }, {});

    const lastSavedSignature = lastSavedStateRef.current;
    const hasChanges =
      !lastSavedSignature ||
      relevantFields.some(
        (field) =>
          JSON.stringify(currentDataSignature[field]) !==
          JSON.stringify(lastSavedSignature[field]),
      );

    if (hasChanges) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(state));

        // Clean undefined values to prevent Firebase errors
        const cleanState = Object.fromEntries(
          Object.entries(state).filter(([key, value]) => value !== undefined),
        );

        const toSave = {
          ...cleanState,
          _updatedAt: Date.now(),
          _lastWriter: clientIdRef.current,
          _rev: (state._rev || 0) + 1,
        };

        const t = setTimeout(async () => {
          try {
            await saveLeague(leagueId, toSave);
            lastSavedStateRef.current = currentDataSignature;
          } catch (e) {
            console.error("Cloud save error:", e);
          }
        }, 800);

        return () => clearTimeout(t);
      } catch (e) {
        console.error("LocalStorage save error:", e);
      }
    }
  }, [state, leagueId, updatingFromCloud, user]);

  // Compute derived data with club filtering
  const derived = React.useMemo(
    () => {
      if (!state) return { players: [], matches: [] };
      
      // If no club is selected, return empty data
      if (!selectedClub) {
        return { players: [], matches: [] };
      }
      
      // Filter data by club ID with better legacy support
      const clubId = selectedClub.id;
      const clubName = selectedClub.name;
      
      // Debug logging
      console.log('🔍 FILTRO CLUB DEBUG:', {
        selectedClubId: clubId,
        selectedClubName: clubName,
        totalPlayers: (state.players || []).length,
        totalMatches: (state.matches || []).length,
        firstPlayer: state.players?.[0],
        firstMatch: state.matches?.[0]
      });
      
      // For "Sporting Cat" variants, include data without clubId (legacy data)
      const isLegacyClub = clubName?.toLowerCase().includes('sporting') || 
                           clubId === 'sporting-cat' || 
                           clubId === 'Sporting CAT';
      
      const filteredPlayers = (state.players || []).filter(p => {
        const hasMatchingClubId = p.clubId === clubId;
        const isLegacyData = isLegacyClub && !p.clubId;
        const shouldInclude = hasMatchingClubId || isLegacyData;
        
        if ((state.players || []).indexOf(p) < 3) { // Log first 3 players
          console.log('🔍 PLAYER FILTER:', {
            playerName: p.name,
            playerClubId: p.clubId,
            hasMatchingClubId,
            isLegacyData,
            shouldInclude
          });
        }
        
        return shouldInclude;
      });
      
      const filteredMatches = (state.matches || []).filter(m => 
        m.clubId === clubId || (isLegacyClub && !m.clubId)
      );
      
      console.log('🔍 FILTRO RISULTATI:', {
        filteredPlayers: filteredPlayers.length,
        filteredMatches: filteredMatches.length,
        isLegacyClub
      });
      
      return recompute(filteredPlayers, filteredMatches);
    },
    [state, selectedClub],
  );

  // Filter other data arrays by club
  const filteredState = React.useMemo(
    () => {
      if (!state || !selectedClub) {
        return {
          ...state,
          players: [],
          matches: [],
          bookings: [],
          courts: []
        };
      }
      
      const clubId = selectedClub.id;
      const clubName = selectedClub.name;
      const isLegacyClub = clubName?.toLowerCase().includes('sporting') || 
                           clubId === 'sporting-cat' || 
                           clubId === 'Sporting CAT';
      
      console.log('🔍 FILTERED STATE per', clubName, '- isLegacyClub:', isLegacyClub);
      
      return {
        ...state,
        players: (state.players || []).filter(p => 
          p.clubId === clubId || (isLegacyClub && !p.clubId)
        ),
        matches: (state.matches || []).filter(m => 
          m.clubId === clubId || (isLegacyClub && !m.clubId)
        ),
        bookings: (state.bookings || []).filter(b => 
          b.clubId === clubId || (isLegacyClub && !b.clubId)
        ),
        courts: (state.courts || []).filter(c => 
          c.clubId === clubId || (isLegacyClub && !c.clubId)
        )
      };
    },
    [state, selectedClub],
  );

  const playersById = React.useMemo(
    () => Object.fromEntries((derived.players || []).map((p) => [p.id, p])),
    [derived],
  );

  // Club selection functions
  const selectClub = async (club) => {
    try {
      setSelectedClubLoading(true);
      setSelectedClub(club);
      // Store selected club in localStorage
      localStorage.setItem('selectedClub', JSON.stringify(club));
    } catch (error) {
      console.error('Error selecting club:', error);
    } finally {
      setSelectedClubLoading(false);
    }
  };

  const exitClub = () => {
    setSelectedClub(null);
    localStorage.removeItem('selectedClub');
  };

  // Load selected club from localStorage on init
  useEffect(() => {
    try {
      const savedClub = localStorage.getItem('selectedClub');
      if (savedClub) {
        setSelectedClub(JSON.parse(savedClub));
      }
    } catch (error) {
      console.error('Error loading selected club:', error);
    }
  }, []);

  const value = {
    state: filteredState,
    setState: setStateSafe,
    derived,
    playersById,
    leagueId,
    setLeagueId,
    loading,
    error,
    updatingFromCloud,
    // Club selection
    selectedClub,
    selectedClubLoading,
    selectClub,
    exitClub,
    hasSelectedClub: !!selectedClub,
    // Raw unfiltered state for admin purposes
    rawState: state,
  };

  return (
    <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>
  );
}
