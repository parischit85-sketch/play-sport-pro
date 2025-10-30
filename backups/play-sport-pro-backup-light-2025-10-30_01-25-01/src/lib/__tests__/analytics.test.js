/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  trackEvent,
  trackPageView,
  trackTiming,
  trackError,
  setUserId,
  clearUser,
  trackConversion,
  setCustomDimension,
  trackCustomMetric,
  startSession,
  endSession,
  setConsent,
  setTrackingEnabled,
  trackWebVital,
  trackSPANavigation,
} from '../analytics.js';

describe('Analytics Library - Core Functionality', () => {
  let mockGtag;

  beforeEach(() => {
    mockGtag = vi.fn();
    global.window.gtag = mockGtag;
    global.document = {
      referrer: '',
      title: 'Test Page',
    };
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

    it('should track button clicks with proper transformations', () => {
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

    it('should track booking completion as conversion', () => {
      trackEvent('booking_completed', {
        booking_id: 'BK123456',
        amount: 50.0,
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'booking_completed', {
        event_category: 'conversion',
        booking_id: 'BK123456',
        value: 50.0,
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
    it('should track page views', () => {
      trackPageView('/dashboard', 'Dashboard');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_title: '/dashboard',
        page_location: 'Dashboard',
        page_referrer: '',
        engagement_time_msec: 100,
      });
    });

    it('should track SPA navigation', () => {
      trackSPANavigation('/new-page', 'New Page');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_title: '/new-page',
        page_location: 'New Page',
        page_referrer: '',
        engagement_time_msec: 100,
      });
    });
  });

  describe('Performance Timing', () => {
    it('should track timing events', () => {
      trackTiming('page_load', 1500, 'initial_load');

      expect(mockGtag).toHaveBeenCalledWith('event', 'timing_complete', {
        name: 'page_load',
        value: 1500,
        event_category: 'initial_load',
      });
    });

    it('should track Core Web Vitals', () => {
      trackWebVital('CLS', 0.05, {
        rating: 'good',
        navigationType: 'navigate',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'CLS',
        value: 0,
        custom_map: {
          metric_rating: {
            rating: 'good',
            navigationType: 'navigate',
          },
        },
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
        stack_trace: error.stack,
      });
    });

    it('should track fatal errors', () => {
      const fatalError = new Error('Critical system failure');

      trackError(fatalError, { fatal: true });

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Critical system failure',
        fatal: true,
        event_category: 'error',
        stack_trace: expect.any(String),
      });
    });
  });

  describe('User Identification', () => {
    it('should set user ID', () => {
      setUserId('user123');

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA-TEST-123', {
        user_id: 'user123',
      });
    });

    it('should clear user data on logout', () => {
      clearUser();

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA-TEST-123', {
        user_id: null,
        custom_map: {},
      });
    });
  });

  describe('Conversion Tracking', () => {
    it('should track conversion events', () => {
      trackConversion('booking_completion', {
        value: 50.0,
        currency: 'EUR',
        booking_type: 'tennis',
        conversion_label: 'premium_booking',
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'booking_completion', {
        value: 50.0,
        currency: 'EUR',
        booking_type: 'tennis',
        conversion_label: 'premium_booking',
        event_category: 'conversion',
      });
    });
  });

  describe('Custom Dimensions and Metrics', () => {
    it('should set custom dimensions', () => {
      setCustomDimension(1, 'mobile_app');

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA-TEST-123', {
        custom_dimension_1: 'mobile_app',
      });
    });

    it('should track custom metrics', () => {
      trackCustomMetric('session_duration', 1800);

      expect(mockGtag).toHaveBeenCalledWith('event', 'custom_metric', {
        event_category: 'metric',
        event_label: 'session_duration',
        value: 1800,
      });
    });
  });

  describe('Session Management', () => {
    it('should track session start', () => {
      startSession();

      expect(mockGtag).toHaveBeenCalledWith('event', 'session_start', {
        event_category: 'session',
      });
    });

    it('should track session end with duration', () => {
      endSession(1800);

      expect(mockGtag).toHaveBeenCalledWith('event', 'session_end', {
        event_category: 'session',
        value: 1800,
      });
    });
  });

  describe('Privacy and Consent', () => {
    it('should respect consent settings', () => {
      setConsent({
        analytics_storage: 'granted',
        ad_storage: 'denied',
      });

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
      });
    });

    it('should enable/disable tracking based on consent', () => {
      setTrackingEnabled(false);

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'denied',
      });

      vi.clearAllMocks();

      setTrackingEnabled(true);

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted',
      });
    });
  });
});
