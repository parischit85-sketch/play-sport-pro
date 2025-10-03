// =============================================
// FILE: src/lib/__tests__/analytics.test.js
// ANALYTICS INTEGRATION UNIT TESTS
// =============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analytics, trackEvent, trackPageView, trackTiming, trackError } from '../analytics.js';

// Mock Google Analytics
const mockGtag = vi.fn();
global.gtag = mockGtag;

// Mock Google Tag Manager
const mockDataLayer = [];
global.dataLayer = mockDataLayer;

// Mock window object
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/test-page',
    search: '?param=value',
    hostname: 'localhost',
  },
  writable: true,
});

describe('Analytics Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDataLayer.length = 0;
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Event Tracking', () => {
    it('should track basic events', () => {
      trackEvent('test_event', {
        category: 'test_category',
        label: 'test_label',
        value: 100,
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        event_category: 'test_category',
        event_label: 'test_label',
        value: 100,
        timestamp: expect.any(Number),
      });
    });

    it('should track user interactions', () => {
      trackEvent('button_click', {
        elementId: 'book-court-btn',
        elementText: 'Book Court',
        elementClass: 'primary-button',
        page: '/courts',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'button_click', {
        event_category: 'engagement',
        event_label: 'book-court-btn',
        element_text: 'Book Court',
        element_class: 'primary-button',
        page_location: '/courts',
        timestamp: expect.any(Number),
      });
    });

    it('should track business metrics', () => {
      trackEvent('booking_completed', {
        booking_id: 'BK123456',
        court_id: 'CT001',
        duration: 90,
        amount: 50.00,
        payment_method: 'card',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'booking_completed', {
        event_category: 'conversion',
        booking_id: 'BK123456',
        court_id: 'CT001',
        duration: 90,
        value: 50.00,
        payment_method: 'card',
        timestamp: expect.any(Number),
      });
    });

    it('should track custom events with enhanced data', () => {
      const customData = {
        user_id: 'user123',
        session_id: 'session456',
        custom_property: 'custom_value',
      };

      trackEvent('custom_event', customData);

      expect(mockGtag).toHaveBeenCalledWith('event', 'custom_event', {
        ...customData,
        timestamp: expect.any(Number),
      });
    });

    it('should handle events without parameters', () => {
      trackEvent('simple_event');

      expect(mockGtag).toHaveBeenCalledWith('event', 'simple_event', {
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Page View Tracking', () => {
    it('should track page views with standard data', () => {
      trackPageView('/dashboard', 'Dashboard');

      expect(mockGtag).toHaveBeenCalledWith('config', expect.any(String), {
        page_title: 'Dashboard',
        page_location: '/dashboard',
        custom_map: {
          custom_parameter_1: 'page_type',
          custom_parameter_2: 'user_role',
        },
      });
    });

    it('should track page views with enhanced metadata', () => {
      const metadata = {
        user_role: 'admin',
        page_type: 'dashboard',
        section: 'analytics',
        load_time: 1250,
      };

      trackPageView('/admin/analytics', 'Analytics Dashboard', metadata);

      expect(mockGtag).toHaveBeenCalledWith('config', expect.any(String), {
        page_title: 'Analytics Dashboard',
        page_location: '/admin/analytics',
        user_role: 'admin',
        page_type: 'dashboard',
        section: 'analytics',
        load_time: 1250,
        custom_map: {
          custom_parameter_1: 'page_type',
          custom_parameter_2: 'user_role',
        },
      });
    });

    it('should automatically track SPA navigation', () => {
      // Simulate SPA navigation
      const originalPushState = window.history.pushState;
      const pushStateSpy = vi.fn();
      window.history.pushState = pushStateSpy;

      // Simulate navigation event
      analytics.trackSPANavigation('/new-page', 'New Page');

      expect(mockGtag).toHaveBeenCalledWith('config', expect.any(String), {
        page_title: 'New Page',
        page_location: '/new-page',
        custom_map: {
          custom_parameter_1: 'page_type',
          custom_parameter_2: 'user_role',
        },
      });

      window.history.pushState = originalPushState;
    });
  });

  describe('Performance Timing', () => {
    it('should track timing events', () => {
      trackTiming('page_load', 1500, 'initial_load');

      expect(mockGtag).toHaveBeenCalledWith('event', 'timing_complete', {
        name: 'page_load',
        value: 1500,
        event_category: 'performance',
        event_label: 'initial_load',
        timestamp: expect.any(Number),
      });
    });

    it('should track API response times', () => {
      trackTiming('api_response', 250, 'get_bookings', {
        endpoint: '/api/bookings',
        method: 'GET',
        status: 200,
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'timing_complete', {
        name: 'api_response',
        value: 250,
        event_category: 'performance',
        event_label: 'get_bookings',
        endpoint: '/api/bookings',
        method: 'GET',
        status: 200,
        timestamp: expect.any(Number),
      });
    });

    it('should track Core Web Vitals', () => {
      analytics.trackWebVital('CLS', 0.05, {
        rating: 'good',
        navigationType: 'navigate',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vital', {
        event_category: 'performance',
        event_label: 'CLS',
        value: 0.05,
        rating: 'good',
        navigation_type: 'navigate',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Error Tracking', () => {
    it('should track JavaScript errors', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:10:5';

      trackError(error, {
        component: 'BookingForm',
        action: 'submit_booking',
        severity: 'high',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Test error',
        fatal: false,
        event_category: 'error',
        component: 'BookingForm',
        action: 'submit_booking',
        severity: 'high',
        stack_trace: 'Error: Test error\n    at test.js:10:5',
        timestamp: expect.any(Number),
      });
    });

    it('should track API errors', () => {
      const apiError = {
        message: 'Failed to fetch bookings',
        status: 500,
        endpoint: '/api/bookings',
        method: 'GET',
      };

      trackError(apiError, {
        type: 'api_error',
        severity: 'medium',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Failed to fetch bookings',
        fatal: false,
        event_category: 'error',
        type: 'api_error',
        severity: 'medium',
        api_status: 500,
        api_endpoint: '/api/bookings',
        api_method: 'GET',
        timestamp: expect.any(Number),
      });
    });

    it('should mark fatal errors correctly', () => {
      const fatalError = new Error('Critical system failure');

      trackError(fatalError, { fatal: true });

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Critical system failure',
        fatal: true,
        event_category: 'error',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('User Identification', () => {
    it('should set user ID and properties', () => {
      analytics.setUser('user123', {
        user_role: 'premium',
        registration_date: '2025-01-01',
        club_affiliation: 'sporting_cat',
      });

      expect(mockGtag).toHaveBeenCalledWith('config', expect.any(String), {
        user_id: 'user123',
        custom_map: {
          custom_parameter_1: 'page_type',
          custom_parameter_2: 'user_role',
        },
      });

      expect(mockGtag).toHaveBeenCalledWith('set', {
        user_properties: {
          user_role: 'premium',
          registration_date: '2025-01-01',
          club_affiliation: 'sporting_cat',
        },
      });
    });

    it('should clear user data on logout', () => {
      analytics.clearUser();

      expect(mockGtag).toHaveBeenCalledWith('config', expect.any(String), {
        user_id: null,
      });
    });
  });

  describe('E-commerce Tracking', () => {
    it('should track purchase events', () => {
      const purchaseData = {
        transaction_id: 'TXN123456',
        value: 50.00,
        currency: 'EUR',
        items: [{
          item_id: 'court_booking',
          item_name: 'Court Booking',
          category: 'sports',
          quantity: 1,
          price: 50.00,
        }],
      };

      analytics.trackPurchase(purchaseData);

      expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
        transaction_id: 'TXN123456',
        value: 50.00,
        currency: 'EUR',
        items: [{
          item_id: 'court_booking',
          item_name: 'Court Booking',
          category: 'sports',
          quantity: 1,
          price: 50.00,
        }],
        timestamp: expect.any(Number),
      });
    });

    it('should track add to cart events', () => {
      const item = {
        item_id: 'court_slot_123',
        item_name: 'Tennis Court - 14:00-15:30',
        category: 'court_booking',
        price: 45.00,
        currency: 'EUR',
      };

      analytics.trackAddToCart(item);

      expect(mockGtag).toHaveBeenCalledWith('event', 'add_to_cart', {
        currency: 'EUR',
        value: 45.00,
        items: [item],
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Conversion Tracking', () => {
    it('should track conversion events', () => {
      analytics.trackConversion('booking_completion', {
        value: 50.00,
        currency: 'EUR',
        booking_type: 'tennis',
        conversion_label: 'premium_booking',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID/booking_completion',
        value: 50.00,
        currency: 'EUR',
        booking_type: 'tennis',
        conversion_label: 'premium_booking',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Custom Dimensions and Metrics', () => {
    it('should set custom dimensions', () => {
      analytics.setCustomDimension(1, 'mobile_app');
      analytics.setCustomDimension(2, 'premium_user');

      expect(mockGtag).toHaveBeenCalledWith('config', expect.any(String), {
        custom_map: {
          custom_parameter_1: 'page_type',
          custom_parameter_2: 'user_role',
        },
      });
    });

    it('should track custom metrics', () => {
      analytics.trackCustomMetric('session_duration', 1800); // 30 minutes

      expect(mockGtag).toHaveBeenCalledWith('event', 'custom_metric', {
        metric_name: 'session_duration',
        metric_value: 1800,
        event_category: 'engagement',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Session Management', () => {
    it('should track session start', () => {
      analytics.startSession();

      expect(mockGtag).toHaveBeenCalledWith('event', 'session_start', {
        session_id: expect.any(String),
        timestamp: expect.any(Number),
      });
    });

    it('should track session end with duration', () => {
      vi.useFakeTimers();
      const startTime = Date.now();
      
      analytics.startSession();
      
      // Advance time by 30 minutes
      vi.advanceTimersByTime(30 * 60 * 1000);
      
      analytics.endSession();

      expect(mockGtag).toHaveBeenCalledWith('event', 'session_end', {
        session_duration: 1800, // 30 minutes in seconds
        timestamp: expect.any(Number),
      });

      vi.useRealTimers();
    });
  });

  describe('Privacy and Consent', () => {
    it('should respect consent settings', () => {
      analytics.setConsent({
        analytics_storage: 'granted',
        ad_storage: 'denied',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
      });

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
      });
    });

    it('should enable/disable tracking based on consent', () => {
      analytics.setTrackingEnabled(false);
      
      trackEvent('test_event');
      
      // Should not call gtag when tracking is disabled
      expect(mockGtag).not.toHaveBeenCalled();

      analytics.setTrackingEnabled(true);
      
      trackEvent('test_event');
      
      // Should call gtag when tracking is enabled
      expect(mockGtag).toHaveBeenCalled();
    });
  });

  describe('Data Quality and Validation', () => {
    it('should validate event parameters', () => {
      // Mock console.warn to check validation warnings
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      trackEvent('invalid-event-name-with-spaces', {
        'invalid parameter name': 'value',
        validParameter: 'value',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid event name')
      );

      consoleSpy.mockRestore();
    });

    it('should sanitize parameter values', () => {
      trackEvent('test_event', {
        user_input: '<script>alert("xss")</script>',
        numeric_value: '123.45',
        boolean_value: 'true',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        user_input: '&lt;script&gt;alert("xss")&lt;/script&gt;',
        numeric_value: 123.45,
        boolean_value: true,
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Offline Support', () => {
    it('should queue events when offline', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      trackEvent('offline_event', { test: 'data' });

      // Should not call gtag immediately when offline
      expect(mockGtag).not.toHaveBeenCalled();

      // Mock coming back online
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });

      // Trigger online event
      window.dispatchEvent(new Event('online'));

      // Should now send queued events
      expect(mockGtag).toHaveBeenCalledWith('event', 'offline_event', {
        test: 'data',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Performance Impact', () => {
    it('should batch events for better performance', async () => {
      // Enable batching
      analytics.enableBatching(true, 100); // 100ms batch interval

      trackEvent('event1');
      trackEvent('event2');
      trackEvent('event3');

      // Should not call gtag immediately
      expect(mockGtag).not.toHaveBeenCalled();

      // Wait for batch to be sent
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should have sent all events in a batch
      expect(mockGtag).toHaveBeenCalledTimes(3);
    });

    it('should respect rate limiting', () => {
      // Send many events quickly
      for (let i = 0; i < 100; i++) {
        trackEvent(`event_${i}`);
      }

      // Should not exceed rate limit (e.g., 50 events per minute)
      expect(mockGtag).toHaveBeenCalledTimes(50);
    });
  });
});