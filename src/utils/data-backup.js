// =============================================
// FILE: src/utils/data-backup.js
// =============================================

const BACKUP_KEY = 'paris-league-backup';
const AUTO_BACKUP_KEY = 'paris-league-auto-backup';

// Backup automatico ogni 5 minuti
export function startAutoBackup() {
  setInterval(() => {
    const leagueData = localStorage.getItem('paris-league-v1');
    const bookingData = localStorage.getItem('padel-bookings');
    
    if (leagueData || bookingData) {
      const backup = {
        timestamp: new Date().toISOString(),
        leagueData: leagueData,
        bookingData: bookingData,
        version: '2.1.0'
      };
      
      localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(backup));
      console.log('🔄 Auto-backup creato:', new Date().toLocaleTimeString());
    }
  }, 5 * 60 * 1000); // Ogni 5 minuti
}

// Backup manuale
export function createManualBackup() {
  const leagueData = localStorage.getItem('paris-league-v1');
  const bookingData = localStorage.getItem('padel-bookings');
  
  const backup = {
    timestamp: new Date().toISOString(),
    leagueData: leagueData,
    bookingData: bookingData,
    version: '2.1.0',
    type: 'manual'
  };
  
  const backupString = JSON.stringify(backup, null, 2);
  
  // Salva nel localStorage
  localStorage.setItem(BACKUP_KEY, backupString);
  
  // Crea file scaricabile
  const blob = new Blob([backupString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paris-league-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  return backup;
}

// Ripristino da backup
export function restoreFromBackup(backupData) {
  try {
    const backup = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
    
    if (backup.leagueData) {
      localStorage.setItem('paris-league-v1', backup.leagueData);
    }
    
    if (backup.bookingData) {
      localStorage.setItem('padel-bookings', backup.bookingData);
    }
    
  console.log('✅ Backup ripristinato:', backup.timestamp);
  return { success: true, backup };
} catch (error) {
  console.error('❌ Errore nel ripristino:', error);
  return { success: false, error: error.message };
}
}

// Ripristino da backup JSON completo (formato del tuo backup)
export function restoreFromJsonBackup(jsonBackup) {
try {
  const backup = typeof jsonBackup === 'string' ? JSON.parse(jsonBackup) : jsonBackup;
  
  // Verifica che sia un backup valido con la struttura corretta
  if (!backup.players || !backup.matches || !backup.courts || !backup.bookings) {
    throw new Error('Backup non valido: mancano dati essenziali');
  }
  
  console.log('📦 Ripristinando backup completo...');
  console.log(`🏆 ${backup.players.length} giocatori`);
  console.log(`⚽ ${backup.matches.length} partite`);
  console.log(`🏟️ ${backup.courts.length} campi`);
  console.log(`📅 ${backup.bookings.length} prenotazioni`);
  
  // 🚨 IMPORTANTE: Cancella prima i dati esistenti per evitare conflitti
  console.log('🗑️ Cancellando dati esistenti...');
  localStorage.removeItem('paris-league-v1');
  localStorage.removeItem('padel-bookings');
  
  // Converti il formato del backup nel formato utilizzato dall'app
  const leagueData = {
    players: backup.players.map(player => ({
      id: player.id,
      name: player.name,
      baseRating: player.baseRating || player.rating || 1000,
      rating: player.rating || 1000,
      matches: 0,
      wins: 0,
      losses: 0
    })),
    matches: backup.matches || [],
    courts: backup.courts || [],
    bookingConfig: backup.bookingConfig || {
      slotMinutes: 30,
      dayStartHour: 8,
      dayEndHour: 23,
      defaultDurations: [60, 90, 120],
      pricing: {
        full: [{
          label: 'Tariffa Standard',
          pricePerHour: 24,
          startHour: 8,
          startMinute: 0,
          endHour: 23,
          endMinute: 0,
          days: [1,2,3,4,5,6,0],
          courts: []
        }],
        discounted: []
      },
      addons: {
        lightingEnabled: true,
        lightingFee: 2,
        heatingEnabled: true,
        heatingFee: 4
      }
    }
  };
  
  const bookingData = backup.bookings || [];
  
  // Salva nei localStorage
  localStorage.setItem('paris-league-v1', JSON.stringify(leagueData));
  localStorage.setItem('padel-bookings', JSON.stringify(bookingData));
  
  console.log('✅ Backup completo ripristinato!');
  console.log('🔄 Al prossimo caricamento, verranno utilizzati i tuoi dati reali');
  
  return { 
    success: true, 
    backup, 
    stats: {
      players: backup.players.length,
      matches: backup.matches.length,
      courts: backup.courts.length,
      bookings: backup.bookings.length
    }
  };
} catch (error) {
  console.error('❌ Errore nel ripristino completo:', error);
  return { success: false, error: error.message };
}
}// Controllo backup disponibili
export function getAvailableBackups() {
  const autoBackup = localStorage.getItem(AUTO_BACKUP_KEY);
  const manualBackup = localStorage.getItem(BACKUP_KEY);
  
  const backups = [];
  
  if (autoBackup) {
    try {
      const parsed = JSON.parse(autoBackup);
      backups.push({
        type: 'auto',
        timestamp: parsed.timestamp,
        data: parsed
      });
    } catch (e) {
      console.warn('Auto-backup corrotto');
    }
  }
  
  if (manualBackup) {
    try {
      const parsed = JSON.parse(manualBackup);
      backups.push({
        type: 'manual',
        timestamp: parsed.timestamp,
        data: parsed
      });
    } catch (e) {
      console.warn('Manual backup corrotto');
    }
  }
  
  return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Cancella tutti i dati e forza la rigenerazione dei seed data
export function resetToSeedData() {
  try {
    console.log('🗑️ Cancellando tutti i dati...');
    
    // Rimuovi tutti i dati esistenti
    localStorage.removeItem('paris-league-v1');
    localStorage.removeItem('padel-bookings');
    localStorage.removeItem(BACKUP_KEY);
    localStorage.removeItem(AUTO_BACKUP_KEY);
    
    console.log('✅ Dati cancellati! Al prossimo caricamento verranno creati i seed data (20 giocatori italiani + 3 campi)');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Errore nella cancellazione:', error);
    return { success: false, error: error.message };
  }
}
