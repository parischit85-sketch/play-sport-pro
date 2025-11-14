import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { parseTimeToMinutes } from '@utils/dateFormatter';

/**
 * ✅ FIX #22 (Sprint 4+): Extracted subcomponent for today's bookings
 * Displays upcoming bookings with edit functionality, filters upcoming bookings by time
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.T - Theme tokens
 * @param {Array} props.todayBookings - All today's bookings
 * @param {string} props.clubId
 * @param {Object} props.STYLE_CONSTANTS - Style constants
 * @param {Object} props.EMPTY_STATE_MESSAGES - Empty state messages
 * @param {number} props.maxDisplay - Max bookings to display (default: 5)
 */
const DashboardBookings = ({
  T,
  todayBookings,
  clubId,
  STYLE_CONSTANTS,
  EMPTY_STATE_MESSAGES,
  maxDisplay = 5,
}) => {
  const navigate = useNavigate();

  // ✅ FIX #14: Memoize the filter array to avoid recreations on each render
  const upcomingBookings = useMemo(() => {
    // Filter only the upcoming bookings from current time
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes from day start

    return (todayBookings || [])
      .filter((booking) => {
        if (!booking.time) return true; // If no time, show anyway
        // ✅ FIX #6: Use parseTimeToMinutes to handle different formats
        const bookingTime = parseTimeToMinutes(booking.time);
        if (bookingTime === -1) return true; // If parsing fails, show anyway
        return bookingTime >= currentTime;
      })
      .slice(0, maxDisplay); // Limit display
  }, [todayBookings, maxDisplay]);

  return (
    <div className={`${T.cardBg} ${T.border} rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className={`text-base sm:text-lg font-semibold ${T.text}`}>
          Prossime Prenotazioni Oggi
        </h3>
        <button
          onClick={() =>
            navigate(`/club/${clubId}/admin/bookings?date=${new Date().toISOString().split('T')[0]}`)
          }
          className={`text-blue-500 hover:text-blue-600 text-xs sm:text-sm font-medium whitespace-nowrap`}
        >
          Gestisci →
        </button>
      </div>

      {todayBookings.length === 0 ? (
        <div className={STYLE_CONSTANTS.emptyStateContainer(T)}>
          <div className={STYLE_CONSTANTS.emptyStateIcon}>
            {EMPTY_STATE_MESSAGES.noBookingsToday.icon}
          </div>
          <div>{EMPTY_STATE_MESSAGES.noBookingsToday.title}</div>
          <div className="text-xs mt-2 opacity-75">
            {EMPTY_STATE_MESSAGES.noBookingsToday.description}
          </div>
        </div>
      ) : upcomingBookings.length === 0 ? (
        <div className={STYLE_CONSTANTS.emptyStateContainer(T)}>
          <div className={STYLE_CONSTANTS.emptyStateIcon}>
            {EMPTY_STATE_MESSAGES.allBookingsPassed.icon}
          </div>
          <div>{EMPTY_STATE_MESSAGES.allBookingsPassed.title}</div>
          <div className="text-xs mt-2 opacity-75">
            {todayBookings.length} prenotazione/i completate
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {upcomingBookings.map((booking, index) => {
            // CRITICITÀ 4: Certificate status badge
            const getCertificateBadge = () => {
              if (!booking.certificateStatus) return null;
              
              const badges = {
                valid: { color: 'bg-green-100 text-green-800', icon: '✓', text: 'Cert OK' },
                expired: { color: 'bg-red-100 text-red-800', icon: '✕', text: 'Scaduto' },
                expiring_critical: { color: 'bg-orange-100 text-orange-800', icon: '!', text: 'In scadenza' },
                expiring_soon: { color: 'bg-yellow-100 text-yellow-800', icon: '⚠', text: '7gg' },
                missing: { color: 'bg-gray-100 text-gray-800', icon: '?', text: 'Mancante' },
                no_profile: { color: 'bg-gray-100 text-gray-500', icon: '-', text: 'No profilo' },
                error: { color: 'bg-gray-100 text-gray-500', icon: '?', text: 'N/D' },
              };
              
              const badge = badges[booking.certificateStatus] || badges.error;
              
              return (
                <span 
                  className={`text-xs px-2 py-0.5 rounded ${badge.color} whitespace-nowrap`}
                  title={booking.certificateWarning || 'Certificato medico'}
                >
                  {badge.icon} {badge.text}
                </span>
              );
            };

            return (
              <div
                key={booking.id || index}
                className={`flex items-center justify-between p-3 ${T.border} rounded-lg cursor-pointer ${T.hoverBg}`}
                onClick={() => navigate(`/club/${clubId}/admin/bookings?edit=${booking.id}`)}
                title="Clicca per modificare la prenotazione"
              >
                <div className="flex-1">
                  <div className={`font-medium ${T.text}`}>
                    {booking.userName || booking.playerName || 'Cliente'}
                  </div>
                  <div className={`text-sm ${T.subtext} flex items-center gap-2`}>
                    <span>{booking.time} - {booking.courtName || booking.court}</span>
                    {getCertificateBadge()}
                  </div>
                </div>
                <div className={`text-sm font-medium text-blue-600 flex items-center gap-2`}>
                  €{booking.price || 0}
                  <svg
                    className="w-4 h-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

DashboardBookings.propTypes = {
  T: PropTypes.object.isRequired,
  todayBookings: PropTypes.array.isRequired,
  clubId: PropTypes.string.isRequired,
  STYLE_CONSTANTS: PropTypes.object.isRequired,
  EMPTY_STATE_MESSAGES: PropTypes.object.isRequired,
  maxDisplay: PropTypes.number,
};

export default DashboardBookings;
