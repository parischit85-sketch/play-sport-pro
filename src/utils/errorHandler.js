/**
 * Utility centralizzata per gestione errori Firestore
 * Fornisce fallback robusti e logging consistente
 */

// Error codes mapping
export const FIRESTORE_ERROR_CODES = {
  PERMISSION_DENIED: 'permission-denied',
  UNAVAILABLE: 'unavailable',
  NOT_FOUND: 'not-found',
  UNAUTHENTICATED: 'unauthenticated',
  RESOURCE_EXHAUSTED: 'resource-exhausted',
  DEADLINE_EXCEEDED: 'deadline-exceeded',
  CANCELLED: 'cancelled',
  ALREADY_EXISTS: 'already-exists',
  FAILED_PRECONDITION: 'failed-precondition',
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low', // Can fallback gracefully
  MEDIUM: 'medium', // Affects functionality but not critical
  HIGH: 'high', // Critical functionality affected
  CRITICAL: 'critical', // App-breaking
};

// Get error severity based on error code
export function getErrorSeverity(error) {
  const code = error?.code || '';

  switch (code) {
    case FIRESTORE_ERROR_CODES.PERMISSION_DENIED:
    case FIRESTORE_ERROR_CODES.UNAUTHENTICATED:
      return ERROR_SEVERITY.MEDIUM;

    case FIRESTORE_ERROR_CODES.UNAVAILABLE:
    case FIRESTORE_ERROR_CODES.DEADLINE_EXCEEDED:
    case FIRESTORE_ERROR_CODES.RESOURCE_EXHAUSTED:
      return ERROR_SEVERITY.HIGH;

    case FIRESTORE_ERROR_CODES.NOT_FOUND:
      return ERROR_SEVERITY.LOW;

    case FIRESTORE_ERROR_CODES.CANCELLED:
      return ERROR_SEVERITY.LOW;

    default:
      return ERROR_SEVERITY.MEDIUM;
  }
}

// Get user-friendly error message
export function getErrorMessage(error, context = '') {
  const code = error?.code || '';

  const messages = {
    [FIRESTORE_ERROR_CODES.PERMISSION_DENIED]: 'Non hai i permessi per accedere a questi dati.',
    [FIRESTORE_ERROR_CODES.UNAVAILABLE]:
      'Servizio temporaneamente non disponibile. Riprova più tardi.',
    [FIRESTORE_ERROR_CODES.NOT_FOUND]: 'I dati richiesti non sono stati trovati.',
    [FIRESTORE_ERROR_CODES.UNAUTHENTICATED]: "Devi effettuare l'accesso per continuare.",
    [FIRESTORE_ERROR_CODES.RESOURCE_EXHAUSTED]:
      'Servizio temporaneamente sovraccarico. Riprova più tardi.',
    [FIRESTORE_ERROR_CODES.DEADLINE_EXCEEDED]:
      'Richiesta scaduta. Controlla la connessione di rete.',
    [FIRESTORE_ERROR_CODES.CANCELLED]: 'Operazione annullata.',
    [FIRESTORE_ERROR_CODES.ALREADY_EXISTS]: 'I dati esistono già.',
    [FIRESTORE_ERROR_CODES.FAILED_PRECONDITION]: "Condizioni non soddisfatte per l'operazione.",
  };

  const defaultMessage = 'Si è verificato un errore imprevisto.';
  const message = messages[code] || defaultMessage;

  return context ? `${context}: ${message}` : message;
}

// Check if error is retryable
export function isRetryableError(error) {
  const code = error?.code || '';

  const retryableCodes = [
    FIRESTORE_ERROR_CODES.UNAVAILABLE,
    FIRESTORE_ERROR_CODES.DEADLINE_EXCEEDED,
    FIRESTORE_ERROR_CODES.RESOURCE_EXHAUSTED,
    FIRESTORE_ERROR_CODES.CANCELLED,
  ];

  return retryableCodes.includes(code);
}

// Enhanced error handler with fallback patterns
export class FirestoreErrorHandler {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.cooldowns = new Map(); // operation -> timestamp
    this.cache = new Map(); // operation -> { data, timestamp }
  }

  // Handle error with appropriate fallback strategy
  async handleError(operation, error, fallbackData = null, options = {}) {
    const {
      cacheTTL = 30000, // 30s cache
      cooldownTTL = 60000, // 60s cooldown
      enableCache = true,
      enableCooldown = true,
    } = options;

    const severity = getErrorSeverity(error);
    const message = getErrorMessage(error, `[${this.serviceName}] ${operation}`);

    // Log based on severity
    switch (severity) {
      case ERROR_SEVERITY.LOW:
        console.info(message);
        break;
      case ERROR_SEVERITY.MEDIUM:
        console.warn(message);
        break;
      case ERROR_SEVERITY.HIGH:
      case ERROR_SEVERITY.CRITICAL:
        console.error(message, error);
        break;
    }

    // Handle permission denied with cooldown
    if (error.code === FIRESTORE_ERROR_CODES.PERMISSION_DENIED && enableCooldown) {
      this.cooldowns.set(operation, Date.now() + cooldownTTL);
    }

    // Return cached data if available
    if (enableCache) {
      const cached = this.cache.get(operation);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        console.info(`[${this.serviceName}] Returning cached data for ${operation}`);
        return cached.data;
      }
    }

    // Return fallback data
    return fallbackData;
  }

  // Check if operation is in cooldown
  isInCooldown(operation) {
    const cooldownUntil = this.cooldowns.get(operation);
    return cooldownUntil && Date.now() < cooldownUntil;
  }

  // Cache successful operation result
  cacheResult(operation, data, ttl = 30000) {
    this.cache.set(operation, {
      data,
      timestamp: Date.now(),
    });

    // Auto-cleanup after TTL
    setTimeout(() => {
      this.cache.delete(operation);
    }, ttl);
  }

  // Clear cache for specific operation
  clearCache(operation) {
    this.cache.delete(operation);
  }

  // Clear all caches and cooldowns
  clearAll() {
    this.cache.clear();
    this.cooldowns.clear();
  }
}

// Helper function for async operations with retry logic
export async function withRetry(operation, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry non-retryable errors
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      console.warn(`Retry ${attempt}/${maxRetries} after ${backoffDelay}ms:`, error.message);

      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
}

// Export singleton instances for common services
export const clubsErrorHandler = new FirestoreErrorHandler('clubs');
export const authErrorHandler = new FirestoreErrorHandler('auth');
export const bookingsErrorHandler = new FirestoreErrorHandler('bookings');
