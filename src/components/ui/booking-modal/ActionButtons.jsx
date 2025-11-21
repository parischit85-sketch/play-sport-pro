import React from 'react';

export default function ActionButtons({
  booking,
  isPast,
  canEdit,
  canCancel,
  isLessonBooking,
  isEditing,
  onToggleEdit,
  onSave,
  _onCancelEdit,
  onCancelBooking,
  _onReview,
  clubInfo,
}) {
  const handleShare = async () => {
    const text = `Ho prenotato un campo a ${clubInfo?.name || 'Play Sport Pro'}! 🎾\nData: ${booking.date}\nOra: ${booking.time}\n\nUnisciti a me!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Prenotazione Play Sport Pro',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(text + '\n' + window.location.href);
      alert('Link copiato negli appunti!');
    }
  };

  const handleDirections = () => {
    if (!clubInfo?.location) return;
    const query = clubInfo.location.coordinates
      ? `${clubInfo.location.coordinates.latitude},${clubInfo.location.coordinates.longitude}`
      : `${clubInfo.name}, ${clubInfo.location.address}, ${clubInfo.location.city}`;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-3 pb-4 md:pb-0">
      {/* Main Action Button */}
      {!isPast && canEdit && !isLessonBooking && (
        <button
          onClick={isEditing ? onSave : onToggleEdit}
          className={`w-full py-3.5 px-4 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
            isEditing
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
          }`}
        >
          {isEditing ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Salva Modifiche
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Gestisci Giocatori
            </>
          )}
        </button>
      )}

      {/* Secondary Actions Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Share */}
        <button
          onClick={handleShare}
          className="col-span-1 bg-gray-700/40 hover:bg-gray-700/60 text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors border border-gray-600/30"
          title="Condividi"
        >
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span className="text-[10px] font-medium text-gray-300">Condividi</span>
        </button>

        {/* Directions */}
        <button
          onClick={handleDirections}
          className="col-span-1 bg-gray-700/40 hover:bg-gray-700/60 text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors border border-gray-600/30"
          title="Indicazioni"
        >
          <svg
            className="w-5 h-5 text-green-400"
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
          <span className="text-[10px] font-medium text-gray-300">Mappa</span>
        </button>

        {/* Cancel (takes 2 slots) */}
        {canCancel && !isPast ? (
          <button
            onClick={() => onCancelBooking && onCancelBooking(booking)}
            className="col-span-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 p-3 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="text-sm font-medium">Cancella</span>
          </button>
        ) : (
          <div className="col-span-2 bg-gray-700/20 text-gray-500 border border-gray-700/30 p-3 rounded-2xl flex items-center justify-center text-xs text-center">
            Non cancellabile
          </div>
        )}
      </div>
    </div>
  );
}
