#!/usr/bin/env node
/**
 * Export bookings via Firestore REST API
 */

import https from 'https';
import { writeFileSync } from 'fs';

const PROJECT_ID = 'm-padelweb';
const COLLECTION = 'bookings';

console.log('🔍 Fetching bookings via REST API...\n');

// Firestore REST API endpoint
const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.error) {
        console.error('❌ API Error:', response.error);
        process.exit(1);
      }

      const documents = response.documents || [];
      console.log(`📊 Total bookings: ${documents.length}\n`);

      // Convert Firestore document format to simple JSON
      const bookings = documents.map((doc) => {
        const id = doc.name.split('/').pop();
        const fields = doc.fields || {};
        
        // Convert Firestore field types to simple values
        const data = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value.stringValue !== undefined) data[key] = value.stringValue;
          else if (value.integerValue !== undefined) data[key] = parseInt(value.integerValue);
          else if (value.doubleValue !== undefined) data[key] = value.doubleValue;
          else if (value.booleanValue !== undefined) data[key] = value.booleanValue;
          else if (value.timestampValue !== undefined) data[key] = value.timestampValue;
          else if (value.arrayValue) {
            data[key] = (value.arrayValue.values || []).map(v => 
              v.stringValue || v.integerValue || v.doubleValue || v.booleanValue || v
            );
          }
          else data[key] = value;
        }

        return {
          _firestoreId: id,
          ...data
        };
      });

      // Save to file
      const filename = `bookings-export-${Date.now()}.json`;
      writeFileSync(filename, JSON.stringify(bookings, null, 2), 'utf8');

      console.log(`✅ Export completed!`);
      console.log(`📁 File: ${filename}`);
      console.log(`📦 Total: ${bookings.length}\n`);

      // Show samples
      console.log('📋 First 3 bookings:\n' + '='.repeat(80));
      
      bookings.slice(0, 3).forEach((booking, i) => {
        console.log(`\n${i + 1}. Firestore ID: ${booking._firestoreId}`);
        console.log(`   id field: ${booking.id || '❌'}`);
        console.log(`   clubId: ${booking.clubId}`);
        console.log(`   courtId: ${booking.courtId}`);
        console.log(`   date: ${booking.date}`);
        console.log(`   time: ${booking.time}`);
        console.log(`   Has "start": ${booking.start ? '✅' : '❌'}`);
        if (booking.start) console.log(`   start: ${booking.start}`);
        console.log(`   Fields: ${Object.keys(booking).join(', ')}`);
      });

      console.log('\n' + '='.repeat(80));
      process.exit(0);

    } catch (error) {
      console.error('❌ Parse error:', error);
      process.exit(1);
    }
  });

}).on('error', (error) => {
  console.error('❌ Request error:', error);
  process.exit(1);
});
