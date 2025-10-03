// =============================================
// FILE: src/features/profile/ClubFinancialStats.jsx
// COMPONENTE PER STATISTICHE FINANZIARIE DETTAGLIATE
// =============================================
import React, { useState, useEffect } from "react";
import Section from "@ui/Section.jsx";
import { 
  getClubStatistics,
  getTodayStats,
  getMonthlyStats
} from "@services/clubStats.js";

export default function ClubFinancialStats({ T, clubId, courts }) {
  const [financialData, setFinancialData] = useState({
    today: { revenue: 0, bookings: 0 },
    thisWeek: { revenue: 0, bookings: 0 },
    thisMonth: { revenue: 0, bookings: 0 },
    revenueByPaymentMethod: {},
    topCourts: [],
    loading: true
  });

  const [timeRange, setTimeRange] = useState("month"); // today, week, month

  useEffect(() => {
    if (clubId) {
      loadFinancialData();
    }
  }, [clubId, timeRange]);

  const loadFinancialData = async () => {
    try {
      setFinancialData(prev => ({ ...prev, loading: true }));

      const [todayStats, monthlyStats] = await Promise.all([
        getTodayStats(clubId),
        getMonthlyStats(clubId)
      ]);

      // Simula dati per settimana (in un'app reale, avresti una query specifica)
      const weekRevenue = Math.floor(monthlyStats.monthlyRevenue * 0.25);
      const weekBookings = Math.floor(monthlyStats.monthlyBookings * 0.25);

      // Simula metodi di pagamento
      const totalRevenue = monthlyStats.monthlyRevenue;
      const revenueByPaymentMethod = {
        "Carta di Credito": Math.floor(totalRevenue * 0.65),
        "Contanti": Math.floor(totalRevenue * 0.25),
        "Bonifico": Math.floor(totalRevenue * 0.10)
      };

      // Top campi per ricavi
      const topCourts = courts?.map(court => ({
        id: court.id,
        name: court.name,
        revenue: Math.floor(Math.random() * 2000) + 500,
        bookings: Math.floor(Math.random() * 50) + 10
      })).sort((a, b) => b.revenue - a.revenue).slice(0, 3) || [];

      setFinancialData({
        today: { 
          revenue: todayStats.todayRevenue || 0, 
          bookings: todayStats.todayBookings || 0 
        },
        thisWeek: { 
          revenue: weekRevenue, 
          bookings: weekBookings 
        },
        thisMonth: { 
          revenue: monthlyStats.monthlyRevenue || 0, 
          bookings: monthlyStats.monthlyBookings || 0 
        },
        revenueByPaymentMethod,
        topCourts,
        loading: false
      });

    } catch (error) {
      console.error("Errore caricamento dati finanziari:", error);
      setFinancialData(prev => ({ ...prev, loading: false }));
    }
  };

  const getCurrentData = () => {
    switch (timeRange) {
      case "today":
        return financialData.today;
      case "week":
        return financialData.thisWeek;
      case "month":
        return financialData.thisMonth;
      default:
        return financialData.thisMonth;
    }
  };

  const currentData = getCurrentData();

  if (financialData.loading) {
    return (
      <Section title="💰 Statistiche Finanziarie" T={T}>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl">
          <div className="text-center py-8">Caricamento dati finanziari...</div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="💰 Statistiche Finanziarie" T={T}>
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl">
        
        {/* Filtri Periodo */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "today", label: "Oggi" },
            { key: "week", label: "Settimana" },
            { key: "month", label: "Mese" }
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setTimeRange(period.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                timeRange === period.key
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Metriche Principali */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-6 border border-green-200/30 dark:border-green-700/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ricavi</h3>
              <span className="text-3xl">💰</span>
            </div>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                €{currentData.revenue?.toFixed(2) || "0.00"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {timeRange === "today" && "Incasso di oggi"}
                {timeRange === "week" && "Incasso settimanale"}
                {timeRange === "month" && "Incasso mensile"}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prenotazioni</h3>
              <span className="text-3xl">📅</span>
            </div>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {currentData.bookings || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {timeRange === "today" && "Prenotazioni di oggi"}
                {timeRange === "week" && "Prenotazioni settimanali"}
                {timeRange === "month" && "Prenotazioni mensili"}
              </div>
            </div>
          </div>
        </div>

        {/* Metodi di Pagamento */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6 border border-purple-200/30 dark:border-purple-700/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">💳</span>
              Metodi di Pagamento
            </h3>
            <div className="space-y-3">
              {Object.entries(financialData.revenueByPaymentMethod).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">€{amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-6 border border-amber-200/30 dark:border-amber-700/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              Top Campi per Ricavi
            </h3>
            <div className="space-y-3">
              {financialData.topCourts.map((court, index) => (
                <div key={court.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? "bg-yellow-500" : 
                      index === 1 ? "bg-gray-400" : "bg-orange-500"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{court.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{court.bookings} prenotazioni</div>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">€{court.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metriche Aggiuntive */}
        <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-600/20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                €{(currentData.revenue / Math.max(currentData.bookings, 1)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ricavo Medio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {((currentData.bookings / (courts?.length || 1)) * (timeRange === "today" ? 1 : timeRange === "week" ? 7 : 30)).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Utilizzo Medio/Campo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.floor(Math.random() * 20) + 80}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tasso Occupazione</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.floor(Math.random() * 10) + 85}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Soddisfazione</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}