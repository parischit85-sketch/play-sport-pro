// =============================================
// FILE: src/features/players/types/playerTypes.js
// Tipi e strutture dati per il CRM giocatori
// =============================================

export const PLAYER_CATEGORIES = {
  MEMBER: 'member',
  NON_MEMBER: 'non-member',
  GUEST: 'guest',
  VIP: 'vip',
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
