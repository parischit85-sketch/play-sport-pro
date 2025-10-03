// =============================================
// SISTEMA COLLEGAMENTO ACCOUNT ESISTENTI
// =============================================
// Collega profili di giocatori esistenti con nuovi account che si registrano

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../services/firebase.js';

const SPORTING_CAT_CLUB_ID = 'sporting-cat';

/**
 * Cerca un profilo esistente che potrebbe corrispondere a un nuovo utente
 */
export async function findMatchingLegacyProfile(userEmail, userDisplayName) {
  console.log(`🔍 Cercando profilo esistente per: ${userEmail} / ${userDisplayName}`);

  try {
    const matches = [];

    // 1. Cerca per email esatta
    if (userEmail) {
      const emailQuery = query(
        collection(db, 'profiles'),
        where('email', '==', userEmail),
        where('isLegacyMember', '==', true)
      );

      const emailSnapshot = await getDocs(emailQuery);
      emailSnapshot.forEach((doc) => {
        matches.push({
          type: 'email_exact',
          confidence: 100,
          profile: { id: doc.id, ...doc.data() },
        });
      });
    }

    // 2. Se non trovato per email, cerca per nome simile
    if (matches.length === 0 && userDisplayName) {
      const allProfilesQuery = query(
        collection(db, 'profiles'),
        where('isLegacyMember', '==', true)
      );

      const profilesSnapshot = await getDocs(allProfilesQuery);

      profilesSnapshot.forEach((doc) => {
        const profile = doc.data();
        const profileName =
          profile.displayName || `${profile.firstName} ${profile.lastName}`.trim();

        // Calcola similarità del nome
        const similarity = calculateNameSimilarity(userDisplayName, profileName);

        if (similarity > 70) {
          // Soglia di similarità
          matches.push({
            type: 'name_similar',
            confidence: similarity,
            profile: { id: doc.id, ...profile },
          });
        }
      });
    }

    // Ordina per confidenza decrescente
    matches.sort((a, b) => b.confidence - a.confidence);

    console.log(`   📋 Trovati ${matches.length} possibili match`);
    if (matches.length > 0) {
      console.log(
        `   🎯 Miglior match: ${matches[0].profile.displayName} (${matches[0].confidence}%)`
      );
    }

    return matches;
  } catch (error) {
    console.error('❌ Errore ricerca profilo esistente:', error);
    return [];
  }
}

/**
 * Calcola la similarità tra due nomi
 */
function calculateNameSimilarity(name1, name2) {
  if (!name1 || !name2) return 0;

  const normalize = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s]/g, '');
  const n1 = normalize(name1);
  const n2 = normalize(name2);

  // Exact match
  if (n1 === n2) return 100;

  // Controlla se uno è contenuto nell'altro
  if (n1.includes(n2) || n2.includes(n1)) return 85;

  // Controlla parole in comune
  const words1 = n1.split(/\s+/);
  const words2 = n2.split(/\s+/);

  let commonWords = 0;
  const totalWords = Math.max(words1.length, words2.length);

  words1.forEach((word1) => {
    if (words2.some((word2) => word1 === word2 || word1.includes(word2) || word2.includes(word1))) {
      commonWords++;
    }
  });

  return Math.round((commonWords / totalWords) * 100);
}

/**
 * Collega un nuovo account Firebase a un profilo esistente
 */
export async function linkNewAccountToLegacyProfile(firebaseUser, legacyProfile) {
  console.log(
    `🔗 Collegando account ${firebaseUser.email} a profilo esistente ${legacyProfile.displayName}`
  );

  try {
    const batch = writeBatch(db);

    // 1. Aggiorna il profilo esistente con i dati del nuovo account
    const profileRef = doc(db, 'profiles', legacyProfile.id);
    const profileUpdates = {
      // Mantieni i dati esistenti ma aggiungi info account
      firebaseUid: firebaseUser.uid,
      linkedAt: new Date().toISOString(),
      isLegacyMember: true,
      accountLinked: true,

      // Aggiorna email se non presente
      email: legacyProfile.email || firebaseUser.email,

      // Aggiorna displayName se migliorato
      displayName: firebaseUser.displayName || legacyProfile.displayName,

      // Info provider
      provider: 'linked_legacy',
      authProviders: [firebaseUser.providerData[0]?.providerId || 'unknown'],

      // Aggiorna timestamp
      updatedAt: new Date().toISOString(),
    };

    batch.update(profileRef, profileUpdates);

    // 2. Crea/aggiorna l'affiliazione se non esiste
    const affiliationQuery = query(
      collection(db, 'affiliations'),
      where('userId', '==', legacyProfile.id),
      where('clubId', '==', SPORTING_CAT_CLUB_ID)
    );

    const affiliationSnapshot = await getDocs(affiliationQuery);

    if (affiliationSnapshot.empty) {
      // Crea nuova affiliazione
      const affiliationRef = doc(collection(db, 'affiliations'));
      const affiliationData = {
        userId: legacyProfile.id,
        clubId: SPORTING_CAT_CLUB_ID,
        status: 'approved',
        role: 'member',
        requestedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: 'legacy_linking',
        notes: 'Account collegato automaticamente a profilo esistente',
        isLegacyMember: true,
        linkedAt: new Date().toISOString(),
      };

      batch.set(affiliationRef, affiliationData);
    }

    // 3. Commit delle modifiche
    await batch.commit();

    console.log('   ✅ Account collegato con successo');

    return {
      success: true,
      linkedProfileId: legacyProfile.id,
      profileData: { ...legacyProfile, ...profileUpdates },
    };
  } catch (error) {
    console.error('❌ Errore collegamento account:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Gestisce automaticamente il collegamento durante la registrazione
 */
export async function handleAccountLinkingOnRegistration(firebaseUser) {
  console.log(`🎯 Gestendo collegamento automatico per nuovo utente: ${firebaseUser.email}`);

  try {
    // Cerca profili corrispondenti
    const matches = await findMatchingLegacyProfile(firebaseUser.email, firebaseUser.displayName);

    if (matches.length === 0) {
      console.log('   ℹ️  Nessun profilo esistente trovato - creazione nuovo profilo');
      return { linked: false, reason: 'no_matching_profile' };
    }

    const bestMatch = matches[0];

    // Collegamento automatico solo per match perfetti (email)
    if (bestMatch.type === 'email_exact') {
      console.log('   🎯 Match perfetto trovato - collegamento automatico');
      const result = await linkNewAccountToLegacyProfile(firebaseUser, bestMatch.profile);

      if (result.success) {
        return {
          linked: true,
          automatic: true,
          profile: result.profileData,
          matchType: 'email_exact',
        };
      }
    }

    // Per match basati su nome, richiedi conferma manuale
    if (bestMatch.confidence > 80) {
      console.log('   ⚠️  Match probabile trovato - richiede conferma manuale');
      return {
        linked: false,
        requiresManualConfirmation: true,
        suggestedMatches: matches.slice(0, 3), // Primi 3 match
        reason: 'requires_confirmation',
      };
    }

    console.log('   ℹ️  Nessun match sufficientemente sicuro');
    return { linked: false, reason: 'low_confidence_matches' };
  } catch (error) {
    console.error('❌ Errore gestione collegamento:', error);
    return { linked: false, error: error.message };
  }
}

/**
 * Lista tutti i profili legacy non ancora collegati
 */
export async function listUnlinkedLegacyProfiles() {
  try {
    const profilesQuery = query(
      collection(db, 'profiles'),
      where('isLegacyMember', '==', true),
      where('accountLinked', '!=', true)
    );

    const snapshot = await getDocs(profilesQuery);
    const unlinkedProfiles = [];

    snapshot.forEach((doc) => {
      unlinkedProfiles.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return unlinkedProfiles;
  } catch (error) {
    console.error('❌ Errore recupero profili non collegati:', error);
    return [];
  }
}

/**
 * Collegamento manuale confermato dall'admin
 */
export async function confirmManualLinking(firebaseUid, legacyProfileId) {
  try {
    // Recupera i dati dell'utente Firebase e del profilo legacy
    const profileDoc = await getDoc(doc(db, 'profiles', legacyProfileId));

    if (!profileDoc.exists()) {
      throw new Error('Profilo legacy non trovato');
    }

    const legacyProfile = { id: profileDoc.id, ...profileDoc.data() };

    // Simula l'oggetto firebaseUser per la funzione di linking
    const mockFirebaseUser = {
      uid: firebaseUid,
      email: 'admin-confirmed@link.local',
      displayName: 'Admin Confirmed Link',
      providerData: [{ providerId: 'manual' }],
    };

    const result = await linkNewAccountToLegacyProfile(mockFirebaseUser, legacyProfile);

    return result;
  } catch (error) {
    console.error('❌ Errore collegamento manuale:', error);
    return { success: false, error: error.message };
  }
}

export default {
  findMatchingLegacyProfile,
  linkNewAccountToLegacyProfile,
  handleAccountLinkingOnRegistration,
  listUnlinkedLegacyProfiles,
  confirmManualLinking,
};
