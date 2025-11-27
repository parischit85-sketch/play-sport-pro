/**
 * Intrusion Detection System (IDS)
 * Rileva comportamenti sospetti e potenziali attacchi
 */

const { Firestore } = require('@google-cloud/firestore');
const { auditLogger, SEVERITY, EVENT_TYPES } = require('../services/auditLogger');

const firestore = new Firestore();

/**
 * Pattern sospetti
 */
const SUSPICIOUS_PATTERNS = {
  // SQL Injection
  SQL_INJECTION: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\#|\/\*|\*\/)/,
    /('|(;|%27)|(or|and)\s+\d+\s*=\s*\d+)/i
  ],
  
  // XSS
  XSS: [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on(load|error|click|mouse)=/i,
    /<iframe/i,
    /eval\(/i
  ],
  
  // Path Traversal
  PATH_TRAVERSAL: [
    /\.\.(\/|\\)/,
    /(\/etc\/passwd|\/windows\/system32)/i
  ],
  
  // Command Injection
  COMMAND_INJECTION: [
    /;|\||&|`|\$\(/,
    /\b(rm|curl|wget|nc|netcat)\b/i
  ]
};

/**
 * Soglie per comportamenti anomali
 */
const THRESHOLDS = {
  MAX_FAILED_LOGINS: 5, // In 15 minuti
  MAX_REQUESTS_PER_MINUTE: 100,
  MAX_REQUESTS_PER_HOUR: 1000,
  MAX_ERRORS_PER_HOUR: 50,
  MAX_DIFFERENT_ENDPOINTS: 50 // In 5 minuti
};

/**
 * Analizza input per pattern sospetti
 */
function detectSuspiciousPatterns(input, type = 'general') {
  const threats = [];
  
  if (typeof input !== 'string') {
    input = JSON.stringify(input);
  }

  // Check SQL Injection
  for (const pattern of SUSPICIOUS_PATTERNS.SQL_INJECTION) {
    if (pattern.test(input)) {
      threats.push({
        type: 'SQL_INJECTION',
        severity: SEVERITY.CRITICAL,
        pattern: pattern.toString()
      });
    }
  }

  // Check XSS
  for (const pattern of SUSPICIOUS_PATTERNS.XSS) {
    if (pattern.test(input)) {
      threats.push({
        type: 'XSS',
        severity: SEVERITY.CRITICAL,
        pattern: pattern.toString()
      });
    }
  }

  // Check Path Traversal
  for (const pattern of SUSPICIOUS_PATTERNS.PATH_TRAVERSAL) {
    if (pattern.test(input)) {
      threats.push({
        type: 'PATH_TRAVERSAL',
        severity: SEVERITY.CRITICAL,
        pattern: pattern.toString()
      });
    }
  }

  // Check Command Injection
  for (const pattern of SUSPICIOUS_PATTERNS.COMMAND_INJECTION) {
    if (pattern.test(input)) {
      threats.push({
        type: 'COMMAND_INJECTION',
        severity: SEVERITY.CRITICAL,
        pattern: pattern.toString()
      });
    }
  }

  return threats;
}

/**
 * Middleware IDS
 */
async function intrusionDetection(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
               req.connection.remoteAddress || 
               'unknown';
    const userId = req.user?.uid || null;
    const userAgent = req.headers['user-agent'] || '';

    // Analizza tutti gli input
    const inputs = [
      req.path,
      req.query ? JSON.stringify(req.query) : '',
      req.body ? JSON.stringify(req.body) : '',
      ...Object.values(req.headers)
    ].join(' ');

    const threats = detectSuspiciousPatterns(inputs);

    if (threats.length > 0) {
      // Log minaccia critica
      await auditLogger.logSecurityEvent(
        EVENT_TYPES.SECURITY_SUSPICIOUS,
        SEVERITY.CRITICAL,
        ip,
        userId,
        {
          threats,
          path: req.path,
          method: req.method,
          userAgent,
          message: `Detected ${threats.length} suspicious pattern(s)`
        }
      );

      // Incrementa score di minaccia per l'IP
      await incrementThreatScore(ip, threats.length * 10);

      // Blocca se score troppo alto
      const score = await getThreatScore(ip);
      if (score >= 50) {
        await blockIP(ip, 'High threat score detected', 24 * 60 * 60 * 1000);
        
        return res.status(403).json({
          error: 'Access forbidden',
          message: 'Suspicious activity detected. Access has been blocked.'
        });
      }

      // Altrimenti procedi ma segnala
      req.suspiciousActivity = threats;
    }

    // Controlla comportamento anomalo
    const anomalies = await detectAnomalies(ip, userId, req.path);
    if (anomalies.length > 0) {
      await auditLogger.logSecurityEvent(
        EVENT_TYPES.SECURITY_SUSPICIOUS,
        SEVERITY.WARNING,
        ip,
        userId,
        {
          anomalies,
          message: 'Anomalous behavior detected'
        }
      );

      req.anomalies = anomalies;
    }

    next();
  } catch (error) {
    console.error('IDS error:', error);
    next(); // Fail open
  }
}

/**
 * Rileva comportamenti anomali
 */
async function detectAnomalies(ip, userId, endpoint) {
  const anomalies = [];
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  const fifteenMinutesAgo = now - (15 * 60 * 1000);

  // Controlla failed logins recenti
  if (userId) {
    const failedLogins = await firestore
      .collection('auditLogs')
      .where('eventType', '==', EVENT_TYPES.AUTH_FAILED)
      .where('userId', '==', userId)
      .where('timestamp', '>=', fifteenMinutesAgo)
      .get();

    if (failedLogins.size >= THRESHOLDS.MAX_FAILED_LOGINS) {
      anomalies.push({
        type: 'EXCESSIVE_FAILED_LOGINS',
        count: failedLogins.size,
        threshold: THRESHOLDS.MAX_FAILED_LOGINS
      });
    }
  }

  // Controlla request rate (IP)
  const recentRequests = await firestore
    .collection('auditLogs')
    .where('ip', '==', ip)
    .where('timestamp', '>=', oneHourAgo)
    .get();

  if (recentRequests.size >= THRESHOLDS.MAX_REQUESTS_PER_HOUR) {
    anomalies.push({
      type: 'HIGH_REQUEST_RATE',
      count: recentRequests.size,
      threshold: THRESHOLDS.MAX_REQUESTS_PER_HOUR,
      period: '1 hour'
    });
  }

  // Controlla diversità endpoint (possibile scanning)
  const recentEndpoints = new Set();
  const recentDocs = await firestore
    .collection('auditLogs')
    .where('ip', '==', ip)
    .where('timestamp', '>=', fiveMinutesAgo)
    .get();

  recentDocs.forEach(doc => {
    const data = doc.data();
    if (data.metadata?.endpoint || data.resource) {
      recentEndpoints.add(data.metadata?.endpoint || data.resource);
    }
  });

  if (recentEndpoints.size >= THRESHOLDS.MAX_DIFFERENT_ENDPOINTS) {
    anomalies.push({
      type: 'ENDPOINT_SCANNING',
      uniqueEndpoints: recentEndpoints.size,
      threshold: THRESHOLDS.MAX_DIFFERENT_ENDPOINTS,
      period: '5 minutes'
    });
  }

  return anomalies;
}

/**
 * Threat Score per IP
 */
async function incrementThreatScore(ip, points) {
  const docRef = firestore.collection('threatScores').doc(ip);
  
  await firestore.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    
    if (!doc.exists) {
      transaction.set(docRef, {
        score: points,
        lastIncrement: Date.now(),
        createdAt: Date.now()
      });
    } else {
      const data = doc.data();
      transaction.update(docRef, {
        score: data.score + points,
        lastIncrement: Date.now()
      });
    }
  });
}

async function getThreatScore(ip) {
  const doc = await firestore.collection('threatScores').doc(ip).get();
  
  if (!doc.exists) {
    return 0;
  }
  
  // Decay: -1 punto ogni ora
  const data = doc.data();
  const hoursSinceLastIncrement = (Date.now() - data.lastIncrement) / (60 * 60 * 1000);
  const decay = Math.floor(hoursSinceLastIncrement);
  
  return Math.max(0, data.score - decay);
}

async function resetThreatScore(ip) {
  await firestore.collection('threatScores').doc(ip).delete();
}

/**
 * Blocca IP
 */
async function blockIP(ip, reason, duration = 24 * 60 * 60 * 1000) {
  await firestore.collection('blockedIPs').doc(ip).set({
    reason,
    blockedAt: Date.now(),
    expiresAt: Date.now() + duration,
    active: true
  });

  await auditLogger.logSecurityEvent(
    EVENT_TYPES.SECURITY_IP_BLOCK,
    SEVERITY.CRITICAL,
    ip,
    null,
    { reason, duration }
  );
}

/**
 * Ottieni report sicurezza
 */
async function getSecurityReport(days = 7) {
  const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  const securityLogs = await firestore
    .collection('auditLogs')
    .where('eventType', '>=', 'security.')
    .where('eventType', '<', 'security.z')
    .where('timestamp', '>=', startTime)
    .get();

  const report = {
    period: `${days} days`,
    totalIncidents: securityLogs.size,
    byType: {},
    bySeverity: {},
    topIPs: {},
    blockedIPs: 0,
    threatScores: []
  };

  securityLogs.forEach(doc => {
    const data = doc.data();
    
    // By type
    report.byType[data.eventType] = (report.byType[data.eventType] || 0) + 1;
    
    // By severity
    report.bySeverity[data.severity] = (report.bySeverity[data.severity] || 0) + 1;
    
    // By IP
    if (data.ip) {
      report.topIPs[data.ip] = (report.topIPs[data.ip] || 0) + 1;
    }
  });

  // Blocked IPs
  const blockedIPs = await firestore
    .collection('blockedIPs')
    .where('active', '==', true)
    .get();
  
  report.blockedIPs = blockedIPs.size;

  // Top threat scores
  const threatScores = await firestore
    .collection('threatScores')
    .orderBy('score', 'desc')
    .limit(10)
    .get();
  
  report.threatScores = threatScores.docs.map(doc => ({
    ip: doc.id,
    score: doc.data().score,
    lastIncrement: doc.data().lastIncrement
  }));

  // Sort top IPs
  report.topIPs = Object.entries(report.topIPs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .reduce((obj, [ip, count]) => ({ ...obj, [ip]: count }), {});

  return report;
}

module.exports = {
  intrusionDetection,
  detectSuspiciousPatterns,
  detectAnomalies,
  incrementThreatScore,
  getThreatScore,
  resetThreatScore,
  blockIP,
  getSecurityReport,
  SUSPICIOUS_PATTERNS,
  THRESHOLDS
};
