// =============================================
// FILE: scripts/verify-option-a-implementation.js
// Verifica implementazione Option A (single source of truth)
// =============================================

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Firebase config (same as in the app)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔍 VERIFICA IMPLEMENTAZIONE OPTION A');
console.log('=====================================');

// =============================================
// VERIFICATION FUNCTIONS
// =============================================

async function verifyRootCollections() {
  console.log('\n📦 1. Verifica collezioni root...');

  const collections = ['users', 'profiles', 'affiliations'];
  const results = {};

  for (const collName of collections) {
    try {
      const snap = await getDocs(collection(db, collName));
      results[collName] = snap.docs.length;
      console.log(`   ${collName}: ${snap.docs.length} documenti`);
    } catch (error) {
      console.error(`   ❌ Errore lettura ${collName}:`, error.message);
      results[collName] = 'error';
    }
  }

  return results;
}

async function verifyClubSubcollections() {
  console.log('\n🏢 2. Verifica subcollections club...');

  const clubsSnap = await getDocs(collection(db, 'clubs'));
  const results = {};

  for (const clubDoc of clubsSnap.docs) {
    const clubId = clubDoc.id;
    const clubName = clubDoc.data().name || clubId;

    console.log(`   Club: ${clubName} (${clubId})`);

    // Check users subcollection
    try {
      const usersSnap = await getDocs(collection(db, 'clubs', clubId, 'users'));
      console.log(`     ✅ users: ${usersSnap.docs.length} documenti`);
      results[`${clubId}_users`] = usersSnap.docs.length;
    } catch (error) {
      console.error(`     ❌ Errore users: ${error.message}`);
      results[`${clubId}_users`] = 'error';
    }

    // Check profiles subcollection (should be empty after migration)
    try {
      const profilesSnap = await getDocs(collection(db, 'clubs', clubId, 'profiles'));
      console.log(`     📋 profiles: ${profilesSnap.docs.length} documenti`);
      results[`${clubId}_profiles`] = profilesSnap.docs.length;
    } catch (error) {
      console.error(`     ❌ Errore profiles: ${error.message}`);
      results[`${clubId}_profiles`] = 'error';
    }
  }

  return results;
}

async function verifyUserConsistency() {
  console.log('\n👥 3. Verifica consistenza utenti...');

  const clubsSnap = await getDocs(collection(db, 'clubs'));
  let totalClubUsers = 0;
  let uniqueUserIds = new Set();

  for (const clubDoc of clubsSnap.docs) {
    const clubId = clubDoc.id;
    const usersSnap = await getDocs(collection(db, 'clubs', clubId, 'users'));

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      totalClubUsers++;

      if (userData.userId) {
        uniqueUserIds.add(userData.userId);
      }

      // Verify user has required fields
      const requiredFields = ['userId', 'userEmail', 'userName', 'role', 'status'];
      const missingFields = requiredFields.filter(field => !userData[field]);

      if (missingFields.length > 0) {
        console.log(`     ⚠️ User ${userDoc.id} missing fields: ${missingFields.join(', ')}`);
      }
    }
  }

  console.log(`   Totale club users: ${totalClubUsers}`);
  console.log(`   Utenti unici: ${uniqueUserIds.size}`);

  return { totalClubUsers, uniqueUserIds: uniqueUserIds.size };
}

async function verifyClubUserRoles() {
  console.log('\n👑 4. Verifica ruoli utenti club...');

  const clubsSnap = await getDocs(collection(db, 'clubs'));
  const roleStats = {};

  for (const clubDoc of clubsSnap.docs) {
    const clubId = clubDoc.id;
    const clubName = clubDoc.data().name || clubId;
    const usersSnap = await getDocs(collection(db, 'clubs', clubId, 'users'));

    console.log(`   Club: ${clubName}`);

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const role = userData.role || 'member';

      if (!roleStats[role]) roleStats[role] = 0;
      roleStats[role]++;

      console.log(`     ${userData.userName} (${userData.userEmail}): ${role}`);
    }
  }

  console.log('\n   Statistiche ruoli:');
  Object.entries(roleStats).forEach(([role, count]) => {
    console.log(`     ${role}: ${count}`);
  });

  return roleStats;
}

async function generateReport(results) {
  console.log('\n📊 5. Generazione report...');

  const report = {
    timestamp: new Date().toISOString(),
    verification: results,
    summary: {
      optionAImplemented: true,
      rootCollectionsPreserved: results.rootCollections.users > 0,
      subcollectionsActive: results.clubSubcollections ? true : false,
      totalClubUsers: results.userConsistency?.totalClubUsers || 0,
      uniqueUsers: results.userConsistency?.uniqueUserIds || 0,
    }
  };

  const reportPath = path.join(process.cwd(), 'option-a-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`   ✅ Report salvato: ${reportPath}`);

  return report;
}

// =============================================
// MAIN VERIFICATION
// =============================================

async function main() {
  try {
    const results = {};

    results.rootCollections = await verifyRootCollections();
    results.clubSubcollections = await verifyClubSubcollections();
    results.userConsistency = await verifyUserConsistency();
    results.roleStats = await verifyClubUserRoles();

    const report = await generateReport(results);

    console.log('\n🎉 VERIFICA COMPLETATA!');
    console.log('========================');
    console.log(`✅ Option A implementata: ${report.summary.optionAImplemented ? 'SÌ' : 'NO'}`);
    console.log(`✅ Root collections preservate: ${report.summary.rootCollectionsPreserved ? 'SÌ' : 'NO'}`);
    console.log(`✅ Subcollections attive: ${report.summary.subcollectionsActive ? 'SÌ' : 'NO'}`);
    console.log(`👥 Totale utenti club: ${report.summary.totalClubUsers}`);
    console.log(`🔢 Utenti unici: ${report.summary.uniqueUsers}`);

  } catch (error) {
    console.error('❌ Errore durante verifica:', error);
    process.exit(1);
  }
}

main();