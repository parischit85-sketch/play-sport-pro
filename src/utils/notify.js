// Utility helpers per inviare notifiche standardizzate
// Usa il bridge globale (CustomEvent('notify')) per evitare import diretti del contesto UI

export function notify(detail) {
  try {
    window.dispatchEvent(new CustomEvent('notify', { detail }));
  } catch (e) {
    console.warn('notify() failed', e);
  }
}

export function notifyBookingAddition({ court, time, club }) {
  notify({
    type: 'success',
    title: 'Aggiunto alla prenotazione',
    message: `Sei stato aggiunto su ${court} alle ${time} (${club})`,
  });
}

/**
 * Invia una notifica push quando un utente viene aggiunto a una prenotazione
 * Questa funzione può essere chiamata dal server o dal client
 */
export async function sendBookingAdditionPush({ userId, court, time, club, date, bookingId }) {
  try {
    const response = await fetch('/.netlify/functions/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        notification: {
          title: 'Aggiunto alla prenotazione',
          body: `Sei stato aggiunto su ${court} alle ${time} - ${club}`,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: `booking-${bookingId}`,
          requireInteraction: false,
          data: {
            url: `/bookings/${bookingId}`,
            bookingId,
            court,
            time,
            club,
            date,
            timestamp: Date.now(),
            type: 'booking-addition',
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Errore nell'invio della notifica push");
    }

    return true;
  } catch (error) {
    console.error("Errore nell'invio della notifica push:", error);
    return false;
  }
}

export function notifyBookingRemoval({ court, time, club }) {
  notify({
    type: 'warning',
    title: 'Rimosso dalla prenotazione',
    message: `Non fai più parte della prenotazione su ${court} alle ${time} (${club})`,
  });
}

export function notifyError(message, title = 'Errore') {
  notify({ type: 'error', title, message });
}

export function notifyInfo(message, title = 'Info') {
  notify({ type: 'info', title, message });
}

export function notifyWarning(message, title = 'Attenzione') {
  notify({ type: 'warning', title, message });
}

// Esempio di utilizzo:
// import { notifyBookingAddition } from '@utils/notify.js';
// notifyBookingAddition({ court:'Campo 1', time:'18:00', club:'Club X', date:'2025-10-06' });
