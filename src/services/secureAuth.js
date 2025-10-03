/**
 * Secure Authentication Service
 * Wrapper around Firebase Auth with enhanced security features
 */

import { rateLimiter, sanitizeEmail, isValidEmail } from '../lib/security';
import analyticsModule from '../lib/analytics';
// import { trackFirebaseError } from '../lib/sentry';
import * as authService from './auth.jsx';

// Rate limiting configurations
const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 900000 }, // 5 attempts per 15 minutes
  signup: { maxAttempts: 3, windowMs: 3600000 }, // 3 attempts per hour
  passwordReset: { maxAttempts: 3, windowMs: 3600000 }, // 3 attempts per hour
  socialLogin: { maxAttempts: 10, windowMs: 900000 }, // 10 attempts per 15 minutes
};

// Suspicious activity patterns
const SUSPICIOUS_PATTERNS = {
  rapidRequests: 10, // More than 10 auth requests in 5 minutes
  multipleFailures: 5, // More than 5 consecutive failures
  unusualEmail: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, // Basic email validation
};

class SecureAuthService {
  constructor() {
    this.failureCount = new Map(); // Track consecutive failures by IP/user
    this.requestHistory = new Map(); // Track request patterns
    this.csrfTokens = new Map(); // Store CSRF tokens per session
  }

  /**
   * Get client identifier for rate limiting
   * @returns {string} Client identifier
   */
  getClientId() {
    // Use a combination of factors for identification
    const fingerprint = [
      navigator.userAgent.substring(0, 50),
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
    ].join('|');

    return btoa(fingerprint).substring(0, 32);
  }

  /**
   * Check rate limiting for authentication operations
   * @param {string} operation - Type of operation
   * @param {string} identifier - Client identifier
   * @returns {boolean} True if allowed
   */
  checkRateLimit(operation, identifier) {
    const config = RATE_LIMITS[operation];
    if (!config) return true;

    const key = `auth_${operation}_${identifier}`;
    return rateLimiter.isAllowed(key, config.maxAttempts, config.windowMs);
  }

  /**
   * Track authentication request
   * @param {string} operation - Type of operation
   * @param {string} identifier - Client identifier
   * @param {boolean} success - Whether operation was successful
   */
  trackAuthRequest(operation, identifier, success) {
    const now = Date.now();
    const key = `${operation}_${identifier}`;

    // Track request history
    if (!this.requestHistory.has(key)) {
      this.requestHistory.set(key, []);
    }

    const history = this.requestHistory.get(key);
    history.push({ timestamp: now, success });

    // Keep only last 20 requests
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    // Track consecutive failures
    if (!success) {
      const currentFailures = this.failureCount.get(key) || 0;
      this.failureCount.set(key, currentFailures + 1);

      // Check for suspicious activity
      if (currentFailures >= SUSPICIOUS_PATTERNS.multipleFailures) {
        this.reportSuspiciousActivity('multiple_auth_failures', {
          operation,
          failures: currentFailures + 1,
          identifier,
        });
      }
    } else {
      this.failureCount.delete(key); // Reset on success
    }

    // Check for rapid requests
    const recentRequests = history.filter((req) => now - req.timestamp < 300000); // 5 minutes
    if (recentRequests.length >= SUSPICIOUS_PATTERNS.rapidRequests) {
      this.reportSuspiciousActivity('rapid_auth_requests', {
        operation,
        requestCount: recentRequests.length,
        identifier,
      });
    }

    // Track analytics
    analyticsModule.trackEvent('auth_request', {
      operation,
      success,
      timestamp: now,
      consecutive_failures: this.failureCount.get(key) || 0,
    });
  }

  /**
   * Report suspicious activity
   * @param {string} type - Type of suspicious activity
   * @param {object} metadata - Additional metadata
   */
  reportSuspiciousActivity(type, metadata) {
    console.warn('🚨 Suspicious authentication activity detected:', type, metadata);

    // Dispatch event for SecurityContext to handle
    window.dispatchEvent(
      new CustomEvent('suspiciousAuthActivity', {
        detail: { type, metadata, timestamp: Date.now() },
      })
    );

    analyticsModule.trackEvent('security_auth_threat', {
      type,
      metadata,
      timestamp: Date.now(),
    });
  }

  /**
   * Validate and sanitize email input
   * @param {string} email - Email to validate
   * @returns {object} Validation result
   */
  validateEmailInput(email) {
    const sanitized = sanitizeEmail(email);
    const isValid = isValidEmail(sanitized);

    // Check for suspicious email patterns
    const isSuspicious = !SUSPICIOUS_PATTERNS.unusualEmail.test(sanitized);

    if (isSuspicious) {
      this.reportSuspiciousActivity('suspicious_email', {
        originalEmail: email,
        sanitizedEmail: sanitized,
      });
    }

    return {
      email: sanitized,
      isValid,
      isSuspicious,
    };
  }

  /**
   * Secure email/password login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login result
   */
  async secureEmailLogin(email, password) {
    const clientId = this.getClientId();

    try {
      // Rate limiting check
      if (!this.checkRateLimit('login', clientId)) {
        throw new Error('Too many login attempts. Please wait before trying again.');
      }

      // Input validation
      const emailValidation = this.validateEmailInput(email);
      if (!emailValidation.isValid) {
        throw new Error('Please enter a valid email address.');
      }

      if (emailValidation.isSuspicious) {
        console.warn('Suspicious email pattern detected');
      }

      // Call original auth service
      const result = await authService.signInWithEmailAndPassword(emailValidation.email, password);

      // Track successful authentication
      this.trackAuthRequest('login', clientId, true);

      return result;
    } catch (error) {
      // Track failed authentication
      this.trackAuthRequest('login', clientId, false);

      // Enhanced error tracking
      console.error('Secure email login error:', error, {
        clientId,
        emailProvided: !!email,
        passwordProvided: !!password,
      });

      throw error;
    }
  }

  /**
   * Secure email/password registration
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} additionalData - Additional user data
   * @returns {Promise} Registration result
   */
  async secureEmailRegistration(email, password, additionalData = {}) {
    const clientId = this.getClientId();

    try {
      // Rate limiting check
      if (!this.checkRateLimit('signup', clientId)) {
        throw new Error('Too many registration attempts. Please wait before trying again.');
      }

      // Input validation
      const emailValidation = this.validateEmailInput(email);
      if (!emailValidation.isValid) {
        throw new Error('Please enter a valid email address.');
      }

      // Password strength validation (basic)
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }

      // Call original auth service
      const result = await authService.createUserWithEmailAndPassword(
        emailValidation.email,
        password,
        additionalData
      );

      // Track successful registration
      this.trackAuthRequest('signup', clientId, true);

      return result;
    } catch (error) {
      // Track failed registration
      this.trackAuthRequest('signup', clientId, false);

      console.error('Secure email registration error:', error, {
        clientId,
        emailProvided: !!email,
      });

      throw error;
    }
  }

  /**
   * Secure social login (Google/Facebook)
   * @param {string} provider - 'google' or 'facebook'
   * @returns {Promise} Login result
   */
  async secureSocialLogin(provider) {
    const clientId = this.getClientId();

    try {
      // Rate limiting check
      if (!this.checkRateLimit('socialLogin', clientId)) {
        throw new Error('Too many social login attempts. Please wait before trying again.');
      }

      let result;
      switch (provider) {
        case 'google':
          result = await authService.signInWithGoogle();
          break;
        case 'facebook':
          result = await authService.signInWithFacebook();
          break;
        default:
          throw new Error('Unsupported social login provider');
      }

      // Track successful social login
      this.trackAuthRequest('socialLogin', clientId, true);

      return result;
    } catch (error) {
      // Track failed social login
      this.trackAuthRequest('socialLogin', clientId, false);

      console.error('Secure social login error:', error, {
        provider,
        clientId,
      });

      throw error;
    }
  }

  /**
   * Secure password reset
   * @param {string} email - User email
   * @returns {Promise} Reset result
   */
  async securePasswordReset(email) {
    const clientId = this.getClientId();

    try {
      // Rate limiting check
      if (!this.checkRateLimit('passwordReset', clientId)) {
        throw new Error('Too many password reset attempts. Please wait before trying again.');
      }

      // Input validation
      const emailValidation = this.validateEmailInput(email);
      if (!emailValidation.isValid) {
        throw new Error('Please enter a valid email address.');
      }

      // Call original auth service
      const result = await authService.sendPasswordResetEmail(emailValidation.email);

      // Track successful password reset request
      this.trackAuthRequest('passwordReset', clientId, true);

      return result;
    } catch (error) {
      // Track failed password reset
      this.trackAuthRequest('passwordReset', clientId, false);

      console.error('Secure password reset error:', error, {
        clientId,
        emailProvided: !!email,
      });

      throw error;
    }
  }

  /**
   * Secure logout with cleanup
   * @returns {Promise} Logout result
   */
  async secureLogout() {
    const clientId = this.getClientId();

    try {
      // Clear security state
      this.failureCount.delete(`login_${clientId}`);
      this.requestHistory.delete(`login_${clientId}`);
      this.csrfTokens.clear();

      // Call original auth service
      const result = await authService.signOut();

      analyticsModule.trackEvent('auth_logout', {
        secure: true,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error('Secure logout error:', error, { clientId });
      throw error;
    }
  }

  /**
   * Get authentication security metrics
   * @returns {object} Security metrics
   */
  getSecurityMetrics() {
    const clientId = this.getClientId();

    return {
      failureCount: this.failureCount.get(`login_${clientId}`) || 0,
      requestHistory: this.requestHistory.get(`login_${clientId}`) || [],
      remainingLoginAttempts: rateLimiter.getRemaining(
        `auth_login_${clientId}`,
        RATE_LIMITS.login.maxAttempts,
        RATE_LIMITS.login.windowMs
      ),
      remainingSignupAttempts: rateLimiter.getRemaining(
        `auth_signup_${clientId}`,
        RATE_LIMITS.signup.maxAttempts,
        RATE_LIMITS.signup.windowMs
      ),
    };
  }

  /**
   * Initialize security monitoring
   */
  initializeSecurityMonitoring() {
    // Listen for suspicious auth activities
    window.addEventListener('suspiciousAuthActivity', (event) => {
      console.warn('Auth security event:', event.detail);
    });

    // Periodic cleanup of old data
    setInterval(() => {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Clean up old request history
      for (const [key, history] of this.requestHistory.entries()) {
        const recentHistory = history.filter((req) => now - req.timestamp < maxAge);
        if (recentHistory.length === 0) {
          this.requestHistory.delete(key);
        } else {
          this.requestHistory.set(key, recentHistory);
        }
      }

      // Clean up old failure counts
      for (const [key] of this.failureCount.entries()) {
        const history = this.requestHistory.get(key);
        if (!history || history.length === 0) {
          this.failureCount.delete(key);
        }
      }
    }, 3600000); // Every hour
  }
}

// Create and export singleton instance
const secureAuthService = new SecureAuthService();

// Initialize security monitoring
secureAuthService.initializeSecurityMonitoring();

export default secureAuthService;
