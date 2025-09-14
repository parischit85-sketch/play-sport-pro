// =============================================
// FILE: src/components/ui/BookingDetailModal.jsx
// =============================================
import React, { useState } from "react";
import Modal from "@ui/Modal.jsx";
import Badge from "@ui/Badge.jsx";
import { BOOKING_CONFIG } from "@services/bookings.js";

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

  if (!booking) return null;

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
      onEdit({ ...booking, players: editedPlayers });
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
        {/* Header compatto */}
        <div className="bg-gradient-to-br from-blue-500/90 to-blue-600/90 backdrop-blur-xl rounded-2xl p-6 text-white shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🏟️</span>
              </div>
              <div>
                <h2 className="font-bold text-xl">
                  {court?.name || `Campo ${booking.courtId}`}
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

        {/* Giocatori - Con stile della conferma prenotazione quando in editing */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-xl p-5 shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
            👥 GIOCATORI ({booking.players?.length || 1}/4)
          </div>

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
              /* Modalità editing - Stile come conferma prenotazione */
              <div className="space-y-3">
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

                {/* Aggiungi nuovo giocatore */}
                {editedPlayers.length < 4 && (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const newPlayers = editedPlayers
                            ? [...editedPlayers]
                            : [
                                booking.userName ||
                                  booking.userEmail ||
                                  "Organizzatore",
                              ];
                          if (newPlayerName.trim()) {
                            newPlayers.push({
                              name: newPlayerName.trim(),
                              id: Date.now(),
                            });
                            setEditedPlayers(newPlayers);
                            setNewPlayerName("");
                          }
                        }
                      }}
                      placeholder="Nome nuovo giocatore"
                      className="flex-1 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border-2 border-white/30 dark:border-gray-600/30 rounded-xl text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors shadow-sm"
                    />
                    <button
                      onClick={() => {
                        const newPlayers = editedPlayers
                          ? [...editedPlayers]
                          : [
                              booking.userName ||
                                booking.userEmail ||
                                "Organizzatore",
                            ];
                        if (newPlayerName.trim()) {
                          newPlayers.push({
                            name: newPlayerName.trim(),
                            id: Date.now(),
                          });
                          setEditedPlayers(newPlayers);
                          setNewPlayerName("");
                        }
                      }}
                      disabled={!newPlayerName.trim()}
                      className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Aggiungi
                    </button>
                  </div>
                )}

                {/* Pulsanti di controllo editing */}
                <div className="flex gap-3 mt-5 pt-4 border-t border-white/20 dark:border-gray-700/20">
                  <button
                    onClick={handleSaveChanges}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl text-sm font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    💾 Salva Modifiche
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ❌ Annulla
                  </button>
                </div>
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
        </div>

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
          {!isPast && canEdit && (
            <button
              onClick={handleToggleEdit}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {isEditingPlayers
                ? "💾 Salva Modifiche"
                : "✏️ Modifica Giocatori"}
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
    </Modal>
  );
}
