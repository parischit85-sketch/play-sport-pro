// =============================================
// FILE: src/features/prenota/MobileBookingView.jsx
// Vista Mobile per Prenotazioni - Timeline Verticale
// =============================================
import React, { useState, useRef, useEffect } from 'react';
import { euro2 } from '@lib/format.js';

/**
 * Vista mobile per prenotazioni campo
 * - Timeline verticale degli slot
 * - Un campo alla volta con swipe
 * - Touch-friendly
 */
export default function MobileBookingView({
  filteredCourts,
  timeSlots,
  renderCell,
  currentDate,
  T,
}) {
  const [activeCourt, setActiveCourt] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const timelineRef = useRef(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeCourt < filteredCourts.length - 1) {
      setActiveCourt(activeCourt + 1);
    }
    if (isRightSwipe && activeCourt > 0) {
      setActiveCourt(activeCourt - 1);
    }
  };

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (timelineRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Trova lo slot più vicino all'ora corrente
      const currentSlotIndex = timeSlots.findIndex((slot) => {
        const slotHour = slot.getHours();
        const slotMinute = slot.getMinutes();
        return slotHour > currentHour || (slotHour === currentHour && slotMinute >= currentMinute);
      });

      if (currentSlotIndex > 0) {
        const slotElement = timelineRef.current.children[currentSlotIndex];
        if (slotElement) {
          slotElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [activeCourt, timeSlots]);

  if (filteredCourts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🏓</div>
        <div className="font-medium text-gray-600 text-gray-400">Nessun campo disponibile</div>
      </div>
    );
  }

  const court = filteredCourts[activeCourt];
  const courtName = court?.name || `Campo ${activeCourt + 1}`;

  return (
    <div className="flex flex-col h-full">
      {/* Court Switcher Header */}
      <div className={`sticky top-0 z-30 ${T.cardBg} border-b-2 ${T.border} shadow-lg`}>
        {/* Navigation Arrows & Court Name */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setActiveCourt(Math.max(0, activeCourt - 1))}
            disabled={activeCourt === 0}
            className={`p-3 rounded-xl transition-all ${
              activeCourt === 0
                ? 'text-gray-300 text-gray-600 cursor-not-allowed'
                : 'text-blue-600 text-blue-400 hover:bg-blue-50 hover:bg-blue-900/30'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex-1 text-center">
            <div className="text-xl font-bold mb-1">{courtName}</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 bg-blue-900 text-blue-700 text-blue-300 font-medium">
                {court?.courtType || 'Indoor'}
              </span>
              {court?.hasHeating && (
                <span className="text-xs px-3 py-1 rounded-full bg-orange-100 bg-orange-900 text-orange-700 text-orange-300 font-medium">
                  🔥 Riscaldamento
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveCourt(Math.min(filteredCourts.length - 1, activeCourt + 1))}
            disabled={activeCourt === filteredCourts.length - 1}
            className={`p-3 rounded-xl transition-all ${
              activeCourt === filteredCourts.length - 1
                ? 'text-gray-300 text-gray-600 cursor-not-allowed'
                : 'text-blue-600 text-blue-400 hover:bg-blue-50 hover:bg-blue-900/30'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 pb-3">
          {filteredCourts.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveCourt(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeCourt ? 'w-8 bg-blue-500' : 'w-2 bg-gray-300 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Swipe Hint */}
        {filteredCourts.length > 1 && (
          <div className="text-center pb-2">
            <div className="text-xs text-gray-500 text-gray-400">
              ← Swipe per cambiare campo →
            </div>
          </div>
        )}
      </div>

      {/* Timeline Container */}
      <div
        ref={timelineRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        {timeSlots.map((slot, index) => {
          const hour = slot.getHours();
          const minute = slot.getMinutes();
          const timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

          // Check if this is current time slot
          const now = new Date();
          const isCurrentSlot =
            slot.getDate() === now.getDate() &&
            slot.getMonth() === now.getMonth() &&
            slot.getFullYear() === now.getFullYear() &&
            hour === now.getHours() &&
            minute === now.getMinutes();

          return (
            <div
              key={slot.getTime()}
              className={`relative ${isCurrentSlot ? 'animate-pulse' : ''}`}
            >
              {/* Current Time Indicator */}
              {isCurrentSlot && (
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-red-500 rounded-full z-10" />
              )}

              {/* Time Label + Slot */}
              <div className="flex items-stretch gap-3">
                {/* Time Label */}
                <div
                  className={`flex-shrink-0 w-16 flex items-center justify-center ${
                    isCurrentSlot
                      ? 'text-red-600 text-red-400 font-bold text-lg'
                      : 'text-gray-600 text-gray-400 font-medium'
                  }`}
                >
                  {timeLabel}
                </div>

                {/* Slot Cell */}
                <div className="flex-1 min-h-[60px]">{renderCell(court.id, slot)}</div>
              </div>

              {/* Hour Separator */}
              {minute === 0 && index > 0 && (
                <div className="my-4 border-t-2 border-dashed border-gray-300 border-gray-600" />
              )}
            </div>
          );
        })}

        {/* Bottom Spacer */}
        <div className="h-20" />
      </div>

      {/* Legend Footer */}
      <div className={`sticky bottom-0 ${T.cardBg} border-t-2 ${T.border} p-3 shadow-lg`}>
        <div className="flex items-center justify-around text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-200 bg-emerald-800 border border-emerald-400" />
            <span className="text-gray-600 text-gray-400">Libero</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-200 bg-blue-800 border border-blue-400" />
            <span className="text-gray-600 text-gray-400">Occupato</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200 bg-gray-800 border-dashed border border-gray-400" />
            <span className="text-gray-600 text-gray-400">Non disp.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

