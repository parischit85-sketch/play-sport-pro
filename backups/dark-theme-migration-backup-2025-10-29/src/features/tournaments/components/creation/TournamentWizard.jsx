/**
 * Tournament Wizard - Multi-step tournament creation form
 * Steps: 1) Basic Info, 2) Configuration, 3) Points System, 4) Registration, 5) Review
 */

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { createTournament } from '../../services/tournamentService';
import {
  PARTICIPANT_TYPE,
  DEFAULT_STANDARD_POINTS,
  DEFAULT_RANKING_BASED_POINTS,
  POINTS_SYSTEM_TYPE,
} from '../../utils/tournamentConstants';
import { validateTournamentName, validateGroupsConfig } from '../../utils/tournamentValidation';

const STEPS = [
  { id: 1, name: 'Informazioni Base', description: 'Nome e descrizione' },
  { id: 2, name: 'Configurazione', description: 'Gironi e qualificati' },
  { id: 3, name: 'Sistema Punti', description: 'Standard o ranking-based' },
  { id: 4, name: 'Iscrizioni', description: 'Date e limiti' },
  { id: 5, name: 'Riepilogo', description: 'Conferma e crea' },
];

function TournamentWizard({ clubId, onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creationProgress, setCreationProgress] = useState(null); // { current: 1, total: 8, message: 'Creazione torneo' }

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    participantType: PARTICIPANT_TYPE.COUPLES,
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nome Torneo *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Es: Torneo Estivo 2024"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descrizione
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descrizione del torneo..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo Partecipanti
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleInputChange('participantType', PARTICIPANT_TYPE.COUPLES)}
            className={`p-4 rounded-lg border-2 transition-colors ${
              formData.participantType === PARTICIPANT_TYPE.COUPLES
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="font-semibold">Coppie</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              2 giocatori per squadra
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleInputChange('participantType', PARTICIPANT_TYPE.TEAMS)}
            className={`p-4 rounded-lg border-2 transition-colors ${
              formData.participantType === PARTICIPANT_TYPE.TEAMS
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="font-semibold">Squadre</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              2-6 giocatori per squadra
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderConfigurationStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Numero di Gironi
        </label>
        <input
          type="number"
          min="2"
          max="8"
          value={formData.numberOfGroups}
          onChange={(e) => handleInputChange('numberOfGroups', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Squadre per Girone
        </label>
        <input
          type="number"
          min="3"
          max="8"
          value={formData.teamsPerGroup}
          onChange={(e) => handleInputChange('teamsPerGroup', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Qualificati per Girone
        </label>
        <input
          type="number"
          min="1"
          max={formData.teamsPerGroup}
          value={formData.qualifiedPerGroup}
          onChange={(e) => handleInputChange('qualifiedPerGroup', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <div className="text-sm text-blue-900 dark:text-blue-200">
          <strong>Riepilogo:</strong>
          <ul className="mt-2 space-y-1">
            <li>• Totale squadre: {formData.numberOfGroups * formData.teamsPerGroup}</li>
            <li>• Squadre qualificate: {formData.numberOfGroups * formData.qualifiedPerGroup}</li>
            <li>
              • Partite fase gironi:{' '}
              {(formData.numberOfGroups * (formData.teamsPerGroup * (formData.teamsPerGroup - 1))) /
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
          className="h-4 w-4 text-primary-600 rounded border-gray-300 dark:border-gray-600"
        />
        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Includi finale 3°/4° posto
        </label>
      </div>

      {/* Default ranking for non-participants */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ranking predefinito per non partecipanti
        </label>
        <input
          type="number"
          min="500"
          max="3000"
          step="50"
          value={formData.defaultRankingForNonParticipants}
          onChange={(e) =>
            handleInputChange('defaultRankingForNonParticipants', parseInt(e.target.value) || 1500)
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Valore utilizzato per i giocatori del circolo che non partecipano al campionato quando
          vengono selezionati nelle squadre.
        </p>
      </div>

      {/* Punti campionato (config) */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Punti Campionato (bozza)
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Moltiplicatore RPA
            </label>
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Somma dei delta RPA per ogni partita (vittorie +, sconfitte −) × moltiplicatore
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Punti piazzamento girone
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((pos) => (
                <div key={pos} className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{pos}°</span>
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
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Punti avanzamento Eliminazione Diretta (per vittoria)
          </label>
          <div className="grid md:grid-cols-5 gap-2">
            {[
              { key: 'round_of_16', label: 'Ottavi' },
              { key: 'quarter_finals', label: 'Quarti' },
              { key: 'semi_finals', label: 'Semifinali' },
              { key: 'finals', label: 'Finale' },
              { key: 'third_place', label: '3°/4°' },
            ].map((r) => (
              <div key={r.key} className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">{r.label}</span>
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
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPointsSystemStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Seleziona Sistema Punti
        </label>
        <div className="grid grid-cols-1 gap-4">
          <button
            type="button"
            onClick={() => handleInputChange('pointsSystem', { ...DEFAULT_STANDARD_POINTS })}
            className={`p-6 rounded-lg border-2 text-left transition-colors ${
              formData.pointsSystem.type === POINTS_SYSTEM_TYPE.STANDARD
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-gray-900 dark:text-gray-100'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="font-semibold text-lg mb-2">Sistema Standard</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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
            onClick={() => handleInputChange('pointsSystem', { ...DEFAULT_RANKING_BASED_POINTS })}
            className={`p-6 rounded-lg border-2 text-left transition-colors ${
              formData.pointsSystem.type === POINTS_SYSTEM_TYPE.RANKING_BASED
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-gray-900 dark:text-gray-100'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="font-semibold text-lg mb-2">Sistema Ranking-Based</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Punti variabili in base al ranking delle squadre
            </div>
            <div className="text-sm space-y-1">
              <div>• Vittoria attesa: 3 punti</div>
              <div>• Vittoria sorprendente: 4.5 punti (bonus 1.5x)</div>
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Data Apertura Iscrizioni
        </label>
        <input
          type="datetime-local"
          value={formData.registrationOpensAt || ''}
          onChange={(e) => handleInputChange('registrationOpensAt', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Data Chiusura Iscrizioni
        </label>
        <input
          type="datetime-local"
          value={formData.registrationClosesAt || ''}
          onChange={(e) => handleInputChange('registrationClosesAt', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
        <div className="text-sm text-yellow-900 dark:text-yellow-200">
          <strong>Nota:</strong> Le date sono opzionali. Se non specificate, potrai aprire e
          chiudere le iscrizioni manualmente.
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
          Riepilogo Torneo
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Nome:</span>
            <span className="font-medium text-gray-900 dark:text-white">{formData.name}</span>
          </div>

          {formData.description && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Descrizione:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formData.description.substring(0, 50)}...
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Partecipanti:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.participantType === PARTICIPANT_TYPE.COUPLES ? 'Coppie' : 'Squadre'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Gironi:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.numberOfGroups}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Squadre per girone:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.teamsPerGroup}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Qualificati per girone:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.qualifiedPerGroup}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Sistema punti:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.pointsSystem.type === POINTS_SYSTEM_TYPE.STANDARD
                ? 'Standard'
                : 'Ranking-Based'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Totale squadre:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.numberOfGroups * formData.teamsPerGroup}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Ranking default non partecipanti:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.defaultRankingForNonParticipants}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Punti Campionato
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              RPA×{formData.championshipPoints.rpaMultiplier} • Piazzamento girone: 1°{' '}
              {formData.championshipPoints.groupPlacementPoints[1]} / 2°{' '}
              {formData.championshipPoints.groupPlacementPoints[2]} • KO: Finale{' '}
              {formData.championshipPoints.knockoutProgressPoints.finals}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
        <div className="text-sm text-green-900 dark:text-green-200">
          <strong>✓ Pronto!</strong> Il torneo verrà creato in stato "Bozza". Potrai aprire le
          iscrizioni quando sei pronto.
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Crea Nuovo Torneo</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step.id < currentStep
                        ? 'bg-green-500 text-white'
                        : step.id === currentStep
                          ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <div className="text-xs text-center mt-2 max-w-[80px]">
                    <div
                      className={`font-medium ${
                        step.id === currentStep
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {step.name}
                    </div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mb-6 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {creationProgress && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {creationProgress.current} / {creationProgress.total} {creationProgress.message}
                  </div>
                  <div className="mt-2 w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                      style={{
                        width: `${(creationProgress.current / creationProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
              </div>
            </div>
          )}

          {!creationProgress && renderStep()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between bg-white dark:bg-gray-800">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || creationProgress}
            className="flex items-center gap-2 px-5 py-2.5 font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            Indietro
          </button>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={creationProgress}
              className="px-5 py-2.5 font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Annulla
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                disabled={creationProgress}
                className="flex items-center gap-2 px-6 py-2.5 font-semibold bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                Avanti
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || creationProgress}
                className="flex items-center gap-2 px-6 py-2.5 font-semibold bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                {loading || creationProgress ? 'Creazione...' : 'Crea Torneo'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TournamentWizard;
