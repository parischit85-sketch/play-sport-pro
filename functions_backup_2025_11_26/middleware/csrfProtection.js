/**
 * CSRF Protection Middleware
 * Protezione da Cross-Site Request Forgery
 */

const crypto = require('crypto');

/**
 * Genera token CSRF sicuro
 */
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware CSRF per Express
 */
function csrfProtection(options = {}) {
  const {
    cookieName = 'XSRF-TOKEN',
    headerName = 'X-XSRF-TOKEN',
    cookieOptions = {
      httpOnly: false, // Deve essere accessibile da JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 ore
    },
    ignoreMethods = ['GET', 'HEAD', 'OPTIONS']
  } = options;

  return (req, res, next) => {
    // Genera o riusa token
    let token = req.cookies?.[cookieName];
    
    if (!token) {
      token = generateCSRFToken();
      res.cookie(cookieName, token, cookieOptions);
    }

    // Verifica token per metodi non-safe
    if (!ignoreMethods.includes(req.method)) {
      const clientToken = req.headers[headerName.toLowerCase()] || 
                         req.body?._csrf ||
                         req.query?._csrf;

      if (!clientToken || clientToken !== token) {
        return res.status(403).json({
          error: 'Invalid CSRF token',
          message: 'The request has been blocked for security reasons.'
        });
      }
    }

    // Rendi token disponibile per response
    req.csrfToken = () => token;
    res.locals.csrfToken = token;

    next();
  };
}

/**
 * Security Headers Middleware
 */
function securityHeaders(req, res, next) {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net",
      "frame-src 'self' https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  );

  // X-Frame-Options (clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');

  // X-Content-Type-Options (MIME sniffing protection)
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(self), microphone=(), camera=(self), payment=(self)'
  );

  // Strict-Transport-Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
}

/**
 * Sanitizza input per prevenire XSS
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Middleware sanitizzazione body
 */
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

/**
 * Sanitizza ricorsivamente oggetto
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}

module.exports = {
  generateCSRFToken,
  csrfProtection,
  securityHeaders,
  sanitizeInput,
  sanitizeBody
};
