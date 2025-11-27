// =============================================
// FILE: functions/sendBookingEmail.js
// Cloud Function per email prenotazioni
// =============================================

import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import emailService from './emailService.js';
import { sendPushNotificationToUser } from './sendPushNotificationToUser.js';
import { saveUserNotification } from './userNotifications.js';
import {
  bookingConfirmationTemplate,
  bookingReminderTemplate,
  bookingCancellationTemplate,
  addedToBookingTemplate,
} from './emailTemplates.js';

if (getApps().length === 0) {
  initializeApp();
}
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

      // ============================================================
      // PUSH NOTIFICATION & IN-APP NOTIFICATION
      // ============================================================
      try {
        // 1. Salva notifica in-app
        await saveUserNotification({
          userId: booking.userId,
          title: 'Prenotazione Confermata',
          body: `Hai prenotato ${booking.courtName} per il ${booking.date} alle ${booking.time}`,
          type: 'booking',
          metadata: {
            bookingId,
            clubId: booking.clubId,
            date: booking.date,
            time: booking.time
          },
          actionUrl: `/bookings/${bookingId}`
        });

        // 2. Invia Push Notification
        await sendPushNotificationToUser(booking.userId, {
          title: 'Prenotazione Confermata ✅',
          body: `Il campo ${booking.courtName} è tuo! ${booking.date} ore ${booking.time}`,
          data: {
            url: `/bookings/${bookingId}`,
            type: 'booking',
            bookingId
          }
        });
        console.log(`✅ [Booking Created] Push notification sent to ${booking.userId}`);
      } catch (pushError) {
        console.error(`⚠️ [Booking Created] Failed to send push/in-app:`, pushError);
      }
      // ============================================================

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
      try {
        await emailService.sendEmail({
          to: user.email,
          subject: emailData.subject,
          text: emailData.text,
          html: emailData.html,
        });
        console.log(`✅ [Booking Created] Confirmation email sent to ${user.email}`);
      } catch (emailError) {
        console.error(`❌ [Booking Created] Failed to send email:`, emailError);
      }

      /* MOVED PUSH NOTIFICATION LOGIC UP */

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

      // ============================================================
      // PUSH NOTIFICATION & IN-APP NOTIFICATION (CANCELLATION)
      // ============================================================
      try {
        // 1. Salva notifica in-app (rimuovi campi undefined)
        const notificationMetadata = {
          bookingId,
          clubId: booking.clubId
        };
        if (booking.cancelledBy) {
          notificationMetadata.cancelledBy = booking.cancelledBy;
        }

        await saveUserNotification({
          userId: booking.userId,
          title: 'Prenotazione Cancellata',
          body: `La prenotazione per ${booking.courtName} del ${booking.date} è stata cancellata.`,
          type: 'warning',
          metadata: notificationMetadata,
          priority: 'high'
        });

        // 2. Invia Push Notification
        await sendPushNotificationToUser(booking.userId, {
          title: '❌ Prenotazione Cancellata',
          body: `La tua prenotazione del ${booking.date} alle ${booking.time} è stata cancellata.`,
          data: {
            type: 'booking_deleted',
            bookingId,
            clubId: booking.clubId,
            courtId: booking.courtId,
            date: booking.date,
            time: booking.time,
            url: `/club/${booking.clubId}/bookings`,
            priority: 'high',
            category: 'booking'
          }
        });
        console.log(`✅ [Booking Deleted] Push notification sent to ${booking.userId}`);
      } catch (pushError) {
        console.error(`⚠️ [Booking Deleted] Failed to send push/in-app:`, pushError);
      }
      // ============================================================

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

      /* MOVED PUSH NOTIFICATION LOGIC UP */

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
 * Invia notifica quando viene modificata una prenotazione
 */
export const onBookingUpdated = onDocumentUpdated(
  {
    document: 'bookings/{bookingId}',
    region: 'europe-west1',
    memory: '256MiB',
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const bookingId = event.params.bookingId;

    console.log(`🔍 [Booking Updated] TRIGGER FIRED for booking: ${bookingId}`, {
      beforeStatus: before.status,
      afterStatus: after.status,
      beforeDate: before.date,
      afterDate: after.date,
      beforeTime: before.time,
      afterTime: after.time,
      beforeCourt: before.courtName,
      afterCourt: after.courtName
    });

    // ============================================================
    // GESTIONE CANCELLAZIONE (status changed to 'cancelled')
    // ============================================================
    const beforeStatus = before.status || 'confirmed'; // Default to confirmed if missing
    const afterStatus = after.status || 'confirmed';
    const wasCancelled = beforeStatus !== 'cancelled' && afterStatus === 'cancelled';
    
    console.log(`🔍 [Booking Updated] Status check:`, {
      beforeStatus,
      afterStatus,
      wasCancelled
    });
    
    if (wasCancelled) {
      console.log(`📧 [Booking Updated] Booking CANCELLED: ${bookingId}`);
      
      try {
        // Ottieni dati utente
        const userDoc = await db.collection('users').doc(after.userId).get();
        const user = userDoc.data();

        // 1. Salva notifica in-app
        await saveUserNotification({
          userId: after.userId,
          title: '❌ Prenotazione Cancellata',
          body: `La tua prenotazione del ${after.date} alle ${after.time} è stata cancellata.`,
          type: 'warning',
          metadata: {
            bookingId,
            clubId: after.clubId,
            cancelledBy: after.cancelledBy
          },
          priority: 'high'
        });

        // 2. Invia Push Notification
        await sendPushNotificationToUser(after.userId, {
          title: '❌ Prenotazione Cancellata',
          body: `La tua prenotazione del ${after.date} alle ${after.time} è stata cancellata.`,
          data: {
            type: 'booking_deleted',
            bookingId,
            clubId: after.clubId,
            courtId: after.courtId,
            date: after.date,
            time: after.time,
            url: `/club/${after.clubId}/bookings`,
            priority: 'high',
            category: 'booking'
          }
        });
        console.log(`✅ [Booking Updated] Cancellation notification sent to ${after.userId}`);
        
        // 3. Invia email se l'utente ha email abilitata
        if (user?.email && user.communicationPreferences?.email !== false) {
          const clubDoc = await db.collection('clubs').doc(after.clubId).get();
          const club = clubDoc.data();
          
          const emailData = bookingCancellationTemplate({
            playerName: user.displayName || user.email,
            clubName: club.name,
            clubLogo: club.logoUrl,
            courtName: after.courtName,
            date: after.date,
            time: after.time,
            bookingId,
            cancelledBy: after.cancelledBy || null,
            reason: after.cancellationReason || null,
            primaryColor: club.primaryColor || '#2563eb',
          });

          await emailService.sendEmail({
            to: user.email,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html,
          });
          
          console.log(`✅ [Booking Updated] Cancellation email sent to ${user.email}`);
        }
      } catch (pushError) {
        console.error(`⚠️ [Booking Updated] Failed to send cancellation notifications:`, pushError);
      }
      
      return; // Exit early after handling cancellation
    }

    // Verifica se ci sono cambiamenti rilevanti (data, ora, campo)
    const isTimeChanged = before.date !== after.date || before.time !== after.time;
    const isCourtChanged = before.courtName !== after.courtName;

    if (!isTimeChanged && !isCourtChanged) {
      return;
    }

    console.log(`📧 [Booking Updated] Processing update: ${bookingId}`);

    try {
      // ============================================================
      // PUSH NOTIFICATION & IN-APP NOTIFICATION (UPDATE)
      // ============================================================
      try {
        // 1. Salva notifica in-app
        await saveUserNotification({
          userId: after.userId,
          title: 'Prenotazione Modificata ✏️',
          body: `La tua prenotazione è stata spostata al ${after.date} alle ${after.time} (${after.courtName})`,
          type: 'info',
          metadata: {
            bookingId,
            clubId: after.clubId,
            oldDate: before.date,
            oldTime: before.time
          },
          actionUrl: `/bookings/${bookingId}`
        });

        // 2. Invia Push Notification
        await sendPushNotificationToUser(after.userId, {
          title: 'Prenotazione Modificata ✏️',
          body: `Nuovo orario: ${after.date} ore ${after.time} @ ${after.courtName}`,
          data: {
            url: `/bookings/${bookingId}`,
            type: 'booking_updated',
            bookingId
          }
        });
        console.log(`✅ [Booking Updated] Push notification sent to ${after.userId}`);
      } catch (pushError) {
        console.error(`⚠️ [Booking Updated] Failed to send push/in-app:`, pushError);
      }
      // ============================================================

    } catch (error) {
      console.error(`❌ [Booking Updated] Error:`, error);
    }
  }
);

export default {
  onBookingCreated,
  onBookingDeleted,
  onBookingUpdated,
};
