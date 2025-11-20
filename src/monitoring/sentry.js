/**
 * Sentry Configuration for Push Notifications Monitoring
 * Error tracking, performance monitoring, and alerts
 */

import * as Sentry from '@sentry/react';

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Environment
  environment: import.meta.env.MODE,

  // Release tracking
  release: `push-notifications@${import.meta.env.VITE_APP_VERSION || '2.0.0'}`,

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random plugins/extensions
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // Network errors that are expected
    'NetworkError',
    'Failed to fetch',
    // Notification permission denied (user action)
    'NotAllowedError',
  ],

  // Before send hook
  beforeSend(event, hint) {
    // Filter out notification permission errors (user choice)
    if (event.exception?.values?.[0]?.value?.includes('permission')) {
      return null;
    }

    // Add custom context
    event.contexts = {
      ...event.contexts,
      notification: {
        circuit_breaker_state: window.__PUSH_CIRCUIT_STATE__ || 'unknown',
        delivery_rate: window.__PUSH_DELIVERY_RATE__ || 'unknown',
      },
    };

    return event;
  },
});

// Custom error tracking for Push Notifications

export function trackNotificationError(error, context = {}) {
  Sentry.withScope((scope) => {
    scope.setContext('notification', {
      ...context,
      timestamp: new Date().toISOString(),
    });

    scope.setLevel(context.critical ? 'error' : 'warning');

    Sentry.captureException(error);
  });
}

export function trackCircuitBreakerOpen(metrics) {
  Sentry.captureMessage('Circuit Breaker OPEN', {
    level: 'error',
    contexts: {
      circuit_breaker: {
        state: 'OPEN',
        error_rate: metrics.errorRate,
        failure_count: metrics.failureCount,
        last_failure: metrics.lastFailure,
      },
    },
  });
}

export function trackDeliveryFailure(userId, notificationId, error, attempts) {
  Sentry.withScope((scope) => {
    scope.setUser({ id: userId });
    scope.setContext('notification', {
      notification_id: notificationId,
      attempts,
      error_message: error.message,
    });

    Sentry.captureException(error);
  });
}

export function trackCascadeFailure(userId, notificationId, attempts) {
  Sentry.captureMessage('All notification channels failed', {
    level: 'error',
    user: { id: userId },
    contexts: {
      cascade: {
        notification_id: notificationId,
        attempts: attempts.length,
        channels_tried: attempts.map((a) => a.channel).join(', '),
        last_error: attempts[attempts.length - 1]?.error,
      },
    },
  });
}

export function trackPerformanceIssue(metricName, value, threshold) {
  if (value > threshold) {
    Sentry.captureMessage(`Performance threshold exceeded: ${metricName}`, {
      level: 'warning',
      contexts: {
        performance: {
          metric: metricName,
          value,
          threshold,
          exceeded_by: value - threshold,
        },
      },
    });
  }
}

// Performance monitoring

export function startNotificationTransaction(name) {
  return Sentry.startSpan(
    {
      name,
      op: 'notification',
    },
    (span) => span
  );
}

export function measureNotificationSend(userId, notificationId) {
  const transaction = Sentry.startSpan(
    {
      name: 'notification.send',
      op: 'notification',
      data: {
        user_id: userId,
        notification_id: notificationId,
      },
    },
    (span) => span
  );

  return {
    finish: (result) => {
      transaction.setData('success', result.success);
      transaction.setData('channel', result.channel);
      transaction.setData('attempts', result.attempts);
      transaction.setData('latency', result.latency);
      transaction.finish();
    },
    error: (error) => {
      transaction.setStatus('internal_error');
      transaction.finish();
      trackNotificationError(error, { userId, notificationId });
    },
  };
}

// Custom instrumentation

export function instrumentPushService(pushService) {
  const originalSend = pushService.send.bind(pushService);

  pushService.send = async function (userId, notification, options) {
    const transaction = measureNotificationSend(userId, notification.id);

    try {
      const result = await originalSend(userId, notification, options);
      transaction.finish(result);

      // Track performance metrics
      trackPerformanceIssue('notification_latency', result.latency, 3000);

      return result;
    } catch (error) {
      transaction.error(error);
      throw error;
    }
  };
}

export function instrumentNotificationCascade(cascade) {
  const originalSend = cascade.send.bind(cascade);

  cascade.send = async function (userId, notification, options) {
    const span = Sentry.getActiveSpan()?.startChild({
      op: 'cascade',
      description: 'Notification Cascade',
    });

    try {
      const result = await originalSend(userId, notification, options);

      span?.setData('success', result.success);
      span?.setData('channel', result.channel);
      span?.setData('total_attempts', result.totalAttempts);
      span?.setData('cost', result.cost);

      if (!result.success) {
        trackCascadeFailure(userId, notification.id, result.attempts);
      }

      span?.finish();
      return result;
    } catch (error) {
      span?.setStatus('internal_error');
      span?.finish();
      throw error;
    }
  };
}

// Alert rules (configured in Sentry dashboard)

export const SENTRY_ALERT_RULES = {
  // High error rate
  high_error_rate: {
    condition: 'error_rate > 10%',
    timeWindow: '5 minutes',
    action: 'email + slack + pagerduty',
  },

  // Circuit breaker open
  circuit_breaker_open: {
    condition: 'message contains "Circuit Breaker OPEN"',
    timeWindow: 'immediate',
    action: 'pagerduty',
  },

  // All channels failed
  cascade_failure: {
    condition: 'message contains "All notification channels failed"',
    timeWindow: 'immediate',
    action: 'slack + email',
  },

  // Performance degradation
  slow_notifications: {
    condition: 'p95(notification.send) > 5000ms',
    timeWindow: '10 minutes',
    action: 'slack',
  },

  // High failure count
  high_failure_count: {
    condition: 'count(errors) > 50',
    timeWindow: '5 minutes',
    action: 'email + slack',
  },
};

// Export monitoring configuration
export default {
  trackNotificationError,
  trackCircuitBreakerOpen,
  trackDeliveryFailure,
  trackCascadeFailure,
  trackPerformanceIssue,
  measureNotificationSend,
  instrumentPushService,
  instrumentNotificationCascade,
};
