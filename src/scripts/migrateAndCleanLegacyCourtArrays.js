// Script per migrare e cancellare campi legacy dagli array "courts" in club e league
import { doc, getDoc, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase.node.js';

async function migrateCourtsArrayFromClub(clubId) {
  const clubRef = doc(db, 'clubs', clubId);
  const clubSnap = await getDoc(clubRef);
  if (!clubSnap.exists()) return 0;
  const clubData = clubSnap.data();
  const courtsArray = clubData.courts;
  if (!Array.isArray(courtsArray) || courtsArray.length === 0) return 0;
  let migrated = 0;
  for (const court of courtsArray) {
    if (!court.id) continue;
    const newCourtRef = doc(db, 'clubs', clubId, 'courts', court.id.toString());
    await setDoc(newCourtRef, {
      ...court,
      migratedFromArray: true,
      migratedAt: new Date().toISOString(),
    });
    migrated++;
    console.log(`✅ Migrato campo da array club: ${court.name} (${court.id})`);
  }
  // Rimuovi l'array courts dal documento club
  await updateDoc(clubRef, { courts: [] });
  console.log(`🧹 Pulito array courts da club ${clubId}`);
  return migrated;
}

async function migrateCourtsArrayFromLeagues() {
  const leaguesRef = collection(db, 'leagues');
  const leaguesSnap = await getDocs(leaguesRef);
  let migrated = 0;
  for (const leagueDoc of leaguesSnap.docs) {
    const leagueData = leagueDoc.data();
    const courtsArray = leagueData.courts;
    if (!Array.isArray(courtsArray) || courtsArray.length === 0) continue;
    for (const court of courtsArray) {
      if (!court.id) continue;
      // Salva in una subcollection legacyCourts nella league
      const newCourtRef = doc(db, 'leagues', leagueDoc.id, 'legacyCourts', court.id.toString());
      await setDoc(newCourtRef, {
        ...court,
        migratedFromLeagueArray: true,
        migratedAt: new Date().toISOString(),
      });
      migrated++;
      console.log(`✅ Migrato campo da array league: ${court.name} (${court.id}) in lega ${leagueDoc.id}`);
    }
    // Rimuovi l'array courts dal documento league
    await updateDoc(leagueDoc.ref, { courts: [] });
    console.log(`🧹 Pulito array courts da league ${leagueDoc.id}`);
  }
  return migrated;
}

(async () => {
  try {
    // Sostituisci con il clubId desiderato
    const clubId = 'sporting-cat';
    const migratedClub = await migrateCourtsArrayFromClub(clubId);
    const migratedLeagues = await migrateCourtsArrayFromLeagues();
    console.log(`\n--- Migrazione completata ---\nCampi migrati da club: ${migratedClub}\nCampi migrati da leagues: ${migratedLeagues}`);
  } catch (error) {
    console.error('❌ Errore durante la migrazione degli array courts:', error);
  }
  process.exit(0);
})();
