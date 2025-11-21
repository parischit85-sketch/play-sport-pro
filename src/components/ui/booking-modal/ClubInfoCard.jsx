import React from 'react';

export default function ClubInfoCard({ clubInfo }) {
  if (!clubInfo) return null;

  const handleOpenMaps = () => {
    if (!clubInfo.location) return;

    // Costruisci query per maps
    const query = clubInfo.location.coordinates
      ? `${clubInfo.location.coordinates.latitude},${clubInfo.location.coordinates.longitude}`
      : `${clubInfo.name}, ${clubInfo.location.address}, ${clubInfo.location.city}`;

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleCallClub = () => {
    const phoneNumber = clubInfo.phone || clubInfo.contact?.phone;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const hasPhone = clubInfo.phone || clubInfo.contact?.phone;

  return (
    <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl p-4 border-2 border-gray-700/50 shadow-lg">
      <div className="flex items-center gap-4">
        {/* Logo del club */}
        {clubInfo.logoUrl ? (
          <img
            src={clubInfo.logoUrl}
            alt={clubInfo.name}
            className="w-16 h-16 rounded-xl object-cover shadow-md border-2 border-gray-700"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center shadow-md border-2 border-gray-700 p-2">
            <img
              src="/play-sport-pro_icon_only.svg"
              alt="Play Sport Pro"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/icons/icon.svg'; // Fallback to standard icon if specific one fails
              }}
            />
          </div>
        )}
        {/* Nome e indirizzo club */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{clubInfo.name}</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Pulsante Chiama */}
          {hasPhone && (
            <button
              onClick={handleCallClub}
              className="p-3 bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              title="Chiama il circolo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </button>
          )}

          {/* Pulsante Navigazione */}
          {clubInfo.location && (
            <button
              onClick={handleOpenMaps}
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              title="Portami qui"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
