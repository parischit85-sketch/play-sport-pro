// =============================================
// FILE: src/services/notificationService.js
// Servizio notifiche per web/PWA (senza Capacitor)
// =============================================

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.registration = null;
  }

  // Inizializza il servizio notifiche web
  async initialize() {
    try {
      if (!("Notification" in window)) {
        console.log("Il browser non supporta le notifiche");
        return false;
      }

      await this.requestPermissions();
      this.isInitialized = true;
      console.log("NotificationService (web) inizializzato");
      return true;
    } catch (error) {
      console.error("Errore inizializzazione notifiche:", error);
      return false;
    }
  }

  // Richiede i permessi per le notifiche web
  async requestPermissions() {
    try {
      const permission = await Notification.requestPermission();
      console.log("Permessi notifiche web:", permission);

      return {
        web: permission === "granted",
        granted: permission === "granted",
      };
    } catch (error) {
      console.error("Errore richiesta permessi:", error);
      return { web: false, granted: false };
    }
  }

  // Mostra una notifica web
  async showNotification(options) {
    try {
      if (Notification.permission !== "granted") {
        console.warn("Permessi notifiche non concessi");
        return false;
      }

      const notification = new Notification(options.title || "Play Sport Pro", {
        body: options.body || "",
        icon: "/play-sport-pro_icon_only.svg",
        badge: "/play-sport-pro_icon_only.svg",
        tag: options.tag || "default",
        data: options.extra || {},
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
      });

      notification.onclick = () => {
        console.log("Notifica cliccata:", options.title);
        this.onNotificationClick(options.extra || {});
        notification.close();
      };

      // Auto-close dopo 5 secondi se non specificato diversamente
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      console.log("Notifica web mostrata:", options.title);
      return true;
    } catch (error) {
      console.error("Errore notifica web:", error);
      return false;
    }
  }

  // Callback personalizzabili
  onNotificationClick(data) {
    console.log("Notifica cliccata con data:", data);
    // Qui puoi implementare la navigazione o altre azioni
  }

  // Metodi di utilità per l'app Play Sport Pro

  // Test notifica web
  async testNotification() {
    return await this.showNotification({
      title: "🧪 Test Notifica Web",
      body: "Questa è una notifica di test per Play Sport Pro",
      extra: { type: "test" },
    });
  }

  // Notifica per prenotazione confermata
  async notifyBookingConfirmed(bookingDetails) {
    return await this.showNotification({
      title: "✅ Prenotazione Confermata",
      body: `Campo ${bookingDetails.court} prenotato per ${bookingDetails.date} alle ${bookingDetails.time}`,
      tag: "booking",
      extra: { type: "booking_confirmed", bookingId: bookingDetails.id },
    });
  }

  // Notifica per risultato partita
  async notifyMatchResult(matchResult) {
    return await this.showNotification({
      title: "🏆 Risultato Partita",
      body: `Vincitore: ${matchResult.winner} - ${matchResult.score}`,
      tag: "match",
      requireInteraction: true,
      vibrate: [300, 200, 300, 200, 300],
      extra: { type: "match_result", matchId: matchResult.id },
    });
  }

  // Notifica per promemoria partita
  async notifyMatchReminder(matchDetails, minutesBefore = 30) {
    return await this.showNotification({
      title: "🏆 Partita Imminente",
      body: `La tua partita inizia tra ${minutesBefore} minuti!`,
      tag: "reminder",
      requireInteraction: true,
      vibrate: [100, 50, 100, 50, 100, 50, 100],
      extra: { type: "match_reminder", matchId: matchDetails.id },
    });
  }

  // Notifica per nuovo torneo
  async notifyNewTournament(tournamentDetails) {
    return await this.showNotification({
      title: "🏆 Nuovo Torneo Disponibile",
      body: `${tournamentDetails.name} - Iscriviti ora!`,
      tag: "tournament",
      extra: { type: "new_tournament", tournamentId: tournamentDetails.id },
    });
  }

  // Verifica se le notifiche sono supportate
  isSupported() {
    return "Notification" in window;
  }

  // Stato corrente dei permessi
  getPermissionStatus() {
    if (!this.isSupported()) {
      return "not_supported";
    }
    return Notification.permission;
  }
}

// Singleton instance
const notificationService = new NotificationService();
export default notificationService;
