// Utility helpers per inviare notifiche standardizzate
// Usa il bridge globale (CustomEvent('notify')) per evitare import diretti del contesto UI

export function notify(detail) {
  try {
    window.dispatchEvent(new CustomEvent('notify', { detail }));
  } catch (e) {
    console.warn('notify() failed', e);
  }
}

export function notifyBookingAddition({ court, time, club, date }) {
  notify({
    type: 'success',
    title: 'Aggiunto alla prenotazione',
    message: `Sei stato aggiunto su ${court} alle ${time} (${club})`,
  });
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