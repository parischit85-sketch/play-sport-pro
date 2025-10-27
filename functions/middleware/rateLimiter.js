/**
 * Rate Limiting Middleware
 * Protegge le API da abusi e attacchi DDoS
 */

const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

/**
 * Configurazione limiti per endpoint
 */
const RATE_LIMITS = {
  // Auth endpoints - più restrittivi
  'auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 tentativi in 15min
  'auth/register': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 registrazioni/ora
  'auth/reset-password': { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  
  // Booking endpoints
  'bookings/create': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 prenotazioni/min
  'bookings/cancel': { windowMs: 60 * 1000, maxRequests: 20 },
  
  // Match endpoints
  'matches/create': { windowMs: 60 * 1000, maxRequests: 5 },
  
  // Email endpoints - molto restrittivi
  'email/send': { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 email/ora
  'email/bulk': { windowMs: 60 * 60 * 1000, maxRequests: 2 }, // 2 bulk/ora
  
  // Default per tutti gli altri endpoint
  'default': { windowMs: 60 * 1000, maxRequests: 100 } // 100 req/min
};

/**
 * Ottiene la configurazione per un endpoint
 */
function getRateLimit(endpoint) {
  return RATE_LIMITS[endpoint] || RATE_LIMITS.default;
}

/**
 * Genera chiave unica per rate limiting
 * Combina IP, user ID e endpoint per tracciamento granulare
 */
function generateKey(ip, userId, endpoint) {
  const userPart = userId || 'anonymous';
  return `ratelimit:${endpoint}:${ip}:${userPart}`;
}

/**
 * Middleware di rate limiting
 * Usa Firestore per storage distribuito
 */
async function rateLimiter(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
               req.connection.remoteAddress || 
               'unknown';
    const userId = req.user?.uid || null;
    const endpoint = req.path.replace(/^\//, '').replace(/\//g, '/');
    
    const limit = getRateLimit(endpoint);
    const key = generateKey(ip, userId, endpoint);
    
    // Riferimento documento in Firestore
    const docRef = firestore.collection('rateLimits').doc(key);
    const now = Date.now();
    const windowStart = now - limit.windowMs;
    
    // Transazione atomica per incremento contatore
    const result = await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      
      if (!doc.exists) {
        // Prima richiesta - crea documento
        transaction.set(docRef, {
          requests: [now],
          createdAt: now,
          ip,
          userId,
          endpoint
        });
        return { allowed: true, remaining: limit.maxRequests - 1 };
      }
      
      const data = doc.data();
      // Filtra solo richieste dentro la finestra temporale
      const validRequests = data.requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length >= limit.maxRequests) {
        // Limite raggiunto
        const oldestRequest = Math.min(...validRequests);
        const retryAfter = Math.ceil((oldestRequest + limit.windowMs - now) / 1000);
        
        return { 
          allowed: false, 
          remaining: 0, 
          retryAfter,
          resetTime: oldestRequest + limit.windowMs
        };
      }
      
      // Aggiungi nuova richiesta
      validRequests.push(now);
      transaction.update(docRef, {
        requests: validRequests,
        lastRequest: now
      });
      
      return { 
        allowed: true, 
        remaining: limit.maxRequests - validRequests.length 
      };
    });
    
    // Headers standard rate limit
    res.set('X-RateLimit-Limit', limit.maxRequests.toString());
    res.set('X-RateLimit-Remaining', result.remaining.toString());
    res.set('X-RateLimit-Window', (limit.windowMs / 1000).toString());
    
    if (!result.allowed) {
      res.set('Retry-After', result.retryAfter.toString());
      res.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      
      // Log tentativo bloccato
      await logRateLimitViolation(ip, userId, endpoint, limit.maxRequests);
      
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
        resetTime: new Date(result.resetTime).toISOString()
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // In caso di errore, consenti la richiesta (fail open)
    next();
  }
}

/**
 * Log violazioni rate limit per analisi sicurezza
 */
async function logRateLimitViolation(ip, userId, endpoint, limit) {
  try {
    await firestore.collection('securityLogs').add({
      type: 'RATE_LIMIT_VIOLATION',
      ip,
      userId,
      endpoint,
      limit,
      timestamp: Date.now(),
      severity: 'warning'
    });
  } catch (error) {
    console.error('Failed to log rate limit violation:', error);
  }
}

/**
 * Cleanup vecchi record rate limit
 * Da eseguire periodicamente (es. Cloud Scheduler ogni ora)
 */
async function cleanupOldRateLimits() {
  const maxAge = 24 * 60 * 60 * 1000; // 24 ore
  const cutoff = Date.now() - maxAge;
  
  const snapshot = await firestore
    .collection('rateLimits')
    .where('createdAt', '<', cutoff)
    .limit(500)
    .get();
  
  const batch = firestore.batch();
  let count = 0;
  
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
    count++;
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Cleaned up ${count} old rate limit records`);
  }
  
  return count;
}

/**
 * Ottieni statistiche rate limiting per un IP o user
 */
async function getRateLimitStats(ip = null, userId = null) {
  let query = firestore.collection('rateLimits');
  
  if (ip) {
    query = query.where('ip', '==', ip);
  }
  if (userId) {
    query = query.where('userId', '==', userId);
  }
  
  const snapshot = await query.get();
  
  const stats = {
    totalKeys: snapshot.size,
    byEndpoint: {},
    recentActivity: []
  };
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const endpoint = data.endpoint;
    
    if (!stats.byEndpoint[endpoint]) {
      stats.byEndpoint[endpoint] = {
        count: 0,
        totalRequests: 0,
        lastRequest: 0
      };
    }
    
    stats.byEndpoint[endpoint].count++;
    stats.byEndpoint[endpoint].totalRequests += data.requests.length;
    stats.byEndpoint[endpoint].lastRequest = Math.max(
      stats.byEndpoint[endpoint].lastRequest,
      data.lastRequest || 0
    );
    
    if (data.lastRequest) {
      stats.recentActivity.push({
        endpoint,
        lastRequest: data.lastRequest,
        requestCount: data.requests.length
      });
    }
  });
  
  // Ordina per attività recente
  stats.recentActivity.sort((a, b) => b.lastRequest - a.lastRequest);
  stats.recentActivity = stats.recentActivity.slice(0, 10); // Top 10
  
  return stats;
}

/**
 * Blocca IP specifico (blacklist)
 */
async function blockIP(ip, reason, duration = 24 * 60 * 60 * 1000) {
  await firestore.collection('blockedIPs').doc(ip).set({
    reason,
    blockedAt: Date.now(),
    expiresAt: Date.now() + duration,
    active: true
  });
}

/**
 * Verifica se IP è bloccato
 */
async function isIPBlocked(ip) {
  const doc = await firestore.collection('blockedIPs').doc(ip).get();
  
  if (!doc.exists) {
    return false;
  }
  
  const data = doc.data();
  if (!data.active) {
    return false;
  }
  
  // Verifica scadenza
  if (data.expiresAt && data.expiresAt < Date.now()) {
    // Blocco scaduto - rimuovi
    await doc.ref.update({ active: false });
    return false;
  }
  
  return true;
}

/**
 * Middleware blocco IP
 */
async function ipBlocker(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
             req.connection.remoteAddress || 
             'unknown';
  
  if (await isIPBlocked(ip)) {
    await firestore.collection('securityLogs').add({
      type: 'BLOCKED_IP_ACCESS',
      ip,
      path: req.path,
      timestamp: Date.now(),
      severity: 'critical'
    });
    
    return res.status(403).json({
      error: 'Access forbidden',
      message: 'Your IP address has been blocked due to suspicious activity.'
    });
  }
  
  next();
}

module.exports = {
  rateLimiter,
  cleanupOldRateLimits,
  getRateLimitStats,
  blockIP,
  isIPBlocked,
  ipBlocker,
  RATE_LIMITS
};
