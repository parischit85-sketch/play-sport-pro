import React from 'react';

export default function BookingHeader({ booking, court, isLessonBooking, dateLabel }) {
  const isPast = new Date(`${booking.date}T${booking.time}:00`) < new Date();
  const isToday = new Date(booking.date).toDateString() === new Date().toDateString();
  const isUpcoming = !isPast && !isToday;

  const courtName = isLessonBooking
    ? booking.lessonType || 'Lezione di Tennis'
    : booking.courtName || court?.name || 'Campo da Gioco';

  const accentColor = isLessonBooking ? 'green' : 'blue';

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 shadow-lg group">
      {/* Background Glow Effect */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-${accentColor}-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-70`}
      />

      {/* Left Accent Bar */}
      <div
        className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-${accentColor}-500 to-${accentColor}-600`}
      />

      <div className="p-4 pl-6 flex items-center justify-between relative z-10">
        {/* Left: Time, Date, Court */}
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-baseline gap-2.5 mb-1">
            <span className="text-3xl font-bold text-white tracking-tight leading-none">
              {booking.time}
            </span>
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              {dateLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-base">{isLessonBooking ? '🎾' : '🏟️'}</span>
            <h2 className="font-medium text-sm truncate text-gray-200">{courtName}</h2>
            <span className="text-gray-600 text-xs">•</span>
            <span className="text-xs text-gray-400 font-medium">{booking.duration || 60} min</span>
          </div>
        </div>

        {/* Right: Price & Status */}
        <div className="flex flex-col items-end gap-2">
          <div className={`text-xl font-bold text-${accentColor}-400`}>
            €{booking.price || 'N/A'}
          </div>

          <div>
            {isPast && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-600 text-white shadow-sm">
                Completata
              </span>
            )}
            {isToday && !isPast && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white shadow-sm">
                Oggi
              </span>
            )}
            {isUpcoming && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white shadow-sm">
                Prossima
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
