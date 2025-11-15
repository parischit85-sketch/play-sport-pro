/**
 * Tournament Wizard - Multi-step tournament creation form
 * Steps: 1) Basic Info, 2) Configuration, 3) Points System, 4) Registration, 5) Review
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { createTournament } from '../../services/tournamentService';
import {
  PARTICIPANT_TYPE,
  TOURNAMENT_FORMAT,
  DEFAULT_STANDARD_POINTS,
  DEFAULT_TIE_BREAK_POINTS,
  POINTS_SYSTEM_TYPE,
} from '../../utils/tournamentConstants';
import { validateTournamentName, validateGroupsConfig } from '../../utils/tournamentValidation';

const STEPS = [
  { id: 1, name: 'Informazioni Base', description: 'Nome e descrizione' },
  { id: 2, name: 'Configurazione', description: 'Gironi e qualificati' },
  { id: 3, name: 'Sistema Punti', description: 'Standard o tie-break' },
  { id: 4, name: 'Iscrizioni', description: 'Date e limiti' },
  { id: 5, name: 'Riepilogo', description: 'Conferma e crea' },
];

function TournamentWizard({ clubId, onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creationProgress, setCreationProgress] = useState(null); // { current: 1, total: 8, message: 'Creazione torneo' }

  // Block body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Get scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    // Add padding to prevent layout shift
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    participantType: PARTICIPANT_TYPE.COUPLES,
    playersPerTeam: 2, // Default per coppie, da 2 a 8
    numberOfGroups: 4,
    teamsPerGroup: 4,
    qualifiedPerGroup: 2,
    includeThirdPlaceMatch: true,
    pointsSystem: { ...DEFAULT_STANDARD_POINTS },
    registrationOpensAt: null,
    registrationClosesAt: null,
    // Default ranking to assign to players that are NOT participants
    defaultRankingForNonParticipants: 1500,
    // Configurazione punti campionato (draft)
    championshipPoints: {
      rpaMultiplier: 1,
      groupPlacementPoints: { 1: 100, 2: 60, 3: 40, 4: 20 },
      knockoutProgressPoints: {
        round_of_16: 10,
        quarter_finals: 20,
        semi_finals: 40,
        finals: 80,
        third_place: 15,
      },
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleNext = () => {
    console.log('🔍 [TournamentWizard] handleNext called', { currentStep, formData });

    // Validate current step
    const validation = validateCurrentStep();
    console.log('✅ [TournamentWizard] Validation result:', validation);

    if (!validation.valid) {
      console.error('❌ [TournamentWizard] Validation failed:', validation.error);
      setError(validation.error);
      return;
    }

    if (currentStep < STEPS.length) {
      console.log('➡️ [TournamentWizard] Moving to next step:', currentStep + 1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
    }
  };

  const validateCurrentStep = () => {
    console.log('🔍 [validateCurrentStep] Current step:', currentStep);

    if (currentStep === 1) {
      console.log('📝 [validateCurrentStep] Validating tournament name:', formData.name);
      const result = validateTournamentName(formData.name);
      console.log('📝 [validateCurrentStep] Name validation result:', result);
      return result;
    }

    if (currentStep === 2) {
      // Per "Solo Partite" non serve validare i gironi
      if (formData.participantType === PARTICIPANT_TYPE.MATCHES_ONLY) {
        console.log('✅ [validateCurrentStep] Solo Partite - skip groups validation');
        return { valid: true };
      }

      console.log('⚙️ [validateCurrentStep] Validating groups config:', {
        numberOfGroups: formData.numberOfGroups,
        teamsPerGroup: formData.teamsPerGroup,
        qualifiedPerGroup: formData.qualifiedPerGroup,
      });
      const result = validateGroupsConfig(
        formData.numberOfGroups,
        formData.teamsPerGroup,
        formData.qualifiedPerGroup
      );
      console.log('⚙️ [validateCurrentStep] Groups validation result:', result);
      return result;
    }

    console.log('✅ [validateCurrentStep] No validation needed for step', currentStep);
    return { valid: true };
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setCreationProgress({ current: 1, total: 8, message: 'Creazione torneo' });

    try {
      // Simula i vari step di creazione
      const steps = [
        { current: 1, total: 8, message: 'Creazione torneo' },
        { current: 2, total: 8, message: 'Configurazione base' },
        { current: 3, total: 8, message: 'Impostazione gironi' },
        { current: 4, total: 8, message: 'Generazione tabellone' },
        { current: 5, total: 8, message: 'Setup sistema punti' },
        { current: 6, total: 8, message: 'Configurazione iscrizioni' },
        { current: 7, total: 8, message: 'Salvataggio dati' },
        { current: 8, total: 8, message: 'Finalizzazione' },
      ];

      const tournamentData = {
        clubId,
        ...formData,
      };

      // Aggiorna il progresso incrementalmente
      for (let i = 0; i < steps.length - 1; i++) {
        setCreationProgress(steps[i]);
        await new Promise((resolve) => setTimeout(resolve, 300)); // Simula il processing
      }

      setCreationProgress(steps[steps.length - 1]);
      const result = await createTournament(tournamentData, clubId);

      if (result.success) {
        onComplete();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setCreationProgress(null);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderConfigurationStep();
      case 3:
        return renderPointsSystemStep();
      case 4:
        return renderRegistrationStep();
      case 5:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <div className="block text-sm font-medium text-gray-300 mb-2">Nome Torneo *</div>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Es: Torneo Estivo 2024"
          className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Descrizione rimossa su mobile per recuperare spazio; visibile solo da sm in su */}
      <div className="hidden sm:block">
        <div className="block text-sm font-medium text-gray-300 mb-2">Descrizione</div>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descrizione del torneo..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="block text-sm font-medium text-gray-300 mb-2">Tipo Partecipanti</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              handleInputChange('participantType', PARTICIPANT_TYPE.COUPLES);
              handleInputChange('playersPerTeam', 2);
            }}
            className={`p-4 sm:p-5 rounded-lg border-2 transition-all transform hover:scale-105 ${
              formData.participantType === PARTICIPANT_TYPE.COUPLES
                ? 'border-primary-500 bg-gradient-to-br from-primary-600/40 to-primary-700/30 text-white ring-4 ring-primary-500/30 shadow-lg shadow-primary-500/20'
                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-primary-400/50 hover:bg-gray-700'
            }`}
          >
            <div
              className={`font-bold text-base sm:text-lg ${
                formData.participantType === PARTICIPANT_TYPE.COUPLES
                  ? 'text-primary-200'
                  : 'text-gray-200'
              }`}
            >
              Coppie
            </div>
            <div
              className={`text-xs sm:text-sm mt-1 ${
                formData.participantType === PARTICIPANT_TYPE.COUPLES
                  ? 'text-primary-300'
                  : 'text-gray-400'
              }`}
            >
              Sempre 2 giocatori
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              handleInputChange('participantType', PARTICIPANT_TYPE.TEAMS);
              if (formData.playersPerTeam === 2) {
                handleInputChange('playersPerTeam', 4); // Default per squadre
              }
            }}
            className={`p-4 sm:p-5 rounded-lg border-2 transition-all transform hover:scale-105 ${
              formData.participantType === PARTICIPANT_TYPE.TEAMS
                ? 'border-primary-500 bg-gradient-to-br from-primary-600/40 to-primary-700/30 text-white ring-4 ring-primary-500/30 shadow-lg shadow-primary-500/20'
                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-primary-400/50 hover:bg-gray-700'
            }`}
          >
            <div
              className={`font-bold text-base sm:text-lg ${
                formData.participantType === PARTICIPANT_TYPE.TEAMS
                  ? 'text-primary-200'
                  : 'text-gray-200'
              }`}
            >
              Squadre
            </div>
            <div
              className={`text-xs sm:text-sm mt-1 ${
                formData.participantType === PARTICIPANT_TYPE.TEAMS
                  ? 'text-primary-300'
                  : 'text-gray-400'
              }`}
            >
              2-8 giocatori per squadra
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              handleInputChange('participantType', PARTICIPANT_TYPE.MATCHES_ONLY);
              handleInputChange('format', TOURNAMENT_FORMAT.MATCHES_ONLY);
              if (formData.playersPerTeam === 2) {
                handleInputChange('playersPerTeam', 4); // Default per Solo Partite
              }
            }}
            className={`p-4 sm:p-5 rounded-lg border-2 transition-all transform hover:scale-105 ${
              formData.participantType === PARTICIPANT_TYPE.MATCHES_ONLY
                ? 'border-primary-500 bg-gradient-to-br from-primary-600/40 to-primary-700/30 text-white ring-4 ring-primary-500/30 shadow-lg shadow-primary-500/20'
                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-primary-400/50 hover:bg-gray-700'
            }`}
          >
            <div
              className={`font-bold text-base sm:text-lg ${
                formData.participantType === PARTICIPANT_TYPE.MATCHES_ONLY
                  ? 'text-primary-200'
                  : 'text-gray-200'
              }`}
            >
              Solo Partite
            </div>
            <div
              className={`text-xs sm:text-sm mt-1 ${
                formData.participantType === PARTICIPANT_TYPE.MATCHES_ONLY
                  ? 'text-primary-300'
                  : 'text-gray-400'
              }`}
            >
              Squadre 2-8 giocatori
            </div>
          </button>
        </div>

        {/* Selettore numero giocatori - mostrato solo per Squadre e Solo Partite */}
        {(formData.participantType === PARTICIPANT_TYPE.TEAMS ||
          formData.participantType === PARTICIPANT_TYPE.MATCHES_ONLY) && (
          <div className="mt-4 p-3 sm:p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <div className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
              Numero di giocatori per squadra
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleInputChange('playersPerTeam', num)}
                  className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg border-2 transition-all text-sm sm:text-base font-semibold ${
                    formData.playersPerTeam === num
                      ? 'border-primary-500 bg-primary-600 text-white shadow-lg'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-primary-400 hover:bg-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] sm:text-xs text-gray-400">
              Seleziona il numero di giocatori che compongono ogni squadra (da 2 a 8)
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderConfigurationStep = () => {
    // Se è "Solo Partite", non servono gironi/knockout
    if (formData.participantType === PARTICIPANT_TYPE.MATCHES_ONLY) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-900/20 border border-blue-800 p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-blue-200 mb-2">Modalità Solo Partite</h3>
            <p className="text-sm text-blue-300">
              Hai selezionato la modalità &quot;Solo Partite&quot;. In questa modalità potrai:
            </p>
            <ul className="mt-4 text-sm text-blue-300 space-y-2 text-left max-w-md mx-auto">
              <li>• Aggiungere squadre manualmente</li>
              <li>• Creare partite senza gironi o tabelloni</li>
              <li>• Gestire liberamente le partite dell&apos;evento</li>
            </ul>
            <p className="mt-4 text-xs text-gray-400">
              Non è necessaria alcuna configurazione di gironi o fase eliminazione.
            </p>
          </div>
        </div>
      );
    }

    // Configurazione normale per tornei con gironi
    return (
      <div className="space-y-6">
        <div>
          <div className="block text-sm font-medium text-gray-300 mb-2">Numero di Gironi</div>
          <input
            type="number"
            min="2"
            max="8"
            value={formData.numberOfGroups}
            onChange={(e) => handleInputChange('numberOfGroups', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <div className="block text-sm font-medium text-gray-300 mb-2">Squadre per Girone</div>
          <input
            type="number"
            min="3"
            max="8"
            value={formData.teamsPerGroup}
            onChange={(e) => handleInputChange('teamsPerGroup', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <div className="block text-sm font-medium text-gray-300 mb-2">Qualificati per Girone</div>
          <input
            type="number"
            min="1"
            max={formData.teamsPerGroup}
            value={formData.qualifiedPerGroup}
            onChange={(e) => handleInputChange('qualifiedPerGroup', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
          <div className="text-sm text-blue-200">
            <strong>Riepilogo:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Totale squadre: {formData.numberOfGroups * formData.teamsPerGroup}</li>
              <li>• Squadre qualificate: {formData.numberOfGroups * formData.qualifiedPerGroup}</li>
              <li>
                • Partite fase gironi:{' '}
                {(formData.numberOfGroups *
                  (formData.teamsPerGroup * (formData.teamsPerGroup - 1))) /
                  2}
              </li>
              {(() => {
                const totalQualified = formData.numberOfGroups * formData.qualifiedPerGroup;
                const isPow2 = totalQualified > 0 && (totalQualified & (totalQualified - 1)) === 0;
                if (!isPow2 && totalQualified > 0) {
                  const nextPow2 = 1 << Math.ceil(Math.log2(Math.max(2, totalQualified)));
                  const byes = nextPow2 - totalQualified;
                  return (
                    <li>
                      • Knockout: verranno aggiunti automaticamente {byes} BYE per arrivare a{' '}
                      {nextPow2} squadre
                    </li>
                  );
                }
                return null;
              })()}
            </ul>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.includeThirdPlaceMatch}
            onChange={(e) => handleInputChange('includeThirdPlaceMatch', e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded border-gray-600"
          />
          <div className="ml-2 text-sm text-gray-300">Includi finale 3°/4° posto</div>
        </div>

        {/* Default ranking for non-participants */}
        <div>
          <div className="block text-sm font-medium text-gray-300 mb-2">
            Ranking predefinito per non partecipanti
          </div>
          <input
            type="number"
            min="500"
            max="3000"
            step="50"
            value={formData.defaultRankingForNonParticipants}
            onChange={(e) =>
              handleInputChange(
                'defaultRankingForNonParticipants',
                parseInt(e.target.value) || 1500
              )
            }
            className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Valore utilizzato per i giocatori del circolo che non partecipano al campionato quando
            vengono selezionati nelle squadre.
          </p>
        </div>

        {/* Punti campionato (config) */}
        <div className="rounded-lg border border-gray-700 p-3 sm:p-4 bg-gray-800">
          <div className="font-semibold text-sm sm:text-base text-gray-100 mb-3">
            Punti Campionato (bozza)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Moltiplicatore RPA
              </div>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.championshipPoints.rpaMultiplier}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    championshipPoints: {
                      ...prev.championshipPoints,
                      rpaMultiplier: Number(e.target.value) || 0,
                    },
                  }))
                }
                className="w-full px-3 sm:px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm sm:text-base focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-[10px] sm:text-xs text-gray-400">
                Somma dei delta RPA per ogni partita (vittorie +, sconfitte −) × moltiplicatore
              </p>
            </div>

            <div>
              <div className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Punti piazzamento girone
              </div>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {[1, 2, 3, 4].map((pos) => (
                  <div key={pos} className="flex flex-col">
                    <span className="text-[10px] sm:text-xs text-gray-400">{pos}°</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.championshipPoints.groupPlacementPoints[pos] || 0}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          championshipPoints: {
                            ...prev.championshipPoints,
                            groupPlacementPoints: {
                              ...prev.championshipPoints.groupPlacementPoints,
                              [pos]: Number(e.target.value) || 0,
                            },
                          },
                        }))
                      }
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm sm:text-base"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-4">
            <div className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Punti avanzamento Eliminazione Diretta (per vittoria)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2">
              {[
                { key: 'round_of_16', label: 'Ottavi' },
                { key: 'quarter_finals', label: 'Quarti' },
                { key: 'semi_finals', label: 'Semifinali' },
                { key: 'finals', label: 'Finale' },
                { key: 'third_place', label: '3°/4°' },
              ].map((r) => (
                <div key={r.key} className="flex flex-col">
                  <span className="text-[10px] sm:text-xs text-gray-400">{r.label}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.championshipPoints.knockoutProgressPoints[r.key] || 0}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        championshipPoints: {
                          ...prev.championshipPoints,
                          knockoutProgressPoints: {
                            ...prev.championshipPoints.knockoutProgressPoints,
                            [r.key]: Number(e.target.value) || 0,
                          },
                        },
                      }))
                    }
                    className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm sm:text-base"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPointsSystemStep = () => (
    <div className="space-y-6">
      <div>
        <div className="block text-sm font-medium text-gray-300 mb-4">Seleziona Sistema Punti</div>
        <div className="grid grid-cols-1 gap-4">
          <button
            type="button"
            onClick={() => handleInputChange('pointsSystem', { ...DEFAULT_STANDARD_POINTS })}
            className={`p-6 rounded-lg border-2 text-left transition-colors ${
              formData.pointsSystem.type === POINTS_SYSTEM_TYPE.STANDARD
                ? 'border-primary-500 bg-primary-900/30 text-gray-100'
                : 'border-gray-600 bg-gray-700 text-gray-100 hover:border-gray-500'
            }`}
          >
            <div className="font-semibold text-lg mb-2">Sistema Standard</div>
            <div className="text-sm text-gray-400 mb-3">
              Punti fissi per vittoria/pareggio/sconfitta
            </div>
            <div className="text-sm space-y-1">
              <div>• Vittoria: 3 punti</div>
              <div>• Pareggio: 1 punto</div>
              <div>• Sconfitta: 0 punti</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleInputChange('pointsSystem', { ...DEFAULT_TIE_BREAK_POINTS })}
            className={`p-6 rounded-lg border-2 text-left transition-colors ${
              formData.pointsSystem.type === POINTS_SYSTEM_TYPE.TIE_BREAK
                ? 'border-primary-500 bg-primary-900/30 text-gray-100'
                : 'border-gray-600 bg-gray-700 text-gray-100 hover:border-gray-500'
            }`}
          >
            <div className="font-semibold text-lg mb-2">Sistema Tie Break</div>
            <div className="text-sm text-gray-400 mb-3">
              Punti differenziati per vittoria al tie-break
            </div>
            <div className="text-sm space-y-1">
              <div>• Vittoria: 3 punti</div>
              <div>• Vittoria al Tie Break: 2 punti</div>
              <div>• Sconfitta al Tie Break: 1 punto</div>
              <div>• Sconfitta: 0 punti</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderRegistrationStep = () => (
    <div className="space-y-6">
      <div>
        <div className="block text-sm font-medium text-gray-300 mb-2">Data Apertura Iscrizioni</div>
        <input
          type="datetime-local"
          value={formData.registrationOpensAt || ''}
          onChange={(e) => handleInputChange('registrationOpensAt', e.target.value)}
          className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <div className="block text-sm font-medium text-gray-300 mb-2">Data Chiusura Iscrizioni</div>
        <input
          type="datetime-local"
          value={formData.registrationClosesAt || ''}
          onChange={(e) => handleInputChange('registrationClosesAt', e.target.value)}
          className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-yellow-900/20 border border-yellow-800 p-4 rounded-lg">
        <div className="text-sm text-yellow-200">
          <strong>Nota:</strong> Le date sono opzionali. Se non specificate, potrai aprire e
          chiudere le iscrizioni manualmente.
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4 text-white">Riepilogo Torneo</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Nome:</span>
            <span className="font-medium text-white">{formData.name}</span>
          </div>

          {formData.description && (
            <div className="flex justify-between">
              <span className="text-gray-400">Descrizione:</span>
              <span className="font-medium text-white">
                {formData.description.substring(0, 50)}...
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-400">Partecipanti:</span>
            <span className="font-medium text-white">
              {formData.participantType === PARTICIPANT_TYPE.COUPLES ? 'Coppie' : 'Squadre'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Gironi:</span>
            <span className="font-medium text-white">{formData.numberOfGroups}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Squadre per girone:</span>
            <span className="font-medium text-white">{formData.teamsPerGroup}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Qualificati per girone:</span>
            <span className="font-medium text-white">{formData.qualifiedPerGroup}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Sistema punti:</span>
            <span className="font-medium text-white">
              {formData.pointsSystem.type === POINTS_SYSTEM_TYPE.STANDARD
                ? 'Standard'
                : formData.pointsSystem.type === POINTS_SYSTEM_TYPE.TIE_BREAK
                  ? 'Tie Break'
                  : 'Ranking-Based'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Totale squadre:</span>
            <span className="font-medium text-white">
              {formData.numberOfGroups * formData.teamsPerGroup}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Ranking default non partecipanti:</span>
            <span className="font-medium text-white">
              {formData.defaultRankingForNonParticipants}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold text-white mb-2">Punti Campionato</div>
            <div className="text-xs text-gray-400">
              RPA×{formData.championshipPoints.rpaMultiplier} • Piazzamento girone: 1°{' '}
              {formData.championshipPoints.groupPlacementPoints[1]} / 2°{' '}
              {formData.championshipPoints.groupPlacementPoints[2]} • KO: Finale{' '}
              {formData.championshipPoints.knockoutProgressPoints.finals}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-900/20 border border-green-800 p-4 rounded-lg">
        <div className="text-sm text-green-200">
          <strong>✓ Pronto!</strong> Il torneo verrà creato in stato &quot;Bozza&quot;. Potrai
          aprire le iscrizioni quando sei pronto.
        </div>
      </div>
    </div>
  );

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-end sm:items-center justify-center"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
      role="presentation"
      tabIndex={-1}
    >
      <div
        className="relative bg-gradient-to-b from-gray-900 to-gray-800 w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Compact Mobile Header */}
        <div className="sticky top-0 z-30 bg-gradient-to-b from-gray-900 via-gray-900 to-transparent border-b border-gray-700/50 backdrop-blur-md">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-600/20 text-primary-400 font-bold text-sm sm:text-base">
                {currentStep}
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-white leading-tight">
                  {STEPS[currentStep - 1].name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                  {STEPS[currentStep - 1].description}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-3 sm:px-6">
            <div className="flex gap-1 sm:gap-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className="flex-1 h-1 sm:h-1.5 rounded-full overflow-hidden bg-gray-700/50"
                >
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      step.id < currentStep
                        ? 'bg-green-500 w-full'
                        : step.id === currentStep
                          ? 'bg-primary-500 w-full'
                          : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1.5 px-1">
              {STEPS.map((step) => (
                <span
                  key={step.id}
                  className={`text-[10px] sm:text-xs font-medium transition-colors ${
                    step.id <= currentStep ? 'text-primary-400' : 'text-gray-600'
                  }`}
                >
                  {step.id}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area with integrated buttons */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6 pb-[calc(env(safe-area-inset-bottom)+120px)]">
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {creationProgress && (
            <div className="mb-6 p-4 sm:p-5 bg-blue-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <div className="text-sm sm:text-base font-semibold text-blue-100 mb-1">
                    {creationProgress.message}
                  </div>
                  <div className="text-xs text-blue-300">
                    Step {creationProgress.current} di {creationProgress.total}
                  </div>
                </div>
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-400 border-t-transparent" />
              </div>
              <div className="w-full bg-blue-900/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all duration-300 ease-out"
                  style={{
                    width: `${(creationProgress.current / creationProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {!creationProgress && renderStep()}

          {/* Integrated Action Buttons - now part of scrollable content */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleBack}
                disabled={currentStep === 1 || creationProgress}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-gray-700/50 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Indietro</span>
              </button>

              <button
                onClick={onCancel}
                disabled={creationProgress}
                className="px-4 py-2.5 rounded-xl font-medium text-sm bg-gray-700/50 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                Annulla
              </button>

              {currentStep < STEPS.length ? (
                <button
                  onClick={handleNext}
                  disabled={creationProgress}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100"
                >
                  <span>Avanti</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || creationProgress}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100"
                >
                  {loading || creationProgress ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Creazione...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Crea Torneo</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TournamentWizard;
