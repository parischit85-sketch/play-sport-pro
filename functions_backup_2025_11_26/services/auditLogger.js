/**
 * Audit Logging Service (ESM)
 * Sistema centralizzato per logging azioni critiche e sicurezza
 */

import { Firestore } from '@google-cloud/firestore';
const firestore = new Firestore();

/**
 * Livelli di severità log
 */
const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

/**
 * Categorie di eventi
 */
const EVENT_TYPES = {
  // Auth
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_REGISTER: 'auth.register',
  AUTH_FAILED: 'auth.failed',
  AUTH_PASSWORD_RESET: 'auth.password_reset',
  AUTH_EMAIL_VERIFY: 'auth.email_verify',

  // Bookings
  BOOKING_CREATE: 'booking.create',
  BOOKING_UPDATE: 'booking.update',
  BOOKING_CANCEL: 'booking.cancel',
  BOOKING_COMPLETE: 'booking.complete',

  // Matches
  MATCH_CREATE: 'match.create',
  MATCH_UPDATE: 'match.update',
  MATCH_SCORE: 'match.score',
  MATCH_CANCEL: 'match.cancel',

  // Payments
  PAYMENT_CREATE: 'payment.create',
  PAYMENT_COMPLETE: 'payment.complete',
  PAYMENT_FAIL: 'payment.fail',
  PAYMENT_REFUND: 'payment.refund',

  // Club Management
  CLUB_CREATE: 'club.create',
  CLUB_UPDATE: 'club.update',
  CLUB_DELETE: 'club.delete',
  CLUB_ACTIVATE: 'club.activate',
  CLUB_DEACTIVATE: 'club.deactivate',

  // User Management
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ROLE_CHANGE: 'user.role_change',
  USER_BAN: 'user.ban',
  USER_UNBAN: 'user.unban',

  // Security
  SECURITY_RATE_LIMIT: 'security.rate_limit',
  SECURITY_IP_BLOCK: 'security.ip_block',
  SECURITY_SUSPICIOUS: 'security.suspicious',
  SECURITY_UNAUTHORIZED: 'security.unauthorized',
  SECURITY_INVALID_TOKEN: 'security.invalid_token',

  // System
  SYSTEM_ERROR: 'system.error',
  SYSTEM_CONFIG: 'system.config_change',
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_RESTORE: 'system.restore',
};

class AuditLogger {
  constructor() {
    this.collection = firestore.collection('auditLogs');
  }

  async log({
    eventType,
    severity = SEVERITY.INFO,
    userId = null,
    clubId = null,
    ip = null,
    userAgent = null,
    resource = null,
    resourceId = null,
    action = null,
    changes = null,
    metadata = null,
    message = null,
  }) {
    try {
      const logEntry = {
        eventType,
        severity,
        userId,
        clubId,
        ip,
        userAgent,
        resource,
        resourceId,
        action,
        changes,
        metadata,
        message,
        timestamp: Date.now(),
        date: new Date().toISOString(),
      };

      Object.keys(logEntry).forEach((key) => {
        if (logEntry[key] === null || logEntry[key] === undefined) {
          delete logEntry[key];
        }
      });

      await this.collection.add(logEntry);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUDIT] ${eventType}:`, logEntry);
      }

      return logEntry;
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Non propagare errore - il logging non deve bloccare operazioni
    }
  }

  async logLogin(userId, ip, userAgent, success = true) {
    return this.log({
      eventType: success ? EVENT_TYPES.AUTH_LOGIN : EVENT_TYPES.AUTH_FAILED,
      severity: success ? SEVERITY.INFO : SEVERITY.WARNING,
      userId: success ? userId : null,
      ip,
      userAgent,
      action: 'login',
      message: success ? 'User logged in successfully' : 'Login attempt failed',
      metadata: { success },
    });
  }

  async logLogout(userId, ip) {
    return this.log({
      eventType: EVENT_TYPES.AUTH_LOGOUT,
      userId,
      ip,
      action: 'logout',
      message: 'User logged out',
    });
  }

  async logRegistration(userId, email, ip, userAgent) {
    return this.log({
      eventType: EVENT_TYPES.AUTH_REGISTER,
      severity: SEVERITY.INFO,
      userId,
      ip,
      userAgent,
      action: 'register',
      message: 'New user registered',
      metadata: { email },
    });
  }

  async logBookingCreate(bookingId, userId, clubId, courtId, date, ip) {
    return this.log({
      eventType: EVENT_TYPES.BOOKING_CREATE,
      userId,
      clubId,
      ip,
      resource: 'booking',
      resourceId: bookingId,
      action: 'create',
      message: 'Booking created',
      metadata: { courtId, date },
    });
  }

  async logBookingCancel(bookingId, userId, clubId, reason, ip) {
    return this.log({
      eventType: EVENT_TYPES.BOOKING_CANCEL,
      severity: SEVERITY.WARNING,
      userId,
      clubId,
      ip,
      resource: 'booking',
      resourceId: bookingId,
      action: 'cancel',
      message: 'Booking cancelled',
      metadata: { reason },
    });
  }

  async logDataChange(resource, resourceId, userId, oldData, newData, ip) {
    const changes = {};
    Object.keys(newData).forEach((key) => {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes[key] = {
          old: oldData[key],
          new: newData[key],
        };
      }
    });

    return this.log({
      eventType: EVENT_TYPES.USER_UPDATE,
      userId,
      ip,
      resource,
      resourceId,
      action: 'update',
      changes,
      message: `${resource} updated`,
    });
  }

  async logPayment(paymentId, userId, clubId, amount, status, ip) {
    const eventType =
      status === 'completed'
        ? EVENT_TYPES.PAYMENT_COMPLETE
        : status === 'failed'
          ? EVENT_TYPES.PAYMENT_FAIL
          : EVENT_TYPES.PAYMENT_CREATE;

    const severity = status === 'failed' ? SEVERITY.ERROR : SEVERITY.INFO;

    return this.log({
      eventType,
      severity,
      userId,
      clubId,
      ip,
      resource: 'payment',
      resourceId: paymentId,
      action: status,
      message: `Payment ${status}`,
      metadata: { amount, currency: 'EUR' },
    });
  }

  async logSecurityEvent(type, severity, ip, userId = null, details = {}) {
    return this.log({
      eventType: type,
      severity,
      userId,
      ip,
      resource: 'security',
      action: 'alert',
      message: details.message || 'Security event detected',
      metadata: details,
    });
  }

  async logRateLimit(ip, userId, endpoint, limit) {
    return this.logSecurityEvent(EVENT_TYPES.SECURITY_RATE_LIMIT, SEVERITY.WARNING, ip, userId, {
      endpoint,
      limit,
      message: 'Rate limit exceeded',
    });
  }

  async logUnauthorized(ip, userId, resource, action, userAgent) {
    return this.logSecurityEvent(EVENT_TYPES.SECURITY_UNAUTHORIZED, SEVERITY.WARNING, ip, userId, {
      resource,
      action,
      userAgent,
      message: 'Unauthorized access attempt',
    });
  }

  async logSystemError(error, context = {}) {
    return this.log({
      eventType: EVENT_TYPES.SYSTEM_ERROR,
      severity: SEVERITY.ERROR,
      message: error.message,
      metadata: {
        stack: error.stack,
        ...context,
      },
    });
  }

  async getLogs(filters = {}, limit = 100) {
    let query = this.collection.orderBy('timestamp', 'desc');

    if (filters.userId) {
      query = query.where('userId', '==', filters.userId);
    }
    if (filters.clubId) {
      query = query.where('clubId', '==', filters.clubId);
    }
    if (filters.eventType) {
      query = query.where('eventType', '==', filters.eventType);
    }
    if (filters.severity) {
      query = query.where('severity', '==', filters.severity);
    }
    if (filters.ip) {
      query = query.where('ip', '==', filters.ip);
    }
    if (filters.startDate) {
      query = query.where('timestamp', '>=', filters.startDate);
    }
    if (filters.endDate) {
      query = query.where('timestamp', '<=', filters.endDate);
    }

    query = query.limit(limit);

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getStats(clubId = null, days = 30) {
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    let query = this.collection.where('timestamp', '>=', startTime);

    if (clubId) {
      query = query.where('clubId', '==', clubId);
    }

    const snapshot = await query.get();

    const stats = {
      total: snapshot.size,
      bySeverity: {},
      byEventType: {},
      byUser: {},
      securityEvents: 0,
      timeline: {},
    };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      stats.bySeverity[data.severity] = (stats.bySeverity[data.severity] || 0) + 1;
      stats.byEventType[data.eventType] = (stats.byEventType[data.eventType] || 0) + 1;
      if (data.userId) {
        stats.byUser[data.userId] = (stats.byUser[data.userId] || 0) + 1;
      }

      if (data.eventType.startsWith('security.')) {
        stats.securityEvents++;
      }

      const date = new Date(data.timestamp).toISOString().split('T')[0];
      stats.timeline[date] = (stats.timeline[date] || 0) + 1;
    });

    return stats;
  }

  async cleanup(daysToKeep = 90) {
    const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

    const snapshot = await this.collection.where('timestamp', '<', cutoff).limit(500).get();
    const batch = firestore.batch();
    let count = 0;

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });

    if (count > 0) {
      await batch.commit();
      console.log(`Cleaned up ${count} old audit logs`);
    }

    return count;
  }

  async exportToCSV(filters = {}, limit = 1000) {
    const logs = await this.getLogs(filters, limit);

    const headers = [
      'Timestamp',
      'Date',
      'Event Type',
      'Severity',
      'User ID',
      'Club ID',
      'IP',
      'Resource',
      'Resource ID',
      'Action',
      'Message',
    ];

    const rows = logs.map((log) => [
      log.timestamp,
      log.date,
      log.eventType,
      log.severity,
      log.userId || '',
      log.clubId || '',
      log.ip || '',
      log.resource || '',
      log.resourceId || '',
      log.action || '',
      log.message || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }
}

const auditLogger = new AuditLogger();

export { auditLogger, AuditLogger, SEVERITY, EVENT_TYPES };
export default { auditLogger, AuditLogger, SEVERITY, EVENT_TYPES };
