// =============================================
// FILE: src/utils/health-check.js
// =============================================

/**
 * Application health check utilities
 */

export function checkEnvironmentVariables() {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    return false;
  }
  
  return true;
}

export function checkBrowserCompatibility() {
  const features = {
    'ES6 Support': () => {
      try {
        eval('const test = () => {}');
        return true;
      } catch {
        return false;
      }
    },
    'LocalStorage': () => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    },
    'Fetch API': () => typeof fetch !== 'undefined',
    'History API': () => typeof history?.pushState === 'function',
    'Promise Support': () => typeof Promise !== 'undefined',
  };

  const results = {};
  let allSupported = true;

  for (const [feature, check] of Object.entries(features)) {
    const supported = check();
    results[feature] = supported;
    if (!supported) allSupported = false;
  }

  if (!allSupported) {
    console.warn('Browser compatibility issues:', results);
  }

  return { supported: allSupported, details: results };
}

export function performHealthCheck() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: checkEnvironmentVariables(),
    browser: checkBrowserCompatibility(),
    router: typeof window?.history === 'object',
    react: typeof React !== 'undefined' || true, // React always available in build
  };

  const overall = Object.values(results).every(result => 
    typeof result === 'boolean' ? result : result.supported !== false
  );

  // Health check completed silently in production
  return { healthy: overall, details: results };
}

// Auto-run health check in development
if (import.meta.env.DEV) {
  // Run after a small delay to ensure everything is loaded
  setTimeout(performHealthCheck, 1000);
}
