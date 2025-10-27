/**
 * Google Analytics 4 Integration for PlaySport
 * Comprehensive event tracking and user behavior analytics
 */

// GA4 Configuration
const GA_MEASUREMENT_ID =
  globalThis.__TEST_GA_MEASUREMENT_ID__ || import.meta.env.VITE_GA_MEASUREMENT_ID;
const DEBUG_MODE = import.meta.env.DEV;

/**
 * Initialize Google Analytics 4
 * Call this in App.jsx or main.jsx
 */
export const initializeGA = () => {
  if (!GA_MEASUREMENT_ID) {
    if (DEBUG_MODE) {
      console.log('📊 Google Analytics not configured, skipping initialization');
    }
    return;
  }

  try {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    // Configure GA4
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      debug_mode: DEBUG_MODE,
      send_page_view: false, // We'll handle page views manually
      anonymize_ip: true,
      allow_google_signals: false, // GDPR compliance
      cookie_flags: 'SameSite=None;Secure',
    });

    if (DEBUG_MODE) {
      console.log('✅ GA4 initialized:', GA_MEASUREMENT_ID);
    }
  } catch (error) {
    console.error('❌ GA4 initialization failed:', error);
  }
};

/**
 * Track page views
 */
export const trackPageView = (page_title, page_location) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  try {
    window.gtag('event', 'page_view', {
      page_title,
      page_location,
      page_referrer: document.referrer,
      engagement_time_msec: 100,
    });

    if (DEBUG_MODE) {
      console.log('📊 GA4 Page View:', { page_title, page_location });
    }
  } catch (error) {
    console.error('❌ GA4 page view tracking failed:', error);
  }
};

/**
 * Track custom events
 */
export const trackEvent = (event_name, parameters = {}) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  try {
    // Transform parameters to GA4 standard format
    const transformedParams = { ...parameters };

    // Map common parameter names to GA4 standards
    if (transformedParams.category !== undefined) {
      transformedParams.event_category = transformedParams.category;
      delete transformedParams.category;
    }

    if (transformedParams.label !== undefined) {
      transformedParams.event_label = transformedParams.label;
      delete transformedParams.label;
    }

    // Special handling for button_click events
    if (event_name === 'button_click') {
      transformedParams.event_category = 'engagement';
      if (transformedParams.elementId !== undefined) {
        transformedParams.event_label = transformedParams.elementId;
        delete transformedParams.elementId;
      }
      if (transformedParams.elementText !== undefined) {
        transformedParams.element_text = transformedParams.elementText;
        delete transformedParams.elementText;
      }
      if (transformedParams.elementClass !== undefined) {
        transformedParams.element_class = transformedParams.elementClass;
        delete transformedParams.elementClass;
      }
      if (transformedParams.page !== undefined) {
        transformedParams.page_location = transformedParams.page;
        delete transformedParams.page;
      }
    }

    // Special handling for booking_completed events
    if (event_name === 'booking_completed') {
      transformedParams.event_category = 'conversion';
      if (transformedParams.amount !== undefined) {
        transformedParams.value = transformedParams.amount;
        delete transformedParams.amount;
      }
    }

    window.gtag('event', event_name, {
      ...transformedParams,
      timestamp: Date.now(),
    });

    if (DEBUG_MODE) {
      console.log('📊 GA4 Event:', event_name, transformedParams);
    }
  } catch (error) {
    console.error('❌ GA4 event tracking failed:', error, { event_name, parameters });
  }
};

/**
 * Set user properties
 */
export const setUserProperties = (properties) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  try {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_properties: properties,
    });

    if (DEBUG_MODE) {
      console.log('👤 GA4 User Properties:', properties);
    }
  } catch (error) {
    console.error('❌ GA4 user properties failed:', error);
  }
};

/**
 * Set user ID for cross-device tracking
 */
export const setUserId = (userId) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  try {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: userId,
    });

    if (DEBUG_MODE) {
      console.log('🆔 GA4 User ID set:', userId);
    }
  } catch (error) {
    console.error('❌ GA4 user ID failed:', error);
  }
};

// =============================================================================
// PLAYSPORT SPECIFIC EVENT TRACKING
// =============================================================================

/**
 * Authentication Events
 */
export const trackAuth = {
  loginAttempt: (method) => trackEvent('login_attempt', { method }),
  loginSuccess: (method, userId) => {
    trackEvent('login', { method });
    setUserId(userId);
  },
  loginFailed: (method, error_code) => trackEvent('login_failed', { method, error_code }),
  logout: () => trackEvent('logout'),
  signupAttempt: (method) => trackEvent('signup_attempt', { method }),
  signupSuccess: (method, userId) => {
    trackEvent('sign_up', { method });
    setUserId(userId);
  },
};

/**
 * Booking Events
 */
export const trackBooking = {
  createAttempt: (court_type) => trackEvent('booking_create_attempt', { court_type }),
  createSuccess: (booking_id, court_type, duration, cost) =>
    trackEvent('booking_created', {
      booking_id,
      court_type,
      duration_minutes: duration,
      value: cost,
      currency: 'EUR',
    }),
  createFailed: (error_reason, court_type) =>
    trackEvent('booking_create_failed', { error_reason, court_type }),
  cancel: (booking_id, reason) => trackEvent('booking_cancelled', { booking_id, reason }),
  view: (booking_id) => trackEvent('booking_viewed', { booking_id }),
  edit: (booking_id) => trackEvent('booking_edited', { booking_id }),
};

/**
 * Navigation Events
 */
export const trackNavigation = {
  menuClick: (menu_item) => trackEvent('menu_click', { menu_item }),
  tabChange: (tab_name, section) => trackEvent('tab_change', { tab_name, section }),
  searchPerformed: (search_term, results_count) =>
    trackEvent('search', { search_term, results_count }),
  filterApplied: (filter_type, filter_value) =>
    trackEvent('filter_applied', { filter_type, filter_value }),
};

/**
 * Admin Events
 */
export const trackAdmin = {
  loginAttempt: () => trackEvent('admin_login_attempt'),
  loginSuccess: (admin_id) => {
    trackEvent('admin_login_success');
    setUserProperties({ user_type: 'admin' });
  },
  actionPerformed: (action, target) => trackEvent('admin_action', { action, target }),
  reportGenerated: (report_type) => trackEvent('admin_report_generated', { report_type }),
  settingChanged: (setting_name, new_value) =>
    trackEvent('admin_setting_changed', { setting_name, new_value }),
};

/**
 * Performance Events
 */
export const trackPerformance = {
  pageLoadTime: (page, load_time_ms) => trackEvent('page_performance', { page, load_time_ms }),
  apiResponse: (endpoint, response_time_ms, status_code) =>
    trackEvent('api_performance', { endpoint, response_time_ms, status_code }),
  errorOccurred: (error_type, error_message, page) =>
    trackEvent('error_occurred', { error_type, error_message, page }),
};

/**
 * User Engagement Events
 */
export const trackEngagement = {
  timeOnPage: (page, time_seconds) =>
    trackEvent('page_engagement', { page, engagement_time: time_seconds }),
  buttonClick: (button_name, page) => trackEvent('button_click', { button_name, page }),
  formSubmit: (form_name, success) => trackEvent('form_submit', { form_name, success }),
  fileDownload: (file_name, file_type) => trackEvent('file_download', { file_name, file_type }),
};

/**
 * Business Metrics
 */
export const trackBusiness = {
  courtUtilization: (court_id, utilization_percent, time_period) =>
    trackEvent('court_utilization', { court_id, utilization_percent, time_period }),
  revenueGenerated: (amount, source, period) =>
    trackEvent('revenue_generated', {
      value: amount,
      currency: 'EUR',
      source,
      period,
    }),
  userRetention: (user_id, days_since_last_visit) =>
    trackEvent('user_retention', { user_id, days_since_last_visit }),
  conversionFunnel: (step, funnel_name, success) =>
    trackEvent('conversion_step', { step, funnel_name, success }),
};

// =============================================================================
// REACT ROUTER INTEGRATION
// =============================================================================

/**
 * Track route changes automatically
 * Use with React Router
 */
export const useGAPageTracking = () => {
  if (typeof window === 'undefined') return;

  try {
    const currentPath = window.location.pathname;
    const currentTitle = document.title || 'PlaySport';

    trackPageView(currentTitle, currentPath);
  } catch (error) {
    console.error('❌ GA4 page tracking failed:', error);
  }
};

/**
 * Higher Order Component for automatic page tracking
 */
export const withGATracking = (Component, pageName) => {
  return function TrackedComponent(props) {
    React.useEffect(() => {
      trackPageView(pageName, window.location.pathname);
    }, []);

    return React.createElement(Component, props);
  };
};

// =============================================================================
// CONVERSION FUNNELS
// =============================================================================

/**
 * Predefined conversion funnels for PlaySport
 */
export const ConversionFunnels = {
  BOOKING_FLOW: {
    name: 'booking_flow',
    steps: [
      'court_selection',
      'time_selection',
      'player_selection',
      'payment_info',
      'booking_confirmation',
    ],
  },
  USER_ONBOARDING: {
    name: 'user_onboarding',
    steps: ['landing_page', 'signup_form', 'email_verification', 'profile_setup', 'first_booking'],
  },
  ADMIN_WORKFLOW: {
    name: 'admin_workflow',
    steps: [
      'admin_login',
      'dashboard_view',
      'action_selection',
      'data_modification',
      'changes_saved',
    ],
  },
};

/**
 * Track funnel progression
 */
export const trackFunnelStep = (funnelName, stepName, additionalData = {}) => {
  trackEvent('funnel_step', {
    funnel_name: funnelName,
    step_name: stepName,
    ...additionalData,
  });
};

/**
 * Track funnel completion
 */
export const trackFunnelCompletion = (funnelName, totalSteps, completionTime) => {
  trackEvent('funnel_completed', {
    funnel_name: funnelName,
    total_steps: totalSteps,
    completion_time_seconds: completionTime,
  });
};

// =============================================================================
// GDPR COMPLIANCE
// =============================================================================

/**
 * Check if user has given analytics consent
 */
export const hasAnalyticsConsent = () => {
  return localStorage.getItem('analytics_consent') === 'true';
};

/**
 * Set analytics consent
 */
export const setAnalyticsConsent = (consent) => {
  localStorage.setItem('analytics_consent', consent.toString());

  if (consent) {
    initializeGA();
  } else {
    // Disable analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
  }
};

/**
 * Additional analytics functions for test compatibility
 */
export const trackTiming = (name, value, category = 'timing') => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', 'timing_complete', {
      name,
      value,
      event_category: category,
    });
  }
};

export const clearUser = () => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: null,
      custom_map: {},
    });
  }
};

export const trackPurchase = (data) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', 'purchase', data);
  }
};

export const trackAddToCart = (data) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', 'add_to_cart', data);
  }
};

export const trackConversion = (eventName, data = {}) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, {
      ...data,
      event_category: 'conversion',
    });
  }
};

export const setCustomDimension = (index, value) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      [`custom_dimension_${index}`]: value,
    });
  }
};

export const trackCustomMetric = (name, value) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', 'custom_metric', {
      event_category: 'metric',
      event_label: name,
      value,
    });
  }
};

export const startSession = () => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', 'session_start', {
      event_category: 'session',
    });
  }
};

export const endSession = (duration) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', 'session_end', {
      event_category: 'session',
      value: duration,
    });
  }
};

export const setConsent = (consent) => {
  if (window.gtag) {
    window.gtag('consent', 'update', consent);
  }
};

export const setTrackingEnabled = (enabled) => {
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: enabled ? 'granted' : 'denied',
    });
  }
};

export const enableBatching = (enabled) => {
  // Batching is handled automatically by gtag
  return enabled;
};

export const trackWebVital = (name, value, rating) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: name,
      value: Math.round(value),
      custom_map: { metric_rating: rating },
    });
  }
};

/**
 * Track errors and exceptions
 */
export const trackError = (error, context = {}) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    const errorData = {
      description: error.message || error.toString(),
      fatal: context.fatal || false,
      event_category: 'error',
      ...context,
    };

    if (error.stack) {
      errorData.stack_trace = error.stack;
    }

    window.gtag('event', 'exception', errorData);
  }
};

export const trackSPANavigation = (page, title) => {
  trackPageView(page, title);
};

/**
 * Export all analytics functions
 */
export const analytics = {
  initializeGA,
  trackPageView,
  trackEvent,
  setUserProperties,
  setUserId,
  trackAuth,
  trackBooking,
  trackNavigation,
  trackAdmin,
  trackPerformance,
  trackEngagement,
  trackBusiness,
  useGAPageTracking,
  withGATracking,
  ConversionFunnels,
  trackFunnelStep,
  trackFunnelCompletion,
  hasAnalyticsConsent,
  setAnalyticsConsent,
  // Additional functions for test compatibility
  trackTiming,
  setUser: setUserId, // Alias
  clearUser,
  trackPurchase,
  trackAddToCart,
  trackConversion,
  setCustomDimension,
  trackCustomMetric,
  startSession,
  endSession,
  setConsent,
  setTrackingEnabled,
  enableBatching,
  trackWebVital,
  trackSPANavigation,
  trackError,
};

export default {
  // Sanitization
  initializeGA,
  trackPageView,
  trackEvent,
  setUserProperties,
  setUserId,
  trackAuth,
  trackBooking,
  trackNavigation,
  trackAdmin,
  trackPerformance,
  trackEngagement,
  trackBusiness,
  useGAPageTracking,
  withGATracking,
  ConversionFunnels,
  trackFunnelStep,
  trackFunnelCompletion,
  hasAnalyticsConsent,
  setAnalyticsConsent,
  // Additional functions for test compatibility
  trackTiming,
  setUser: setUserId, // Alias
  clearUser,
  trackPurchase,
  trackAddToCart,
  trackConversion,
  setCustomDimension,
  trackCustomMetric,
  startSession,
  endSession,
  setConsent,
  setTrackingEnabled,
  enableBatching,
  trackWebVital,
  trackSPANavigation,
  trackError,
};
