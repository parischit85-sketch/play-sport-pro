// =============================================
// FILE: src/features/clubs/ClubCard.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext.jsx';
import { requestAffiliation, getExistingAffiliation, calculateDistance } from '@services/clubs.js';

const ClubCard = ({ club, userLocation, compact = false }) => {
  const navigate = useNavigate();
  const { user, userAffiliations, loadUserAffiliations, AFFILIATION_STATUS } = useAuth();
  const [userAffiliation, setUserAffiliation] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [message, setMessage] = useState(null);

  // Find existing affiliation
  useEffect(() => {
    const existing = userAffiliations.find((a) => a.clubId === club.id);
    setUserAffiliation(existing || null);
  }, [userAffiliations, club.id]);

  // Calculate distance if user location is available
  const distance =
    userLocation && club.location?.coordinates
      ? calculateDistance(
          userLocation.lat,
          userLocation.lng,
          club.location.coordinates.lat,
          club.location.coordinates.lng
        )
      : null;

  // Handle affiliation request
  const handleJoinClub = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsRequesting(true);
    setMessage(null);

    try {
      await requestAffiliation(club.id, user.uid, '');
      setMessage({
        type: 'success',
        text: 'Richiesta di affiliazione inviata con successo!',
      });

      // Reload user affiliations to get the new request
      await loadUserAffiliations();
    } catch (error) {
      console.error('Error requesting affiliation:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Errore durante la richiesta di affiliazione',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  // Handle club entry
  const handleEnterClub = () => {
    console.log('🏢 [ClubCard] Entering club:', club.id);
    navigate(`/club/${club.id}/dashboard`);
  };

  // COMPACT VERSION - Solo logo, nome e città
  if (compact) {
    // Prova a trovare la città in vari campi possibili
    const city = club.location?.city || club.city || club.address?.city || 'N/D';

    return (
      <div
        onClick={handleEnterClub}
        className="bg-white bg-gray-800 rounded-xl shadow-sm hover:shadow-md 
                  transition-all duration-300 overflow-hidden cursor-pointer 
                  border border-gray-100 border-gray-700 hover:border-blue-300 hover:border-blue-600
                  transform hover:scale-102"
      >
        <div className="p-4 flex items-center gap-3">
          {/* Club Logo */}
          {club.logoUrl ? (
            <img
              src={club.logoUrl}
              alt={`${club.name} logo`}
              className="h-12 w-12 rounded-lg object-cover shadow-sm border border-gray-200 border-gray-600 flex-shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm border border-gray-200 border-gray-600 flex-shrink-0">
              <span className="text-xl">🏓</span>
            </div>
          )}

          {/* Nome e Città */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 text-white truncate">{club.name}</h3>
            <p className="text-xs text-gray-500 text-gray-400 truncate">📍 {city}</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle club preview (deprecated - now we always go to dashboard)
  const handlePreviewClub = () => {
    console.log('👁️ [ClubCard] Previewing club (redirecting to dashboard):', club.id);
    navigate(`/club/${club.id}/dashboard`);
  };

  const getAffiliationButton = () => {
    if (!userAffiliation) {
      return (
        <button
          onClick={handleJoinClub}
          disabled={isRequesting}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 
                   text-white px-4 py-2 rounded-lg font-medium transition-colors
                   inline-flex items-center justify-center gap-2"
        >
          {isRequesting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Invio...
            </>
          ) : (
            <>🤝 Richiedi Affiliazione</>
          )}
        </button>
      );
    }

    switch (userAffiliation.status) {
      case AFFILIATION_STATUS.PENDING:
        return (
          <div
            className="flex-1 bg-yellow-900/30 text-yellow-400 
                        px-4 py-2 rounded-lg text-center font-medium border border-yellow-200 border-yellow-700"
          >
            ⏳ Richiesta in attesa
          </div>
        );

      case AFFILIATION_STATUS.APPROVED:
        return (
          <button
            onClick={handleEnterClub}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white 
                     px-4 py-2 rounded-lg font-medium transition-colors
                     inline-flex items-center justify-center gap-2"
          >
            ✅ Entra nel Club
          </button>
        );

      case AFFILIATION_STATUS.REJECTED:
        return (
          <div
            className="flex-1 bg-red-900/30 text-red-400 
                        px-4 py-2 rounded-lg text-center font-medium border border-red-200 border-red-700"
          >
            ❌ Richiesta rifiutata
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white bg-gray-800 rounded-xl shadow-md hover:shadow-lg 
                  transition-shadow duration-300 overflow-hidden"
    >
      {/* Header with club info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* Club Logo */}
              {club.logoUrl ? (
                <img
                  src={club.logoUrl}
                  alt={`${club.name} logo`}
                  className="h-12 w-12 rounded-xl object-cover shadow-md border-2 border-white border-gray-700"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md border-2 border-white border-gray-700">
                  <span className="text-2xl">🏓</span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900 text-white mb-1">{club.name}</h3>
                <p className="text-gray-600 text-gray-400 text-sm mb-2">
                  📍 {club.location?.city}, {club.location?.region}
                </p>
              </div>
            </div>
            {club.description && (
              <p className="text-gray-700 text-gray-300 text-sm line-clamp-2">{club.description}</p>
            )}
          </div>

          {/* Distance badge */}
          {distance !== null && (
            <div className="ml-4 text-right">
              <div
                className="bg-blue-900/30 text-blue-400 
                            px-2 py-1 rounded-lg text-xs font-medium"
              >
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </div>
            </div>
          )}
        </div>

        {/* Club stats */}
        <div className="flex gap-4 text-sm text-gray-600 text-gray-400 mb-4">
          {club.stats?.totalCourts && (
            <div className="flex items-center gap-1">🎾 {club.stats.totalCourts} campi</div>
          )}
          {club.stats?.totalMembers && (
            <div className="flex items-center gap-1">👥 {club.stats.totalMembers} membri</div>
          )}
        </div>

        {/* Contact info */}
        {(club.contact?.phone || club.contact?.email) && (
          <div className="space-y-1 text-sm text-gray-600 text-gray-400 mb-4">
            {club.contact.phone && (
              <div className="flex items-center gap-2">📞 {club.contact.phone}</div>
            )}
            {club.contact.email && (
              <div className="flex items-center gap-2">✉️ {club.contact.email}</div>
            )}
          </div>
        )}

        {/* Address */}
        {club.location?.address && (
          <div className="text-sm text-gray-600 text-gray-400 mb-4">📍 {club.location.address}</div>
        )}

        {/* Message display */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-900/30 text-green-400 border border-green-200 border-green-700'
                : 'bg-red-900/30 text-red-400 border border-red-200 border-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {getAffiliationButton()}

          {/* Always show "Entra" button - even for non-affiliated users they can view the club */}
          {!userAffiliation || userAffiliation.status !== AFFILIATION_STATUS.APPROVED ? (
            <button
              onClick={handleEnterClub}
              className="px-4 py-2 border border-blue-500 border-blue-600 
                       text-blue-600 text-blue-400 rounded-lg font-medium
                       hover:bg-blue-50 hover:bg-blue-900/20 transition-colors
                       inline-flex items-center gap-2"
            >
              👁️ Visualizza Club
            </button>
          ) : null}
        </div>
      </div>

      {/* Additional features indicators */}
      <div className="bg-gray-50 bg-gray-700/50 px-6 py-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {club.settings?.allowGuestBookings && (
            <span
              className="bg-green-900/30 text-green-400 
                           px-2 py-1 rounded-full"
            >
              Prenotazioni ospiti
            </span>
          )}
          {club.settings?.autoApproveAffiliations && (
            <span
              className="bg-blue-900/30 text-blue-400 
                           px-2 py-1 rounded-full"
            >
              Affiliazione automatica
            </span>
          )}
          {club.subscription?.type === 'premium' && (
            <span
              className="bg-purple-900/30 text-purple-400 
                           px-2 py-1 rounded-full"
            >
              Premium
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
