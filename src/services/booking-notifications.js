// =============================================
// FILE: src/services/booking-notifications.js
// SERVIZIO NOTIFICHE PUSH PER PRENOTAZIONI
// =============================================

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * Invia notifica push per nuova prenotazione
 * @param {Object} booking - Dati della prenotazione
 * @param {Object} createdBy - Utente che ha creato la prenotazione
 */
export async function sendBookingCreatedNotification(booking, createdBy) {
  try {
    console.log('📬 [BookingNotifications] Sending booking created notification:', {
      bookingId: booking.id,
      date: booking.date,
      time: booking.time,
      courtName: booking.courtName,
    });

    // Raccogli tutti i partecipanti (players array)
    const participants = booking.players || [];
    
    // Aggiungi anche bookedForUserId se presente (cross-club visibility)
    if (booking.bookedForUserId && booking.userId !== booking.bookedForUserId) {
      participants.push({ uid: booking.bookedForUserId });
    }

    if (participants.length === 0) {
      console.log('📭 [BookingNotifications] No participants to notify');
      return;
    }

    // Mappa gli userId dei partecipanti
    const participantUserIds = await getParticipantUserIds(participants, booking.clubId);

    console.log('👥 [BookingNotifications] Participants to notify:', participantUserIds);

    // Escludi l'utente che ha creato la prenotazione (non serve notificarlo)
    const usersToNotify = participantUserIds.filter(uid => uid !== createdBy?.uid);

    if (usersToNotify.length === 0) {
      console.log('📭 [BookingNotifications] No other users to notify');
      return;
    }

    // Prepara il contenuto della notifica
    const notification = {
      title: '🎾 Nuova Prenotazione',
      body: `${createdBy?.displayName || 'Un giocatore'} ti ha aggiunto a una prenotazione: ${booking.courtName} - ${formatDate(booking.date)} alle ${booking.time}`,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: `booking-${booking.id}`,
      requireInteraction: false,
      data: {
        type: 'booking_created',
        bookingId: booking.id,
        clubId: booking.clubId,
        courtId: booking.courtId,
        date: booking.date,
        time: booking.time,
        url: `/club/${booking.clubId}/bookings`,
        deepLink: `/club/${booking.clubId}/bookings?highlight=${booking.id}`,
        priority: 'normal',
        category: 'booking',
      },
      actions: [
        {
          action: 'view',
          title: 'Visualizza',
          icon: '/icons/icon.svg',
        },
        {
          action: 'dismiss',
          title: 'Chiudi',
        },
      ],
      vibrate: [200, 100, 200],
    };

    // Invia notifica a ciascun partecipante
    const sendPromises = usersToNotify.map(userId => 
      sendPushNotificationToUser(userId, notification)
    );

    await Promise.allSettled(sendPromises);

    console.log('✅ [BookingNotifications] Booking created notifications sent');
  } catch (error) {
    console.error('❌ [BookingNotifications] Error sending booking created notification:', error);
    // Non bloccare la creazione della prenotazione per errori di notifica
  }
}

/**
 * Invia notifica push per prenotazione modificata
 * @param {Object} booking - Dati della prenotazione aggiornati
 * @param {Object} updatedBy - Utente che ha modificato la prenotazione
 * @param {Object} changes - Modifiche effettuate (opzionale)
 */
export async function sendBookingUpdatedNotification(booking, updatedBy, changes = {}) {
  try {
    console.log('📬 [BookingNotifications] Sending booking updated notification:', {
      bookingId: booking.id,
      changes: Object.keys(changes),
    });

    // Raccogli tutti i partecipanti (includi sia userId che bookedForUserId)
    const participants = booking.players || [];
    
    // Aggiungi l'utente principale (chi ha creato la prenotazione)
    if (booking.userId) {
      participants.push({ uid: booking.userId });
    }
    
    // Aggiungi l'utente per cui è stata fatta la prenotazione (se diverso)
    if (booking.bookedForUserId && booking.userId !== booking.bookedForUserId) {
      participants.push({ uid: booking.bookedForUserId });
    }

    if (participants.length === 0) {
      console.log('📭 [BookingNotifications] No participants to notify');
      return;
    }

    const participantUserIds = await getParticipantUserIds(participants, booking.clubId);

    // ⚠️ PER LE MODIFICHE: Notifica TUTTI i partecipanti, anche chi ha fatto la modifica
    // Un admin che modifica una prenotazione deve avvisare gli utenti coinvolti
    const usersToNotify = participantUserIds;

    if (usersToNotify.length === 0) {
      console.log('📭 [BookingNotifications] No users to notify');
      return;
    }

    console.log('👥 [BookingNotifications] Participants to notify (including updater):', usersToNotify);

    // Crea messaggio con dettagli delle modifiche
    let changeDetails = '';
    const changeList = [];

    // Controlla modifiche con struttura { old, new }
    if (changes.date && changes.date.old && changes.date.new) {
      changeList.push(`📅 Data: ${formatDate(changes.date.old)} → ${formatDate(changes.date.new)}`);
    } else if (changes.date && typeof changes.date === 'string') {
      changeList.push(`📅 Nuova data: ${formatDate(changes.date)}`);
    }

    if (changes.time && changes.time.old && changes.time.new) {
      changeList.push(`⏰ Ora: ${changes.time.old} → ${changes.time.new}`);
    } else if (changes.time && typeof changes.time === 'string') {
      changeList.push(`⏰ Nuovo orario: ${changes.time}`);
    }

    if (changes.courtName && changes.courtName.old && changes.courtName.new) {
      changeList.push(`🏟️ Campo: ${changes.courtName.old} → ${changes.courtName.new}`);
    } else if (changes.courtName && typeof changes.courtName === 'string') {
      changeList.push(`🏟️ Nuovo campo: ${changes.courtName}`);
    }

    if (changes.players && changes.players.old && changes.players.new) {
      // Helper per estrarre nomi dai giocatori (che possono essere stringhe o oggetti)
      const getPlayerNames = (players) => {
        return (players || []).map(p => {
          if (typeof p === 'string') return p;
          if (typeof p === 'object' && p !== null) return p.name || 'Giocatore';
          return 'Giocatore';
        });
      };

      const oldNames = getPlayerNames(changes.players.old);
      const newNames = getPlayerNames(changes.players.new);

      // Trova aggiunti e rimossi
      const added = newNames.filter(n => !oldNames.includes(n));
      const removed = oldNames.filter(n => !newNames.includes(n));

      if (added.length > 0) {
        changeList.push(`➕ Aggiunti: ${added.join(', ')}`);
      }
      if (removed.length > 0) {
        changeList.push(`➖ Rimossi: ${removed.join(', ')}`);
      }
      
      // Fallback se non riusciamo a determinare le differenze esatte
      if (added.length === 0 && removed.length === 0) {
        changeList.push(`👥 Giocatori aggiornati`);
      }
    }

    if (changeList.length > 0) {
      changeDetails = `\n${changeList.join('\n')}`;
    } else if (Object.keys(changes).length > 0) {
      // Fallback se ci sono modifiche ma non dettagliate
      changeDetails = '\n(Dettagli aggiornati)';
    }

    // Simplify changes object for payload to avoid size limits
    const simplifiedChanges = {};
    if (changes.date) simplifiedChanges.date = true;
    if (changes.time) simplifiedChanges.time = true;
    if (changes.courtName) simplifiedChanges.courtName = true;
    if (changes.players) simplifiedChanges.players = true;

    const notification = {
      title: '✏️ Prenotazione Modificata',
      body: `${updatedBy?.displayName || 'Un admin'} ha modificato la prenotazione: ${booking.courtName}${changeDetails}`,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: `booking-${booking.id}`,
      requireInteraction: false,
      data: {
        type: 'booking_updated',
        bookingId: booking.id,
        clubId: booking.clubId,
        courtId: booking.courtId,
        date: booking.date,
        time: booking.time,
        url: `/club/${booking.clubId}/bookings`,
        deepLink: `/club/${booking.clubId}/bookings?highlight=${booking.id}`,
        priority: 'high',
        category: 'booking',
        changes: simplifiedChanges, // Use simplified changes
      },
      actions: [
        {
          action: 'view',
          title: 'Visualizza',
          icon: '/icons/icon.svg',
        },
        {
          action: 'dismiss',
          title: 'Chiudi',
        },
      ],
      vibrate: [200, 100, 200],
    };

    const sendPromises = usersToNotify.map(userId => 
      sendPushNotificationToUser(userId, notification)
    );

    await Promise.allSettled(sendPromises);

    console.log('✅ [BookingNotifications] Booking updated notifications sent');
  } catch (error) {
    console.error('❌ [BookingNotifications] Error sending booking updated notification:', error);
  }
}

/**
 * Invia notifica push per prenotazione cancellata
 * @param {Object} booking - Dati della prenotazione cancellata
 * @param {Object} deletedBy - Utente che ha cancellato la prenotazione
 */
export async function sendBookingDeletedNotification(booking, deletedBy) {
  try {
    console.log('📬 [BookingNotifications] Sending booking deleted notification:', {
      bookingId: booking.id,
    });

    // Raccogli tutti i partecipanti
    const participants = booking.players || [];
    if (booking.bookedForUserId && booking.userId !== booking.bookedForUserId) {
      participants.push({ uid: booking.bookedForUserId });
    }

    if (participants.length === 0) {
      console.log('📭 [BookingNotifications] No participants to notify');
      return;
    }

    const participantUserIds = await getParticipantUserIds(participants, booking.clubId);

    // Escludi l'utente che ha cancellato
    const usersToNotify = participantUserIds.filter(uid => uid !== deletedBy?.uid);

    if (usersToNotify.length === 0) {
      console.log('📭 [BookingNotifications] No other users to notify');
      return;
    }

    const notification = {
      title: '❌ Prenotazione Cancellata',
      body: `${deletedBy?.displayName || 'Un giocatore'} ha cancellato la prenotazione: ${booking.courtName} - ${formatDate(booking.date)} alle ${booking.time}`,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: `booking-${booking.id}-deleted`,
      requireInteraction: true, // Importante: l'utente deve vedere la cancellazione
      data: {
        type: 'booking_deleted',
        bookingId: booking.id,
        clubId: booking.clubId,
        courtId: booking.courtId,
        date: booking.date,
        time: booking.time,
        url: `/club/${booking.clubId}/bookings`,
        priority: 'high', // Priorità alta per cancellazioni
        category: 'booking',
      },
      actions: [
        {
          action: 'view',
          title: 'Vedi Calendario',
          icon: '/icons/icon.svg',
        },
        {
          action: 'dismiss',
          title: 'OK',
        },
      ],
      vibrate: [300, 200, 300], // Vibrazione più lunga per cancellazioni
    };

    const sendPromises = usersToNotify.map(userId => 
      sendPushNotificationToUser(userId, notification)
    );

    await Promise.allSettled(sendPromises);

    console.log('✅ [BookingNotifications] Booking deleted notifications sent');
  } catch (error) {
    console.error('❌ [BookingNotifications] Error sending booking deleted notification:', error);
  }
}

/**
 * Ottiene gli userId dei partecipanti, cercando il collegamento player → Firebase user
 * @param {Array} participants - Array di giocatori (possono avere uid, linkedAccountId, o playerId)
 * @param {string} clubId - ID del club
 * @returns {Promise<Array<string>>} Array di userId Firebase
 */
async function getParticipantUserIds(participants, clubId) {
  const userIds = new Set();

  for (const participant of participants) {
    try {
      // Caso 0: Partecipante è una stringa (nome) - cerca per nome
      if (typeof participant === 'string') {
        if (clubId) {
          const playersRef = collection(db, 'clubs', clubId, 'players');
          const playerQuery = query(playersRef, where('name', '==', participant));
          const playerSnapshot = await getDocs(playerQuery);

          if (!playerSnapshot.empty) {
            const playerData = playerSnapshot.docs[0].data();
            if (playerData.linkedAccountId) {
              userIds.add(playerData.linkedAccountId);
            }
          }
        }
        continue;
      }

      // Caso 1: Partecipante ha linkedFirebaseUid (player profile con account collegato) - PRIORITÀ
      if (participant.linkedFirebaseUid) {
        userIds.add(participant.linkedFirebaseUid);
        continue;
      }

      // Caso 2: Partecipante ha già un uid (Firebase user diretto)
      if (participant.uid) {
        userIds.add(participant.uid);
        continue;
      }

      // Caso 3: Fallback a linkedAccountId (campo legacy)
      if (participant.linkedAccountId) {
        userIds.add(participant.linkedAccountId);
        continue;
      }

      // Caso 3: Partecipante è solo un playerId - cerca il player nel club
      if (participant.id && clubId) {
        const playersRef = collection(db, 'clubs', clubId, 'players');
        const playerQuery = query(playersRef, where('__name__', '==', participant.id));
        const playerSnapshot = await getDocs(playerQuery);

        if (!playerSnapshot.empty) {
          const playerData = playerSnapshot.docs[0].data();
          if (playerData.linkedAccountId) {
            userIds.add(playerData.linkedAccountId);
          }
        }
      }

      // Caso 4: Partecipante ha name ma non uid - cerca per nome (meno affidabile)
      if (participant.name && !participant.uid && !participant.linkedAccountId && clubId) {
        const playersRef = collection(db, 'clubs', clubId, 'players');
        const playerQuery = query(playersRef, where('name', '==', participant.name));
        const playerSnapshot = await getDocs(playerQuery);

        if (!playerSnapshot.empty) {
          const playerData = playerSnapshot.docs[0].data();
          if (playerData.linkedAccountId) {
            userIds.add(playerData.linkedAccountId);
          }
        }
      }
    } catch (error) {
      console.warn('[BookingNotifications] Error resolving participant:', participant, error);
      // Continua con gli altri partecipanti
    }
  }

  return Array.from(userIds);
}

/**
 * Invia notifica push a un singolo utente tramite Netlify Function
 * @param {string} userId - Firebase UID dell'utente
 * @param {Object} notification - Dati della notifica
 */
async function sendPushNotificationToUser(userId, notification) {
  try {
    const response = await fetch('https://us-central1-m-padelweb.cloudfunctions.net/sendPushNotificationHttp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid: userId, notification }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.warn('[BookingNotifications] Failed to send push to user:', userId, errorData);
      return { success: false, error: errorData };
    }

    const result = await response.json();
    console.log('[BookingNotifications] Push sent successfully to user:', userId, result);
    return { success: true, result };
  } catch (error) {
    console.error('[BookingNotifications] Error sending push to user:', userId, error);
    return { success: false, error: error.message };
  }
}

/**
 * Formatta data in formato leggibile italiano
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  } catch {
    return dateString;
  }
}
