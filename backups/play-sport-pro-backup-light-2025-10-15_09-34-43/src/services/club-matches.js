// FILE: src/services/club-matches.js
// Servizi basilari per gestione matches per club (multi-club)
import { db } from '@services/firebase.js';
import { collection, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export async function createClubMatch(clubId, match) {
  if (!clubId) {
    throw new Error('clubId mancante');
  }

  const col = collection(db, 'clubs', clubId, 'matches');

  const payload = {
    ...match,
    clubId,
    createdAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(col, payload);
    return { id: ref.id, ...match };
  } catch (error) {
    console.error('Error adding club match:', error);
    throw error;
  }
}

export async function deleteClubMatch(clubId, matchId) {
  if (!clubId) throw new Error('clubId mancante');

  try {
    // 🔄 NUOVO: Tenta di cancellare da entrambe le collezioni

    // 1️⃣ Prima prova nella nuova collezione matches
    try {
      const matchRef = doc(db, 'clubs', clubId, 'matches', matchId);
      await deleteDoc(matchRef);
      console.log('✅ Match deleted from new matches collection:', matchId);
      return true;
    } catch (error) {
      console.log('⚠️ Match not found in new collection, trying legacy bookings...');
    }

    // 2️⃣ Se non trovato, prova nella collezione bookings legacy
    try {
      const bookingRef = doc(db, 'bookings', matchId);
      await deleteDoc(bookingRef);
      console.log('✅ Match deleted from legacy bookings collection:', matchId);
      return true;
    } catch (error) {
      console.log('❌ Match not found in legacy collection either');
      throw new Error(`Match ${matchId} not found in any collection`);
    }
  } catch (error) {
    console.error('❌ Error deleting match:', error);
    throw error;
  }
}

export default { createClubMatch, deleteClubMatch };
