/**
 * Esempi di utilizzo delle notifiche push rich
 * Questo file mostra come utilizzare le nuove funzionalità di notifiche push avanzate
 */

import {
  sendRichNotification,
  sendBulkPushNotification,
  createBookingNotification,
  createMatchNotification,
  createCertificateNotification,
  createTournamentNotification,
  createCustomNotification,
} from './push.js';

// =============================================
// ESEMPI DI UTILIZZO
// =============================================

// 1. Invio di una notifica per prenotazione
export async function sendBookingConfirmation(userId, bookingData) {
  const notification = createBookingNotification({
    id: bookingData.id,
    courtName: bookingData.court.name,
    date: bookingData.date,
    time: `${bookingData.startTime} - ${bookingData.endTime}`,
    clubId: bookingData.clubId,
    courtImage: bookingData.court.imageUrl,
  });

  return await sendRichNotification(userId, notification);
}

// 2. Invio di una notifica per aggiornamento partita
export async function sendMatchUpdate(userId, matchData) {
  const notification = createMatchNotification({
    id: matchData.id,
    team1: matchData.team1.name,
    team2: matchData.team2.name,
    status: matchData.status, // "started", "finished", "postponed", etc.
    tournamentId: matchData.tournamentId,
    matchImage: matchData.tournament.logoUrl,
    urgent: matchData.urgent || false,
  });

  return await sendRichNotification(userId, notification);
}

// 3. Invio di una notifica certificato disponibile
export async function sendCertificateReady(userId, certificateData) {
  const notification = createCertificateNotification({
    playerId: certificateData.playerId,
    playerName: certificateData.player.name,
    type: certificateData.type,
    issueDate: certificateData.issueDate,
    certificateImage: '/images/certificate-ready.png',
  });

  return await sendRichNotification(userId, notification);
}

// 4. Invio di una notifica torneo
export async function sendTournamentUpdate(userId, tournamentData) {
  const notification = createTournamentNotification({
    id: tournamentData.id,
    name: tournamentData.name,
    message: tournamentData.message, // "Iscrizioni aperte", "Partita iniziata", etc.
    tournamentImage: tournamentData.logoUrl,
    important: tournamentData.important || false,
  });

  return await sendRichNotification(userId, notification);
}

// 5. Invio di notifiche bulk a tutti gli utenti di un club
export async function sendClubAnnouncement(clubId, announcementData) {
  const notification = createCustomNotification({
    title: `📢 ${announcementData.title}`,
    body: announcementData.message,
    icon: '/icons/announcement.svg',
    image: announcementData.imageUrl,
    tag: `club-announcement-${clubId}`,
    requireInteraction: true,
    category: 'announcement',
    priority: announcementData.urgent ? 'high' : 'normal',
    actions: [
      { action: 'view-announcement', title: 'Vedi Annuncio', icon: '/icons/view.svg' },
      { action: 'open', title: 'Apri App', icon: '/icons/app.svg' },
    ],
    data: {
      url: `/clubs/${clubId}/announcements/${announcementData.id}`,
      type: 'club-announcement',
      clubId: clubId,
      announcementId: announcementData.id,
      urgent: announcementData.urgent,
    },
  });

  // Invia a tutti gli utenti del club (senza specificare userIds = broadcast)
  return await sendBulkPushNotification(null, notification, { clubId });
}

// 6. Invio di notifiche personalizzate
export async function sendCustomRichNotification(userId, customData) {
  const notification = createCustomNotification({
    title: customData.title,
    body: customData.body,
    icon: customData.icon || '/icons/notification.svg',
    badge: customData.badge || '/icons/badge.svg',
    image: customData.image,
    tag: customData.tag || 'custom',
    requireInteraction: customData.requireInteraction || false,
    silent: customData.silent || false,
    category: customData.category || 'general',
    priority: customData.priority || 'normal',
    actions: customData.actions || [
      { action: 'open', title: 'Apri', icon: '/icons/open.svg' },
      { action: 'dismiss', title: 'Ignora' },
    ],
    vibrate: customData.vibrate || [200, 100, 200],
    data: {
      url: customData.url || '/',
      type: customData.type || 'custom',
      ...customData.extraData,
    },
  });

  return await sendRichNotification(userId, notification);
}

// 7. Notifica con azioni avanzate (es. sondaggio)
export async function sendPollNotification(userId, pollData) {
  const notification = createCustomNotification({
    title: '📊 Sondaggio Disponibile',
    body: pollData.question,
    icon: '/icons/poll.svg',
    tag: `poll-${pollData.id}`,
    requireInteraction: true,
    category: 'poll',
    priority: 'normal',
    actions: [
      { action: 'vote-yes', title: '✅ Sì', icon: '/icons/yes.svg' },
      { action: 'vote-no', title: '❌ No', icon: '/icons/no.svg' },
      { action: 'view-poll', title: 'Vedi Sondaggio', icon: '/icons/view.svg' },
      { action: 'open', title: 'Apri App', icon: '/icons/app.svg' },
    ],
    data: {
      url: `/polls/${pollData.id}`,
      type: 'poll',
      pollId: pollData.id,
      question: pollData.question,
      options: pollData.options,
    },
  });

  return await sendRichNotification(userId, notification);
}

// 8. Notifica di emergenza/sicurezza
export async function sendEmergencyNotification(userIds, emergencyData) {
  const notification = createCustomNotification({
    title: '🚨 EMERGENZA',
    body: emergencyData.message,
    icon: '/icons/emergency.svg',
    badge: '/icons/emergency-badge.svg',
    image: emergencyData.imageUrl,
    tag: 'emergency',
    requireInteraction: true,
    silent: false, // Mai silenziosa per emergenze
    category: 'emergency',
    priority: 'high',
    vibrate: [300, 100, 300, 100, 300], // Vibrazione intensa
    actions: [
      { action: 'call-emergency', title: 'Chiama Soccorso', icon: '/icons/phone.svg' },
      { action: 'view-emergency', title: 'Vedi Dettagli', icon: '/icons/view.svg' },
      { action: 'open', title: 'Apri App', icon: '/icons/app.svg' },
    ],
    data: {
      url: '/emergency',
      type: 'emergency',
      emergencyId: emergencyData.id,
      severity: emergencyData.severity,
      location: emergencyData.location,
    },
  });

  return await sendBulkPushNotification(userIds, notification);
}

// =============================================
// UTILITÀ PER GESTIONE NOTIFICHE
// =============================================

// Helper per determinare se una notifica deve essere inviata
export function shouldSendNotification(userPreferences, notificationType) {
  if (!userPreferences) return true; // Default: invia sempre

  switch (notificationType) {
    case 'booking':
      return userPreferences.bookingNotifications !== false;
    case 'match':
      return userPreferences.matchNotifications !== false;
    case 'certificate':
      return userPreferences.certificateNotifications !== false;
    case 'tournament':
      return userPreferences.tournamentNotifications !== false;
    case 'announcement':
      return userPreferences.announcementNotifications !== false;
    case 'emergency':
      return true; // Sempre inviate, non possono essere disabilitate
    default:
      return userPreferences.generalNotifications !== false;
  }
}

// Helper per creare URL di deep linking
export function createDeepLink(path, params = {}) {
  const baseUrl = window.location.origin;
  const url = new URL(path, baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

// Helper per scheduling notifiche
export function scheduleNotification(userId, notificationData, delayMs) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const result = await sendRichNotification(userId, notificationData);
      resolve(result);
    }, delayMs);
  });
}

// =============================================
// ESEMPI DI UTILIZZO PRATICO
// =============================================

/*
// Esempio: Invio notifica prenotazione
const bookingResult = await sendBookingConfirmation('user123', {
  id: 'booking456',
  court: { name: 'Campo Centrale', imageUrl: '/images/court1.jpg' },
  date: '2025-01-15',
  startTime: '18:00',
  endTime: '19:30',
  clubId: 'club789'
});

// Esempio: Invio notifica bulk annuncio club
const announcementResult = await sendClubAnnouncement('club789', {
  id: 'announcement001',
  title: 'Chiusura Straordinaria',
  message: 'Il club sarà chiuso domani per manutenzione',
  imageUrl: '/images/maintenance.jpg',
  urgent: true
});

// Esempio: Notifica emergenza
const emergencyResult = await sendEmergencyNotification(['user1', 'user2', 'user3'], {
  id: 'emergency001',
  message: 'Allerta meteo: evacuazione immediata richiesta',
  severity: 'critical',
  location: 'Campo sportivo principale'
});
*/