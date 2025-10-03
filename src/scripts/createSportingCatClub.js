// =============================================
// FILE: src/scripts/createSportingCatClub.js
// Script per creare il circolo Sporting CAT
// =============================================

import { createClub } from '../services/clubs.js';
import { uid } from '../lib/ids.js';

/**
 * Crea il circolo Sporting CAT con tutti i dati appropriati
 */
export const createSportingCatClub = async () => {
  const clubData = {
    // Informazioni base del club
    name: "Sporting CAT",
    displayName: "Sporting CAT",
    description: "Club Sportivo specializzato in Padel e Tennis. Il nostro circolo offre campi moderni, istruttori qualificati e un ambiente accogliente per giocatori di tutti i livelli.",
    
    // Tipo e categoria
    type: "sports_club",
    category: "padel_tennis",
    
    // Location
    location: {
      address: "Via dello Sport, 123",
      city: "Milano", 
      region: "Lombardia",
      postalCode: "20100",
      country: "Italia",
      coordinates: {
        lat: 45.4642,
        lng: 9.1900
      }
    },
    
    // Contatti
    contact: {
      phone: "+39 02 1234567",
      email: "info@sportingcat.it",
      website: "https://www.sportingcat.it",
      whatsapp: "+39 345 1234567"
    },
    
    // Social media
    social: {
      facebook: "SportingCATMilano",
      instagram: "@sporting_cat_milano",
      youtube: "SportingCATOfficial"
    },
    
    // Orari di apertura
    hours: {
      monday: { open: "07:00", close: "23:00", isOpen: true },
      tuesday: { open: "07:00", close: "23:00", isOpen: true },
      wednesday: { open: "07:00", close: "23:00", isOpen: true },
      thursday: { open: "07:00", close: "23:00", isOpen: true },
      friday: { open: "07:00", close: "23:00", isOpen: true },
      saturday: { open: "08:00", close: "22:00", isOpen: true },
      sunday: { open: "08:00", close: "22:00", isOpen: true }
    },
    
    // Impostazioni
    settings: {
      publicVisibility: true,
      allowOnlineBooking: true,
      requireMembership: false,
      allowGuestPlayers: true,
      autoApproveBookings: false,
      maxAdvanceBookingDays: 14,
      cancellationHours: 24
    },
    
    // Sottoscrizione/stato
    subscription: {
      isActive: true,
      plan: "premium",
      startDate: new Date().toISOString(),
      features: [
        "unlimited_players",
        "advanced_booking",
        "tournament_management", 
        "statistics_analytics",
        "mobile_app",
        "whatsapp_integration"
      ]
    },
    
    // Servizi offerti
    services: [
      {
        id: uid(),
        name: "Lezioni di Padel",
        description: "Lezioni individuali e di gruppo con istruttori certificati",
        price: 50,
        duration: 60,
        category: "lessons"
      },
      {
        id: uid(),
        name: "Lezioni di Tennis", 
        description: "Corsi di tennis per tutti i livelli",
        price: 45,
        duration: 60,
        category: "lessons"
      },
      {
        id: uid(),
        name: "Noleggio Racchette",
        description: "Racchette professionali disponibili per il noleggio",
        price: 5,
        duration: 120,
        category: "equipment"
      }
    ],
    
    // Statistiche (inizialmente vuote, verranno popolate)
    statistics: {
      totalMembers: 0,
      totalMatches: 0,
      totalBookings: 0,
      monthlyRevenue: 0,
      averageRating: 4.8,
      totalCourts: 6
    },
    
    // Metadati
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin", // Verrà aggiornato con l'ID utente reale
    
    // Tag per ricerca
    tags: ["padel", "tennis", "milano", "lombardia", "sport", "club", "campi", "lezioni"],
    
    // Stato iniziale
    status: "active"
  };
  
  try {
    const clubId = await createClub(clubData);
    console.log("✅ Club Sporting CAT creato con successo:", clubId);
    return clubId;
  } catch (error) {
    console.error("❌ Errore nella creazione del club:", error);
    throw error;
  }
};

export default createSportingCatClub;