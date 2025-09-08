// =============================================
// FILE: src/services/notificationService.js
// Servizio completo per la gestione delle notifiche
// =============================================

import {
  PushNotifications,
  ActionPerformed,
  PushNotificationSchema,
  Token,
} from '@capacitor/push-notifications';

import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';

import { Capacitor } from '@capacitor/core';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.token = null;
  }

  // Inizializza il servizio notifiche
  async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Notifiche disponibili solo su piattaforme native');
      return false;
    }

    try {
      await this.requestPermissions();
      await this.registerListeners();
      this.isInitialized = true;
      console.log('NotificationService inizializzato');
      return true;
    } catch (error) {
      console.error('Errore inizializzazione notifiche:', error);
      return false;
    }
  }

  // Richiede i permessi per le notifiche
  async requestPermissions() {
    try {
      // Permessi per push notifications
      let pushResult = await PushNotifications.requestPermissions();
      if (pushResult.receive === 'granted') {
        await PushNotifications.register();
        console.log('Push notifications registrate');
      }

      // Permessi per notifiche locali
      let localResult = await LocalNotifications.requestPermissions();
      console.log('Permessi notifiche locali:', localResult);

      return {
        push: pushResult.receive === 'granted',
        local: localResult.display === 'granted',
      };
    } catch (error) {
      console.error('Errore richiesta permessi:', error);
      return { push: false, local: false };
    }
  }

  // Registra i listener per gli eventi delle notifiche
  async registerListeners() {
    // Listener per token registration
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      this.token = token.value;
      this.onTokenReceived(token.value);
    });

    // Listener per errori di registrazione
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listener per notifiche ricevute
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ' + JSON.stringify(notification));
      this.onNotificationReceived(notification);
    });

    // Listener per azioni su notifiche
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
      this.onNotificationAction(notification);
    });

    // Listener per notifiche locali
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Local notification received: ' + JSON.stringify(notification));
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Local notification action: ' + JSON.stringify(notification));
      this.onLocalNotificationAction(notification);
    });
  }

  // Ottiene il push token
  getPushToken() {
    return this.token;
  }

  // Mostra una notifica locale
  async showLocalNotification(options) {
    try {
      const notification = {
        title: options.title || 'Play Sport Pro',
        body: options.body || '',
        id: options.id || Date.now(),
        schedule: options.schedule || null,
        sound: options.sound || 'default',
        attachments: options.attachments || null,
        actionTypeId: options.actionTypeId || '',
        extra: options.extra || {},
      };

      await LocalNotifications.schedule({
        notifications: [notification],
      });

      console.log('Notifica locale programmata:', notification);
      return true;
    } catch (error) {
      console.error('Errore notifica locale:', error);
      return false;
    }
  }

  // Callback personalizzabili
  onTokenReceived(token) {
    console.log('Token ricevuto:', token);
  }

  onNotificationReceived(notification) {
    console.log('Notifica ricevuta:', notification);
  }

  onNotificationAction(actionData) {
    console.log('Azione notifica:', actionData);
  }

  onLocalNotificationAction(actionData) {
    console.log('Azione notifica locale:', actionData);
  }

  // Metodi di utilità per l'app Play Sport Pro

  // Test notifica locale
  async testLocalNotification() {
    return await this.showLocalNotification({
      title: '🧪 Test Notifica',
      body: 'Questa è una notifica di test per Play Sport Pro',
      extra: { type: 'test' },
    });
  }

  // Notifica per prenotazione confermata
  async notifyBookingConfirmed(bookingDetails) {
    return await this.showLocalNotification({
      title: '✅ Prenotazione Confermata',
      body: `Campo ${bookingDetails.court} prenotato per ${bookingDetails.date} alle ${bookingDetails.time}`,
      extra: { type: 'booking_confirmed', bookingId: bookingDetails.id },
    });
  }

  // Notifica per risultato partita
  async notifyMatchResult(matchResult) {
    return await this.showLocalNotification({
      title: '🏆 Risultato Partita',
      body: `Vincitore: ${matchResult.winner} - ${matchResult.score}`,
      extra: { type: 'match_result', matchId: matchResult.id },
    });
  }

  // Notifica per promemoria partita
  async notifyMatchReminder(matchDetails, minutesBefore = 30) {
    const scheduleTime = new Date(matchDetails.datetime);
    scheduleTime.setMinutes(scheduleTime.getMinutes() - minutesBefore);

    return await this.showLocalNotification({
      title: '🏆 Partita Imminente',
      body: `La tua partita inizia tra ${minutesBefore} minuti!`,
      schedule: { at: scheduleTime },
      extra: { type: 'match_reminder', matchId: matchDetails.id },
    });
  }

  // Notifica per nuovo torneo
  async notifyNewTournament(tournamentDetails) {
    return await this.showLocalNotification({
      title: '🏆 Nuovo Torneo Disponibile',
      body: `${tournamentDetails.name} - Iscriviti ora!`,
      extra: { type: 'new_tournament', tournamentId: tournamentDetails.id },
    });
  }
}

// Singleton instance
const notificationService = new NotificationService();
export default notificationService;
