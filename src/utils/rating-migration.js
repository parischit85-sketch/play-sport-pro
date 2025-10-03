/**
 * Rating Migration Utility
 * 
 * Migra i dati esistenti al nuovo sistema di rating storici.
 * Esegue automaticamente la migrazione quando necessario.
 */

import { migrateExistingRatings } from '../services/rating-history.js';
import { useClub } from '../contexts/ClubContext.jsx';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase.js';

/**
 * Controlla se un club ha già migrato al sistema di rating storici
 * @param {string} clubId - ID del club
 * @returns {Promise<boolean>} True se già migrato
 */
async function isMigrationCompleted(clubId) {
  try {
    const migrationDoc = await getDoc(doc(db, 'clubs', clubId, 'system', 'rating-migration'));
    return migrationDoc.exists() && migrationDoc.data()?.completed === true;
  } catch (error) {
    console.error('❌ Error checking migration status:', error);
    return false;
  }
}

/**
 * Marca la migrazione come completata
 * @param {string} clubId - ID del club
 */
async function markMigrationCompleted(clubId) {
  try {
    const migrationRef = doc(db, 'clubs', clubId, 'system', 'rating-migration');
    await setDoc(migrationRef, {
      completed: true,
      migratedAt: new Date().toISOString(),
      version: '1.0'
    });
    console.log(`✅ Migration marked as completed for club ${clubId}`);
  } catch (error) {
    console.error('❌ Error marking migration as completed:', error);
  }
}

/**
 * Esegue la migrazione automatica se necessaria
 * @param {string} clubId - ID del club  
 * @param {Array} players - Array di giocatori
 * @returns {Promise<boolean>} True se la migrazione è stata eseguita
 */
export async function autoMigrateIfNeeded(clubId, players) {
  if (!clubId || !players?.length) {
    return false;
  }

  try {
    // Controlla se la migrazione è già stata completata
    const isAlreadyMigrated = await isMigrationCompleted(clubId);
    
    if (isAlreadyMigrated) {
      console.log(`ℹ️ Club ${clubId} already migrated to historical ratings`);
      return false;
    }

    console.log(`🔄 Starting automatic rating migration for club ${clubId}...`);
    
    // Usa la data corrente come punto di partenza della migrazione
    const migrationDate = new Date().toISOString();
    
    // Esegui la migrazione
    await migrateExistingRatings(clubId, players, migrationDate);
    
    // Marca come completata
    await markMigrationCompleted(clubId);
    
    console.log(`✅ Automatic migration completed for club ${clubId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error during automatic migration:', error);
    // Non lanciare l'errore per non bloccare l'app
    return false;
  }
}

/**
 * Hook React per gestire la migrazione automatica
 * Usa questo hook in componenti che hanno accesso ai dati del club
 */
export function useRatingMigration() {
  const { selectedClub, players } = useClub();
  
  const runMigrationIfNeeded = async () => {
    if (selectedClub?.id && players?.length) {
      const migrated = await autoMigrateIfNeeded(selectedClub.id, players);
      if (migrated) {
        console.log('📊 Rating migration completed, historical ratings are now active');
      }
    }
  };

  return { runMigrationIfNeeded };
}

/**
 * Forza la migrazione manuale (per admin o testing)
 * @param {string} clubId - ID del club
 * @param {Array} players - Array di giocatori
 */
export async function forceMigration(clubId, players) {
  try {
    console.log(`🔧 Forcing migration for club ${clubId}...`);
    
    const migrationDate = new Date().toISOString();
    await migrateExistingRatings(clubId, players, migrationDate);
    await markMigrationCompleted(clubId);
    
    console.log(`✅ Forced migration completed for club ${clubId}`);
    return true;
  } catch (error) {
    console.error('❌ Error during forced migration:', error);
    throw error;
  }
}