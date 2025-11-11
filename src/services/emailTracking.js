// =============================================
// FILE: src/services/emailTracking.js
// Servizio per tracking invii email certificati
// =============================================

import { doc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@config/firebase';

/**
 * Salva il tracking di un invio email per il certificato medico
 * @param {string} clubId - ID del club
 * @param {string} playerId - ID del giocatore (userId)
 * @param {Object} emailInfo - Informazioni sull'email inviata
 * @returns {Promise<void>}
 */
export async function trackCertificateEmail(clubId, playerId, emailInfo = {}) {
  try {
    // Trova il documento in clubs/{clubId}/users/ che corrisponde a questo playerId
    const usersRef = collection(db, 'clubs', clubId, 'users');
    const q = query(usersRef, where('userId', '==', playerId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn(`⚠️ No user found for playerId ${playerId} in club ${clubId}`);
      return;
    }
    
    const userDoc = snapshot.docs[0];
    const userRef = doc(db, 'clubs', clubId, 'users', userDoc.id);
    
    const emailLog = {
      sentAt: new Date().toISOString(),
      type: emailInfo.type || 'certificate', // 'certificate', 'reminder', 'custom'
      templateType: emailInfo.templateType || 'generic', // 'expired', 'expiring', 'missing', 'generic'
      subject: emailInfo.subject || '',
      success: emailInfo.success !== false, // Default true
      ...emailInfo,
    };

    await updateDoc(userRef, {
      'originalProfileData.medicalCertificates.emailHistory': arrayUnion(emailLog),
      'originalProfileData.medicalCertificates.lastEmailSent': emailLog.sentAt,
    });
  } catch (error) {
    console.error('❌ Error tracking email:', error);
    // Non bloccare l'invio se il tracking fallisce
  }
}

/**
 * Ottiene l'ultimo invio email per un giocatore
 * @param {Object} player - Oggetto giocatore
 * @returns {Object|null} Ultimo invio email o null
 */
export function getLastEmailSent(player) {
  const emailHistory = player?.medicalCertificates?.emailHistory;
  if (!emailHistory || emailHistory.length === 0) {
    return null;
  }

  // Restituisce l'ultimo elemento (più recente)
  return emailHistory[emailHistory.length - 1];
}

/**
 * Formatta la data dell'ultimo invio in formato leggibile
 * @param {Object} player - Oggetto giocatore
 * @returns {string} Data formattata o ''
 */
export function formatLastEmailDate(player) {
  const lastEmail = getLastEmailSent(player);
  if (!lastEmail) {
    return '';
  }

  try {
    const date = new Date(lastEmail.sentAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Formato relativo per date recenti
    if (diffMins < 1) {
      return 'Appena inviata';
    } else if (diffMins < 60) {
      return `${diffMins} min fa`;
    } else if (diffHours < 24) {
      return `${diffHours}h fa`;
    } else if (diffDays === 1) {
      return 'Ieri';
    } else if (diffDays < 7) {
      return `${diffDays} giorni fa`;
    } else {
      // Formato assoluto per date più vecchie
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  } catch (error) {
    console.error('Error formatting email date:', error);
    return '';
  }
}

/**
 * Ottiene tutte le email inviate per un giocatore
 * @param {Object} player - Oggetto giocatore
 * @returns {Array} Array di email inviate
 */
export function getEmailHistory(player) {
  return player?.medicalCertificates?.emailHistory || [];
}

/**
 * Conta quante email sono state inviate a un giocatore
 * @param {Object} player - Oggetto giocatore
 * @returns {number} Numero di email inviate
 */
export function getEmailCount(player) {
  return getEmailHistory(player).length;
}

/**
 * Verifica se è stata inviata un'email di recente (nelle ultime 24h)
 * @param {Object} player - Oggetto giocatore
 * @returns {boolean}
 */
export function hasRecentEmail(player) {
  const lastEmail = getLastEmailSent(player);
  if (!lastEmail) {
    return false;
  }

  const lastSentDate = new Date(lastEmail.sentAt);
  const now = new Date();
  const diffHours = (now - lastSentDate) / 3600000;

  return diffHours < 24;
}
