/**
 * @fileoverview NotificationAnalytics Service - Sistema completo di tracking e analytics
 * per push notifications con Firebase Analytics integration
 * 
 * Features:
 * - Event tracking completo: sent → delivered → clicked → converted
 * - Firebase Analytics integration
 * - Custom Firestore events collection
 * - Funnel analysis (conversion tracking)
 * - Performance metrics e KPI
 * - A/B test tracking
 * - Cohort analysis
 * - Real-time analytics
 * 
 * @author Play Sport Pro Team
 * @version 2.0.0
 * @since Phase 2
 */

import { db } from '@/firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  increment,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getAnalytics, logEvent } from 'firebase/analytics';

/**
 * Event Types supportati dal sistema analytics
 */
export const ANALYTICS_EVENTS = {
  // Lifecycle events
  NOTIFICATION_SENT: 'notification_sent',
  NOTIFICATION_DELIVERED: 'notification_delivered',
  NOTIFICATION_FAILED: 'notification_failed',
  NOTIFICATION_CLICKED: 'notification_clicked',
  NOTIFICATION_DISMISSED: 'notification_dismissed',
  
  // Conversion events
  CONVERSION_BOOKING_CREATED: 'conversion_booking_created',
  CONVERSION_PAYMENT_COMPLETED: 'conversion_payment_completed',
  CONVERSION_CERTIFICATE_RENEWED: 'conversion_certificate_renewed',
  CONVERSION_PROFILE_UPDATED: 'conversion_profile_updated',
  
  // Engagement events
  DEEP_LINK_OPENED: 'deep_link_opened',
  ACTION_BUTTON_CLICKED: 'action_button_clicked',
  NOTIFICATION_EXPANDED: 'notification_expanded',
  
  // Subscription events
  PERMISSION_GRANTED: 'notification_permission_granted',
  PERMISSION_DENIED: 'notification_permission_denied',
  SUBSCRIPTION_CREATED: 'notification_subscription_created',
  SUBSCRIPTION_DELETED: 'notification_subscription_deleted',
  
  // Channel events
  CHANNEL_FALLBACK: 'notification_channel_fallback',
  CHANNEL_SUCCESS: 'notification_channel_success',
  
  // A/B Testing
  AB_TEST_ASSIGNED: 'ab_test_assigned',
  AB_TEST_CONVERSION: 'ab_test_conversion'
};

/**
 * Notification Categories per analytics
 */
export const NOTIFICATION_CATEGORIES = {
  TRANSACTIONAL: 'transactional',      // Booking confirms, payments
  PROMOTIONAL: 'promotional',           // Offers, promos
  INFORMATIONAL: 'informational',       // News, updates
  CRITICAL: 'critical',                 // Certificate expiring, payment due
  SOCIAL: 'social',                     // Messages, comments
  SYSTEM: 'system'                      // Maintenance, alerts
};

/**
 * NotificationAnalytics - Sistema completo di analytics e tracking
 */
class NotificationAnalytics {
  constructor() {
    this.analytics = null;
    this.isEnabled = true;
    this.eventQueue = [];
    this.batchSize = 50;
    this.flushInterval = 30000; // 30 secondi
    
    this.initialize();
  }

  /**
   * Inizializza Firebase Analytics
   */
  async initialize() {
    try {
      this.analytics = getAnalytics();
      
      // Avvia flush automatico della queue
      setInterval(() => this.flushEventQueue(), this.flushInterval);
      
      console.log('✅ NotificationAnalytics initialized');
    } catch (error) {
      console.error('❌ Failed to initialize analytics:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Track evento notification sent
   * @param {Object} params - Parametri evento
   */
  async trackSent({ 
    notificationId, 
    userId, 
    type, 
    category = NOTIFICATION_CATEGORIES.INFORMATIONAL,
    channel = 'push',
    segmentId = null,
    campaignId = null,
    abTestId = null,
    abVariant = null 
  }) {
    const event = {
      event: ANALYTICS_EVENTS.NOTIFICATION_SENT,
      notificationId,
      userId,
      type,
      category,
      channel,
      segmentId,
      campaignId,
      abTestId,
      abVariant,
      timestamp: Timestamp.now(),
      metadata: {
        userAgent: navigator.userAgent,
        platform: this._getPlatform()
      }
    };

    await this._logEvent(event);
    
    // Firebase Analytics
    if (this.analytics) {
      logEvent(this.analytics, 'notification_sent', {
        notification_type: type,
        notification_category: category,
        channel,
        campaign_id: campaignId,
        ab_test_id: abTestId
      });
    }

    return event;
  }

  /**
   * Track evento notification delivered
   * @param {Object} params - Parametri evento
   */
  async trackDelivered({ 
    notificationId, 
    userId, 
    channel,
    latency,
    cost = 0,
    retryCount = 0 
  }) {
    const event = {
      event: ANALYTICS_EVENTS.NOTIFICATION_DELIVERED,
      notificationId,
      userId,
      channel,
      latency,
      cost,
      retryCount,
      timestamp: Timestamp.now()
    };

    await this._logEvent(event);
    
    if (this.analytics) {
      logEvent(this.analytics, 'notification_delivered', {
        channel,
        latency_ms: latency,
        retry_count: retryCount
      });
    }

    // Aggiorna statistiche aggregate
    await this._updateAggregateStats('delivered', { channel, cost });

    return event;
  }

  /**
   * Track evento notification failed
   * @param {Object} params - Parametri evento
   */
  async trackFailed({ 
    notificationId, 
    userId, 
    channel,
    error,
    errorCode,
    retryCount = 0,
    willRetry = false 
  }) {
    const event = {
      event: ANALYTICS_EVENTS.NOTIFICATION_FAILED,
      notificationId,
      userId,
      channel,
      error: error?.message || 'Unknown error',
      errorCode,
      retryCount,
      willRetry,
      timestamp: Timestamp.now()
    };

    await this._logEvent(event);
    
    if (this.analytics) {
      logEvent(this.analytics, 'notification_failed', {
        channel,
        error_code: errorCode,
        retry_count: retryCount,
        will_retry: willRetry
      });
    }

    // Aggiorna statistiche errori
    await this._updateAggregateStats('failed', { channel, errorCode });

    return event;
  }

  /**
   * Track evento notification clicked
   * @param {Object} params - Parametri evento
   */
  async trackClicked({ 
    notificationId, 
    userId, 
    actionId = null,
    deepLink = null,
    timeToClick = null 
  }) {
    const event = {
      event: ANALYTICS_EVENTS.NOTIFICATION_CLICKED,
      notificationId,
      userId,
      actionId,
      deepLink,
      timeToClick,
      timestamp: Timestamp.now()
    };

    await this._logEvent(event);
    
    if (this.analytics) {
      logEvent(this.analytics, 'notification_click', {
        action_id: actionId,
        has_deep_link: !!deepLink,
        time_to_click_ms: timeToClick
      });
    }

    // Aggiorna CTR
    await this._updateAggregateStats('clicked', { notificationId });

    return event;
  }

  /**
   * Track evento conversion
   * @param {Object} params - Parametri evento
   */
  async trackConversion({ 
    notificationId, 
    userId, 
    conversionType,
    conversionValue = 0,
    conversionData = {},
    timeToConversion = null 
  }) {
    const event = {
      event: conversionType,
      notificationId,
      userId,
      conversionValue,
      conversionData,
      timeToConversion,
      timestamp: Timestamp.now()
    };

    await this._logEvent(event);
    
    if (this.analytics) {
      logEvent(this.analytics, 'notification_conversion', {
        conversion_type: conversionType,
        value: conversionValue,
        time_to_conversion_ms: timeToConversion
      });
    }

    // Aggiorna conversion rate
    await this._updateAggregateStats('converted', { 
      notificationId, 
      conversionValue 
    });

    return event;
  }

  /**
   * Track channel fallback
   * @param {Object} params - Parametri evento
   */
  async trackChannelFallback({ 
    notificationId, 
    userId, 
    fromChannel,
    toChannel,
    reason 
  }) {
    const event = {
      event: ANALYTICS_EVENTS.CHANNEL_FALLBACK,
      notificationId,
      userId,
      fromChannel,
      toChannel,
      reason,
      timestamp: Timestamp.now()
    };

    await this._logEvent(event);
    
    if (this.analytics) {
      logEvent(this.analytics, 'notification_channel_fallback', {
        from_channel: fromChannel,
        to_channel: toChannel,
        reason
      });
    }

    return event;
  }

  /**
   * Track A/B test assignment
   * @param {Object} params - Parametri evento
   */
  async trackABTestAssignment({ 
    abTestId, 
    userId, 
    variant,
    notificationId 
  }) {
    const event = {
      event: ANALYTICS_EVENTS.AB_TEST_ASSIGNED,
      abTestId,
      userId,
      variant,
      notificationId,
      timestamp: Timestamp.now()
    };

    await this._logEvent(event);
    
    if (this.analytics) {
      logEvent(this.analytics, 'ab_test_assigned', {
        test_id: abTestId,
        variant
      });
    }

    return event;
  }

  /**
   * Get funnel analytics per notification type
   * @param {string} type - Tipo notifica
   * @param {Date} startDate - Data inizio
   * @param {Date} endDate - Data fine
   * @returns {Object} Funnel metrics
   */
  async getFunnelAnalytics(type, startDate, endDate) {
    try {
      const eventsRef = collection(db, 'notificationEvents');
      
      // Query tutti gli eventi del periodo
      const q = query(
        eventsRef,
        where('type', '==', type),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      );

      const snapshot = await getDocs(q);
      
      // Conta eventi per tipo
      const eventCounts = {
        sent: 0,
        delivered: 0,
        clicked: 0,
        converted: 0
      };

      const notificationIds = new Set();

      snapshot.forEach(doc => {
        const data = doc.data();
        notificationIds.add(data.notificationId);
        
        if (data.event === ANALYTICS_EVENTS.NOTIFICATION_SENT) {
          eventCounts.sent++;
        } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_DELIVERED) {
          eventCounts.delivered++;
        } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_CLICKED) {
          eventCounts.clicked++;
        } else if (data.event.startsWith('conversion_')) {
          eventCounts.converted++;
        }
      });

      // Calcola rates
      const deliveryRate = eventCounts.sent > 0 
        ? (eventCounts.delivered / eventCounts.sent * 100).toFixed(2) 
        : '0.00';
      
      const ctr = eventCounts.delivered > 0 
        ? (eventCounts.clicked / eventCounts.delivered * 100).toFixed(2) 
        : '0.00';
      
      const conversionRate = eventCounts.clicked > 0 
        ? (eventCounts.converted / eventCounts.clicked * 100).toFixed(2) 
        : '0.00';

      return {
        type,
        period: {
          start: startDate,
          end: endDate
        },
        funnel: {
          sent: eventCounts.sent,
          delivered: eventCounts.delivered,
          clicked: eventCounts.clicked,
          converted: eventCounts.converted
        },
        rates: {
          deliveryRate: `${deliveryRate}%`,
          ctr: `${ctr}%`,
          conversionRate: `${conversionRate}%`
        },
        uniqueNotifications: notificationIds.size
      };

    } catch (error) {
      console.error('Error getting funnel analytics:', error);
      throw error;
    }
  }

  /**
   * Get channel performance comparison
   * @param {Date} startDate - Data inizio
   * @param {Date} endDate - Data fine
   * @returns {Array} Channel stats
   */
  async getChannelPerformance(startDate, endDate) {
    try {
      const eventsRef = collection(db, 'notificationEvents');
      
      const q = query(
        eventsRef,
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      );

      const snapshot = await getDocs(q);
      
      const channelStats = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const channel = data.channel;
        
        if (!channel) return;
        
        if (!channelStats[channel]) {
          channelStats[channel] = {
            sent: 0,
            delivered: 0,
            failed: 0,
            clicked: 0,
            totalLatency: 0,
            totalCost: 0,
            latencies: []
          };
        }

        const stats = channelStats[channel];

        if (data.event === ANALYTICS_EVENTS.NOTIFICATION_SENT) {
          stats.sent++;
        } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_DELIVERED) {
          stats.delivered++;
          if (data.latency) {
            stats.totalLatency += data.latency;
            stats.latencies.push(data.latency);
          }
          if (data.cost) {
            stats.totalCost += data.cost;
          }
        } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_FAILED) {
          stats.failed++;
        } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_CLICKED) {
          stats.clicked++;
        }
      });

      // Calcola metriche per canale
      return Object.entries(channelStats).map(([channel, stats]) => {
        const deliveryRate = stats.sent > 0 
          ? (stats.delivered / stats.sent * 100).toFixed(2) 
          : '0.00';
        
        const errorRate = stats.sent > 0 
          ? (stats.failed / stats.sent * 100).toFixed(2) 
          : '0.00';
        
        const ctr = stats.delivered > 0 
          ? (stats.clicked / stats.delivered * 100).toFixed(2) 
          : '0.00';
        
        const avgLatency = stats.latencies.length > 0
          ? Math.round(stats.totalLatency / stats.latencies.length)
          : 0;
        
        const p95Latency = this._calculatePercentile(stats.latencies, 95);

        return {
          channel,
          sent: stats.sent,
          delivered: stats.delivered,
          failed: stats.failed,
          clicked: stats.clicked,
          deliveryRate: `${deliveryRate}%`,
          errorRate: `${errorRate}%`,
          ctr: `${ctr}%`,
          avgLatency: `${avgLatency}ms`,
          p95Latency: `${p95Latency}ms`,
          totalCost: `€${stats.totalCost.toFixed(4)}`,
          avgCost: `€${(stats.totalCost / Math.max(stats.sent, 1)).toFixed(6)}`
        };
      }).sort((a, b) => b.sent - a.sent);

    } catch (error) {
      console.error('Error getting channel performance:', error);
      throw error;
    }
  }

  /**
   * Get A/B test results
   * @param {string} abTestId - ID test
   * @returns {Object} Test results
   */
  async getABTestResults(abTestId) {
    try {
      const eventsRef = collection(db, 'notificationEvents');
      
      const q = query(
        eventsRef,
        where('abTestId', '==', abTestId)
      );

      const snapshot = await getDocs(q);
      
      const variantStats = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const variant = data.abVariant || data.variant;
        
        if (!variant) return;
        
        if (!variantStats[variant]) {
          variantStats[variant] = {
            sent: 0,
            delivered: 0,
            clicked: 0,
            converted: 0,
            totalConversionValue: 0
          };
        }

        const stats = variantStats[variant];

        if (data.event === ANALYTICS_EVENTS.NOTIFICATION_SENT) {
          stats.sent++;
        } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_DELIVERED) {
          stats.delivered++;
        } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_CLICKED) {
          stats.clicked++;
        } else if (data.event.startsWith('conversion_')) {
          stats.converted++;
          stats.totalConversionValue += data.conversionValue || 0;
        }
      });

      // Calcola metriche per variant
      const results = Object.entries(variantStats).map(([variant, stats]) => {
        const deliveryRate = stats.sent > 0 
          ? (stats.delivered / stats.sent * 100).toFixed(2) 
          : '0.00';
        
        const ctr = stats.delivered > 0 
          ? (stats.clicked / stats.delivered * 100).toFixed(2) 
          : '0.00';
        
        const conversionRate = stats.clicked > 0 
          ? (stats.converted / stats.clicked * 100).toFixed(2) 
          : '0.00';

        return {
          variant,
          sent: stats.sent,
          delivered: stats.delivered,
          clicked: stats.clicked,
          converted: stats.converted,
          deliveryRate: `${deliveryRate}%`,
          ctr: `${ctr}%`,
          conversionRate: `${conversionRate}%`,
          totalValue: `€${stats.totalConversionValue.toFixed(2)}`,
          avgValue: `€${(stats.totalConversionValue / Math.max(stats.converted, 1)).toFixed(2)}`
        };
      });

      // Calcola winner (basato su conversion rate)
      const winner = results.reduce((best, current) => {
        const bestRate = parseFloat(best.conversionRate);
        const currentRate = parseFloat(current.conversionRate);
        return currentRate > bestRate ? current : best;
      }, results[0]);

      return {
        testId: abTestId,
        variants: results,
        winner: winner?.variant || null,
        confidence: this._calculateConfidence(results),
        sampleSize: results.reduce((sum, r) => sum + r.sent, 0)
      };

    } catch (error) {
      console.error('Error getting A/B test results:', error);
      throw error;
    }
  }

  /**
   * Get real-time dashboard metrics
   * @param {number} lastMinutes - Ultimi N minuti
   * @returns {Object} Dashboard metrics
   */
  async getDashboardMetrics(lastMinutes = 60) {
    try {
      const startTime = new Date(Date.now() - lastMinutes * 60 * 1000);
      const eventsRef = collection(db, 'notificationEvents');
      
      const q = query(
        eventsRef,
        where('timestamp', '>=', Timestamp.fromDate(startTime)),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      
      const metrics = {
        sent: 0,
        delivered: 0,
        failed: 0,
        clicked: 0,
        converted: 0,
        byChannel: {},
        byCategory: {},
        recentEvents: []
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Eventi recenti (ultimi 10)
        if (metrics.recentEvents.length < 10) {
          metrics.recentEvents.push({
            event: data.event,
            userId: data.userId,
            channel: data.channel,
            timestamp: data.timestamp.toDate()
          });
        }

        // Contatori globali
        if (data.event === ANALYTICS_EVENTS.NOTIFICATION_SENT) {
          metrics.sent++;
        } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_DELIVERED) {
          metrics.delivered++;
        } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_FAILED) {
          metrics.failed++;
        } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_CLICKED) {
          metrics.clicked++;
        } else if (data.event.startsWith('conversion_')) {
          metrics.converted++;
        }

        // Per canale
        if (data.channel) {
          if (!metrics.byChannel[data.channel]) {
            metrics.byChannel[data.channel] = { sent: 0, delivered: 0, failed: 0 };
          }
          if (data.event === ANALYTICS_EVENTS.NOTIFICATION_SENT) {
            metrics.byChannel[data.channel].sent++;
          } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_DELIVERED) {
            metrics.byChannel[data.channel].delivered++;
          } else if (data.event === ANALYTICS_EVENTS.NOTIFICATION_FAILED) {
            metrics.byChannel[data.channel].failed++;
          }
        }

        // Per categoria
        if (data.category) {
          if (!metrics.byCategory[data.category]) {
            metrics.byCategory[data.category] = 0;
          }
          if (data.event === ANALYTICS_EVENTS.NOTIFICATION_SENT) {
            metrics.byCategory[data.category]++;
          }
        }
      });

      // Calcola rates
      const deliveryRate = metrics.sent > 0 
        ? (metrics.delivered / metrics.sent * 100).toFixed(2) 
        : '0.00';
      
      const errorRate = metrics.sent > 0 
        ? (metrics.failed / metrics.sent * 100).toFixed(2) 
        : '0.00';
      
      const ctr = metrics.delivered > 0 
        ? (metrics.clicked / metrics.delivered * 100).toFixed(2) 
        : '0.00';
      
      const conversionRate = metrics.clicked > 0 
        ? (metrics.converted / metrics.clicked * 100).toFixed(2) 
        : '0.00';

      return {
        period: `Last ${lastMinutes} minutes`,
        summary: {
          sent: metrics.sent,
          delivered: metrics.delivered,
          failed: metrics.failed,
          clicked: metrics.clicked,
          converted: metrics.converted,
          deliveryRate: `${deliveryRate}%`,
          errorRate: `${errorRate}%`,
          ctr: `${ctr}%`,
          conversionRate: `${conversionRate}%`
        },
        byChannel: metrics.byChannel,
        byCategory: metrics.byCategory,
        recentEvents: metrics.recentEvents
      };

    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Log evento (con queue per batch processing)
   * @private
   */
  async _logEvent(event) {
    if (!this.isEnabled) return;

    this.eventQueue.push(event);

    // Flush se raggiungiamo batch size
    if (this.eventQueue.length >= this.batchSize) {
      await this.flushEventQueue();
    }
  }

  /**
   * Flush event queue a Firestore
   */
  async flushEventQueue() {
    if (this.eventQueue.length === 0) return;

    try {
      const batch = writeBatch(db);
      const eventsRef = collection(db, 'notificationEvents');

      this.eventQueue.forEach(event => {
        const docRef = doc(eventsRef);
        batch.set(docRef, event);
      });

      await batch.commit();
      
      console.log(`✅ Flushed ${this.eventQueue.length} analytics events`);
      this.eventQueue = [];

    } catch (error) {
      console.error('❌ Failed to flush event queue:', error);
      // Mantieni eventi in queue per retry
    }
  }

  /**
   * Update aggregate statistics
   * @private
   */
  async _updateAggregateStats(eventType, data) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const statsRef = doc(db, 'notificationStats', today);

      const updates = {};

      if (eventType === 'delivered') {
        updates[`channels.${data.channel}.delivered`] = increment(1);
        updates[`channels.${data.channel}.totalCost`] = increment(data.cost || 0);
      } else if (eventType === 'failed') {
        updates[`channels.${data.channel}.failed`] = increment(1);
        updates[`errors.${data.errorCode}`] = increment(1);
      } else if (eventType === 'clicked') {
        updates[`notifications.${data.notificationId}.clicks`] = increment(1);
      } else if (eventType === 'converted') {
        updates[`notifications.${data.notificationId}.conversions`] = increment(1);
        updates[`notifications.${data.notificationId}.revenue`] = increment(data.conversionValue || 0);
      }

      await setDoc(statsRef, updates, { merge: true });

    } catch (error) {
      console.error('Error updating aggregate stats:', error);
    }
  }

  /**
   * Calculate percentile
   * @private
   */
  _calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Calculate A/B test confidence
   * @private
   */
  _calculateConfidence(variants) {
    // Simplified confidence calculation
    // In production, use proper statistical significance testing (Chi-square, etc.)
    const totalSample = variants.reduce((sum, v) => sum + v.sent, 0);
    
    if (totalSample < 100) return 'Low (< 100 samples)';
    if (totalSample < 1000) return 'Medium (100-1000 samples)';
    return 'High (> 1000 samples)';
  }

  /**
   * Get platform info
   * @private
   */
  _getPlatform() {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Win/.test(ua)) return 'windows';
    if (/Mac/.test(ua)) return 'macos';
    if (/Linux/.test(ua)) return 'linux';
    return 'unknown';
  }
}

// Singleton instance
export const notificationAnalytics = new NotificationAnalytics();

export default NotificationAnalytics;
