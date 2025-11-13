#!/usr/bin/env node
/**
 * Export all bookings from Firestore to JSON file
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { writeFileSync } from 'fs';

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyBEDltvWX1V7CJPDUxwccGEG-MJp3k9MkQ',
  authDomain: 'm-padelweb.firebaseapp.com',
  projectId: 'm-padelweb',
  storageBucket: 'm-padelweb.firebasestorage.app',
  messagingSenderId: '1004722051733',
  appId: '1:1004722051733:web:e9a6fa4beb52e76ee86fe8',
  measurementId: 'G-J4BXQ5HR96',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Login as club admin to access bookings
console.log('🔐 Logging in as club admin...');
await signInWithEmailAndPassword(auth, 'sportingcat@gmail.com', 'Sporting2024@');

async function exportBookings() {
  try {
    console.log('🔍 Fetching all bookings from Firestore...\n');

    const snapshot = await getDocs(collection(db, 'bookings'));

    console.log(`📊 Total bookings: ${snapshot.docs.length}\n`);

    const bookings = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({
        _firestoreId: doc.id,
        ...data,
        // Convert Timestamps to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      });
    });

    // Save to JSON file
    const filename = `bookings-export-${Date.now()}.json`;
    writeFileSync(filename, JSON.stringify(bookings, null, 2), 'utf8');

    console.log(`✅ Export completed!`);
    console.log(`📁 File saved: ${filename}`);
    console.log(`📦 Total bookings exported: ${bookings.length}\n`);

    // Show sample of first 3 bookings
    console.log('📋 Sample of first 3 bookings:\n');
    console.log('='.repeat(80));
    
    bookings.slice(0, 3).forEach((booking, index) => {
      console.log(`\n${index + 1}. Firestore ID: ${booking._firestoreId}`);
      console.log(`   Document "id" field: ${booking.id || '❌ NONE'}`);
      console.log(`   Club: ${booking.clubId}`);
      console.log(`   Court: ${booking.courtName || booking.courtId}`);
      console.log(`   Date: ${booking.date} at ${booking.time}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Has "start" field: ${booking.start ? '✅ YES' : '❌ NO'}`);
      if (booking.start) {
        console.log(`   start value: ${booking.start}`);
      }
      console.log(`   All fields: ${Object.keys(booking).join(', ')}`);
    });

    console.log('\n' + '='.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

exportBookings();
