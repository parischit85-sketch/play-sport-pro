// Modalità offline temporanea per testing
// Questo file può essere usato per testare l'app senza Firebase
export const OFFLINE_MODE = {
  enabled: true,
  reason: 'Firebase Authentication non ancora configurata',
  
  // Dati mock per testing
  mockUser: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Utente Test',
    emailVerified: true
  },
  
  mockLeagueData: {
    name: 'Paris League Test',
    players: [
      { id: '1', name: 'Mario Rossi', rating: 1200 },
      { id: '2', name: 'Luigi Verdi', rating: 1150 }
    ],
    matches: [],
    bookings: []
  }
};

// Controlla se Firebase è configurato correttamente
export async function checkFirebaseConfig() {
  try {
    // Test basilare della configurazione
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    
    if (!apiKey || !projectId) {
      return { configured: false, reason: 'Variabili environment mancanti' };
    }
    
    // Test connessione (semplificato)
    const response = await fetch(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${apiKey}`);
    
    if (response.status === 400) {
      return { configured: false, reason: 'Authentication non abilitata nel progetto Firebase' };
    }
    
    return { configured: true };
  } catch (error) {
    return { configured: false, reason: `Errore connessione: ${error.message}` };
  }
}
