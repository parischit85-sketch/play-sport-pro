// =============================================
// FILE: src/services/club-registration.js
// Club Registration Service
// Handles validation, duplicate prevention, and enhanced security
// =============================================

import { db } from './firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * List of available sports/disciplines a club can offer
 */
export const AVAILABLE_SPORTS = [
  { id: 'tennis', label: 'Tennis', icon: '🎾', color: 'emerald' },
  { id: 'padel', label: 'Padel', icon: '🎾', color: 'blue' },
  { id: 'calcetto', label: 'Calcetto', icon: '⚽', color: 'orange' },
  { id: 'volley', label: 'Pallavolo', icon: '🏐', color: 'yellow' },
  { id: 'basket', label: 'Pallacanestro', icon: '🏀', color: 'red' },
  { id: 'badminton', label: 'Badminton', icon: '🏸', color: 'purple' },
  { id: 'golf', label: 'Golf', icon: '⛳', color: 'green' },
  { id: 'fitness', label: 'Fitness', icon: '💪', color: 'pink' },
  { id: 'yoga', label: 'Yoga', icon: '🧘', color: 'indigo' },
  { id: 'nuoto', label: 'Nuoto', icon: '🏊', color: 'cyan' },
];

/**
 * Check if a club with the same name already exists in the same city
 */
export async function checkDuplicateClub(clubName, city) {
  try {
    const normalizedName = clubName.trim().toLowerCase();
    const normalizedCity = city.trim().toLowerCase();

    const q = query(
      collection(db, 'clubs'),
      where('status', '!=', 'rejected')
    );

    const snapshot = await getDocs(q);
    const duplicates = snapshot.docs.filter((doc) => {
      const data = doc.data();
      const docName = (data.name || '').trim().toLowerCase();
      const docCity = (data.address?.city || '').trim().toLowerCase();

      return docName === normalizedName && docCity === normalizedCity;
    });

    return {
      exists: duplicates.length > 0,
      existingClub: duplicates.length > 0 ? duplicates[0].data() : null,
    };
  } catch (error) {
    console.error('Error checking duplicate club:', error);
    throw new Error('Errore nel controllo dei duplicati. Riprova più tardi.');
  }
}

/**
 * Check if an email is already used by another club
 */
export async function checkEmailAvailability(email) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const q = query(
      collection(db, 'clubs'),
      where('contact.email', '==', normalizedEmail)
    );

    const snapshot = await getDocs(q);

    return {
      available: snapshot.empty,
      error: snapshot.empty ? null : 'Questa email è già registrata',
    };
  } catch (error) {
    console.error('Error checking email availability:', error);
    throw error;
  }
}

/**
 * Validate club registration data before submission
 */
export async function validateClubRegistration(formData) {
  const errors = [];

  // Basic validations
  if (!formData.clubName?.trim()) {
    errors.push('Nome del circolo obbligatorio');
  }

  if (!formData.clubEmail?.trim()) {
    errors.push('Email del circolo obbligatoria');
  }

  if (!formData.description?.trim()) {
    errors.push('Descrizione del circolo obbligatoria');
  }

  if (!formData.address?.city?.trim()) {
    errors.push('Città obbligatoria');
  }

  if (!formData.address?.street?.trim()) {
    errors.push('Indirizzo obbligatorio');
  }

  if (!formData.address?.postalCode || formData.address.postalCode.length < 5) {
    errors.push('CAP invalido (minimo 5 cifre)');
  }

  if (!formData.adminFirstName?.trim()) {
    errors.push('Nome operatore obbligatorio');
  }

  if (!formData.adminLastName?.trim()) {
    errors.push('Cognome operatore obbligatorio');
  }

  if (!formData.adminEmail?.trim()) {
    errors.push('Email operatore obbligatoria');
  }

  if (!formData.adminPhone?.trim()) {
    errors.push('Telefono operatore obbligatorio');
  }

  // Check for duplicates only if basic validations pass
  if (errors.length === 0) {
    const dupCheck = await checkDuplicateClub(formData.clubName, formData.address.city);
    if (dupCheck.exists) {
      errors.push(
        `Esiste già un circolo con il nome "${formData.clubName}" a ${formData.address.city}. Usa un nome diverso o contattaci.`
      );
    }

    const emailCheck = await checkEmailAvailability(formData.clubEmail);
    if (!emailCheck.available) {
      errors.push(emailCheck.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create initial club settings with sport preferences
 */
export function createClubSettings(selectedSports = []) {
  return {
    bookingDuration: 90,
    advanceBookingDays: 14,
    cancellationHours: 24,
    allowGuestBooking: false,
    requireEmailVerification: true,

    // Sport-specific settings
    sports: selectedSports.map((sportId) => {
      const sport = AVAILABLE_SPORTS.find((s) => s.id === sportId);
      return {
        id: sportId,
        label: sport?.label || sportId,
        enabled: true,
      };
    }),

    // Booking rules
    rules: {
      minParticipants: 2,
      maxParticipants: 4,
      minRatingToBook: 0,
      requirePhoneVerification: false,
    },

    // Notifications
    notifications: {
      emailOnNewBooking: true,
      emailOnCancellation: true,
      emailOnPayment: true,
      smsOnNewBooking: false,
    },

    // Capacity management
    capacity: {
      maxConcurrentBookings: 50,
      maxBookingsPerUser: 5,
      maxCancellationsPerMonth: 3,
    },
  };
}

/**
 * Generate club slug from name (for URLs)
 */
export function generateClubSlug(clubName) {
  return clubName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

/**
 * Get recommended initialization tasks for new club
 */
export function getOnboardingTasks() {
  return [
    {
      id: 'add-courts',
      title: 'Aggiungi i tuoi campi',
      description: 'Configura i campi sportivi disponibili',
      icon: '🏟️',
      priority: 1,
      timeEstimate: '10 min',
    },
    {
      id: 'add-instructors',
      title: 'Invita istruttori',
      description: 'Aggiungi gli istruttori al tuo circolo',
      icon: '👨‍🏫',
      priority: 2,
      timeEstimate: '5 min',
    },
    {
      id: 'set-availability',
      title: 'Imposta orari',
      description: 'Configura gli orari di apertura e disponibilità',
      icon: '⏰',
      priority: 3,
      timeEstimate: '15 min',
    },
    {
      id: 'verify-email',
      title: 'Verifica email',
      description: 'Conferma il tuo indirizzo email',
      icon: '📧',
      priority: 1,
      timeEstimate: '2 min',
    },
    {
      id: 'setup-payment',
      title: 'Metodi di pagamento',
      description: 'Configura i metodi di pagamento',
      icon: '💳',
      priority: 2,
      timeEstimate: '5 min',
    },
    {
      id: 'invite-members',
      title: 'Invita giocatori',
      description: 'Crea liste di giocatori e invitali',
      icon: '👥',
      priority: 3,
      timeEstimate: '10 min',
    },
  ];
}

/**
 * Track club registration event for analytics
 */
export function trackClubRegistration(clubData, source = 'web') {
  if (window.gtag) {
    window.gtag('event', 'club_registration', {
      club_name: clubData.clubName,
      sports_count: clubData.selectedSports?.length || 0,
      city: clubData.address?.city,
      source,
      timestamp: new Date().toISOString(),
    });
  }
}

export default {
  AVAILABLE_SPORTS,
  checkDuplicateClub,
  checkEmailAvailability,
  validateClubRegistration,
  createClubSettings,
  generateClubSlug,
  getOnboardingTasks,
  trackClubRegistration,
};
