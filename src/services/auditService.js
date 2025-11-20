// Tiny client wrapper for admin audit logging via callable Cloud Function
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase.js';

const IS_DEV = !!(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV);
const USE_EMULATOR =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
const DISABLE_AUDIT_CALLABLE =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.VITE_DISABLE_AUDIT_CALLABLE === 'true';

/**
 * Log a sensitive admin action via backend-only audit logger
 * @param {Object} payload
 * @param {string} payload.action - e.g. 'activate' | 'deactivate' | 'update'
 * @param {string} payload.targetType - e.g. 'club' | 'user' | 'booking'
 * @param {string=} payload.targetId - resource id
 * @param {string=} payload.clubId - optional club scope
 * @param {string=} payload.reason - human readable reason
 * @param {Object=} payload.metadata - extra context (safe, non-PII)
 */
export async function logAdminAction(payload) {
  try {
    // In sviluppo, se non usi l'emulatore e vuoi evitare rumore CORS prima del deploy, puoi disabilitare
    if (IS_DEV && !USE_EMULATOR && DISABLE_AUDIT_CALLABLE) {
      return false;
    }
    const callable = httpsCallable(functions, 'logAdminAction');
    await callable(payload);
    return true;
  } catch (err) {
    // Do not block UI flows on audit logging failures
    if (IS_DEV) {
      console.warn('[auditService] logAdminAction failed:', err?.message || err);
    }
    return false;
  }
}
