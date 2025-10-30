// =============================================
// FILE: src/features/profile/ClubScheduleRates.jsx
// COMPONENTE PER ORARI E TARIFFE DEL CLUB
// =============================================
import React, { useState, useEffect } from 'react';
import Section from '@ui/Section.jsx';
import { useClubSettings } from '@hooks/useClubSettings.js';

export default function ClubScheduleRates({ T, clubId }) {
  const { clubSettings, loading } = useClubSettings(clubId);
  const [scheduleData, setScheduleData] = useState({
    weekdayHours: '08:00 - 22:00',
    weekendHours: '09:00 - 23:00',
    peakHours: '18:00 - 21:00',
    rates: {
      weekdayMorning: 25,
      weekdayEvening: 35,
      weekend: 40,
      peak: 45,
    },
    seasonalRates: {
      summer: { multiplier: 1.2, months: 'Giu-Ago' },
      winter: { multiplier: 0.9, months: 'Dic-Feb' },
    },
  });

  useEffect(() => {
    if (clubSettings?.bookingConfig) {
      // Aggiorna i dati con quelli reali dal club settings
      const config = clubSettings.bookingConfig;
      if (config.pricing) {
        setScheduleData((prev) => ({
          ...prev,
          rates: {
            weekdayMorning: config.pricing.baseRate || 25,
            weekdayEvening: (config.pricing.baseRate || 25) * 1.2,
            weekend: (config.pricing.baseRate || 25) * 1.4,
            peak: (config.pricing.baseRate || 25) * 1.6,
          },
        }));
      }
    }
  }, [clubSettings]);

  if (loading) {
    return (
      <Section title="⏰ Orari e Tariffe" T={T}>
        <div className="bg-white/80 bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 border-gray-700/20 p-6 shadow-2xl">
          <div className="text-center py-8">Caricamento orari e tariffe...</div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="⏰ Orari e Tariffe" T={T}>
      <div className="bg-white/80 bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 border-gray-700/20 p-6 shadow-2xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Orari di Apertura */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 text-white flex items-center gap-3">
              <span className="text-2xl">🕐</span>
              Orari di Apertura
            </h3>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 from-blue-900/30 to-indigo-900/30 rounded-2xl p-4 border border-blue-200/30 border-blue-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-white">
                      Lunedì - Venerdì
                    </h4>
                    <p className="text-sm text-gray-600 text-gray-400">Giorni feriali</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 text-blue-400">
                      {scheduleData.weekdayHours}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 from-green-900/30 to-emerald-900/30 rounded-2xl p-4 border border-green-200/30 border-green-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-white">
                      Sabato - Domenica
                    </h4>
                    <p className="text-sm text-gray-600 text-gray-400">Weekend</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 text-green-400">
                      {scheduleData.weekendHours}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 from-amber-900/30 to-orange-900/30 rounded-2xl p-4 border border-amber-200/30 border-amber-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-white">Orari di Punta</h4>
                    <p className="text-sm text-gray-600 text-gray-400">Maggiore richiesta</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-600 text-amber-400">
                      {scheduleData.peakHours}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tariffe */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 text-white flex items-center gap-3">
              <span className="text-2xl">💰</span>
              Tariffe per Ora
            </h3>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 from-gray-900/30 to-slate-900/30 rounded-2xl p-4 border border-gray-200/30 border-gray-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-white">Feriali Mattina</h4>
                    <p className="text-sm text-gray-600 text-gray-400">08:00 - 17:00</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-600 text-gray-400">
                      €{scheduleData.rates.weekdayMorning}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 from-purple-900/30 to-violet-900/30 rounded-2xl p-4 border border-purple-200/30 border-purple-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-white">Feriali Sera</h4>
                    <p className="text-sm text-gray-600 text-gray-400">17:00 - 22:00</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600 text-purple-400">
                      €{scheduleData.rates.weekdayEvening}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 from-green-900/30 to-emerald-900/30 rounded-2xl p-4 border border-green-200/30 border-green-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-white">Weekend</h4>
                    <p className="text-sm text-gray-600 text-gray-400">Tutto il giorno</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 text-green-400">
                      €{scheduleData.rates.weekend}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-rose-50 from-red-900/30 to-rose-900/30 rounded-2xl p-4 border border-red-200/30 border-red-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-white">Orari di Punta</h4>
                    <p className="text-sm text-gray-600 text-gray-400">18:00 - 21:00</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600 text-red-400">
                      €{scheduleData.rates.peak}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tariffe Stagionali */}
        <div className="mt-8 pt-6 border-t border-white/20 border-gray-600/20">
          <h3 className="text-lg font-bold text-gray-900 text-white mb-4 flex items-center gap-3">
            <span className="text-xl">📅</span>
            Variazioni Stagionali
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 from-orange-900/30 to-red-900/30 rounded-xl p-4 border border-orange-200/30 border-orange-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 text-white">Estate</h4>
                  <p className="text-sm text-gray-600 text-gray-400">
                    {scheduleData.seasonalRates.summer.months}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-orange-600 text-orange-400">
                    +{((scheduleData.seasonalRates.summer.multiplier - 1) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600 text-gray-400">Alta stagione</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 from-blue-900/30 to-cyan-900/30 rounded-xl p-4 border border-blue-200/30 border-blue-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 text-white">Inverno</h4>
                  <p className="text-sm text-gray-600 text-gray-400">
                    {scheduleData.seasonalRates.winter.months}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 text-blue-400">
                    {((scheduleData.seasonalRates.winter.multiplier - 1) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600 text-gray-400">Bassa stagione</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Servizi Aggiuntivi */}
        <div className="mt-8 pt-6 border-t border-white/20 border-gray-600/20">
          <h3 className="text-lg font-bold text-gray-900 text-white mb-4 flex items-center gap-3">
            <span className="text-xl">⚡</span>
            Servizi Aggiuntivi
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center bg-gradient-to-br from-yellow-50 to-amber-50 from-yellow-900/30 to-amber-900/30 rounded-xl p-4 border border-yellow-200/30 border-yellow-700/30">
              <div className="text-2xl mb-2">💡</div>
              <div className="font-semibold text-gray-900 text-white">Illuminazione</div>
              <div className="text-sm text-amber-600 text-amber-400">
                +€{clubSettings?.bookingConfig?.addons?.lighting?.price || 5}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-red-50 to-orange-50 from-red-900/30 to-orange-900/30 rounded-xl p-4 border border-red-200/30 border-red-700/30">
              <div className="text-2xl mb-2">🔥</div>
              <div className="font-semibold text-gray-900 text-white">Riscaldamento</div>
              <div className="text-sm text-red-600 text-red-400">
                +€{clubSettings?.bookingConfig?.addons?.heating?.price || 8}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-200/30 border-green-700/30">
              <div className="text-2xl mb-2">🎾</div>
              <div className="font-semibold text-gray-900 text-white">Racchette</div>
              <div className="text-sm text-green-600 text-green-400">+€3/cad</div>
            </div>

            <div className="text-center bg-gradient-to-br from-purple-50 to-violet-50 from-purple-900/30 to-violet-900/30 rounded-xl p-4 border border-purple-200/30 border-purple-700/30">
              <div className="text-2xl mb-2">👨‍🏫</div>
              <div className="font-semibold text-gray-900 text-white">Istruttore</div>
              <div className="text-sm text-purple-600 text-purple-400">+€30/h</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

