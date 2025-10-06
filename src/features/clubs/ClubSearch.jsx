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

  const handleLocationSearch = useCallback(
    async (radius = 10) => {
      if (!userLocation) {
        await getCurrentLocation();
        return;
      }
      setSearchLoading(true);
      setError(null);
      setHasSearched(true);
      try {
        const results = await searchClubsByLocation(userLocation.lat, userLocation.lng, radius);
        setSearchResults(results);
      } catch (err) {
        setError('Errore durante la ricerca per posizione. Riprova.');
        console.error('Location search error:', err);
      } finally {
        setSearchLoading(false);
      }
    },
    [userLocation]
  );

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalizzazione non supportata dal browser');
      return;
    }

    // Check if we're on HTTPS or localhost (required for geolocation on PWA)
    const isSecureContext = window.isSecureContext;
    if (!isSecureContext && window.location.hostname !== 'localhost') {
      setError('La geolocalizzazione richiede una connessione sicura (HTTPS)');
      return;
    }

    setSearchLoading(true);
    setError(null);

    // First, try to request permission explicitly
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        console.log('Geolocation permission status:', permissionStatus.state);
        
        if (permissionStatus.state === 'denied') {
          setError('Permesso di geolocalizzazione negato. Abilita i permessi nelle impostazioni del browser.');
          setSearchLoading(false);
          return;
        }

        // Permission granted or prompt - proceed with geolocation
        requestGeolocation();
      }).catch((err) => {
        console.warn('Permission API not supported, trying geolocation directly:', err);
        // Fallback if Permissions API not supported
        requestGeolocation();
      });
    } else {
      // Fallback if Permissions API not supported
      requestGeolocation();
    }

    function requestGeolocation() {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('Geolocation success:', location);
          setUserLocation(location);
          setSearchLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Impossibile ottenere la posizione.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permesso di geolocalizzazione negato. Abilita i permessi nelle impostazioni del browser.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Posizione non disponibile. Verifica la connessione GPS/WiFi.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Timeout nella ricerca della posizione. Riprova.';
              break;
            default:
              errorMessage = 'Errore sconosciuto nella geolocalizzazione.';
          }
          
          setError(errorMessage);
          setSearchLoading(false);
        },
        {
          enableHighAccuracy: true, // Use GPS for better accuracy
          timeout: 15000, // Increased timeout for mobile
          maximumAge: 0, // Don't use cached position on first request
        }
      );
    }
  }, []);

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
                      <> Usa la mia posizione</>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-green-600 dark:text-green-400 font-medium">
                      Posizione rilevata
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
