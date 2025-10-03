// =============================================
// FILE: src/features/players/types/playerTypes.js
// Tipi e strutture dati per il CRM giocatori
// =============================================

export const PLAYER_CATEGORIES = {
  MEMBER: 'member',
  NON_MEMBER: 'non-member',
  GUEST: 'guest',
  VIP: 'vip',
  INSTRUCTOR: 'instructor',
};

export const SUBSCRIPTION_TYPES = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual',
  LIFETIME: 'lifetime',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
};

export const COMMUNICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  NOTIFICATION: 'notification',
};

export const NOTE_TYPES = {
  GENERAL: 'general',
  BOOKING: 'booking',
  PAYMENT: 'payment',
  DISCIPLINARY: 'disciplinary',
  MEDICAL: 'medical',
};

/**
 * Struttura completa del giocatore nel CRM
 */
export const createPlayerSchema = () => ({
  // Identità base
  id: '',
  name: '',
  firstName: '',
  lastName: '',

  // Dati anagrafici
  email: '',
  phone: '',
  dateOfBirth: null,
  fiscalCode: '',
  address: {
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Italia',
  },

  // Dati sportivi
  baseRating: 1000,
  rating: 1000,
  category: PLAYER_CATEGORIES.NON_MEMBER,

  // Instructor data (only for INSTRUCTOR category)
  instructorData: {
    isInstructor: false,
    color: '#3B82F6', // Default blue color
    specialties: [], // ['padel', 'tennis', 'fitness']
    hourlyRate: 0,
    // Prezzi per numero di partecipanti (prezzo totale lezione, non per partecipante)
    priceSingle: 0, // Lezione individuale (1 partecipante)
    priceCouple: 0, // Lezione di coppia (2 partecipanti)
    priceThree: 0, // Lezione per 3 partecipanti
    priceMatchLesson: 0, // Lezione match/eventi speciali (usata per 4+ partecipanti)
    availability: {}, // Time slots availability
    bio: '',
    certifications: [],
  },

  // Account collegato
  linkedAccountId: null,
  linkedAccountEmail: null,
  isAccountLinked: false,

  // Wallet e crediti
  wallet: {
    balance: 0,
    currency: 'EUR',
    lastUpdate: null,
    transactions: [],
  },

  // Abbonamenti
  subscriptions: [],

  // Tag e categorizzazione
  tags: [],
  customFields: {},

  // Note e comunicazioni
  notes: [],
  communications: [],

  // Storico attività
  bookingHistory: [],
  matchHistory: [],

  // Metadata
  createdAt: null,
  updatedAt: null,
  lastActivity: null,
  isActive: true,

  // Preferenze comunicazione
  communicationPreferences: {
    email: true,
    sms: false,
    whatsapp: false,
    notifications: true,
  },
});

/**
 * Struttura transazione wallet
 */
export const createTransactionSchema = () => ({
  id: '',
  amount: 0,
  type: 'credit', // credit, debit, refund, bonus
  description: '',
  reference: '', // booking ID, payment ID, etc.
  createdAt: null,
  createdBy: null,
});

/**
 * Struttura abbonamento
 */
export const createSubscriptionSchema = () => ({
  id: '',
  type: SUBSCRIPTION_TYPES.MONTHLY,
  status: SUBSCRIPTION_STATUS.ACTIVE,
  startDate: null,
  endDate: null,
  price: 0,
  currency: 'EUR',
  benefits: [],
  renewalCount: 0,
  createdAt: null,
  lastRenewal: null,
});

/**
 * Struttura nota
 */
export const createNoteSchema = () => ({
  id: '',
  type: NOTE_TYPES.GENERAL,
  title: '',
  content: '',
  isPrivate: false,
  createdAt: null,
  createdBy: null,
  tags: [],
});

/**
 * Struttura comunicazione
 */
export const createCommunicationSchema = () => ({
  id: '',
  type: COMMUNICATION_TYPES.EMAIL,
  subject: '',
  content: '',
  recipient: '',
  status: 'pending', // pending, sent, delivered, failed
  sentAt: null,
  deliveredAt: null,
  createdAt: null,
  createdBy: null,
});

/**
 * Struttura lesson booking
 */
export const createLessonBookingSchema = () => ({
  id: '',
  studentId: '', // Player ID who booked the lesson
  instructorId: '', // Instructor ID
  courtId: '', // Court where the lesson takes place
  date: '', // YYYY-MM-DD
  timeSlot: '', // HH:MM-HH:MM (e.g., "09:00-10:00")
  duration: 60, // Duration in minutes
  type: 'individual', // 'individual', 'group'
  status: 'confirmed', // 'pending', 'confirmed', 'completed', 'cancelled'
  price: 0,
  notes: '',
  createdAt: null,
  updatedAt: null,
  bookedBy: '', // User who made the booking
});

/**
 * Struttura time slot per lezioni
 */
export const createLessonTimeSlotSchema = () => ({
  id: '',
  startTime: '', // HH:MM
  endTime: '', // HH:MM
  dayOfWeek: 0, // 0=Sunday, 1=Monday, etc.
  instructorIds: [], // Array of instructor IDs available in this slot
  courtIds: [], // Array of court IDs available for this slot
  maxBookings: 1, // How many lessons can be booked in this slot
  isActive: true,
  createdAt: null,
  updatedAt: null,
});

/**
 * Struttura configurazione lezioni
 */
export const createLessonConfigSchema = () => ({
  timeSlots: [], // Array of lesson time slots
  defaultDuration: 60,
  allowedDurations: [60, 90],
  bookingAdvanceDays: 14, // How many days in advance can book
  cancellationHours: 24, // Hours before lesson to allow cancellation
  isEnabled: false, // Enable/disable lesson booking system
});
