// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Import CommonJS audit logger as default namespace
import auditPkg from './services/auditLogger.js';

const { auditLogger, EVENT_TYPES, SEVERITY } = auditPkg || {};

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

async function isAdmin(uid) {
  try {
    const snap = await db.collection('users').doc(uid).get();
    const data = snap.data() || {};
    return data.role === 'admin';
  } catch {
    return false;
  }
}

function resolveEventType({ action, targetType }) {
  if (targetType === 'club') {
    if (action === 'activate') return EVENT_TYPES?.CLUB_ACTIVATE || 'club.activate';
    if (action === 'deactivate') return EVENT_TYPES?.CLUB_DEACTIVATE || 'club.deactivate';
    if (action === 'update') return EVENT_TYPES?.CLUB_UPDATE || 'club.update';
    if (action === 'create') return EVENT_TYPES?.CLUB_CREATE || 'club.create';
    if (action === 'delete') return EVENT_TYPES?.CLUB_DELETE || 'club.delete';
  }
  return `${targetType || 'system'}.${action || 'update'}`;
}

export const logAdminAction = onCall(
  {
    region: 'us-central1',
    memory: '128MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const uid = request.auth.uid;
    const isUserAdmin = await isAdmin(uid);
    if (!isUserAdmin) {
      throw new HttpsError('permission-denied', 'Only admins can write audit logs');
    }

    const { action, targetType, targetId, clubId, reason, metadata } = request.data || {};
    if (!action || !targetType) {
      throw new HttpsError('invalid-argument', 'action and targetType are required');
    }

    try {
      const eventType = resolveEventType({ action, targetType });

      await auditLogger.log({
        eventType,
        severity: SEVERITY?.INFO || 'info',
        userId: uid,
        clubId: clubId || undefined,
        resource: targetType,
        resourceId: targetId || undefined,
        action,
        metadata: {
          reason: reason || undefined,
          ...(metadata && typeof metadata === 'object' ? metadata : {}),
        },
        message: `Admin ${uid} performed ${action} on ${targetType}${targetId ? ` (${targetId})` : ''}`,
      });

      return { ok: true };
    } catch (error) {
      // Non bloccare il flusso lato client: ritorna errore significativo
      console.error('[logAdminAction] Failed to write audit log', error);
      throw new HttpsError('internal', 'Failed to write audit log');
    }
  }
);
