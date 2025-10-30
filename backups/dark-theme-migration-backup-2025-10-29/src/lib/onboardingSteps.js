/**
 * Onboarding Steps Configuration - CHK-306
 *
 * Defines the tour steps for different user roles.
 * Each step includes:
 * - target: CSS selector for element to highlight
 * - title: Step title
 * - content: Description text
 * - placement: Tooltip position (top, bottom, left, right)
 * - action: Optional action text (e.g., "Click here to...")
 */

export const ONBOARDING_TOURS = {
  // New User - First Time Experience
  newUser: [
    {
      target: '[data-tour="dashboard"]',
      title: '👋 Benvenuto su Play & Sport!',
      content:
        'Questa è la tua dashboard personale. Qui puoi vedere le tue prenotazioni, statistiche e accedere a tutte le funzioni.',
      placement: 'bottom',
      highlightPadding: 10,
    },
    {
      target: '[data-tour="navigation"]',
      title: '🧭 Menu di Navigazione',
      content:
        'Usa il menu per navigare tra le diverse sezioni: Prenota, Classifica, Tornei e Profilo.',
      placement: 'bottom',
      highlightPadding: 5,
    },
    {
      target: '[data-tour="book-button"]',
      title: '📅 Prenota un Campo',
      content:
        'Clicca qui per prenotare un campo. Scegli data, orario e campo disponibile in pochi passaggi.',
      placement: 'left',
      action: 'Prova a prenotare',
    },
    {
      target: '[data-tour="profile"]',
      title: '👤 Il Tuo Profilo',
      content: 'Completa il tuo profilo con foto, preferenze di gioco e informazioni di contatto.',
      placement: 'left',
      highlightPadding: 8,
    },
    {
      target: '[data-tour="notifications"]',
      title: '🔔 Notifiche',
      content:
        'Ricevi notifiche per conferme prenotazioni, promemoria partite e aggiornamenti tornei.',
      placement: 'bottom',
    },
  ],

  // Club Admin - Management Tour
  clubAdmin: [
    {
      target: '[data-tour="admin-panel"]',
      title: '🎯 Pannello di Amministrazione',
      content: 'Da qui gestisci i campi, le prenotazioni e monitora le performance del tuo club.',
      placement: 'bottom',
      highlightPadding: 10,
    },
    {
      target: '[data-tour="courts-manager"]',
      title: '🏟️ Gestione Campi',
      content: 'Aggiungi, modifica ed elimina campi. Configura orari di disponibilità e prezzi.',
      placement: 'right',
      action: 'Apri gestione campi',
    },
    {
      target: '[data-tour="bookings-list"]',
      title: '📋 Lista Prenotazioni',
      content:
        'Visualizza tutte le prenotazioni in tempo reale. Conferma, modifica o cancella prenotazioni.',
      placement: 'left',
    },
    {
      target: '[data-tour="analytics"]',
      title: '📊 Analytics & Report',
      content: 'Monitora revenue, utilizzo campi e comportamento utenti con grafici interattivi.',
      placement: 'bottom',
      action: 'Vedi analytics',
    },
    {
      target: '[data-tour="settings"]',
      title: '⚙️ Impostazioni Club',
      content: 'Configura orari di apertura, politiche di cancellazione e metodi di pagamento.',
      placement: 'left',
    },
  ],

  // Booking Flow - In-App Tutorial
  bookingFlow: [
    {
      target: '[data-tour="club-selector"]',
      title: '1️⃣ Scegli il Club',
      content:
        'Seleziona il club dove vuoi giocare. Puoi filtrare per città o salvare i tuoi club preferiti.',
      placement: 'bottom',
      highlightPadding: 8,
    },
    {
      target: '[data-tour="date-picker"]',
      title: '2️⃣ Seleziona la Data',
      content: 'Scegli il giorno in cui vuoi giocare. I giorni con disponibilità sono evidenziati.',
      placement: 'right',
    },
    {
      target: '[data-tour="time-slot"]',
      title: '3️⃣ Orario e Durata',
      content: 'Seleziona orario di inizio e durata della prenotazione (60, 90 o 120 minuti).',
      placement: 'top',
    },
    {
      target: '[data-tour="court-grid"]',
      title: '4️⃣ Scegli il Campo',
      content: 'Visualizza i campi disponibili con prezzi. I campi occupati sono disabilitati.',
      placement: 'top',
      highlightPadding: 12,
    },
    {
      target: '[data-tour="booking-summary"]',
      title: '5️⃣ Riepilogo Prenotazione',
      content: 'Verifica i dettagli: campo, orario, prezzo totale. Poi conferma e paga.',
      placement: 'left',
      action: 'Conferma prenotazione',
    },
  ],

  // Feature Discovery - Contextual Tooltips
  featureDiscovery: [
    {
      target: '[data-tour="dark-mode"]',
      title: '🌙 Modalità Scura',
      content: "Attiva la modalità scura per ridurre l'affaticamento degli occhi durante la notte.",
      placement: 'bottom',
      trigger: 'hover',
    },
    {
      target: '[data-tour="favorites"]',
      title: '⭐ Aggiungi ai Preferiti',
      content: 'Salva i tuoi club preferiti per accesso rapido.',
      placement: 'left',
      trigger: 'hover',
    },
    {
      target: '[data-tour="share"]',
      title: '📤 Condividi',
      content: 'Condividi la prenotazione con i tuoi amici via WhatsApp, Email o SMS.',
      placement: 'top',
      trigger: 'hover',
    },
    {
      target: '[data-tour="calendar-sync"]',
      title: '📆 Sincronizza Calendario',
      content: 'Esporta la prenotazione nel tuo Google Calendar o Apple Calendar.',
      placement: 'bottom',
      trigger: 'hover',
    },
  ],
};

// Onboarding progress tracking
export const ONBOARDING_STORAGE_KEY = 'playAndSport_onboarding';

export const getOnboardingProgress = () => {
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading onboarding progress:', error);
    return {};
  }
};

export const saveOnboardingProgress = (tourName, step, completed = false) => {
  try {
    const progress = getOnboardingProgress();
    progress[tourName] = {
      currentStep: step,
      completed,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving onboarding progress:', error);
  }
};

export const hasCompletedTour = (tourName) => {
  const progress = getOnboardingProgress();
  return progress[tourName]?.completed || false;
};

export const resetOnboarding = () => {
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
};

// Helper to check if user should see onboarding
export const shouldShowOnboarding = (userRole, tourName) => {
  // Show if not completed and user role matches
  if (hasCompletedTour(tourName)) return false;

  const roleMapping = {
    newUser: ['user'],
    clubAdmin: ['club_admin', 'admin'],
    bookingFlow: ['user', 'club_admin', 'admin'],
    featureDiscovery: ['user', 'club_admin', 'admin'],
  };

  return roleMapping[tourName]?.includes(userRole) || false;
};
