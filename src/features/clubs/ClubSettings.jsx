import React, { useEffect, useState } from 'react';
import Section from '@ui/Section.jsx';
import { getDefaultBookingConfig } from '@data/seed.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { useNotifications } from '@contexts/NotificationContext';
import { logger } from '@/utils/logger';
import ErrorBoundary from '@components/ErrorBoundary.jsx';

// Import components from extra (we will move them later if needed)
import AdvancedCourtsManager from '@features/extra/AdvancedCourtsManager.jsx';
import AdvancedCourtsManager_Mobile from '@features/extra/AdvancedCourtsManager_Mobile.jsx';

export default function ClubSettings({
  state,
  setState,
  clubMode,
  isClubAdmin,
  clubId,
  T,
}) {
  const { loading } = useAuth();
  const { club, courts } = useClub();
  const { showSuccess } = useNotifications();

  // Rileva se siamo su mobile (< 1024px) per usare il componente ottimizzato
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);

  useEffect(() => {
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
  const canAccessSettings =
    clubMode || (typeof isClubAdmin === 'function' ? isClubAdmin(clubId) : isClubAdmin);

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

  if (!canAccessSettings) {
    return (
      <Section title="Accesso Negato" T={T}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <div className={`text-xl font-medium ${T.text} mb-2`}>Accesso Non Autorizzato</div>
        </div>
      </Section>
    );
  }

  // === Campi con nuovo sistema avanzato

  const updateCourts = (updatedCourts) => {
    if (import.meta?.env?.DEV) {
      logger.debug('🔧 DEBUG ClubSettings updateCourts - Ricevuti courts:', updatedCourts);
    }

    if (JSON.stringify(updatedCourts) === JSON.stringify(courts)) {
      return;
    }

    // In modalità club, salva tramite AdminBookingsPage (che passa setState)
    setState({ courts: updatedCourts });
  };

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

        return shouldUpdate ? mergedCfg : prev;
      } catch (e) {
        logger.error('❌ Error in ClubSettings useEffect:', e);
        return prev;
      }
    });
  }, [cfg, userHasModified]);

  if (!state) {
    return (
      <Section title="Impostazioni Club" T={T}>
        <div className="text-center py-8">
          <div className="text-2xl mb-2">⏳</div>
          <div className={`text-sm ${T.subtext}`}>Caricamento in corso...</div>
        </div>
      </Section>
    );
  }

  const saveCfg = () => {
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

    setState({ ...state, bookingConfig: normalized });
    setUserHasModified(false);
    showSuccess('Parametri salvati!');
  };

  const resetCfg = () => setCfgDraft(getDefaultBookingConfig());

  const addons = cfgDraft.addons || getDefaultBookingConfig().addons;

  return (
    <Section title="Impostazioni Club" T={T}>
      {/* Gestione Campi Avanzata */}
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

      {/* Parametri prenotazioni */}
      <div
        className={`rounded-2xl ${T.cardBg} ${T.border} p-3 mt-6`}
        role="group"
        aria-label="Parametri prenotazioni"
      >
        <div className="font-medium mb-2">Prenotazioni — Parametri</div>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col">
            <label htmlFor="slotMinutes" className={`text-xs ${T.subtext}`}>
              Minuti slot
            </label>
            <select
              id="slotMinutes"
              value={cfgDraft.slotMinutes}
              onChange={(e) =>
                setCfgDraft((c) => ({
                  ...c,
                  slotMinutes: Number(e.target.value),
                }))
              }
              className={T.input}
            >
              <option value="30">30 minuti</option>
              <option value="60">60 minuti (1 ora)</option>
            </select>
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

        <div className={`mt-4 rounded-xl p-3 ${T.cardBg} ${T.border}`}>
          <div className="font-medium mb-2">Opzioni per prenotazione (costo fisso)</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <input
                id="cfg-lighting-enabled"
                type="checkbox"
                checked={!!addons.lightingEnabled}
                onChange={(e) => {
                  setUserHasModified(true);
                  setCfgDraft((c) => ({
                    ...c,
                    addons: {
                      ...c.addons,
                      lightingEnabled: e.target.checked,
                    },
                  }));
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
                  setUserHasModified(true);
                  setCfgDraft((c) => ({
                    ...c,
                    addons: {
                      ...c.addons,
                      heatingEnabled: e.target.checked,
                    },
                  }));
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
    </Section>
  );
}
