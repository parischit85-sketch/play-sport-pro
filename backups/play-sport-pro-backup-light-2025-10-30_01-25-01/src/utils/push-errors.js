/**
 * Custom Error Classes per Push Notifications
 * Forniscono messaggi di errore actionable e context dettagliato
 */

export class PushServiceError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'PushServiceError';
    this.code = options.code || 'PUSH_SERVICE_ERROR';
    this.context = options.context || {};
    this.actionable = options.actionable || false;
    this.userMessage = options.userMessage || message;
    this.troubleshooting = options.troubleshooting || [];
  }
}

export class PushConfigurationError extends PushServiceError {
  constructor(missingConfig = [], context = {}) {
    const missingKeys = Array.isArray(missingConfig) ? missingConfig : [missingConfig];

    const details = missingKeys.map((key) => `- **${key}**: Non configurato`).join('\n');

    const message = `Servizio Push non configurato correttamente.\n\n**Variabili mancanti:**\n${details}`;

    const troubleshooting = [
      '🔧 **Firebase Console** → Secret Manager',
      '➕ Aggiungi le chiavi VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY',
      '🚀 Riavvia Cloud Functions',
      '📖 Vedi: FIREBASE_CLOUD_FUNCTIONS_ENV_SETUP.md',
    ];

    super(message, {
      code: 'PUSH_CONFIG_ERROR',
      context: { missingConfig: missingKeys, ...context },
      actionable: true,
      userMessage: "Il servizio notifiche non è configurato. Contatta l'amministratore.",
      troubleshooting,
    });

    this.name = 'PushConfigurationError';
    this.missingConfig = missingKeys;
  }
}

export class PushSubscriptionError extends PushServiceError {
  constructor(reason, context = {}) {
    let message = 'Errore nella sottoscrizione push';
    let userMessage = 'Impossibile attivare le notifiche push';
    let troubleshooting = [];

    switch (reason) {
      case 'permission-denied':
        message = "Permesso notifiche negato dall'utente";
        userMessage =
          'Hai negato il permesso per le notifiche. Per attivarle, modifica le impostazioni del browser.';
        troubleshooting = [
          '🔧 **Browser Settings** → Site Settings → Notifications',
          '✅ Imposta su "Allow"',
          '🔄 Ricarica la pagina',
        ];
        break;

      case 'service-worker-failed':
        message = 'Service Worker non disponibile';
        userMessage = 'Il browser non supporta le notifiche push o il Service Worker è bloccato.';
        troubleshooting = [
          '🌐 Usa un browser moderno (Chrome, Firefox, Edge)',
          '🔒 Disabilita blocco tracker/ads temporaneamente',
          '🧹 Clear browser cache e ricarica',
        ];
        break;

      case 'network-error':
        message = 'Errore di rete durante la sottoscrizione';
        userMessage = 'Problema di connessione. Riprova più tardi.';
        troubleshooting = [
          '📶 Controlla connessione internet',
          '⏳ Riprova tra qualche minuto',
          '🔄 Ricarica la pagina',
        ];
        break;

      case 'storage-error':
        message = 'Errore di storage del browser';
        userMessage = 'Il browser ha problemi di storage. Prova a pulire la cache.';
        troubleshooting = [
          '🧹 **Browser Settings** → Clear browsing data',
          '⏰ Ultime 24 ore',
          '🔄 Ricarica la pagina',
        ];
        break;

      default:
        troubleshooting = [
          '🔄 Ricarica la pagina',
          '🧹 Clear browser cache',
          '📞 Contatta supporto se persiste',
        ];
    }

    super(message, {
      code: 'PUSH_SUBSCRIPTION_ERROR',
      context: { reason, ...context },
      actionable: true,
      userMessage,
      troubleshooting,
    });

    this.name = 'PushSubscriptionError';
    this.reason = reason;
  }
}

export class PushSendError extends PushServiceError {
  constructor(reason, context = {}) {
    let message = "Errore nell'invio della notifica push";
    let userMessage = 'Impossibile inviare la notifica';
    let troubleshooting = [];

    switch (reason) {
      case 'no-subscription':
        message = "Nessuna sottoscrizione push trovata per l'utente";
        userMessage = "L'utente non ha attivato le notifiche push";
        troubleshooting = [
          "👤 Chiedi all'utente di andare su Profile",
          '🔔 Cliccare "Attiva Notifiche"',
          '✅ Accettare il permesso del browser',
        ];
        break;

      case 'subscription-expired':
        message = 'La sottoscrizione push è scaduta';
        userMessage = "Le notifiche push sono scadute, l'utente deve riattivarle";
        troubleshooting = [
          '👤 Utente deve tornare su Profile',
          '🔄 "Disattiva" poi "Attiva" notifiche',
          '✅ Rinnovare il permesso se richiesto',
        ];
        break;

      case 'network-error':
        message = "Errore di rete durante l'invio";
        userMessage = 'Problema temporaneo di connessione';
        troubleshooting = [
          '⏳ Riprova tra qualche minuto',
          '📶 Controlla connessione push service',
          '🔄 Il sistema riproverà automaticamente',
        ];
        break;

      case 'rate-limited':
        message = 'Troppe notifiche inviate, rate limit superato';
        userMessage = 'Troppe notifiche inviate contemporaneamente';
        troubleshooting = [
          '⏳ Aspetta qualche minuto',
          '📊 Riduci frequenza invii bulk',
          '🔄 Sistema automatico di retry attivo',
        ];
        break;

      default:
        troubleshooting = [
          '🔍 Controlla logs Firebase Functions',
          '📊 Verifica configurazione VAPID',
          '📞 Contatta sviluppatore se persiste',
        ];
    }

    super(message, {
      code: 'PUSH_SEND_ERROR',
      context: { reason, ...context },
      actionable: true,
      userMessage,
      troubleshooting,
    });

    this.name = 'PushSendError';
    this.reason = reason;
  }
}

// Added for test/runtime compatibility with PushService
export class SubscriptionExpiredError extends PushServiceError {
  constructor(message = 'Subscription expired or not found') {
    super(message, { code: 'subscription-expired' });
    this.name = 'SubscriptionExpiredError';
  }
}

/**
 * Utility per formattare errori in modo user-friendly
 */
export function formatErrorForUser(error) {
  if (error instanceof PushServiceError) {
    return {
      title: 'Errore Notifiche Push',
      message: error.userMessage,
      troubleshooting: error.troubleshooting,
      code: error.code,
      actionable: error.actionable,
    };
  }

  // Fallback per errori generici
  return {
    title: 'Errore Sconosciuto',
    message: error.message || 'Si è verificato un errore imprevisto',
    troubleshooting: [
      '🔄 Ricarica la pagina',
      '🧹 Clear browser cache',
      '📞 Contatta supporto se persiste',
    ],
    code: 'UNKNOWN_ERROR',
    actionable: false,
  };
}

/**
 * Utility per logging strutturato degli errori
 */
export function logPushError(error, context = {}) {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    },
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error('[PUSH ERROR]', logData);

  // In produzione, potremmo inviare a un servizio di logging
  if (import.meta.env.PROD) {
    // TODO: Invia a logging service (Sentry, etc.)
  }
}
