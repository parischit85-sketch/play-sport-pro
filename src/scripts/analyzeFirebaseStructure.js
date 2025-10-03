// Script per analizzare la struttura completa del database Firebase
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase.node.js';

async function analyzeClubStructure(clubId) {
  console.log(`\n=== ANALISI STRUTTURA CLUB: ${clubId} ===`);
  
  // 1. Documento principale del club
  const clubRef = doc(db, 'clubs', clubId);
  const clubSnap = await getDoc(clubRef);
  if (clubSnap.exists()) {
    const clubData = clubSnap.data();
    console.log('📄 Documento club principale:', {
      id: clubSnap.id,
      campiInDocumento: clubData.courts || 'N/A',
      tipiCampi: clubData.courtTypes || 'N/A',
      altriCampi: Object.keys(clubData).filter(k => k.includes('court') || k.includes('Court'))
    });
  }
  
  // 2. Subcollection courts
  const courtsRef = collection(db, 'clubs', clubId, 'courts');
  const courtsSnap = await getDocs(courtsRef);
  console.log('\n🏟️ Subcollection courts:');
  courtsSnap.forEach(doc => {
    const data = doc.data();
    console.log(`  - ID: ${doc.id} | Nome: ${data.name} | Creato: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
    console.log(`    Dati completi:`, data);
  });
  
  // 3. Subcollection bookings per vedere riferimenti ai campi
  const bookingsRef = collection(db, 'clubs', clubId, 'bookings');
  const bookingsSnap = await getDocs(bookingsRef);
  const courtReferences = new Set();
  bookingsSnap.forEach(doc => {
    const data = doc.data();
    if (data.courtId) courtReferences.add(data.courtId);
  });
  console.log('\n📅 Riferimenti ai campi nelle prenotazioni:', Array.from(courtReferences));
}

async function analyzeGlobalCollections() {
  console.log('\n=== ANALISI COLLEZIONI GLOBALI ===');
  
  const globalCollections = ['courts', 'bookings', 'leagues'];
  
  for (const colName of globalCollections) {
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      console.log(`📁 ${colName}: vuota`);
      continue;
    }
    
    console.log(`\n📁 Collezione ${colName}:`);
    snapshot.forEach(doc => {
      const data = doc.data();
      if (colName === 'bookings' && (data.courtId || data.courtName)) {
        console.log(`  - Booking ${doc.id}: campo ${data.courtId} (${data.courtName})`);
      } else if (colName === 'courts') {
        console.log(`  - Campo ${doc.id}: ${data.name || 'N/A'}`);
        console.log(`    Dati completi:`, data);
      }
    });
  }
}

(async () => {
  try {
    await analyzeClubStructure('sporting-cat');
    await analyzeGlobalCollections();
    console.log('\n=== ANALISI COMPLETATA ===');
  } catch (error) {
    console.error('❌ Errore durante l\'analisi:', error);
  }
  process.exit(0);
})();