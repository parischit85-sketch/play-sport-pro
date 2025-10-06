#!/usr/bin/env node
/**
 * SCRIPT 1: Analisi Collezioni Firestore
 * 
 * Questo script analizza tutte le collezioni del database Firestore
 * e genera un report dettagliato sulla struttura attuale.
 * 
 * NON modifica nessun dato - solo lettura.
 * 
 * Utilizzo:
 * 1. Assicurati di avere serviceAccount.json nella directory scripts/
 * 2. node 1-analyze-collections.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inizializza Firebase Admin
try {
  const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '../serviceAccount.json'), 'utf8')
  );
  
  initializeApp({
    credential: cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin inizializzato');
} catch (error) {
  console.error('❌ Errore inizializzazione Firebase:', error.message);
  console.log('\n💡 Assicurati di avere serviceAccount.json in scripts/');
  process.exit(1);
}

const db = getFirestore();

/**
 * Analizza collezioni root
 */
async function analyzeRootCollections() {
  console.log('\n📊 ANALISI COLLEZIONI ROOT\n');
  console.log('='.repeat(60));
  
  const collections = await db.listCollections();
  const results = [];
  
  for (const col of collections) {
    try {
      const snapshot = await col.limit(1).get();
      const count = (await col.count().get()).data().count;
      
      let sampleData = null;
      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0];
        sampleData = {
          id: firstDoc.id,
          fields: Object.keys(firstDoc.data())
        };
      }
      
      results.push({
        name: col.id,
        count,
        sample: sampleData
      });
      
      console.log(`\n📁 ${col.id}`);
      console.log(`   Documenti: ${count}`);
      if (sampleData) {
        console.log(`   Campi esempio: ${sampleData.fields.join(', ')}`);
        console.log(`   ID esempio: ${sampleData.id}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Errore lettura ${col.id}:`, error.message);
    }
  }
  
  return results;
}

/**
 * Analizza subcollections per ogni club
 */
async function analyzeClubSubcollections() {
  console.log('\n\n📊 ANALISI SUBCOLLECTIONS CLUB\n');
  console.log('='.repeat(60));
  
  try {
    const clubsSnap = await db.collection('clubs').get();
    const results = [];
    
    if (clubsSnap.empty) {
      console.log('⚠️ Nessun club trovato');
      return results;
    }
    
    for (const clubDoc of clubsSnap.docs) {
      console.log(`\n🏢 CLUB: ${clubDoc.id}`);
      console.log(`   Nome: ${clubDoc.data().name || 'N/A'}`);
      
      const subcols = await clubDoc.ref.listCollections();
      const clubResult = {
        clubId: clubDoc.id,
        clubName: clubDoc.data().name,
        subcollections: []
      };
      
      for (const subcol of subcols) {
        try {
          const count = (await subcol.count().get()).data().count;
          const snapshot = await subcol.limit(1).get();
          
          let sampleFields = [];
          if (!snapshot.empty) {
            sampleFields = Object.keys(snapshot.docs[0].data());
          }
          
          clubResult.subcollections.push({
            name: subcol.id,
            count,
            sampleFields
          });
          
          console.log(`   └─ ${subcol.id}: ${count} documenti`);
          if (sampleFields.length > 0) {
            console.log(`      Campi: ${sampleFields.slice(0, 5).join(', ')}${sampleFields.length > 5 ? '...' : ''}`);
          }
          
        } catch (error) {
          console.error(`   └─ ${subcol.id}: ❌ ${error.message}`);
        }
      }
      
      results.push(clubResult);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Errore analisi clubs:', error.message);
    return [];
  }
}

/**
 * Verifica duplicazioni
 */
async function checkDuplicates() {
  console.log('\n\n🔍 VERIFICA DUPLICAZIONI\n');
  console.log('='.repeat(60));
  
  const issues = [];
  
  // Check 1: bookings root vs club subcollections
  try {
    const rootBookings = (await db.collection('bookings').count().get()).data().count;
    console.log(`\n1️⃣ BOOKINGS:`);
    console.log(`   Root /bookings/: ${rootBookings} documenti`);
    
    const clubsSnap = await db.collection('clubs').get();
    let totalClubBookings = 0;
    
    for (const clubDoc of clubsSnap.docs) {
      const clubBookings = (
        await clubDoc.ref.collection('bookings').count().get()
      ).data().count;
      totalClubBookings += clubBookings;
      console.log(`   clubs/${clubDoc.id}/bookings/: ${clubBookings} documenti`);
    }
    
    if (rootBookings > 0 && totalClubBookings > 0) {
      issues.push({
        type: 'DUPLICAZIONE',
        collection: 'bookings',
        description: `Bookings sia in root (${rootBookings}) che in clubs (${totalClubBookings})`,
        severity: 'ALTA'
      });
      console.log(`   ⚠️ DUPLICAZIONE RILEVATA`);
    }
    
  } catch (error) {
    console.log(`   ⚠️ Errore verifica bookings: ${error.message}`);
  }
  
  // Check 2: affiliations vs club_affiliations
  try {
    const affiliations = (await db.collection('affiliations').count().get()).data().count;
    const clubAffiliations = (await db.collection('club_affiliations').count().get()).data().count;
    
    console.log(`\n2️⃣ AFFILIATIONS:`);
    console.log(`   /affiliations/: ${affiliations} documenti`);
    console.log(`   /club_affiliations/: ${clubAffiliations} documenti`);
    
    if (affiliations > 0 && clubAffiliations > 0) {
      issues.push({
        type: 'DUPLICAZIONE',
        collection: 'affiliations',
        description: `Affiliazioni in due collezioni separate`,
        severity: 'MEDIA'
      });
      console.log(`   ⚠️ DUPLICAZIONE RILEVATA`);
    }
    
  } catch (error) {
    console.log(`   ⚠️ Errore verifica affiliations: ${error.message}`);
  }
  
  // Check 3: profiles vs users
  try {
    const profiles = (await db.collection('profiles').count().get()).data().count;
    const users = (await db.collection('users').count().get()).data().count;
    
    console.log(`\n3️⃣ PROFILI UTENTE:`);
    console.log(`   /profiles/: ${profiles} documenti`);
    console.log(`   /users/: ${users} documenti`);
    
    if (profiles > 0 && users > 0) {
      issues.push({
        type: 'MIGRAZIONE INCOMPLETA',
        collection: 'users',
        description: `Profili in entrambe le collezioni (migrazione in corso)`,
        severity: 'MEDIA'
      });
      console.log(`   ⚠️ MIGRAZIONE IN CORSO`);
    }
    
  } catch (error) {
    console.log(`   ⚠️ Errore verifica profiles: ${error.message}`);
  }
  
  // Check 4: leagues (legacy)
  try {
    const leagues = (await db.collection('leagues').count().get()).data().count;
    
    console.log(`\n4️⃣ LEAGUE LEGACY:`);
    console.log(`   /leagues/: ${leagues} documenti`);
    
    if (leagues > 0) {
      issues.push({
        type: 'LEGACY',
        collection: 'leagues',
        description: `Sistema legacy ancora presente`,
        severity: 'BASSA'
      });
      console.log(`   ⚠️ SISTEMA LEGACY RILEVATO`);
    }
    
  } catch (error) {
    console.log(`   ⚠️ Errore verifica leagues: ${error.message}`);
  }
  
  return issues;
}

/**
 * Genera report summary
 */
function generateSummary(rootCollections, clubData, issues) {
  console.log('\n\n📋 SUMMARY REPORT\n');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Collezioni root analizzate: ${rootCollections.length}`);
  console.log(`✅ Club analizzati: ${clubData.length}`);
  console.log(`⚠️ Issues rilevati: ${issues.length}`);
  
  if (issues.length > 0) {
    console.log('\n🚨 ISSUES DA RISOLVERE:\n');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.severity}] ${issue.type}`);
      console.log(`   Collezione: ${issue.collection}`);
      console.log(`   Descrizione: ${issue.description}`);
      console.log('');
    });
  }
  
  // Raccomandazioni
  console.log('\n💡 RACCOMANDAZIONI:\n');
  
  const hasRootBookings = rootCollections.find(c => c.name === 'bookings' && c.count > 0);
  if (hasRootBookings) {
    console.log('1. ⚠️ Migrare /bookings/ → clubs/{clubId}/bookings/');
  }
  
  const hasClubAffiliations = rootCollections.find(c => c.name === 'club_affiliations' && c.count > 0);
  if (hasClubAffiliations) {
    console.log('2. ⚠️ Consolidare club_affiliations → affiliations');
  }
  
  const hasProfiles = rootCollections.find(c => c.name === 'profiles' && c.count > 0);
  if (hasProfiles) {
    console.log('3. ⚠️ Completare migrazione profiles → users');
  }
  
  const hasLeagues = rootCollections.find(c => c.name === 'leagues' && c.count > 0);
  if (hasLeagues) {
    console.log('4. ℹ️ Valutare eliminazione sistema legacy /leagues/');
  }
}

/**
 * Salva report su file
 */
function saveReport(data) {
  const report = {
    timestamp: new Date().toISOString(),
    rootCollections: data.rootCollections,
    clubData: data.clubData,
    issues: data.issues
  };
  
  const filename = `firestore-analysis-${Date.now()}.json`;
  const filepath = join(__dirname, filename);
  
  writeFileSync(filepath, JSON.stringify(report, null, 2));
  
  console.log(`\n💾 Report salvato: ${filename}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🔍 ANALISI DATABASE FIRESTORE');
  console.log('='.repeat(60));
  console.log('Questo script analizza la struttura del database');
  console.log('NON modifica alcun dato\n');
  
  try {
    const rootCollections = await analyzeRootCollections();
    const clubData = await analyzeClubSubcollections();
    const issues = await checkDuplicates();
    
    generateSummary(rootCollections, clubData, issues);
    
    saveReport({ rootCollections, clubData, issues });
    
    console.log('\n✅ ANALISI COMPLETATA\n');
    
  } catch (error) {
    console.error('\n❌ ERRORE:', error);
    process.exit(1);
  }
}

main();
