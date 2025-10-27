// =============================================
// FILE: src/scripts/migrateSportingCATData.js
// Script per migrare i dati esistenti al club Sporting CAT
// =============================================
// ⚠️ DEPRECATED: This migration script is no longer functional
// ⚠️ The cloud.js service has been removed - this file is kept for reference only
// =============================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../services/firebase.js';

/**
 * @deprecated This script is no longer used - cloud.js service has been removed
 */
export const migrateSportingCATData = async (sportingCATClubId) => {
  console.warn('⚠️ DEPRECATED: migrateSportingCATData is no longer functional');
  console.warn('⚠️ The cloud.js service has been removed');
  console.warn(`⚠️ Called with clubId: ${sportingCATClubId}`);
  return {
    success: false,
    error: 'This migration script is deprecated and no longer functional',
  };
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
