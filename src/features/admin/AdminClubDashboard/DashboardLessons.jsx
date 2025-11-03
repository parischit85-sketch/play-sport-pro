import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { parseTimeToMinutes } from '@utils/dateFormatter';

/**
 * ✅ FIX #22 (Sprint 4+): Extracted subcomponent for today's lessons
 * Displays upcoming lessons with edit functionality, filters upcoming lessons by time
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.T - Theme tokens
 * @param {Array} props.todayLessons - All today's lessons
 * @param {string} props.clubId
 * @param {Object} props.STYLE_CONSTANTS - Style constants
 * @param {Object} props.EMPTY_STATE_MESSAGES - Empty state messages
 * @param {number} props.maxDisplay - Max lessons to display (default: 5)
 */
const DashboardLessons = ({
  T,
  todayLessons,
  clubId,
  STYLE_CONSTANTS,
  EMPTY_STATE_MESSAGES,
  maxDisplay = 5,
}) => {
  const navigate = useNavigate();

  // ✅ FIX #14: Memoize the filter array to avoid recreations on each render
  const upcomingLessons = useMemo(() => {
    // Filter only the upcoming lessons from current time
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes from day start

    return (todayLessons || [])
      .filter((lesson) => {
        if (!lesson.time) return true; // If no time, show anyway
        // ✅ FIX #6: Use parseTimeToMinutes to handle different formats
        const lessonTime = parseTimeToMinutes(lesson.time);
        if (lessonTime === -1) return true; // If parsing fails, show anyway
        return lessonTime >= currentTime;
      })
      .slice(0, maxDisplay); // Limit display
  }, [todayLessons, maxDisplay]);

  return (
    <div className={`${T.cardBg} ${T.border} rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className={`text-base sm:text-lg font-semibold ${T.text}`}>Prossime Lezioni Oggi</h3>
        <button
          onClick={() => navigate(`/club/${clubId}/admin/bookings?filter=lessons`)}
          className={`text-blue-500 hover:text-blue-600 text-xs sm:text-sm font-medium whitespace-nowrap`}
        >
          Gestisci →
        </button>
      </div>

      {todayLessons.length === 0 ? (
        <div className={STYLE_CONSTANTS.emptyStateContainer(T)}>
          <div className={STYLE_CONSTANTS.emptyStateIcon}>
            {EMPTY_STATE_MESSAGES.noLessonsToday.icon}
          </div>
          <div>{EMPTY_STATE_MESSAGES.noLessonsToday.title}</div>
          <div className="text-xs mt-2 opacity-75">
            {EMPTY_STATE_MESSAGES.noLessonsToday.description}
          </div>
        </div>
      ) : upcomingLessons.length === 0 ? (
        <div className={STYLE_CONSTANTS.emptyStateContainer(T)}>
          <div className={STYLE_CONSTANTS.emptyStateIcon}>
            {EMPTY_STATE_MESSAGES.allLessonsPassed.icon}
          </div>
          <div>{EMPTY_STATE_MESSAGES.allLessonsPassed.title}</div>
          <div className="text-xs mt-2 opacity-75">
            {todayLessons.length} lezione/i completate
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {upcomingLessons.map((lesson, index) => (
            <div
              key={lesson.id || index}
              className={`flex items-center justify-between p-3 ${T.border} rounded-lg cursor-pointer ${T.hoverBg}`}
              onClick={() => navigate(`/club/${clubId}/admin/bookings?edit=${lesson.id}`)}
              title="Clicca per modificare la lezione"
            >
              <div>
                <div className={`font-medium ${T.text}`}>
                  {lesson.bookedBy || lesson.student?.name || lesson.studentName || 'Cliente'} (
                  {lesson.participants || 1} partecipanti) -{' '}
                  {lesson.instructor?.name || lesson.instructorName || 'Maestro'}
                </div>
                <div className={`text-sm ${T.subtext}`}>
                  {lesson.time} - {lesson.type || lesson.lessonType || 'Lezione individuale'}
                </div>
              </div>
              <div className={`text-sm font-medium text-green-600 flex items-center gap-2`}>
                €{lesson.price || 0}
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
          ))}
        </div>
      )}
    </div>
  );
};

DashboardLessons.propTypes = {
  T: PropTypes.object.isRequired,
  todayLessons: PropTypes.array.isRequired,
  clubId: PropTypes.string.isRequired,
  STYLE_CONSTANTS: PropTypes.object.isRequired,
  EMPTY_STATE_MESSAGES: PropTypes.object.isRequired,
  maxDisplay: PropTypes.number,
};

export default DashboardLessons;
