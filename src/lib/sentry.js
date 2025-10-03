// =============================================
// SENTRY CONFIGURATION
// =============================================
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Sentry configuration for PlaySport
export const initSentry = () => {
  // Skip Sentry initialization if no DSN is configured
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!sentryDsn) {
    console.log('📊 Sentry DSN not configured, skipping error tracking initialization');
    return;
  }

  Sentry.init({
    // DSN will be set via environment variable
    dsn: sentryDsn,
    
    // Environment configuration
    environment: import.meta.env.MODE || 'development',
    
    // Performance Monitoring
    integrations: [
      new BrowserTracing({
        // Set tracing origins to track performance across domains
        tracingOrigins: [
          'localhost',
          'playsport.app',
          /^\//,
          /^https:\/\/.*\.firebaseapp\.com/,
          /^https:\/\/.*\.googleapis\.com/
        ],
      }),
    ],
    
    // Performance Monitoring sample rate
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    
    // Error sampling
    sampleRate: 1.0,
    
    // Debug mode in development
    debug: import.meta.env.DEV,
    
    // Release tracking
    release: `playsport@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    
    // Capture unhandled promise rejections
    captureUnhandledRejections: true,
    
    // Additional options
    beforeSend(event, hint) {
      // Filter out development errors
      if (import.meta.env.DEV) {
        console.log('Sentry Event:', event);
      }
      
      // Don't send events if no DSN is configured
      if (!import.meta.env.VITE_SENTRY_DSN) {
        return null;
      }
      
      return event;
    },
    
    // Error filtering
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Random plugins/extensions
      'conduitPage',
      // Network errors that shouldn't be tracked
      'ChunkLoadError',
      'Loading chunk',
      'NetworkError',
      // Firebase auth errors that are expected
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
    ],
    
    // Tag all events
    initialScope: {
      tags: {
        component: 'playsport-frontend',
        platform: 'web'
      },
    },
  });
};

// Custom error tracking utilities
export const trackError = (error, context = {}) => {
  Sentry.withScope((scope) => {
    // Add context information
    Object.keys(context).forEach(key => {
      scope.setContext(key, context[key]);
    });
    
    // Capture the error
    Sentry.captureException(error);
  });
};

// Track Firebase errors specifically
export const trackFirebaseError = (error, operation, additionalContext = {}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'firebase');
    scope.setTag('firebase_operation', operation);
    
    // Add Firebase-specific context
    scope.setContext('firebase', {
      operation,
      errorCode: error.code,
      errorMessage: error.message,
      ...additionalContext
    });
    
    Sentry.captureException(error);
  });
};

// Track user actions
export const trackUserAction = (action, data = {}) => {
  Sentry.addBreadcrumb({
    message: action,
    category: 'user_action',
    data,
    level: 'info',
  });
};

// Track performance metrics
export const trackPerformance = (name, duration, additionalData = {}) => {
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    category: 'performance',
    data: {
      duration,
      ...additionalData
    },
    level: 'info',
  });
};

// Set user context
export const setSentryUser = (user) => {
  Sentry.setUser({
    id: user.uid,
    email: user.email,
    username: user.displayName,
  });
};

// Clear user context on logout
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

export default Sentry;