// =============================================
// FILE: src/components/ui/BookingDetailModal.jsx
// =============================================
import React, { useState, useEffect, useCallback } from "react";
import Modal from "@ui/Modal.jsx";
import Badge from "@ui/Badge.jsx";
import { BOOKING_CONFIG } from "@services/bookings.js";
import { searchUsers } from "@services/users.js";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@services/firebase.js";

export default function BookingDetailModal({
  booking,
  isOpen,
  onClose,
  state,
  T,
  onShare,
  onCancel,
  onEdit,
  onReview,
}) {
  const [isEditingPlayers, setIsEditingPlayers] = useState(false);
  const [editedPlayers, setEditedPlayers] = useState(booking?.players || []);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [clubInfo, setClubInfo] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Carica info del club
  useEffect(() => {
    const loadClubInfo = async () => {
      if (booking?.clubId) {
        try {
          const clubDoc = await getDoc(doc(db, 'clubs', booking.clubId));
          if (clubDoc.exists()) {
            setClubInfo({ id: clubDoc.id, ...clubDoc.data() });
          }
        } catch (error) {
          console.error('Error loading club info:', error);
        }
      }
    };
    loadClubInfo();
  }, [booking?.clubId]);

  // Ricerca utenti quando l'utente digita
  const handleSearchUsers = useCallback(async (searchTerm) => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const results = await searchUsers(searchTerm, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  if (!booking) return null;

  // Determina se è una prenotazione di lezione
  const isLessonBooking = booking.instructorId || booking.isLessonBooking || booking.type === 'lesson';

  // Usa i campi da state se disponibili, altrimenti da BOOKING_CONFIG
  const courts = state?.courts || BOOKING_CONFIG.courts;
  const court = courts?.find((c) => c.id === booking.courtId);

  const bookingDate = new Date(booking.date);
  const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
  const now = new Date();

  const isToday = bookingDate.toDateString() === new Date().toDateString();
  const isTomorrow =
    bookingDate.toDateString() ===
    new Date(Date.now() + 86400000).toDateString();
  const isPast = bookingDateTime < now;
  const isUpcoming =
    bookingDateTime > now &&
    bookingDateTime <= new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Calcola se la cancellazione è possibile (30 ore prima)
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  const canCancel = hoursUntilBooking > 30;
  const canEdit = !isPast; // Può modificare solo se non è passata

  // Helper function per ottenere il nome visualizzabile di un giocatore
  const getPlayerDisplayName = (player) => {
    if (!player) return "";
    if (typeof player === "string") return player;
    if (typeof player === "object") {
      return player.name || player.email || "";
    }
    return String(player);
  };

  // Funzioni per l'editing
  const handleSaveChanges = () => {
    if (onEdit && editedPlayers !== booking.players) {
      // Normalizza i players: converti gli oggetti in stringhe
      const normalizedPlayers = editedPlayers.map(player => {
        if (typeof player === 'string') {
          return player;
        }
        if (typeof player === 'object' && player !== null) {
          return player.name || player.email || String(player);
        }
        return String(player);
      });
      
      const bookingToUpdate = { ...booking, players: normalizedPlayers };
      onEdit(bookingToUpdate);
    }
    setIsEditingPlayers(false);
  };

  const handleCancelEdit = () => {
    setEditedPlayers(booking.players);
    setIsEditingPlayers(false);
  };

  const handleToggleEdit = () => {
    if (isEditingPlayers) {
      handleSaveChanges();
    } else {
      setIsEditingPlayers(true);
    }
  };

  let dateLabel;
  if (isPast) {
    dateLabel = "Passata";
  } else if (isToday) {
    dateLabel = "Oggi";
  } else if (isTomorrow) {
    dateLabel = "Domani";
  } else {
    dateLabel = bookingDate.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // Calcola il tempo rimanente
  const timeUntilBooking = bookingDateTime - now;
  const hoursUntil = Math.floor(timeUntilBooking / (1000 * 60 * 60));
  const minutesUntil = Math.floor(
    (timeUntilBooking % (1000 * 60 * 60)) / (1000 * 60),
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Dettaglio Prenotazione"
      T={T}
      size="md"
    >
      <div className="space-y-6">
        {/* Club info in cima */}
        {clubInfo && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-4 border-2 border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="flex items-center gap-4">
              {/* Logo del club */}
              {clubInfo.logoUrl ? (
                <img
                  src={clubInfo.logoUrl}
                  alt={clubInfo.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-md border-2 border-white dark:border-gray-700"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md border-2 border-white dark:border-gray-700">
                  <span className="text-2xl">🎾</span>
                </div>
              )}
              {/* Nome e indirizzo club */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {clubInfo.name}
                </h3>
                {clubInfo.location && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    📍 {clubInfo.location.city}{clubInfo.location.region && `, ${clubInfo.location.region}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header compatto */}
        <div className={`bg-gradient-to-br ${isLessonBooking ? 'from-green-500/90 to-green-600/90' : 'from-blue-500/90 to-blue-600/90'} backdrop-blur-xl rounded-2xl p-6 text-white shadow-lg ${isLessonBooking ? 'shadow-green-100/30 dark:shadow-green-900/20' : 'shadow-blue-100/30 dark:shadow-blue-900/20'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">{isLessonBooking ? '🎾' : '🏟️'}</span>
              </div>
              <div>
                <h2 className="font-bold text-xl">
                  {isLessonBooking 
                    ? (booking.lessonType || 'Lezione di Tennis')
                    : (booking.courtName || court?.name || 'Campo da Gioco')
                  }
                </h2>
                <div className="text-white/90 text-sm">
                  {dateLabel} • {booking.time}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                €{booking.price || "N/A"}
              </div>
              <div className="text-white/80 text-sm">
                {booking.duration || 60} minuti
              </div>
            </div>
          </div>

          {/* Status badges compatti */}
          <div className="flex flex-wrap gap-2">
            {isPast && (
              <Badge variant="secondary" size="xs" T={T}>
                Completata
              </Badge>
            )}
            {isToday && !isPast && (
              <Badge variant="warning" size="xs" T={T}>
                Oggi
              </Badge>
            )}
            {isUpcoming && (
              <Badge variant="success" size="xs" T={T}>
                Prossima
              </Badge>
            )}
            {booking.confirmed && (
              <Badge variant="primary" size="xs" T={T}>
                Confermata
              </Badge>
            )}
          </div>
        </div>

        {/* Giocatori/Istruttore - Con stile della conferma prenotazione quando in editing */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl p-5 shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
            {isLessonBooking 
              ? '🎾 DETTAGLI LEZIONE'
              : `👥 GIOCATORI (${booking.players?.length || 1}/4)`
            }
          </div>

          {isLessonBooking ? (
            /* Modalità lezione - Mostra istruttore e partecipanti */
            <div className="space-y-3">
              {/* Istruttore */}
              {booking.instructor && (
                <div className="p-4 bg-gradient-to-r from-green-50/80 to-green-100/80 dark:from-green-900/30 dark:to-green-800/30 backdrop-blur-sm rounded-xl border-l-4 border-green-500 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">🎾</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {booking.instructor.name || booking.instructor.email || 'Istruttore'}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Maestro di Tennis
                        {booking.instructor.email && (
                          <span className="block text-green-600 dark:text-green-400 mt-0.5">
                            {booking.instructor.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Informazioni lezione */}
              <div className="p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Livello</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {booking.level || 'Non specificato'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Partecipanti</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {booking.participants || 1} {booking.participants === 1 ? 'persona' : 'persone'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Studente principale */}
              <div className="p-4 bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 backdrop-blur-sm rounded-xl border-l-4 border-blue-500 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {booking.userName || booking.userEmail || 'Studente'}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Studente principale
                      {booking.userEmail && (
                        <span className="block text-blue-600 dark:text-blue-400 mt-0.5">
                          {booking.userEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Modalità partita - Mostra giocatori come prima */
            <div className="space-y-3">
              {/* Organizzatore - Sempre visibile con stile blu */}
              <div className="p-4 bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 backdrop-blur-sm rounded-xl border-l-4 border-blue-500 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">👑</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {(() => {
                        const currentPlayers = isEditingPlayers
                          ? editedPlayers
                          : booking.players;
                        if (currentPlayers && currentPlayers[0]) {
                          return getPlayerDisplayName(currentPlayers[0]);
                        }
                        return (
                          booking.userName || booking.userEmail || "Organizzatore"
                        );
                      })()}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Organizzatore • Giocatore 1
                      {booking.userEmail && (
                        <span className="block text-blue-600 dark:text-blue-400 mt-0.5">
                          {booking.userEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            {/* Altri giocatori */}
            {isEditingPlayers ? (
              /* Modalità editing - Ridisegnata completamente */
              <div className="space-y-4 pb-4">
                {/* Giocatori esistenti (modificabili) */}
                {editedPlayers &&
                  editedPlayers.length > 1 &&
                  editedPlayers.slice(1).map((participant, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 flex items-center gap-3 shadow-sm"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm">👤</span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={getPlayerDisplayName(participant)}
                          onChange={(e) => {
                            const newPlayers = [...editedPlayers];
                            if (typeof participant === "object") {
                              newPlayers[index + 1] = {
                                ...participant,
                                name: e.target.value,
                              };
                            } else {
                              newPlayers[index + 1] = e.target.value;
                            }
                            setEditedPlayers(newPlayers);
                          }}
                          className="w-full text-sm font-medium text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-gray-300 dark:border-gray-500 focus:border-green-500 dark:focus:border-green-400 outline-none pb-1 transition-colors"
                          placeholder="Nome giocatore"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Giocatore {index + 2}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newPlayers = [...editedPlayers];
                          newPlayers.splice(index + 1, 1);
                          setEditedPlayers(newPlayers);
                        }}
                        className="w-9 h-9 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm"
                      >
                        <span className="text-sm">✕</span>
                      </button>
                    </div>
                  ))}

                {/* Aggiungi nuovo giocatore - Sezione separata */}
                {editedPlayers.length < 4 && (
                  <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      ➕ Aggiungi giocatore
                    </h4>
                    
                    {/* Input e bottone sulla stessa riga */}
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={newPlayerName}
                          onChange={(e) => {
                            setNewPlayerName(e.target.value);
                            handleSearchUsers(e.target.value);
                          }}
                          onFocus={() => {
                            if (newPlayerName.length >= 2) {
                              setShowSearchResults(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay per permettere il click sui risultati
                            setTimeout(() => setShowSearchResults(false), 200);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setShowSearchResults(false);
                            }
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newPlayerName.trim()) {
                                const newPlayers = [...editedPlayers];
                                newPlayers.push({
                                  name: newPlayerName.trim(),
                                  id: Date.now(),
                                });
                                setEditedPlayers(newPlayers);
                                setNewPlayerName("");
                                setShowSearchResults(false);
                              }
                            }
                          }}
                          placeholder="🔍 Cerca per nome, email o telefono..."
                          className="w-full p-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 outline-none transition-all"
                        />
                        
                        {/* Dropdown risultati - Posizionamento assoluto migliorato */}
                        {showSearchResults && newPlayerName.length >= 2 && (
                          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-blue-500 dark:border-blue-400 max-h-64 overflow-y-auto">
                            {isSearching ? (
                              <div className="p-4 text-center">
                                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ricerca...</p>
                              </div>
                            ) : searchResults.length > 0 ? (
                              <div className="py-1">
                                {searchResults.map((user) => (
                                  <button
                                    key={user.uid}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      const newPlayers = [...editedPlayers];
                                      newPlayers.push({
                                        name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                                        email: user.email,
                                        phone: user.phone,
                                        uid: user.uid,
                                        id: user.uid,
                                      });
                                      setEditedPlayers(newPlayers);
                                      setNewPlayerName("");
                                      setShowSearchResults(false);
                                      setSearchResults([]);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-left"
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-xs font-bold">
                                        {(user.displayName || user.firstName || user.email)?.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utente'}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.email}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 text-center">
                                <div className="text-2xl mb-1">🔍</div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nessun utente trovato</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => {
                          if (newPlayerName.trim()) {
                            const newPlayers = [...editedPlayers];
                            newPlayers.push({
                              name: newPlayerName.trim(),
                              id: Date.now(),
                            });
                            setEditedPlayers(newPlayers);
                            setNewPlayerName("");
                            setShowSearchResults(false);
                          }
                        }}
                        disabled={!newPlayerName.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        ➕ Aggiungi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Modalità visualizzazione normale */
              <>
                {booking.players &&
                  booking.players.length > 1 &&
                  booking.players.slice(1).map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 dark:border-gray-600/20 shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">
                          {index + 2}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {getPlayerDisplayName(participant)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Giocatore {index + 2}
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Slot liberi - Solo in modalità visualizzazione */}
                {(() => {
                  const currentPlayers = booking.players?.length || 1;
                  const slotsLiberi = 4 - currentPlayers;

                  return (
                    slotsLiberi > 0 &&
                    Array.from({ length: slotsLiberi }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="flex items-center gap-3 bg-gray-100/60 dark:bg-gray-700/40 backdrop-blur-sm rounded-xl px-4 py-3 border-dashed border border-gray-200/60 dark:border-gray-600/40"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-500 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            ?
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Slot libero
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Giocatore {currentPlayers + index + 1}
                          </div>
                        </div>
                      </div>
                    ))
                  );
                })()} 
              </>
            )}
        </div>
        )}

        {/* Note compatte (solo se presenti) */}
        {booking.notes && (
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl p-4 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20">
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
              📝 NOTE
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {booking.notes}
            </p>
          </div>
        )}

        {/* Azioni compatte */}
        <div className="space-y-3 pb-4 md:pb-0">
          {!isPast && canEdit && !isLessonBooking && (
            <button
              onClick={handleToggleEdit}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {isEditingPlayers
                ? "💾 Salva Modifiche"
                : "✏️ Modifica Giocatori"}
            </button>
          )}

          {!isPast && canEdit && isLessonBooking && (
            <button
              onClick={() => onEdit && onEdit(booking)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              ✏️ Modifica Lezione
            </button>
          )}

          {/* Messaggio se non si può modificare */}
          {!isPast && !canEdit && (
            <div className="w-full bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 text-gray-600 dark:text-gray-300 py-4 px-4 rounded-xl text-sm text-center shadow-sm">
              ⏰ Modifiche disponibili fino a 30 ore prima
            </div>
          )}

          <div className="flex gap-3">
            {!isPast ? (
              <>
                <button
                  onClick={() => onShare && onShare(booking)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  📧 Condividi
                </button>
                {canCancel ? (
                  <button
                    onClick={() => onCancel && onCancel(booking)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    🚫 Cancella
                  </button>
                ) : (
                  <div className="flex-1 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 text-gray-600 dark:text-gray-300 py-4 px-4 rounded-xl text-sm text-center shadow-sm">
                    ⏰ Non cancellabile (meno di 30h)
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => onReview && onReview(booking)}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                ⭐ Lascia Recensione
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </Modal>
  );
}
