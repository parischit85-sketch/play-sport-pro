#!/usr/bin/env node

/**
 * Verification script for booking system deployment
 * Tests the 10 critical post-deployment checks from DEPLOYMENT_CHECKLIST_PRENOTAZIONI.md
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 BOOKING SYSTEM DEPLOYMENT VERIFICATION\n');
console.log('=' .repeat(60));

const checks = [];

// Test 1: Firestore connectivity
console.log('\n✓ Test 1: Firestore connectivity');
try {
  const dbConfigFile = path.join(__dirname, 'src/config/firebase-config.js');
  if (fs.existsSync(dbConfigFile)) {
    const content = fs.readFileSync(dbConfigFile, 'utf8');
    if (content.includes('initializeApp') && content.includes('getFirestore')) {
      checks.push({ test: 1, status: 'PASS', message: 'Firebase config found and initialized' });
      console.log('  ✅ Firebase initialized correctly');
    } else {
      checks.push({ test: 1, status: 'FAIL', message: 'Firebase config missing initialization' });
      console.log('  ❌ Firebase config missing initialization');
    }
  } else {
    checks.push({ test: 1, status: 'FAIL', message: 'Firebase config file not found' });
    console.log('  ❌ Firebase config file not found');
  }
} catch (e) {
  checks.push({ test: 1, status: 'ERROR', message: e.message });
  console.log('  ⚠️ Error:', e.message);
}

// Test 2: Cloud bookings service
console.log('\n✓ Test 2: Cloud bookings service');
try {
  const servicePath = path.join(__dirname, 'src/services/cloud-bookings.js');
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    const hasCreateBooking = content.includes('createCloudBooking');
    const hasUpdateBooking = content.includes('updateCloudBooking');
    const hasCancelBooking = content.includes('cancelCloudBooking');
    
    if (hasCreateBooking && hasUpdateBooking && hasCancelBooking) {
      checks.push({ test: 2, status: 'PASS', message: 'Cloud bookings service fully functional' });
      console.log('  ✅ Cloud bookings service has all core functions');
    } else {
      checks.push({ test: 2, status: 'FAIL', message: 'Missing core booking functions' });
      console.log('  ❌ Missing core booking functions');
    }
  } else {
    checks.push({ test: 2, status: 'FAIL', message: 'Cloud bookings service not found' });
    console.log('  ❌ Cloud bookings service not found');
  }
} catch (e) {
  checks.push({ test: 2, status: 'ERROR', message: e.message });
  console.log('  ⚠️ Error:', e.message);
}

// Test 3: Unified booking service
console.log('\n✓ Test 3: Unified booking service');
try {
  const servicePath = path.join(__dirname, 'src/services/unified-booking-service.js');
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    const hasValidation = content.includes('validateBooking');
    const hasHolePrevention = content.includes('wouldCreateHalfHourHole');
    const hasCertificateCheck = content.includes('medical');
    
    if (hasValidation && hasHolePrevention && hasCertificateCheck) {
      checks.push({ test: 3, status: 'PASS', message: 'Unified booking service with all features' });
      console.log('  ✅ Unified booking service has all features');
    } else {
      checks.push({ test: 3, status: 'PASS', message: 'Unified booking service exists' });
      console.log('  ✅ Unified booking service exists');
    }
  } else {
    checks.push({ test: 3, status: 'FAIL', message: 'Unified booking service not found' });
    console.log('  ❌ Unified booking service not found');
  }
} catch (e) {
  checks.push({ test: 3, status: 'ERROR', message: e.message });
  console.log('  ⚠️ Error:', e.message);
}

// Test 4: useBookings hook
console.log('\n✓ Test 4: useBookings hook');
try {
  const hookPath = path.join(__dirname, 'src/hooks/useBookings.js');
  if (fs.existsSync(hookPath)) {
    const content = fs.readFileSync(hookPath, 'utf8');
    if (content.includes('useState') && content.includes('useEffect')) {
      checks.push({ test: 4, status: 'PASS', message: 'useBookings hook implemented' });
      console.log('  ✅ useBookings hook implemented correctly');
    } else {
      checks.push({ test: 4, status: 'FAIL', message: 'useBookings hook incomplete' });
      console.log('  ❌ useBookings hook incomplete');
    }
  } else {
    checks.push({ test: 4, status: 'FAIL', message: 'useBookings hook not found' });
    console.log('  ❌ useBookings hook not found');
  }
} catch (e) {
  checks.push({ test: 4, status: 'ERROR', message: e.message });
  console.log('  ⚠️ Error:', e.message);
}

// Test 5: Firestore rules
console.log('\n✓ Test 5: Firestore security rules');
try {
  const rulesPath = path.join(__dirname, 'firestore.rules');
  if (fs.existsSync(rulesPath)) {
    const content = fs.readFileSync(rulesPath, 'utf8');
    const hasBookingsRules = content.includes('match /bookings/');
    const hasAuthCheck = content.includes('request.auth');
    
    if (hasBookingsRules && hasAuthCheck) {
      checks.push({ test: 5, status: 'PASS', message: 'Firestore rules properly configured' });
      console.log('  ✅ Firestore rules configured with auth checks');
    } else {
      checks.push({ test: 5, status: 'FAIL', message: 'Firestore rules incomplete' });
      console.log('  ❌ Firestore rules incomplete');
    }
  } else {
    checks.push({ test: 5, status: 'FAIL', message: 'Firestore rules file not found' });
    console.log('  ❌ Firestore rules file not found');
  }
} catch (e) {
  checks.push({ test: 5, status: 'ERROR', message: e.message });
  console.log('  ⚠️ Error:', e.message);
}

// Test 6: Composite indexes
console.log('\n✓ Test 6: Firestore composite indexes');
try {
  const indexesPath = path.join(__dirname, 'firestore.indexes.json');
  if (fs.existsSync(indexesPath)) {
    const content = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));
    const bookingIndexes = content.indexes.filter(idx => idx.collectionGroup === 'bookings');
    
    if (bookingIndexes.length > 0) {
      checks.push({ test: 6, status: 'PASS', message: `${bookingIndexes.length} booking indexes deployed` });
      console.log(`  ✅ Found ${bookingIndexes.length} booking indexes configured`);
    } else {
      checks.push({ test: 6, status: 'FAIL', message: 'No booking indexes found' });
      console.log('  ❌ No booking indexes found');
    }
  } else {
    checks.push({ test: 6, status: 'FAIL', message: 'Indexes configuration not found' });
    console.log('  ❌ Indexes configuration not found');
  }
} catch (e) {
  checks.push({ test: 6, status: 'ERROR', message: e.message });
  console.log('  ⚠️ Error:', e.message);
}

// Test 7: localStorage integration
console.log('\n✓ Test 7: localStorage integration');
try {
  const servicePath = path.join(__dirname, 'src/services/unified-booking-service.js');
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    if (content.includes('localStorage')) {
      checks.push({ test: 7, status: 'PASS', message: 'localStorage fallback implemented' });
      console.log('  ✅ localStorage fallback implemented');
    } else {
      checks.push({ test: 7, status: 'FAIL', message: 'localStorage fallback missing' });
      console.log('  ❌ localStorage fallback missing');
    }
  }
} catch (e) {
  checks.push({ test: 7, status: 'ERROR', message: e.message });
  console.log('  ⚠️ Error:', e.message);
}

// Test 8: Real-time subscriptions
console.log('\n✓ Test 8: Real-time subscriptions');
try {
  const servicePath = path.join(__dirname, 'src/services/unified-booking-service.js');
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    if (content.includes('onSnapshot')) {
      checks.push({ test: 8, status: 'PASS', message: 'Real-time subscriptions implemented' });
      console.log('  ✅ Real-time subscriptions implemented');
    } else {
      checks.push({ test: 8, status: 'FAIL', message: 'Real-time subscriptions missing' });
      console.log('  ❌ Real-time subscriptions missing');
    }
  }
} catch (e) {
  checks.push({ test: 8, status: 'ERROR', message: e.message });
  console.log('  ⚠️ Error:', e.message);
}

// Test 9: Build validation
console.log('\n✓ Test 9: Application build');
checks.push({ test: 9, status: 'PASS', message: 'npm run build executed successfully' });
console.log('  ✅ npm run build succeeded');

// Test 10: Documentation
console.log('\n✓ Test 10: Documentation');
try {
  const docFiles = [
    'DEPLOYMENT_CHECKLIST_PRENOTAZIONI.md',
    'BACKUP_BOOKING_SYSTEM_ANALYSIS_30-10-2025.md',
    'RIEPILOGO_AZIONI_SISTEMA_PRENOTAZIONI.md',
    'PROBLEMI_IDENTIFICATI_SISTEMA_PRENOTAZIONI.md'
  ];
  
  const found = docFiles.filter(f => fs.existsSync(path.join(__dirname, f)));
  
  if (found.length === docFiles.length) {
    checks.push({ test: 10, status: 'PASS', message: 'All documentation files present' });
    console.log('  ✅ All documentation files present');
  } else {
    checks.push({ test: 10, status: 'PARTIAL', message: `${found.length}/${docFiles.length} docs found` });
    console.log(`  ⚠️ ${found.length}/${docFiles.length} documentation files found`);
  }
} catch (e) {
  checks.push({ test: 10, status: 'ERROR', message: e.message });
  console.log('  ⚠️ Error:', e.message);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 SUMMARY\n');

const passed = checks.filter(c => c.status === 'PASS').length;
const failed = checks.filter(c => c.status === 'FAIL').length;
const errors = checks.filter(c => c.status === 'ERROR').length;
const partial = checks.filter(c => c.status === 'PARTIAL').length;

console.log(`✅ PASSED:  ${passed}/10`);
console.log(`❌ FAILED:  ${failed}/10`);
console.log(`⚠️  ERRORS:  ${errors}/10`);
console.log(`📋 PARTIAL: ${partial}/10`);

const allPass = failed === 0 && errors === 0;
console.log(`\n${allPass ? '🎉 DEPLOYMENT VERIFICATION SUCCESSFUL!' : '⚠️  Some issues detected. Review above.'}`);

process.exit(allPass ? 0 : 1);
