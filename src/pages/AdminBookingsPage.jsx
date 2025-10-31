// =============================================
// FILE: src/pages/AdminBookingsPage.jsx
// =============================================
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { themeTokens } from '@lib/theme.js';
import { useClub } from '@contexts/ClubContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClubSettings } from '@hooks/useClubSettings.js';
import PrenotazioneCampi from '@features/prenota/PrenotazioneCampi.jsx';
import Extra from '@features/extra/Extra.jsx';
import { db } from '@services/firebase.js';
import { writeBatch, doc, collection } from 'firebase/firestore';

export default function AdminBookingsPage() {
  const navigate = useNavigate();
  const { clubId } = useParams(); // Ottieni clubId dalla URL
  const { players, matches, courts, addCourt, updateCourt, deleteCourt } = useClub();

  const playersById = React.useMemo(
    () => Object.fromEntries((players || []).map((p) => [p.id, p])),
    [players]
  );
  const loading = !players; // basic fallback
  const { clubMode, setClubMode } = useUI();
  const { isClubAdmin, userRole, user } = useAuth();
  const { bookingConfig, updateBookingConfig } = useClubSettings({ clubId });
  const T = React.useMemo(() => themeTokens(), []);

  // Stato per mostrare/nascondere le impostazioni
  const [showSettings, setShowSettings] = React.useState(false);

  // Stato locale per gestire le modifiche ai campi prima del salvataggio
  const [localCourts, setLocalCourts] = React.useState([]);

  // bookingConfig ora viene da useClubSettings

  // Sincronizza i campi locali con quelli del ClubContext
  React.useEffect(() => {
    setLocalCourts(courts || []);
  }, [courts]);

  // Il salvataggio è gestito automaticamente da useClubSettings

  // Gli admin di club possono sempre accedere, anche senza clubMode attivato
  // Passa esplicitamente il clubId dalla URL alla funzione isClubAdmin
  const canAccessBookings = clubMode || isClubAdmin(clubId);

  // Show loading state
  if (loading) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-4xl mb-4">⏳</div>
        <h3 className={`text-lg font-medium mb-2 ${T.text}`}>Caricamento...</h3>
        <p className={`${T.subtext}`}>Caricamento configurazione campi in corso...</p>
      </div>
    );
  }

  if (!canAccessBookings) {
    return (
      <div className={`text-center py-12 ${T.cardBg} ${T.border} rounded-xl m-4`}>
        <div className="text-6xl mb-4">🔒</div>
        <h3 className={`text-xl font-bold mb-2 ${T.text}`}>Modalità Club Richiesta</h3>
        <p className={`${T.subtext} mb-4`}>
          {userRole === 'super_admin' || (user && user.userProfile?.role === 'admin')
            ? 'Per accedere alla gestione campi, devi prima sbloccare la modalità club nella sezione Extra.'
            : 'Per accedere alla gestione campi, è necessario avere privilegi di amministratore del club.'}
        </p>
        {(userRole === 'super_admin' || (user && user.userProfile?.role === 'admin')) && (
          <button onClick={() => navigate('/extra')} className={`${T.btnPrimary} px-6 py-3`}>
            Vai a Extra per sbloccare
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Bottone Impostazioni - posizionato in alto a destra */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
            showSettings
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          } border border-gray-600`}
          title="Impostazioni Avanzate"
        >
          <span className="text-xl">⚙️</span>
        </button>
      </div>

      {/* Modal/Overlay Impostazioni */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="fixed inset-y-0 right-0 w-full max-w-5xl bg-gray-900 shadow-xl overflow-y-auto z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Impostazioni Avanzate</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-200"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
            <div className="p-4">
              <Extra
                T={T}
                state={{ players, matches, courts: localCourts, bookingConfig }}
                setState={async (newState) => {
                  // Gestisci bookingConfig
                  if (newState.bookingConfig) {
                    try {
                      await updateBookingConfig(newState.bookingConfig, {
                        source: 'admin-settings',
                      });
                    } catch (error) {
                      console.error('Errore salvataggio bookingConfig:', error);
                      alert('Errore durante il salvataggio delle impostazioni');
                    }
                  }

                  // Se i campi sono cambiati, salvali in Firebase
                  if (
                    newState.courts &&
                    JSON.stringify(newState.courts) !== JSON.stringify(localCourts)
                  ) {
                    // Crea mappe per confronto rapido
                    const existingCourtsMap = new Map(localCourts.map((c) => [c.id, c]));
                    const newCourtsMap = new Map(newState.courts.map((c) => [c.id, c]));

                    // Identifica nuovi campi da aggiungere
                    const newCourts = newState.courts.filter((c) => !existingCourtsMap.has(c.id));

                    // Identifica campi cancellati da rimuovere
                    const deletedCourts = localCourts.filter((c) => !newCourtsMap.has(c.id));

                    // Identifica campi modificati da aggiornare
                    const updatedCourts = newState.courts.filter((newCourt) => {
                      const existingCourt = existingCourtsMap.get(newCourt.id);
                      return (
                        existingCourt && JSON.stringify(existingCourt) !== JSON.stringify(newCourt)
                      );
                    });

                    // Usa writeBatch per operazioni atomiche
                    const batch = writeBatch(db);
                    let hasOperations = false;

                    // Elimina campi cancellati da Firebase
                    for (const court of deletedCourts) {
                      try {
                        const courtRef = doc(
                          db,
                          'clubs',
                          clubId,
                          'courts',
                          court.firebaseId || court.id
                        );
                        batch.delete(courtRef);
                        hasOperations = true;
                        console.log('🗑️ Deleting court from Firebase:', court.name, court.id);
                      } catch (error) {
                        console.error('Errore eliminazione campo:', error);
                        alert(`Errore eliminazione campo ${court.name}: ${error.message}`);
                      }
                    }

                    // Aggiungi nuovi campi a Firebase e aggiorna gli ID locali
                    const updatedNewState = { ...newState };
                    for (let i = 0; i < newCourts.length; i++) {
                      const court = newCourts[i];
                      try {
                        const courtsRef = collection(db, 'clubs', clubId, 'courts');
                        const docRef = doc(courtsRef);

                        // Rimuovi il campo 'id' temporaneo prima di salvare in Firebase
                        // Firebase genererà automaticamente un ID univoco (docRef.id)
                        const { id: _, firebaseId: __, ...courtDataToSave } = court;

                        batch.set(docRef, courtDataToSave);

                        // Aggiorna l'ID nel nuovo state
                        const courtIndex = updatedNewState.courts.findIndex(
                          (c) => c.id === court.id
                        );
                        if (courtIndex !== -1) {
                          updatedNewState.courts[courtIndex] = {
                            ...updatedNewState.courts[courtIndex],
                            id: docRef.id,
                            firebaseId: docRef.id,
                          };
                        }
                        hasOperations = true;
                      } catch (error) {
                        console.error('Errore aggiunta campo:', error);
                        alert(`Errore aggiunta campo ${court.name}: ${error.message}`);
                      }
                    }

                    // Ricalcola i campi modificati usando il nuovo state con ID corretti
                    const finalUpdatedCourts = updatedNewState.courts.filter((newCourt) => {
                      const existingCourt = existingCourtsMap.get(newCourt.id);
                      return (
                        existingCourt && JSON.stringify(existingCourt) !== JSON.stringify(newCourt)
                      );
                    });

                    // Aggiorna campi esistenti in Firebase
                    for (const court of finalUpdatedCourts) {
                      try {
                        const courtRef = doc(
                          db,
                          'clubs',
                          clubId,
                          'courts',
                          court.firebaseId || court.id
                        );
                        batch.update(courtRef, court);
                        hasOperations = true;
                      } catch (error) {
                        console.error('Errore aggiornamento campo:', error);
                        alert(`Errore aggiornamento campo ${court.name}: ${error.message}`);
                      }
                    }

                    // Esegui il batch se ci sono operazioni
                    if (hasOperations) {
                      try {
                        await batch.commit();
                        console.log('✅ Batch courts update completed');
                      } catch (error) {
                        console.error('Errore batch update courts:', error);
                        alert('Errore durante il salvataggio dei campi');
                      }
                    }

                    // Aggiorna lo stato locale con gli ID corretti
                    setLocalCourts(updatedNewState.courts);
                  }
                }}
                derived={{ players, matches }}
                leagueId={clubId}
                setLeagueId={() => {}}
                clubMode={clubMode}
                setClubMode={setClubMode}
                userRole={userRole}
                isClubAdmin={isClubAdmin}
                clubId={clubId}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contenuto principale - Gestione Campi */}
      <PrenotazioneCampi
        T={T}
        state={{ players, matches, courts: localCourts, bookingConfig }}
        setState={() => {}}
        players={players}
        playersById={playersById}
        clubId={clubId}
      />
    </div>
  );
}
