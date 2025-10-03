/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals and custom performance metrics
 */

import analyticsModule from './analytics';

// Web Vitals thresholds (Google recommendations)
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 }
};

// Performance monitoring state
let performanceData = {
  navigationStart: performance.timeOrigin,
  metrics: {},
  customMetrics: {},
  resources: [],
  errors: []
};

/**
 * Initialize Web Vitals monitoring
 */
export const initWebVitals = () => {

  
  // Modern browsers with web-vitals library (if available)
  if (typeof window !== 'undefined' && window.webVitals) {
    initModernWebVitals();
  } else {
    // Fallback to manual tracking
    initManualWebVitals();
  }
  
  // Track custom performance metrics
  trackCustomMetrics();
  
  // Monitor resource loading
  trackResourcePerformance();
  
  // Track JavaScript errors impact on performance
  trackPerformanceErrors();
  
  // Send initial performance report
  setTimeout(() => {
    sendPerformanceReport();
  }, 5000);
};

/**
 * Modern Web Vitals tracking using web-vitals library
 */
const initModernWebVitals = () => {
  try {
    // Core Web Vitals
    webVitals.getCLS(onCLS);
    webVitals.getFID(onFID);
    webVitals.getFCP(onFCP);
    webVitals.getLCP(onLCP);
    webVitals.getTTFB(onTTFB);
    
    console.log('✅ Modern Web Vitals tracking enabled');
  } catch (error) {
    console.warn('⚠️ Web Vitals library not available, using manual tracking');
    initManualWebVitals();
  }
};

/**
 * Manual Web Vitals tracking for compatibility
 */
const initManualWebVitals = () => {
  // First Contentful Paint (FCP)
  if ('PerformancePaintTiming' in window) {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      onFCP({ name: 'FCP', value: fcpEntry.startTime, delta: fcpEntry.startTime });
    }
  }

  // Largest Contentful Paint (LCP) - approximation
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          onLCP({ name: 'LCP', value: lastEntry.startTime, delta: lastEntry.startTime });
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP observation not supported');
    }
  }

  // First Input Delay (FID) - approximation
  const handleFirstInput = (event) => {
    const fid = performance.now() - event.timeStamp;
    onFID({ name: 'FID', value: fid, delta: fid });
    
    // Remove listener after first input
    ['keydown', 'click', 'touchstart'].forEach(type => {
      document.removeEventListener(type, handleFirstInput, { passive: true });
    });
  };

  ['keydown', 'click', 'touchstart'].forEach(type => {
    document.addEventListener(type, handleFirstInput, { passive: true });
  });

  // Cumulative Layout Shift (CLS) - basic implementation
  if ('PerformanceObserver' in window) {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        onCLS({ name: 'CLS', value: clsValue, delta: clsValue });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS observation not supported');
    }
  }

  console.log('✅ Manual Web Vitals tracking enabled');
};

/**
 * Web Vitals event handlers
 */
const onCLS = (metric) => {
  performanceData.metrics.CLS = metric;
  trackVitalMetric('CLS', metric.value);
};

const onFID = (metric) => {
  performanceData.metrics.FID = metric;
  trackVitalMetric('FID', metric.value);
};

const onFCP = (metric) => {
  performanceData.metrics.FCP = metric;
  trackVitalMetric('FCP', metric.value);
};

const onLCP = (metric) => {
  performanceData.metrics.LCP = metric;
  trackVitalMetric('LCP', metric.value);
};

const onTTFB = (metric) => {
  performanceData.metrics.TTFB = metric;
  trackVitalMetric('TTFB', metric.value);
};

/**
 * Track individual vital metric
 */
const trackVitalMetric = (name, value) => {
  const threshold = VITALS_THRESHOLDS[name];
  let rating = 'good';
  
  if (threshold) {
    if (value > threshold.poor) {
      rating = 'poor';
    } else if (value > threshold.good) {
      rating = 'needs-improvement';
    }
  }

  // Send to analytics
  analyticsModule.trackEvent('web_vitals', name.toLowerCase(), {
    value: Math.round(value),
    rating,
    metric_name: name
  });


};

/**
 * Track custom performance metrics
 */
const trackCustomMetrics = () => {
  // DOM Content Loaded time
  document.addEventListener('DOMContentLoaded', () => {
    const domTime = performance.now();
    performanceData.customMetrics.domContentLoaded = domTime;
    
    analyticsModule.trackEvent('performance', 'dom_content_loaded', {
      value: Math.round(domTime)
    });
  });

  // Window load time
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    performanceData.customMetrics.windowLoad = loadTime;
    
    analyticsModule.trackEvent('performance', 'window_load', {
      value: Math.round(loadTime)
    });

    // Track Navigation Timing API metrics
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        trackNavigationTiming(navigation);
      }
    }
  });

  // Track React hydration time (if using React)
  if (window.React) {
    const startTime = performance.now();
    
    // Use React DevTools hook if available
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = (id, root) => {
        const hydrationTime = performance.now() - startTime;
        performanceData.customMetrics.reactHydration = hydrationTime;
        
        analyticsModule.trackEvent('performance', 'react_hydration', {
          value: Math.round(hydrationTime)
        });
      };
    }
  }
};

/**
 * Track Navigation Timing metrics
 */
const trackNavigationTiming = (navigation) => {
  const metrics = {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ssl: navigation.secureConnectionStart > 0 ? navigation.connectEnd - navigation.secureConnectionStart : 0,
    ttfb: navigation.responseStart - navigation.navigationStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.navigationStart,
    domComplete: navigation.domComplete - navigation.navigationStart
  };

  Object.entries(metrics).forEach(([name, value]) => {
    performanceData.customMetrics[name] = value;
    
    analyticsModule.trackEvent('navigation_timing', name, {
      value: Math.round(value)
    });
  });


};

/**
 * Track resource loading performance
 */
const trackResourcePerformance = () => {
  if (!performance.getEntriesByType) return;

  const trackResources = () => {
    const resources = performance.getEntriesByType('resource');
    const newResources = resources.slice(performanceData.resources.length);
    
    newResources.forEach(resource => {
      const duration = resource.responseEnd - resource.requestStart;
      const size = resource.transferSize || 0;
      
      performanceData.resources.push({
        name: resource.name,
        type: resource.initiatorType,
        duration: duration,
        size: size,
        timestamp: resource.startTime
      });

      // Track slow resources
      if (duration > 1000) {
        analyticsModule.trackEvent('performance', 'slow_resource', {
          resource_type: resource.initiatorType,
          duration: Math.round(duration),
          size: size,
          resource_name: resource.name.split('/').pop()
        });
      }
    });
  };

  // Track initial resources
  setTimeout(trackResources, 2000);
  
  // Track resources loaded dynamically
  const observer = new PerformanceObserver((list) => {
    trackResources();
  });
  
  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch (error) {
    console.warn('Resource performance observation not supported');
  }
};

/**
 * Track performance impact of JavaScript errors
 */
const trackPerformanceErrors = () => {
  const originalConsoleError = console.error;
  
  console.error = (...args) => {
    const errorTime = performance.now();
    performanceData.errors.push({
      message: args.join(' '),
      timestamp: errorTime
    });
    
    analyticsModule.trackEvent('performance', 'js_error', {
      timestamp: Math.round(errorTime),
      error_count: performanceData.errors.length
    });
    
    originalConsoleError.apply(console, args);
  };

  // Track unhandled errors
  window.addEventListener('error', (event) => {
    const errorTime = performance.now();
    performanceData.errors.push({
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      timestamp: errorTime
    });
    
    analyticsModule.trackEvent('performance', 'unhandled_error', {
      timestamp: Math.round(errorTime),
      error_count: performanceData.errors.length
    });
  });
};

/**
 * Send comprehensive performance report
 */
const sendPerformanceReport = () => {
  const report = {
    vitals: performanceData.metrics,
    custom: performanceData.customMetrics,
    resources: {
      total: performanceData.resources.length,
      slow_count: performanceData.resources.filter(r => r.duration > 1000).length,
      total_size: performanceData.resources.reduce((sum, r) => sum + r.size, 0)
    },
    errors: {
      count: performanceData.errors.length,
      recent: performanceData.errors.slice(-5)
    },
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    connection: navigator.connection ? {
      effective_type: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : null
  };

  // Send summary to analytics
  analyticsModule.trackEvent('performance', 'summary_report', {
    vitals_count: Object.keys(report.vitals).length,
    resource_count: report.resources.total,
    error_count: report.errors.count,
    total_size_mb: Math.round(report.resources.total_size / (1024 * 1024) * 100) / 100
  });


  
  return report;
};

/**
 * Get current performance data
 */
export const getPerformanceData = () => {
  return performanceData;
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = () => {
  return sendPerformanceReport();
};

/**
 * Track Service Worker performance metrics
 */
export const trackServiceWorkerMetrics = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.type === 'PERFORMANCE_METRICS') {
        const metrics = event.data.data;
        
        analyticsModule.trackEvent('service_worker', 'performance_metrics', {
          cache_hit_ratio: metrics.cacheHitRatio,
          cache_hits: metrics.cacheHits,
          cache_misses: metrics.cacheMisses,
          network_requests: metrics.networkRequests,
          offline_requests: metrics.offlineRequests,
          runtime_minutes: Math.round(metrics.runtime / (1000 * 60))
        });


      }
    };

    navigator.serviceWorker.controller.postMessage(
      { type: 'GET_PERFORMANCE_METRICS' },
      [messageChannel.port2]
    );
  }
};

// Auto-track SW metrics every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(trackServiceWorkerMetrics, 5 * 60 * 1000);
}

export default {
  initWebVitals,
  getPerformanceData,
  getPerformanceSummary,
  trackServiceWorkerMetrics
};
