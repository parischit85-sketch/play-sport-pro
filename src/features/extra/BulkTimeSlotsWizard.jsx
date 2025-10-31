// =============================================
// FILE: src/features/extra/BulkTimeSlotsWizard.jsx
// Bulk Time Slots Creation Wizard
// =============================================
import React, { useState, useMemo } from 'react';

// ============================================
// COMPONENTE: Bulk Time Slots Wizard Modal
// ============================================
export function BulkTimeSlotsWizard({
  isOpen,
  onClose,
  onApply,
  courts = [],
  selectedCourtIndices = [],
  T,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    // Step 1: Pattern
    pattern: 'hourly', // 'hourly' | 'halfHourly' | 'custom'
    customInterval: 60,

    // Step 2: Time Range
    startTime: '08:00',
    endTime: '22:00',

    // Step 3: Days
    selectedDays: [1, 2, 3, 4, 5], // Mon-Fri default

    // Step 4: Pricing
    basePrice: 25,
    pricingStrategy: 'uniform', // 'uniform' | 'peakOffPeak' | 'custom'
    peakPrice: 30,
    offPeakPrice: 20,
    peakHours: { start: '18:00', end: '22:00' },

    // Step 5: Settings
    slotLabel: 'Fascia oraria',
    autoNumber: true,
    isPromo: false,
  });

  const [previewSlots, setPreviewSlots] = useState([]);

  if (!isOpen) return null;

  const targetCourts =
    selectedCourtIndices.length > 0
      ? courts.filter((_, index) => selectedCourtIndices.includes(index))
      : courts;

  // Generate preview slots based on wizard data
  const generatePreviewSlots = () => {
    const slots = [];
    const {
      startTime,
      endTime,
      pattern,
      customInterval,
      selectedDays,
      basePrice,
      pricingStrategy,
      peakPrice,
      offPeakPrice,
      peakHours,
      slotLabel,
      autoNumber,
      isPromo,
    } = wizardData;

    // Parse times
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Determine interval
    let intervalMinutes;
    switch (pattern) {
      case 'hourly':
        intervalMinutes = 60;
        break;
      case 'halfHourly':
        intervalMinutes = 30;
        break;
      case 'custom':
        intervalMinutes = customInterval;
        break;
      default:
        intervalMinutes = 60;
    }

    // Generate time slots
    let slotIndex = 0;
    for (
      let currentMinutes = startMinutes;
      currentMinutes < endMinutes;
      currentMinutes += intervalMinutes
    ) {
      const slotEndMinutes = Math.min(currentMinutes + intervalMinutes, endMinutes);

      const fromHour = Math.floor(currentMinutes / 60);
      const fromMin = currentMinutes % 60;
      const toHour = Math.floor(slotEndMinutes / 60);
      const toMin = slotEndMinutes % 60;

      const from = `${String(fromHour).padStart(2, '0')}:${String(fromMin).padStart(2, '0')}`;
      const to = `${String(toHour).padStart(2, '0')}:${String(toMin).padStart(2, '0')}`;

      // Determine price based on strategy
      let price = basePrice;
      if (pricingStrategy === 'peakOffPeak') {
        const [peakStartHour, peakStartMin] = peakHours.start.split(':').map(Number);
        const [peakEndHour, peakEndMin] = peakHours.end.split(':').map(Number);
        const peakStartMinutes = peakStartHour * 60 + peakStartMin;
        const peakEndMinutes = peakEndHour * 60 + peakEndMin;

        if (currentMinutes >= peakStartMinutes && currentMinutes < peakEndMinutes) {
          price = peakPrice;
        } else {
          price = offPeakPrice;
        }
      }

      const label = autoNumber ? `${slotLabel} ${slotIndex + 1}` : slotLabel;

      slots.push({
        id: `bulk_${Date.now()}_${slotIndex}`,
        label,
        from,
        to,
        days: selectedDays,
        eurPerHour: price,
        isPromo,
      });

      slotIndex++;
    }

    return slots;
  };

  // Update preview when wizard data changes
  useMemo(() => {
    if (currentStep >= 4) {
      setPreviewSlots(generatePreviewSlots());
    }
  }, [wizardData, currentStep]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 3) {
        // Generate preview on reaching step 4
        setPreviewSlots(generatePreviewSlots());
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleApply = () => {
    const finalSlots = generatePreviewSlots();
    onApply(finalSlots, targetCourts);
    onClose();

    // Reset wizard
    setCurrentStep(1);
    setWizardData({
      pattern: 'hourly',
      customInterval: 60,
      startTime: '08:00',
      endTime: '22:00',
      selectedDays: [1, 2, 3, 4, 5],
      basePrice: 25,
      pricingStrategy: 'uniform',
      peakPrice: 30,
      offPeakPrice: 20,
      peakHours: { start: '18:00', end: '22:00' },
      slotLabel: 'Fascia oraria',
      autoNumber: true,
      isPromo: false,
    });
  };

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 from-purple-900/20 to-blue-900/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🪄 Creazione Fasce Orarie Automatica
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Step {currentStep} di 5 - {targetCourts.length}{' '}
                {targetCourts.length === 1 ? 'campo' : 'campi'} selezionati
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-300 text-3xl">
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {/* Step 1: Pattern Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                1️⃣ Seleziona il Pattern di Creazione
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setWizardData({ ...wizardData, pattern: 'hourly' })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    wizardData.pattern === 'hourly'
                      ? 'border-blue-500 bg-blue-50 bg-blue-900/20'
                      : 'border-gray-700 hover:border-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="text-4xl mb-3">🕐</div>
                  <div className="font-bold text-lg text-white mb-2">Ogni Ora</div>
                  <div className="text-sm text-gray-400">Fasce di 60 minuti</div>
                </button>

                <button
                  onClick={() => setWizardData({ ...wizardData, pattern: 'halfHourly' })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    wizardData.pattern === 'halfHourly'
                      ? 'border-blue-500 bg-blue-50 bg-blue-900/20'
                      : 'border-gray-700 hover:border-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="text-4xl mb-3">🕑</div>
                  <div className="font-bold text-lg text-white mb-2">Ogni 30 Minuti</div>
                  <div className="text-sm text-gray-400">Fasce di 30 minuti</div>
                </button>

                <button
                  onClick={() => setWizardData({ ...wizardData, pattern: 'custom' })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    wizardData.pattern === 'custom'
                      ? 'border-blue-500 bg-blue-50 bg-blue-900/20'
                      : 'border-gray-700 hover:border-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="text-4xl mb-3">⚙️</div>
                  <div className="font-bold text-lg text-white mb-2">Personalizzato</div>
                  <div className="text-sm text-gray-400">Intervallo custom</div>
                </button>
              </div>

              {wizardData.pattern === 'custom' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Intervallo (minuti)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    step="15"
                    value={wizardData.customInterval}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        customInterval: parseInt(e.target.value) || 60,
                      })
                    }
                    className={`${T.input} w-full`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Intervallo tra 15 e 240 minuti (multipli di 15)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Time Range */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">2️⃣ Imposta il Range Orario</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Orario Inizio
                  </label>
                  <input
                    type="time"
                    value={wizardData.startTime}
                    onChange={(e) => setWizardData({ ...wizardData, startTime: e.target.value })}
                    className={`${T.input} w-full`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Orario Fine
                  </label>
                  <input
                    type="time"
                    value={wizardData.endTime}
                    onChange={(e) => setWizardData({ ...wizardData, endTime: e.target.value })}
                    className={`${T.input} w-full`}
                  />
                </div>
              </div>

              <div className="bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-800 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-900 text-blue-300 mb-2">📊 Preview</h4>
                <div className="text-sm text-blue-800 text-blue-300">
                  <p>
                    • Range: {wizardData.startTime} - {wizardData.endTime}
                  </p>
                  <p>
                    • Durata:{' '}
                    {Math.floor(
                      (parseInt(wizardData.endTime.split(':')[0]) * 60 +
                        parseInt(wizardData.endTime.split(':')[1]) -
                        (parseInt(wizardData.startTime.split(':')[0]) * 60 +
                          parseInt(wizardData.startTime.split(':')[1]))) /
                        60
                    )}{' '}
                    ore e{' '}
                    {(parseInt(wizardData.endTime.split(':')[0]) * 60 +
                      parseInt(wizardData.endTime.split(':')[1]) -
                      (parseInt(wizardData.startTime.split(':')[0]) * 60 +
                        parseInt(wizardData.startTime.split(':')[1]))) %
                      60}{' '}
                    minuti
                  </p>
                  <p>
                    • Fasce previste: ~
                    {Math.floor(
                      (parseInt(wizardData.endTime.split(':')[0]) * 60 +
                        parseInt(wizardData.endTime.split(':')[1]) -
                        (parseInt(wizardData.startTime.split(':')[0]) * 60 +
                          parseInt(wizardData.startTime.split(':')[1]))) /
                        (wizardData.pattern === 'hourly'
                          ? 60
                          : wizardData.pattern === 'halfHourly'
                            ? 30
                            : wizardData.customInterval)
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Days Selection */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                3️⃣ Seleziona i Giorni della Settimana
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      if (wizardData.selectedDays.includes(day)) {
                        setWizardData({
                          ...wizardData,
                          selectedDays: wizardData.selectedDays.filter((d) => d !== day),
                        });
                      } else {
                        setWizardData({
                          ...wizardData,
                          selectedDays: [...wizardData.selectedDays, day].sort(),
                        });
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      wizardData.selectedDays.includes(day)
                        ? 'border-blue-500 bg-blue-50 bg-blue-900/20'
                        : 'border-gray-700 hover:border-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-bold text-white">{dayNames[day]}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setWizardData({ ...wizardData, selectedDays: [1, 2, 3, 4, 5] })}
                  className="px-4 py-2 bg-blue-900 text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-800"
                >
                  Lun-Ven
                </button>
                <button
                  onClick={() => setWizardData({ ...wizardData, selectedDays: [0, 6] })}
                  className="px-4 py-2 bg-purple-900 text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-800"
                >
                  Weekend
                </button>
                <button
                  onClick={() =>
                    setWizardData({ ...wizardData, selectedDays: [0, 1, 2, 3, 4, 5, 6] })
                  }
                  className="px-4 py-2 bg-green-900 text-green-300 rounded-lg text-sm font-medium hover:bg-green-800"
                >
                  Tutti
                </button>
              </div>

              {wizardData.selectedDays.length === 0 && (
                <div className="bg-yellow-50 bg-yellow-900/20 border border-yellow-200 border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 text-yellow-300">
                    ⚠️ Seleziona almeno un giorno
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">4️⃣ Configurazione Prezzi</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Strategia Prezzi
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setWizardData({ ...wizardData, pricingStrategy: 'uniform' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      wizardData.pricingStrategy === 'uniform'
                        ? 'border-blue-500 bg-blue-50 bg-blue-900/20'
                        : 'border-gray-700'
                    }`}
                  >
                    <div className="font-bold">💰 Uniforme</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Stesso prezzo per tutte le fasce
                    </div>
                  </button>

                  <button
                    onClick={() => setWizardData({ ...wizardData, pricingStrategy: 'peakOffPeak' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      wizardData.pricingStrategy === 'peakOffPeak'
                        ? 'border-blue-500 bg-blue-50 bg-blue-900/20'
                        : 'border-gray-700'
                    }`}
                  >
                    <div className="font-bold">📊 Peak/Off-Peak</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Prezzi diversi per fasce orarie
                    </div>
                  </button>

                  <button
                    onClick={() => setWizardData({ ...wizardData, pricingStrategy: 'custom' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      wizardData.pricingStrategy === 'custom'
                        ? 'border-blue-500 bg-blue-50 bg-blue-900/20'
                        : 'border-gray-700'
                    }`}
                    disabled
                  >
                    <div className="font-bold">⚙️ Custom</div>
                    <div className="text-xs text-gray-400 mt-1">(Prossimamente)</div>
                  </button>
                </div>
              </div>

              {wizardData.pricingStrategy === 'uniform' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prezzo (€/ora)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={wizardData.basePrice}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, basePrice: parseFloat(e.target.value) || 0 })
                    }
                    className={`${T.input} w-full`}
                  />
                </div>
              )}

              {wizardData.pricingStrategy === 'peakOffPeak' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prezzo Peak (€/ora)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={wizardData.peakPrice}
                        onChange={(e) =>
                          setWizardData({
                            ...wizardData,
                            peakPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className={`${T.input} w-full`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prezzo Off-Peak (€/ora)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={wizardData.offPeakPrice}
                        onChange={(e) =>
                          setWizardData({
                            ...wizardData,
                            offPeakPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className={`${T.input} w-full`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Peak Inizio
                      </label>
                      <input
                        type="time"
                        value={wizardData.peakHours.start}
                        onChange={(e) =>
                          setWizardData({
                            ...wizardData,
                            peakHours: { ...wizardData.peakHours, start: e.target.value },
                          })
                        }
                        className={`${T.input} w-full`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Peak Fine
                      </label>
                      <input
                        type="time"
                        value={wizardData.peakHours.end}
                        onChange={(e) =>
                          setWizardData({
                            ...wizardData,
                            peakHours: { ...wizardData.peakHours, end: e.target.value },
                          })
                        }
                        className={`${T.input} w-full`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Preview & Settings */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">5️⃣ Anteprima e Conferma</h3>

              {/* Settings */}
              <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Etichetta Fasce
                  </label>
                  <input
                    type="text"
                    value={wizardData.slotLabel}
                    onChange={(e) => setWizardData({ ...wizardData, slotLabel: e.target.value })}
                    className={`${T.input} w-full`}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoNumber"
                    checked={wizardData.autoNumber}
                    onChange={(e) => setWizardData({ ...wizardData, autoNumber: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="autoNumber" className="text-sm text-gray-300">
                    Numerazione automatica
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPromo"
                    checked={wizardData.isPromo}
                    onChange={(e) => setWizardData({ ...wizardData, isPromo: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="isPromo" className="text-sm text-gray-300">
                    Marca come promozione
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div>
                <h4 className="font-semibold text-white mb-3">
                  📋 Anteprima Fasce ({previewSlots.length})
                </h4>
                <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {previewSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="text-sm bg-gray-800 p-3 rounded border border-gray-700"
                      >
                        <div className="font-semibold text-white">{slot.label}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          ⏰ {slot.from} - {slot.to} | 💰 €{slot.eurPerHour}/h
                          {slot.isPromo && <span className="ml-2 text-orange-600">🎁</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 text-blue-300 mb-2">📊 Riepilogo</h4>
                <div className="text-sm text-blue-800 text-blue-300 space-y-1">
                  <p>• Campi interessati: {targetCourts.length}</p>
                  <p>• Fasce totali create: {previewSlots.length}</p>
                  <p>• Fasce per campo: {previewSlots.length}</p>
                  <p>• Totale fasce: {previewSlots.length * targetCourts.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900">
          <div className="flex gap-3 justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
              }`}
            >
              ← Indietro
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-gray-700 font-medium transition-colors"
              >
                Annulla
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={currentStep === 3 && wizardData.selectedDays.length === 0}
                  className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                    currentStep === 3 && wizardData.selectedDays.length === 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Avanti →
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                >
                  ✓ Applica Fasce
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkTimeSlotsWizard;
