// =============================================
// FILE: src/components/ui/BookingTypeModal.jsx
// Modal per scegliere prima il circolo, poi il tipo di prenotazione
// =============================================
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getUserMostViewedClubs } from '../../services/club-analytics.js';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { getClubCoordinates, calculateDistance } from '../../utils/maps-utils.js';

export default function BookingTypeModal({ isOpen, onClose, onSelectType, clubId }) {
  const { user } = useAuth();
  const [step, setStep] = useState('club'); // 'club' o 'type'
  const [selectedClubId, setSelectedClubId] = useState(clubId || null);
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const loadClubs = useCallback(async () => {
    setLoading(true);
    try {
      // Carica sempre tutti i circoli disponibili per la ricerca
      const clubsRef = collection(db, 'clubs');
      const clubsSnap = await getDocs(clubsRef);
      const allClubs = clubsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setClubs(allClubs);
      
      // Carica anche i più visualizzati
      const viewedClubs = await getUserMostViewedClubs(user.uid, 10);
      if (viewedClubs.length > 0) {
        const clubsData = viewedClubs
          .filter(v => v.club !== null)
          .map(v => v.club);
        setFilteredClubs(clubsData);
      } else {
        setFilteredClubs(allClubs);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
      setClubs([]);
      setFilteredClubs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carica circoli quando il modal si apre
  useEffect(() => {
    if (isOpen && user) {
      loadClubs();
    }
  }, [isOpen, user, loadClubs]);

  // Filtra circoli in base alla ricerca
  useEffect(() => {
    if (!searchText.trim()) {
      // Se non c'è testo di ricerca, non fare nulla
      // i clubs sono già stati caricati in loadClubs
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = clubs.filter(club => {
      const name = (club.name || '').toLowerCase();
      const city = (club.location?.city || club.city || club.address?.city || '').toLowerCase();
      const address = (club.location?.address || club.address?.street || '').toLowerCase();
      
      return name.includes(searchLower) || 
             city.includes(searchLower) || 
             address.includes(searchLower);
    });
    
    setFilteredClubs(filtered);
  }, [searchText, clubs]);

  // Reset quando chiude
  useEffect(() => {
    if (!isOpen) {
      setStep('club');
      setSelectedClubId(clubId || null);
      setSearchText('');
      setShowSearch(false);
    }
  }, [isOpen, clubId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClubSelection = (clubId) => {
    setSelectedClubId(clubId);
    setStep('type');
  };

  const handleTypeSelection = (type) => {
    onSelectType(type, selectedClubId);
    onClose();
  };

  const handleBack = () => {
    setStep('club');
  };

  const toggleSearch = async () => {
    const newShowSearch = !showSearch;
    setShowSearch(newShowSearch);
    setSearchText('');
    
    if (newShowSearch) {
      // Mostra tutti i circoli
      setFilteredClubs(clubs);
    } else {
      // Torna ai circoli preferiti
      try {
        const viewedClubs = await getUserMostViewedClubs(user.uid, 10);
        if (viewedClubs.length > 0) {
          const clubsData = viewedClubs
            .filter(v => v.club !== null)
            .map(v => v.club);
          setFilteredClubs(clubsData);
        } else {
          setFilteredClubs(clubs);
        }
      } catch (error) {
        console.error('Error loading viewed clubs:', error);
        setFilteredClubs(clubs);
      }
    }
  };

  const handleSearchLocation = () => {
    // Richiedi posizione utente
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Ordina circoli per distanza usando le coordinate da Google Maps URL
          const clubsWithDistance = await Promise.all(
            clubs.map(async (club) => {
              // Ottieni coordinate dal Google Maps URL o dai campi esistenti
              const clubCoords = await getClubCoordinates(club);
              
              if (clubCoords) {
                const distance = calculateDistance(
                  latitude,
                  longitude,
                  clubCoords.latitude,
                  clubCoords.longitude
                );
                
                return { ...club, distance };
              }
              
              // Se non ci sono coordinate, metti il club in fondo
              return { ...club, distance: 999999 };
            })
          );
          
          const sorted = clubsWithDistance.sort((a, b) => a.distance - b.distance);
          setFilteredClubs(sorted);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Impossibile ottenere la posizione. Verifica i permessi del browser.');
        }
      );
    } else {
      alert('La geolocalizzazione non è supportata dal tuo browser.');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={handleOverlayClick}
      style={{
        animation: 'fadeIn 0.2s ease-out',
        WebkitTapHighlightColor: 'transparent',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Modal Container - Centered */}
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all"
        style={{
          animation: 'scaleIn 0.3s ease-out',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step === 'type' && (
                <button
                  onClick={handleBack}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all flex items-center justify-center"
                  aria-label="Indietro"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {step === 'club' ? 'Scegli il Circolo' : 'Cosa vuoi prenotare?'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all flex items-center justify-center hover:scale-110 active:scale-95"
              aria-label="Chiudi"
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {step === 'club' ? (
            loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : clubs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Nessun circolo disponibile</p>
              </div>
            ) : (
              <>
                {/* Barra di ricerca e filtri */}
                <div className="space-y-3 mb-4">
                  {/* Pulsante toggle ricerca */}
                  <button
                    onClick={toggleSearch}
                    className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    {showSearch ? 'Mostra i tuoi circoli preferiti' : 'Cerca tutti i circoli'}
                  </button>

                  {/* Barra di ricerca attiva */}
                  {showSearch && (
                    <div className="space-y-2">
                      {/* Campo di ricerca testuale */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Cerca per nome o città..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          className="w-full px-4 py-3 pl-11 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all outline-none"
                        />
                        <svg 
                          className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>

                      {/* Pulsante ricerca per posizione */}
                      <button
                        onClick={handleSearchLocation}
                        className="w-full p-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Cerca vicino a me
                      </button>
                    </div>
                  )}
                </div>

                {/* Lista circoli */}
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {filteredClubs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p>Nessun circolo trovato</p>
                  </div>
                ) : (
                  filteredClubs.map((club) => (
                    <button
                      key={club.id}
                      onClick={() => handleClubSelection(club.id)}
                      className="w-full p-4 bg-[#1e293b] hover:bg-[#2d3b52] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-gray-700/50"
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Logo */}
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-gray-600 shrink-0">
                          {club.logoUrl ? (
                            <img
                              src={club.logoUrl}
                              alt={club.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 text-left">
                          <div className="text-lg font-bold">{club.name}</div>
                          <div className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {club.location?.city || club.city || club.address?.city || 'Località'}
                            {club.distance !== undefined && (
                              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                                {club.distance.toFixed(1)} km
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Freccia */}
                        <svg
                          className="w-6 h-6 shrink-0 text-gray-400"
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
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
            )
          ) : (
            // STEP 2: Selezione Tipo Prenotazione
            <>
              {/* Prenota Campo */}
              <button
                onClick={() => handleTypeSelection('campo')}
                className="w-full p-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xl font-bold">Prenota un Campo</div>
                    <div className="text-sm text-white/80 mt-1">
                      Scegli data, ora e campo disponibile
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 shrink-0"
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
                </div>
              </button>

              {/* Prenota Lezione */}
              <button
                onClick={() => handleTypeSelection('lezione')}
                className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xl font-bold">Prenota una Lezione</div>
                    <div className="text-sm text-white/80 mt-1">Scegli maestro, data e orario</div>
                  </div>
                  <svg
                    className="w-6 h-6 shrink-0"
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
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );

  // Use portal to render modal at document.body level, outside of BottomNavigation
  return createPortal(modalContent, document.body);
}
