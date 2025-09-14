// =============================================
// FILE: src/components/ui/UserBookingsCard.jsx
// =============================================
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BOOKING_CONFIG, updateBooking } from "@services/bookings.js";
import { useUserBookingsFast } from "@hooks/useBookingPerformance.js";
import BookingDetailModal from "@ui/BookingDetailModal.jsx";

// Memoized booking card component
const BookingCard = React.memo(({ booking, onBookingClick, courts, user }) => {
  const court = courts?.find((c) => c.id === booking.courtId);
  const bookingDate = new Date(booking.date);
  const isToday = bookingDate.toDateString() === new Date().toDateString();
  const isTomorrow =
    bookingDate.toDateString() ===
    new Date(Date.now() + 86400000).toDateString();

  const dayName = bookingDate.toLocaleDateString("it-IT", { weekday: "short" });

  let dateLabel;
  if (isToday) {
    dateLabel = "Oggi";
  } else if (isTomorrow) {
    dateLabel = "Domani";
  } else {
    dateLabel = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${bookingDate.getDate()}/${(bookingDate.getMonth() + 1).toString().padStart(2, "0")}`;
  }

  return (
    <div
      onClick={() => onBookingClick(booking)}
      className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-2 border-white/60 dark:border-gray-600/60
        hover:bg-white dark:hover:bg-gray-800 hover:border-blue-300/80 dark:hover:border-blue-400/80 
        hover:shadow-2xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/30 
        p-4 rounded-2xl cursor-pointer transition-all duration-300 group
        min-w-[240px] h-32 sm:min-w-0 sm:h-auto flex-shrink-0 sm:flex-shrink
        transform hover:scale-[1.02] flex flex-col justify-between
        shadow-xl shadow-gray-200/60 dark:shadow-gray-900/40 ring-1 ring-gray-200/30 dark:ring-gray-700/30`}
    >
      {/* Header con data/ora e campo */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-tight mb-1">
            {dateLabel}
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">
            {booking.time.substring(0, 5)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {court?.name || "Padel 1"} • {booking.duration || 60}min
          </div>
        </div>
        {isToday && <div className="w-2 h-2 bg-orange-400 rounded-full"></div>}
      </div>

      {/* Footer con players e prezzo */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Nomi partecipanti */}
          <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate mb-1">
            {booking.bookedBy && (
              <span className="font-medium">{booking.bookedBy}</span>
            )}
            {booking.players && booking.players.length > 0 && (
              <span>
                {booking.bookedBy ? " + " : ""}
                {booking.players.slice(0, 2).map((player, idx) => (
                  <span key={idx}>
                    {player.name || player}
                    {idx < booking.players.slice(0, 2).length - 1 ? ", " : ""}
                  </span>
                ))}
                {booking.players.length > 2 && (
                  <span> +{booking.players.length - 2} altri</span>
                )}
              </span>
            )}
          </div>

          {/* Avatar mini */}
          <div className="flex -space-x-0.5">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white border border-white">
              <span className="text-[9px]">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>

            {(booking.players?.length || 0) > 0 && (
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white border border-white">
                <span className="text-[8px]">+{booking.players.length}</span>
              </div>
            )}

            {(booking.players?.length || 0) + 1 < 4 && (
              <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 border border-white dark:border-gray-700 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Prezzo e status */}
        <div className="text-right">
          {booking.price && (
            <div className="text-xs font-bold text-green-600 dark:text-green-400">
              €{booking.price}
            </div>
          )}
          <div className="text-[9px] text-gray-500 dark:text-gray-400">
            {(booking.players?.length || 0) + 1 < 4 ? "Aperta" : "Completa"}
          </div>
        </div>
      </div>
    </div>
  );
});

// Provide an explicit display name for better debugging and to satisfy lint rules
BookingCard.displayName = "BookingCard";

export default function UserBookingsCard({ user, state, T, compact }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  // Use high-performance booking hook
  const {
    bookings: userBookings,
    loading: isLoading,
    refresh,
    hasBookings,
    lastUpdate,
  } = useUserBookingsFast({
    refreshInterval: 30000, // 30 seconds
    enableBackground: true,
  });

  // Memoize courts lookup for performance
  const courts = useMemo(
    () => state?.courts || BOOKING_CONFIG.courts,
    [state?.courts],
  );

  // Memoized handlers
  const handleBookingClick = useCallback((booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  }, []);

  const handleShare = useCallback(
    async (booking) => {
      const shareText = `Prenotazione Padel 🎾\n${booking.date} alle ${booking.time}\nCampo: ${courts.find((c) => c.id === booking.courtId)?.name || "Padel 1"}\nGiocatori: ${booking.players?.join(", ") || "Da definire"}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Prenotazione Padel",
            text: shareText,
          });
        } catch (err) {
          console.log("Condivisione annullata");
        }
      } else {
        // Fallback per browser che non supportano Web Share API
        navigator.clipboard.writeText(shareText);
        alert("Dettagli prenotazione copiati negli appunti!");
      }
    },
    [courts],
  );

  const handleCancel = useCallback(
    (booking) => {
      if (confirm("Sei sicuro di voler cancellare questa prenotazione?")) {
        // TODO: Implementare logica di cancellazione
        console.log("Cancellazione prenotazione:", booking);
        handleCloseModal();
        refresh(); // Use new refresh method
      }
    },
    [handleCloseModal, refresh],
  );

  const handleEdit = useCallback(
    async (booking) => {
      // Se il booking ha solo cambiamenti ai giocatori, aggiorna direttamente
      if (booking.players && booking.id) {
        try {
          // Aggiorna solo i giocatori della prenotazione
          const updatedBooking = {
            ...selectedBooking,
            players: booking.players,
          };

          await updateBooking(booking.id, { players: booking.players });

          // Aggiorna lo stato locale
          setSelectedBooking(updatedBooking);

          // Ricarica i dati
          refresh();
          console.log("Prenotazione aggiornata con successo");
        } catch (error) {
          console.error("Errore durante l'aggiornamento:", error);
          alert("Errore durante il salvataggio delle modifiche");
        }
      } else {
        // Naviga alla pagina di gestione campi per modifiche più complesse
        navigate(`/admin-bookings?edit=${booking.id}`);
        handleCloseModal();
      }
    },
    [navigate, handleCloseModal, selectedBooking, refresh],
  );

  const handleReview = useCallback((booking) => {
    // TODO: Implementare sistema di recensioni
    console.log("Lascia recensione per:", booking);
    alert("Funzionalità di recensioni in arrivo!");
  }, []);

  // Mostra tutte le prenotazioni in scroll orizzontale
  const displayBookings = userBookings || [];

  // Early return per performance - no loading skeleton if we have cached data
  if (!user) {
    return (
      <div className="bg-gradient-to-br from-gray-50/90 via-blue-50/80 to-indigo-50/90 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-700/90 backdrop-blur-xl border-2 border-blue-200/40 dark:border-blue-700/40 p-6 rounded-3xl shadow-xl shadow-blue-100/30 dark:shadow-blue-900/30">
        <div className="text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Accedi per vedere le prenotazioni
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Effettua il login per gestire le tue prenotazioni
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Accedi
          </button>
        </div>
      </div>
    );
  }

  // Show loading only on initial load
  if (isLoading && (!displayBookings.length || lastUpdate === 0)) {
    return (
      <div className="bg-gradient-to-br from-gray-50/90 via-blue-50/80 to-indigo-50/90 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-700/90 backdrop-blur-xl border-2 border-blue-200/40 dark:border-blue-700/40 p-6 rounded-3xl shadow-xl shadow-blue-100/30 dark:shadow-blue-900/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📅</div>
            <div>
              <div className="h-5 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="h-6 w-8 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg animate-pulse"></div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm p-4 rounded-xl border-2 border-white/40 dark:border-gray-600/40 animate-pulse shadow-lg shadow-gray-200/40 dark:shadow-gray-900/30 ring-1 ring-gray-200/20 dark:ring-gray-700/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-32"></div>
                </div>
                <div className="text-right">
                  <div className="h-3 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-8 mb-1"></div>
                  <div className="h-3 bg-gray-200/60 dark:bg-gray-600/60 rounded-lg w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 dark:border-gray-700/20">
          <div className="h-10 bg-gray-200/60 dark:bg-gray-600/60 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!hasBookings && !isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-50/90 via-blue-50/80 to-indigo-50/90 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-700/90 backdrop-blur-xl border-2 border-blue-200/40 dark:border-blue-700/40 p-6 rounded-3xl shadow-xl shadow-blue-100/30 dark:shadow-blue-900/30">
        <div className="text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Nessuna Prenotazione
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Non hai prenotazioni attive
          </p>
          <button
            onClick={() => navigate("/booking")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Prenota Ora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50/90 via-blue-50/80 to-indigo-50/90 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-700/90 backdrop-blur-xl border-2 border-blue-200/40 dark:border-blue-700/40 p-6 rounded-3xl shadow-xl shadow-blue-100/30 dark:shadow-blue-900/30">
      {/* Header con indicatore di aggiornamento */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="2"
                strokeWidth={1.5}
              />
              <path d="M8 3v4M16 3v4M3 9h18" strokeWidth={1.5} />
            </svg>
          </div>
          Le Tue Prenotazioni
        </h3>
        {isLoading && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-200"></div>
          </div>
        )}
      </div>

      {/* Scroll orizzontale ultra-compatto - stile Playtomic */}
      <div className="overflow-x-auto pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
        <div className="flex gap-2 w-max sm:grid sm:grid-cols-1 sm:gap-3 sm:w-full">
          {displayBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onBookingClick={handleBookingClick}
              courts={courts}
              user={user}
            />
          ))}

          {/* Card "Prenota nuovo" ultra-compatta */}
          <div
            onClick={() => navigate("/booking")}
            className="bg-gradient-to-br from-blue-50/95 to-blue-100/95 dark:from-blue-900/50 dark:to-blue-800/50 
              hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/60 dark:hover:to-blue-700/60
              backdrop-blur-sm border-2 border-dashed border-blue-400/80 dark:border-blue-500/60 rounded-2xl cursor-pointer
              min-w-[240px] h-32 flex-shrink-0 flex flex-col items-center justify-center
              transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-400 group
              hover:shadow-xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/30 transform hover:scale-[1.02]
              ring-1 ring-blue-200/40 dark:ring-blue-700/40"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300 text-center">
              Prenota Campo
            </span>
          </div>
        </div>
      </div>

      {/* Indicatori scroll minimalisti */}
      {displayBookings.length > 0 && (
        <div className="flex justify-center mt-3 sm:hidden">
          <div className="flex gap-1">
            {displayBookings
              .slice(0, Math.min(6, displayBookings.length))
              .map((_, index) => (
                <div
                  key={index}
                  className="w-1 h-1 rounded-full bg-gray-300/60 dark:bg-gray-600/60"
                ></div>
              ))}
            {displayBookings.length > 6 && (
              <div className="w-1 h-1 rounded-full bg-blue-500"></div>
            )}
          </div>
        </div>
      )}

      {/* Tasto Nuova Prenotazione solo su desktop */}
      <div className="hidden sm:block mt-4 pt-4 border-t border-white/20 dark:border-gray-700/20">
        <button
          onClick={() => navigate("/booking")}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          Nuova Prenotazione
        </button>
      </div>

      {/* Modal per dettaglio prenotazione */}
      {showDetailModal && (
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={showDetailModal}
          onClose={handleCloseModal}
          state={state}
          T={T}
          onShare={handleShare}
          onCancel={handleCancel}
          onEdit={handleEdit}
          onReview={handleReview}
        />
      )}
    </div>
  );
}
