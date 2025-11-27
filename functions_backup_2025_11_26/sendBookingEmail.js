// =============================================
// FILE: functions/sendBookingEmail.js
// Cloud Function per email prenotazioni
// =============================================

import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import emailService from './emailService.js';
import {
  bookingConfirmationTemplate,
  bookingReminderTemplate,
  bookingCancellationTemplate,
  addedToBookingTemplate,
} from './emailTemplates.js';

const db = getFirestore();

/**
 * Invia email quando viene creata una nuova prenotazione
 */
export const onBookingCreated = onDocumentCreated(
  {
    document: 'bookings/{bookingId}',
    region: 'europe-west1',
    memory: '256MiB',
  },
  async (event) => {
    const booking = event.data.data();
    const bookingId = event.params.bookingId;

    console.log(`📧 [Booking Created] Processing booking: ${bookingId}`);

    try {
      // Ottieni dati club
      const clubDoc = await db.collection('clubs').doc(booking.clubId).get();
      const club = clubDoc.data();

      // Ottieni email utente
      const userDoc = await db.collection('users').doc(booking.userId).get();
      const user = userDoc.data();

      if (!user?.email) {
        console.log(`⚠️ [Booking Created] No email for user ${booking.userId}`);
        return;
      }

      // Controlla preferenze comunicazione
      if (user.communicationPreferences?.email === false) {
        console.log(`⚠️ [Booking Created] User ${user.email} opted out of emails`);
        return;
      }

      // Genera email di conferma
      const emailData = bookingConfirmationTemplate({
        playerName: user.displayName || user.email,
        clubName: club.name,
        clubLogo: club.logoUrl,
        courtName: booking.courtName,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        price: booking.price,
        players: booking.players || [],
        bookingId,
        primaryColor: club.primaryColor || '#2563eb',
      });

      // Invia email
      await emailService.sendEmail({
        to: user.email,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      console.log(`✅ [Booking Created] Confirmation email sent to ${user.email}`);

      // Invia email anche agli altri giocatori (se registrati)
      if (booking.players && booking.players.length > 1) {
        await sendEmailsToOtherPlayers(booking, bookingId, club, user);
      }

    } catch (error) {
      console.error(`❌ [Booking Created] Error:`, error);
      // Non bloccare la creazione del booking
    }
  }
);

/**
 * Invia email quando viene cancellata una prenotazione
 */
export const onBookingDeleted = onDocumentDeleted(
  {
    document: 'bookings/{bookingId}',
    region: 'europe-west1',
    memory: '256MiB',
  },
  async (event) => {
    const booking = event.data.data();
    const bookingId = event.params.bookingId;

    console.log(`📧 [Booking Deleted] Processing cancellation: ${bookingId}`);

    try {
      // Ottieni dati club
      const clubDoc = await db.collection('clubs').doc(booking.clubId).get();
      const club = clubDoc.data();

      // Ottieni email utente
      const userDoc = await db.collection('users').doc(booking.userId).get();
      const user = userDoc.data();

      if (!user?.email || user.communicationPreferences?.email === false) {
        return;
      }

      // Genera email di cancellazione
      const emailData = bookingCancellationTemplate({
        playerName: user.displayName || user.email,
        clubName: club.name,
        clubLogo: club.logoUrl,
        courtName: booking.courtName,
        date: booking.date,
        time: booking.time,
        bookingId,
        cancelledBy: booking.cancelledBy || null,
        reason: booking.cancellationReason || null,
        primaryColor: club.primaryColor || '#2563eb',
      });

      // Invia email
      await emailService.sendEmail({
        to: user.email,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      console.log(`✅ [Booking Deleted] Cancellation email sent to ${user.email}`);

      // Notifica anche gli altri giocatori
      if (booking.players && booking.players.length > 1) {
        const allPlayers = booking.players.filter(p => p !== (user.displayName || user.email));
        for (const playerName of allPlayers) {
          // Cerca utente per nome (best effort)
          const playerQuery = await db
            .collection('users')
            .where('displayName', '==', playerName)
            .limit(1)
            .get();

          if (!playerQuery.empty) {
            const playerDoc = playerQuery.docs[0];
            const player = playerDoc.data();

            if (player.email && player.communicationPreferences?.email !== false) {
              const playerEmailData = bookingCancellationTemplate({
                playerName: player.displayName || player.email,
                clubName: club.name,
                clubLogo: club.logoUrl,
                courtName: booking.courtName,
                date: booking.date,
                time: booking.time,
                bookingId,
                cancelledBy: user.displayName || user.email,
                reason: booking.cancellationReason || null,
                primaryColor: club.primaryColor || '#2563eb',
              });

              await emailService.sendEmail({
                to: player.email,
                subject: playerEmailData.subject,
                text: playerEmailData.text,
                html: playerEmailData.html,
              });
            }
          }
        }
      }

    } catch (error) {
      console.error(`❌ [Booking Deleted] Error:`, error);
    }
  }
);

/**
 * Helper: Invia email agli altri giocatori quando vengono aggiunti
 */
async function sendEmailsToOtherPlayers(booking, bookingId, club, organizer) {
  const otherPlayers = booking.players.filter(p => p !== (organizer.displayName || organizer.email));

  for (const playerName of otherPlayers) {
    try {
      // Cerca utente registrato con questo nome
      const playerQuery = await db
        .collection('users')
        .where('displayName', '==', playerName)
        .limit(1)
        .get();

      if (playerQuery.empty) continue;

      const playerDoc = playerQuery.docs[0];
      const player = playerDoc.data();

      if (!player.email || player.communicationPreferences?.email === false) {
        continue;
      }

      // Genera email
      const emailData = addedToBookingTemplate({
        playerName: player.displayName || player.email,
        clubName: club.name,
        clubLogo: club.logoUrl,
        courtName: booking.courtName,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        organizer: organizer.displayName || organizer.email,
        players: booking.players,
        bookingId,
        primaryColor: club.primaryColor || '#2563eb',
      });

      // Invia
      await emailService.sendEmail({
        to: player.email,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      console.log(`✅ [Booking Created] Notification sent to ${player.email}`);
    } catch (error) {
      console.error(`❌ [Booking Created] Failed to notify ${playerName}:`, error);
    }
  }
}

export default {
  onBookingCreated,
  onBookingDeleted,
};
