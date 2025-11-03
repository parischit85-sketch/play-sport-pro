import React from 'react';
import PropTypes from 'prop-types';

/**
 * ✅ FIX #22 (Sprint 4+): Extracted subcomponent for available instructors
 * Displays available instructors with their availability slots
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.T - Theme tokens
 * @param {Array} props.availableInstructors - List of available instructors
 * @param {number} props.maxDisplay - Max instructors to display (default: 4)
 * @param {number} props.maxSlots - Max slots per instructor to display (default: 3)
 */
const DashboardInstructors = ({
  T,
  availableInstructors,
  maxDisplay = 4,
  maxSlots = 3,
}) => {
  return (
    <div className={`${T.cardBg} ${T.border} rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className={`text-base sm:text-lg font-semibold ${T.text}`}>
          Maestri Disponibili Oggi
        </h3>
        <span className={`text-sm ${T.subtext}`}>
          {availableInstructors?.length || 0} disponibili
        </span>
      </div>

      {!availableInstructors || availableInstructors.length === 0 ? (
        <div className={`text-center py-6 ${T.subtext}`}>
          <div className="text-3xl mb-2">👨‍🏫</div>
          <div>Nessun maestro disponibile oggi</div>
        </div>
      ) : (
        <div className="space-y-3">
          {availableInstructors.slice(0, maxDisplay).map((instructor, index) => (
            <div
              key={instructor.id || index}
              className={`p-3 rounded-lg border ${T.border} ${T.hoverBg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {instructor.name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <div className={`font-medium ${T.text}`}>{instructor.name}</div>
                    <div className={`text-xs ${T.subtext}`}>
                      {instructor.specialization || 'Padel'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {instructor.availableSlots?.length || 0} slot
                </div>
              </div>

              {instructor.availableSlots && instructor.availableSlots.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {instructor.availableSlots
                    .slice(0, maxSlots)
                    .map((slot, slotIndex) => (
                      <span
                        key={slotIndex}
                        className="text-xs px-2 py-1 bg-green-900/30 text-green-300 rounded border border-green-700"
                      >
                        {slot.time}
                      </span>
                    ))}
                  {instructor.availableSlots.length > maxSlots && (
                    <span className={`text-xs px-2 py-1 ${T.subtext}`}>
                      +{instructor.availableSlots.length - maxSlots} altri
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

DashboardInstructors.propTypes = {
  T: PropTypes.object.isRequired,
  availableInstructors: PropTypes.array.isRequired,
  maxDisplay: PropTypes.number,
  maxSlots: PropTypes.number,
};

export default DashboardInstructors;
