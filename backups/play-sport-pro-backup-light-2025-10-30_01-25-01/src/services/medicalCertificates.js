// =============================================
// FILE: src/services/medicalCertificates.js
// Servizio per la gestione dei certificati medici
// =============================================

import { storage, db } from './firebase.js';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import {
  CERTIFICATE_STATUS,
  EXPIRY_WARNING_DAYS,
  EXPIRY_CRITICAL_DAYS,
} from '@features/players/types/playerTypes.js';

/**
 * Carica un certificato medico su Firebase Storage
 * @param {string} clubId - ID del club
 * @param {string} playerId - ID del giocatore
 * @param {File} file - File PDF da caricare
 * @param {Function} onProgress - Callback per progress (0-100)
 * @returns {Promise<string>} URL download del file caricato
 */
export async function uploadMedicalCertificate(clubId, playerId, file, onProgress) {
  try {
    // Validazione file
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      throw new Error('Solo file PDF o immagini sono accettati');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File troppo grande. Dimensione massima: 5MB');
    }

    // Crea riferimento storage
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `certificate_${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, `clubs/${clubId}/medical-certificates/${playerId}/${fileName}`);

    // Upload con progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error('Errore durante il caricamento del file: ' + error.message));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload certificate error:', error);
    throw error;
  }
}

/**
 * Elimina un certificato da Firebase Storage
 * @param {string} fileUrl - URL completo del file da eliminare
 */
export async function deleteMedicalCertificate(fileUrl) {
  try {
    if (!fileUrl) return;

    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    console.log('Certificate deleted successfully:', fileUrl);
  } catch (error) {
    console.error('Error deleting certificate:', error);
    // Non lanciare errore se il file non esiste
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }
}

/**
 * Calcola lo status del certificato in base alla data di scadenza
 * @param {string|Date|null} expiryDate - Data di scadenza
 * @returns {Object} Status del certificato
 */
export function calculateCertificateStatus(expiryDate) {
  if (!expiryDate) {
    return {
      isValid: false,
      isExpiring: false,
      isExpired: false,
      daysUntilExpiry: null,
      canBook: false,
      status: CERTIFICATE_STATUS.MISSING,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry - today;
  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = daysUntilExpiry < 0;
  const isExpiring = daysUntilExpiry >= 0 && daysUntilExpiry <= EXPIRY_WARNING_DAYS;
  const isValid = daysUntilExpiry > 0;

  let status = CERTIFICATE_STATUS.VALID;
  if (isExpired) {
    status = CERTIFICATE_STATUS.EXPIRED;
  } else if (isExpiring) {
    status = CERTIFICATE_STATUS.EXPIRING;
  }

  return {
    isValid,
    isExpiring,
    isExpired,
    daysUntilExpiry,
    canBook: !isExpired, // Può prenotare solo se non scaduto
    status,
  };
}

/**
 * Aggiorna lo status del certificato per un giocatore
 * @param {string} clubId - ID del club
 * @param {string} playerId - ID del giocatore
 * @returns {Promise<Object>} Nuovo status del certificato
 */
export async function updatePlayerCertificateStatus(clubId, playerId) {
  try {
    const playerRef = doc(db, 'clubs', clubId, 'players', playerId);
    const playerDoc = await getDoc(playerRef);

    if (!playerDoc.exists()) {
      throw new Error('Giocatore non trovato');
    }

    const player = playerDoc.data();
    const expiryDate = player.medicalCertificates?.current?.expiryDate;

    const status = calculateCertificateStatus(expiryDate);

    await updateDoc(playerRef, {
      certificateStatus: status,
      updatedAt: new Date().toISOString(),
    });

    console.log('Certificate status updated for player:', playerId, status);
    return status;
  } catch (error) {
    console.error('Error updating certificate status:', error);
    throw error;
  }
}

/**
 * Trova tutti i giocatori con certificati in scadenza o scaduti
 * @param {string} clubId - ID del club
 * @param {number} daysThreshold - Giorni di soglia (default 30)
 * @returns {Promise<Array>} Lista giocatori con certificati in scadenza
 */
export async function getPlayersWithExpiringCertificates(clubId, daysThreshold = 30) {
  try {
    const playersRef = collection(db, 'clubs', clubId, 'players');
    const snapshot = await getDocs(playersRef);

    const expiringPlayers = [];

    snapshot.forEach((doc) => {
      const player = { id: doc.id, ...doc.data() };
      const expiryDate = player.medicalCertificates?.current?.expiryDate;

      const status = calculateCertificateStatus(expiryDate);

      // Includi se:
      // 1. Certificato scaduto
      // 2. Certificato in scadenza entro soglia
      // 3. Nessun certificato caricato
      if (
        status.isExpired ||
        (status.isExpiring && status.daysUntilExpiry <= daysThreshold) ||
        status.status === CERTIFICATE_STATUS.MISSING
      ) {
        expiringPlayers.push({
          ...player,
          certificateStatus: status,
        });
      }
    });

    // Ordina per urgenza (scaduti prima, poi in scadenza per data)
    expiringPlayers.sort((a, b) => {
      // Scaduti prima
      if (a.certificateStatus.isExpired && !b.certificateStatus.isExpired) return -1;
      if (!a.certificateStatus.isExpired && b.certificateStatus.isExpired) return 1;

      // Mancanti dopo gli scaduti
      if (
        a.certificateStatus.status === CERTIFICATE_STATUS.MISSING &&
        b.certificateStatus.status !== CERTIFICATE_STATUS.MISSING
      )
        return 1;
      if (
        a.certificateStatus.status !== CERTIFICATE_STATUS.MISSING &&
        b.certificateStatus.status === CERTIFICATE_STATUS.MISSING
      )
        return -1;

      // Poi ordina per giorni rimanenti (meno giorni = più urgente)
      const daysA = a.certificateStatus.daysUntilExpiry ?? -999;
      const daysB = b.certificateStatus.daysUntilExpiry ?? -999;
      return daysA - daysB;
    });

    console.log(`Found ${expiringPlayers.length} players with expiring/expired certificates`);
    return expiringPlayers;
  } catch (error) {
    console.error('Error getting expiring certificates:', error);
    throw error;
  }
}

/**
 * Aggiorna i dati del certificato corrente
 * @param {string} clubId - ID del club
 * @param {string} playerId - ID del giocatore
 * @param {Object} certificateData - Dati del certificato
 * @returns {Promise<void>}
 */
export async function updateCertificateData(clubId, playerId, certificateData) {
  try {
    const playerRef = doc(db, 'clubs', clubId, 'players', playerId);

    // Calcola nuovo status
    const status = calculateCertificateStatus(certificateData.expiryDate);

    await updateDoc(playerRef, {
      'medicalCertificates.current': certificateData,
      certificateStatus: status,
      updatedAt: new Date().toISOString(),
    });

    console.log('Certificate data updated for player:', playerId);
  } catch (error) {
    console.error('Error updating certificate data:', error);
    throw error;
  }
}

/**
 * Sposta il certificato corrente nello storico e lo elimina
 * @param {string} clubId - ID del club
 * @param {string} playerId - ID del giocatore
 * @returns {Promise<void>}
 */
export async function archiveCurrentCertificate(clubId, playerId) {
  try {
    const playerRef = doc(db, 'clubs', clubId, 'players', playerId);
    const playerDoc = await getDoc(playerRef);

    if (!playerDoc.exists()) {
      throw new Error('Giocatore non trovato');
    }

    const player = playerDoc.data();
    const currentCert = player.medicalCertificates?.current;

    if (!currentCert?.expiryDate) {
      throw new Error('Nessun certificato corrente da archiviare');
    }

    // Elimina il file se esiste
    if (currentCert.fileUrl) {
      await deleteMedicalCertificate(currentCert.fileUrl);
    }

    // Sposta nello storico
    const history = player.medicalCertificates?.history || [];
    history.push({
      ...currentCert,
      archivedAt: new Date().toISOString(),
    });

    // Reset certificato corrente
    const emptyCert = {
      id: '',
      type: 'agonistic',
      number: '',
      issueDate: null,
      expiryDate: null,
      doctor: '',
      facility: '',
      fileUrl: '',
      fileName: '',
      uploadedAt: null,
      uploadedBy: '',
      notes: '',
    };

    const newStatus = calculateCertificateStatus(null);

    await updateDoc(playerRef, {
      'medicalCertificates.current': emptyCert,
      'medicalCertificates.history': history,
      certificateStatus: newStatus,
      updatedAt: new Date().toISOString(),
    });

    console.log('Certificate archived for player:', playerId);
  } catch (error) {
    console.error('Error archiving certificate:', error);
    throw error;
  }
}

/**
 * Ottieni statistiche certificati per il club
 * @param {string} clubId - ID del club
 * @returns {Promise<Object>} Statistiche certificati
 */
export async function getCertificateStats(clubId) {
  try {
    const playersRef = collection(db, 'clubs', clubId, 'players');
    const snapshot = await getDocs(playersRef);

    const stats = {
      total: 0,
      valid: 0,
      expiring: 0,
      expired: 0,
      missing: 0,
      expiringCritical: 0, // < 15 giorni
    };

    snapshot.forEach((doc) => {
      const player = doc.data();
      const expiryDate = player.medicalCertificates?.current?.expiryDate;
      const status = calculateCertificateStatus(expiryDate);

      stats.total++;

      if (status.status === CERTIFICATE_STATUS.VALID) {
        stats.valid++;
      } else if (status.status === CERTIFICATE_STATUS.EXPIRING) {
        stats.expiring++;
        if (status.daysUntilExpiry <= EXPIRY_CRITICAL_DAYS) {
          stats.expiringCritical++;
        }
      } else if (status.status === CERTIFICATE_STATUS.EXPIRED) {
        stats.expired++;
      } else if (status.status === CERTIFICATE_STATUS.MISSING) {
        stats.missing++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting certificate stats:', error);
    throw error;
  }
}
