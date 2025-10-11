// =============================================
// FILE: src/services/unified-booking-service.js
// SERVIZIO UNIFICATO PER TUTTE LE PRENOTAZIONI
// DEBUG LOGS CLEANED - Updated
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
} from 'firebase/firestore';
import { db } from './firebase.js';
import { invalidateUserBookingsCache } from '@hooks/useBookingPerformance.js';
import {
  emitBookingCreated,
  emitBookingUpdated,
  emitBookingDeleted,
} from '@utils/bookingEvents.js';
import { calculateCertificateStatus } from './medicalCertificates.js';

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
let bookingCache = new Map(); // chiave: `${scope}|${clubId||'all'}`
let subscriptions = new Map();
// Track the current authenticated user for optional cloud ops
let currentUser = null;
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
    return;
  }

  initialized = true; // Mark as initialized to prevent multiple calls
  useCloudStorage = options.cloudEnabled || false;
  currentUser = options.user || null;

  // ClubId non persistito qui: passato per ogni operazione (scelta multi-club)

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

function setupRealtimeSubscriptions(clubId = null) {
  const subKey = `public|${clubId || 'all'}`;
  if (subscriptions.has(subKey)) return; // Already subscribed

  try {
    // Base query
    let qBase = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('status', '!=', 'cancelled'),
      orderBy('status'),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );
    // Se clubId presente, aggiungere filtro clubId (richiede indice Firestore)
    if (clubId) {
      // Firestore non consente aggiungere where dopo orderBy multipli senza indice; potremmo necessitare di query separata (semplificata).
      // Per compatibilità, facciamo una query secondaria filtrando in memoria se l'indice non è pronto.
    }

    const unsubscribe = onSnapshot(qBase, (snapshot) => {
      const bookings = snapshot.docs.map((d) => {
        const raw = d.data() || {};
        // Preserve legacy custom id (stored previously inside document data as 'id')
        const legacyId = raw.id && raw.id !== d.id ? raw.id : undefined;
        // Avoid overwriting Firestore doc.id with embedded raw.id
        const { id: _discardId, ...rest } = raw; // eslint-disable-line no-unused-vars

        const finalBooking = {
          ...rest,
          id: d.id, // Canonical identifier
          legacyId, // Optional: useful for debugging / future migration
          createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt,
          updatedAt: raw.updatedAt?.toDate?.()?.toISOString() || raw.updatedAt,
        };

        return finalBooking;
      });

      const filtered = clubId
        ? bookings.filter((b) => b.clubId === clubId || (!b.clubId && clubId === 'default-club'))
        : bookings;
      bookingCache.set(subKey, filtered);

      emit('bookingsUpdated', { type: subKey, bookings: filtered });
    });

    subscriptions.set(subKey, unsubscribe);
  } catch (_error) {
    // Ignore subscription errors
  }
}

// =============================================
// CORE BOOKING OPERATIONS
// =============================================

/**
 * Create a new booking (court or lesson)
 */
export async function createBooking(bookingData, user, options = {}) {
  const clubId = bookingData.clubId || options.clubId || null;
  if (!clubId) {
    console.warn(
      '[UnifiedBookingService] createBooking senza clubId - fallback default-club (fase compat transitoria)'
    );
  }
  if (bookingData.time) bookingData.time = normalizeTime(bookingData.time);

  // 🏥 CHECK CERTIFICATO MEDICO - Verifica se l'utente ha un certificato valido
  if (user?.uid && clubId && clubId !== 'default-club') {
    try {
      // Cerca il giocatore nel club tramite linkedAccountId
      const playersRef = collection(db, 'clubs', clubId, 'players');
      const playerQuery = query(playersRef, where('linkedAccountId', '==', user.uid));
      const playerSnapshot = await getDocs(playerQuery);

      if (!playerSnapshot.empty) {
        const playerDoc = playerSnapshot.docs[0];
        const player = playerDoc.data();

        // Controlla il certificato
        const certStatus = calculateCertificateStatus(
          player.medicalCertificates?.current?.expiryDate
        );

        if (certStatus.isExpired) {
          const daysExpired = Math.abs(certStatus.daysUntilExpiry);
          throw new Error(
            `❌ Certificato medico scaduto da ${daysExpired} ${daysExpired === 1 ? 'giorno' : 'giorni'}. ` +
              `Non puoi effettuare prenotazioni. Contatta il circolo per rinnovare il certificato.`
          );
        }

        // Warning se in scadenza critica (< 7 giorni) ma permetti comunque
        if (certStatus.isExpiring && certStatus.daysUntilExpiry <= 7) {
          console.warn(
            `⚠️ [Booking Warning] Certificato medico in scadenza tra ${certStatus.daysUntilExpiry} giorni per utente ${user.uid}`
          );
        }
      }
    } catch (error) {
      // Se è l'errore del certificato scaduto, rilancialo
      if (error.message.includes('Certificato medico scaduto')) {
        throw error;
      }
      // Altri errori (es. permessi) li loggo ma non blocco la prenotazione
      console.warn('[Certificate Check] Errore durante verifica certificato:', error);
    }
  }

  // Get existing bookings for validation
  const existingBookings = await getPublicBookings({ forceRefresh: true });

  // Validate booking data and check for conflicts/holes
  const validationErrors = validateBooking(bookingData, existingBookings);
  if (validationErrors.length > 0) {
    const error = new Error(`Validazione fallita: ${validationErrors.join(', ')}`);
    error.validationErrors = validationErrors;
    throw error;
  }

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

    // Visual customization
    color: bookingData.color || null, // Custom booking color

    // Lesson-specific fields
    instructorId: bookingData.instructorId,
    instructorName: bookingData.instructorName,
    lessonType: bookingData.lessonType,
    participants: bookingData.participants || 1,
    isLessonBooking: bookingData.isLessonBooking || false,
    courtBookingId: bookingData.courtBookingId, // Reference to associated court booking

    // Metadata
    status: BOOKING_STATUS.CONFIRMED,
    createdBy: user?.uid || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clubId: clubId || 'default-club',
  };

  let result;

  if (useCloudStorage && user) {
    try {
      result = await createCloudBooking(booking);
    } catch (_error) {
      // Fallback to local storage on cloud error
      result = createLocalBooking(booking);
    }
  } else {
    result = createLocalBooking(booking);
  }

  // Emit event for real-time updates
  emitBookingCreated(result);

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
    } catch (_error) {
      // Fallback to local storage on cloud error
      result = updateLocalBooking(bookingId, updateData);
    }
  } else {
    result = updateLocalBooking(bookingId, updateData);
  }

  if (result) {
    emitBookingUpdated({ id: bookingId, booking: result });

    // Invalidate user bookings cache to ensure UI updates immediately
    if (user?.uid) {
      invalidateUserBookingsCache(user.uid);
    }
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
  if (useCloudStorage && user) {
    try {
      await deleteCloudBooking(bookingId);

      scheduleSync(400);
    } catch (_error) {
      // Fallback to local storage on cloud error
      deleteLocalBooking(bookingId);
    }
  } else {
    deleteLocalBooking(bookingId);
  }

  emitBookingDeleted({ id: bookingId });
}

// =============================================
// DATA RETRIEVAL
// =============================================

/**
 * Get all public bookings (for availability checking)
 */
export async function getPublicBookings(options = {}) {
  const { forceRefresh = false, includeLesson = true, clubId = null } = options;
  const cacheKey = `public|${clubId || 'all'}`;

  if (!forceRefresh && bookingCache.has(cacheKey)) {
    let cached = bookingCache.get(cacheKey);

    // Filter by clubId if provided
    if (clubId) {
      const isLegacyClub = clubId === 'sporting-cat';
      cached = cached.filter((b) => b.clubId === clubId || (isLegacyClub && !b.clubId));
    }

    // Cache debug disabled to reduce console spam
    // const coloredInCache = cached.filter(b => b.color);
    // console.log('📤 CACHE DEBUG:', {
    //   totalInCache: cached.length,
    //   coloredInCache: coloredInCache.length,
    //   coloredIds: coloredInCache.map(b => b.id).slice(0, 5),
    //   firstThreeIds: cached.slice(0, 3).map(b => b.id)
    // });

    if (!includeLesson) {
      cached = cached.filter((b) => !b.isLessonBooking);
    }

    // Cache status debug disabled to reduce console spam
    // const cacheColorCount = cached.filter(b => b.color).length;
    // console.log('📤 CACHE GET:', { total: cached.length, withColors: cacheColorCount });

    return cached;
  }

  let bookings = [];

  if (useCloudStorage) {
    try {
      bookings = await loadCloudBookings();
    } catch (_error) {
      // Fallback to local storage on cloud error
      bookings = loadLocalBookings();
    }
  } else {
    bookings = loadLocalBookings();
  }

  // Filter out cancelled bookings for public view
  bookings = bookings.filter((b) => b.status !== BOOKING_STATUS.CANCELLED);

  // Filter by clubId if provided
  if (clubId) {
    const isLegacyClub = ['sporting-cat', 'default-club'].includes(clubId);
    bookings = bookings.filter((b) => b.clubId === clubId || (isLegacyClub && !b.clubId));
  }

  if (!includeLesson) {
    bookings = bookings.filter((b) => !b.isLessonBooking);
  }

  bookingCache.set(cacheKey, bookings);

  return bookings;
}

/**
 * Get user's bookings
 */
export async function getUserBookings(user, options = {}) {
  if (!user) return [];

  const {
    includeHistory = false,
    includeCancelled = false,
    lessonOnly = false,
    clubId = null,
  } = options;

  // Query ottimizzata: prenotazioni dell'utente
  const bookingsRef = collection(db, 'bookings');
  let q = query(bookingsRef, where('bookedBy', '==', user.uid));

  // Filtra per club se specificato
  if (clubId) {
    q = query(bookingsRef, where('bookedBy', '==', user.uid), where('clubId', '==', clubId));
  }

  const snapshot = await getDocs(q);
  let userBookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (lessonOnly) {
    userBookings = userBookings.filter((b) => b.isLessonBooking);
  }

  if (!includeCancelled) {
    userBookings = userBookings.filter((b) => b.status !== BOOKING_STATUS.CANCELLED);
  }

  if (!includeHistory) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Filtra prenotazioni future + oggi con orario futuro
    userBookings = userBookings.filter((booking) => {
      if (!booking.date) return false;

      // Se la prenotazione è per oggi, controlla anche l'orario
      if (booking.date === today) {
        if (!booking.time) return true; // Se non c'è orario, mostrala

        // Converti l'orario della prenotazione in minuti
        const [hours, minutes] = booking.time.split(':').map(Number);
        const bookingTime = hours * 60 + minutes;

        // Mostra solo se l'orario è futuro
        return bookingTime > currentTime;
      }

      // Per date future, mostra sempre
      return booking.date > today;
    });
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

  // Update localStorage with the changes
  const localBookings = loadLocalBookings();
  const localIndex = localBookings.findIndex((b) => b.id === bookingId);

  if (localIndex !== -1) {
    // Update the local booking with the new data
    localBookings[localIndex] = { ...localBookings[localIndex], ...updates };
    saveLocalBookings(localBookings);
  }

  // Schedule sync to ensure consistency
  scheduleSync(1000); // Sync after 1 second

  // Return the updated booking
  const updatedBooking = localBookings.find((b) => b.id === bookingId);
  return updatedBooking ? { ...updatedBooking, ...updates } : null;
}

async function deleteCloudBooking(bookingId) {
  const docRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return;
    }
  } catch (e) {}
  await deleteDoc(docRef);
}

async function loadCloudBookings() {
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
      const { id: _discardId, ...rest } = raw; // eslint-disable-line no-unused-vars

      return {
        ...rest,
        id: d.id,
        legacyId,
        createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt,
        updatedAt: raw.updatedAt?.toDate?.()?.toISOString() || raw.updatedAt,
      };
    });
  }
  const q = query(
    collection(db, COLLECTIONS.BOOKINGS),
    orderBy('date', 'asc'),
    orderBy('time', 'asc')
  );

  const snapshot = await getDocs(q);
  const allBookings = snapshot.docs.map((d) => {
    const raw = d.data() || {};
    const legacyId = raw.id && raw.id !== d.id ? raw.id : raw.legacyId; // support both old & new storage
    const { id: _discardId, ...rest } = raw; // remove conflicting embedded id field

    const processedBooking = {
      ...rest,
      id: d.id,
      legacyId,
      createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt,
      updatedAt: raw.updatedAt?.toDate?.()?.toISOString() || raw.updatedAt,
    };

    // Debug log completely removed

    return processedBooking;
  });

  const activeBookings = allBookings.filter((booking) => {
    const status = booking.status || BOOKING_STATUS.CONFIRMED;
    const isActive = status !== BOOKING_STATUS.CANCELLED;
    return isActive;
  });

  return activeBookings;
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

  const filtered = allBookings.filter((b) => b.id !== bookingId);

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

    // Filtra prenotazioni cancellate (considera anche booking senza status come confirmed)
    const activeBookings = allBookings.filter((booking) => {
      const status = booking.status || BOOKING_STATUS.CONFIRMED; // Default a confirmed se status mancante
      const isActive = status !== BOOKING_STATUS.CANCELLED;
      if (!isActive) {
      }
      return isActive;
    });

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
  } catch (_error) {
    // Ignore localStorage errors
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
    return;
  }

  const migrations = [];

  // Migrate from old booking service
  try {
    const oldBookings = localStorage.getItem('ml-field-bookings');
    if (oldBookings) {
      const parsed = JSON.parse(oldBookings);
      migrations.push(...parsed.map((b) => ({ ...b, type: BOOKING_TYPES.COURT })));
    }
  } catch (_error) {
    // Ignore migration errors
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
  } catch (_error) {
    // Ignore migration errors
  }

  if (migrations.length > 0) {
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
  }
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
// VALIDATION
// =============================================
export function validateBooking(bookingData, existingBookings = []) {
  const errors = [];

  // Basic validation
  if (!bookingData.courtId) errors.push('Campo richiesto');
  if (!bookingData.date) errors.push('Data richiesta');
  if (!bookingData.time) errors.push('Ora richiesta');
  if (!bookingData.duration || bookingData.duration < 30) errors.push('Durata minima 30 minuti');

  // Validation debug disabled to reduce console spam
  // console.log('🔍 VALIDATION DEBUG - Checking conflicts for:', {
  //   courtId: bookingData.courtId,
  //   date: bookingData.date,
  //   time: bookingData.time,
  //   duration: bookingData.duration,
  //   type: bookingData.type
  // });

  // Check for conflicts - exclude the booking itself if updating
  const conflicts = existingBookings.filter((booking) => {
    const isSameBooking = booking.id === bookingData.id;
    const isSameCourt = booking.courtId === bookingData.courtId;
    const isSameDate = booking.date === bookingData.date;

    // ✅ FIX: Use same logic as other parts - default to confirmed if no status
    const bookingStatus = booking.status || BOOKING_STATUS.CONFIRMED;
    const isConfirmed = bookingStatus === BOOKING_STATUS.CONFIRMED;

    const hasTimeOverlap = timeOverlaps(
      booking.time,
      booking.duration,
      bookingData.time,
      bookingData.duration
    );

    // Individual booking validation debug disabled to reduce console spam
    // console.log(`  📋 Checking booking ${booking.id}:`, {
    //   courtId: booking.courtId,
    //   date: booking.date,
    //   time: booking.time,
    //   duration: booking.duration,
    //   status: booking.status,
    //   normalizedStatus: bookingStatus,
    //   type: booking.type,
    //   checks: {
    //     isSameBooking,
    //     isSameCourt,
    //     isSameDate,
    //     isConfirmed,
    //     hasTimeOverlap
    //   }
    // });

    return !isSameBooking && isSameCourt && isSameDate && isConfirmed && hasTimeOverlap;
  });

  // ✅ FIX: For both lesson and court bookings, check against ALL types of conflicts
  if (conflicts.length > 0) {
    if (bookingData.type === 'lesson') {
      errors.push("Orario già occupato da un'altra prenotazione");
    } else {
      errors.push('Orario già occupato');
    }
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
 * Check if a time slot would be trapped between bookings (DISABLED)
 */
export function isTimeSlotTrapped(courtId, date, startTime, duration, existingBookings) {
  // Always return false - trapped slot logic disabled along with hole prevention
  return false;
}

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

    if (holeSize > 0 && holeSize <= 30) {
      // Check EXEMPTION: is this part of a trapped slot of EXACTLY 120 minutes?
      const prevBooking = courtBookings
        .filter((b) => timeToMinutes(b.time) + b.duration <= bookingStart)
        .pop(); // Get the last one before our booking

      if (prevBooking) {
        const prevEnd = timeToMinutes(prevBooking.time) + prevBooking.duration;
        const totalGap = nextStart - prevEnd;

        // EXEMPTION: Only if total gap is EXACTLY 120 minutes
        if (totalGap === 120) {
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

    if (holeSize > 0 && holeSize <= 30) {
      // Check EXEMPTION: is this part of a trapped slot of EXACTLY 120 minutes?
      const nextBooking = courtBookings.find((b) => timeToMinutes(b.time) >= bookingEnd);

      if (nextBooking) {
        const nextStart = timeToMinutes(nextBooking.time);
        const totalGap = nextStart - prevEnd;

        // EXEMPTION: Only if total gap is EXACTLY 120 minutes
        if (totalGap === 120) {
          return false;
        }
      }

      return true; // Would create problematic hole without exemption
    }
  }

  return false; // No hole would be created
}

/**
 * Basic slot availability check (no overlaps)
 */
export function isSlotAvailable(courtId, date, startTime, duration, existingBookings) {
  const bookingStart = timeToMinutes(startTime);
  const bookingEnd = bookingStart + duration;

  // Check for conflicts with existing bookings
  const hasConflict = existingBookings.some((booking) => {
    if (booking.courtId !== courtId || booking.date !== date) return false;

    // Skip cancelled bookings
    const status = booking.status || BOOKING_STATUS.CONFIRMED;
    if (status === BOOKING_STATUS.CANCELLED) return false;

  const existingStart = timeToMinutes(booking.time);
  const existingEnd = existingStart + booking.duration;

    // Check for overlap
    const overlap = bookingStart < existingEnd && bookingEnd > existingStart;

    if (overlap) {
      // Overlap found but no logging needed
    }

    return overlap;
  });

  return !hasConflict;
}

/**
 * Enhanced validation that checks availability with hole prevention rules for USER BOOKINGS ONLY
 */
export function isDurationBookable(
  courtId,
  date,
  startTime,
  duration,
  existingBookings,
  isUserBooking = false
) {
  // Basic availability check
  const basicAvailable = isSlotAvailable(courtId, date, startTime, duration, existingBookings);

  if (!basicAvailable) {
    return false;
  }

  // Apply hole prevention rule ONLY for user bookings (not admin)
  if (isUserBooking) {
    const wouldCreateHole = wouldCreateHalfHourHole(
      courtId,
      date,
      startTime,
      duration,
      existingBookings
    );

    if (wouldCreateHole) {
      return false;
    }
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
// NOTE: Functions already declared with `export function ...` are automatically exported
export {};

/**
 * Search bookings by player (userId, email, or name)
 */
export async function searchBookingsForPlayer({ userId, email, name }) {
  if (!userId && !email && !name) return [];

  if (!useCloudStorage) {
    const localBookings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return localBookings.filter((booking) => {
      if (!booking) return false;

      // Check by user ID
      if (userId && booking.createdBy === userId) return true;

      // Check by email
      if (email && booking.userEmail === email) return true;

      // Check by name (in bookedBy field or players array)
      if (name) {
        if (booking.bookedBy === name) return true;
        if (Array.isArray(booking.players)) {
          return booking.players.some(
            (player) => (typeof player === 'string' ? player : player?.name) === name
          );
        }
      }

      return false;
    });
  }

  try {
    const queries = [];

    if (userId) {
      queries.push(
        getDocs(query(collection(db, COLLECTIONS.BOOKINGS), where('createdBy', '==', userId)))
      );
    }

    if (email) {
      queries.push(
        getDocs(query(collection(db, COLLECTIONS.BOOKINGS), where('userEmail', '==', email)))
      );
    }

    if (name) {
      // For name-based searches, we'll need to do client-side filtering since Firestore doesn't support complex queries
      queries.push(
        getDocs(query(collection(db, COLLECTIONS.BOOKINGS), where('bookedBy', '==', name)))
      );
      queries.push(
        getDocs(
          query(collection(db, COLLECTIONS.BOOKINGS), where('players', 'array-contains', name))
        )
      );
    }

    const results = await Promise.allSettled(queries);
    const bookingMap = new Map();

    for (const result of results) {
      if (result.status === 'fulfilled') {
        result.value.docs.forEach((doc) => {
          const data = doc.data() || {};
          const legacyId = data.id && data.id !== doc.id ? data.id : data.legacyId;
          const { id, ...bookingData } = data;

          bookingMap.set(doc.id, {
            ...bookingData,
            id: doc.id,
            legacyId,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          });
        });
      }
    }

    const bookings = Array.from(bookingMap.values());

    // Sort by date and time
    bookings.sort((a, b) => {
      const dateCompare = (a.date || '').localeCompare(b.date || '');
      if (dateCompare !== 0) return dateCompare;
      return (a.time || '').localeCompare(b.time || '');
    });

    return bookings;
  } catch (error) {
    console.warn('Error searching bookings for player:', error);
    return [];
  }
}

/**
 * Get active user bookings (future bookings)
 */
export async function getActiveUserBookings(userId) {
  if (!userId) return [];
  const today = new Date().toISOString().split('T')[0];

  if (!useCloudStorage) {
    return (
      await getUserBookings({ uid: userId }, { includeHistory: true, includeCancelled: false })
    ).filter(
      (booking) =>
        booking.date >= today &&
        (booking.status || BOOKING_STATUS.CONFIRMED) === BOOKING_STATUS.CONFIRMED
    );
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('createdBy', '==', userId),
      where('status', '==', BOOKING_STATUS.CONFIRMED),
      where('date', '>=', today),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data() || {};
      const legacyId = data.id && data.id !== doc.id ? data.id : data.legacyId;
      const { id: _id, ...bookingData } = data; // eslint-disable-line no-unused-vars

      return {
        ...bookingData,
        id: doc.id,
        legacyId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });
  } catch (error) {
    console.warn('Error getting active user bookings:', error);
    return getUserBookings({ uid: userId }, { includeHistory: true, includeCancelled: false });
  }
}

/**
 * Get user booking history (past bookings)
 */
export async function getUserBookingHistory(userId) {
  if (!userId) return [];
  const today = new Date().toISOString().split('T')[0];

  if (!useCloudStorage) {
    return (
      await getUserBookings({ uid: userId }, { includeHistory: true, includeCancelled: true })
    )
      .filter((booking) => booking.date < today)
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('createdBy', '==', userId),
      where('date', '<', today),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data() || {};
      const legacyId = data.id && data.id !== doc.id ? data.id : data.legacyId;
      const { id: _id, ...bookingData } = data; // eslint-disable-line no-unused-vars

      return {
        ...bookingData,
        id: doc.id,
        legacyId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });
  } catch (error) {
    console.warn('Error getting user booking history:', error);
    return (
      await getUserBookings({ uid: userId }, { includeHistory: true, includeCancelled: true })
    )
      .filter((booking) => booking.date < today)
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }
}
