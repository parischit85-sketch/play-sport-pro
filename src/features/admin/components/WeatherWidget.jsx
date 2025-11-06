// =============================================
// FILE: src/features/admin/components/WeatherWidget.jsx
// Widget meteo per dashboard admin - mostra previsioni oggi e domani
// =============================================
import React, { useState, useEffect } from 'react';
import { getClubCoordinates } from '@utils/maps-utils.js';

const WeatherWidget = ({ club }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [loadingHourly, setLoadingHourly] = useState(false);
  const [extendedWeather, setExtendedWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!club) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Ottieni coordinate dal club (da googleMapsUrl o coordinate dirette)
        const coordinates = await getClubCoordinates(club);

        if (!coordinates) {
          setError('Coordinate non disponibili. Aggiungi il link Google Maps nelle impostazioni.');
          setLoading(false);
          return;
        }

        const { latitude, longitude } = coordinates;

        // Chiamata API Open-Meteo (gratuita, no API key)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Europe/Rome&forecast_days=7`
        );
        if (!response.ok) {
          throw new Error('Errore nel recupero dei dati meteo');
        }

        const data = await response.json();

        // Salva tutti i dati per la navigazione nel modal
        setExtendedWeather(data);

        // Funzione helper per ottenere dati di una fascia oraria
        const getTimeSlotData = (hourlyData, dateStr, startHour, endHour) => {
          const hourlyTimes = hourlyData.time;
          const temps = [];
          const precips = [];
          const codes = [];

          hourlyTimes.forEach((time, index) => {
            const timeDate = new Date(time);
            const hour = timeDate.getHours();
            const timeDateStr = time.split('T')[0];

            if (timeDateStr === dateStr && hour >= startHour && hour < endHour) {
              temps.push(hourlyData.temperature_2m[index]);
              precips.push(hourlyData.precipitation_probability[index]);
              codes.push(hourlyData.weather_code[index]);
            }
          });

          return {
            temp:
              temps.length > 0 ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : 0,
            precipProb: Math.max(...precips, 0),
            weatherCode: codes.length > 0 ? codes[Math.floor(codes.length / 2)] : 0,
          };
        };

        const today = data.daily.time[0];

        const todayData = {
          date: today,
          tempMax: Math.round(data.daily.temperature_2m_max[0]),
          tempMin: Math.round(data.daily.temperature_2m_min[0]),
          morning: getTimeSlotData(data.hourly, today, 6, 12),
          afternoon: getTimeSlotData(data.hourly, today, 12, 18),
          evening: getTimeSlotData(data.hourly, today, 18, 24),
        };

        setWeather({ today: todayData });
        setLoading(false);
      } catch (err) {
        console.error('❌ [WeatherWidget] Error fetching weather:', err);
        setError('Errore nel caricamento del meteo');
        setLoading(false);
      }
    };

    fetchWeather();
  }, [club]);

  // Gestione click su un giorno per aprire il modal
  const handleDayClick = async (dayIndex = 0) => {
    setSelectedDayIndex(dayIndex);
    setShowModal(true);
    setLoadingHourly(true);

    try {
      if (!extendedWeather) return;

      // Usa i dati già caricati
      const targetDate = extendedWeather.daily.time[dayIndex];

      const hourlyData = extendedWeather.hourly.time
        .map((time, index) => ({
          time,
          temp: Math.round(extendedWeather.hourly.temperature_2m[index]),
          precipProb: extendedWeather.hourly.precipitation_probability[index],
          weatherCode: extendedWeather.hourly.weather_code[index],
          windSpeed: Math.round(extendedWeather.hourly.wind_speed_10m[index]),
        }))
        .filter((item) => item.time.startsWith(targetDate))
        .filter((item) => {
          const hour = parseInt(item.time.split('T')[1].split(':')[0]);
          return hour >= 6 && hour <= 23;
        });

      setHourlyForecast(hourlyData);

      // Imposta selectedDay con i dati del giorno corrente
      setSelectedDay({
        date: targetDate,
        tempMax: Math.round(extendedWeather.daily.temperature_2m_max[dayIndex]),
        tempMin: Math.round(extendedWeather.daily.temperature_2m_min[dayIndex]),
      });
      setLoadingHourly(false);
    } catch (err) {
      console.error('❌ [WeatherWidget] Error loading hourly data:', err);
      setLoadingHourly(false);
    }
  };

  // Funzione per ottenere l'emoji del meteo basata sul WMO code
  const getWeatherEmoji = (code) => {
    if (code === 0) return '☀️'; // Clear sky
    if (code === 1 || code === 2) return '🌤️'; // Mainly clear, partly cloudy
    if (code === 3) return '☁️'; // Overcast
    if (code === 45 || code === 48) return '🌫️'; // Fog
    if (code === 51 || code === 53 || code === 55) return '🌧️'; // Drizzle
    if (code === 61 || code === 63 || code === 65) return '🌧️'; // Rain
    if (code === 71 || code === 73 || code === 75) return '❄️'; // Snow
    if (code === 77) return '❄️'; // Snow grains
    if (code === 80 || code === 81 || code === 82) return '🌧️'; // Rain showers
    if (code === 85 || code === 86) return '❄️'; // Snow showers
    if (code === 95 || code === 96 || code === 99) return '⛈️'; // Thunderstorm
    return '🌤️';
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return 'Sereno';
    if (code === 1 || code === 2) return 'Poco nuvoloso';
    if (code === 3) return 'Nuvoloso';
    if (code === 45 || code === 48) return 'Nebbia';
    if (code === 51 || code === 53 || code === 55) return 'Pioggerella';
    if (code === 61 || code === 63 || code === 65) return 'Pioggia';
    if (code === 71 || code === 73 || code === 75) return 'Neve';
    if (code === 80 || code === 81 || code === 82) return 'Rovesci';
    if (code === 85 || code === 86) return 'Neve';
    if (code === 95 || code === 96 || code === 99) return 'Temporale';
    return 'Variabile';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900/20 to-sky-900/20 rounded-xl border border-blue-700/50 p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-400">Caricamento meteo...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/50 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>🌡️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const formatDate = (dateStr, dayIndex = null) => {
    const date = new Date(dateStr);

    if (dayIndex !== null) {
      if (dayIndex === 0) return 'Oggi';
      if (dayIndex === 1) return 'Domani';
    }

    return date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const handlePrevDay = () => {
    if (selectedDayIndex > 0) {
      handleDayClick(selectedDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (selectedDayIndex < 6) {
      handleDayClick(selectedDayIndex + 1);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/20 via-sky-900/20 to-cyan-900/20 rounded-xl border border-blue-700/50 p-2 shadow-lg">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-lg">🌤️</span>
        <h3 className="font-semibold text-gray-200 text-xs">Meteo</h3>
      </div>

      {/* Oggi */}
      <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg p-1.5 border border-blue-700/30">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-bold text-blue-400">{formatDate(weather.today.date)}</div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-400">{weather.today.tempMin}°</span>
            <span className="text-sm font-bold text-gray-200">{weather.today.tempMax}°</span>
          </div>
        </div>

        {/* Fasce orarie oggi */}
        <div className="grid grid-cols-3 gap-1">
          {/* Mattina */}
          <div
            className="text-center cursor-pointer hover:bg-gray-700 rounded px-0.5 py-1 transition-all"
            onClick={() => handleDayClick(0)}
            onKeyDown={(e) => e.key === 'Enter' && handleDayClick(0)}
            role="button"
            tabIndex={0}
          >
            <div className="text-[10px] text-gray-400 leading-none mb-1">Mattina</div>
            <div className="text-3xl leading-none mb-1">
              {getWeatherEmoji(weather.today.morning.weatherCode)}
            </div>
            <div className="text-sm font-bold text-gray-200 leading-none mb-0.5">
              {weather.today.morning.temp}°
            </div>
            {weather.today.morning.precipProb > 0 && (
              <div className="text-[10px] text-blue-400 leading-none">
                💧{weather.today.morning.precipProb}%
              </div>
            )}
          </div>

          {/* Pomeriggio */}
          <div
            className="text-center cursor-pointer hover:bg-gray-700 rounded px-0.5 py-1 transition-all"
            onClick={() => handleDayClick(0)}
            onKeyDown={(e) => e.key === 'Enter' && handleDayClick(0)}
            role="button"
            tabIndex={0}
          >
            <div className="text-[10px] text-gray-400 leading-none mb-1">Pomer.</div>
            <div className="text-3xl leading-none mb-1">
              {getWeatherEmoji(weather.today.afternoon.weatherCode)}
            </div>
            <div className="text-sm font-bold text-gray-200 leading-none mb-0.5">
              {weather.today.afternoon.temp}°
            </div>
            {weather.today.afternoon.precipProb > 0 && (
              <div className="text-[10px] text-blue-400 leading-none">
                💧{weather.today.afternoon.precipProb}%
              </div>
            )}
          </div>

          {/* Sera */}
          <div
            className="text-center cursor-pointer hover:bg-gray-700 rounded px-0.5 py-1 transition-all"
            onClick={() => handleDayClick(0)}
            onKeyDown={(e) => e.key === 'Enter' && handleDayClick(0)}
            role="button"
            tabIndex={0}
          >
            <div className="text-[10px] text-gray-400 leading-none mb-1">Sera</div>
            <div className="text-3xl leading-none mb-1">
              {getWeatherEmoji(weather.today.evening.weatherCode)}
            </div>
            <div className="text-sm font-bold text-gray-200 leading-none mb-0.5">
              {weather.today.evening.temp}°
            </div>
            {weather.today.evening.precipProb > 0 && (
              <div className="text-[10px] text-blue-400 leading-none">
                💧{weather.today.evening.precipProb}%
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-1.5 pt-1 border-t border-blue-700/30">
        <div className="text-[10px] text-gray-400 text-center leading-none">
          Clicca per dettagli
        </div>
      </div>

      {/* Modal Previsioni Orarie */}
      {showModal && selectedDay && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowModal(false)}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal con navigazione */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={handlePrevDay}
                  disabled={selectedDayIndex === 0}
                  className={`p-2 rounded-full transition ${
                    selectedDayIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="text-center flex-1">
                  <h3 className="text-xl font-bold text-white">
                    {formatDate(selectedDay.date, selectedDayIndex)}
                  </h3>
                  <p className="text-sm text-blue-100">
                    {new Date(selectedDay.date).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <p className="text-xs text-blue-100 mt-1">
                    {selectedDay.tempMin}° - {selectedDay.tempMax}°
                  </p>
                </div>

                <button
                  onClick={handleNextDay}
                  disabled={selectedDayIndex === 6}
                  className={`p-2 rounded-full transition ${
                    selectedDayIndex === 6 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Contenuto Modal */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-100px)] bg-gray-800">
              {loadingHourly ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : hourlyForecast.length > 0 ? (
                <div className="space-y-2">
                  {hourlyForecast.map((item) => {
                    const hour = new Date(item.time).getHours();

                    return (
                      <div
                        key={item.time}
                        className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-lg font-bold text-gray-200 w-16">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                          <span className="text-3xl">{getWeatherEmoji(item.weatherCode)}</span>
                          <div className="flex-1">
                            <div className="text-sm text-gray-300">
                              {getWeatherDescription(item.weatherCode)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-200">{item.temp}°</div>
                          </div>

                          {item.precipProb > 0 && (
                            <div className="flex items-center gap-1 bg-blue-900/30 px-2 py-1 rounded-full">
                              <span className="text-sm">💧</span>
                              <span className="text-sm font-medium text-blue-300">
                                {item.precipProb}%
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded-full">
                            <span className="text-sm">💨</span>
                            <span className="text-sm font-medium text-gray-300">
                              {item.windSpeed} km/h
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">Nessun dato disponibile</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
