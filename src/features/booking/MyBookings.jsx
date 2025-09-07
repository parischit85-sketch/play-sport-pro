// =============================================
// FILE: src/features/booking/MyBookings.jsx
// =============================================
import React from 'react';
import Section from '@ui/Section.jsx';
import Badge from '@ui/Badge.jsx';
import { createDSClasses } from '@lib/design-system.js';

export default function MyBookings({ bookings, user, onCancel, T }) {
  const ds = createDSClasses(T);

  // Filtra solo le prenotazioni dell'utente corrente
  const userBookings = bookings.filter(booking => 
    booking.bookedBy === (user?.displayName || user?.email)
  );

  // Ordina per data e ora
  const sortedBookings = [...userBookings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  if (!user) {
    return (
      <Section title="Le Mie Prenotazioni" T={T}>
        <div className="text-center py-8">
          <p className={ds.bodySm}>Accedi per vedere le tue prenotazioni</p>
        </div>
      </Section>
    );
  }

  if (sortedBookings.length === 0) {
    return (
      <Section title="Le Mie Prenotazioni" T={T}>
        <div className="text-center py-8">
          <p className={ds.bodySm}>Non hai ancora prenotazioni</p>
        </div>
      </Section>
    );
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isUpcoming = (date, time) => {
    const bookingDateTime = new Date(`${date}T${time}`);
    return bookingDateTime > new Date();
  };

  const canCancel = (date, time) => {
    const bookingDateTime = new Date(`${date}T${time}`);
    const hoursUntilBooking = (bookingDateTime - new Date()) / (1000 * 60 * 60);
    return hoursUntilBooking > 24; // Può cancellare solo se mancano più di 24 ore
  };

  return (
    <Section title="Le Mie Prenotazioni" T={T}>
      {/* Scroll orizzontale per mobile */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-4 w-max md:grid md:grid-cols-1 md:gap-6 md:w-full">
          {sortedBookings.map((booking) => (
            <div
              key={booking.id}
              className={`${T.borderMd} ${T.cardBg} ${T.border} p-4 ${T.transitionNormal} 
                min-w-[280px] md:min-w-0 flex-shrink-0 md:flex-shrink
                hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200`}
            >
              {/* Header con data e badge status */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className={`${ds.bodySm} font-medium text-gray-500`}>
                      {new Date(booking.date).toLocaleDateString('it-IT', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric' 
                      }).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`${ds.h4} font-bold`}>
                      {booking.time.substring(0, 5)}
                    </span>
                    <span className={`${ds.bodySm} text-gray-500`}>
                      - {(() => {
                        const [hours, minutes] = booking.time.split(':');
                        const endTime = new Date();
                        endTime.setHours(parseInt(hours), parseInt(minutes) + booking.duration);
                        return endTime.toTimeString().substring(0, 5);
                      })()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {isUpcoming(booking.date, booking.time) ? (
                    <Badge variant="success" size="sm" T={T}>Prossima</Badge>
                  ) : (
                    <Badge variant="default" size="sm" T={T}>Passata</Badge>
                  )}
                </div>
              </div>

              {/* Court info e località */}
              <div className="mb-4">
                <h3 className={`${ds.h5} font-semibold mb-1`}>
                  {booking.courtName || 'Campo Padel'}
                </h3>
                <p className={`${ds.bodySm} text-gray-500 flex items-center gap-1`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Sporting Club Padel
                </p>
              </div>

              {/* Giocatori con avatars */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {/* Avatar giocatori */}
                  <div className="flex -space-x-2">
                    {booking.players ? booking.players.slice(0, 4).map((player, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-white ${
                          index === 0 ? 'bg-blue-500' : ['bg-green-500', 'bg-purple-500', 'bg-orange-500'][index - 1] || 'bg-gray-500'
                        }`}
                        title={player}
                      >
                        {player.charAt(0).toUpperCase()}
                      </div>
                    )) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-semibold text-white border-2 border-white">
                        {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    
                    {/* Slot vuoto disponibile */}
                    {(!booking.players || booking.players.length < 4) && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {!booking.players || booking.players.length < 4 ? (
                    <span className={`${ds.bodySm} text-gray-500 ml-1`}>Posto disponibile</span>
                  ) : (
                    <span className={`${ds.bodySm} text-green-600 dark:text-green-400 ml-1`}>Al completo</span>
                  )}
                </div>
              </div>

              {/* Servizi extra */}
              <div className="flex gap-2 mb-4">
                {booking.lighting && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                    <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                    <span className={`${ds.bodySm} text-yellow-800 dark:text-yellow-200`}>Illuminazione</span>
                  </div>
                )}
                {booking.heating && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.91 32.91 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z" clipRule="evenodd" />
                    </svg>
                    <span className={`${ds.bodySm} text-red-800 dark:text-red-200`}>Riscaldamento</span>
                  </div>
                )}
              </div>

              {/* Footer con prezzo e azioni */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col">
                  <span className={`${ds.bodySm} text-gray-500`}>Totale</span>
                  <span className={`${ds.h5} font-bold text-green-600 dark:text-green-400`}>
                    €{booking.price}
                  </span>
                </div>
                
                {isUpcoming(booking.date, booking.time) && (
                  <div className="flex gap-2">
                    <button
                      className={`${T.btnSm} bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-0`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    
                    {canCancel(booking.date, booking.time) && (
                      <button
                        onClick={() => {
                          if (confirm('Sei sicuro di voler cancellare questa prenotazione?')) {
                            onCancel(booking.id);
                          }
                        }}
                        className={`${T.btnSm} bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border-0`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Indicatori di scroll su mobile */}
      <div className="flex justify-center mt-4 md:hidden">
        <div className="flex gap-1">
          {sortedBookings.slice(0, 5).map((_, index) => (
            <div key={index} className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          ))}
          {sortedBookings.length > 5 && (
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          )}
        </div>
      </div>
    </Section>
  );
}
