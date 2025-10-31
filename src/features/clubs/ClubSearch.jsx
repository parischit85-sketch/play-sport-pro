import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  searchClubs,
  searchClubsByLocation,
  getClubs,
  calculateDistance,
} from '@services/clubs.js';
import { getUserLocation, geocodeCity, LocationStatus } from '../../utils/location-service.js';
import { getClubCoordinates } from '../../utils/maps-utils.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import ClubCard from './ClubCard.jsx';
import { LoadingSpinner } from '@components/LoadingSpinner.jsx';

const SEARCH_TYPES = {
  TEXT: 'text',
  LOCATION: 'location',
};

const ClubSearch = () => {
  const { user, userAffiliations } = useAuth();
  const [searchType, setSearchType] = useState(SEARCH_TYPES.TEXT);
  const [searchQuery, setSearchQuery] = useState('');
  const [allClubs, setAllClubs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCustomSearch, setShowCustomSearch] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [geolocationAttempts, setGeolocationAttempts] = useState(0);
  const [showManualLocationInput, setShowManualLocationInput] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadInitialData();
  }, []);

  // 🌍 GPS already requested by AppLayout on app startup
  // No auto-request here - only when user clicks "Cerca Vicino a Me" in Prenota flow

  useEffect(() => {
    if (debouncedQuery.trim() && searchType === SEARCH_TYPES.TEXT && showCustomSearch) {
      handleTextSearch(debouncedQuery);
    }
  }, [debouncedQuery, searchType, showCustomSearch]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const clubs = await getClubs();
      setAllClubs(clubs || []);
    } catch (err) {
      setError('Errore nel caricamento dei circoli');
      console.error('Error loading clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  const affiliatedClubs = useMemo(() => {
    if (!user || !userAffiliations || !allClubs.length) return [];
    return allClubs.filter(
      (club) =>
        // 🔒 FILTRO: Solo circoli attivi E affiliati approvati
        club.isActive === true &&
        userAffiliations.some((aff) => aff.clubId === club.id && aff.status === 'approved')
    );
  }, [allClubs, userAffiliations, user]);

  const nearbyClubs = useMemo(() => {
    if (!allClubs.length) return [];

    const nonAffiliatedClubs = allClubs.filter(
      (club) =>
        // 🔒 FILTRO: Solo circoli attivi E non già affiliati
        club.isActive === true && !affiliatedClubs.some((aff) => aff.id === club.id)
    );

    // ✅ Calculate distances if userLocation available (from AppLayout cache)
    if (userLocation) {
      const clubsWithDistance = nonAffiliatedClubs
        .map((club) => {
          const coords = getClubCoordinates(club);
          if (!coords) return { ...club, distance: Infinity };

          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            coords.lat,
            coords.lng
          );

          return { ...club, distance };
        })
        .sort((a, b) => a.distance - b.distance); // Sort by distance ascending

      console.log('🌍 [ClubSearch] Nearby clubs sorted by distance:', {
        userLocation,
        clubsCount: clubsWithDistance.length,
        first3: clubsWithDistance.slice(0, 3).map((c) => ({ name: c.name, distance: c.distance })),
      });

      return clubsWithDistance.slice(0, 6);
    }

    // Without location, return first 6 without sorting
    return nonAffiliatedClubs.slice(0, 6);
  }, [allClubs, affiliatedClubs, userLocation]);

  const handleTextSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const results = await searchClubs(query, { limit: 20 });
      setSearchResults(results);
    } catch (err) {
      setError('Errore durante la ricerca. Riprova.');
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Unified location request using centralized service
  const requestUserLocation = useCallback(async () => {
    setSearchLoading(true);
    setError(null);
    const result = await getUserLocation({
      timeout: 7000,
      highAccuracy: false,
      cache: true,
      cacheTTL: 180000,
    }); // 3 min TTL
    setSearchLoading(false);

    switch (result.status) {
      case LocationStatus.SUCCESS:
        setUserLocation(result.coords);
        setShowManualLocationInput(false);
        setGeolocationAttempts(0);
        break;
      case LocationStatus.PERMISSION_DENIED:
        setError('Permesso negato. Inserisci la tua città:');
        setShowManualLocationInput(true);
        setGeolocationAttempts((a) => a + 1);
        break;
      case LocationStatus.TIMEOUT:
        setError('Timeout. Inserisci la tua città:');
        setShowManualLocationInput(true);
        setGeolocationAttempts((a) => a + 1);
        break;
      case LocationStatus.POSITION_UNAVAILABLE:
        setError('Posizione non disponibile. Inserisci la tua città:');
        setShowManualLocationInput(true);
        setGeolocationAttempts((a) => a + 1);
        break;
      case LocationStatus.INSECURE_CONTEXT:
        setError('HTTPS richiesto per geolocalizzazione. Inserisci la tua città:');
        setShowManualLocationInput(true);
        break;
      case LocationStatus.UNSUPPORTED:
        setError('Geolocalizzazione non supportata. Inserisci la tua città:');
        setShowManualLocationInput(true);
        break;
      case LocationStatus.BLOCKED_BY_POLICY:
        setError('Bloccata dalla Permissions-Policy del server. Inserisci la tua città:');
        setShowManualLocationInput(true);
        break;
      default:
        setError('Impossibile rilevare la posizione. Inserisci la tua città:');
        setShowManualLocationInput(true);
        setGeolocationAttempts((a) => a + 1);
    }
  }, []);

  const searchByCity = useCallback(async (city) => {
    if (!city.trim()) {
      setError('Inserisci il nome di una città');
      return;
    }
    setSearchLoading(true);
    setError(null);
    const geo = await geocodeCity(city, 'Italy');
    if (!geo.ok) {
      setError(geo.message || 'Città non trovata.');
      setSearchLoading(false);
      return;
    }
    setUserLocation(geo.coords);
    setHasSearched(true);
    try {
      const results = await searchClubsByLocation(geo.coords.lat, geo.coords.lng, 25);
      setSearchResults(results);
    } catch (err) {
      console.error('Location search error:', err);
      setError('Errore durante la ricerca per posizione. Riprova.');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleLocationSearch = useCallback(
    async (radius = 10, location = null) => {
      const searchLocation = location || userLocation;

      if (!searchLocation) {
        requestUserLocation();
        return;
      }
      setSearchLoading(true);
      setError(null);
      setHasSearched(true);
      try {
        const results = await searchClubsByLocation(searchLocation.lat, searchLocation.lng, radius);
        setSearchResults(results);
      } catch (err) {
        setError('Errore durante la ricerca per posizione. Riprova.');
        console.error('Location search error:', err);
      } finally {
        setSearchLoading(false);
      }
    },
    [userLocation, requestUserLocation]
  );

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🏟️</div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-white mb-2">
          Trova il tuo Circolo
        </h1>
        <p className="text-sm text-gray-600 text-gray-400">
          Scopri i circoli sportivi e unisciti alla community
        </p>
      </div>

      {/* 1. I TUOI CIRCOLI - Circoli dove l'utente ha fatto accesso */}
      {user && affiliatedClubs.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 from-green-900/20 to-emerald-900/10 rounded-2xl border-2 border-green-200 border-green-700/30 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-white">I Tuoi Circoli</h2>
              <p className="text-sm text-gray-600 text-gray-400">
                {affiliatedClubs.length}{' '}
                {affiliatedClubs.length === 1 ? 'circolo affiliato' : 'circoli affiliati'}
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {affiliatedClubs.map((club) => (
              <div key={club.id} className="relative">
                <ClubCard club={club} userLocation={userLocation} />
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Affiliato
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. I 3 PIÙ VICINI - Card più piccole e compatte */}
      {nearbyClubs.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 from-blue-900/20 to-indigo-900/10 rounded-xl border border-blue-200 border-blue-700/30 p-4 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 text-white">
                Circoli Nelle Vicinanze
              </h2>
              <p className="text-xs text-gray-600 text-gray-400">
                I migliori circoli più vicini a te
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {nearbyClubs.slice(0, 3).map((club, index) => (
              <div key={club.id} className="relative transform scale-95">
                <ClubCard club={club} userLocation={userLocation} compact={true} />
                {index === 0 && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md">
                    Più vicino
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RICERCA PERSONALIZZATA - Collapsible */}
      <div className="bg-white bg-gray-800 rounded-2xl border-2 border-gray-200 border-gray-700 p-6 shadow-lg">
        <div className="text-center mb-6">
          <button
            onClick={() => setShowCustomSearch(!showCustomSearch)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 text-lg font-bold rounded-xl transition-all inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {showCustomSearch ? 'Nascondi Ricerca Avanzata' : 'Ricerca Avanzata'}
          </button>
        </div>

        {showCustomSearch && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl"></span>
              <h2 className="text-xl font-semibold text-gray-900 text-white">
                Ricerca Personalizzata
              </h2>
            </div>

            <div className="flex bg-gray-100 bg-gray-700 rounded-lg p-1 max-w-md mx-auto">
              <button
                onClick={() => setSearchType(SEARCH_TYPES.TEXT)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  searchType === SEARCH_TYPES.TEXT
                    ? 'bg-white bg-gray-600 text-gray-900 text-white shadow-sm'
                    : 'text-gray-600 text-gray-400 hover:text-gray-900 hover:text-white'
                }`}
              >
                Ricerca per nome
              </button>
              <button
                onClick={() => setSearchType(SEARCH_TYPES.LOCATION)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  searchType === SEARCH_TYPES.LOCATION
                    ? 'bg-white bg-gray-600 text-gray-900 text-white shadow-sm'
                    : 'text-gray-600 text-gray-400 hover:text-gray-900 hover:text-white'
                }`}
              >
                Cerca nelle vicinanze
              </button>
            </div>

            {searchType === SEARCH_TYPES.TEXT ? (
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Cerca per nome del club o città..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 border-gray-600 bg-white bg-gray-700 text-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:text-gray-300"
                  ></button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                {!userLocation ? (
                  <>
                    <button
                      onClick={requestUserLocation}
                      disabled={searchLoading}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      {searchLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Rilevamento posizione...
                        </>
                      ) : (
                        <>📍 Usa la mia posizione GPS</>
                      )}
                    </button>

                    {(showManualLocationInput || geolocationAttempts > 0) && (
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="text-gray-600 text-gray-400 font-medium">
                          Oppure inserisci la tua città:
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="es. Milano, Roma, Torino..."
                            value={manualCity}
                            onChange={(e) => setManualCity(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && manualCity.trim()) {
                                searchByCity(manualCity);
                              }
                            }}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 border-gray-600 bg-white bg-gray-700 text-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => searchByCity(manualCity)}
                            disabled={!manualCity.trim() || searchLoading}
                            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            🔍 Cerca
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 text-gray-400">
                          Cercheremo i circoli entro 25 km dalla città indicata
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-green-600 text-green-400 font-medium flex items-center justify-center gap-2">
                      ✅ Posizione rilevata
                    </div>
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleLocationSearch(5)}
                        className="px-4 py-2 border border-gray-300 border-gray-600 rounded-lg hover:bg-gray-50 hover:bg-gray-600 transition-colors"
                      >
                        Entro 5 km
                      </button>
                      <button
                        onClick={() => handleLocationSearch(10)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Entro 10 km
                      </button>
                      <button
                        onClick={() => handleLocationSearch(25)}
                        className="px-4 py-2 border border-gray-300 border-gray-600 rounded-lg hover:bg-gray-50 hover:bg-gray-600 transition-colors"
                      >
                        Entro 25 km
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setUserLocation(null);
                        setManualCity('');
                        setShowManualLocationInput(false);
                        setGeolocationAttempts(0);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 text-gray-400 hover:text-gray-300 underline"
                    >
                      Cambia posizione
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="max-w-md mx-auto">
                <div className="bg-red-50 bg-red-900/20 border border-red-200 border-red-800 rounded-lg p-4 text-red-700 text-red-400">
                  {error}
                </div>
              </div>
            )}

            {searchLoading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {!searchLoading && hasSearched && (
              <>
                {searchResults.length > 0 ? (
                  <>
                    <div className="text-center text-gray-600 text-gray-400 mb-4">
                      {searchResults.length === 1
                        ? 'Trovato 1 club'
                        : `Trovati ${searchResults.length} club`}
                      {searchType === SEARCH_TYPES.LOCATION && userLocation && ' nelle vicinanze'}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {searchResults.map((club) => (
                        <ClubCard key={club.id} club={club} userLocation={userLocation} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-900 text-white mb-2">
                      Nessun risultato trovato
                    </h3>
                    <p className="text-gray-600 text-gray-400">
                      Prova a modificare i criteri di ricerca
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {allClubs.length === 0 && !loading && (
        <div className="bg-white bg-gray-800 rounded-lg border border-gray-200 border-gray-700 p-6 text-center">
          <div className="text-4xl mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 text-white mb-2">
            Nessun circolo disponibile
          </h3>
          <p className="text-gray-600 text-gray-400">Non ci sono circoli disponibili al momento</p>
        </div>
      )}
    </div>
  );
};

export default ClubSearch;
