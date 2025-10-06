import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { searchClubs, searchClubsByLocation, getClubs } from '@services/clubs.js';
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
    return allClubs.filter((club) =>
      userAffiliations.some((aff) => aff.clubId === club.id && aff.status === 'approved')
    );
  }, [allClubs, userAffiliations, user]);

  const nearbyClubs = useMemo(() => {
    if (!allClubs.length) return [];
    return allClubs
      .filter((club) => !affiliatedClubs.some((aff) => aff.id === club.id))
      .slice(0, 6);
  }, [allClubs, affiliatedClubs]);

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

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalizzazione non supportata dal browser');
      setShowManualLocationInput(true);
      return;
    }

    // Check if we're on HTTPS or localhost (required for geolocation on PWA)
    const isSecureContext = window.isSecureContext;
    if (!isSecureContext && window.location.hostname !== 'localhost') {
      setError('La geolocalizzazione richiede una connessione sicura (HTTPS). Inserisci la tua città manualmente.');
      setShowManualLocationInput(true);
      return;
    }

    setSearchLoading(true);
    setError(null);

    // Simple direct approach - no Permissions API
    const timeout = setTimeout(() => {
      setSearchLoading(false);
      setError('La geolocalizzazione sta impiegando troppo tempo. Inserisci la tua città manualmente.');
      setShowManualLocationInput(true);
      setGeolocationAttempts(prev => prev + 1);
    }, 8000); // 8 seconds timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout);
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('Geolocation success:', location);
        setUserLocation(location);
        setSearchLoading(false);
        setError(null);
        setGeolocationAttempts(0);
      },
      (error) => {
        clearTimeout(timeout);
        console.error('Geolocation error:', error);
        
        let errorMessage = '';
        let showManual = true;
        
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Permessi di localizzazione negati. Inserisci la tua città:';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Posizione non disponibile. Inserisci la tua città:';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Timeout. Inserisci la tua città per cercare nelle vicinanze:';
            break;
          default:
            errorMessage = 'Impossibile rilevare la posizione. Inserisci la tua città:';
        }
        
        setError(errorMessage);
        setShowManualLocationInput(showManual);
        setSearchLoading(false);
        setGeolocationAttempts(prev => prev + 1);
      },
      {
        enableHighAccuracy: false, // Faster with lower accuracy
        timeout: 7000,
        maximumAge: 60000, // Allow 1 minute cache
      }
    );
  }, []);

  const searchByCity = useCallback(async (city) => {
    if (!city.trim()) {
      setError('Inserisci il nome di una città');
      return;
    }

    setSearchLoading(true);
    setError(null);

    try {
      // Use Nominatim for geocoding (free, no API key needed)
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)},Italy&limit=1`;
      
      const response = await fetch(geocodeUrl, {
        headers: {
          'User-Agent': 'PlaySportPro/1.0' // Required by Nominatim
        }
      });
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        
        console.log('City geocoded:', city, location);
        setUserLocation(location);
        setError(null);
        
        // Auto-search with 25km radius
        // We'll call handleLocationSearch after it's defined
        setSearchLoading(true);
        setHasSearched(true);
        try {
          const results = await searchClubsByLocation(location.lat, location.lng, 25);
          setSearchResults(results);
        } catch (err) {
          setError('Errore durante la ricerca per posizione. Riprova.');
          console.error('Location search error:', err);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setError(`Città "${city}" non trovata. Prova con un nome diverso.`);
        setSearchLoading(false);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Errore nella ricerca della città. Riprova.');
      setSearchLoading(false);
    }
  }, []);

  const handleLocationSearch = useCallback(
    async (radius = 10, location = null) => {
      const searchLocation = location || userLocation;
      
      if (!searchLocation) {
        getCurrentLocation();
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
    [userLocation, getCurrentLocation]
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
      <div className="text-center">
        <div className="text-6xl mb-4"></div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Trova il tuo Club</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Scopri i circoli sportivi e unisciti alla community
        </p>
      </div>

      {user && affiliatedClubs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl"></span>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">I Tuoi Circoli</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Circoli dove hai un'affiliazione attiva
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {affiliatedClubs.map((club) => (
              <div key={club.id} className="relative">
                <ClubCard club={club} userLocation={userLocation} />
                <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                  Affiliato
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nearbyClubs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl"></span>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Circoli Nelle Vicinanze
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Altri circoli disponibili per nuove affiliazioni
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nearbyClubs.map((club) => (
              <ClubCard key={club.id} club={club} userLocation={userLocation} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center mb-6">
          <button
            onClick={() => setShowCustomSearch(!showCustomSearch)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-lg font-medium rounded-lg transition-all inline-flex items-center gap-2"
          >
            {showCustomSearch ? 'Nascondi Ricerca' : 'Cerca Altri Circoli'}
          </button>
        </div>

        {showCustomSearch && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl"></span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Ricerca Personalizzata
              </h2>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 max-w-md mx-auto">
              <button
                onClick={() => setSearchType(SEARCH_TYPES.TEXT)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  searchType === SEARCH_TYPES.TEXT
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Ricerca per nome
              </button>
              <button
                onClick={() => setSearchType(SEARCH_TYPES.LOCATION)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  searchType === SEARCH_TYPES.LOCATION
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  ></button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                {!userLocation ? (
                  <>
                    <button
                      onClick={getCurrentLocation}
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
                        <div className="text-gray-600 dark:text-gray-400 font-medium">
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
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => searchByCity(manualCity)}
                            disabled={!manualCity.trim() || searchLoading}
                            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            🔍 Cerca
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Cercheremo i circoli entro 25 km dalla città indicata
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                      ✅ Posizione rilevata
                    </div>
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleLocationSearch(5)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
                    >
                      Cambia posizione
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="max-w-md mx-auto">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
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
                    <div className="text-center text-gray-600 dark:text-gray-400 mb-4">
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
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Nessun risultato trovato
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-4xl mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nessun circolo disponibile
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Non ci sono circoli disponibili al momento
          </p>
        </div>
      )}
    </div>
  );
};

export default ClubSearch;
