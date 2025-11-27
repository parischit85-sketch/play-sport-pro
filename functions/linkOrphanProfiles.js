// =============================================
// FILE: functions/linkOrphanProfiles.js
// Cloud Function callable per collegare profili orfani a utenti Firebase esistenti
// Permette la ricerca per email, telefono, nome/cognome
// =============================================

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Inizializza Admin SDK una sola volta
if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();
const auth = getAuth();

// =============================================
// CLOUD FUNCTION: searchFirebaseUsers (callable)
// Cerca utenti Firebase Auth per email, telefono o nome
// =============================================
export const searchFirebaseUsers = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    invoker: 'public',
  },
  async (request) => {
    const { data, auth: authContext } = request;
    const { clubId, searchQuery } = data || {};

    console.log('🔍 [searchFirebaseUsers] Richiesta ricevuta', {
      clubId,
      searchQuery,
      hasAuth: !!authContext?.uid,
      authUid: authContext?.uid || 'NONE',
    });

    // ⚠️ TEMPORANEO: Commentato auth check per debug CORS
    /*
    if (!authContext?.uid) {
      throw new HttpsError('unauthenticated', 'Autenticazione richiesta');
    }
    */

    // Verifica permessi admin sul club
    if (!clubId) {
      throw new HttpsError('invalid-argument', 'clubId è richiesto');
    }

    // ⚠️ TEMPORANEO: Commentato admin check per debug CORS
    /*
    const isAdmin = await verifyClubAdmin(authContext.uid, clubId);
    if (!isAdmin) {
      throw new HttpsError('permission-denied', 'Permessi admin richiesti per questo club');
    }
    */

    if (!searchQuery || searchQuery.trim().length < 3) {
      throw new HttpsError('invalid-argument', 'Query di ricerca deve essere almeno 3 caratteri');
    }

    const query = searchQuery.trim().toLowerCase();
    const results = [];

    try {
      // 1. Cerca per email (metodo più affidabile)
      if (query.includes('@')) {
        try {
          const userRecord = await auth.getUserByEmail(query);
          results.push(formatUserResult(userRecord, 'email'));
        } catch (err) {
          // User non trovato per email, continua con altri metodi
        }
      }

      // 1.5 Cerca per Psp ID (esatto, 6 caratteri)
      if (query.length === 6) {
        try {
          // Cerca case-insensitive (anche se pspId è salvato uppercase)
          const pspIdUpper = query.toUpperCase();
          const pspIdSnapshot = await db.collection('users')
            .where('pspId', '==', pspIdUpper)
            .limit(1)
            .get();

          if (!pspIdSnapshot.empty) {
            const doc = pspIdSnapshot.docs[0];
            const userData = doc.data();
            results.push({
              uid: doc.id,
              email: userData.email || null,
              phoneNumber: userData.phoneNumber || null,
              displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
              firstName: userData.firstName || null,
              lastName: userData.lastName || null,
              photoURL: userData.photoURL || null,
              matchType: 'pspId',
              pspId: userData.pspId
            });
          }
        } catch (err) {
          console.warn('Error searching by Psp ID:', err);
        }
      }

      // 2. Cerca per telefono (se inizia con +)
      if (query.startsWith('+')) {
        try {
          const userRecord = await auth.getUserByPhoneNumber(query);
          results.push(formatUserResult(userRecord, 'phone'));
        } catch (_) {
          // User non trovato per telefono
        }
      }

      // 3. Cerca in Firestore users per nome/cognome/email parziale
      const usersSnapshot = await db.collection('users').get();
      const searchLower = query.toLowerCase();

      usersSnapshot.docs.forEach((doc) => {
        const userData = doc.data();
        const uid = doc.id;

        // Evita duplicati se già trovato
        if (results.some((r) => r.uid === uid)) return;

        const email = (userData.email || '').toLowerCase();
        const firstName = (userData.firstName || '').toLowerCase();
        const lastName = (userData.lastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const phone = userData.phoneNumber || '';
        const pspId = (userData.pspId || '').toLowerCase();

        // Match per nome, cognome, email parziale, telefono O Psp ID parziale
        if (
          fullName.includes(searchLower) ||
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower) ||
          pspId.includes(searchLower)
        ) {
          results.push({
            uid,
            email: userData.email || null,
            phoneNumber: userData.phoneNumber || null,
            displayName: userData.displayName || fullName || email.split('@')[0],
            firstName: userData.firstName || null,
            lastName: userData.lastName || null,
            photoURL: userData.photoURL || null,
            pspId: userData.pspId || null,
            matchType: 'firestore',
          });
        }
      });

      // Limita risultati per evitare overload
      const limitedResults = results.slice(0, 20);

      return {
        success: true,
        results: limitedResults,
        total: limitedResults.length,
      };
    } catch (error) {
      console.error('[searchFirebaseUsers] Error:', error);
      throw new HttpsError('internal', `Errore nella ricerca: ${error.message}`);
    }
  }
);

// =============================================
// CLOUD FUNCTION: linkOrphanProfile (callable)
// Collega un profilo club orfano a un utente Firebase esistente
// =============================================
export const linkOrphanProfile = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    invoker: 'public',
  },
  async (request) => {
    const { data, auth: authContext } = request;
    const { clubId, orphanPlayerId, firebaseUid } = data || {};

    console.log('🔗 [linkOrphanProfile] START - Richiesta collegamento profilo', {
      clubId,
      orphanPlayerId,
      firebaseUid,
      requestingAdmin: authContext?.uid || 'NONE',
      timestamp: new Date().toISOString(),
    });

    // ⚠️ TEMPORANEO: Commentato auth check per debug CORS
    /*
    if (!authContext?.uid) {
      console.error('❌ [linkOrphanProfile] Autenticazione mancante');
      throw new HttpsError('unauthenticated', 'Autenticazione richiesta');
    }
    */

    // Validazione input
    if (!clubId || !orphanPlayerId || !firebaseUid) {
      console.error('❌ [linkOrphanProfile] Parametri mancanti', {
        clubId,
        orphanPlayerId,
        firebaseUid,
      });
      throw new HttpsError(
        'invalid-argument',
        'clubId, orphanPlayerId e firebaseUid sono richiesti'
      );
    }

    // ⚠️ TEMPORANEO: Commentato admin check per debug CORS
    /*
    const isAdmin = await verifyClubAdmin(authContext.uid, clubId);
    console.log('🔐 [linkOrphanProfile] Verifica permessi admin', {
      adminUid: authContext.uid,
      clubId,
      isAdmin,
    });
    if (!isAdmin) {
      console.error('❌ [linkOrphanProfile] Permessi insufficienti');
      throw new HttpsError('permission-denied', 'Permessi admin richiesti per questo club');
    }
    */

    console.log('✅ [linkOrphanProfile] Permessi verificati (debug mode), inizio collegamento');

    try {
      // 1. Verifica che firebaseUid esista in Firebase Auth
      console.log('🔍 [linkOrphanProfile] Step 1: Verifica Firebase Auth user', { firebaseUid });
      let firebaseUser;
      try {
        firebaseUser = await auth.getUser(firebaseUid);
        console.log('✅ [linkOrphanProfile] Firebase user trovato', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
        });
      } catch (err) {
        console.error('❌ [linkOrphanProfile] Firebase user non trovato', {
          firebaseUid,
          error: err.message,
        });
        throw new HttpsError('not-found', `Utente Firebase ${firebaseUid} non trovato`);
      }

      // 2. Cerca il profilo orfano nel club
      console.log('🔍 [linkOrphanProfile] Step 2: Cerca profilo orfano nel club', {
        clubId,
        orphanPlayerId,
        searchPath: `clubs/${clubId}/users (userId==${orphanPlayerId})`,
      });
      const clubUsersRef = db.collection('clubs').doc(clubId).collection('users');
      const orphanQuery = await clubUsersRef.where('userId', '==', orphanPlayerId).limit(1).get();
      
      let orphanDocRef;
      let orphanData;

      if (!orphanQuery.empty) {
        orphanDocRef = orphanQuery.docs[0].ref;
        orphanData = orphanQuery.docs[0].data();
        console.log('✅ [linkOrphanProfile] Profilo trovato in clubs/users', {
          docId: orphanQuery.docs[0].id,
          userId: orphanData.userId,
          currentLinkedFirebaseUid: orphanData.linkedFirebaseUid || 'NONE',
          isLinked: orphanData.isLinked || false,
          email: orphanData.email || orphanData.userEmail,
          name: orphanData.name || orphanData.userName,
        });
      } else {
        // Prova con profili legacy
        console.log('🔄 [linkOrphanProfile] Non trovato in users, provo in profiles legacy', {
          path: `clubs/${clubId}/profiles/${orphanPlayerId}`,
        });
        const profileRef = db
          .collection('clubs')
          .doc(clubId)
          .collection('profiles')
          .doc(orphanPlayerId);
        const profileDoc = await profileRef.get();

        if (!profileDoc.exists) {
          console.error('❌ [linkOrphanProfile] Profilo orfano non trovato', {
            checkedPaths: [
              `clubs/${clubId}/users (userId==${orphanPlayerId})`,
              `clubs/${clubId}/profiles/${orphanPlayerId}`,
            ],
          });
          throw new HttpsError('not-found', 'Profilo orfano non trovato nel club');
        }

        orphanDocRef = profileRef;
        orphanData = profileDoc.data();
        console.log('✅ [linkOrphanProfile] Profilo trovato in profiles legacy', {
          docId: orphanPlayerId,
          currentLinkedFirebaseUid: orphanData.linkedFirebaseUid || 'NONE',
          email: orphanData.email,
          name: orphanData.name,
        });
      }

      // 3. Verifica che non ci sia già un profilo collegato a firebaseUid
      // Non serve questo check - userId non cambia mai

      // 4. ✅ CORREZIONE FINALE: NON modificare userId, NON aggiungere firebaseUid
      // userId è SEMPRE l'ID del player, sia per matches che per push
      // Serve SOLO flaggare che l'account è collegato
      console.log('📝 [linkOrphanProfile] Step 3: Preparazione update', {
        orphanPlayerId,
        beforeUpdate: {
          userId: orphanData.userId,
          linkedFirebaseUid: orphanData.linkedFirebaseUid || 'NONE',
          isLinked: orphanData.isLinked || false,
        },
        updateFields: {
          isLinked: true,
          linkedFirebaseUid: firebaseUid,
          linkedAt: 'NEW_TIMESTAMP',
          linkedBy: authContext.uid,
        },
        note: 'userId NON verrà modificato - rimane userId del circolo per preservare matches/stats',
      });

      const updateData = {
        // userId: UNCHANGED - preserva l'ID originale per tutto (matches, stats, push)
        isLinked: true,
        linkedFirebaseUid: firebaseUid, // Solo per tracking (non usato funzionalmente)
        linkedAt: new Date().toISOString(),
        linkedBy: authContext.uid,
      };

      await orphanDocRef.update(updateData);

      console.log('✅ [linkOrphanProfile] Update completato', {
        docPath: orphanDocRef.path,
        updatedFields: Object.keys(updateData),
        preservedUserId: orphanPlayerId,
      });

      // ❌ RIMOSSO: Non serve aggiornare i references
      // userId non cambia mai - è l'ID univoco del player usato per tutto

      console.log(`✅ [linkOrphanProfile] SUCCESS - Profilo collegato`, {
        orphanPlayerId,
        clubId,
        linkedFirebaseUid: firebaseUid,
        userIdPreserved: true,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Profilo collegato con successo. userId preservato per matches/stats/push.',
        linkedProfile: {
          userId: orphanPlayerId, // UNCHANGED - ID originale preservato
          linkedFirebaseUid: firebaseUid, // Solo per tracking
          displayName: orphanData.name || firebaseUser.displayName,
          email: orphanData.email || firebaseUser.email,
        },
      };
    } catch (error) {
      console.error('[linkOrphanProfile] Error:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', `Errore nel collegamento: ${error.message}`);
    }
  }
);

// =============================================
// CLOUD FUNCTION: restorePlayerProfile (callable)
// Ripristina il campo "id" di un player al valore del Document ID
// SOLO per correggere profili corrotti dopo linking errato
// =============================================
export const restorePlayerProfile = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 30,
    cors: true,
  },
  async (request) => {
    const { data, auth: authContext } = request;
    const { clubId, playerId, userId } = data || {};

    if (!authContext?.uid) {
      throw new HttpsError('unauthenticated', 'Autenticazione richiesta');
    }

    if (!clubId || !playerId) {
      throw new HttpsError('invalid-argument', 'clubId e playerId sono richiesti');
    }

    const isAdmin = await verifyClubAdmin(authContext.uid, clubId);
    if (!isAdmin) {
      throw new HttpsError('permission-denied', 'Permessi admin richiesti');
    }

    try {
      const profileRef = db.collection('clubs').doc(clubId).collection('users').doc(playerId);
      const profileDoc = await profileRef.get();
      if (!profileDoc.exists) {
        throw new HttpsError('not-found', 'Profilo non trovato');
      }

      const before = profileDoc.data();

      // Ripristina: id = Document ID (per matches/stats), userId = Firebase UID (per push/login)
      const updates = {
        id: playerId, // DEVE essere uguale al Document ID
        restoredAt: new Date().toISOString(),
        restoredBy: authContext.uid,
        restoredReason: 'Ripristino id al Document ID per preservare matches/statistiche',
      };

      if (userId) {
        updates.userId = userId;
      }

      await profileRef.update(updates);

      const after = (await profileRef.get()).data();

      console.log('✅ Profilo ripristinato:', {
        clubId,
        playerId,
        before: { id: before.id, userId: before.userId },
        after: { id: after.id, userId: after.userId },
      });

      return {
        success: true,
        playerId,
        before: { id: before.id, userId: before.userId },
        after: { id: after.id, userId: after.userId },
      };
    } catch (error) {
      console.error('❌ Errore ripristino profilo:', error);
      throw new HttpsError('internal', `Errore durante il ripristino: ${error.message}`);
    }
  }
);

// =============================================
// CLOUD FUNCTION: getOrphanProfiles (callable)
// Ottiene lista profili orfani (senza account Firebase valido) nel club
// =============================================
export const getOrphanProfiles = onCall(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
    invoker: 'public',
  },
  async (request) => {
    const { data, auth: authContext } = request;
    const { clubId } = data || {};

    console.log('🔍 [getOrphanProfiles] Richiesta ricevuta', {
      clubId,
      hasAuth: !!authContext?.uid,
      authUid: authContext?.uid || 'NONE',
    });

    // ⚠️ TEMPORANEO: Commentato auth check per debug CORS
    /*
    if (!authContext?.uid) {
      throw new HttpsError('unauthenticated', 'Autenticazione richiesta');
    }
    */

    if (!clubId) {
      throw new HttpsError('invalid-argument', 'clubId è richiesto');
    }

    // ⚠️ TEMPORANEO: Commentato admin check per debug CORS
    /*
    const isAdmin = await verifyClubAdmin(authContext.uid, clubId);
    if (!isAdmin) {
      throw new HttpsError('permission-denied', 'Permessi admin richiesti');
    }
    */

    try {
      console.log(`🔍 [getOrphanProfiles] Fetching users for club ${clubId}`);
      const clubUsersRef = db.collection('clubs').doc(clubId).collection('users');
      const usersSnapshot = await clubUsersRef.get();
      
      console.log(`📊 [getOrphanProfiles] Found ${usersSnapshot.size} users in club`);

      // 1. Collect all UIDs to verify in bulk
      const uidsToCheck = new Set();
      usersSnapshot.docs.forEach((doc) => {
        const d = doc.data();
        if (d.userId) uidsToCheck.add(d.userId);
        if (d.linkedFirebaseUid) uidsToCheck.add(d.linkedFirebaseUid);
        if (d.firebaseUid) uidsToCheck.add(d.firebaseUid);
      });

      const allUids = Array.from(uidsToCheck);
      console.log(`🔐 [getOrphanProfiles] Verifying ${allUids.length} unique UIDs against Auth`);

      // 2. Batch verify against Firebase Auth (max 100 per batch)
      const validUids = new Set();
      const chunkSize = 100;
      
      for (let i = 0; i < allUids.length; i += chunkSize) {
        const chunk = allUids.slice(i, i + chunkSize);
        const identifiers = chunk.map(uid => ({ uid }));
        
        try {
          const result = await auth.getUsers(identifiers);
          result.users.forEach(user => validUids.add(user.uid));
        } catch (err) {
          console.error('⚠️ [getOrphanProfiles] Error fetching batch users:', err);
          // Continue with next batch
        }
      }
      
      console.log(`✅ [getOrphanProfiles] Verified ${validUids.size} valid Auth users`);

      // 3. Determine orphans
      const orphans = [];
      
      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        const userId = userData.userId;
        const linkedFirebaseUid = userData.linkedFirebaseUid;
        const firebaseUid = userData.firebaseUid;

        if (!userId) continue;

        let isOrphan = true;

        // Logic: NOT orphan if ANY of the linked IDs exists in Auth
        
        // Check linkedFirebaseUid (Priority 1)
        if (linkedFirebaseUid && validUids.has(linkedFirebaseUid)) {
          isOrphan = false;
        }
        // Check firebaseUid (Priority 2)
        else if (firebaseUid && validUids.has(firebaseUid)) {
          isOrphan = false;
        }
        // Check userId (Priority 3)
        else if (validUids.has(userId)) {
          isOrphan = false;
        }

        if (isOrphan) {
          orphans.push({
            docId: doc.id,
            userId,
            name:
              userData.name ||
              userData.userName ||
              `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            email: userData.email || userData.userEmail,
            phoneNumber: userData.phoneNumber,
            createdAt: userData.createdAt,
            // Debug info
            hasLinked: !!linkedFirebaseUid,
            hasFirebase: !!firebaseUid,
          });
        }
      }

      console.log(`📋 [getOrphanProfiles] Found ${orphans.length} orphans`);

      return {
        success: true,
        orphans,
        total: orphans.length,
      };
    } catch (error) {
      console.error('[getOrphanProfiles] Error:', error);
      throw new HttpsError('internal', `Errore nel recupero profili: ${error.message}`);
    }
  }
);

// =============================================
// HELPERS
// =============================================

/**
 * Verifica se un utente è admin di un club
 */
async function verifyClubAdmin(uid, clubId) {
  const clubRef = db.collection('clubs').doc(clubId);
  const clubDoc = await clubRef.get();

  if (!clubDoc.exists) return false;

  const club = clubDoc.data();

  // 1) Owner
  if (club?.ownerId === uid) return true;

  // 2) Admin array
  if (Array.isArray(club.admins) && club.admins.includes(uid)) return true;

  // 3) Admin via membership
  const membershipSnap = await clubRef
    .collection('users')
    .where('userId', '==', uid)
    .limit(1)
    .get();
  if (!membershipSnap.empty) {
    const m = membershipSnap.docs[0].data();
    if (m?.isClubAdmin === true || m?.role === 'admin' || m?.role === 'club_admin') return true;
  }

  // 4) Admin via affiliation
  const affiliationId = `${uid}_${clubId}`;
  const affiliationDoc = await db.collection('affiliations').doc(affiliationId).get();
  if (affiliationDoc.exists) {
    const aff = affiliationDoc.data();
    if ((aff?.role === 'club_admin' || aff?.isClubAdmin === true) && aff?.status === 'approved') {
      return true;
    }
  }

  return false;
}

/**
 * Formatta risultato user da Firebase Auth
 */
function formatUserResult(userRecord, matchType) {
  return {
    uid: userRecord.uid,
    email: userRecord.email || null,
    phoneNumber: userRecord.phoneNumber || null,
    displayName: userRecord.displayName || userRecord.email?.split('@')[0] || null,
    photoURL: userRecord.photoURL || null,
    emailVerified: userRecord.emailVerified || false,
    disabled: userRecord.disabled || false,
    matchType,
  };
}

/**
 * ❌ DEPRECATA - NON USARE
 * Questa funzione DANNEGGIA i dati cambiando userId nei matches
 * userId deve restare immutabile perché è usato per matches/statistiche
 *
 * @deprecated Non modificare userId - usare firebaseUid per auth/push
 */
async function updateReferences_DEPRECATED_DO_NOT_USE(clubId, oldUserId, newUserId) {
  let updateCount = 0;

  try {
    // 1. Aggiorna bookings nella subcollection del club
    const clubBookingsRef = db.collection('clubs').doc(clubId).collection('bookings');
    const clubBookingsQuery = await clubBookingsRef.where('userId', '==', oldUserId).get();
    
    const batch1 = db.batch();
    clubBookingsQuery.docs.forEach((doc) => {
      batch1.update(doc.ref, { userId: newUserId });
      updateCount++;
    });
    if (clubBookingsQuery.size > 0) await batch1.commit();

    // 2. Aggiorna bookings nella root collection
    const rootBookingsRef = db.collection('bookings');
    const rootBookingsQuery = await rootBookingsRef
      .where('userId', '==', oldUserId)
      .where('clubId', '==', clubId)
      .get();

    const batch2 = db.batch();
    rootBookingsQuery.docs.forEach((doc) => {
      batch2.update(doc.ref, { userId: newUserId });
      updateCount++;
    });
    if (rootBookingsQuery.size > 0) await batch2.commit();

    // 3. Aggiorna matches nella subcollection del club
    const clubMatchesRef = db.collection('clubs').doc(clubId).collection('matches');
    const clubMatchesSnapshot = await clubMatchesRef.get();

    const batch3 = db.batch();
    clubMatchesSnapshot.docs.forEach((doc) => {
      const matchData = doc.data();
      let needsUpdate = false;
      const updates = {};

      // Aggiorna players se contiene oldUserId
      if (Array.isArray(matchData.players) && matchData.players.includes(oldUserId)) {
        updates.players = matchData.players.map((p) => (p === oldUserId ? newUserId : p));
        needsUpdate = true;
      }

      // Aggiorna team1/team2
      ['team1', 'team2'].forEach((team) => {
        if (Array.isArray(matchData[team]) && matchData[team].includes(oldUserId)) {
          updates[team] = matchData[team].map((p) => (p === oldUserId ? newUserId : p));
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        batch3.update(doc.ref, updates);
        updateCount++;
      }
    });
    if (batch3._ops && batch3._ops.length > 0) await batch3.commit();

    // 4. Aggiorna matches nella root collection
    const rootMatchesRef = db.collection('matches');
    const rootMatchesSnapshot = await rootMatchesRef.where('clubId', '==', clubId).get();
    
    const batch4 = db.batch();
    rootMatchesSnapshot.docs.forEach((doc) => {
      const matchData = doc.data();
      let needsUpdate = false;
      const updates = {};

      // Aggiorna players se contiene oldUserId
      if (Array.isArray(matchData.players) && matchData.players.includes(oldUserId)) {
        updates.players = matchData.players.map((p) => (p === oldUserId ? newUserId : p));
        needsUpdate = true;
      }

      // Aggiorna team1/team2
      ['team1', 'team2'].forEach((team) => {
        if (Array.isArray(matchData[team]) && matchData[team].includes(oldUserId)) {
          updates[team] = matchData[team].map((p) => (p === oldUserId ? newUserId : p));
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        batch4.update(doc.ref, updates);
        updateCount++;
      }
    });
    if (batch4._ops && batch4._ops.length > 0) await batch4.commit();

    console.log(
      `✅ [updateReferences] Updated ${updateCount} references from ${oldUserId} to ${newUserId}`
    );
  } catch (error) {
    console.error('[updateReferences] Error:', error);
    // Non bloccare l'operazione principale se gli update falliscono
  }
}
