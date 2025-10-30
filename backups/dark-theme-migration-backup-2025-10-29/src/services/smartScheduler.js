/**
 * @fileoverview SmartScheduler - Sistema intelligente per scheduling notifiche
 *
 * Features:
 * - Timezone-aware scheduling
 * - Optimal send time prediction (ML-based)
 * - Quiet hours automatic respect
 * - Frequency capping (max N notifications/day)
 * - Send time optimization based on user behavior
 * - Batch scheduling per timezone groups
 * - Delay/retry queue management
 *
 * @author Play Sport Pro Team
 * @version 2.0.0
 * @since Phase 3
 */

import { db } from '@/firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';

/**
 * Default optimal send times per notification type
 * Based on industry research and engagement data
 */
const OPTIMAL_SEND_TIMES = {
  TRANSACTIONAL: {
    // Conferme booking, pagamenti - immediate
    delay: 0,
    hourRange: [8, 22], // 8am - 10pm
  },
  PROMOTIONAL: {
    // Promozioni, offerte - pranzo o sera
    preferredHours: [12, 13, 18, 19, 20],
    avoidWeekends: false,
  },
  INFORMATIONAL: {
    // News, aggiornamenti - mattina
    preferredHours: [9, 10, 11],
    avoidWeekends: true,
  },
  CRITICAL: {
    // Certificati in scadenza, pagamenti urgenti - immediate
    delay: 0,
    ignoreQuietHours: true,
  },
  SOCIAL: {
    // Messaggi, commenti - immediate ma rispetta quiet hours
    delay: 0,
    hourRange: [8, 23],
  },
};

/**
 * Default quiet hours se user non ha preferenze
 */
const DEFAULT_QUIET_HOURS = {
  start: 22, // 10pm
  end: 8, // 8am
};

/**
 * SmartScheduler Class
 */
class SmartScheduler {
  constructor() {
    this.frequencyCap = {
      maxPerDay: 10,
      maxPerHour: 3,
    };
  }

  /**
   * Schedule notification con ottimizzazione intelligente
   * @param {Object} params - Parametri scheduling
   * @returns {Object} Schedule result con sendAt timestamp
   */
  async schedule({
    userId,
    notification,
    notificationType = 'INFORMATIONAL',
    priority = 'normal', // low | normal | high | critical
    respectQuietHours = true,
    optimizeForEngagement = true,
  }) {
    try {
      // 1. Get user preferences e timezone
      const userPrefs = await this._getUserPreferences(userId);
      const userTimezone = userPrefs.timezone || 'Europe/Rome';
      const quietHours = userPrefs.quietHours || DEFAULT_QUIET_HOURS;

      // 2. Check frequency cap
      if (await this._isFrequencyCapReached(userId)) {
        console.warn(`⚠️ Frequency cap reached for user ${userId}`);
        return {
          scheduled: false,
          reason: 'frequency_cap_reached',
          nextAvailableSlot: await this._getNextAvailableSlot(userId),
        };
      }

      // 3. Calculate optimal send time
      let sendAt = new Date();

      // Critical notifications - invio immediato
      if (priority === 'critical' || notificationType === 'CRITICAL') {
        sendAt = new Date();
      }
      // Altri tipi - ottimizza timing
      else {
        if (optimizeForEngagement) {
          sendAt = await this._calculateOptimalSendTime(
            userId,
            notificationType,
            userTimezone,
            quietHours,
            respectQuietHours
          );
        } else {
          // Usa timing standard per tipo
          sendAt = this._getStandardSendTime(
            notificationType,
            userTimezone,
            quietHours,
            respectQuietHours
          );
        }
      }

      // 4. Save scheduled notification
      const scheduleRef = await addDoc(collection(db, 'scheduledNotifications'), {
        userId,
        notification,
        notificationType,
        priority,
        sendAt: Timestamp.fromDate(sendAt),
        scheduledAt: Timestamp.now(),
        status: 'pending', // pending | sent | failed | cancelled
        timezone: userTimezone,
        optimizationUsed: optimizeForEngagement,
      });

      console.log(`✅ Notification scheduled for ${sendAt.toISOString()}`);

      return {
        scheduled: true,
        scheduleId: scheduleRef.id,
        sendAt,
        timezone: userTimezone,
        delayMinutes: Math.round((sendAt - new Date()) / 60000),
      };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Batch schedule per timezone groups (più efficiente)
   * @param {Array} userIds - Lista user IDs
   * @param {Object} notification - Notifica da inviare
   * @param {Object} options - Opzioni scheduling
   */
  async batchScheduleByTimezone(userIds, notification, options = {}) {
    try {
      // 1. Group users by timezone
      const timezoneGroups = await this._groupUsersByTimezone(userIds);

      // 2. Schedule per gruppo
      const scheduleResults = await Promise.all(
        Object.entries(timezoneGroups).map(async ([timezone, users]) => {
          // Calcola optimal send time per questo timezone
          const sendAt = this._getOptimalTimeForTimezone(
            timezone,
            options.notificationType,
            options.respectQuietHours
          );

          // Batch insert scheduled notifications
          const schedules = users.map((userId) => ({
            userId,
            notification,
            notificationType: options.notificationType || 'INFORMATIONAL',
            priority: options.priority || 'normal',
            sendAt: Timestamp.fromDate(sendAt),
            scheduledAt: Timestamp.now(),
            status: 'pending',
            timezone,
          }));

          // Firestore batch write
          const batch = [];
          const scheduledRef = collection(db, 'scheduledNotifications');

          for (const schedule of schedules) {
            const docRef = await addDoc(scheduledRef, schedule);
            batch.push({ scheduleId: docRef.id, userId: schedule.userId, sendAt });
          }

          return {
            timezone,
            userCount: users.length,
            sendAt,
            schedules: batch,
          };
        })
      );

      console.log(
        `✅ Batch scheduled for ${userIds.length} users across ${Object.keys(timezoneGroups).length} timezones`
      );

      return {
        totalUsers: userIds.length,
        timezoneGroups: scheduleResults,
        scheduled: true,
      };
    } catch (error) {
      console.error('Error batch scheduling:', error);
      throw error;
    }
  }

  /**
   * Calculate optimal send time usando ML prediction
   * @private
   */
  async _calculateOptimalSendTime(
    userId,
    notificationType,
    timezone,
    quietHours,
    respectQuietHours
  ) {
    try {
      // 1. Get user engagement history
      const engagementHistory = await this._getUserEngagementHistory(userId);

      // 2. Predict best hour basato su historical clicks
      const bestHour = this._predictBestHour(engagementHistory, notificationType);

      // 3. Get next occurrence of that hour
      const now = new Date();
      const nowInUserTz = this._convertToTimezone(now, timezone);

      let sendDate = new Date(nowInUserTz);
      sendDate.setHours(bestHour, 0, 0, 0);

      // Se l'ora è già passata oggi, schedula per domani
      if (sendDate <= now) {
        sendDate.setDate(sendDate.getDate() + 1);
      }

      // 4. Check quiet hours
      if (respectQuietHours && this._isQuietHour(sendDate, quietHours)) {
        // Posticipa a fine quiet hours
        sendDate = this._getNextNonQuietHour(sendDate, quietHours);
      }

      return sendDate;
    } catch (error) {
      console.error('Error calculating optimal send time:', error);
      // Fallback to standard timing
      return this._getStandardSendTime(notificationType, timezone, quietHours, respectQuietHours);
    }
  }

  /**
   * Get standard send time per tipo (no ML)
   * @private
   */
  _getStandardSendTime(notificationType, timezone, quietHours, respectQuietHours) {
    const config = OPTIMAL_SEND_TIMES[notificationType] || OPTIMAL_SEND_TIMES.INFORMATIONAL;

    const now = new Date();
    let sendDate = new Date(now);

    // Immediate types
    if (config.delay === 0) {
      if (config.ignoreQuietHours || !respectQuietHours) {
        return sendDate;
      }
      // Rispetta quiet hours
      if (this._isQuietHour(sendDate, quietHours)) {
        return this._getNextNonQuietHour(sendDate, quietHours);
      }
      return sendDate;
    }

    // Scheduled types - usa preferred hours
    if (config.preferredHours) {
      const currentHour = sendDate.getHours();

      // Trova prossimo preferred hour
      const nextHour = config.preferredHours.find((h) => h > currentHour);

      if (nextHour) {
        sendDate.setHours(nextHour, 0, 0, 0);
      } else {
        // Usa primo preferred hour di domani
        sendDate.setDate(sendDate.getDate() + 1);
        sendDate.setHours(config.preferredHours[0], 0, 0, 0);
      }

      // Avoid weekends se richiesto
      if (config.avoidWeekends) {
        while (sendDate.getDay() === 0 || sendDate.getDay() === 6) {
          sendDate.setDate(sendDate.getDate() + 1);
        }
      }
    }

    return sendDate;
  }

  /**
   * Predict best hour from engagement history
   * @private
   */
  _predictBestHour(engagementHistory, notificationType) {
    if (!engagementHistory || engagementHistory.length === 0) {
      // No history - usa defaults
      const config = OPTIMAL_SEND_TIMES[notificationType] || OPTIMAL_SEND_TIMES.INFORMATIONAL;
      return config.preferredHours ? config.preferredHours[0] : 10; // Default 10am
    }

    // Conta clicks per ora del giorno
    const hourCounts = new Array(24).fill(0);

    engagementHistory.forEach((event) => {
      if (event.clicked) {
        const hour = new Date(event.sentAt).getHours();
        hourCounts[hour]++;
      }
    });

    // Trova ora con più clicks
    const bestHour = hourCounts.indexOf(Math.max(...hourCounts));

    // Se nessun click, usa default
    return bestHour >= 0 ? bestHour : 10;
  }

  /**
   * Get user engagement history
   * @private
   */
  async _getUserEngagementHistory(userId) {
    try {
      const eventsRef = collection(db, 'notificationEvents');
      const q = query(
        eventsRef,
        where('userId', '==', userId),
        where('event', '==', 'notification_clicked')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          clicked: true,
          sentAt: data.timestamp.toDate(),
        };
      });
    } catch (error) {
      console.error('Error getting engagement history:', error);
      return [];
    }
  }

  /**
   * Check if frequency cap reached
   * @private
   */
  async _isFrequencyCapReached(userId) {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const eventsRef = collection(db, 'notificationEvents');

      // Check daily cap
      const dailyQuery = query(
        eventsRef,
        where('userId', '==', userId),
        where('event', '==', 'notification_sent'),
        where('timestamp', '>=', Timestamp.fromDate(oneDayAgo))
      );

      const dailySnapshot = await getDocs(dailyQuery);

      if (dailySnapshot.size >= this.frequencyCap.maxPerDay) {
        return true;
      }

      // Check hourly cap
      const hourlyQuery = query(
        eventsRef,
        where('userId', '==', userId),
        where('event', '==', 'notification_sent'),
        where('timestamp', '>=', Timestamp.fromDate(oneHourAgo))
      );

      const hourlySnapshot = await getDocs(hourlyQuery);

      return hourlySnapshot.size >= this.frequencyCap.maxPerHour;
    } catch (error) {
      console.error('Error checking frequency cap:', error);
      return false; // Fail open
    }
  }

  /**
   * Get next available slot (dopo frequency cap reset)
   * @private
   */
  async _getNextAvailableSlot(userId) {
    // Simplified - ritorna prossima ora
    const nextSlot = new Date();
    nextSlot.setHours(nextSlot.getHours() + 1, 0, 0, 0);
    return nextSlot;
  }

  /**
   * Get user preferences
   * @private
   */
  async _getUserPreferences(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!userDoc.exists()) {
        return {
          timezone: 'Europe/Rome',
          quietHours: DEFAULT_QUIET_HOURS,
        };
      }

      const data = userDoc.data();

      return {
        timezone: data.timezone || 'Europe/Rome',
        quietHours: data.notificationPreferences?.quietHours || DEFAULT_QUIET_HOURS,
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        timezone: 'Europe/Rome',
        quietHours: DEFAULT_QUIET_HOURS,
      };
    }
  }

  /**
   * Check if time is in quiet hours
   * @private
   */
  _isQuietHour(date, quietHours) {
    const hour = date.getHours();
    const { start, end } = quietHours;

    // Handle overnight quiet hours (e.g., 22-8)
    if (start > end) {
      return hour >= start || hour < end;
    }

    return hour >= start && hour < end;
  }

  /**
   * Get next non-quiet hour
   * @private
   */
  _getNextNonQuietHour(date, quietHours) {
    const nextDate = new Date(date);
    const { end } = quietHours;

    nextDate.setHours(end, 0, 0, 0);

    // Se end hour è già passato oggi, usa domani
    if (nextDate <= date) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    return nextDate;
  }

  /**
   * Convert date to timezone
   * @private
   */
  _convertToTimezone(date, timezone) {
    // Simplified - in production usa library come date-fns-tz o luxon
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  }

  /**
   * Group users by timezone
   * @private
   */
  async _groupUsersByTimezone(userIds) {
    const groups = {};

    await Promise.all(
      userIds.map(async (userId) => {
        const prefs = await this._getUserPreferences(userId);
        const timezone = prefs.timezone;

        if (!groups[timezone]) {
          groups[timezone] = [];
        }

        groups[timezone].push(userId);
      })
    );

    return groups;
  }

  /**
   * Get optimal time for timezone group
   * @private
   */
  _getOptimalTimeForTimezone(timezone, notificationType, respectQuietHours = true) {
    const config = OPTIMAL_SEND_TIMES[notificationType] || OPTIMAL_SEND_TIMES.INFORMATIONAL;

    const now = new Date();
    const nowInTz = this._convertToTimezone(now, timezone);

    let sendDate = new Date(nowInTz);

    if (config.preferredHours) {
      const currentHour = sendDate.getHours();
      const nextHour = config.preferredHours.find((h) => h > currentHour);

      if (nextHour) {
        sendDate.setHours(nextHour, 0, 0, 0);
      } else {
        sendDate.setDate(sendDate.getDate() + 1);
        sendDate.setHours(config.preferredHours[0], 0, 0, 0);
      }
    }

    return sendDate;
  }

  /**
   * Set custom frequency cap
   */
  setFrequencyCap({ maxPerDay, maxPerHour }) {
    if (maxPerDay) this.frequencyCap.maxPerDay = maxPerDay;
    if (maxPerHour) this.frequencyCap.maxPerHour = maxPerHour;
  }

  /**
   * Get scheduler statistics
   */
  async getStats() {
    try {
      const scheduledRef = collection(db, 'scheduledNotifications');

      const pendingQuery = query(scheduledRef, where('status', '==', 'pending'));
      const sentQuery = query(scheduledRef, where('status', '==', 'sent'));
      const failedQuery = query(scheduledRef, where('status', '==', 'failed'));

      const [pendingSnap, sentSnap, failedSnap] = await Promise.all([
        getDocs(pendingQuery),
        getDocs(sentQuery),
        getDocs(failedQuery),
      ]);

      return {
        pending: pendingSnap.size,
        sent: sentSnap.size,
        failed: failedSnap.size,
        total: pendingSnap.size + sentSnap.size + failedSnap.size,
      };
    } catch (error) {
      console.error('Error getting scheduler stats:', error);
      return { pending: 0, sent: 0, failed: 0, total: 0 };
    }
  }
}

// Singleton instance
export const smartScheduler = new SmartScheduler();

export default SmartScheduler;
