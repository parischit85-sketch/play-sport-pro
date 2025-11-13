// Script to dump bookings data - run with: node --import tsx dump-bookings.js
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize without service account (uses Application Default Credentials)
try {
  admin.initializeApp({
    projectId: 'm-padelweb'
  });
} catch (e) {
  console.log('Admin already initialized');
}

const db = admin.firestore();

async function dumpBookings() {
  console.log('🔍 Fetching all bookings...\n');
  
  const snapshot = await db.collection('bookings').limit(5).get();
  
  console.log(`📊 Total bookings fetched: ${snapshot.size}\n`);
  console.log('='.repeat(80));
  
  const bookings = [];
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    const booking = {
      _firestoreId: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    };
    bookings.push(booking);
    
    console.log(`\n📋 Booking: ${doc.id}`);
    console.log(`   id field: ${data.id || '❌ NONE'}`);
    console.log(`   clubId: ${data.clubId}`);
    console.log(`   courtId: ${data.courtId}`);
    console.log(`   date: ${data.date}`);
    console.log(`   time: ${data.time}`);
    console.log(`   start field: ${data.start ? '✅ ' + data.start : '❌ MISSING'}`);
    console.log(`   end field: ${data.end ? '✅ ' + data.end : '❌ MISSING'}`);
    console.log(`   status: ${data.status}`);
    console.log(`\n   ALL FIELDS:`);
    console.log(`   ${Object.keys(data).sort().join(', ')}`);
    console.log('-'.repeat(80));
  });
  
  console.log('\n\n' + '='.repeat(80));
  console.log('✅ Done!\n');
  
  process.exit(0);
}

dumpBookings().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
