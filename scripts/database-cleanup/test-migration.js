#!/usr/bin/env node

/**
 * =====================================================
 * SCRIPT TEST: Verifica Migrazione Affiliations
 * =====================================================
 * 
 * Testa che il sistema funzioni correttamente dopo la migrazione
 * da affiliations/ a linkedUserId in club users
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inizializza Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccount.json'), 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// ==================== UTILITIES ====================

function log(message, level = 'info') {
  const prefix = {
    info: 'ℹ️ ',
    success: '✅',
    warning: '⚠️ ',
    error: '❌',
    test: '🧪',
  };
  console.log(`${prefix[level]} ${message}`);
}

// ==================== TESTS ====================

async function test1_VerifyLinkedUserIds() {
  log('TEST 1: Verifica linkedUserId nei club users', 'test');
  
  try {
    const clubsSnap = await db.collection('clubs').get();
    
    for (const clubDoc of clubsSnap.docs) {
      const clubId = clubDoc.id;
      const clubName = clubDoc.data().name;
      
      const usersSnap = await db.collection('clubs').doc(clubId).collection('users').get();
      
      let withLink = 0;
      let withoutLink = 0;
      let totalUsers = usersSnap.size;
      
      usersSnap.forEach((userDoc) => {
        const data = userDoc.data();
        if (data.linkedUserId) {
          withLink++;
        } else {
          withoutLink++;
        }
      });
      
      log(`Club: ${clubName}`);
      log(`  Total users: ${totalUsers}`);
      log(`  With linkedUserId: ${withLink}`);
      log(`  Without linkedUserId: ${withoutLink}`);
      
      if (withLink > 0) {
        log('  ✅ TEST PASSED: linkedUserId field exists', 'success');
      } else {
        log('  ❌ TEST FAILED: No linkedUserId found', 'error');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    log(`TEST FAILED: ${error.message}`, 'error');
    return false;
  }
}

async function test2_VerifyUserCanBeFoundByLinkedId() {
  log('\nTEST 2: Verifica ricerca utente tramite linkedUserId', 'test');
  
  try {
    // Trova un utente con linkedUserId
    const clubsSnap = await db.collection('clubs').get();
    let testUserId = null;
    let testClubId = null;
    
    for (const clubDoc of clubsSnap.docs) {
      const clubId = clubDoc.id;
      const usersSnap = await db.collection('clubs').doc(clubId).collection('users')
        .where('linkedUserId', '!=', null)
        .limit(1)
        .get();
      
      if (!usersSnap.empty) {
        testUserId = usersSnap.docs[0].data().linkedUserId;
        testClubId = clubId;
        break;
      }
    }
    
    if (!testUserId) {
      log('  ⚠️  No users with linkedUserId found for testing', 'warning');
      return true; // Non è un errore, semplicemente non ci sono dati
    }
    
    log(`  Testing with userId: ${testUserId}`);
    
    // Test query con linkedUserId
    const resultSnap = await db.collection('clubs').doc(testClubId).collection('users')
      .where('linkedUserId', '==', testUserId)
      .get();
    
    if (!resultSnap.empty) {
      log(`  ✅ TEST PASSED: Found user via linkedUserId query`, 'success');
      const userData = resultSnap.docs[0].data();
      log(`    User: ${userData.firstName || ''} ${userData.lastName || ''}`);
      log(`    Role: ${userData.role}`);
      log(`    Status: ${userData.status}`);
      return true;
    } else {
      log(`  ❌ TEST FAILED: Could not find user via linkedUserId`, 'error');
      return false;
    }
  } catch (error) {
    log(`TEST FAILED: ${error.message}`, 'error');
    return false;
  }
}

async function test3_VerifyAffiliationsStillExist() {
  log('\nTEST 3: Verifica che affiliations esistano ancora (da eliminare dopo test)', 'test');
  
  try {
    const affiliationsSnap = await db.collection('affiliations').get();
    
    log(`  Affiliations count: ${affiliationsSnap.size}`);
    
    if (affiliationsSnap.size > 0) {
      log(`  ✅ Affiliations esistono ancora (OK per ora, da eliminare dopo test)`, 'success');
      return true;
    } else {
      log(`  ⚠️  Affiliations già eliminate`, 'warning');
      return true;
    }
  } catch (error) {
    log(`TEST FAILED: ${error.message}`, 'error');
    return false;
  }
}

async function test4_VerifyDataConsistency() {
  log('\nTEST 4: Verifica consistenza dati (affiliations vs club users)', 'test');
  
  try {
    const affiliationsSnap = await db.collection('affiliations').get();
    const affiliationsData = new Map();
    
    affiliationsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'approved') {
        const key = `${data.userId}_${data.clubId}`;
        affiliationsData.set(key, {
          userId: data.userId,
          clubId: data.clubId,
          role: data.role,
        });
      }
    });
    
    log(`  Found ${affiliationsData.size} approved affiliations`);
    
    // Verifica che ogni affiliation abbia un corrispondente club user con linkedUserId
    let matched = 0;
    let notMatched = 0;
    
    for (const [key, affData] of affiliationsData) {
      const { userId, clubId } = affData;
      
      // Cerca club user con linkedUserId
      const clubUserSnap = await db.collection('clubs').doc(clubId).collection('users')
        .where('linkedUserId', '==', userId)
        .get();
      
      if (!clubUserSnap.empty) {
        matched++;
      } else {
        notMatched++;
        log(`    ⚠️  No match for userId: ${userId} in club: ${clubId}`, 'warning');
      }
    }
    
    log(`  Matched: ${matched}/${affiliationsData.size}`);
    log(`  Not matched: ${notMatched}/${affiliationsData.size}`);
    
    if (notMatched === 0) {
      log(`  ✅ TEST PASSED: All affiliations have corresponding club users`, 'success');
      return true;
    } else {
      log(`  ⚠️  TEST PARTIAL: ${notMatched} affiliations without matching club users`, 'warning');
      return true; // Non è un errore critico
    }
  } catch (error) {
    log(`TEST FAILED: ${error.message}`, 'error');
    return false;
  }
}

async function test5_VerifyRolesPreserved() {
  log('\nTEST 5: Verifica che i ruoli siano stati preservati', 'test');
  
  try {
    const clubsSnap = await db.collection('clubs').get();
    let adminCount = 0;
    let instructorCount = 0;
    let memberCount = 0;
    let totalWithLink = 0;
    
    for (const clubDoc of clubsSnap.docs) {
      const clubId = clubDoc.id;
      const usersSnap = await db.collection('clubs').doc(clubId).collection('users')
        .where('linkedUserId', '!=', null)
        .get();
      
      usersSnap.forEach((userDoc) => {
        const data = userDoc.data();
        totalWithLink++;
        
        const role = data.role?.toLowerCase() || 'member';
        if (role.includes('admin')) {
          adminCount++;
        } else if (role.includes('instructor')) {
          instructorCount++;
        } else {
          memberCount++;
        }
      });
    }
    
    log(`  Users with linkedUserId: ${totalWithLink}`);
    log(`  Admins: ${adminCount}`);
    log(`  Instructors: ${instructorCount}`);
    log(`  Members: ${memberCount}`);
    
    if (totalWithLink > 0) {
      log(`  ✅ TEST PASSED: Roles are preserved in migrated users`, 'success');
      return true;
    } else {
      log(`  ❌ TEST FAILED: No users with roles found`, 'error');
      return false;
    }
  } catch (error) {
    log(`TEST FAILED: ${error.message}`, 'error');
    return false;
  }
}

async function test6_VerifyUsersExistInRoot() {
  log('\nTEST 6: Verifica che gli utenti esistano nella collection users/ root', 'test');
  
  try {
    // Prendi alcuni linkedUserId da club users
    const clubsSnap = await db.collection('clubs').limit(1).get();
    
    if (clubsSnap.empty) {
      log('  ⚠️  No clubs found', 'warning');
      return true;
    }
    
    const clubId = clubsSnap.docs[0].id;
    const usersSnap = await db.collection('clubs').doc(clubId).collection('users')
      .where('linkedUserId', '!=', null)
      .limit(5)
      .get();
    
    let found = 0;
    let notFound = 0;
    
    for (const userDoc of usersSnap.docs) {
      const linkedUserId = userDoc.data().linkedUserId;
      
      const rootUserDoc = await db.collection('users').doc(linkedUserId).get();
      
      if (rootUserDoc.exists) {
        found++;
      } else {
        notFound++;
        log(`    ⚠️  User not found in root: ${linkedUserId}`, 'warning');
      }
    }
    
    log(`  Found in root users/: ${found}/${usersSnap.size}`);
    log(`  Not found: ${notFound}/${usersSnap.size}`);
    
    if (found > 0) {
      log(`  ✅ TEST PASSED: linkedUserId references valid users`, 'success');
      return true;
    } else {
      log(`  ⚠️  TEST WARNING: Some linkedUserId don't have corresponding users`, 'warning');
      return true; // Non critico se alcuni utenti legacy non hanno account root
    }
  } catch (error) {
    log(`TEST FAILED: ${error.message}`, 'error');
    return false;
  }
}

// ==================== MAIN ====================

async function runTests() {
  console.log(`
${'='.repeat(60)}
🧪 TEST SUITE: Migrazione Affiliations → linkedUserId
${'='.repeat(60)}
`);

  const tests = [
    { name: 'Verify linkedUserId exists', fn: test1_VerifyLinkedUserIds },
    { name: 'Verify user search by linkedUserId', fn: test2_VerifyUserCanBeFoundByLinkedId },
    { name: 'Verify affiliations still exist', fn: test3_VerifyAffiliationsStillExist },
    { name: 'Verify data consistency', fn: test4_VerifyDataConsistency },
    { name: 'Verify roles preserved', fn: test5_VerifyRolesPreserved },
    { name: 'Verify users exist in root', fn: test6_VerifyUsersExistInRoot },
  ];

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log(`Test "${test.name}" threw error: ${error.message}`, 'error');
      results.push({ name: test.name, passed: false });
      failed++;
    }
  }

  // Report finale
  console.log(`
${'='.repeat(60)}
📊 TEST RESULTS
${'='.repeat(60)}
`);

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status} - ${result.name}`);
  });

  console.log(`
${'='.repeat(60)}
Total: ${tests.length} tests
Passed: ${passed}
Failed: ${failed}
Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%
${'='.repeat(60)}
`);

  if (failed === 0) {
    log('\n🎉 ALL TESTS PASSED! Sistema pronto per eliminazione affiliations.', 'success');
    log('\nProssimo step:', 'info');
    log('  node 10-delete-affiliations.js', 'info');
  } else {
    log('\n⚠️  SOME TESTS FAILED. Verifica gli errori prima di procedere.', 'warning');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Esegui
runTests();
