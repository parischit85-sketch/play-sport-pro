// =============================================
// FILE: src/services/club-settings.js
// Gestione configurazioni per club (bookingConfig, lessonConfig)
// Struttura Firestore proposta:
//   /clubs/{clubId}/settings (document unico)
// Campi:
//   bookingConfig: {...}
//   lessonConfig: {...}
//   updatedAt: serverTimestamp
//   updatedBy: uid utente (opzionale)
// =============================================
import { db } from '@services/firebase.js';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getDefaultBookingConfig } from '@data/seed.js';
import { createLessonConfigSchema } from '@features/players/types/playerTypes.js';
import { z } from 'zod';

const DEFAULTS = {
  bookingConfig: getDefaultBookingConfig(),
  lessonConfig: createLessonConfigSchema(),
};

// Zod schema (per robustezza runtime: ignora campi extra, riempie defaults mancanti)
const BookingConfigSchema = z.object({
  slotMinutes: z.number().int().positive().default(DEFAULTS.bookingConfig.slotMinutes),
  dayStartHour: z.number().int().min(0).max(23).default(DEFAULTS.bookingConfig.dayStartHour),
  dayEndHour: z.number().int().min(0).max(23).default(DEFAULTS.bookingConfig.dayEndHour),
  defaultDurations: z.array(z.number().int().positive()).nonempty().default(DEFAULTS.bookingConfig.defaultDurations),
  holePrevention: z.boolean().default(!!DEFAULTS.bookingConfig.holePrevention),
  maxAdvanceDays: z.number().int().min(0).max(365).default(DEFAULTS.bookingConfig.maxAdvanceDays || 30),
  pricing: z.object({
    full: z.array(z.any()).default([]),
    discounted: z.array(z.any()).default([])
  }).default(DEFAULTS.bookingConfig.pricing),
  addons: z.object({
    lightingEnabled: z.boolean().default(DEFAULTS.bookingConfig.addons.lightingEnabled),
    lightingFee: z.number().min(0).default(DEFAULTS.bookingConfig.addons.lightingFee),
    heatingEnabled: z.boolean().default(DEFAULTS.bookingConfig.addons.heatingEnabled),
    heatingFee: z.number().min(0).default(DEFAULTS.bookingConfig.addons.heatingFee)
  }).default(DEFAULTS.bookingConfig.addons),
  baseRateWeekday: z.number().min(0).default(DEFAULTS.bookingConfig.baseRateWeekday),
  baseRatePeak: z.number().min(0).default(DEFAULTS.bookingConfig.baseRatePeak),
  baseRateWeekend: z.number().min(0).default(DEFAULTS.bookingConfig.baseRateWeekend),
  peakStartHour: z.number().int().min(0).max(23).default(DEFAULTS.bookingConfig.peakStartHour),
  peakEndHour: z.number().int().min(0).max(23).default(DEFAULTS.bookingConfig.peakEndHour)
}).catch(() => DEFAULTS.bookingConfig);

// lessonConfig struttura generata da createLessonConfigSchema (assumiamo shape nota)
const LessonConfigSchema = z.object({
  enable: z.boolean().default(true),
  defaultDurations: z.array(z.number().int().positive()).nonempty().default([60]),
  instructorAllocation: z.string().default('manual'),
  timeSlots: z.array(z.any()).default([]), // Array of lesson time slots
  defaultDuration: z.number().int().positive().default(60),
  allowedDurations: z.array(z.number().int().positive()).default([60, 90]),
  bookingAdvanceDays: z.number().int().min(0).default(14),
  cancellationHours: z.number().int().min(0).default(24),
  isEnabled: z.boolean().default(false)
}).catch(() => DEFAULTS.lessonConfig);

function sanitize(raw = {}) {
  return {
    bookingConfig: BookingConfigSchema.parse(raw.bookingConfig || {}),
    lessonConfig: LessonConfigSchema.parse(raw.lessonConfig || {}),
  };
}

function settingsDocRef(clubId) {
  if (!clubId) throw new Error('clubId mancante in club-settings');
  return doc(db, 'clubs', clubId, 'settings', 'config');
}

export async function getClubSettings(clubId) {
  const ref = settingsDocRef(clubId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // Non esiste ancora: creiamo con defaults (lazy init)
    await setDoc(ref, {
      ...DEFAULTS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ...DEFAULTS };
  }
  const data = snap.data() || {};
  return sanitize(data);
}

export function subscribeClubSettings(clubId, cb) {
  const ref = settingsDocRef(clubId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      cb({ ...DEFAULTS });
      return;
    }
    const data = snap.data() || {};
    cb(sanitize(data));
  });
}

async function ensureDoc(ref) {
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      ...DEFAULTS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function updateBookingConfig(clubId, partial, { userId } = {}) {
  const ref = settingsDocRef(clubId);
  await ensureDoc(ref);
  const merged = { ...DEFAULTS.bookingConfig, ...partial };
  const safe = BookingConfigSchema.parse(merged);
  await updateDoc(ref, {
    'bookingConfig': safe, // Sovrascrive completamente (client passa merge se necessario)
    updatedAt: serverTimestamp(),
    updatedBy: userId || null,
  });
}

export async function patchBookingConfig(clubId, patch, { userId } = {}) {
  // Patch superficiale con merge lato client
  const current = await getClubSettings(clubId);
  await updateBookingConfig(clubId, { ...current.bookingConfig, ...patch }, { userId });
}

export async function updateLessonConfig(clubId, partial, { userId } = {}) {
  const ref = settingsDocRef(clubId);
  await ensureDoc(ref);
  const merged = { ...DEFAULTS.lessonConfig, ...partial };
  const safe = LessonConfigSchema.parse(merged);
  await updateDoc(ref, {
    'lessonConfig': safe,
    updatedAt: serverTimestamp(),
    updatedBy: userId || null,
  });
}

export async function patchLessonConfig(clubId, patch, { userId } = {}) {
  const current = await getClubSettings(clubId);
  await updateLessonConfig(clubId, { ...current.lessonConfig, ...patch }, { userId });
}

export default {
  getClubSettings,
  subscribeClubSettings,
  updateBookingConfig,
  patchBookingConfig,
  updateLessonConfig,
  patchLessonConfig,
};
