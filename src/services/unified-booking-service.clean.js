// =============================================
// FILE: src/services/unified-booking-service.js
// SERVIZIO UNIFICATO PER TUTTE LE PRENOTAZIONI
// =============================================
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  deleteField,
} from 'firebase/firestore';
import { db } from './firebase.js';

// =============================================
// CONSTANTS
// =============================================
const STORAGE_KEY = 'unified-bookings';
const COLLECTIONS = {
  BOOKINGS: 'bookings',
};

const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
};

const BOOKING_TYPES = {
  COURT: 'court',
  LESSON: 'lesson',
};

// =============================================
// GLOBAL STATE MANAGEMENT
// =============================================
let useCloudStorage = false;
let currentUser = null;
let bookingCache = new Map();
let subscriptions = new Map();
// Initialization & migration guards
const MIGRATION_FLAG_KEY = 'unified-bookings-migration-done-v1';
let initialized = false;
let migrationInProgress = false;
let pendingSyncTimeout = null;

// Event emitter per notifiche real-time
const eventListeners = new Map();

function emit(event, data) {
  const listeners = eventListeners.get(event) || [];
  listeners.forEach((callback) => callback(data));
}

export function addEventListener(event, callback) {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, []);
  }
  eventListeners.get(event).push(callback);

  // Return unsubscribe function
  return () => {
    const listeners = eventListeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
}

// =============================================
// CONFIGURATION
// =============================================
export function initialize(options = {}) {
  if (initialized) {
    console.log('⚠️ Unified Booking Service already initialized');
    return;
  }

  initialized = true; // Mark as initialized to prevent multiple calls
  useCloudStorage = options.cloudEnabled || false;
  currentUser = options.user || null;

  console.log('🔧 Unified Booking Service initialized:', {
    cloudEnabled: useCloudStorage,
    hasUser: !!currentUser,
  });

  if (useCloudStorage) {
    setupRealtimeSubscriptions();
    // One-time migration, then sync
    if (!localStorage.getItem(MIGRATION_FLAG_KEY)) {
      migrationInProgress = true;
      migrateOldData()
        .catch((e) => console.warn('Migration failed:', e))
        .finally(() => {
          localStorage.setItem(MIGRATION_FLAG_KEY, '1');
          migrationInProgress = false;
          scheduleSync(300);
        });
    } else {
      scheduleSync(300);
    }
  }
  initialized = true;
}

function setupRealtimeSubscriptions() {
  if (subscriptions.has('public')) return; // Already subscribed

  try {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('status', '!=', 'cancelled'),
      orderBy('status'),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map((d) => {
        const raw = d.data() || {};
        // Preserve legacy custom id (stored previously inside document data as 'id')
        const legacyId = raw.id && raw.id !== d.id ? raw.id : undefined;
        // Avoid overwriting Firestore doc.id with embedded raw.id
        const { id: _discardId, ...rest } = raw; // eslint-disable-line no-unused-vars
        return {
          ...rest,
          id: d.id, // Canonical identifier
          legacyId, // Optional: useful for debugging / future migration
          createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt,
          updatedAt: raw.updatedAt?.toDate?.()?.toISOString() || raw.updatedAt,
        };
      });

      bookingCache.set('public', bookings);
      emit('bookingsUpdated', { type: 'public', bookings });
    });

    subscriptions.set('public', unsubscribe);
  } catch (error) {
    console.warn('Real-time subscriptions not available:', error);
  }
}

// =============================================
// CORE BOOKING OPERATIONS
// =============================================

/**
 * Create a new booking (court or lesson)
 */
export async function createBooking(bookingData, user, options = {}) {
  if (bookingData.time) bookingData.time = normalizeTime(bookingData.time);
  const booking = {
    id: options.id || generateBookingId(),
    type: bookingData.type || BOOKING_TYPES.COURT,

    // Court/Lesson details
    courtId: bookingData.courtId,
    courtName: bookingData.courtName,
    date: bookingData.date,
    time: bookingData.time,
    duration: bookingData.duration || 60,

    // Court amenities
    lighting: bookingData.lighting || false,
    heating: bookingData.heating || false,
    price: bookingData.price || 0,

    // User details
    bookedBy: user?.displayName || user?.email || 'Anonimo',
    userEmail: user?.email,
    userPhone: bookingData.userPhone || '',
    players: bookingData.players || [],
    notes: bookingData.notes || '',

    // Lesson-specific fields
    instructorId: bookingData.instructorId,
    instructorName: bookingData.instructorName,
    lessonType: bookingData.lessonType,
    isLessonBooking: bookingData.isLessonBooking || false,
    courtBookingId: bookingData.courtBookingId, // Reference to associated court booking

    // Metadata
    status: BOOKING_STATUS.CONFIRMED,
    createdBy: user?.uid || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let result;

  if (useCloudStorage && user) {
    try {
      result = await createCloudBooking(booking);
    } catch (error) {
      console.warn('Cloud creation failed, using local storage:', error);
      result = createLocalBooking(booking);
    }
  } else {
    result = createLocalBooking(booking);
  }

  // Emit event for real-time updates
  emit('bookingCreated', result);

  console.log('✅ Booking created:', result);
  return result;
}

/**
 * Update an existing booking
 */
export async function updateBooking(bookingId, updates, user) {
  if (updates.time) updates.time = normalizeTime(updates.time);
  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: user?.uid || null,
  };

  let result;

  if (useCloudStorage && user) {
    try {
      result = await updateCloudBooking(bookingId, updateData);
    } catch (error) {
      // Solo errori non-attesi vengono mostrati come warning
      const isExpectedError =
        error.code === 'not-found' ||
        error.message.includes('No document to update') ||
        error.message.includes('Document does not exist');

      if (!isExpectedError) {
        console.warn('Cloud update failed, using local storage:', error);
      } else {
        console.debug('📝 Document not found in cloud, using local storage fallback');
      }
      result = updateLocalBooking(bookingId, updateData);
    }
  } else {
    result = updateLocalBooking(bookingId, updateData);
  }

  if (result) {
    emit('bookingUpdated', { id: bookingId, booking: result });
  }

  return result;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId, user) {
  return updateBooking(
    bookingId,
    {
      status: BOOKING_STATUS.CANCELLED,
      cancelledAt: new Date().toISOString(),
      cancelledBy: user?.uid || null,
    },
    user
  );
}

/**
 * Delete a booking permanently (admin only)
 */
export async function deleteBooking(bookingId, user) {
  console.log(
    '🗑️ DELETE BOOKING called:',
    bookingId,
    'user:',
    !!user,
    'cloudStorage:',
    useCloudStorage
  );

  if (useCloudStorage && user) {
    try {
      console.log('🔥 Attempting cloud deletion...');
      await deleteCloudBooking(bookingId);
      console.log('✅ Cloud deletion successful');
      scheduleSync(400);
    } catch (error) {
      console.warn('Cloud deletion failed, using local storage:', error);
      deleteLocalBooking(bookingId);
    }
  } else {
    console.log('💾 Using local storage deletion...');
    deleteLocalBooking(bookingId);
  }

  emit('bookingDeleted', { id: bookingId });
  console.log('🗑️ Booking deleted:', bookingId);
}

// =============================================
// DATA RETRIEVAL
// =============================================

/**
 * Get all public bookings (for availability checking)
 */
export async function getPublicBookings(options = {}) {
  const { forceRefresh = false, includeLesson = true } = options;

  if (!forceRefresh && bookingCache.has('public')) {
    let cached = bookingCache.get('public');
    if (!includeLesson) {
      cached = cached.filter((b) => !b.isLessonBooking);
    }
    return cached;
  }

  let bookings = [];

  if (useCloudStorage) {
    try {
      bookings = await loadCloudBookings();
    } catch (error) {
      console.warn('Cloud loading failed, using local storage:', error);
      bookings = loadLocalBookings();
    }
  } else {
    bookings = loadLocalBookings();
  }

  // Filter out cancelled bookings for public view
  bookings = bookings.filter((b) => b.status !== BOOKING_STATUS.CANCELLED);

  if (!includeLesson) {
    bookings = bookings.filter((b) => !b.isLessonBooking);
  }

  bookingCache.set('public', bookings);
  return bookings;
}

/**
 * Get user's bookings
 */
export async function getUserBookings(user, options = {}) {
  if (!user) return [];

  const { includeHistory = false, includeCancelled = false, lessonOnly = false } = options;

  const allBookings = await getPublicBookings({ forceRefresh: true });

  let userBookings = allBookings.filter(
    (booking) => booking.userEmail === user.email || booking.createdBy === user.uid
  );

  if (lessonOnly) {
    userBookings = userBookings.filter((b) => b.isLessonBooking);
  }

  if (!includeCancelled) {
    userBookings = userBookings.filter((b) => b.status !== BOOKING_STATUS.CANCELLED);
  }

  if (!includeHistory) {
    const today = new Date().toISOString().split('T')[0];
    userBookings = userBookings.filter((b) => b.date >= today);
  }

  return userBookings.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
}

/**
 * Get lesson bookings specifically
 */
export async function getLessonBookings(user = null) {
  if (user) {
    return getUserBookings(user, { lessonOnly: true });
  }

  const allBookings = await getPublicBookings();
  return allBookings.filter((b) => b.isLessonBooking);
}

// =============================================
// CLOUD STORAGE OPERATIONS
// =============================================
async function createCloudBooking(booking) {
  // We previously stored booking.id inside document data, overwriting Firestore doc.id in readers.
  // Now we treat Firestore doc.id as canonical and keep the client generated id only as legacyId.
  const { id: clientGeneratedId, ...rest } = booking;

  // Clean undefined fields before sending to Firestore
  const cleanedData = cleanBookingData({
    ...rest,
    legacyId: clientGeneratedId, // keep for traceability (do NOT name it 'id')
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const docRef = await addDoc(collection(db, COLLECTIONS.BOOKINGS), cleanedData);
  return {
    ...rest,
    id: docRef.id,
    legacyId: clientGeneratedId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function updateCloudBooking(bookingId, updates) {
  const docRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);

  try {
    // Clean undefined fields before sending to Firestore
    const cleanedUpdates = cleanBookingData({
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Try to update the document
    await updateDoc(docRef, cleanedUpdates);
  } catch (error) {
    // If document doesn't exist, try to create it from local data
    if (error.code === 'not-found') {
      const bookings = loadLocalBookings();
      const localBooking = bookings.find((b) => b.id === bookingId);

      if (localBooking) {
        // Create the document with the local data plus updates
        await setDoc(docRef, {
          ...localBooking,
          ...updates,
          createdAt: localBooking.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        throw error; // Re-throw if we can't find the local booking either
      }
    } else {
      throw error; // Re-throw other errors
    }
  }

  // Get updated booking
  const bookings = loadLocalBookings();
  const updated = bookings.find((b) => b.id === bookingId);
  return updated ? { ...updated, ...updates } : null;
}

async function deleteCloudBooking(bookingId) {
  const docRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.warn('⚠️ deleteCloudBooking: document not found', bookingId);
      return;
    }
  } catch (e) {
    console.warn('⚠️ deleteCloudBooking getDoc failed (continuing):', e?.message);
  }
  await deleteDoc(docRef);
}

async function loadCloudBookings() {
  const q = query(
    collection(db, COLLECTIONS.BOOKINGS),
    orderBy('date', 'asc'),
    orderBy('time', 'asc')
  );

  const snapshot = await getDocs(q);
  const allBookings = snapshot.docs.map((d) => {
    const raw = d.data() || {};
    const legacyId = raw.id && raw.id !== d.id ? raw.id : raw.legacyId; // support both old & new storage
    const rest = { ...raw };
    delete rest.id; // remove conflicting embedded id field
    return {
      ...rest,
      id: d.id,
      legacyId,
      createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt,
      updatedAt: raw.updatedAt?.toDate?.()?.toISOString() || raw.updatedAt,
    };
  });

  console.log(`📥 Loaded ${allBookings.length} bookings from cloud`);

  const activeBookings = allBookings.filter((booking) => {
    const status = booking.status || BOOKING_STATUS.CONFIRMED;
    const isActive = status !== BOOKING_STATUS.CANCELLED;
    if (!isActive && Math.random() < 0.3) {
      // Log only ~30% of cancelled bookings to reduce noise
      console.log(`🗑️ Filtering out cancelled booking:`, booking.id, booking.status);
    }
    return isActive;
  });

  console.log(`✅ Returning ${activeBookings.length} active bookings from cloud`);
  return activeBookings;
}

// Raw loader including cancelled (admin use)
async function loadCloudBookingsRaw() {
  const q = query(
    collection(db, COLLECTIONS.BOOKINGS),
    orderBy('date', 'asc'),
    orderBy('time', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const raw = d.data() || {};
    const legacyId = raw.id && raw.id !== d.id ? raw.id : raw.legacyId;
    const rest = { ...raw };
    delete rest.id;
    return {
      ...rest,
      id: d.id,
      legacyId,
      createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt,
      updatedAt: raw.updatedAt?.toDate?.()?.toISOString() || raw.updatedAt,
    };
  });
}

// =============================================
// LOCAL STORAGE OPERATIONS
// =============================================
function createLocalBooking(booking) {
  const bookings = loadLocalBookings();
  bookings.push(booking);
  saveLocalBookings(bookings);
  return booking;
}

function updateLocalBooking(bookingId, updates) {
  const bookings = loadLocalBookings();
  const index = bookings.findIndex((b) => b.id === bookingId);

  if (index === -1) return null;

  const updated = { ...bookings[index], ...updates };
  bookings[index] = updated;
  saveLocalBookings(bookings);

  return updated;
}

function deleteLocalBooking(bookingId) {
  // Carica TUTTE le prenotazioni (senza filtri) per poterle eliminare
  const saved = localStorage.getItem(STORAGE_KEY);
  const allBookings = saved ? JSON.parse(saved) : [];
  console.log(`🗑️ Deleting booking ${bookingId} from ${allBookings.length} total bookings`);

  const filtered = allBookings.filter((b) => b.id !== bookingId);
  console.log(`🗑️ After deletion: ${filtered.length} bookings remain`);

  // Salva direttamente (saveLocalBookings applicherà i suoi filtri)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  localStorage.setItem('ml-field-bookings', JSON.stringify(filtered));

  // Clear cache to force refresh
  bookingCache.clear();
}

function loadLocalBookings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const allBookings = saved ? JSON.parse(saved) : [];
    console.log(`📥 Loaded ${allBookings.length} bookings from localStorage`);

    // Filtra prenotazioni cancellate (considera anche booking senza status come confirmed)
    const activeBookings = allBookings.filter((booking) => {
      const status = booking.status || BOOKING_STATUS.CONFIRMED; // Default a confirmed se status mancante
      const isActive = status !== BOOKING_STATUS.CANCELLED;
      if (!isActive) {
        console.log(
          `🗑️ Filtering out cancelled booking from localStorage:`,
          booking.id,
          booking.status
        );
      }
      return isActive;
    });

    console.log(`✅ Returning ${activeBookings.length} active bookings from localStorage`);
    return activeBookings;
  } catch (error) {
    console.error('Error loading bookings from localStorage:', error);
    return [];
  }
}

// Sync localStorage with cloud (debounced externally)
async function syncLocalWithCloud() {
  if (!useCloudStorage || migrationInProgress) return;
  try {
    const cloudBookings = await loadCloudBookings();
    const activeCloudBookings = cloudBookings.filter(
      (b) => (b.status || BOOKING_STATUS.CONFIRMED) !== BOOKING_STATUS.CANCELLED
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeCloudBookings));
  } catch (error) {
    console.warn('⚠️ Could not sync with cloud:', error);
  }
}

function scheduleSync(delay = 500) {
  if (!useCloudStorage) return;
  if (pendingSyncTimeout) clearTimeout(pendingSyncTimeout);
  pendingSyncTimeout = setTimeout(() => {
    syncLocalWithCloud();
  }, delay);
}

function saveLocalBookings(bookings) {
  try {
    // Filtra prenotazioni cancellate prima di salvare (considera anche booking senza status come confirmed)
    const activeBookings = bookings.filter((booking) => {
      const status = booking.status || BOOKING_STATUS.CONFIRMED; // Default a confirmed se status mancante
      return status !== BOOKING_STATUS.CANCELLED;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeBookings));

    // Also sync with old storage keys for backward compatibility
    localStorage.setItem('ml-field-bookings', JSON.stringify(activeBookings));

    // Clear cache to force refresh
    bookingCache.clear();
  } catch (error) {
    console.error('Error saving bookings to localStorage:', error);
  }
}

// =============================================
// MIGRATION & COMPATIBILITY
// =============================================

/**
 * Migrate data from old storage systems
 */
export async function migrateOldData() {
  if (localStorage.getItem(MIGRATION_FLAG_KEY)) {
    console.log('⏭️ Migration already completed');
    return;
  }
  console.log('🔄 Starting data migration...');

  const migrations = [];

  // Migrate from old booking service
  try {
    const oldBookings = localStorage.getItem('ml-field-bookings');
    if (oldBookings) {
      const parsed = JSON.parse(oldBookings);
      migrations.push(...parsed.map((b) => ({ ...b, type: BOOKING_TYPES.COURT })));
    }
  } catch (error) {
    console.warn('Could not migrate old bookings:', error);
  }

  // Migrate lesson bookings
  try {
    const oldLessons =
      localStorage.getItem('lessonBookings') || localStorage.getItem('lesson-bookings');
    if (oldLessons) {
      const parsed = JSON.parse(oldLessons);
      migrations.push(
        ...parsed.map((l) => ({
          ...l,
          type: BOOKING_TYPES.LESSON,
          isLessonBooking: true,
        }))
      );
    }
  } catch (error) {
    console.warn('Could not migrate old lesson bookings:', error);
  }

  if (migrations.length > 0) {
    console.log(`📦 Migrating ${migrations.length} bookings...`);

    // Remove duplicates by ID and filter out cancelled bookings
    const uniqueBookings = migrations.reduce((acc, booking) => {
      const status = booking.status || BOOKING_STATUS.CONFIRMED; // Default a confirmed se status mancante
      if (!acc.some((b) => b.id === booking.id) && status !== BOOKING_STATUS.CANCELLED) {
        acc.push(booking);
      }
      return acc;
    }, []);

    saveLocalBookings(uniqueBookings);

    // Clear old storage
    localStorage.removeItem('lessonBookings');
    localStorage.removeItem('lesson-bookings');

    console.log(`✅ Migrated ${uniqueBookings.length} unique bookings`);
  }

  console.log('✅ Migration completed');
}

/**
 * Clear all data (for testing/cleanup)
 */
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('ml-field-bookings');
  localStorage.removeItem('lessonBookings');
  localStorage.removeItem('lesson-bookings');
  bookingCache.clear();

  emit('dataCleared');
  console.log('🧹 All booking data cleared');
}

// =============================================
// UTILITIES
// =============================================
export function generateBookingId() {
  return `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Clean undefined fields before sending to Firestore
function cleanBookingData(data) {
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export const CONSTANTS = {
  BOOKING_STATUS,
  BOOKING_TYPES,
};

// =============================================
// DIAGNOSTICS (TEMPORARY ADMIN UTILS)
// =============================================
async function auditIdConsistency() {
  if (!useCloudStorage) {
    console.log('🧪 auditIdConsistency: cloud disabled');
    return { cloud: false };
  }
  try {
    const q = query(collection(db, COLLECTIONS.BOOKINGS));
    const snapshot = await getDocs(q);
    const mismatches = [];
    snapshot.docs.forEach((d) => {
      const raw = d.data() || {};
      if (raw.id && raw.id !== d.id) {
        mismatches.push({ docId: d.id, embeddedId: raw.id });
      }
    });
    console.log(`🧪 auditIdConsistency: ${mismatches.length} mismatches found`, mismatches);
    return { count: mismatches.length, mismatches };
  } catch (e) {
    console.warn('auditIdConsistency failed:', e);
    return { error: e.message };
  }
}

async function cleanupLegacyIds() {
  if (!useCloudStorage) {
    console.log('🧪 cleanupLegacyIds: cloud disabled');
    return { cloud: false };
  }
  try {
    const q = query(collection(db, COLLECTIONS.BOOKINGS));
    const snapshot = await getDocs(q);
    let patched = 0;
    for (const d of snapshot.docs) {
      const raw = d.data() || {};
      if (raw.id && raw.id !== d.id) {
        try {
          await updateDoc(d.ref, { legacyId: raw.id, id: deleteField() });
          patched++;
        } catch (e) {
          console.warn('Failed to patch legacy id for', d.id, e.message);
        }
      }
    }
    console.log(`🧪 cleanupLegacyIds: patched ${patched} documents`);
    return { patched };
  } catch (e) {
    console.warn('cleanupLegacyIds failed:', e);
    return { error: e.message };
  }
}

async function getAllBookingsAdmin() {
  if (useCloudStorage) {
    try {
      return await loadCloudBookingsRaw();
    } catch (e) {
      console.warn('getAllBookingsAdmin cloud failed, fallback local:', e);
    }
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// =============================================
// WRAPPERS (COMPATIBILITA' CON VECCHIO CLOUD SERVICE)
// =============================================
// NOTE: Preferire l'uso diretto di getUserBookings dove possibile. Queste funzioni
// replicano le API precedenti (loadActiveUserBookings, loadBookingHistory, loadBookingsForPlayer)
// per facilitare la migrazione graduale verso il servizio unificato.

async function _getActiveUserBookings(userId) {
  if (!userId) return [];
  const today = new Date().toISOString().split('T')[0];
  if (!useCloudStorage) {
    // Fallback locale: usa getUserBookings filtrando data >= today
    const pseudoUser = { uid: userId };
    const bookings = await getUserBookings(pseudoUser, {
      includeHistory: true,
      includeCancelled: false,
    });
    return bookings.filter(
      (b) => b.date >= today && (b.status || BOOKING_STATUS.CONFIRMED) === BOOKING_STATUS.CONFIRMED
    );
  }
  try {
    const qActive = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('createdBy', '==', userId),
      where('status', '==', BOOKING_STATUS.CONFIRMED),
      where('date', '>=', today),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );
    const snap = await getDocs(qActive);
    return snap.docs.map((d) => {
      const raw = d.data() || {};
      const legacyId = raw.id && raw.id !== d.id ? raw.id : raw.legacyId;
      const rest = { ...raw };
      delete rest.id;
      return {
        ...rest,
        id: d.id,
        legacyId,
        createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt,
        updatedAt: raw.updatedAt?.toDate?.()?.toISOString() || raw.updatedAt,
      };
    });
  } catch (e) {
    console.warn('getActiveUserBookings failed, fallback local:', e.message);
    const pseudoUser = { uid: userId };
    return getUserBookings(pseudoUser, {
      includeHistory: true,
      includeCancelled: false,
    });
  }
}

async function _getUserBookingHistory(userId) {
  if (!userId) return [];
  const today = new Date().toISOString().split('T')[0];
  if (!useCloudStorage) {
    const pseudoUser = { uid: userId };
    const bookings = await getUserBookings(pseudoUser, {
      includeHistory: true,
      includeCancelled: true,
    });
    return bookings
      .filter((b) => b.date < today)
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }
  try {
    const qHistory = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('createdBy', '==', userId),
      where('date', '<', today),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );
    const snap = await getDocs(qHistory);
    return snap.docs.map((d) => {
      const raw = d.data() || {};
      const legacyId = raw.id && raw.id !== d.id ? raw.id : raw.legacyId;
      const rest = { ...raw };
      delete rest.id;
      return {
        ...rest,
        id: d.id,
        legacyId,
        createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt,
        updatedAt: raw.updatedAt?.toDate?.()?.toISOString() || raw.updatedAt,
      };
    });
  } catch (e) {
    console.warn('getUserBookingHistory failed, fallback local:', e.message);
    const pseudoUser = { uid: userId };
    const bookings = await getUserBookings(pseudoUser, {
      includeHistory: true,
      includeCancelled: true,
    });
    return bookings
      .filter((b) => b.date < today)
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }
}

async function _searchBookingsForPlayer({ userId, email, name }) {
  if (!userId && !email && !name) return [];
  if (!useCloudStorage) {
    // Fallback: unione locale limitata
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const data = JSON.parse(saved);
    return data.filter((b) => {
      if (userId && b.createdBy === userId) return true;
      if (email && b.userEmail === email) return true;
      if (name) {
        if (b.bookedBy === name) return true;
        if (
          Array.isArray(b.players) &&
          b.players.some((p) => (typeof p === 'string' ? p : p?.name) === name)
        )
          return true;
      }
      return false;
    });
  }
  try {
    const promises = [];
    if (userId) {
      promises.push(
        getDocs(query(collection(db, COLLECTIONS.BOOKINGS), where('createdBy', '==', userId)))
      );
    }
    if (email) {
      promises.push(
        getDocs(query(collection(db, COLLECTIONS.BOOKINGS), where('userEmail', '==', email)))
      );
    }
    if (name) {
      promises.push(
        getDocs(query(collection(db, COLLECTIONS.BOOKINGS), where('bookedBy', '==', name)))
      );
      // array-contains funziona solo se players è array di stringhe coerenti
      promises.push(
        getDocs(
          query(collection(db, COLLECTIONS.BOOKINGS), where('players', 'array-contains', name))
        )
      );
    }
    const results = await Promise.allSettled(promises);
    const merged = new Map();
    for (const r of results) {
      if (r.status === 'fulfilled') {
        r.value.docs.forEach((d) => {
          const raw = d.data() || {};
          const legacyId = raw.id && raw.id !== d.id ? raw.id : raw.legacyId;
          const rest = { ...raw };
          delete rest.id;
          merged.set(d.id, {
            ...rest,
            id: d.id,
            legacyId,
            createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt,
            updatedAt: raw.updatedAt?.toDate?.()?.toISOString() || raw.updatedAt,
          });
        });
      }
    }
    const list = Array.from(merged.values());
    // Sort by date/time ascending
    list.sort(
      (a, b) =>
        (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || '')
    );
    return list;
  } catch (e) {
    console.warn('searchBookingsForPlayer failed:', e.message);
    return [];
  }
}

// =============================================
// VALIDATION
// =============================================
export function validateBooking(bookingData, existingBookings = []) {
  const errors = [];

  // Basic validation
  if (!bookingData.courtId) errors.push('Campo richiesto');
  if (!bookingData.date) errors.push('Data richiesta');
  if (!bookingData.time) errors.push('Ora richiesta');
  if (!bookingData.duration || bookingData.duration < 30) errors.push('Durata minima 30 minuti');

  // Check for conflicts
  const conflicts = existingBookings.filter(
    (booking) =>
      booking.courtId === bookingData.courtId &&
      booking.date === bookingData.date &&
      booking.status === BOOKING_STATUS.CONFIRMED &&
      timeOverlaps(booking.time, booking.duration, bookingData.time, bookingData.duration)
  );

  if (conflicts.length > 0) {
    errors.push('Orario già occupato');
  }

  return errors;
}

function timeOverlaps(time1, duration1, time2, duration2) {
  const start1 = timeToMinutes(time1);
  const end1 = start1 + duration1;
  const start2 = timeToMinutes(time2);
  const end2 = start2 + duration2;

  return start1 < end2 && start2 < end1;
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function normalizeTime(t) {
  if (!t) return t;
  const match = String(t)
    .trim()
    .match(/^(\d{1,2}):(\d{2})/);
  if (!match) return t;
  const hh = String(Math.min(23, parseInt(match[1], 10))).padStart(2, '0');
  const mm = String(Math.min(59, parseInt(match[2], 10))).padStart(2, '0');
  return `${hh}:${mm}`;
}

// =============================================
// BOOKING SLOT VALIDATION WITH HOLE PREVENTION
// =============================================

/**
 * Check if a booking would create a problematic 30-minute hole
 * WITH EXEMPTION for trapped slots of exactly 120 minutes
 */
export function wouldCreateHalfHourHole(courtId, date, startTime, duration, existingBookings) {
  const bookingStart = timeToMinutes(startTime);
  const bookingEnd = bookingStart + duration;

  // Get bookings for same court and date, sorted by time
  const courtBookings = existingBookings
    .filter(
      (b) =>
        b.courtId === courtId &&
        b.date === date &&
        (b.status || BOOKING_STATUS.CONFIRMED) !== BOOKING_STATUS.CANCELLED
    )
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  // Check for hole after our booking
  const nextBooking = courtBookings.find((b) => timeToMinutes(b.time) > bookingEnd);
  if (nextBooking) {
    const nextStart = timeToMinutes(nextBooking.time);
    const holeSize = nextStart - bookingEnd;

    if (holeSize > 0 && holeSize < 30) {
      // Check EXEMPTION: is this part of a trapped slot of EXACTLY 120 minutes?
      const prevBooking = courtBookings
        .filter((b) => timeToMinutes(b.time) + b.duration <= bookingStart)
        .pop(); // Get the last one before our booking

      if (prevBooking) {
        const prevEnd = timeToMinutes(prevBooking.time) + prevBooking.duration;
        const totalGap = nextStart - prevEnd;

        // EXEMPTION: Only if total gap is EXACTLY 120 minutes
        if (totalGap === 120) {
          console.log(
            `🎯 EXEMPTION applied: exactly ${totalGap}min trapped slot allows ${holeSize}min hole`
          );
          return false;
        }
      }

      return true; // Would create problematic hole without exemption
    }
  }

  // Check for hole before our booking
  const prevBooking = courtBookings
    .filter((b) => timeToMinutes(b.time) + b.duration <= bookingStart)
    .pop();

  if (prevBooking) {
    const prevEnd = timeToMinutes(prevBooking.time) + prevBooking.duration;
    const holeSize = bookingStart - prevEnd;

    if (holeSize > 0 && holeSize < 30) {
      // Check EXEMPTION: is this part of a trapped slot of EXACTLY 120 minutes?
      const nextBooking = courtBookings.find((b) => timeToMinutes(b.time) >= bookingEnd);

      if (nextBooking) {
        const nextStart = timeToMinutes(nextBooking.time);
        const totalGap = nextStart - prevEnd;

        // EXEMPTION: Only if total gap is EXACTLY 120 minutes
        if (totalGap === 120) {
          console.log(
            `🎯 EXEMPTION applied: exactly ${totalGap}min trapped slot allows ${holeSize}min hole`
          );
          return false;
        }
      }

      return true; // Would create problematic hole without exemption
    }
  }

  return false; // No hole would be created
}

/**
 * Check if a time slot would be trapped between bookings
 */
export function isTimeSlotTrapped(courtId, date, startTime, duration, existingBookings) {
  const bookingStart = timeToMinutes(startTime);
  const bookingEnd = bookingStart + duration;

  // Get bookings for same court and date
  const courtBookings = existingBookings
    .filter(
      (b) =>
        b.courtId === courtId &&
        b.date === date &&
        (b.status || BOOKING_STATUS.CONFIRMED) !== BOOKING_STATUS.CANCELLED
    )
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  // Find bookings immediately before and after
  const prevBooking = courtBookings
    .filter((b) => timeToMinutes(b.time) + b.duration <= bookingStart)
    .pop();

  const nextBooking = courtBookings.find((b) => timeToMinutes(b.time) >= bookingEnd);

  // If trapped between two bookings
  if (prevBooking && nextBooking) {
    const prevEnd = timeToMinutes(prevBooking.time) + prevBooking.duration;
    const nextStart = timeToMinutes(nextBooking.time);
    const availableSlot = nextStart - prevEnd;

    // Consider trapped if the available slot is exactly our duration
    // (no room for extension)
    if (availableSlot === duration) {
      return true;
    }
  }

  return false;
}

/**
 * Basic slot availability check (no overlaps)
 */
export function isSlotAvailable(courtId, date, startTime, duration, existingBookings) {
  const bookingStart = timeToMinutes(startTime);
  const bookingEnd = bookingStart + duration;

  // Check for conflicts with existing bookings
  return !existingBookings.some((booking) => {
    if (booking.courtId !== courtId || booking.date !== date) return false;

    // Skip cancelled bookings
    const status = booking.status || BOOKING_STATUS.CONFIRMED;
    if (status === BOOKING_STATUS.CANCELLED) return false;

    const existingStart = timeToMinutes(booking.time);
    const existingEnd = existingStart + booking.duration;

    // Check for overlap
    return bookingStart < existingEnd && bookingEnd > existingStart;
  });
}

/**
 * Enhanced validation that checks availability with hole prevention rules
 */
export function isDurationBookable(courtId, date, startTime, duration, existingBookings) {
  // Basic availability check
  if (!isSlotAvailable(courtId, date, startTime, duration, existingBookings)) {
    return false;
  }

  // Check hole prevention rule (with exemption for exactly 120min trapped slots)
  if (wouldCreateHalfHourHole(courtId, date, startTime, duration, existingBookings)) {
    return false;
  }

  return true;
}

export default {
  initialize,
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getPublicBookings,
  getUserBookings,
  getLessonBookings,
  migrateOldData,
  clearAllData,
  addEventListener,
  validateBooking,
  syncLocalWithCloud,
  // The following utilities are provided via named exports to avoid duplication
  // auditIdConsistency,
  // cleanupLegacyIds,
  // getAllBookingsAdmin,
  CONSTANTS,
};

// Named exports (avoid duplicates with default)
export {
  auditIdConsistency,
  cleanupLegacyIds,
  getAllBookingsAdmin,
  _getActiveUserBookings as getActiveUserBookings,
  _getUserBookingHistory as getUserBookingHistory,
  _searchBookingsForPlayer as searchBookingsForPlayer,
  // Export validation functions
};
