// =============================================
// FILE: src/components/booking/UnifiedBookingFlow.jsx
// Componente per il flusso unificato di prenotazione
// =============================================
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext.jsx";
import { useClub } from "@contexts/ClubContext.jsx";
import { getClubs } from "@services/clubs.js";
import ClubCard from "@features/clubs/ClubCard.jsx";
import { LoadingSpinner } from "@components/LoadingSpinner.jsx";

const BOOKING_STEPS = {
  CLUB_SELECTION: 'club_selection',
  BOOKING_TYPE_SELECTION: 'booking_type_selection'
};

export default function UnifiedBookingFlow() {
  const { user, userAffiliations } = useAuth();
  const { selectClub } = useClub();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(BOOKING_STEPS.CLUB_SELECTION);
  const [selectedClub, setSelectedClub] = useState(null);
  const [allClubs, setAllClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomSearch, setShowCustomSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const clubs = await getClubs();
      setAllClubs(clubs || []);
    } catch (err) {
      console.error('Error loading clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get affiliated clubs
  const affiliatedClubs = useMemo(() => {
    if (!user || !userAffiliations || !allClubs.length) return [];
    return allClubs.filter(club => 
      userAffiliations.some(aff => aff.clubId === club.id && aff.status === "approved")
    );
  }, [allClubs, userAffiliations, user]);

  // Get nearby clubs (excluding affiliated ones)
  const nearbyClubs = useMemo(() => {
    if (!allClubs.length) return [];
    return allClubs
      .filter(club => !affiliatedClubs.some(aff => aff.id === club.id))
      .slice(0, 6);
  }, [allClubs, affiliatedClubs]);

  const handleClubSelect = async (club) => {
    setSelectedClub(club);
    setCurrentStep(BOOKING_STEPS.BOOKING_TYPE_SELECTION);
  };

  const handleBookingTypeSelect = async (bookingType) => {
    try {
      // Seleziona il circolo nel contesto
      await selectClub(selectedClub.id);
      
      // Naviga alla pagina appropriata del circolo
      const path = bookingType === 'campo' 
        ? `/club/${selectedClub.id}/booking`
        : `/club/${selectedClub.id}/lessons`;
      
      navigate(path);
    } catch (error) {
      console.error('Error selecting club:', error);
    }
  };

  const handleBack = () => {
    if (currentStep === BOOKING_STEPS.BOOKING_TYPE_SELECTION) {
      setCurrentStep(BOOKING_STEPS.CLUB_SELECTION);
      setSelectedClub(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Step 1: Club Selection
  if (currentStep === BOOKING_STEPS.CLUB_SELECTION) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">🎾</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Seleziona un Circolo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scegli il circolo dove vuoi prenotare
          </p>
        </div>

        {/* Circoli Affiliati */}
        {user && affiliatedClubs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">I Tuoi Circoli</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Circoli dove hai un'affiliazione attiva
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {affiliatedClubs.map(club => (
                <div key={club.id} className="relative cursor-pointer" onClick={() => handleClubSelect(club)}>
                  <ClubCard club={club} />
                  <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                    Affiliato
                  </div>
                  <div className="absolute inset-0 bg-blue-500/10 rounded-lg border-2 border-blue-500/20 hover:border-blue-500/40 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Circoli Nelle Vicinanze */}
        {nearbyClubs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📍</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Circoli Nelle Vicinanze</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Altri circoli disponibili per prenotazioni
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {nearbyClubs.map(club => (
                <div key={club.id} className="relative cursor-pointer" onClick={() => handleClubSelect(club)}>
                  <ClubCard club={club} />
                  <div className="absolute inset-0 bg-blue-500/10 rounded-lg border-2 border-blue-500/20 hover:border-blue-500/40 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ricerca Altri Circoli */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center mb-6">
            <button
              onClick={() => setShowCustomSearch(!showCustomSearch)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-lg font-medium rounded-lg transition-all inline-flex items-center gap-2"
            >
              🔍 {showCustomSearch ? 'Nascondi Ricerca' : 'Cerca Altri Circoli'}
            </button>
          </div>

          {showCustomSearch && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔍</span>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cerca Circolo</h2>
              </div>

              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Cerca per nome del club o città..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {searchQuery && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {allClubs
                    .filter(club => 
                      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (club.city && club.city.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map(club => (
                      <div key={club.id} className="relative cursor-pointer" onClick={() => handleClubSelect(club)}>
                        <ClubCard club={club} />
                        <div className="absolute inset-0 bg-blue-500/10 rounded-lg border-2 border-blue-500/20 hover:border-blue-500/40 transition-colors" />
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Booking Type Selection
  if (currentStep === BOOKING_STEPS.BOOKING_TYPE_SELECTION && selectedClub) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Torna alla selezione circolo
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎾</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Cosa vuoi prenotare?
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              presso <strong>{selectedClub.name}</strong>
            </p>
            {selectedClub.city && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {selectedClub.city}
              </p>
            )}
          </div>

          {/* Booking Type Options */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Prenota Campo */}
            <button
              onClick={() => handleBookingTypeSelect('campo')}
              className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 hover:shadow-lg"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎾</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Prenota Campo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Prenota un campo per giocare con i tuoi amici
              </p>
            </button>

            {/* Prenota Lezione - Controlla se le lezioni sono abilitate */}
            <button
              onClick={() => handleBookingTypeSelect('lezione')}
              className="group p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📚</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Prenota Lezione
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Prenota una lezione con un istruttore
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}