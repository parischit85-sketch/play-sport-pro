// =============================================
// FILE: src/test/utils.jsx
// TESTING UTILITIES AND HELPERS
// =============================================

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// =============================================
// MOCK DATA GENERATORS
// =============================================

export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  ...overrides,
});

export const createMockBooking = (overrides = {}) => ({
  id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  courtType: 'padel',
  date: '2025-09-21',
  time: '10:00',
  endTime: '11:00',
  status: 'confirmed',
  bookedBy: 'Test User',
  userEmail: 'test@example.com',
  createdBy: 'test-user-123',
  createdAt: { seconds: Date.now() / 1000 },
  updatedAt: { seconds: Date.now() / 1000 },
  players: ['Test User', 'Partner'],
  clubId: 'sporting-cat',
  ...overrides,
});

export const createMockMatch = (overrides = {}) => ({
  id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  homePlayer: createMockUser({ displayName: 'Home Player' }),
  awayPlayer: createMockUser({ displayName: 'Away Player' }),
  homeScore: 0,
  awayScore: 0,
  status: 'scheduled',
  date: '2025-09-21',
  time: '10:00',
  court: 'Court 1',
  category: 'singles',
  createdAt: { seconds: Date.now() / 1000 },
  ...overrides,
});

export const createMockClub = (overrides = {}) => ({
  id: 'test-club-123',
  name: 'Test Club',
  description: 'A test club for unit testing',
  location: {
    address: '123 Test Street',
    city: 'Test City',
    country: 'Test Country',
  },
  isActive: true,
  memberCount: 10,
  createdAt: { seconds: Date.now() / 1000 },
  ...overrides,
});

// =============================================
// MOCK CONTEXTS
// =============================================

export const createMockAuthContext = (overrides = {}) => ({
  user: createMockUser(),
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
  userRole: 'user',
  isAdmin: false,
  ...overrides,
});

export const createMockUIContext = (overrides = {}) => ({
  darkMode: false,
  toggleDarkMode: vi.fn(),
  isMobile: false,
  notification: null,
  showNotification: vi.fn(),
  hideNotification: vi.fn(),
  loading: false,
  setLoading: vi.fn(),
  ...overrides,
});

export const createMockSecurityContext = (overrides = {}) => ({
  threatLevel: 'low',
  alerts: [],
  sessionStatus: 'active',
  dismissAlert: vi.fn(),
  reportSuspiciousActivity: vi.fn(),
  ...overrides,
});

// =============================================
// CUSTOM RENDER FUNCTIONS
// =============================================

// AuthContext mock provider
const MockAuthProvider = ({ children, value = createMockAuthContext() }) => {
  return <div data-testid="mock-auth-provider">{children}</div>;
};

// UIContext mock provider
const MockUIProvider = ({ children, value = createMockUIContext() }) => {
  return <div data-testid="mock-ui-provider">{children}</div>;
};

// Custom render with providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    authContextValue = createMockAuthContext(),
    uiContextValue = createMockUIContext(),
    routerOptions = {},
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter {...routerOptions}>
      <MockAuthProvider value={authContextValue}>
        <MockUIProvider value={uiContextValue}>{children}</MockUIProvider>
      </MockAuthProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Render with router only
export const renderWithRouter = (ui, options = {}) => {
  const { routerOptions = {}, ...renderOptions } = options;

  const Wrapper = ({ children }) => <BrowserRouter {...routerOptions}>{children}</BrowserRouter>;

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// =============================================
// MOCK FIREBASE OPERATIONS
// =============================================

export const mockFirestoreData = {
  users: new Map(),
  bookings: new Map(),
  matches: new Map(),
  clubs: new Map(),
};

export const createMockFirestoreOperations = () => {
  const mockCollection = (collectionName) => ({
    add: vi.fn(),
    doc: vi.fn(),
    get: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  });

  const mockDoc = (data = {}) => ({
    get: vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => data,
      id: 'mock-doc-id',
    }),
    set: vi.fn().mockResolvedValue(),
    update: vi.fn().mockResolvedValue(),
    delete: vi.fn().mockResolvedValue(),
    onSnapshot: vi.fn(),
  });

  return {
    collection: mockCollection,
    doc: mockDoc,
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn().mockResolvedValue({
      docs: [],
      size: 0,
      empty: true,
    }),
    getDoc: vi.fn().mockResolvedValue({
      exists: () => false,
      data: () => null,
    }),
  };
};

// =============================================
// TEST HELPERS
// =============================================

export const waitForLoadingToFinish = async () => {
  // Wait for any async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 0));
};

export const simulateNetworkDelay = (ms = 100) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const createMockFormData = (fields = {}) => {
  const defaultFields = {
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    name: 'Test User',
  };

  return { ...defaultFields, ...fields };
};

export const mockLocalStorage = () => {
  const store = new Map();

  return {
    getItem: vi.fn((key) => store.get(key) || null),
    setItem: vi.fn((key, value) => store.set(key, value)),
    removeItem: vi.fn((key) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    length: store.size,
  };
};

export const mockSessionStorage = mockLocalStorage;

// =============================================
// ASSERTION HELPERS
// =============================================

export const expectElementToBeVisible = (element) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element, text) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(text);
};

export const expectButtonToBeDisabled = (button) => {
  expect(button).toBeInTheDocument();
  expect(button).toBeDisabled();
};

export const expectButtonToBeEnabled = (button) => {
  expect(button).toBeInTheDocument();
  expect(button).toBeEnabled();
};

export const expectFormFieldToHaveError = (field, errorMessage) => {
  expect(field).toBeInTheDocument();
  expect(field).toBeInvalid();
  if (errorMessage) {
    const errorElement = field.closest('div').querySelector('[role="alert"]');
    expect(errorElement).toHaveTextContent(errorMessage);
  }
};

// =============================================
// PERFORMANCE TESTING HELPERS
// =============================================

export const measureRenderTime = async (renderFn) => {
  const start = performance.now();
  const result = await renderFn();
  const end = performance.now();

  return {
    result,
    renderTime: end - start,
  };
};

export const createPerformanceObserver = () => {
  const entries = [];

  const observer = {
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => entries),
  };

  return { observer, entries };
};

// =============================================
// EXPORT ALL UTILITIES
// =============================================

export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { vi } from 'vitest';

