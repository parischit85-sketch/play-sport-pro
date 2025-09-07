// =============================================
// FILE: src/services/bookings.js
// =============================================

// Configurazione campi e orari centralizzata
export const BOOKING_CONFIG = {
  courts: [
    {
      id: 'campo1',
      name: 'Campo 1 - Centrale',
      type: 'terra-rossa',
      price60: 45,
      price90: 65,
      features: ['Terra rossa', 'Illuminazione LED', 'Riscaldamento'],
      hasLighting: true,
      hasHeating: true,
      isOutdoor: false,
      premium: true
    },
    {
      id: 'campo2',
      name: 'Campo 2',
      type: 'terra-rossa',
      price60: 40,
      price90: 58,
      features: ['Terra rossa', 'Illuminazione', 'Riscaldamento'],
      hasLighting: true,
      hasHeating: true,
      isOutdoor: false,
      premium: false
    },
    {
      id: 'campo3',
      name: 'Campo 3',
      type: 'cemento',
      price60: 35,
      price90: 50,
      features: ['Cemento', 'Illuminazione', 'Riscaldamento'],
      hasLighting: true,
      hasHeating: true,
      isOutdoor: false,
      premium: false
    },
    {
      id: 'campo4',
      name: 'Campo 4 - Scoperto',
      type: 'terra-rossa',
      price60: 30,
      price90: 42,
      features: ['Terra rossa', 'Solo diurno'],
      hasLighting: false,
      hasHeating: false,
      isOutdoor: true,
      premium: false
    },
    {
      id: 'campo5',
      name: 'Campo 5',
      type: 'cemento',
      price60: 32,
      price90: 46,
      features: ['Cemento', 'Illuminazione'],
      hasLighting: true,
      hasHeating: false,
      isOutdoor: false,
      premium: false
    },
    {
      id: 'campo6',
      name: 'Campo 6 - Padel',
      type: 'padel',
      price60: 25,
      price90: 35,
      features: ['Padel', 'Illuminazione', 'Riscaldamento'],
      hasLighting: true,
      hasHeating: true,
      isOutdoor: false,
      premium: false
    },
    {
      id: 'campo7',
      name: 'Campo 7 - Calcetto',
      type: 'calcetto',
      price60: 40,
      price90: 55,
      features: ['Calcetto', 'Illuminazione', 'Riscaldamento'],
      hasLighting: true,
      hasHeating: true,
      isOutdoor: false,
      premium: false
    }
  ],
  
  timeSlots: {
    start: 11, // 11:00
    end: 23,   // 23:30 (ultimo slot)
    interval: 30 // 30 minuti
  },
  
  pricing: {
    lighting: 5,
    heating: 8
  },
  
  rules: {
    maxAdvanceDays: 7,
    minDuration: 60,
    maxDuration: 90,
    allowedDurations: [60, 90]
  }
};

// Genera slot temporali disponibili
export function getTimeSlots() {
  const slots = [];
  for (let hour = BOOKING_CONFIG.timeSlots.start; hour <= BOOKING_CONFIG.timeSlots.end; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < BOOKING_CONFIG.timeSlots.end) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
}

// Genera prossimi giorni disponibili
export function getAvailableDays() {
  const days = [];
  for (let i = 0; i < BOOKING_CONFIG.rules.maxAdvanceDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      label: i === 0 ? 'Oggi' : i === 1 ? 'Domani' : 
             date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
    });
  }
  return days;
}

// Verifica se uno slot è disponibile
export function isSlotAvailable(courtId, date, time, duration, bookings, excludeBookingId = null) {
  const startTime = time;
  const endTime = calculateEndTime(time, duration);
  
  return !bookings.some(booking => {
    if (booking.id === excludeBookingId) return false;
    if (booking.courtId !== courtId || booking.date !== date) return false;
    if (booking.status === 'cancelled') return false;
    
    const bookingEnd = calculateEndTime(booking.time, booking.duration);
    
    // Controlla sovrapposizioni
    return (
      (startTime >= booking.time && startTime < bookingEnd) ||
      (endTime > booking.time && endTime <= bookingEnd) ||
      (startTime <= booking.time && endTime >= bookingEnd)
    );
  });
}

// Calcola orario di fine basato su inizio e durata
function calculateEndTime(startTime, duration) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
}

// Calcola prezzo totale
export function calculatePrice(court, duration, lighting = false, heating = false) {
  if (!court) return 0;
  
  const basePrice = duration === 60 ? court.price60 : court.price90;
  const lightingCost = (lighting && court.hasLighting) ? BOOKING_CONFIG.pricing.lighting : 0;
  const heatingCost = (heating && court.hasHeating) ? BOOKING_CONFIG.pricing.heating : 0;
  
  return basePrice + lightingCost + heatingCost;
}

// Valida una prenotazione
export function validateBooking(booking, bookings, courts) {
  const errors = [];
  
  // Controlla campo esistente
  const court = courts.find(c => c.id === booking.courtId);
  if (!court) {
    errors.push('Campo non valido');
    return errors;
  }
  
  // Controlla durata
  if (!BOOKING_CONFIG.rules.allowedDurations.includes(booking.duration)) {
    errors.push('Durata non valida');
  }
  
  // Controlla disponibilità
  if (!isSlotAvailable(booking.courtId, booking.date, booking.time, booking.duration, bookings, booking.id)) {
    errors.push('Slot non disponibile');
  }
  
  // Controlla opzioni vs capacità campo
  if (booking.lighting && !court.hasLighting) {
    errors.push('Illuminazione non disponibile per questo campo');
  }
  
  if (booking.heating && !court.hasHeating) {
    errors.push('Riscaldamento non disponibile per questo campo');
  }
  
  return errors;
}

// Crea ID univoco per prenotazione
export function generateBookingId() {
  return `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Stato prenotazione
export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  PENDING: 'pending'
};

// Storage centralizzato - ora con supporto cloud
const STORAGE_KEY = 'ml-field-bookings';

// Importa servizi cloud
import { 
  loadPublicBookings, 
  createCloudBooking, 
  updateCloudBooking, 
  cancelCloudBooking,
  getPublicBookings as getCloudPublicBookings 
} from './cloud-bookings.js';

// Flag per determinare se usare il cloud o localStorage
let useCloudStorage = false;
let currentUser = null;
let warnedMissingIndex = false;

export function setCloudMode(enabled, user = null) {
  useCloudStorage = enabled;
  currentUser = user;
}

export async function loadBookings() {
  if (useCloudStorage && currentUser) {
    try {
      return await loadPublicBookings();
    } catch (error) {
      console.warn('Errore caricamento da cloud, fallback a localStorage:', error);
      return loadBookingsLocal();
    }
  }
  return loadBookingsLocal();
}

function loadBookingsLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function saveBookings(bookings) {
  if (useCloudStorage && currentUser) {
    // Per il cloud, non salviamo tutto l'array ma gestiamo singolarmente
    // Questa funzione è principalmente per compatibilità
    return true;
  }
  return saveBookingsLocal(bookings);
}

function saveBookingsLocal(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    return true;
  } catch {
    return false;
  }
}

// Crea una nuova prenotazione
export async function createBooking(bookingData, user) {
  if (useCloudStorage && user) {
    try {
    const created = await createCloudBooking(bookingData, user);
    return { ...created, _storage: 'cloud' };
    } catch (error) {
      console.warn('Errore creazione nel cloud, fallback a localStorage:', error);
    const localCreated = createBookingLocal(bookingData, user);
    return { ...localCreated, _storage: 'local' };
    }
  }
  const created = createBookingLocal(bookingData, user);
  return { ...created, _storage: 'local' };
}

function createBookingLocal(bookingData, user) {
  const booking = {
    id: generateBookingId(),
    courtId: bookingData.courtId,
    courtName: bookingData.courtName,
    date: bookingData.date,
    time: bookingData.time,
    duration: bookingData.duration,
    lighting: bookingData.lighting || false,
    heating: bookingData.heating || false,
    price: bookingData.price,
    
    // Dati utente (nascosti nella vista pubblica)
    bookedBy: user?.displayName || user?.email || 'Anonimo',
    userEmail: user?.email,
    userPhone: bookingData.userPhone || '',
    players: bookingData.players || [],
    notes: bookingData.notes || '',
    
    // Metadata
    status: BOOKING_STATUS.CONFIRMED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: user?.uid || null
  };
  // Persisti subito nel localStorage
  const current = loadBookingsLocal();
  current.push(booking);
  saveBookingsLocal(current);
  return booking;
}

// Aggiorna una prenotazione esistente
export async function updateBooking(bookingId, updates, user) {
  if (useCloudStorage && user) {
    try {
      return await updateCloudBooking(bookingId, updates, user);
    } catch (error) {
      console.warn('Errore aggiornamento nel cloud, fallback a localStorage:', error);
      return updateBookingLocal(bookingId, updates, user);
    }
  }
  return updateBookingLocal(bookingId, updates, user);
}

function updateBookingLocal(bookingId, updates, user) {
  const bookings = loadBookingsLocal();
  const index = bookings.findIndex(b => b.id === bookingId);
  
  if (index === -1) return null;
  
  const updatedBooking = {
    ...bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: user?.uid || null
  };
  
  bookings[index] = updatedBooking;
  saveBookingsLocal(bookings);
  
  return updatedBooking;
}

// Cancella una prenotazione
export async function cancelBooking(bookingId, user) {
  if (useCloudStorage && user) {
    try {
      await cancelCloudBooking(bookingId, user);
      return { status: BOOKING_STATUS.CANCELLED };
    } catch (error) {
      console.warn('Errore cancellazione nel cloud, fallback a localStorage:', error);
      return updateBookingLocal(bookingId, { 
        status: BOOKING_STATUS.CANCELLED,
        cancelledAt: new Date().toISOString()
      }, user);
    }
  }
  return updateBookingLocal(bookingId, { 
    status: BOOKING_STATUS.CANCELLED,
    cancelledAt: new Date().toISOString()
  }, user);
}

// Ottieni prenotazioni filtrate per vista pubblica (senza dati sensibili)
export async function getPublicBookings() {
  if (useCloudStorage) {
    try {
      return await getCloudPublicBookings();
    } catch (error) {
      if (error?.code === 'failed-precondition') {
        if (!warnedMissingIndex) {
          console.warn('Cloud bookings richiedono un indice: uso dati locali (fallback).');
          warnedMissingIndex = true;
        }
      } else {
        console.warn('Errore caricamento pubbliche da cloud, fallback a localStorage:', error);
      }
      return getPublicBookingsLocal();
    }
  }
  return getPublicBookingsLocal();
}

function getPublicBookingsLocal() {
  const bookings = loadBookingsLocal();
  return bookings
    .filter(b => b.status === BOOKING_STATUS.CONFIRMED)
    .map(booking => ({
      id: booking.id,
      courtId: booking.courtId,
      courtName: booking.courtName,
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      status: booking.status
    }));
}

// Ottieni tutte le prenotazioni per vista admin
export async function getAdminBookings() {
  if (useCloudStorage && currentUser) {
    try {
      return await loadPublicBookings(); // Gli admin vedono tutto
    } catch (error) {
      console.warn('Errore caricamento admin da cloud, fallback a localStorage:', error);
      return loadBookingsLocal();
    }
  }
  return loadBookingsLocal();
}

// Funzione per inizializzare e garantire la disponibilità dei dati
export async function ensureBookingsAvailable() {
  try {
    // Forza il caricamento di tutti i dati pubblici
    const publicBookings = await getPublicBookings();
    
    // Prova a caricare i dati locali e confronta
    const localBookings = await loadBookings();
    
    // Se non ci sono dati locali ma ci sono dati pubblici, aggiorna localStorage
    if (localBookings.length === 0 && publicBookings.length > 0) {
      await saveBookingsLocal(publicBookings);
    }
    
    // Restituisce il massimo tra i due
    return publicBookings.length > localBookings.length ? publicBookings : localBookings;
  } catch (error) {
    console.error('Error ensuring bookings availability:', error);
    return [];
  }
}

// Funzione per simulare l'inizializzazione completa che fa ModernBookingInterface
export async function initializeBookingSystem(user) {
  try {
    // 1. Configura modalità cloud come fa ModernBookingInterface
    setCloudMode(Boolean(user?.uid), user);
    
    // 2. Carica tutti i dati pubblici
    const publicBookings = await getPublicBookings();
    
    // 3. Se c'è un utente, carica i suoi dati specifici dal cloud
    if (user && user.uid) {
      try {
        const { loadActiveUserBookings } = await import('@services/cloud-bookings.js');
        const userCloudBookings = await loadActiveUserBookings(user.uid);
      } catch (cloudError) {
        console.warn('initializeBookingSystem: Cloud user data failed:', cloudError);
      }
    }
    
    // 4. Sincronizza tutto il sistema
    await syncAllBookings();
    
    return true;
  } catch (error) {
    console.error('initializeBookingSystem: Failed:', error);
    return false;
  }
}

// Funzione per sincronizzare tutti i dati disponibili
export async function syncAllBookings() {
  try {
    let allBookings = [];
    
    // Carica dati pubblici (cloud + local merged)
    try {
      const publicBookings = await getPublicBookings();
      allBookings = [...publicBookings];
    } catch (error) {
      console.warn('syncAllBookings: Failed to load public bookings:', error);
    }
    
    // Carica anche localStorage separatamente
    try {
      const localBookings = await loadBookingsLocal();
      
      // Merge senza duplicati
      const bookingMap = new Map();
      
      // Prima aggiungi quelli esistenti
      allBookings.forEach(booking => {
        const key = booking.id || `${booking.date}-${booking.time}-${booking.courtId}`;
        bookingMap.set(key, booking);
      });
      
      // Poi aggiungi quelli locali che non esistono già
      localBookings.forEach(booking => {
        const key = booking.id || `${booking.date}-${booking.time}-${booking.courtId}`;
        if (!bookingMap.has(key)) {
          bookingMap.set(key, booking);
        }
      });
      
      allBookings = Array.from(bookingMap.values());
      
      // Aggiorna localStorage con tutti i dati
      await saveBookingsLocal(allBookings);
      
    } catch (error) {
      console.warn('syncAllBookings: Failed to sync local storage:', error);
    }
    
    return allBookings;
  } catch (error) {
    console.error('syncAllBookings: Complete failure:', error);
    return [];
  }
}

// Funzione per ottenere le prenotazioni dell'utente specifico in modo robusto
export async function getUserBookings(user, forceFullInit = false) {
  if (!user) return [];
  
  try {
    // Se richiesto, esegui l'inizializzazione completa
    if (forceFullInit) {
      await initializeBookingSystem(user);
    } else {
      // Altrimenti solo sincronizzazione
      await syncAllBookings();
    }
    
    let userBookings = [];
    
    // Prova con il servizio cloud se disponibile
    if (useCloudStorage && user.uid) {
      try {
        const { loadActiveUserBookings } = await import('@services/cloud-bookings.js');
        const cloudBookings = await loadActiveUserBookings(user.uid);
        if (cloudBookings && cloudBookings.length > 0) {
          userBookings = cloudBookings;
        }
      } catch (cloudError) {
        console.warn('Cloud user bookings not available:', cloudError);
      }
    }
    
    // Carica sempre anche da localStorage (ora sincronizzato) e unisci i risultati
    try {
      const allBookings = await loadBookings();
      const localUserBookings = allBookings.filter(booking => 
        booking.userEmail === user.email || 
        booking.email === user.email ||
        booking.userId === user.uid
      );
      
      // Se abbiamo sia cloud che local, unisci eliminando duplicati
      if (userBookings.length > 0 && localUserBookings.length > 0) {
        const bookingMap = new Map();
        
        // Prima aggiungi i cloud bookings
        userBookings.forEach(booking => {
          bookingMap.set(booking.id || `${booking.date}-${booking.time}-${booking.courtId}`, booking);
        });
        
        // Poi aggiungi i local bookings (senza sovrascrivere)
        localUserBookings.forEach(booking => {
          const key = booking.id || `${booking.date}-${booking.time}-${booking.courtId}`;
          if (!bookingMap.has(key)) {
            bookingMap.set(key, booking);
          }
        });
        
        userBookings = Array.from(bookingMap.values());
      } else if (localUserBookings.length > 0) {
        userBookings = localUserBookings;
      }
    } catch (localError) {
      console.warn('localStorage user bookings not available:', localError);
    }
    
    // Filtra solo prenotazioni future
    const now = new Date();
    const activeBookings = userBookings.filter(booking => {
      const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
      return bookingDateTime > now;
    });

    // Ordina per data/ora
    activeBookings.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}:00`);
      const dateB = new Date(`${b.date}T${b.time}:00`);
      return dateA - dateB;
    });

    return activeBookings;
  } catch (error) {
    console.error('Error loading user bookings:', error);
    return [];
  }
}

// Funzione helper per aggiungere prenotazioni di test con nomi reali
export function addTestBookingsWithParticipants(user) {
  const testBookings = [
    {
      courtId: 'court-1',
      courtName: 'Campo 1 (Outdoor)',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Domani
      time: '20:00',
      duration: 90,
      lighting: true,
      price: 32,
      players: [
        { name: 'Marco Rossi', phone: '333-1234567' },
        { name: 'Luca Bianchi', phone: '333-7654321' }
      ],
      notes: 'Partita settimanale del mercoledì'
    },
    {
      courtId: 'court-2', 
      courtName: 'Campo 2 (Outdoor)',
      date: new Date(Date.now() + 2*86400000).toISOString().split('T')[0], // Dopodomani
      time: '18:30',
      duration: 60,
      lighting: false,
      price: 24,
      players: [
        { name: 'Andrea Verdi', phone: '333-1111111' },
        { name: 'Paolo Neri', phone: '333-2222222' },
        { name: 'Giuseppe Conti', phone: '333-3333333' }
      ],
      notes: 'Torneo amichevole'
    },
    {
      courtId: 'court-1',
      courtName: 'Campo 1 (Outdoor)', 
      date: new Date().toISOString().split('T')[0], // Oggi
      time: '21:00',
      duration: 120,
      lighting: true,
      price: 48,
      players: [
        { name: 'Marco Rossi', phone: '333-1234567' }
      ],
      notes: 'Allenamento lungo - cerco altri giocatori!'
    }
  ];

  // Aggiungi le prenotazioni di test al localStorage
  testBookings.forEach(bookingData => {
    const booking = createBookingLocal(bookingData, user);
    console.log('Added test booking:', booking);
  });

  return testBookings.length;
}
