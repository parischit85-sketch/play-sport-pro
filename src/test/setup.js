// =============================================
// FILE: src/test/setup.js
// GLOBAL TEST SETUP AND CONFIGURATION
// =============================================

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeAll, afterAll } from 'vitest';

// Global test setup
beforeAll(() => {
  // Mock environment variables
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
  vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test-project.firebaseapp.com');
  vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project');
  vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id');
  vi.stubEnv('VITE_SENTRY_DSN', 'https://test@sentry.io/test');
  vi.stubEnv('VITE_GOOGLE_ANALYTICS_ID', 'GA-TEST-123');

  // Mock Firebase
  vi.mock('firebase/app', () => ({
    initializeApp: vi.fn(() => ({ name: 'test-app' })),
    getApps: vi.fn(() => []),
    getApp: vi.fn(() => ({ name: 'test-app' })),
  }));

  vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({
      currentUser: null,
      onAuthStateChanged: vi.fn(),
      signInWithPopup: vi.fn(),
      signOut: vi.fn(),
    })),
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    connectAuthEmulator: vi.fn(),
  }));

  vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    initializeFirestore: vi.fn(() => ({ app: { name: 'test-app' } })),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    onSnapshot: vi.fn(),
    serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
    Timestamp: vi.fn(),
    connectFirestoreEmulator: vi.fn(),
    writeBatch: vi.fn(() => ({
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      commit: vi.fn(),
    })),
    runTransaction: vi.fn(),
    enableNetwork: vi.fn(),
    disableNetwork: vi.fn(),
  }));

  // Mock Sentry
  vi.mock('@sentry/react', () => ({
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    addBreadcrumb: vi.fn(),
    setUser: vi.fn(),
    setContext: vi.fn(),
    setTag: vi.fn(),
    configureScope: vi.fn(),
    withScope: vi.fn((cb) => cb({ setTag: vi.fn(), setContext: vi.fn() })),
    getCurrentScope: vi.fn(() => ({
      setTag: vi.fn(),
      setContext: vi.fn(),
      setUser: vi.fn(),
    })),
    ErrorBoundary: ({ children, fallback }) => {
      // Simple mock that just renders children or fallback
      try {
        return children;
      } catch (error) {
        return fallback ? fallback({ error }) : null;
      }
    },
  }));

  // Mock Google Analytics
  vi.mock('../lib/analytics.js', () => ({
    initAnalytics: vi.fn(),
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    trackConversion: vi.fn(),
    trackError: vi.fn(),
    trackPerformance: vi.fn(),
    setUserId: vi.fn(),
    setUserProperties: vi.fn(),
    analytics: {
      isInitialized: true,
      track: vi.fn(),
    },
  }));

  // Mock Web APIs
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock scrollIntoView
  Element.prototype.scrollIntoView = vi.fn();

  // Mock fetch for API calls
  global.fetch = vi.fn();

  // Mock console methods in tests
  global.console = {
    ...console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// Global cleanup
afterAll(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});