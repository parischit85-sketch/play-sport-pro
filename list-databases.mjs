#!/usr/bin/env node

/**
 * Script to list all Firestore databases in the project
 * using Firebase Admin SDK (requires service account)
 */

import * as admin from 'firebase-admin';

// Try to initialize with default credentials
try {
  admin.initializeApp({
    projectId: 'm-padelweb',
  });

  const firestore = admin.firestore();
  const projectId = 'projects/m-padelweb/databases';

  console.log('🔍 Querying Firestore databases for m-padelweb...\n');

  // Get all databases
  const [databases] = await firestore.listDatabases();

  if (!databases || databases.length === 0) {
    console.log('❌ No databases found or unable to list (auth required)');
    console.log(
      '\n💡 To list databases via Firebase CLI, try:\n'
    );
    console.log('   firebase firestore:list-databases --project m-padelweb\n');
  } else {
    console.log(`✅ Found ${databases.length} database(s):\n`);

    databases.forEach((db, index) => {
      console.log(`  Database ${index + 1}:`);
      console.log(`    - ID: ${db.name}`);
      console.log(`    - Type: ${db.type || 'unknown'}`);
      console.log(`    - Create Time: ${db.createTime || 'unknown'}`);
      console.log('');
    });
  }

  process.exit(0);
} catch (error) {
  console.log('❌ Error:', error.message);
  console.log(
    '\n💡 Firestore databases need to be checked via Firebase Console or CLI\n'
  );
  console.log(
    'Visit: https://console.firebase.google.com/project/m-padelweb/firestore\n'
  );
  process.exit(1);
}
