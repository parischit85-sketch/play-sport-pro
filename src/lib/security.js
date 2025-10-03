/**
 * Security utilities for input sanitization, validation, and protection
 * Implements OWASP security best practices for web applications
 */

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitize HTML input to prevent XSS attacks
 * @param {string} input - Raw HTML input
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return '';

  // Create a temporary element to decode HTML entities
  const temp = document.createElement('div');
  temp.innerHTML = input;

  // Remove dangerous tags and attributes
  const dangerousTags = [
    'script',
    'iframe',
    'object',
    'embed',
    'form',
    'input',
    'textarea',
    'button',
    'select',
  ];
  const dangerousAttributes = [
    'onclick',
    'onload',
    'onerror',
    'onmouseover',
    'onfocus',
    'onblur',
    'onchange',
    'onsubmit',
  ];

  // Remove dangerous tags
  dangerousTags.forEach((tag) => {
    const elements = temp.getElementsByTagName(tag);
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].parentNode.removeChild(elements[i]);
    }
  });

  // Remove dangerous attributes from all elements
  const allElements = temp.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    dangerousAttributes.forEach((attr) => {
      element.removeAttribute(attr);
    });
    // Remove javascript: and data: URLs
    ['href', 'src', 'action'].forEach((attr) => {
      const value = element.getAttribute(attr);
      if (value && (value.startsWith('javascript:') || value.startsWith('data:'))) {
        element.removeAttribute(attr);
      }
    });
  }

  return temp.innerHTML;
};

/**
 * Sanitize text input for safe display
 * @param {string} input - Raw text input
 * @returns {string} Sanitized text
 */
export const sanitizeText = (input) => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize email input
 * @param {string} email - Email input
 * @returns {string} Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';

  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9@._-]/g, ''); // Allow only valid email characters
};

/**
 * Sanitize phone number input
 * @param {string} phone - Phone number input
 * @returns {string} Sanitized phone number
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return '';

  return phone.replace(/[^0-9+\-\s()]/g, '').trim();
};

/**
 * Sanitize URL input
 * @param {string} url - URL input
 * @returns {string} Sanitized URL or empty string if invalid
 */
export const sanitizeURL = (url) => {
  if (typeof url !== 'string') return '';

  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
};

// =============================================================================
// INPUT VALIDATION
// =============================================================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return typeof email === 'string' && emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with score and requirements
 */
export const validatePassword = (password) => {
  if (typeof password !== 'string') {
    return { isValid: false, score: 0, requirements: [] };
  }

  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noCommon: !isCommonPassword(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  const isValid = score >= 4 && requirements.length && requirements.noCommon;

  return {
    isValid,
    score,
    requirements: {
      'At least 8 characters': requirements.length,
      'One uppercase letter': requirements.uppercase,
      'One lowercase letter': requirements.lowercase,
      'One number': requirements.number,
      'One special character': requirements.special,
      'Not a common password': requirements.noCommon,
    },
  };
};

/**
 * Check if password is commonly used
 * @param {string} password - Password to check
 * @returns {boolean} True if password is common
 */
const isCommonPassword = (password) => {
  const commonPasswords = [
    'password',
    '123456',
    '123456789',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
    'master',
    'shadow',
    'football',
    'baseball',
  ];
  return commonPasswords.includes(password.toLowerCase());
};

/**
 * Validate phone number format (Italian)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+39|0039|39)?[\s]?[0-9]{10}$/;
  return typeof phone === 'string' && phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
};

/**
 * Validate Italian fiscal code
 * @param {string} fiscalCode - Fiscal code to validate
 * @returns {boolean} True if valid fiscal code
 */
export const isValidFiscalCode = (fiscalCode) => {
  if (typeof fiscalCode !== 'string') return false;

  const fcRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
  return fcRegex.test(fiscalCode.toUpperCase());
};

// =============================================================================
// RATE LIMITING
// =============================================================================

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.cleanup();
  }

  /**
   * Check if request is allowed
   * @param {string} key - Unique identifier for the requester
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} True if request is allowed
   */
  isAllowed(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const requestTimes = this.requests.get(key);

    // Remove old requests outside the window
    const validRequests = requestTimes.filter((time) => time > windowStart);

    if (validRequests.length >= maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  /**
   * Get remaining requests for a key
   * @param {string} key - Unique identifier
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {number} Remaining requests
   */
  getRemaining(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.requests.has(key)) {
      return maxRequests;
    }

    const requestTimes = this.requests.get(key);
    const validRequests = requestTimes.filter((time) => time > windowStart);

    return Math.max(0, maxRequests - validRequests.length);
  }

  /**
   * Clean up old entries periodically
   */
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 3600000; // 1 hour

      for (const [key, requests] of this.requests.entries()) {
        const validRequests = requests.filter((time) => time > now - maxAge);
        if (validRequests.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, validRequests);
        }
      }
    }, 300000); // Clean up every 5 minutes
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// =============================================================================
// CSRF PROTECTION
// =============================================================================

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store CSRF token in session storage
 * @param {string} token - CSRF token
 */
export const storeCSRFToken = (token) => {
  sessionStorage.setItem('csrf_token', token);
};

/**
 * Get CSRF token from session storage
 * @returns {string|null} CSRF token or null
 */
export const getCSRFToken = () => {
  return sessionStorage.getItem('csrf_token');
};

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} True if token is valid
 */
export const validateCSRFToken = (token) => {
  const storedToken = getCSRFToken();
  return storedToken && storedToken === token;
};

// =============================================================================
// SECURE HEADERS UTILITY
// =============================================================================

/**
 * Get security headers for fetch requests
 * @returns {object} Security headers
 */
export const getSecurityHeaders = () => {
  const csrfToken = getCSRFToken();

  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
  };
};

// =============================================================================
// SESSION SECURITY
// =============================================================================

/**
 * Secure session management
 */
export class SecureSession {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.warningTime = 5 * 60 * 1000; // 5 minutes before timeout
    this.checkInterval = 60 * 1000; // Check every minute

    this.lastActivity = Date.now();
    this.timeoutWarningShown = false;

    this.startActivityTracking();
    this.startSessionCheck();
  }

  /**
   * Update last activity time
   */
  updateActivity() {
    this.lastActivity = Date.now();
    this.timeoutWarningShown = false;
  }

  /**
   * Check if session is expired
   * @returns {boolean} True if session is expired
   */
  isExpired() {
    return Date.now() - this.lastActivity > this.sessionTimeout;
  }

  /**
   * Get time until session expires
   * @returns {number} Milliseconds until expiration
   */
  getTimeUntilExpiry() {
    return this.sessionTimeout - (Date.now() - this.lastActivity);
  }

  /**
   * Start tracking user activity
   */
  startActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach((event) => {
      document.addEventListener(event, () => this.updateActivity(), true);
    });
  }

  /**
   * Start periodic session checks
   */
  startSessionCheck() {
    setInterval(() => {
      const timeUntilExpiry = this.getTimeUntilExpiry();

      // Show warning if close to expiry and warning not shown
      if (timeUntilExpiry <= this.warningTime && !this.timeoutWarningShown) {
        this.showTimeoutWarning(timeUntilExpiry);
        this.timeoutWarningShown = true;
      }

      // Logout if expired
      if (this.isExpired()) {
        this.handleSessionExpiry();
      }
    }, this.checkInterval);
  }

  /**
   * Show timeout warning to user
   * @param {number} timeRemaining - Time remaining in milliseconds
   */
  showTimeoutWarning(timeRemaining) {
    const minutes = Math.ceil(timeRemaining / 60000);

    // Dispatch custom event for UI to handle
    window.dispatchEvent(
      new CustomEvent('sessionTimeout', {
        detail: { timeRemaining: minutes },
      })
    );
  }

  /**
   * Handle session expiry
   */
  handleSessionExpiry() {
    // Clear local data
    sessionStorage.clear();
    localStorage.removeItem('auth_token');

    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('sessionExpired'));
  }

  /**
   * Extend session
   */
  extendSession() {
    this.updateActivity();
  }
}

// =============================================================================
// CONTENT SECURITY POLICY
// =============================================================================

/**
 * Set up Content Security Policy
 */
export const setupCSP = () => {
  // Skip CSP setup in development to avoid Google Auth conflicts
  if (import.meta.env.DEV) {
    console.log('🔒 CSP setup skipped in development mode');
    return;
  }

  // This would typically be set on the server, but we can add some client-side protection
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https:;
      connect-src 'self' https://*.firebaseapp.com https://*.googleapis.com https://www.google-analytics.com https://apis.google.com;
      frame-src 'self' https://accounts.google.com;
      object-src 'none';
    `
      .replace(/\s+/g, ' ')
      .trim();

    document.head.appendChild(meta);
  }
};

// =============================================================================
// SECURITY AUDIT UTILITIES
// =============================================================================

/**
 * Perform basic security audit
 * @returns {object} Security audit results
 */
export const performSecurityAudit = () => {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    score: 0,
    recommendations: [],
  };

  // Check HTTPS
  results.checks.https = location.protocol === 'https:';
  if (!results.checks.https) {
    results.recommendations.push('Use HTTPS in production');
  }

  // Check for CSP
  results.checks.csp = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!results.checks.csp) {
    results.recommendations.push('Implement Content Security Policy');
  }

  // Check session storage security
  results.checks.secureStorage =
    !localStorage.getItem('password') && !sessionStorage.getItem('password');
  if (!results.checks.secureStorage) {
    results.recommendations.push('Never store passwords in browser storage');
  }

  // Check for secure cookies (if any)
  results.checks.secureCookies = !document.cookie.includes('Secure=false');

  // Calculate score
  const passedChecks = Object.values(results.checks).filter(Boolean).length;
  results.score = Math.round((passedChecks / Object.keys(results.checks).length) * 100);

  return results;
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Sanitization
  sanitizeHTML,
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeURL,

  // Validation
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidFiscalCode,

  // Rate limiting
  rateLimiter,

  // CSRF protection
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken,
  validateCSRFToken,

  // Security headers
  getSecurityHeaders,

  // Session security
  SecureSession,

  // CSP
  setupCSP,

  // Security audit
  performSecurityAudit,
};
