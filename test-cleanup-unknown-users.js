// Test script to call cleanupUnknownUsers Cloud Function
// Run with: node test-cleanup-unknown-users.js

import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase config from your project
const firebaseConfig = {
  apiKey: "AIzaSyBtWy3-a3qrk2SZ4L_VxvIBXJqC0GKzY6Q",
  authDomain: "m-padelweb.firebaseapp.com",
  projectId: "m-padelweb",
  storageBucket: "m-padelweb.appspot.com",
  messagingSenderId: "1004722051733",
  appId: "1:1004722051733:web:c5a0d3e3f5e5e5e5e5e5e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'europe-west1');

async function testCleanup() {
  console.log('🧪 Testing cleanupUnknownUsers function...\n');
  
  try {
    const cleanup = httpsCallable(functions, 'cleanupUnknownUsers');
    
    console.log('⏳ Calling function...');
    const result = await cleanup();
    
    console.log('\n✅ Function executed successfully!');
    console.log('\n📊 RESULTS:');
    console.log(JSON.stringify(result.data, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error calling function:');
    console.error(`Code: ${error.code}`);
    console.error(`Message: ${error.message}`);
    console.error(`Details: ${error.details || 'None'}`);
    
    process.exit(1);
  }
}

testCleanup();
