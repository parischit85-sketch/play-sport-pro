import dotenv from 'dotenv';
dotenv.config();

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const auth = getAuth();

async function isAdmin(uid) {
  try {
    const snap = await db.collection('users').doc(uid).get();
    return (snap.data() || {}).role === 'admin';
  } catch {
    return false;
  }
}

const ALLOWED_ROLES = new Set(['admin', 'club_admin', 'instructor', 'user']);

export const setUserRole = onCall(
  {
    region: 'us-central1',
    memory: '128MiB',
    timeoutSeconds: 30,
    secrets: ['BOOTSTRAP_ADMIN_TOKEN'],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const callerUid = request.auth.uid;
    const { uid, role, bootstrapToken } = request.data || {};

    if (!uid || typeof uid !== 'string') {
      throw new HttpsError('invalid-argument', 'uid is required');
    }
    if (!role || !ALLOWED_ROLES.has(role)) {
      throw new HttpsError(
        'invalid-argument',
        'role must be one of: admin, club_admin, instructor, user'
      );
    }

    // Allow if caller is admin OR has a valid bootstrap token (for first admin setup)
    const callerIsAdmin = await isAdmin(callerUid);
    const hasBootstrap =
      !!bootstrapToken &&
      !!process.env.BOOTSTRAP_ADMIN_TOKEN &&
      bootstrapToken === process.env.BOOTSTRAP_ADMIN_TOKEN;

    if (!callerIsAdmin && !hasBootstrap) {
      throw new HttpsError('permission-denied', 'Only admins can assign roles');
    }

    try {
      // Update Firestore user role
      await db.collection('users').doc(uid).set({ role }, { merge: true });

      // Optionally set auth custom claims for faster checks (non-breaking if fails)
      try {
        await auth.setCustomUserClaims(uid, { role });
      } catch (e) {
        console.warn('[setUserRole] setCustomUserClaims failed:', e?.message || e);
      }

      return { ok: true, uid, role };
    } catch (error) {
      console.error('[setUserRole] Failed to set role:', error);
      throw new HttpsError('internal', 'Failed to set user role');
    }
  }
);
