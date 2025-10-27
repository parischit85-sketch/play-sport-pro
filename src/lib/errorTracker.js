/**
 * Error Tracking & Logging System - CHK-303
 * 
 * Sistema centralizzato per gestire errori, logging e reporting.
 * Features:
 * - Error categorization (network, validation, auth, firestore, unknown)
 * - User-friendly messages con recovery suggestions
 * - Firebase Analytics integration
 * - Optional Sentry integration
 * - Error context tracking (user, session, stack)
 * - Rate limiting per evitare spam
 * - Offline error queue
 */

import { logEvent } from 'firebase/analytics';

// Firebase Analytics (optional - initialized later if available)
let analytics = null;

// Error categories
export const ErrorCategory = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTH: 'auth',
  FIRESTORE: 'firestore',
  PERMISSION: 'permission',
  PAYMENT: 'payment',
  UNKNOWN: 'unknown',
};

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// User-friendly error messages
const ERROR_MESSAGES = {
  [ErrorCategory.NETWORK]: {
    title: 'Errore di Connessione',
    message: 'Impossibile connettersi al server. Verifica la tua connessione internet.',
    suggestions: [
      'Controlla la connessione Wi-Fi o dati mobili',
      'Riprova tra qualche secondo',
      'Se il problema persiste, contatta il supporto',
    ],
  },
  [ErrorCategory.VALIDATION]: {
    title: 'Dati Non Validi',
    message: 'Alcuni dati inseriti non sono corretti.',
    suggestions: [
      'Verifica i campi evidenziati in rosso',
      'Assicurati di aver compilato tutti i campi obbligatori',
      'Controlla il formato dei dati (email, telefono, ecc.)',
    ],
  },
  [ErrorCategory.AUTH]: {
    title: 'Errore di Autenticazione',
    message: 'Non sei autorizzato ad accedere a questa risorsa.',
    suggestions: [
      'Effettua nuovamente il login',
      'Verifica le tue credenziali',
      'Se hai dimenticato la password, usa il recupero password',
    ],
  },
  [ErrorCategory.FIRESTORE]: {
    title: 'Errore Database',
    message: 'Si è verificato un errore durante il salvataggio dei dati.',
    suggestions: [
      'Riprova tra qualche secondo',
      'Verifica che i dati siano corretti',
      'Se il problema persiste, contatta il supporto',
    ],
  },
  [ErrorCategory.PERMISSION]: {
    title: 'Accesso Negato',
    message: 'Non hai i permessi necessari per questa operazione.',
    suggestions: [
      'Contatta l\'amministratore per richiedere i permessi',
      'Verifica di essere loggato con l\'account corretto',
      'Alcuni contenuti potrebbero essere riservati agli admin',
    ],
  },
  [ErrorCategory.PAYMENT]: {
    title: 'Errore Pagamento',
    message: 'Si è verificato un errore durante il pagamento.',
    suggestions: [
      'Verifica i dati della carta di credito',
      'Controlla il saldo disponibile',
      'Prova con un metodo di pagamento diverso',
      'Contatta la tua banca se il problema persiste',
    ],
  },
  [ErrorCategory.UNKNOWN]: {
    title: 'Errore Imprevisto',
    message: 'Si è verificato un errore imprevisto.',
    suggestions: [
      'Riprova tra qualche secondo',
      'Ricarica la pagina',
      'Se il problema persiste, contatta il supporto',
    ],
  },
};

// Firebase error code mapping
const FIREBASE_ERROR_MAP = {
  'permission-denied': ErrorCategory.PERMISSION,
  'unauthenticated': ErrorCategory.AUTH,
  'invalid-argument': ErrorCategory.VALIDATION,
  'not-found': ErrorCategory.FIRESTORE,
  'already-exists': ErrorCategory.VALIDATION,
  'resource-exhausted': ErrorCategory.FIRESTORE,
  'failed-precondition': ErrorCategory.VALIDATION,
  'aborted': ErrorCategory.FIRESTORE,
  'out-of-range': ErrorCategory.VALIDATION,
  'unimplemented': ErrorCategory.FIRESTORE,
  'internal': ErrorCategory.FIRESTORE,
  'unavailable': ErrorCategory.NETWORK,
  'data-loss': ErrorCategory.FIRESTORE,
};

/**
 * ErrorTracker Class
 * Singleton per gestire error tracking centralizzato
 */
class ErrorTracker {
  constructor() {
    if (ErrorTracker.instance) {
      return ErrorTracker.instance;
    }

    this.errors = [];
    this.maxErrors = 100; // Max errors in memory
    this.rateLimitMap = new Map(); // Rate limiting per error type
    this.rateLimitWindow = 60000; // 1 minute
    this.rateLimitMax = 10; // Max 10 errors per type per minute
    this.offlineQueue = [];
    this.sessionId = this.generateSessionId();
    this.isOnline = navigator.onLine;

    // Listen to online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushOfflineQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Load persisted errors
    this.loadPersistedErrors();

    ErrorTracker.instance = this;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Categorize error based on error object
   */
  categorizeError(error) {
    if (!error) return ErrorCategory.UNKNOWN;

    // Network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return ErrorCategory.NETWORK;
    }

    // Firebase errors
    if (error.code) {
      const category = FIREBASE_ERROR_MAP[error.code];
      if (category) return category;
    }

    // Auth errors
    if (error.code?.startsWith('auth/')) {
      return ErrorCategory.AUTH;
    }

    // Validation errors
    if (error.name === 'ValidationError' || error.message?.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }

    // Firestore errors
    if (error.code?.startsWith('firestore/')) {
      return ErrorCategory.FIRESTORE;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  determineSeverity(category, error) {
    // Critical errors
    if (category === ErrorCategory.AUTH && error.code === 'unauthenticated') {
      return ErrorSeverity.CRITICAL;
    }
    if (category === ErrorCategory.PAYMENT) {
      return ErrorSeverity.HIGH;
    }
    if (category === ErrorCategory.FIRESTORE && error.code === 'data-loss') {
      return ErrorSeverity.CRITICAL;
    }

    // High errors
    if (category === ErrorCategory.PERMISSION) {
      return ErrorSeverity.HIGH;
    }
    if (category === ErrorCategory.FIRESTORE) {
      return ErrorSeverity.HIGH;
    }

    // Medium errors
    if (category === ErrorCategory.NETWORK) {
      return ErrorSeverity.MEDIUM;
    }
    if (category === ErrorCategory.VALIDATION) {
      return ErrorSeverity.MEDIUM;
    }

    // Low errors
    return ErrorSeverity.LOW;
  }

  /**
   * Rate limiting check
   */
  shouldRateLimit(category) {
    const now = Date.now();
    const key = category;

    if (!this.rateLimitMap.has(key)) {
      this.rateLimitMap.set(key, { count: 1, timestamp: now });
      return false;
    }

    const data = this.rateLimitMap.get(key);
    
    // Reset if outside window
    if (now - data.timestamp > this.rateLimitWindow) {
      this.rateLimitMap.set(key, { count: 1, timestamp: now });
      return false;
    }

    // Increment count
    data.count++;

    // Check if exceeded limit
    if (data.count > this.rateLimitMax) {
      return true;
    }

    return false;
  }

  /**
   * Track error
   */
  track(error, context = {}) {
    try {
      const category = this.categorizeError(error);
      const severity = this.determineSeverity(category, error);

      // Rate limiting
      if (this.shouldRateLimit(category)) {
        console.warn(`[ErrorTracker] Rate limit exceeded for ${category}`);
        return null;
      }

      // Build error object
      const errorObj = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        category,
        severity,
        message: error.message || 'Unknown error',
        stack: error.stack,
        code: error.code,
        context: {
          ...context,
          url: window.location.href,
          userAgent: navigator.userAgent,
          online: this.isOnline,
        },
      };

      // Add to memory
      this.errors.unshift(errorObj);
      if (this.errors.length > this.maxErrors) {
        this.errors.pop();
      }

      // Persist
      this.persistErrors();

      // Log to Firebase Analytics
      this.logToAnalytics(errorObj);

      // Log to console (development)
      if (import.meta.env.DEV) {
        console.error('[ErrorTracker]', errorObj);
      }

      // Optional: Send to Sentry
      this.sendToSentry(errorObj);

      return errorObj;
    } catch (trackingError) {
      console.error('[ErrorTracker] Failed to track error:', trackingError);
      return null;
    }
  }

  /**
   * Log to Firebase Analytics
   */
  logToAnalytics(errorObj) {
    try {
      if (!this.isOnline) {
        this.offlineQueue.push(errorObj);
        return;
      }

      if (analytics) {
        logEvent(analytics, 'error', {
          category: errorObj.category,
          severity: errorObj.severity,
          message: errorObj.message.substring(0, 100), // Limit length
          code: errorObj.code || 'none',
          url: errorObj.context.url,
        });
      }
    } catch (err) {
      console.error('[ErrorTracker] Failed to log to Analytics:', err);
    }
  }

  /**
   * Send to Sentry (optional)
   */
  sendToSentry(errorObj) {
    // Placeholder for Sentry integration
    // Uncomment and configure if using Sentry
    
    /*
    if (window.Sentry) {
      window.Sentry.captureException(new Error(errorObj.message), {
        level: errorObj.severity,
        tags: {
          category: errorObj.category,
          sessionId: errorObj.sessionId,
        },
        extra: errorObj.context,
      });
    }
    */
  }

  /**
   * Flush offline queue when back online
   */
  flushOfflineQueue() {
    if (!this.isOnline || this.offlineQueue.length === 0) return;

    console.log(`[ErrorTracker] Flushing ${this.offlineQueue.length} offline errors`);

    this.offlineQueue.forEach(errorObj => {
      this.logToAnalytics(errorObj);
    });

    this.offlineQueue = [];
  }

  /**
   * Get user-friendly error message
   */
  getFriendlyMessage(error) {
    const category = this.categorizeError(error);
    return ERROR_MESSAGES[category] || ERROR_MESSAGES[ErrorCategory.UNKNOWN];
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 50) {
    return this.errors.slice(0, limit);
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category) {
    return this.errors.filter(e => e.category === category);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity) {
    return this.errors.filter(e => e.severity === severity);
  }

  /**
   * Get error stats
   */
  getStats() {
    const stats = {
      total: this.errors.length,
      byCategory: {},
      bySeverity: {},
      last24h: 0,
      last1h: 0,
    };

    const now = Date.now();
    const hour = 3600000;
    const day = hour * 24;

    this.errors.forEach(error => {
      // By category
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;

      // By severity
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;

      // Time-based
      if (now - error.timestamp < hour) {
        stats.last1h++;
      }
      if (now - error.timestamp < day) {
        stats.last24h++;
      }
    });

    return stats;
  }

  /**
   * Clear errors
   */
  clear() {
    this.errors = [];
    this.persistErrors();
  }

  /**
   * Clear errors by category
   */
  clearByCategory(category) {
    this.errors = this.errors.filter(e => e.category !== category);
    this.persistErrors();
  }

  /**
   * Persist errors to localStorage
   */
  persistErrors() {
    try {
      const data = {
        errors: this.errors.slice(0, 50), // Persist only last 50
        sessionId: this.sessionId,
        timestamp: Date.now(),
      };
      localStorage.setItem('errorTracker_data', JSON.stringify(data));
    } catch (err) {
      console.error('[ErrorTracker] Failed to persist errors:', err);
    }
  }

  /**
   * Load persisted errors
   */
  loadPersistedErrors() {
    try {
      const data = localStorage.getItem('errorTracker_data');
      if (!data) return;

      const parsed = JSON.parse(data);
      const age = Date.now() - parsed.timestamp;

      // Only load if less than 24 hours old
      if (age < 24 * 3600000 && parsed.errors) {
        this.errors = parsed.errors;
      }
    } catch (err) {
      console.error('[ErrorTracker] Failed to load persisted errors:', err);
    }
  }

  /**
   * Export errors as JSON
   */
  exportJSON() {
    const data = {
      exportDate: new Date().toISOString(),
      sessionId: this.sessionId,
      stats: this.getStats(),
      errors: this.errors,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export errors as CSV
   */
  exportCSV() {
    const headers = ['Timestamp', 'Category', 'Severity', 'Message', 'Code', 'URL'];
    const rows = this.errors.map(e => [
      new Date(e.timestamp).toISOString(),
      e.category,
      e.severity,
      e.message.replace(/,/g, ';'), // Escape commas
      e.code || '',
      e.context.url,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

/**
 * Track error helper function
 */
export function trackError(error, context = {}) {
  return errorTracker.track(error, context);
}

/**
 * Get user-friendly error message
 */
export function getFriendlyErrorMessage(error) {
  return errorTracker.getFriendlyMessage(error);
}

/**
 * Higher-order function to wrap async functions with error tracking
 */
export function withErrorTracking(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      trackError(error, {
        ...context,
        function: fn.name,
        args: args.map(a => typeof a === 'object' ? '[object]' : String(a)),
      });
      throw error; // Re-throw to allow handling
    }
  };
}

/**
 * React hook for error tracking
 */
export function useErrorTracking() {
  const track = (error, context = {}) => {
    return trackError(error, context);
  };

  const getFriendlyMessage = (error) => {
    return getFriendlyErrorMessage(error);
  };

  return {
    trackError: track,
    getFriendlyMessage,
  };
}

export default errorTracker;
