// =============================================
// FILE: src/app/App.jsx
// =============================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { loadLeague, saveLeague, subscribeLeague } from '@services/cloud.js';
import {
  completeMagicLinkIfPresent,
  onAuth,
  completeProviderRedirectIfNeeded,
} from '@services/auth.jsx';

import { themeTokens, LOGO_URL, LOGO_ICON_URL } from '@lib/theme.js';
import { LS_KEY } from '@lib/ids.js';
import { recompute } from '@lib/ranking.js';

import NavTabs from '@ui/NavTabs.jsx';
import Modal from '@ui/Modal.jsx';

import Classifica from '@features/classifica/Classifica.jsx';
import Giocatori from '@features/players/Giocatori.jsx';
import CreaPartita from '@features/crea/CreaPartita.jsx';
import StatisticheGiocatore from '@features/stats/StatisticheGiocatore.jsx';
import PrenotazioneCampi from '@features/prenota/PrenotazioneCampi.jsx';
import ModernBookingInterface from '@features/booking/ModernBookingInterface.jsx';
import Extra from '@features/extra/Extra.jsx';
import CreaTornei from '@features/tornei/CreaTornei.jsx';
import Profile from '@features/profile/Profile.jsx';
import AuthPanel from '@features/auth/AuthPanel.jsx';

import { getDefaultBookingConfig, makeSeed } from '@data/seed.js';

export default function App() {
  // Tema unico (niente dark mode)
  const T = useMemo(() => themeTokens(), []);

  // League
  const [leagueId, setLeagueId] = useState(
    localStorage.getItem(LS_KEY + '-leagueId') || 'lega-andrea-2025'
  );
  useEffect(() => localStorage.setItem(LS_KEY + '-leagueId', leagueId), [leagueId]);

  // Club mode (protetta da unlock nel pannello Extra)
  const [clubMode, setClubMode] = useState(() => {
    try {
      const unlocked = sessionStorage.getItem('ml-extra-unlocked') === '1';
      const saved = sessionStorage.getItem('ml-club-mode') === '1';
      return unlocked && saved;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      if (clubMode) sessionStorage.setItem('ml-club-mode', '1');
      else sessionStorage.removeItem('ml-club-mode');
    } catch {
      void 0;
    }
  }, [clubMode]);

  // Stato
  const [state, setState] = useState(null);
  const [updatingFromCloud, setUpdatingFromCloud] = useState(false);

  // Auth (per NavTabs e Profilo)
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuth(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Carica il profilo utente da Firestore
        try {
          const { getUserProfile } = await import('@services/auth.jsx');
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          // Error loading user profile
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    completeMagicLinkIfPresent().catch(() => {});
    // Completa eventuale magic link o redirect provider (Google/Facebook)
    completeProviderRedirectIfNeeded().catch(() => {});
  }, []);

  // clientId + mute snapshot
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

  const setStateSafe = (updater) => {
    setState((prev) => {
      const base = typeof updater === 'function' ? updater(prev) : updater;
      const stamp = Date.now();
      const nextRev = (prev?._rev || 0) + 1;
      muteCloudUntilRef.current = stamp + 2000; // 2s
      return { ...base, _updatedAt: stamp, _rev: nextRev, _lastWriter: clientIdRef.current };
    });
  };

  // load iniziale - aspetta che l'autenticazione sia completata
  useEffect(() => {
    // Non fare nulla finché l'autenticazione non è completata
    if (authLoading) return;

    (async () => {
      try {
        // Se l'utente è autenticato, prova a caricare dalla cloud
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

            // Inizializza il riferimento ai dati appena caricati
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
            return; // Caricamento completato
          }
        }

        // Se non autenticato o nessun dato valido nel cloud, usa i dati locali o seed
        // Prima prova localStorage
        try {
          const localData = localStorage.getItem(LS_KEY);
          if (localData) {
            const parsed = JSON.parse(localData);
            if (parsed && Array.isArray(parsed.players) && Array.isArray(parsed.matches)) {
              setState(parsed);

              // Inizializza il riferimento ai dati locali caricati
              const relevantFields = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
              lastSavedStateRef.current = relevantFields.reduce((acc, field) => {
                acc[field] = parsed[field] || [];
                return acc;
              }, {});

              return; // Usa dati locali
            }
          }
        } catch {
          // Ignora errori di localStorage
        }

        // Fallback: crea dati seed
        const initial = makeSeed();
        setState(initial);

        // Inizializza il riferimento ai dati seed
        const relevantFields = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
        lastSavedStateRef.current = relevantFields.reduce((acc, field) => {
          acc[field] = initial[field] || [];
          return acc;
        }, {});

        // Solo se autenticato, prova a salvare i dati seed nel cloud
        if (user) {
          try {
            await saveLeague(leagueId, {
              ...initial,
              _updatedAt: Date.now(),
              _rev: 1,
              _lastWriter: clientIdRef.current,
            });
          } catch (e) {
            // Failed to save initial data to cloud
          }
        }
      } catch (e) {
        // Initial load error
        const fallback = makeSeed();
        setState(fallback);
      }
    })();
  }, [leagueId, user, authLoading]); // Dipende da autenticazione

  // sync snapshot - solo se autenticato
  useEffect(() => {
    if (!leagueId || !user || authLoading) return; // Solo se autenticato
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
          const localRev = prev?._rev ?? 0,
            cloudRev = migrated?._rev ?? 0;
          const localTs = prev?._updatedAt ?? 0,
            cloudTs = migrated?._updatedAt ?? 0;
          const cloudIsNewer = cloudRev > localRev || (cloudRev === localRev && cloudTs > localTs);

          if (cloudIsNewer) {
            // Aggiorna il riferimento quando arrivano dati più recenti dal cloud
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
      // Subscribe error
    }
    return () => unsub && unsub();
  }, [leagueId, user, authLoading]); // Dipende da autenticazione

  // Riferimento all'ultimo stato salvato per evitare salvataggi inutili
  const lastSavedStateRef = useRef(null);

  // save (con check contenuto migliorato)
  useEffect(() => {
    if (!state || updatingFromCloud || !user) return; // Non salvare se non autenticati

    // Confronta solo i dati rilevanti, escludendo i metadata (_updatedAt, _rev, ecc)
    const relevantFields = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];

    // Crea una "firma" dei dati rilevanti per confronto
    const currentDataSignature = relevantFields.reduce((acc, field) => {
      acc[field] = state[field];
      return acc;
    }, {});

    // Confronta con l'ultimo stato effettivamente salvato
    const lastSavedSignature = lastSavedStateRef.current;

    const hasChanges =
      !lastSavedSignature ||
      relevantFields.some(
        (field) =>
          JSON.stringify(currentDataSignature[field]) !== JSON.stringify(lastSavedSignature[field])
      );

    if (hasChanges) {
      // Data changes detected, saving...

      try {
        // Salva su localStorage immediatamente
        localStorage.setItem(LS_KEY, JSON.stringify(state));

        // Prepara dati per cloud con metadata
        const toSave = {
          ...state,
          _updatedAt: Date.now(),
          _lastWriter: clientIdRef.current,
          _rev: (state._rev || 0) + 1, // Incrementa revision per tracking
        };

        // Salva su cloud con debounce per evitare troppe chiamate
        const t = setTimeout(async () => {
          try {
            await saveLeague(leagueId, toSave);
            // Aggiorna il riferimento solo dopo salvataggio riuscito
            lastSavedStateRef.current = currentDataSignature;
          } catch (e) {
            // Cloud save error
          }
        }, 800);

        return () => clearTimeout(t);
      } catch (e) {
        // LocalStorage save error
      }
    } else {
      // Solo per debug - rimuovi in produzione
      // console.log('⏭️ Nessuna modifica rilevata, salvataggio saltato');
    }
  }, [state, leagueId, updatingFromCloud]);

  // routing
  const [active, setActive] = useState('auth'); // Inizia sempre con login
  const [formulaText, setFormulaText] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  // Gestione controllo accesso e redirect automatici
  useEffect(() => {
    if (authLoading) return; // Non fare nulla finché l'auth non è completa

    if (!user) {
      // Se non autenticato, forza la tab auth
      if (active !== 'auth') {
        setActive('auth');
      }
    } else {
      // Se autenticato e nella tab auth, vai a "prenota-campo"
      if (active === 'auth') {
        setActive('prenota-campo');
      }
    }
  }, [user, authLoading, active]);

  useEffect(() => {
    if (!clubMode && new Set(['giocatori', 'crea', 'prenota', 'tornei']).has(active))
      setActive('prenota-campo'); // Cambiato da 'classifica' a 'prenota-campo'
  }, [clubMode, active]);

  const derived = useMemo(
    () =>
      state ? recompute(state.players || [], state.matches || []) : { players: [], matches: [] },
    [state]
  );
  const playersById = useMemo(
    () => Object.fromEntries((derived.players || []).map((p) => [p.id, p])),
    [derived]
  );
  const openStats = (pid) => {
    setSelectedPlayerId(pid);
    setActive('stats');
  };

  // Gestione prenotazioni campi: centralizzata via servizio booking; nessuna logica locale qui

  // Verifica se l'utente ha completato il profilo obbligatorio
  const isProfileComplete = userProfile && userProfile.firstName && userProfile.phone;

  // TUTTE le tab richiedono autenticazione tranne 'auth'
  // L'app deve mostrare solo il login se non autenticati
  const requiresAuth = new Set([
    'giocatori',
    'crea',
    'prenota',
    'tornei',
    'profile',
    'classifica',
    'stats',
    'prenota-campo',
    'extra',
  ]);
  const needsAuth = requiresAuth.has(active) && (!user || !isProfileComplete);

  if (authLoading) {
    return (
      <div className={`min-h-screen ${T.pageBg} ${T.text} flex items-center justify-center`}>
        <div className="text-lg">Caricamento...</div>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className={`min-h-screen ${T.pageBg} ${T.text}`}>
        <header className={`sticky top-0 z-20 ${T.headerBg}`}>
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img
                src={LOGO_URL}
                alt="Play Sport Pro"
                className="h-10 w-auto"
              />
            </div>
            <div />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-3 sm:px-4 py-5 sm:py-6">
          <AuthPanel T={T} user={user} userProfile={userProfile} setUserProfile={setUserProfile} />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${T.pageBg} ${T.text}`}>
      <header className={`sticky top-0 z-20 ${T.headerBg}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src={LOGO_URL}
              alt="Play Sport Pro"
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <NavTabs active={active} setActive={setActive} clubMode={clubMode} T={T} user={user} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-6">
        {!state ? (
          <div className="p-6">Caricamento…</div>
        ) : (
          <>
            {active === 'giocatori' && clubMode && (
              <Giocatori
                T={T}
                state={state}
                setState={setStateSafe}
                onOpenStats={openStats}
                playersById={playersById}
              />
            )}
            {active === 'classifica' && (
              <Classifica
                T={T}
                players={derived.players}
                matches={derived.matches}
                onOpenStats={openStats}
              />
            )}
            {active === 'crea' && clubMode && (
              <CreaPartita
                T={T}
                state={state}
                setState={setStateSafe}
                playersById={playersById}
                onShowFormula={setFormulaText}
                derivedMatches={derived.matches}
              />
            )}
            {active === 'stats' && (
              <StatisticheGiocatore
                T={T}
                players={derived.players}
                matches={derived.matches}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={setSelectedPlayerId}
                onShowFormula={setFormulaText}
              />
            )}
            {active === 'prenota' && clubMode && !state && (
              <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
                <div className="text-4xl mb-4">⏳</div>
                <h3 className={`text-lg font-medium mb-2 ${T.text}`}>Caricamento...</h3>
                <p className={`${T.subtext}`}>Caricamento configurazione campi in corso...</p>
              </div>
            )}
            {active === 'prenota' && clubMode && state && (
              <PrenotazioneCampi
                T={T}
                state={state}
                setState={setStateSafe}
                players={derived.players}
                playersById={playersById}
              />
            )}
            {active === 'prenota' && !clubMode && (
              <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
                <div className="text-6xl mb-4">🔒</div>
                <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Modalità Club Richiesta</h3>
                <p className={`${T.subtext} mb-4`}>
                  Per accedere alla gestione campi, devi prima sbloccare la modalità club nella sezione Extra.
                </p>
                <button 
                  onClick={() => setActive('extra')} 
                  className={`${T.btnPrimary} px-6 py-3`}
                >
                  Vai a Extra per sbloccare
                </button>
              </div>
            )}
            {active === 'prenota-campo' && (
              <ModernBookingInterface T={T} user={user} state={state} setState={setStateSafe} />
            )}
            {active === 'tornei' && clubMode && <CreaTornei T={T} />}

            {active === 'profile' && (
              <Profile 
                T={T} 
                state={state} 
                setState={setStateSafe} 
                derived={derived} 
                leagueId={leagueId} 
                setLeagueId={setLeagueId} 
                clubMode={clubMode} 
                setClubMode={setClubMode} 
              />
            )}
            {active === 'auth' && <AuthPanel T={T} />}

            {active === 'extra' && (
              <Extra
                T={T}
                state={state}
                setState={setStateSafe}
                derived={derived}
                leagueId={leagueId}
                setLeagueId={setLeagueId}
                clubMode={clubMode}
                setClubMode={setClubMode}
              />
            )}
          </>
        )}
      </main>

      <Modal
        open={!!formulaText}
        onClose={() => setFormulaText('')}
        title="Formula calcolo punti (RPA) – Spiegazione"
        T={T}
      >
        {formulaText}
      </Modal>
    </div>
  );
}
