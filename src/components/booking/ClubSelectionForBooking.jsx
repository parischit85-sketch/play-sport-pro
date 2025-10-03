// =============================================
// FILE: src/components/booking/ClubSelectionForBooking.jsx
// Componente per la selezione del circolo prima delle prenotazioni
// =============================================
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext.jsx";
import { useClub } from "@contexts/ClubContext.jsx";
import { createDSClasses } from "@lib/design-system.js";
import { getClubs } from "@services/clubs.js";

export default function ClubSelectionForBooking({ bookingType = "campo", T }) {
  const { user } = useAuth();
  const { selectClub } = useClub();
  const navigate = useNavigate();
  const ds = createDSClasses(T);

  const [clubs, setClubs] = useState([]);
  const [userAffiliations, setUserAffiliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const bookingTypeLabel = bookingType === "campo" ? "Campo" : "Lezione";

  useEffect(() => {
    loadClubsAndAffiliations();
  }, [user]);

  const loadClubsAndAffiliations = async () => {
    try {
      setLoading(true);
      
      // Carica tutti i circoli
      const allClubs = await getClubs();
      setClubs(allClubs || []);

      // Carica affiliazioni dell'utente se loggato
      if (user) {
        const userAffiliationsData = user.affiliations || [];
        setUserAffiliations(userAffiliationsData);
      }
    } catch (error) {
      console.error("Errore nel caricamento circoli:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClubSelect = async (club) => {
    try {
      // Seleziona il circolo nel contesto
      await selectClub(club.id);
      
      // Naviga alla pagina di prenotazione specifica del circolo
      const bookingPath = bookingType === "campo" ? "booking" : "lessons";
      navigate(`/club/${club.id}/${bookingPath}`);
    } catch (error) {
      console.error("Errore nella selezione del circolo:", error);
    }
  };

  // Filtra circoli per affiliazioni
  const affiliatedClubs = clubs.filter(club => 
    userAffiliations.some(aff => aff.clubId === club.id && aff.status === "approved")
  );

  // Filtra circoli per ricerca
  const searchFilteredClubs = searchTerm 
    ? clubs.filter(club => 
        club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.address?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Circoli vicini (per ora tutti gli altri, in futuro si può aggiungere geolocalizzazione)
  const nearbyClubs = clubs.filter(club => 
    !affiliatedClubs.some(aff => aff.id === club.id)
  ).slice(0, 6); // Limita a 6 circoli per non sovraccaricare

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className={`${T.cardBg} ${T.border} rounded-lg p-6 text-center`}>
        <div className="space-y-4">
          <div className="text-6xl">🎾</div>
          <h1 className={`${ds.h2} text-gray-900 dark:text-white`}>
            Prenota {bookingTypeLabel}
          </h1>
          <p className={`${ds.bodyLg} text-gray-600 dark:text-gray-400 max-w-2xl mx-auto`}>
            Scegli prima il circolo dove vuoi prenotare un {bookingType === "campo" ? "campo" : "lezione"}. 
            Ti mostreremo prima i circoli dove sei affiliato, poi quelli più vicini.
          </p>
        </div>
      </div>

      {/* Circoli Affiliati */}
      {user && affiliatedClubs.length > 0 && (
        <div className={`${T.cardBg} ${T.border} rounded-lg p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <h2 className={`${ds.h4} font-semibold`}>I Tuoi Circoli</h2>
          </div>
          <p className={`${ds.bodySm} text-gray-600 dark:text-gray-400 mb-4`}>
            Circoli dove hai un'affiliazione attiva
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {affiliatedClubs.map((club) => (
              <div key={club.id} className="relative">
                <div
                  onClick={() => handleClubSelect(club)}
                  className={`${T.cardBg} ${T.border} rounded-lg p-4 cursor-pointer hover:scale-[1.02] transition-transform hover:shadow-lg`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className={`${ds.h6} font-semibold`}>{club.name}</h3>
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-xs">
                        Affiliato
                      </span>
                    </div>
                    {club.location && (
                      <p className={`${ds.bodySm} text-gray-600 dark:text-gray-400`}>
                        📍 {club.location.city}
                        {club.location.address && `, ${club.location.address}`}
                      </p>
                    )}
                    <div className="text-center pt-2">
                      <button className={`${T.btnPrimary} w-full py-2 text-sm`}>
                        Prenota {bookingTypeLabel}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Circoli Vicini */}
      {nearbyClubs.length > 0 && (
        <div className={`${T.cardBg} ${T.border} rounded-lg p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📍</span>
            <h2 className={`${ds.h4} font-semibold`}>Circoli Nelle Vicinanze</h2>
          </div>
          <p className={`${ds.bodySm} text-gray-600 dark:text-gray-400 mb-4`}>
            Altri circoli disponibili per le prenotazioni
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyClubs.map((club) => (
              <div
                key={club.id}
                onClick={() => handleClubSelect(club)}
                className={`${T.cardBg} ${T.border} rounded-lg p-4 cursor-pointer hover:scale-[1.02] transition-transform hover:shadow-lg`}
              >
                <div className="space-y-3">
                  <h3 className={`${ds.h6} font-semibold`}>{club.name}</h3>
                  {club.location && (
                    <p className={`${ds.bodySm} text-gray-600 dark:text-gray-400`}>
                      📍 {club.location.city}
                      {club.location.address && `, ${club.location.address}`}
                    </p>
                  )}
                  <div className="text-center pt-2">
                    <button className={`${T.btnSecondary} w-full py-2 text-sm`}>
                      Prenota {bookingTypeLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pulsante Cerca Altri Circoli */}
      <div className={`${T.cardBg} ${T.border} rounded-lg p-6 text-center`}>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`${T.btnPrimary} px-6 py-3 text-lg font-medium transition-all`}
        >
          🔍 Cerca Altri Circoli
        </button>
      </div>

      {/* Sezione Ricerca */}
      {showSearch && (
        <div className={`${T.cardBg} ${T.border} rounded-lg p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className={`${ds.h4} font-semibold`}>Cerca Circoli</h2>
          </div>
          <div className="max-w-md mx-auto mb-6">
            <input
              type="text"
              placeholder="Cerca per nome, città o indirizzo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-3 rounded-lg border-2 ${T.border} ${T.inputBg} focus:outline-none focus:ring-2 ${T.primaryRing} transition-all`}
            />
          </div>

          {searchTerm && searchFilteredClubs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {searchFilteredClubs.map((club) => (
                <div
                  key={club.id}
                  onClick={() => handleClubSelect(club)}
                  className={`${T.cardBg} ${T.border} rounded-lg p-4 cursor-pointer hover:scale-[1.02] transition-transform hover:shadow-lg`}
                >
                  <div className="space-y-3">
                    <h3 className={`${ds.h6} font-semibold`}>{club.name}</h3>
                    {club.location && (
                      <p className={`${ds.bodySm} text-gray-600 dark:text-gray-400`}>
                        📍 {club.location.city}
                        {club.location.address && `, ${club.location.address}`}
                      </p>
                    )}
                    <div className="text-center pt-2">
                      <button className={`${T.btnSecondary} w-full py-2 text-sm`}>
                        Prenota {bookingTypeLabel}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchTerm && searchFilteredClubs.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">❌</div>
              <p className={`${ds.bodyLg} text-gray-600 dark:text-gray-400`}>
                Nessun circolo trovato per "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Messaggio se non ci sono circoli */}
      {clubs.length === 0 && !loading && (
        <div className={`${T.cardBg} ${T.border} rounded-lg p-6 text-center`}>
          <div className="space-y-4">
            <div className="text-4xl">😔</div>
            <p className={`${ds.bodyLg} text-gray-600 dark:text-gray-400`}>
              Non ci sono circoli disponibili al momento
            </p>
          </div>
        </div>
      )}

      {/* Pulsante per tornare alla dashboard */}
      <div className={`${T.cardBg} ${T.border} rounded-lg p-6 text-center`}>
        <button
          onClick={() => navigate("/dashboard")}
          className={`${T.btnSecondary} px-4 py-2 text-sm`}
        >
          ← Torna alla Dashboard
        </button>
      </div>
    </div>
  );
}