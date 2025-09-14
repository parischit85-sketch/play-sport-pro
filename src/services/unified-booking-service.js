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
} from "firebase/firestore";
import { db } from "./firebase.js";

// Simple debug logger fallback
const debugLogger = {
  info: (cat, msg, data) => console.log(`📝 [${cat}] ${msg}`, data || ""),
  success: (cat, msg, data) => console.log(`✅ [${cat}] ${msg}`, data || ""),
  warn: (cat, msg, data) => console.log(`⚠️ [${cat}] ${msg}`, data || ""),
  error: (cat, msg, data) => console.log(`❌ [${cat}] ${msg}`, data || ""),
};

// =============================================
// CONSTANTS
// =============================================
const STORAGE_KEY = "unified-bookings";
const COLLECTIONS = {
  BOOKINGS: "bookings",
};

const BOOKING_STATUS = {
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  PENDING: "pending",
};

const BOOKING_TYPES = {
  COURT: "court",
  LESSON: "lesson",
};

// =============================================
// GLOBAL STATE MANAGEMENT
// =============================================
let useCloudStorage = false;
let currentUser = null;
let bookingCache = new Map();
let subscriptions = new Map();
// Initialization & migration guards
const MIGRATION_FLAG_KEY = "unified-bookings-migration-done-v1";
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

  if (useCloudStorage) {
    setupRealtimeSubscriptions();
    // One-time migration, then sync
    if (!localStorage.getItem(MIGRATION_FLAG_KEY)) {
      migrationInProgress = true;
      migrateOldData()
        .catch((e) => console.warn("Migration failed:", e))
        .finally(() => {
          localStorage.setItem(MIGRATION_FLAG_KEY, "1");
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
  if (subscriptions.has("public")) return; // Already subscribed

  try {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where("status", "!=", "cancelled"),
      orderBy("status"),
      orderBy("date", "asc"),
      orderBy("time", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
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

      bookingCache.set("public", bookings);

      emit("bookingsUpdated", { type: "public", bookings });
    });

    subscriptions.set("public", unsubscribe);
  } catch (error) {}
}

// =============================================
// CORE BOOKING OPERATIONS
// =============================================

/**
 * Create a new booking (court or lesson)
 */
export async function createBooking(bookingData, user, options = {}) {
  if (bookingData.time) bookingData.time = normalizeTime(bookingData.time);

  // Get existing bookings for validation
  const existingBookings = await getPublicBookings({ forceRefresh: true });
  console.log(
    "🔍 Validating booking against",
    existingBookings.length,
    "existing bookings",
  );
  console.log("📋 New booking data:", {
    type: bookingData.type,
    courtId: bookingData.courtId,
    date: bookingData.date,
    time: bookingData.time,
    duration: bookingData.duration,
    color: bookingData.color, // Add color to debug log
  });

  // Validate booking data and check for conflicts/holes
  const validationErrors = validateBooking(bookingData, existingBookings);
  if (validationErrors.length > 0) {
    const error = new Error(
      `Validazione fallita: ${validationErrors.join(", ")}`,
    );
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
    bookedBy: user?.displayName || user?.email || "Anonimo",
    userEmail: user?.email,
    userPhone: bookingData.userPhone || "",
    players: bookingData.players || [],
    notes: bookingData.notes || "",

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
  };

  // Debug: Log the final booking object
  console.log("🎨 Final booking object:", {
    id: booking.id,
    color: booking.color,
    allFields: Object.keys(booking),
  });

  let result;

  if (useCloudStorage && user) {
    try {
      result = await createCloudBooking(booking);
    } catch (error) {
      result = createLocalBooking(booking);
    }
  } else {
    result = createLocalBooking(booking);
  }

  // Emit event for real-time updates
  emit("bookingCreated", result);

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
        error.code === "not-found" ||
        error.message.includes("No document to update") ||
        error.message.includes("Document does not exist");

      if (!isExpectedError) {
      } else {
      }
      result = updateLocalBooking(bookingId, updateData);
    }
  } else {
    result = updateLocalBooking(bookingId, updateData);
  }

  if (result) {
    emit("bookingUpdated", { id: bookingId, booking: result });
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
    user,
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
    } catch (error) {
      deleteLocalBooking(bookingId);
    }
  } else {
    deleteLocalBooking(bookingId);
  }

  emit("bookingDeleted", { id: bookingId });
}

// =============================================
// DATA RETRIEVAL
// =============================================

/**
 * Get all public bookings (for availability checking)
 */
export async function getPublicBookings(options = {}) {
  const { forceRefresh = false, includeLesson = true } = options;

  if (!forceRefresh && bookingCache.has("public")) {
    let cached = bookingCache.get("public");

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
    } catch (error) {
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

  bookingCache.set("public", bookings);

  // 🔍 DEBUG: Check final cache contents
  const finalBookings = bookings.slice(0, 3); // Sample first 3 for debugging
  finalBookings.forEach((booking) => {
    if (booking.color) {
      console.log("💰 CACHE SET - Color preserved:", {
        id: booking.id,
        color: booking.color,
        hasColor: !!booking.color,
        allKeys: Object.keys(booking),
      });
    }
  });

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
  } = options;

  const allBookings = await getPublicBookings({ forceRefresh: true });

  let userBookings = allBookings.filter(
    (booking) =>
      booking.userEmail === user.email || booking.createdBy === user.uid,
  );

  if (lessonOnly) {
    userBookings = userBookings.filter((b) => b.isLessonBooking);
  }

  if (!includeCancelled) {
    userBookings = userBookings.filter(
      (b) => b.status !== BOOKING_STATUS.CANCELLED,
    );
  }

  if (!includeHistory) {
    const today = new Date().toISOString().split("T")[0];
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

  const docRef = await addDoc(
    collection(db, COLLECTIONS.BOOKINGS),
    cleanedData,
  );
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
    if (error.code === "not-found") {
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
      orderBy("date", "asc"),
      orderBy("time", "asc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const raw = d.data() || {};
      const legacyId = raw.id && raw.id !== d.id ? raw.id : raw.legacyId;
      const { id: _discardId, ...rest } = raw;

      // 🔍 DEBUG: Check fields during loading
      console.log("🔍 LOADING BOOKING:", {
        docId: d.id,
        rawParticipants: raw.participants,
        restParticipants: rest.participants,
        allFields: Object.keys(raw),
      });

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
    orderBy("date", "asc"),
    orderBy("time", "asc"),
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

    // Debug participants loading
    console.log("🔍 PROCESSED BOOKING:", {
      id: d.id,
      participants: processedBooking.participants,
      price: processedBooking.price,
      instructorId: processedBooking.instructorId,
    });

    return processedBooking;
  });

  const activeBookings = allBookings.filter((booking) => {
    const status = booking.status || BOOKING_STATUS.CONFIRMED;
    const isActive = status !== BOOKING_STATUS.CANCELLED;
    if (!isActive && Math.random() < 0.3) {
      // Log only ~30% of cancelled bookings to reduce noise
    }
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
  localStorage.setItem("ml-field-bookings", JSON.stringify(filtered));

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
    console.error("Error loading bookings from localStorage:", error);
    return [];
  }
}

// Sync localStorage with cloud (debounced externally)
async function syncLocalWithCloud() {
  if (!useCloudStorage || migrationInProgress) return;
  try {
    const cloudBookings = await loadCloudBookings();
    const activeCloudBookings = cloudBookings.filter(
      (b) =>
        (b.status || BOOKING_STATUS.CONFIRMED) !== BOOKING_STATUS.CANCELLED,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeCloudBookings));
  } catch (error) {}
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
    localStorage.setItem("ml-field-bookings", JSON.stringify(activeBookings));

    // Clear cache to force refresh
    bookingCache.clear();
  } catch (error) {
    console.error("Error saving bookings to localStorage:", error);
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
    const oldBookings = localStorage.getItem("ml-field-bookings");
    if (oldBookings) {
      const parsed = JSON.parse(oldBookings);
      migrations.push(
        ...parsed.map((b) => ({ ...b, type: BOOKING_TYPES.COURT })),
      );
    }
  } catch (error) {}

  // Migrate lesson bookings
  try {
    const oldLessons =
      localStorage.getItem("lessonBookings") ||
      localStorage.getItem("lesson-bookings");
    if (oldLessons) {
      const parsed = JSON.parse(oldLessons);
      migrations.push(
        ...parsed.map((l) => ({
          ...l,
          type: BOOKING_TYPES.LESSON,
          isLessonBooking: true,
        })),
      );
    }
  } catch (error) {}

  if (migrations.length > 0) {
    // Remove duplicates by ID and filter out cancelled bookings
    const uniqueBookings = migrations.reduce((acc, booking) => {
      const status = booking.status || BOOKING_STATUS.CONFIRMED; // Default a confirmed se status mancante
      if (
        !acc.some((b) => b.id === booking.id) &&
        status !== BOOKING_STATUS.CANCELLED
      ) {
        acc.push(booking);
      }
      return acc;
    }, []);

    saveLocalBookings(uniqueBookings);

    // Clear old storage
    localStorage.removeItem("lessonBookings");
    localStorage.removeItem("lesson-bookings");
  }
}

/**
 * Clear all data (for testing/cleanup)
 */
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("ml-field-bookings");
  localStorage.removeItem("lessonBookings");
  localStorage.removeItem("lesson-bookings");
  bookingCache.clear();

  emit("dataCleared");
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
  if (!bookingData.courtId) errors.push("Campo richiesto");
  if (!bookingData.date) errors.push("Data richiesta");
  if (!bookingData.time) errors.push("Ora richiesta");
  if (!bookingData.duration || bookingData.duration < 30)
    errors.push("Durata minima 30 minuti");

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
      bookingData.duration,
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

    return (
      !isSameBooking &&
      isSameCourt &&
      isSameDate &&
      isConfirmed &&
      hasTimeOverlap
    );
  });

  console.log("🚨 CONFLICTS FOUND:", conflicts.length, conflicts);

  // ✅ FIX: For both lesson and court bookings, check against ALL types of conflicts
  if (conflicts.length > 0) {
    if (bookingData.type === "lesson") {
      errors.push("Orario già occupato da un'altra prenotazione");
      console.log("🚫 Lesson conflicts with existing bookings:", conflicts);
    } else {
      errors.push("Orario già occupato");
      console.log("🚫 Court conflict found:", conflicts);
    }
  }

  console.log("✅ VALIDATION RESULT:", errors);
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
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function normalizeTime(t) {
  if (!t) return t;
  const match = String(t)
    .trim()
    .match(/^(\d{1,2}):(\d{2})/);
  if (!match) return t;
  const hh = String(Math.min(23, parseInt(match[1], 10))).padStart(2, "0");
  const mm = String(Math.min(59, parseInt(match[2], 10))).padStart(2, "0");
  return `${hh}:${mm}`;
}

// =============================================
// BOOKING SLOT VALIDATION WITH HOLE PREVENTION
// =============================================

/**
 * Check if a time slot would be trapped between bookings (DISABLED)
 */
export function isTimeSlotTrapped(
  courtId,
  date,
  startTime,
  duration,
  existingBookings,
) {
  // Always return false - trapped slot logic disabled along with hole prevention
  return false;
}

/**
 * Check if a booking would create a problematic 30-minute hole
 * WITH EXEMPTION for trapped slots of exactly 120 minutes
 */
export function wouldCreateHalfHourHole(
  courtId,
  date,
  startTime,
  duration,
  existingBookings,
) {
  console.log(
    `🔍 [HOLE DEBUG] Checking ${courtId} on ${date} at ${startTime} for ${duration}min`,
  );
  console.log(
    `🔍 [HOLE DEBUG] Existing bookings count:`,
    existingBookings.length,
  );

  const bookingStart = timeToMinutes(startTime);
  const bookingEnd = bookingStart + duration;

  // Get bookings for same court and date, sorted by time
  const courtBookings = existingBookings
    .filter(
      (b) =>
        b.courtId === courtId &&
        b.date === date &&
        (b.status || BOOKING_STATUS.CONFIRMED) !== BOOKING_STATUS.CANCELLED,
    )
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  console.log(
    `🔍 [HOLE DEBUG] Court ${courtId} bookings for ${date}:`,
    courtBookings.map((b) => `${b.time}(${b.duration}min)`),
  );

  // Check for hole after our booking
  const nextBooking = courtBookings.find(
    (b) => timeToMinutes(b.time) > bookingEnd,
  );
  if (nextBooking) {
    const nextStart = timeToMinutes(nextBooking.time);
    const holeSize = nextStart - bookingEnd;

    console.log(
      `🔍 [HOLE DEBUG] Gap AFTER: ${holeSize}min (${startTime} ends at ${Math.floor(bookingEnd / 60)}:${String(bookingEnd % 60).padStart(2, "0")}, next booking at ${nextBooking.time})`,
    );

    if (holeSize > 0 && holeSize <= 30) {
      console.log(
        `⚠️ [HOLE DEBUG] Found problematic gap AFTER: ${holeSize}min`,
      );
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
            `✅ [120MIN EXEMPTION] ${courtId} ${startTime}: 120min trapped slot allows ${holeSize}min hole`,
          );
          return false;
        }
      }

      console.log(
        `🚫 [HOLE BLOCKED] ${courtId} ${startTime}: Would create ${holeSize}min hole AFTER booking`,
      );
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

    console.log(
      `🔍 [HOLE DEBUG] Gap BEFORE: ${holeSize}min (previous ends at ${Math.floor(prevEnd / 60)}:${String(prevEnd % 60).padStart(2, "0")}, our booking starts at ${startTime})`,
    );

    if (holeSize > 0 && holeSize <= 30) {
      console.log(
        `⚠️ [HOLE DEBUG] Found problematic gap BEFORE: ${holeSize}min`,
      );
      // Check EXEMPTION: is this part of a trapped slot of EXACTLY 120 minutes?
      const nextBooking = courtBookings.find(
        (b) => timeToMinutes(b.time) >= bookingEnd,
      );

      if (nextBooking) {
        const nextStart = timeToMinutes(nextBooking.time);
        const totalGap = nextStart - prevEnd;

        // EXEMPTION: Only if total gap is EXACTLY 120 minutes
        if (totalGap === 120) {
          console.log(
            `✅ [120MIN EXEMPTION] ${courtId} ${startTime}: 120min trapped slot allows ${holeSize}min hole`,
          );
          return false;
        }
      }

      console.log(
        `🚫 [HOLE BLOCKED] ${courtId} ${startTime}: Would create ${holeSize}min hole BEFORE booking`,
      );
      return true; // Would create problematic hole without exemption
    }
  }

  return false; // No hole would be created
}

/**
 * Basic slot availability check (no overlaps)
 */
export function isSlotAvailable(
  courtId,
  date,
  startTime,
  duration,
  existingBookings,
) {
  console.log(
    `🔍 [SLOT AVAILABLE] Basic check for ${courtId} ${date} ${startTime} (${duration}min)`,
  );

  const bookingStart = timeToMinutes(startTime);
  const bookingEnd = bookingStart + duration;

  console.log(
    `🕒 [SLOT AVAILABLE] Time range: ${bookingStart}min-${bookingEnd}min (${Math.floor(bookingStart / 60)}:${String(bookingStart % 60).padStart(2, "0")}-${Math.floor(bookingEnd / 60)}:${String(bookingEnd % 60).padStart(2, "0")})`,
  );

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
      console.log(
        `⚠️ [SLOT AVAILABLE] Overlap found with ${booking.time} (${booking.duration}min): ${existingStart}min-${existingEnd}min`,
      );
    }

    return overlap;
  });

  console.log(
    `📊 [SLOT AVAILABLE] Conflicts found: ${hasConflict}, Result: ${!hasConflict ? "✅ AVAILABLE" : "❌ BLOCKED"}`,
  );
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
  isUserBooking = false,
) {
  console.log(
    `🎮 [DURATION BOOKABLE] Checking ${courtId} ${date} ${startTime} (${duration}min) - isUserBooking: ${isUserBooking}`,
  );

  // Basic availability check
  const basicAvailable = isSlotAvailable(
    courtId,
    date,
    startTime,
    duration,
    existingBookings,
  );
  console.log(`📊 [DURATION BOOKABLE] Basic availability: ${basicAvailable}`);

  if (!basicAvailable) {
    console.log(`❌ [DURATION BOOKABLE] Failed basic availability check`);
    return false;
  }

  // Apply hole prevention rule ONLY for user bookings (not admin)
  if (isUserBooking) {
    const wouldCreateHole = wouldCreateHalfHourHole(
      courtId,
      date,
      startTime,
      duration,
      existingBookings,
    );
    console.log(`🕳️ [DURATION BOOKABLE] Would create hole: ${wouldCreateHole}`);

    if (wouldCreateHole) {
      console.log(`❌ [DURATION BOOKABLE] Blocked due to hole prevention rule`);
      return false;
    }
  } else {
    console.log(
      `🔓 [DURATION BOOKABLE] Admin booking - skipping hole prevention`,
    );
  }

  console.log(`✅ [DURATION BOOKABLE] Duration ${duration}min is bookable`);
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

  if (!isCloudEnabled) {
    const localBookings = loadFromLocalStorage();
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
            (player) =>
              (typeof player === "string" ? player : player?.name) === name,
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
        getDocs(
          query(
            collection(db, COLLECTIONS.BOOKINGS),
            where("createdBy", "==", userId),
          ),
        ),
      );
    }

    if (email) {
      queries.push(
        getDocs(
          query(
            collection(db, COLLECTIONS.BOOKINGS),
            where("userEmail", "==", email),
          ),
        ),
      );
    }

    if (name) {
      // For name-based searches, we'll need to do client-side filtering since Firestore doesn't support complex queries
      queries.push(
        getDocs(
          query(
            collection(db, COLLECTIONS.BOOKINGS),
            where("bookedBy", "==", name),
          ),
        ),
      );
      queries.push(
        getDocs(
          query(
            collection(db, COLLECTIONS.BOOKINGS),
            where("players", "array-contains", name),
          ),
        ),
      );
    }

    const results = await Promise.allSettled(queries);
    const bookingMap = new Map();

    for (const result of results) {
      if (result.status === "fulfilled") {
        result.value.docs.forEach((doc) => {
          const data = doc.data() || {};
          const legacyId =
            data.id && data.id !== doc.id ? data.id : data.legacyId;
          const { id, ...bookingData } = data;

          bookingMap.set(doc.id, {
            ...bookingData,
            id: doc.id,
            legacyId,
            createdAt:
              data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt:
              data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          });
        });
      }
    }

    const bookings = Array.from(bookingMap.values());

    // Sort by date and time
    bookings.sort((a, b) => {
      const dateCompare = (a.date || "").localeCompare(b.date || "");
      if (dateCompare !== 0) return dateCompare;
      return (a.time || "").localeCompare(b.time || "");
    });

    return bookings;
  } catch (error) {
    console.warn("Error searching bookings for player:", error);
    return [];
  }
}

/**
 * Get active user bookings (future bookings)
 */
export async function getActiveUserBookings(userId) {
  if (!userId) return [];
  const today = new Date().toISOString().split("T")[0];

  if (!isCloudEnabled) {
    return (
      await getUserBookings(
        { uid: userId },
        { includeHistory: true, includeCancelled: false },
      )
    ).filter(
      (booking) =>
        booking.date >= today &&
        (booking.status || BOOKING_STATUS.CONFIRMED) ===
          BOOKING_STATUS.CONFIRMED,
    );
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where("createdBy", "==", userId),
      where("status", "==", BOOKING_STATUS.CONFIRMED),
      where("date", ">=", today),
      orderBy("date", "asc"),
      orderBy("time", "asc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data() || {};
      const legacyId = data.id && data.id !== doc.id ? data.id : data.legacyId;
      const { id, ...bookingData } = data;

      return {
        ...bookingData,
        id: doc.id,
        legacyId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });
  } catch (error) {
    console.warn("Error getting active user bookings:", error);
    return getUserBookings(
      { uid: userId },
      { includeHistory: true, includeCancelled: false },
    );
  }
}

/**
 * Get user booking history (past bookings)
 */
export async function getUserBookingHistory(userId) {
  if (!userId) return [];
  const today = new Date().toISOString().split("T")[0];

  if (!isCloudEnabled) {
    return (
      await getUserBookings(
        { uid: userId },
        { includeHistory: true, includeCancelled: true },
      )
    )
      .filter((booking) => booking.date < today)
      .sort(
        (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time),
      );
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where("createdBy", "==", userId),
      where("date", "<", today),
      orderBy("date", "desc"),
      orderBy("time", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data() || {};
      const legacyId = data.id && data.id !== doc.id ? data.id : data.legacyId;
      const { id, ...bookingData } = data;

      return {
        ...bookingData,
        id: doc.id,
        legacyId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });
  } catch (error) {
    console.warn("Error getting user booking history:", error);
    return (
      await getUserBookings(
        { uid: userId },
        { includeHistory: true, includeCancelled: true },
      )
    )
      .filter((booking) => booking.date < today)
      .sort(
        (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time),
      );
  }
}
