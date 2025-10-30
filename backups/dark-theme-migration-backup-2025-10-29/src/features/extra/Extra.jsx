/* eslint-disable react-hooks/rules-of-hooks */
// =============================================
// FILE: src/features/extra/Extra.jsx
//   // ADMIN ONLY =====================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '@ui/Section.jsx';
// CSV/Download utilities non più utilizzati qui
import { getDefaultBookingConfig } from '@data/seed.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { useNotifications } from '@contexts/NotificationContext';
import { logger } from '@/utils/logger';

// Nuovo componente per gestione campi avanzata
import AdvancedCourtsManager from './AdvancedCourtsManager.jsx';
import AdvancedCourtsManager_Mobile from './AdvancedCourtsManager_Mobile.jsx';
import ErrorBoundary from '@components/ErrorBoundary.jsx';

// (Legacy RulesEditor rimosso)

/**
 * DEPRECATED FUNCTIONS - Kept for backward compatibility
 * The leagues/ collection system is OBSOLETE - use club subcollections instead
 * @see src/services/club-data.js
 */
const loadLeague = async (_leagueId) => {
  console.warn('⚠️ loadLeague() è DEPRECATO - usa getClubData() da @services/club-data.js');
  return { players: [], matches: [], courts: [], bookings: [], bookingConfig: {} };
};

const saveLeague = async (_leagueId, _data) => {
  console.warn('⚠️ saveLeague() è DEPRECATO - NON salva più dati nel database');
  console.warn('   Il sistema è migrato alle subcollections clubs/{clubId}/...');
  return;
};

const listLeagues = async () => {
  console.warn('⚠️ listLeagues() è DEPRECATO - il sistema leagues/ non è più utilizzato');
  return [];
};

export default function Extra({
  state,
  setState,
  leagueId,
  // setLeagueId not used
  _setLeagueId,
  clubMode,
  // setClubMode not used
  _setClubMode,
  isClubAdmin,
  clubId,
  T,
}) {
  const { loading } = useAuth();
  const { cleanInvalidCourts, club, courts } = useClub();
  const { showSuccess } = useNotifications();
  const [cloudMsg, setCloudMsg] = React.useState('');
  const navigate = useNavigate();

  // Rileva se siamo su mobile (< 1024px) per usare il componente ottimizzato
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);

  useEffect(() => {
    // CHK-007: Debounce resize listener per ottimizzare performance
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMobile(window.innerWidth < 1024);
      }, 150); // 150ms debounce
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Gli admin di club possono sempre accedere, anche senza clubMode attivato
  // Passa esplicitamente il clubId dalla URL alla funzione isClubAdmin
  const canAccessExtra =
    clubMode || (typeof isClubAdmin === 'function' ? isClubAdmin(clubId) : isClubAdmin);

  // Mostra loading se l'autenticazione è in corso
  if (loading) {
    return (
      <Section title="Caricamento..." T={T}>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <div className={`text-lg ${T.text}`}>Verifica delle autorizzazioni in corso...</div>
        </div>
      </Section>
    );
  }

  // Verifica accesso admin - solo amministratori o admin di club possono accedere a questa pagina
  if (!canAccessExtra) {
    return (
      <Section title="Accesso Negato" T={T}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <div className={`text-xl font-medium ${T.text} mb-2`}>Accesso Non Autorizzato</div>
          <div className={`text-sm ${T.subtext} mb-6`}>
            Solo gli amministratori e gli admin di club possono accedere a questa sezione
          </div>
          <button onClick={() => navigate('/dashboard')} className={`${T.btnSecondary} px-6 py-2`}>
            Torna alla Dashboard
          </button>
        </div>
      </Section>
    );
  }

  // === Campi con nuovo sistema avanzato

  // Gestione campi con il nuovo sistema
  const updateCourts = (updatedCourts) => {
    if (import.meta?.env?.DEV) {
      logger.debug('🔧 DEBUG Extra updateCourts - Ricevuti courts:', updatedCourts);
      logger.debug('🔧 DEBUG Extra updateCourts - clubMode:', clubMode);
    }

    // Verifica se i courts sono effettivamente cambiati rispetto allo stato precedente
    if (JSON.stringify(updatedCourts) === JSON.stringify(courts)) {
      logger.debug('Courts not changed, skipping update');
      return;
    }

    // In modalità club, salva tramite AdminBookingsPage
    if (clubMode) {
      logger.debug('Club mode - Saving courts via AdminBookingsPage');
      // Chiama setState per salvare i courts aggiornati
      setState({ courts: updatedCourts });
      return;
    }

    // In modalità league, salva nello state locale
    const newState = {
      ...state,
      courts: updatedCourts,
    };
    if (import.meta?.env?.DEV) {
      logger.debug('🔧 DEBUG Extra updateCourts - League mode - Nuovo state:', newState);
    }

    // Passa l'oggetto stato aggiornato, non una funzione
    setState(newState);
  };

  // Funzione per pulire campi non validi
  const handleCleanInvalidCourts = async () => {
    try {
      if (import.meta?.env?.DEV) {
        logger.debug('🧹 Starting invalid courts cleanup...');
      }
      await cleanInvalidCourts();
      if (import.meta?.env?.DEV) {
        logger.debug('✅ Invalid courts cleanup completed');
      }
      setCloudMsg('Campi non validi rimossi con successo');
      setTimeout(() => setCloudMsg(''), 3000);
    } catch (error) {
      logger.error('❌ Error cleaning invalid courts:', error);
      setCloudMsg('Errore durante la pulizia dei campi');
      setTimeout(() => setCloudMsg(''), 3000);
    }
  };

  // Pulizia automatica rimossa - solo manuale

  // === Config prenotazioni
  const cfg = state?.bookingConfig || getDefaultBookingConfig();
  const [cfgDraft, setCfgDraft] = useState(() => {
    const defaults = getDefaultBookingConfig();
    return {
      ...defaults,
      ...cfg,
      addons: {
        ...defaults.addons,
        ...cfg.addons,
      },
    };
  });
  const [userHasModified, setUserHasModified] = useState(false);
  useEffect(() => {
    // Non aggiornare cfgDraft se l'utente ha modificato qualcosa
    if (userHasModified) {
      return;
    }

    setCfgDraft((prev) => {
      try {
        const defaults = getDefaultBookingConfig();
        const mergedCfg = {
          ...defaults,
          ...cfg,
          addons: {
            ...defaults.addons,
            ...cfg.addons,
          },
        };
        const prevJson = JSON.stringify(prev);
        const cfgJson = JSON.stringify(mergedCfg);
        const shouldUpdate = prevJson !== cfgJson;

        // Se sono diversi, aggiorna con la nuova configurazione
        return shouldUpdate ? mergedCfg : prev;
      } catch (e) {
        logger.error('❌ Error in Extra useEffect:', e);
        return prev;
      }
    });
  }, [cfg, userHasModified]);

  // Guard clause: return loading state if state is not ready
  if (!state) {
    return (
      <Section title="Extra – Impostazioni" T={T}>
        <div className="text-center py-8">
          <div className="text-2xl mb-2">⏳</div>
          <div className={`text-sm ${T.subtext}`}>Caricamento in corso...</div>
        </div>
      </Section>
    );
  }

  // Rimosso: tryUnlock/lockPanel codice legacy non utilizzato

  const saveCfg = () => {
    if (import.meta?.env?.DEV) {
      logger.debug('🔧 DEBUG saveCfg - cfgDraft prima della normalizzazione:', cfgDraft);
    }

    let durations = cfgDraft.defaultDurations;
    if (typeof durations === 'string')
      durations = durations
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !Number.isNaN(n) && n > 0);
    const normalized = {
      ...cfgDraft,
      slotMinutes: Math.max(5, Number(cfgDraft.slotMinutes) || 30),
      dayStartHour: Math.min(23, Math.max(0, Number(cfgDraft.dayStartHour) || 8)),
      dayEndHour: Math.min(24, Math.max(1, Number(cfgDraft.dayEndHour) || 23)),
      defaultDurations: durations && durations.length ? durations : [60, 90, 120],
    };

    if (import.meta?.env?.DEV) {
      logger.debug('🔧 DEBUG saveCfg - configurazione normalizzata:', normalized);
      logger.debug('🔧 DEBUG saveCfg - addons:', normalized.addons);
    }

    setState({ ...state, bookingConfig: normalized });
    if (import.meta?.env?.DEV) {
      logger.debug('✅ DEBUG saveCfg - setState chiamato con bookingConfig');
    }
    // Reset della flag dopo il salvataggio
    setUserHasModified(false);
    showSuccess('Parametri salvati!');
  };
  const resetCfg = () => setCfgDraft(getDefaultBookingConfig());

  // Aggiornamento configurazione parametri base
  const addons = cfgDraft.addons || getDefaultBookingConfig().addons;

  return (
    <Section title="Extra – Impostazioni" T={T}>
      {/* Pannello Backup Cloud (legacy) dietro feature flag */}
      {import.meta?.env?.VITE_ENABLE_LEGACY_LEAGUES === 'true' && (
        <CloudBackupPanel
          T={T}
          leagueId={leagueId}
          setState={setState}
          cloudMsg={cloudMsg}
          setCloudMsg={setCloudMsg}
        />
      )}
      {/* Pulsante pulizia campi non validi */}
      {cloudMsg && (
        <div
          className={`mb-4 p-3 rounded-lg ${cloudMsg.includes('Errore') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
        >
          {cloudMsg}
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={handleCleanInvalidCourts}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
        >
          🧹 Pulisci Campi Non Validi
        </button>
      </div>

      {/* Gestione Campi Avanzata - Responsive: Mobile o Desktop */}
      <ErrorBoundary>
        {isMobile ? (
          <AdvancedCourtsManager_Mobile
            courts={clubMode ? courts : state?.courts || []}
            onChange={updateCourts}
            T={T}
            courtTypes={[...new Set(club?.courtTypes || ['Indoor', 'Outdoor', 'Covered'])]}
          />
        ) : (
          <AdvancedCourtsManager
            courts={clubMode ? courts : state?.courts || []}
            onChange={updateCourts}
            T={T}
            courtTypes={[...new Set(club?.courtTypes || ['Indoor', 'Outdoor', 'Covered'])]}
          />
        )}
      </ErrorBoundary>

      {/* Parametri prenotazioni + Regole tariffarie per-campo */}
      <div
        className={`rounded-2xl ${T.cardBg} ${T.border} p-3`}
        role="group"
        aria-label="Parametri prenotazioni"
      >
        <div className="font-medium mb-2">Prenotazioni — Parametri</div>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col">
            <label htmlFor="slotMinutes" className={`text-xs ${T.subtext}`}>
              Minuti slot
            </label>
            <input
              type="number"
              id="slotMinutes"
              value={cfgDraft.slotMinutes}
              onChange={(e) =>
                setCfgDraft((c) => ({
                  ...c,
                  slotMinutes: Number(e.target.value),
                }))
              }
              className={T.input}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="dayStartHour" className={`text-xs ${T.subtext}`}>
              Apertura (ora)
            </label>
            <input
              type="number"
              id="dayStartHour"
              value={cfgDraft.dayStartHour}
              onChange={(e) =>
                setCfgDraft((c) => ({
                  ...c,
                  dayStartHour: Number(e.target.value),
                }))
              }
              className={T.input}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="dayEndHour" className={`text-xs ${T.subtext}`}>
              Chiusura (ora)
            </label>
            <input
              type="number"
              id="dayEndHour"
              value={cfgDraft.dayEndHour}
              onChange={(e) =>
                setCfgDraft((c) => ({
                  ...c,
                  dayEndHour: Number(e.target.value),
                }))
              }
              className={T.input}
            />
          </div>
        </div>

        {/* Le regole tariffarie sono ora gestite per-campo nel sistema avanzato */}

        <div className="mt-4 rounded-xl p-3 border border-white/10">
          <div className="font-medium mb-2">Opzioni per prenotazione (costo fisso)</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <input
                id="cfg-lighting-enabled"
                type="checkbox"
                checked={!!addons.lightingEnabled}
                onChange={(e) => {
                  if (import.meta?.env?.DEV) {
                    logger.debug('🔧 DEBUG - Changing lightingEnabled to:', e.target.checked);
                  }
                  setUserHasModified(true);
                  setCfgDraft((c) => {
                    const newCfg = {
                      ...c,
                      addons: {
                        ...c.addons,
                        lightingEnabled: e.target.checked,
                      },
                    };
                    if (import.meta?.env?.DEV) {
                      logger.debug('🔧 DEBUG - New cfgDraft:', newCfg);
                    }
                    return newCfg;
                  });
                }}
              />
              <label htmlFor="cfg-lighting-enabled" className="cursor-pointer">
                Abilita Illuminazione
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${T.subtext}`}>Costo Illuminazione</span>
              <input
                type="number"
                className={`${T.input} w-28`}
                value={addons.lightingFee || 0}
                onChange={(e) => {
                  setUserHasModified(true);
                  setCfgDraft((c) => ({
                    ...c,
                    addons: {
                      ...c.addons,
                      lightingFee: Number(e.target.value) || 0,
                    },
                  }));
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="cfg-heating-enabled"
                type="checkbox"
                checked={!!addons.heatingEnabled}
                onChange={(e) => {
                  if (import.meta?.env?.DEV) {
                    logger.debug('🔧 DEBUG - Changing heatingEnabled to:', e.target.checked);
                  }
                  setUserHasModified(true);
                  setCfgDraft((c) => {
                    const newCfg = {
                      ...c,
                      addons: {
                        ...c.addons,
                        heatingEnabled: e.target.checked,
                      },
                    };
                    if (import.meta?.env?.DEV) {
                      logger.debug('🔧 DEBUG - New cfgDraft:', newCfg);
                    }
                    return newCfg;
                  });
                }}
              />
              <label htmlFor="cfg-heating-enabled" className="cursor-pointer">
                Abilita Riscaldamento
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${T.subtext}`}>Costo Riscaldamento</span>
              <input
                type="number"
                className={`${T.input} w-28`}
                value={addons.heatingFee || 0}
                onChange={(e) => {
                  setUserHasModified(true);
                  setCfgDraft((c) => ({
                    ...c,
                    addons: {
                      ...c.addons,
                      heatingFee: Number(e.target.value) || 0,
                    },
                  }));
                }}
              />
            </div>
          </div>
          <div className={`text-xs ${T.subtext} mt-2`}>
            Nota: l’<b>Illuminazione</b> e il <b>Riscaldamento</b> sono opzioni per prenotazione
            (prezzo fisso, non a tempo).
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button type="button" className={T.btnPrimary} onClick={saveCfg}>
            Salva parametri
          </button>
          <button type="button" className={T.btnGhost} onClick={resetCfg}>
            Ripristina default
          </button>
        </div>
      </div>

      {/* Sezione Cloud Backup/Restore - Protetto (spostata sopra con feature flag) */}

      <div className={`text-xs ${T.subtext} mt-3`}>
        I dati sono salvati <b>in locale</b> (localStorage) e, se configurato,{' '}
        <b>anche su Firestore</b> nel documento <code>leagues/{leagueId}</code>.
      </div>
    </Section>
  );
}

// Componente separato per il pannello cloud protetto
function CloudBackupPanel({ T, leagueId, setState, cloudMsg, setCloudMsg }) {
  // Hook dentro il componente
  const navigate = useNavigate();
  const { showError, showSuccess, showWarning } = useNotifications();
  const [availableBackups, setAvailableBackups] = React.useState([]);
  const [selectedBackup, setSelectedBackup] = React.useState('');
  const [loadingBackups, setLoadingBackups] = React.useState(false);
  const [cloudPwd, setCloudPwd] = React.useState('');
  const [cloudUnlocked, setCloudUnlocked] = React.useState(() => {
    try {
      return sessionStorage.getItem('ml-cloud-unlocked') === '1';
    } catch {
      return false;
    }
  });

  const tryUnlockCloud = (e) => {
    e?.preventDefault?.();
    if (cloudPwd === 'ParisAdmin85') {
      setCloudUnlocked(true);
      try {
        sessionStorage.setItem('ml-cloud-unlocked', '1');
      } catch {
        /* no-op */
      }
    } else {
      showError('Password cloud errata');
    }
  };

  const lockCloudPanel = () => {
    setCloudUnlocked(false);
    setCloudPwd('');
    try {
      sessionStorage.removeItem('ml-cloud-unlocked');
    } catch {
      /* no-op */
    }
  };

  async function loadBackupsList() {
    setLoadingBackups(true);
    try {
      // Use local deprecated stub instead of removed @services/cloud.js
      const backups = await listLeagues();
      setAvailableBackups(backups);
      setCloudMsg(`✅ Trovati ${backups.length} backup su Firebase`);
    } catch (e) {
      setCloudMsg(`❌ Errore caricamento lista backup: ${e?.message || e}`);
    } finally {
      setLoadingBackups(false);
    }
  }

  async function forceSave() {
    try {
      const state = JSON.parse(localStorage.getItem('ml-persist') || '{}');
      await saveLeague(leagueId, { ...state, _updatedAt: Date.now() });
      setCloudMsg(`✅ Salvato su cloud: leagues/${leagueId}`);
      if (availableBackups.length > 0) loadBackupsList();
    } catch (e) {
      setCloudMsg(`❌ Errore salvataggio: ${e?.message || e}`);
    }
  }

  async function forceLoad() {
    const backupId = selectedBackup || leagueId;
    try {
      const cloud = await loadLeague(backupId);
      if (cloud && typeof cloud === 'object') {
        setState(cloud);
        setCloudMsg(`✅ Caricato dal cloud: leagues/${backupId}`);
      } else {
        setCloudMsg('⚠️ Documento non trovato sul cloud');
      }
    } catch (e) {
      setCloudMsg(`❌ Errore caricamento: ${e?.message || e}`);
    }
  }

  return (
    <div className={`rounded-2xl ${T.cardBg} ${T.border} p-4 mb-6`}>
      {!cloudUnlocked ? (
        <>
          <div className="font-semibold mb-4 flex items-center gap-2">
            🔒 Backup Cloud (Firebase) - Accesso Limitato
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🔐</div>
            <div className="font-semibold mb-2">Pannello Cloud Protetto</div>
            <div className={`text-sm ${T.subtext} mb-4`}>
              Inserisci la password amministratore per accedere ai backup Firebase
            </div>
          </div>
          <form onSubmit={tryUnlockCloud} className="space-y-4">
            <div>
              <label htmlFor="cloudPwd" className={`text-sm font-medium ${T.text} mb-2 block`}>
                🔑 Password Cloud
              </label>
              <input
                id="cloudPwd"
                type="password"
                value={cloudPwd}
                onChange={(e) => setCloudPwd(e.target.value)}
                placeholder="Password amministratore cloud"
                className={`${T.input} w-full`}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className={`${T.btnPrimary} flex-1`}>
                🔓 Sblocca Cloud
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="font-semibold mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">☁️ Backup Cloud (Firebase)</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`${T.btnGhost} text-xs`}
                onClick={loadBackupsList}
                disabled={loadingBackups}
              >
                {loadingBackups ? '⏳ Caricando...' : '🔄 Aggiorna Lista'}
              </button>
              <button type="button" className={`${T.btnGhost} text-xs`} onClick={lockCloudPanel}>
                🔒 Blocca
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {cloudMsg && (
              <div
                className={`p-3 rounded-xl text-sm ${
                  cloudMsg.includes('❌')
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    : cloudMsg.includes('⚠️')
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                }`}
              >
                {cloudMsg}
              </div>
            )}

            {availableBackups.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="backupSelect" className={`text-sm font-medium ${T.text}`}>
                  📋 Seleziona Backup da Caricare:
                </label>
                <select
                  id="backupSelect"
                  value={selectedBackup}
                  onChange={(e) => setSelectedBackup(e.target.value)}
                  className={`${T.input} w-full`}
                >
                  <option value="">🔄 Usa League ID corrente ({leagueId})</option>
                  {availableBackups.map((backup) => (
                    <option key={backup.id} value={backup.id}>
                      📁 {backup.id} - {backup.players} giocatori, {backup.matches} partite
                      {backup.lastUpdated !== 'N/A' && ` (${backup.lastUpdated})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-3">
              <button
                type="button"
                className={`${T.btnSecondary} flex items-center justify-center gap-2`}
                onClick={loadBackupsList}
                disabled={loadingBackups}
              >
                📋 {loadingBackups ? 'Caricando...' : 'Lista Backup'}
              </button>

              <button
                type="button"
                className={`${T.btnPrimary} flex items-center justify-center gap-2`}
                onClick={forceSave}
              >
                ⬆️ Salva su Cloud
              </button>

              <button
                type="button"
                className={`${T.btnGhost} flex items-center justify-center gap-2`}
                onClick={forceLoad}
              >
                ⬇️ Carica {selectedBackup ? 'Selezionato' : 'Corrente'}
              </button>
            </div>

            <div className={`text-xs ${T.subtext} space-y-1`}>
              <div>
                <b>League ID Corrente:</b>{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{leagueId}</code>
              </div>
              <div>
                <b>Backup Selezionato:</b>{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  {selectedBackup || leagueId}
                </code>
              </div>
              <div>
                <b>Firebase Project:</b>{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">m-padelweb</code>
              </div>
            </div>
          </div>

          {/* Native Features Test Section */}
          <div className={`${T.card} ${T.space} space-y-4`}>
            <h3 className={`text-lg font-bold ${T.text} flex items-center gap-2`}>
              📱 Test Funzionalità Native
            </h3>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <p>
                  <b>Piattaforma:</b> Web Browser
                </p>
                <p>
                  <b>Ambiente:</b> 🌐 Applicazione Web
                </p>
                <p>
                  <b>Tipo:</b> Progressive Web App (PWA)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/native-test')}
                className={`${T.btnPrimary} w-full flex items-center justify-center gap-2`}
              >
                🧪 Apri Pagina Test Native
              </button>

              <div className={`text-xs ${T.subtext} space-y-1`}>
                <p>
                  <b>Funzionalità Testabili:</b>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>📍 GPS e Geolocalizzazione</li>
                  <li>🔔 Notifiche Push e Locali</li>
                  <li>📤 Condivisione Nativa</li>
                  <li>📱 Informazioni Piattaforma</li>
                </ul>
              </div>
            </div>
          </div>

          {/* App Update Control Section */}
          <div className={`${T.card} ${T.space} space-y-4`}>
            <h3 className={`text-lg font-bold ${T.text} flex items-center gap-2`}>
              🔄 Controllo Aggiornamenti
            </h3>

            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <p>
                  <b>Versione App:</b> v1.7.0 (2025-09-12)
                </p>
                <p>
                  <b>Cache Status:</b> Gestione automatica attiva
                </p>
                <p>
                  <b>Service Worker:</b> Cache busting abilitato
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  try {
                    const { default: updateService } = await import('@services/updateService.js');
                    await updateService.forceUpdate();
                  } catch (error) {
                    showError("Errore durante l'aggiornamento: " + error.message);
                  }
                }}
                className={`${T.btnSecondary} w-full flex items-center justify-center gap-2`}
              >
                🔄 Forza Aggiornamento App
              </button>

              <button
                onClick={async () => {
                  try {
                    if ('caches' in window) {
                      const cacheNames = await caches.keys();
                      await Promise.all(cacheNames.map((name) => caches.delete(name)));
                      showSuccess(
                        'Cache PWA cancellata! Ricarica per scaricare la versione più recente.'
                      );
                    } else {
                      showWarning('Cache API non supportata in questo browser');
                    }
                  } catch (error) {
                    showError('Errore durante la cancellazione cache: ' + error.message);
                  }
                }}
                className={`${T.btnDanger} w-full flex items-center justify-center gap-2`}
              >
                🗑️ Cancella Cache PWA
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p>
                  <b>Per problemi di cache mobile:</b>
                </p>
                <p>1. Usa &quot;Forza Aggiornamento App&quot; per aggiornamento automatico</p>
                <p>2. Se non funziona, usa &quot;Cancella Cache PWA&quot; e ricarica</p>
                <p>3. Su iOS: Impostazioni → Safari → Cancella Cronologia</p>
                <p>4. Su Android: Browser → Impostazioni → Storage → Cancella Dati</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
