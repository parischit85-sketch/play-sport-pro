#!/usr/bin/env node
/**
 * SCRIPT 8: Analizza discrepanze tra root collections e subcollections
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccount.json'), 'utf8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function analyzeDiscrepancies() {
  console.log('\n🔍 ANALISI DISCREPANZE ROOT vs SUBCOLLECTIONS\n');
  
  const results = {};
  
  // Affiliations
  console.log('📊 AFFILIATIONS\n');
  const rootAffiliations = await db.collection('affiliations').get();
  const clubAffiliations = await db.collection('clubs').doc('sporting-cat').collection('affiliations').get();
  
  const rootAffIds = new Set(rootAffiliations.docs.map(d => d.id));
  const clubAffIds = new Set(clubAffiliations.docs.map(d => d.id));
  
  const affOnlyInRoot = [...rootAffIds].filter(id => !clubAffIds.has(id));
  const affOnlyInClub = [...clubAffIds].filter(id => !rootAffIds.has(id));
  
  console.log(`Root: ${rootAffiliations.size} documenti`);
  console.log(`Club: ${clubAffiliations.size} documenti`);
  console.log(`Solo in root: ${affOnlyInRoot.length}`);
  console.log(`Solo in club: ${affOnlyInClub.length}\n`);
  
  if (affOnlyInRoot.length > 0) {
    console.log('❌ IDs solo in root affiliations:');
    affOnlyInRoot.forEach(id => console.log(`   - ${id}`));
    console.log('');
  }
  
  if (affOnlyInClub.length > 0) {
    console.log('❌ IDs solo in club affiliations:');
    affOnlyInClub.forEach(id => console.log(`   - ${id}`));
    console.log('');
  }
  
  results.affiliations = {
    rootCount: rootAffiliations.size,
    clubCount: clubAffiliations.size,
    onlyInRoot: affOnlyInRoot,
    onlyInClub: affOnlyInClub
  };
  
  // Profiles
  console.log('📊 PROFILES\n');
  const rootProfiles = await db.collection('profiles').get();
  const clubProfiles = await db.collection('clubs').doc('sporting-cat').collection('profiles').get();
  
  const rootProfileIds = new Set(rootProfiles.docs.map(d => d.id));
  const clubProfileIds = new Set(clubProfiles.docs.map(d => d.id));
  
  const profOnlyInRoot = [...rootProfileIds].filter(id => !clubProfileIds.has(id));
  const profOnlyInClub = [...clubProfileIds].filter(id => !rootProfileIds.has(id));
  
  console.log(`Root: ${rootProfiles.size} documenti`);
  console.log(`Club: ${clubProfiles.size} documenti`);
  console.log(`Solo in root: ${profOnlyInRoot.length}`);
  console.log(`Solo in club: ${profOnlyInClub.length}\n`);
  
  if (profOnlyInClub.length > 0) {
    console.log('❌ IDs solo in club profiles (primi 10):');
    profOnlyInClub.slice(0, 10).forEach(id => console.log(`   - ${id}`));
    if (profOnlyInClub.length > 10) {
      console.log(`   ... e altri ${profOnlyInClub.length - 10}`);
    }
    console.log('');
  }
  
  results.profiles = {
    rootCount: rootProfiles.size,
    clubCount: clubProfiles.size,
    onlyInRoot: profOnlyInRoot,
    onlyInClub: profOnlyInClub
  };
  
  // Users
  console.log('📊 USERS\n');
  const rootUsers = await db.collection('users').get();
  const clubUsers = await db.collection('clubs').doc('sporting-cat').collection('users').get();
  
  const rootUserIds = new Set(rootUsers.docs.map(d => d.id));
  const clubUserIds = new Set(clubUsers.docs.map(d => d.id));
  
  const usersOnlyInRoot = [...rootUserIds].filter(id => !clubUserIds.has(id));
  const usersOnlyInClub = [...clubUserIds].filter(id => !rootUserIds.has(id));
  
  console.log(`Root: ${rootUsers.size} documenti`);
  console.log(`Club: ${clubUsers.size} documenti`);
  console.log(`Solo in root: ${usersOnlyInRoot.length}`);
  console.log(`Solo in club: ${usersOnlyInClub.length}\n`);
  
  if (usersOnlyInClub.length > 0) {
    console.log('❌ IDs solo in club users (primi 10):');
    usersOnlyInClub.slice(0, 10).forEach(id => console.log(`   - ${id}`));
    if (usersOnlyInClub.length > 10) {
      console.log(`   ... e altri ${usersOnlyInClub.length - 10}`);
    }
    console.log('');
  }
  
  results.users = {
    rootCount: rootUsers.size,
    clubCount: clubUsers.size,
    onlyInRoot: usersOnlyInRoot,
    onlyInClub: usersOnlyInClub
  };
  
  // Summary
  console.log('='.repeat(60));
  console.log('📋 SUMMARY\n');
  
  console.log('AFFILIATIONS:');
  console.log(`  Source of Truth: ${results.affiliations.clubCount > results.affiliations.rootCount ? 'CLUB SUBCOLLECTION (più completa)' : 'ROOT COLLECTION'}`);
  
  console.log('\nPROFILES:');
  console.log(`  Source of Truth: ${results.profiles.clubCount > results.profiles.rootCount ? 'CLUB SUBCOLLECTION (più completa)' : 'ROOT COLLECTION'}`);
  
  console.log('\nUSERS:');
  console.log(`  Source of Truth: ${results.users.clubCount > results.users.rootCount ? 'CLUB SUBCOLLECTION (più completa)' : 'ROOT COLLECTION'}`);
  
  console.log('\n💡 RACCOMANDAZIONI:\n');
  
  if (results.affiliations.clubCount > results.affiliations.rootCount) {
    console.log('✅ affiliations/ - Sincronizzare root da club subcollection');
  }
  
  if (results.profiles.clubCount > results.profiles.rootCount) {
    console.log('⚠️ profiles/ - Club subcollection più completa (8 documenti in più)');
    console.log('   Azione: Considerare club/profiles come primary');
  }
  
  if (results.users.clubCount > results.users.rootCount) {
    console.log('⚠️ users/ - Club subcollection MOLTO più completa (25 documenti in più)');
    console.log('   Azione: club/users è la source of truth');
  }
  
  // Salva report
  const reportPath = join(__dirname, `discrepancies-report-${Date.now()}.json`);
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n💾 Report salvato: ${reportPath}\n`);
}

analyzeDiscrepancies().catch(console.error);
