import React from 'react';
import PropTypes from 'prop-types';

/**
 * ✅ FIX #22 (Sprint 4+): Extracted subcomponent for dashboard statistics
 * Displays stat cards for bookings, lessons, and revenue
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.stats - Statistics data
 * @param {number} props.stats.todayBookingsCount
 * @param {number} props.stats.tomorrowBookingsCount
 * @param {number} props.stats.todayLessonsCount
 * @param {number} props.stats.tomorrowLessonsCount
 * @param {number} props.stats.todayRevenue
 * @param {number} props.stats.weeklyBookings
 * @param {Object} props.StatCard - Memoized StatCard component
 * @param {string} props.clubId
 * @param {Function} props.navigate
 */
const DashboardStats = ({ stats = {}, StatCard, clubId, navigate }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
      <StatCard
        title="Oggi"
        value={stats?.todayBookingsCount || 0}
        subtitle="Prenotazioni"
        icon="📅"
        color="text-blue-400"
        onClick={() =>
          navigate(
            `/club/${clubId}/admin/bookings?date=${new Date().toISOString().split('T')[0]}`
          )
        }
      />
      <StatCard
        title="Domani"
        value={stats?.tomorrowBookingsCount || 0}
        subtitle="Prenotazioni"
        icon="🎾"
        color="text-purple-400"
        onClick={() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          navigate(`/club/${clubId}/admin/bookings?date=${tomorrow.toISOString().split('T')[0]}`);
        }}
      />
      <StatCard
        title="Oggi"
        value={stats?.todayLessonsCount || 0}
        subtitle="Lezioni"
        icon="🎓"
        color="text-orange-400"
        onClick={() =>
          navigate(`/club/${clubId}/admin/lessons?date=${new Date().toISOString().split('T')[0]}`)
        }
      />
      <StatCard
        title="Domani"
        value={stats?.tomorrowLessonsCount || 0}
        subtitle="Lezioni"
        icon="📚"
        color="text-green-400"
        onClick={() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          navigate(`/club/${clubId}/admin/lessons?date=${tomorrow.toISOString().split('T')[0]}`);
        }}
      />
      <StatCard
        title="Revenue"
        value={`€${Math.round(stats?.todayRevenue || 0)}`}
        subtitle="Oggi"
        icon="💰"
        color="text-red-400"
        onClick={() =>
          navigate(`/club/${clubId}/admin/bookings?date=${new Date().toISOString().split('T')[0]}`)
        }
      />
    </div>
  );
};

DashboardStats.propTypes = {
  stats: PropTypes.shape({
    todayBookingsCount: PropTypes.number,
    tomorrowBookingsCount: PropTypes.number,
    todayLessonsCount: PropTypes.number,
    tomorrowLessonsCount: PropTypes.number,
    todayRevenue: PropTypes.number,
    weeklyBookings: PropTypes.number,
  }),
  StatCard: PropTypes.elementType.isRequired,
  clubId: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default DashboardStats;
