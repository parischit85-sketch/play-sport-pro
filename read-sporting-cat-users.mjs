#!/usr/bin/env node
// Script per leggere tutti i documenti in /clubs/sporting-cat/users
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function readSportingCatUsers() {
  console.log('🔍 Reading all documents in /clubs/sporting-cat/users\n');

  try {
    const usersSnapshot = await db
      .collection('clubs')
      .doc('sporting-cat')
      .collection('users')
      .get();

    console.log(`📊 Total documents: ${usersSnapshot.size}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (usersSnapshot.size === 0) {
      console.log('⚠️  No documents found in this collection\n');
    } else {
      usersSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`📄 Document #${index + 1}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Data:`);
        console.log(JSON.stringify(data, null, 6));
        console.log('');
      });
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    // Cerca anche l'email specifica
    const emailMatches = usersSnapshot.docs.filter(
      (doc) => doc.data().email === 'parischit85@gmail.com'
    );

    if (emailMatches.length > 0) {
      console.log(`✅ Found ${emailMatches.length} user(s) with email parischit85@gmail.com:`);
      emailMatches.forEach((doc) => {
        console.log(`   - Document ID: ${doc.id}`);
        console.log(`   - Role: ${doc.data().role || 'N/A'}`);
        console.log(`   - Name: ${doc.data().firstName || ''} ${doc.data().lastName || ''}`);
      });
    } else {
      console.log('❌ No users found with email parischit85@gmail.com');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.message.includes('NOT_FOUND')) {
      console.log('   Collection does not exist or is empty\n');
    }
  }
}

readSportingCatUsers()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
