// =============================================
// FILE: src/features/extra/SmartSuggestionsPanel.jsx
// Smart Suggestions - Analytics & Recommendations
// =============================================
import React, { useState, useMemo, useEffect } from 'react';

// ============================================
// ANALYTICS UTILITIES
// ============================================

/**
 * Analizza le prenotazioni per identificare pattern
 */
function analyzeBookingPatterns(bookings = []) {
  if (!bookings || bookings.length === 0) {
    return {
      totalBookings: 0,
      byDay: {},
      byHour: {},
      byCourtType: {},
      peakHours: [],
      offPeakHours: [],
      averagePrice: 0,
      totalRevenue: 0,
    };
  }

  const byDay = {};
  const byHour = {};
  const byCourtType = {};
  let totalRevenue = 0;
  let priceSum = 0;
  let priceCount = 0;

  bookings.forEach((booking) => {
    // Analisi per giorno
    if (booking.day !== undefined) {
      byDay[booking.day] = (byDay[booking.day] || 0) + 1;
    }

    // Analisi per ora (estrai ora da timeSlot.from)
    if (booking.timeSlot?.from) {
      const hour = parseInt(booking.timeSlot.from.split(':')[0]);
      byHour[hour] = (byHour[hour] || 0) + 1;
    }

    // Analisi per tipo campo
    if (booking.courtType) {
      byCourtType[booking.courtType] = (byCourtType[booking.courtType] || 0) + 1;
    }

    // Revenue
    if (booking.price) {
      totalRevenue += booking.price;
      priceSum += booking.price;
      priceCount++;
    }
  });

  // Identifica peak hours (top 25% ore con più prenotazioni)
  const hourEntries = Object.entries(byHour).map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
  }));
  hourEntries.sort((a, b) => b.count - a.count);
  const peakThreshold = hourEntries[0]?.count * 0.75 || 0;
  const peakHours = hourEntries.filter((h) => h.count >= peakThreshold).map((h) => h.hour);
  const offPeakHours = hourEntries
    .filter((h) => h.count < peakThreshold)
    .map((h) => h.hour)
    .slice(0, 5);

  return {
    totalBookings: bookings.length,
    byDay,
    byHour,
    byCourtType,
    peakHours,
    offPeakHours,
    averagePrice: priceCount > 0 ? priceSum / priceCount : 0,
    totalRevenue,
  };
}

/**
 * Genera suggerimenti basati sull'analisi
 */
function generateSuggestions(analytics, courts = []) {
  const suggestions = [];

  // Suggerimento 1: Pricing dinamico per peak hours
  if (analytics.peakHours.length > 0) {
    const peakHoursStr = analytics.peakHours
      .sort((a, b) => a - b)
      .map((h) => `${h}:00`)
      .join(', ');
    suggestions.push({
      id: 'peak-pricing',
      type: 'pricing',
      priority: 'high',
      title: 'Aumenta prezzi nelle ore di punta',
      description: `Le ore ${peakHoursStr} hanno alta domanda. Considera di aumentare i prezzi del 20-30%.`,
      action: 'apply-peak-pricing',
      data: { peakHours: analytics.peakHours, suggestedIncrease: 1.25 },
      icon: '💰',
    });
  }

  // Suggerimento 2: Promozioni per off-peak
  if (analytics.offPeakHours.length > 0) {
    const offPeakHoursStr = analytics.offPeakHours
      .sort((a, b) => a - b)
      .map((h) => `${h}:00`)
      .join(', ');
    suggestions.push({
      id: 'offpeak-promo',
      type: 'promotion',
      priority: 'medium',
      title: 'Promozioni per orari meno richiesti',
      description: `Le ore ${offPeakHoursStr} hanno bassa occupazione. Applica uno sconto del 15-20% per incentivare le prenotazioni.`,
      action: 'apply-offpeak-discount',
      data: { offPeakHours: analytics.offPeakHours, suggestedDiscount: 0.85 },
      icon: '🎁',
    });
  }

  // Suggerimento 3: Giorni più popolari
  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const topDays = Object.entries(analytics.byDay)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => dayNames[parseInt(day)]);

  if (topDays.length > 0) {
    suggestions.push({
      id: 'popular-days',
      type: 'insight',
      priority: 'low',
      title: `Giorni più popolari: ${topDays.join(', ')}`,
      description: 'Considera di aggiungere più fasce orarie o campi in questi giorni.',
      action: 'view-details',
      data: { topDays, dayStats: analytics.byDay },
      icon: '📊',
    });
  }

  // Suggerimento 4: Tipo campo più richiesto
  const topCourtType = Object.entries(analytics.byCourtType).sort((a, b) => b[1] - a[1])[0];
  if (topCourtType && courts.length > 0) {
    const [courtType, count] = topCourtType;
    const courtsOfType = courts.filter((c) => c.courtType === courtType).length;
    const totalCourts = courts.length;
    const percentage = ((courtsOfType / totalCourts) * 100).toFixed(0);

    if (courtsOfType < totalCourts * 0.5) {
      suggestions.push({
        id: 'court-type-demand',
        type: 'capacity',
        priority: 'high',
        title: `Alta domanda per campi ${courtType}`,
        description: `${count} prenotazioni per campi ${courtType}, ma solo ${percentage}% dei tuoi campi è di questo tipo. Considera di aggiungerne altri.`,
        action: 'add-court-type',
        data: { courtType, currentCount: courtsOfType, totalCourts },
        icon: '🎾',
      });
    }
  }

  // Suggerimento 5: Revenue optimization
  if (analytics.averagePrice > 0) {
    const lowPricedSlots = courts.reduce((acc, court) => {
      const lowSlots = (court.timeSlots || []).filter(
        (slot) => slot.eurPerHour < analytics.averagePrice * 0.8
      );
      return acc + lowSlots.length;
    }, 0);

    if (lowPricedSlots > 0) {
      suggestions.push({
        id: 'price-optimization',
        type: 'pricing',
        priority: 'medium',
        title: 'Opportunità di ottimizzazione prezzi',
        description: `${lowPricedSlots} fasce orarie hanno prezzi sotto la media di mercato (€${analytics.averagePrice.toFixed(2)}/h). Considera di aumentarli.`,
        action: 'optimize-pricing',
        data: { averagePrice: analytics.averagePrice, lowPricedCount: lowPricedSlots },
        icon: '📈',
      });
    }
  }

  return suggestions;
}

/**
 * Calcola occupancy rate per fascia oraria
 */
function calculateOccupancyHeatmap(bookings, courts, days = 7) {
  const heatmap = {};

  // Inizializza heatmap con tutte le fasce disponibili
  courts.forEach((court) => {
    (court.timeSlots || []).forEach((slot) => {
      const key = `${slot.from}-${slot.to}`;
      if (!heatmap[key]) {
        heatmap[key] = {
          timeRange: `${slot.from} - ${slot.to}`,
          totalCapacity: 0,
          bookings: 0,
          occupancyRate: 0,
        };
      }
      heatmap[key].totalCapacity += days; // Ogni fascia disponibile per N giorni
    });
  });

  // Conta le prenotazioni per fascia
  bookings.forEach((booking) => {
    if (booking.timeSlot?.from && booking.timeSlot?.to) {
      const key = `${booking.timeSlot.from}-${booking.timeSlot.to}`;
      if (heatmap[key]) {
        heatmap[key].bookings++;
      }
    }
  });

  // Calcola occupancy rate
  Object.values(heatmap).forEach((slot) => {
    if (slot.totalCapacity > 0) {
      slot.occupancyRate = (slot.bookings / slot.totalCapacity) * 100;
    }
  });

  return Object.values(heatmap).sort((a, b) => {
    const timeA = parseInt(a.timeRange.split(':')[0]);
    const timeB = parseInt(b.timeRange.split(':')[0]);
    return timeA - timeB;
  });
}

// ============================================
// COMPONENTE: Smart Suggestions Panel
// ============================================
export function SmartSuggestionsPanel({
  isOpen,
  onClose,
  courts = [],
  bookings = [],
  onApplySuggestion,
  T,
}) {
  const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions' | 'analytics' | 'heatmap'
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  // Analizza i dati
  const analytics = useMemo(() => analyzeBookingPatterns(bookings), [bookings]);
  const suggestions = useMemo(() => generateSuggestions(analytics, courts), [analytics, courts]);
  const heatmap = useMemo(() => calculateOccupancyHeatmap(bookings, courts, 7), [bookings, courts]);

  if (!isOpen) return null;

  // Colori per priority
  const priorityStyles = {
    high: 'bg-red-50 bg-red-900/20 border-red-200 border-red-800 text-red-800 text-red-300',
    medium:
      'bg-yellow-50 bg-yellow-900/20 border-yellow-200 border-yellow-800 text-yellow-800 text-yellow-300',
    low: 'bg-blue-50 bg-blue-900/20 border-blue-200 border-blue-800 text-blue-800 text-blue-300',
  };

  const priorityBadges = {
    high: 'bg-red-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-blue-500 text-white',
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 from-purple-900/20 to-blue-900/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-white flex items-center gap-2">
                🧠 Smart Suggestions
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Analisi intelligente basata su {analytics.totalBookings} prenotazioni
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:text-gray-300 text-3xl"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'suggestions'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💡 Suggerimenti ({suggestions.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'heatmap'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔥 Occupancy Heatmap
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab: Suggestions */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {suggestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-bold text-gray-900 text-white mb-2">
                    Nessun suggerimento disponibile
                  </h3>
                  <p className="text-gray-400">
                    Accumula più dati di prenotazione per ricevere suggerimenti intelligenti.
                  </p>
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`border-2 rounded-xl p-4 transition-all ${priorityStyles[suggestion.priority]} ${
                      selectedSuggestion?.id === suggestion.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-3xl">{suggestion.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{suggestion.title}</h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                priorityBadges[suggestion.priority]
                              }`}
                            >
                              {suggestion.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm mb-3">{suggestion.description}</p>

                          {/* Data details */}
                          {selectedSuggestion?.id === suggestion.id && (
                            <div className="mt-3 p-3 bg-white/50 bg-gray-900/50 rounded-lg text-xs">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(suggestion.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setSelectedSuggestion(
                              selectedSuggestion?.id === suggestion.id ? null : suggestion
                            )
                          }
                          className="px-3 py-1.5 bg-white bg-gray-700 text-gray-700 text-gray-300 rounded text-sm font-medium hover:bg-gray-100 hover:bg-gray-600 transition-colors"
                        >
                          {selectedSuggestion?.id === suggestion.id ? '▲ Nascondi' : '▼ Dettagli'}
                        </button>
                        {onApplySuggestion && (
                          <button
                            onClick={() => onApplySuggestion(suggestion)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                          >
                            ✓ Applica
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab: Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 bg-blue-900/20 border-2 border-blue-200 border-blue-800 rounded-xl p-4">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-2xl font-bold text-blue-900 text-blue-300">
                    {analytics.totalBookings}
                  </div>
                  <div className="text-sm text-blue-700 text-blue-400">Prenotazioni Totali</div>
                </div>
                <div className="bg-green-50 bg-green-900/20 border-2 border-green-200 border-green-800 rounded-xl p-4">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-green-900 text-green-300">
                    €{analytics.totalRevenue.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-700 text-green-400">Revenue Totale</div>
                </div>
                <div className="bg-purple-50 bg-purple-900/20 border-2 border-purple-200 border-purple-800 rounded-xl p-4">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-2xl font-bold text-purple-900 text-purple-300">
                    €{analytics.averagePrice.toFixed(2)}/h
                  </div>
                  <div className="text-sm text-purple-700 text-purple-400">Prezzo Medio</div>
                </div>
              </div>

              {/* Booking by Day */}
              <div className="bg-gray-50 bg-gray-900 rounded-xl p-4">
                <h3 className="font-bold text-lg mb-4 text-gray-900 text-white">
                  📅 Prenotazioni per Giorno
                </h3>
                <div className="space-y-2">
                  {[
                    'Domenica',
                    'Lunedì',
                    'Martedì',
                    'Mercoledì',
                    'Giovedì',
                    'Venerdì',
                    'Sabato',
                  ].map((day, index) => {
                    const count = analytics.byDay[index] || 0;
                    const maxCount = Math.max(...Object.values(analytics.byDay), 1);
                    const percentage = (count / maxCount) * 100;

                    return (
                      <div key={day} className="flex items-center gap-3">
                        <div className="w-24 text-sm font-medium text-gray-700 text-gray-300">
                          {day}
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full flex items-center justify-end px-2 transition-all"
                            style={{ width: `${percentage}%` }}
                          >
                            {count > 0 && (
                              <span className="text-xs font-bold text-white">{count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Booking by Hour */}
              <div className="bg-gray-50 bg-gray-900 rounded-xl p-4">
                <h3 className="font-bold text-lg mb-4 text-gray-900 text-white">
                  ⏰ Prenotazioni per Ora
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(analytics.byHour)
                    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                    .map(([hour, count]) => {
                      const isPeak = analytics.peakHours.includes(parseInt(hour));
                      return (
                        <div
                          key={hour}
                          className={`p-3 rounded-lg border-2 ${
                            isPeak
                              ? 'bg-orange-50 bg-orange-900/20 border-orange-300 border-orange-700'
                              : 'bg-white bg-gray-800 border-gray-200 border-gray-700'
                          }`}
                        >
                          <div className="text-lg font-bold text-gray-900 text-white">
                            {hour}:00
                          </div>
                          <div className="text-sm text-gray-400">{count} prenotazioni</div>
                          {isPeak && (
                            <div className="text-xs text-orange-600 text-orange-400 font-medium mt-1">
                              🔥 PEAK
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Heatmap */}
          {activeTab === 'heatmap' && (
            <div className="space-y-4">
              <div className="bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-800 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 text-blue-300 mb-2">
                  📊 Occupancy Heatmap (Ultimi 7 giorni)
                </h3>
                <p className="text-sm text-blue-800 text-blue-400">
                  Visualizza il tasso di occupazione per ogni fascia oraria. Verde = alta
                  occupazione, Rosso = bassa occupazione.
                </p>
              </div>

              <div className="space-y-2">
                {heatmap.map((slot, index) => {
                  const rate = slot.occupancyRate;
                  let colorClass = '';
                  if (rate >= 75) colorClass = 'bg-green-500';
                  else if (rate >= 50) colorClass = 'bg-yellow-500';
                  else if (rate >= 25) colorClass = 'bg-orange-500';
                  else colorClass = 'bg-red-500';

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-white bg-gray-800 p-3 rounded-lg border border-gray-200 border-gray-700"
                    >
                      <div className="w-32 font-medium text-gray-900 text-white">
                        {slot.timeRange}
                      </div>
                      <div className="flex-1 bg-gray-700 rounded-full h-8 overflow-hidden">
                        <div
                          className={`${colorClass} h-full flex items-center justify-center transition-all`}
                          style={{ width: `${rate}%` }}
                        >
                          {rate > 10 && (
                            <span className="text-xs font-bold text-white">{rate.toFixed(0)}%</span>
                          )}
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm text-gray-400">
                        {slot.bookings}/{slot.totalCapacity}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 border-gray-700 bg-gray-50 bg-gray-900">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              💡 Suggerimento: Usa questi dati per ottimizzare prezzi e disponibilità
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartSuggestionsPanel;
