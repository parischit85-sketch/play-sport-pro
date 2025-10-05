// =============================================
// FILE: src/utils/bookingEvents.js
// Sistema di eventi centralizzato per le prenotazioni
// =============================================

// Event emitter per prenotazioni
class BookingEventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  // Registra un listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Ritorna una funzione per rimuovere il listener
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Rimuove un listener
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emette un evento
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in booking event listener for ${event}:`, error);
        }
      });
    }
  }

  // Rimuove tutti i listener
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Singleton instance
export const bookingEvents = new BookingEventEmitter();

// Event types
export const BOOKING_EVENTS = {
  BOOKING_CREATED: 'booking:created',
  BOOKING_UPDATED: 'booking:updated',
  BOOKING_CANCELLED: 'booking:cancelled',
  BOOKING_DELETED: 'booking:deleted',
  BOOKINGS_REFRESH: 'bookings:refresh',
};

// Helper functions per emettere eventi
export const emitBookingCreated = (booking) => {
  console.log('📢 [BookingEvents] Emitting BOOKING_CREATED', booking);
  bookingEvents.emit(BOOKING_EVENTS.BOOKING_CREATED, booking);
  bookingEvents.emit(BOOKING_EVENTS.BOOKINGS_REFRESH, { reason: 'created', booking });
};

export const emitBookingUpdated = (booking) => {
  console.log('📢 [BookingEvents] Emitting BOOKING_UPDATED', booking);
  bookingEvents.emit(BOOKING_EVENTS.BOOKING_UPDATED, booking);
  bookingEvents.emit(BOOKING_EVENTS.BOOKINGS_REFRESH, { reason: 'updated', booking });
};

export const emitBookingCancelled = (bookingId) => {
  console.log('📢 [BookingEvents] Emitting BOOKING_CANCELLED', bookingId);
  bookingEvents.emit(BOOKING_EVENTS.BOOKING_CANCELLED, bookingId);
  bookingEvents.emit(BOOKING_EVENTS.BOOKINGS_REFRESH, { reason: 'cancelled', bookingId });
};

export const emitBookingDeleted = (bookingId) => {
  console.log('📢 [BookingEvents] Emitting BOOKING_DELETED', bookingId);
  bookingEvents.emit(BOOKING_EVENTS.BOOKING_DELETED, bookingId);
  bookingEvents.emit(BOOKING_EVENTS.BOOKINGS_REFRESH, { reason: 'deleted', bookingId });
};

export const emitBookingsRefresh = (reason = 'manual') => {
  console.log('📢 [BookingEvents] Emitting BOOKINGS_REFRESH', reason);
  bookingEvents.emit(BOOKING_EVENTS.BOOKINGS_REFRESH, { reason });
};
