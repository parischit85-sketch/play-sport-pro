/**
 * Security Middleware for API requests
 * Provides CSRF protection, request sanitization, and security headers
 */

import { 
  getCSRFToken, 
  getSecurityHeaders, 
  sanitizeText, 
  rateLimiter 
} from '../lib/security';
import analyticsModule from '../lib/analytics';

class SecurityMiddleware {
  constructor() {
    this.requestQueue = new Map(); // Track concurrent requests
    this.blockedRequests = new Set(); // Track blocked request patterns
    this.securityLog = []; // Security event log
  }

  /**
   * Generate request fingerprint for tracking
   * @param {string} url - Request URL
   * @param {string} method - HTTP method
   * @returns {string} Request fingerprint
   */
  generateRequestFingerprint(url, method) {
    const urlObj = new URL(url, window.location.origin);
    return `${method.toUpperCase()}_${urlObj.pathname}`;
  }

  /**
   * Check if request should be blocked
   * @param {string} url - Request URL
   * @param {object} options - Request options
   * @returns {boolean} True if request should be blocked
   */
  shouldBlockRequest(url, options) {
    const fingerprint = this.generateRequestFingerprint(url, options.method || 'GET');
    
    // Check if this request pattern is already blocked
    if (this.blockedRequests.has(fingerprint)) {
      return true;
    }

    // Check for suspicious URL patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /<script/i,
      /\.\./,
      /eval\(/i,
      /expression\(/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(url))) {
      this.blockedRequests.add(fingerprint);
      this.logSecurityEvent('blocked_suspicious_url', { url, fingerprint });
      return true;
    }

    // Check request body for suspicious content
    if (options.body) {
      try {
        const bodyStr = typeof options.body === 'string' 
          ? options.body 
          : JSON.stringify(options.body);
        
        if (suspiciousPatterns.some(pattern => pattern.test(bodyStr))) {
          this.logSecurityEvent('blocked_suspicious_body', { fingerprint });
          return true;
        }
      } catch (error) {
        // If we can't parse the body, log but don't block
        this.logSecurityEvent('unparseable_request_body', { fingerprint });
      }
    }

    return false;
  }

  /**
   * Apply rate limiting to requests
   * @param {string} url - Request URL
   * @param {object} options - Request options
   * @returns {boolean} True if request is allowed
   */
  applyRateLimit(url, options) {
    const fingerprint = this.generateRequestFingerprint(url, options.method || 'GET');
    const clientId = this.getClientId();
    const rateLimitKey = `api_${fingerprint}_${clientId}`;

    // Different rate limits for different types of requests
    let maxRequests = 60; // Default: 60 requests per minute
    let windowMs = 60000; // 1 minute

    // Stricter limits for sensitive operations
    if (url.includes('/auth/') || url.includes('/admin/')) {
      maxRequests = 20;
      windowMs = 60000; // 20 requests per minute for auth/admin
    } else if (options.method === 'POST' || options.method === 'PUT') {
      maxRequests = 30;
      windowMs = 60000; // 30 requests per minute for mutations
    }

    const isAllowed = rateLimiter.isAllowed(rateLimitKey, maxRequests, windowMs);
    
    if (!isAllowed) {
      this.logSecurityEvent('rate_limit_exceeded', {
        fingerprint,
        clientId,
        maxRequests,
        windowMs
      });
    }

    return isAllowed;
  }

  /**
   * Get client identifier
   * @returns {string} Client ID
   */
  getClientId() {
    const fingerprint = [
      navigator.userAgent.substring(0, 50),
      navigator.language,
      screen.width + 'x' + screen.height
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }

  /**
   * Sanitize request data
   * @param {object} data - Request data
   * @returns {object} Sanitized data
   */
  sanitizeRequestData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Sanitize string values
        sanitized[key] = sanitizeText(value);
      } else if (Array.isArray(value)) {
        // Recursively sanitize array elements
        sanitized[key] = value.map(item => 
          typeof item === 'object' ? this.sanitizeRequestData(item) : sanitizeText(String(item))
        );
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize object properties
        sanitized[key] = this.sanitizeRequestData(value);
      } else {
        // Keep non-string primitives as-is
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Log security event
   * @param {string} type - Event type
   * @param {object} details - Event details
   */
  logSecurityEvent(type, details) {
    const event = {
      type,
      details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100)
    };

    this.securityLog.push(event);
    
    // Keep only last 100 events
    if (this.securityLog.length > 100) {
      this.securityLog.shift();
    }

    // Track in analytics
    analyticsModule.trackEvent('security_middleware', {
      event_type: type,
      details,
      timestamp: Date.now()
    });

    // Dispatch event for SecurityContext
    window.dispatchEvent(new CustomEvent('securityMiddlewareEvent', {
      detail: event
    }));

    console.warn('🔒 Security Middleware Event:', event);
  }

  /**
   * Process outgoing request with security measures
   * @param {string} url - Request URL
   * @param {object} options - Request options
   * @returns {object} Processed options or null if blocked
   */
  processRequest(url, options = {}) {
    // Check if request should be blocked
    if (this.shouldBlockRequest(url, options)) {
      return null;
    }

    // Apply rate limiting
    if (!this.applyRateLimit(url, options)) {
      throw new Error('Rate limit exceeded. Please slow down your requests.');
    }

    // Clone options to avoid mutating original
    const processedOptions = { ...options };

    // Add security headers
    const securityHeaders = getSecurityHeaders();
    processedOptions.headers = {
      ...securityHeaders,
      ...processedOptions.headers
    };

    // Add CSRF token for state-changing requests
    const method = (processedOptions.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        processedOptions.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Sanitize request body
    if (processedOptions.body) {
      try {
        if (typeof processedOptions.body === 'string') {
          const parsed = JSON.parse(processedOptions.body);
          const sanitized = this.sanitizeRequestData(parsed);
          processedOptions.body = JSON.stringify(sanitized);
        } else if (typeof processedOptions.body === 'object') {
          processedOptions.body = JSON.stringify(
            this.sanitizeRequestData(processedOptions.body)
          );
        }
      } catch (error) {
        this.logSecurityEvent('request_body_sanitization_error', {
          error: error.message,
          url
        });
      }
    }

    // Add request timestamp for replay attack prevention
    processedOptions.headers['X-Request-Timestamp'] = Date.now().toString();

    // Track request
    const fingerprint = this.generateRequestFingerprint(url, method);
    this.trackConcurrentRequest(fingerprint);

    return processedOptions;
  }

  /**
   * Track concurrent requests to detect potential DoS attempts
   * @param {string} fingerprint - Request fingerprint
   */
  trackConcurrentRequest(fingerprint) {
    const now = Date.now();
    
    if (!this.requestQueue.has(fingerprint)) {
      this.requestQueue.set(fingerprint, []);
    }

    const requests = this.requestQueue.get(fingerprint);
    requests.push(now);

    // Remove old requests (older than 5 seconds)
    const recentRequests = requests.filter(timestamp => now - timestamp < 5000);
    this.requestQueue.set(fingerprint, recentRequests);

    // Check for potential DoS
    if (recentRequests.length > 50) { // More than 50 requests in 5 seconds
      this.logSecurityEvent('potential_dos_attack', {
        fingerprint,
        requestCount: recentRequests.length,
        timeWindow: '5s'
      });
    }
  }

  /**
   * Process response for security validation
   * @param {Response} response - Fetch response
   * @param {string} url - Original request URL
   * @returns {Response} Processed response
   */
  processResponse(response, url) {
    // Log suspicious response codes
    if (response.status >= 400) {
      this.logSecurityEvent('error_response', {
        status: response.status,
        statusText: response.statusText,
        url
      });
    }

    // Check for security headers in response
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'strict-transport-security'
    ];

    const missingHeaders = securityHeaders.filter(header => 
      !response.headers.has(header)
    );

    if (missingHeaders.length > 0) {
      this.logSecurityEvent('missing_security_headers', {
        url,
        missingHeaders
      });
    }

    return response;
  }

  /**
   * Create secure fetch function
   * @returns {Function} Secure fetch function
   */
  createSecureFetch() {
    const originalFetch = window.fetch;

    return async (url, options = {}) => {
      try {
        // Process request with security measures
        const processedOptions = this.processRequest(url, options);
        
        if (processedOptions === null) {
          throw new Error('Request blocked by security middleware');
        }

        // Make the actual request
        const response = await originalFetch(url, processedOptions);

        // Process response
        return this.processResponse(response, url);

      } catch (error) {
        this.logSecurityEvent('request_error', {
          url,
          error: error.message,
          method: options.method || 'GET'
        });
        throw error;
      }
    };
  }

  /**
   * Get security statistics
   * @returns {object} Security statistics
   */
  getSecurityStats() {
    return {
      blockedRequests: this.blockedRequests.size,
      securityEvents: this.securityLog.length,
      recentEvents: this.securityLog.slice(-10),
      activeConnections: Array.from(this.requestQueue.values())
        .reduce((total, requests) => total + requests.length, 0)
    };
  }

  /**
   * Clear security state
   */
  clearSecurityState() {
    this.blockedRequests.clear();
    this.requestQueue.clear();
    this.securityLog.length = 0;
  }
}

// Create singleton instance
const securityMiddleware = new SecurityMiddleware();

// Replace global fetch with secure version
if (typeof window !== 'undefined') {
  window.secureFetch = securityMiddleware.createSecureFetch();
}

export default securityMiddleware;