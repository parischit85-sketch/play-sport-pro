// =============================================
// FILE: src/utils/sanitizer.js
// Utility functions to sanitize sensitive data from logs and errors
// =============================================

/**
 * Sensitive field names that should be sanitized
 */
const SENSITIVE_FIELDS = [
  'password',
  'pwd',
  'pass',
  'secret',
  'token',
  'key',
  'apiKey',
  'apiSecret',
  'accessToken',
  'refreshToken',
  'sessionToken',
  'credential',
  'credentials',
];

/**
 * Sanitize error message to remove sensitive data
 * @param {Error|string} error - Error object or string
 * @param {Array<string>} additionalFields - Additional field names to sanitize
 * @returns {string} Sanitized error message
 */
export function sanitizeError(error, additionalFields = []) {
  let message = typeof error === 'string' ? error : error?.message || 'Unknown error';

  const fieldsToSanitize = [...SENSITIVE_FIELDS, ...additionalFields];

  fieldsToSanitize.forEach((field) => {
    // Remove field=value patterns (e.g., password=abc123)
    const regex1 = new RegExp(`${field}[=:]\\s*[^\\s,;)]+`, 'gi');
    message = message.replace(regex1, `${field}=***`);

    // Remove "field": "value" patterns in JSON
    const regex2 = new RegExp(`"${field}"\\s*:\\s*"[^"]*"`, 'gi');
    message = message.replace(regex2, `"${field}":"***"`);

    // Remove field: value patterns without quotes
    const regex3 = new RegExp(`${field}\\s*:\\s*[^,}\\s]+`, 'gi');
    message = message.replace(regex3, `${field}: ***`);
  });

  return message;
}

/**
 * Sanitize object for logging (removes sensitive fields)
 * @param {Object} obj - Object to sanitize
 * @param {Array<string>} additionalFields - Additional field names to sanitize
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(obj, additionalFields = []) {
  if (!obj || typeof obj !== 'object') return obj;

  const fieldsToSanitize = [...SENSITIVE_FIELDS, ...additionalFields];
  const sanitized = { ...obj };

  Object.keys(sanitized).forEach((key) => {
    if (fieldsToSanitize.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '***';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key], additionalFields);
    }
  });

  return sanitized;
}

/**
 * Safe console.log that sanitizes sensitive data
 * @param {...any} args - Arguments to log
 */
export function safeLog(...args) {
  const sanitized = args.map((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      return sanitizeObject(arg);
    }
    if (typeof arg === 'string') {
      return sanitizeError(arg);
    }
    return arg;
  });

  console.log(...sanitized);
}

/**
 * Safe console.error that sanitizes sensitive data
 * @param {...any} args - Arguments to log
 */
export function safeError(...args) {
  const sanitized = args.map((arg) => {
    if (arg instanceof Error) {
      return new Error(sanitizeError(arg));
    }
    if (typeof arg === 'object' && arg !== null) {
      return sanitizeObject(arg);
    }
    if (typeof arg === 'string') {
      return sanitizeError(arg);
    }
    return arg;
  });

  console.error(...sanitized);
}

/**
 * Sanitize Firebase Auth error
 * @param {Error} error - Firebase Auth error
 * @returns {Error} Sanitized error
 */
export function sanitizeAuthError(error) {
  if (!error) return error;

  const sanitized = new Error(sanitizeError(error.message));
  sanitized.code = error.code;
  sanitized.name = error.name;

  return sanitized;
}

/**
 * Get user-friendly error message for Firebase Auth errors
 * @param {Error} error - Firebase Auth error
 * @returns {string} User-friendly message
 */
export function getAuthErrorMessage(error) {
  const code = error?.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return "Questa email è già registrata. Prova ad accedere o usa un'altra email.";
    case 'auth/weak-password':
      return 'La password deve essere di almeno 6 caratteri.';
    case 'auth/invalid-email':
      return 'Formato email non valido.';
    case 'auth/user-not-found':
      return 'Email non trovata. Verifica o registrati.';
    case 'auth/wrong-password':
      return 'Password errata. Riprova o reimposta la password.';
    case 'auth/too-many-requests':
      return 'Troppi tentativi falliti. Riprova più tardi o reimposta la password.';
    case 'auth/user-disabled':
      return 'Account disabilitato. Contatta il supporto.';
    case 'auth/operation-not-allowed':
      return 'Operazione non consentita. Contatta il supporto.';
    case 'auth/invalid-credential':
      return 'Credenziali non valide. Verifica email e password.';
    default:
      return sanitizeError(error.message || "Errore durante l'autenticazione. Riprova.");
  }
}

/**
 * Sanitize data for Sentry error reporting
 * @param {any} data - Data to sanitize
 * @returns {any} Sanitized data
 */
export function sanitizeForSentry(data) {
  if (!data) return data;

  if (typeof data === 'object') {
    return sanitizeObject(data);
  }

  if (typeof data === 'string') {
    return sanitizeError(data);
  }

  return data;
}
