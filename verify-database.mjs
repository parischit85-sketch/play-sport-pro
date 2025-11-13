#!/usr/bin/env node

/**
 * Script to verify which Firestore database instance(s) are active
 * and check the data status
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
};

console.log('🔍 Firebase Configuration:');
console.log('  Project ID:', firebaseConfig.projectId);
console.log('  Auth Domain:', firebaseConfig.authDomain);
console.log('  Database URL:', firebaseConfig.databaseURL);

try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('\n📊 Checking Firestore collections...\n');

  // List of key collections to check
  const collectionsToCheck = [
    'users',
    'clubs',
    'tournaments',
    'bookings',
    'matches',
    'events',
    'lessons',
  ];

  let hasData = false;
  let emptyCollections = [];
  let populatedCollections = [];

  for (const collectionName of collectionsToCheck) {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        emptyCollections.push(collectionName);
        console.log(`  ❌ ${collectionName}: EMPTY`);
      } else {
        populatedCollections.push(collectionName);
        console.log(
          `  ✅ ${collectionName}: ${snapshot.docs.length} document(s) found`
        );
        hasData = true;
      }
    } catch (err) {
      console.log(
        `  ⚠️  ${collectionName}: Error checking -`,
        err.message.substring(0, 50)
      );
    }
  }

  console.log('\n📈 Summary:');
  console.log(`  Total collections checked: ${collectionsToCheck.length}`);
  console.log(`  Populated: ${populatedCollections.length}`);
  console.log(`  Empty: ${emptyCollections.length}`);

  if (hasData) {
    console.log(
      '\n✅ Database has DATA - you are pointing to the RESTORED database'
    );
  } else {
    console.log(
      '\n⚠️  Database appears to be EMPTY - you may be pointing to the wrong database'
    );
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
