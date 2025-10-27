// =============================================
// FILE: src/test/setup.js
// GLOBAL TEST SETUP AND CONFIGURATION
// =============================================

import '@testing-library/jest-dom';
import { cleanup, fireEvent } from '@testing-library/react';
import { afterEach, vi, beforeAll, afterAll } from 'vitest';

// Provide a lightweight mock for @testing-library/user-event to avoid timing deadlocks
// with fake timers. This mock implements the subset used in our tests and runs synchronously.
vi.mock('@testing-library/user-event', () => {
  return {
    default: {
      // userEvent.setup({ delay, advanceTimers })
      setup: () => {
        return {
          // Basic click implementation using Testing Library's fireEvent
          click: async (element) => {
            if (!element) throw new Error('userEvent.click: element is undefined');
            fireEvent.click(element);
          },
          // Minimal keyboard support for '{Enter}' used in tests
          keyboard: async (seq) => {
            const target = document.activeElement || document.body;
            if (seq && seq.includes('{Enter}')) {
              fireEvent.keyDown(target, { key: 'Enter', code: 'Enter', charCode: 13, keyCode: 13 });
              fireEvent.keyUp(target, { key: 'Enter', code: 'Enter', charCode: 13, keyCode: 13 });
              // Trigger click on focused button to mirror browser behavior
              if (target && target.tagName === 'BUTTON') {
                fireEvent.click(target);
              }
            }
          },
        };
      },
    },
  };
});

// Flag to force toast immediate rendering in tests if detection fails
globalThis.__TEST_FORCE_TOAST_IMMEDIATE__ = true;

// Set up test GA_MEASUREMENT_ID before any modules are imported
globalThis.__TEST_GA_MEASUREMENT_ID__ = 'GA-TEST-123';

// Mock Google Analytics gtag function at module level (before any imports)
const mockGtag = vi.fn();
globalThis.gtag = mockGtag;
if (typeof window !== 'undefined') {
  window.gtag = mockGtag;
  window.dataLayer = window.dataLayer || [];
}

// Mock Firebase modules at the top level
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

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
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
  };
});

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({ app: { name: 'test-app' } })),
  logEvent: vi.fn(),
  isSupported: vi.fn(() => true),
}));

// Mock Firebase Storage to avoid getProvider errors in tests
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({ app: { name: 'test-app' } })),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(async () => 'https://example.com/fake-url'),
}));

// Global test setup
beforeAll(() => {
  // Mock environment variables
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
  vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test-project.firebaseapp.com');
  vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project');
  vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id');
  vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'GA-TEST-123');

  // Mock Web APIs
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
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
  globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock scrollIntoView
  Element.prototype.scrollIntoView = vi.fn();

  // Mock fetch for API calls
  globalThis.fetch = vi.fn();

  // Mock URL.createObjectURL / revokeObjectURL used in download helpers
  if (!globalThis.URL) {
    globalThis.URL = {};
  }
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  globalThis.URL.revokeObjectURL = vi.fn();

  // Mock console methods in tests
  globalThis.console = {
    ...console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };

  // Additional setup continues below
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
