// =============================================
// FILE: src/scripts/migrateSportingCATData.js
// Script per migrare i dati esistenti al club Sporting CAT
// =============================================

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { loadLeague } from '../services/cloud.js';

/**
 * Migra tutti i dati esistenti al club Sporting CAT
 */
export const migrateSportingCATData = async (sportingCATClubId) => {
  console.log('🔄 Inizio migrazione dati per Sporting CAT...');

  try {
    // 1. Carica i dati esistenti dalla lega principale
    const leagueData = await loadLeague('lega-andrea-2025');

    if (!leagueData) {
      console.log('⚠️ Nessun dato esistente trovato nella lega principale');
      return;
    }

    console.log('📊 Dati trovati:', {
      players: leagueData.players?.length || 0,
      matches: leagueData.matches?.length || 0,
      bookings: leagueData.bookings?.length || 0,
      courts: leagueData.courts?.length || 0,
    });

    const batch = writeBatch(db);
    let operationsCount = 0;
    const maxBatchSize = 450; // Firestore limit is 500, we use 450 for safety
    let currentBatch = writeBatch(db);
    let currentBatchSize = 0;

    const commitCurrentBatch = async () => {
      if (currentBatchSize > 0) {
        await currentBatch.commit();
        console.log(`✅ Batch committed: ${currentBatchSize} operations`);
        currentBatch = writeBatch(db);
        currentBatchSize = 0;
      }
    };

    // 2. Migra i giocatori associandoli al club
    if (leagueData.players && leagueData.players.length > 0) {
      console.log('👥 Migrando giocatori...');

      for (const player of leagueData.players) {
        // Aggiorna il giocatore aggiungendo l'affiliazione al club
        const playerData = {
          ...player,
          clubId: sportingCATClubId,
          clubName: 'Sporting CAT',
          updatedAt: new Date().toISOString(),
          migratedAt: new Date().toISOString(),
        };

        // Salva nelle profiles se non esiste già
        const playerRef = doc(db, 'profiles', player.id);
        currentBatch.set(playerRef, playerData, { merge: true });
        currentBatchSize++;
        operationsCount++;

        // Commit batch if it's getting full
        if (currentBatchSize >= maxBatchSize) {
          await commitCurrentBatch();
        }

        // Crea affiliazione al club
        const affiliationRef = doc(collection(db, 'club_affiliations'));
        const affiliationData = {
          userId: player.id,
          clubId: sportingCATClubId,
          status: 'approved',
          role: 'member',
          requestedAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          approvedBy: 'admin_migration',
          notes: 'Migrato automaticamente da dati esistenti Sporting CAT',
        };

        currentBatch.set(affiliationRef, affiliationData);
        currentBatchSize++;
        operationsCount++;

        // Commit batch if it's getting full
        if (currentBatchSize >= maxBatchSize) {
          await commitCurrentBatch();
        }
      }
    }

    // 3. Migra le partite associandole al club
    if (leagueData.matches && leagueData.matches.length > 0) {
      console.log('🏃 Migrando partite...');

      for (const match of leagueData.matches) {
        const matchData = {
          ...match,
          clubId: sportingCATClubId,
          clubName: 'Sporting CAT',
          migratedAt: new Date().toISOString(),
        };

        const matchRef = doc(collection(db, 'matches'));
        currentBatch.set(matchRef, matchData);
        currentBatchSize++;
        operationsCount++;

        // Commit batch if it's getting full
        if (currentBatchSize >= maxBatchSize) {
          await commitCurrentBatch();
        }
      }
    }

    // 4. Migra le prenotazioni associandole al club
    if (leagueData.bookings && leagueData.bookings.length > 0) {
      console.log('📅 Migrando prenotazioni...');

      for (const booking of leagueData.bookings) {
        const bookingData = {
          ...booking,
          clubId: sportingCATClubId,
          clubName: 'Sporting CAT',
          migratedAt: new Date().toISOString(),
        };

        const bookingRef = doc(collection(db, 'bookings'));
        currentBatch.set(bookingRef, bookingData);
        currentBatchSize++;
        operationsCount++;

        // Commit batch if it's getting full
        if (currentBatchSize >= maxBatchSize) {
          await commitCurrentBatch();
        }
      }
    }

    // 5. Migra i campi associandoli al club
    if (leagueData.courts && leagueData.courts.length > 0) {
      console.log('🏟️ Migrando campi...');

      for (const court of leagueData.courts) {
        const courtData = {
          ...court,
          clubId: sportingCATClubId,
          clubName: 'Sporting CAT',
          migratedAt: new Date().toISOString(),
        };

        const courtRef = doc(collection(db, 'courts'));
        currentBatch.set(courtRef, courtData);
        currentBatchSize++;
        operationsCount++;

        // Commit batch if it's getting full
        if (currentBatchSize >= maxBatchSize) {
          await commitCurrentBatch();
        }
      }
    }

    // 6. Aggiorna le statistiche del club
    const clubRef = doc(db, 'clubs', sportingCATClubId);
    const clubUpdateData = {
      'statistics.totalMembers': leagueData.players?.length || 0,
      'statistics.totalMatches': leagueData.matches?.length || 0,
      'statistics.totalBookings': leagueData.bookings?.length || 0,
      'statistics.totalCourts': leagueData.courts?.length || 6,
      updatedAt: new Date().toISOString(),
      lastMigration: new Date().toISOString(),
    };

    currentBatch.update(clubRef, clubUpdateData);
    currentBatchSize++;
    operationsCount++;

    // 7. Commit final batch
    await commitCurrentBatch();

    console.log(`✅ Migrazione completata: ${operationsCount} operazioni eseguite`);

    return {
      success: true,
      migratedPlayers: leagueData.players?.length || 0,
      migratedMatches: leagueData.matches?.length || 0,
      migratedBookings: leagueData.bookings?.length || 0,
      migratedCourts: leagueData.courts?.length || 0,
      operationsCount,
    };
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    throw error;
  }
};

/**
 * Verifica lo stato della migrazione
 */
export const checkMigrationStatus = async (sportingCATClubId) => {
  try {
    // Verifica affiliazioni esistenti
    const affiliationsRef = collection(db, 'club_affiliations');
    const affiliationsSnapshot = await getDocs(affiliationsRef);

    let sportingCATAffiliations = 0;
    affiliationsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.clubId === sportingCATClubId) {
        sportingCATAffiliations++;
      }
    });

    // Verifica dati club
    const clubDoc = await getDoc(doc(db, 'clubs', sportingCATClubId));
    const clubData = clubDoc.exists() ? clubDoc.data() : null;

    return {
      clubExists: clubDoc.exists(),
      clubData: clubData,
      affiliationsCount: sportingCATAffiliations,
      lastMigration: clubData?.lastMigration || null,
    };
  } catch (error) {
    console.error('❌ Errore nel controllo migrazione:', error);
    return null;
  }
};

export default migrateSportingCATData;
