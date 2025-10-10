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
 * Tipi di certificato medico
 */
export const CERTIFICATE_TYPES = {
  AGONISTIC: 'agonistic',
  NON_AGONISTIC: 'non-agonistic',
};

/**
 * Stati del certificato medico
 */
export const CERTIFICATE_STATUS = {
  VALID: 'valid',
  EXPIRING: 'expiring', // < 30 giorni
  EXPIRED: 'expired',
  MISSING: 'missing',
};

/**
 * Soglie di alert per scadenza certificato
 */
export const EXPIRY_WARNING_DAYS = 30; // Alert quando mancano 30 giorni
export const EXPIRY_CRITICAL_DAYS = 15; // Alert critico < 15 giorni

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

  // Tournament/Championship participation
  tournamentData: {
    isParticipant: false, // Partecipa al campionato
    initialRanking: null, // Ranking iniziale settato manualmente
    currentRanking: null, // Ranking attuale calcolato
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    points: 0,
    joinedAt: null, // Quando è stato attivato per il campionato
    activeSince: null, // Data inizio partecipazione
    isActive: true, // Può essere temporaneamente disattivato
    division: null, // Categoria/divisione nel campionato
    notes: '', // Note sulla partecipazione
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

  // Certificati medici
  medicalCertificates: {
    current: {
      id: '',
      type: 'agonistic', // 'agonistic' | 'non-agonistic'
      number: '', // Numero documento
      issueDate: null, // Data rilascio
      expiryDate: null, // Data scadenza
      doctor: '', // Nome medico/ente
      facility: '', // Struttura rilasciante
      fileUrl: '', // URL file caricato su Firebase Storage
      fileName: '', // Nome file originale
      uploadedAt: null, // Data caricamento
      uploadedBy: '', // Admin che ha caricato
      notes: '', // Note aggiuntive
    },
    history: [], // Array di certificati precedenti
    lastReminderSent: null, // Ultima notifica inviata
    remindersSent: 0, // Contatore reminder
  },

  // Stato certificato (calcolato automaticamente)
  certificateStatus: {
    isValid: false, // Certificato valido
    isExpiring: false, // In scadenza (< 30 giorni)
    isExpired: false, // Scaduto
    daysUntilExpiry: null, // Giorni rimanenti
    canBook: true, // Può prenotare
    status: 'missing', // 'valid' | 'expiring' | 'expired' | 'missing'
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
