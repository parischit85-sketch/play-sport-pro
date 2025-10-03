// =============================================
// FILE: src/utils/debugClubAdmin.js
// =============================================
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@services/firebase.js';

/**
 * Funzione di debug per promuovere un utente a CLUB_ADMIN
 * DA USARE SOLO IN DEVELOPMENT
 */
export async function debugPromoteToClubAdmin(userId, clubId, userEmail) {
  if (import.meta.env.MODE !== 'development') {
    console.warn('Debug functions only available in development mode');
    return false;
  }
  
  try {
    const affiliationId = `${userId}_${clubId}`;
    const affiliationRef = doc(db, 'affiliations', affiliationId);
    
    const affiliationData = {
      userId: userId,
      clubId: clubId,
      userEmail: userEmail,
      role: 'club_admin',
      isClubAdmin: true,
      status: 'approved',
      joinedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(affiliationRef, affiliationData, { merge: true });
    
    console.log('✅ Debug: User promoted to CLUB_ADMIN', {
      userId,
      clubId,
      userEmail,
      affiliationId
    });
    
    return true;
  } catch (error) {
    console.error('❌ Debug: Error promoting user', error);
    return false;
  }
}

// Espone la funzione globalmente per debug
if (import.meta.env.MODE === 'development') {
  window.debugPromoteToClubAdmin = debugPromoteToClubAdmin;
}