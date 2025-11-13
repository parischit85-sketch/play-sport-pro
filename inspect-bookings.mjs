#!/usr/bin/env node
/**
 * Inspect bookings structure in Firestore
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

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

async function inspectBookings() {
  try {
    console.log('\n🔍 Fetching first 5 bookings from Firestore...\n');

    const q = query(collection(db, 'bookings'), limit(5));
    const snapshot = await getDocs(q);

    console.log(`📊 Total bookings fetched: ${snapshot.docs.length}\n`);
    console.log('=' .repeat(80));

    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      
      console.log(`\n📋 BOOKING #${index + 1}`);
      console.log('─'.repeat(80));
      console.log('🆔 Firestore Document ID:', doc.id);
      console.log('📄 Document Data:');
      console.log(JSON.stringify(data, null, 2));
      console.log('─'.repeat(80));
      
      // Highlight important fields
      console.log('\n🔑 Key Fields:');
      console.log('  • id (in document):', data.id || '❌ MISSING');
      console.log('  • legacyId:', data.legacyId || '❌ MISSING');
      console.log('  • clubId:', data.clubId || '❌ MISSING');
      console.log('  • courtId:', data.courtId || '❌ MISSING');
      console.log('  • date:', data.date || '❌ MISSING');
      console.log('  • time:', data.time || '❌ MISSING');
      console.log('  • status:', data.status || '❌ MISSING');
      console.log('  • createdBy:', data.createdBy || '❌ MISSING');
      console.log('  • userId:', data.userId || '❌ MISSING');
      console.log('  • type:', data.type || '❌ MISSING');
      console.log('\n' + '='.repeat(80));
    });

    // Find the most recent booking
    console.log('\n\n🔍 Looking for most recent bookings (by createdAt)...\n');
    const allDocs = await getDocs(collection(db, 'bookings'));
    const allBookings = allDocs.docs.map(doc => ({
      firestoreId: doc.id,
      ...doc.data()
    }));

    // Sort by createdAt
    allBookings.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return timeB - timeA;
    });

    console.log('📅 5 Most Recent Bookings:');
    console.log('─'.repeat(80));
    allBookings.slice(0, 5).forEach((booking, index) => {
      const createdAt = booking.createdAt?.toDate?.() || new Date(booking.createdAt);
      console.log(`\n${index + 1}. ${booking.id || booking.firestoreId}`);
      console.log(`   Firestore ID: ${booking.firestoreId}`);
      console.log(`   Document id field: ${booking.id || '❌ NONE'}`);
      console.log(`   Court: ${booking.courtName || booking.courtId}`);
      console.log(`   Date: ${booking.date} at ${booking.time}`);
      console.log(`   Created: ${createdAt.toISOString()}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Type: ${booking.type}`);
    });

    console.log('\n\n✅ Inspection complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

inspectBookings();
