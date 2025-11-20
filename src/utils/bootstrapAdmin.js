// Dev helper: expose a function to make the current user admin (only with bootstrap token)
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '@services/firebase.js';

function notify(msg, type = 'info') {
  if (!import.meta?.env?.DEV) return;
  try {
    const colors = {
      success: { bg: '#10b981', border: '#059669' },
      warning: { bg: '#f59e0b', border: '#d97706' },
      error: { bg: '#ef4444', border: '#dc2626' },
      info: { bg: '#3b82f6', border: '#2563eb' },
    };
    const c = colors[type] || colors.info;
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:20px;right:20px;background:${c.bg};border:2px solid ${c.border};color:#fff;padding:10px 14px;border-radius:8px;z-index:10000;font:14px system-ui;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  } catch {
    // no-op
  }
}

export function installBootstrapAdminHelper() {
  if (!import.meta?.env?.DEV) return;
  try {
    const makeMeAdmin = async (role = 'admin', token = undefined) => {
      const user = auth?.currentUser;
      if (!user) {
        console.warn('[bootstrapAdmin] Nessun utente autenticato');
        notify('Effettua il login prima di usare makeMeAdmin', 'warning');
        return { ok: false, error: 'no-user' };
      }
      try {
        const callable = httpsCallable(functions, 'setUserRole');
        const res = await callable({ uid: user.uid, role, bootstrapToken: token || import.meta?.env?.VITE_BOOTSTRAP_ADMIN_TOKEN });
        notify(`Ruolo impostato: ${role}`, 'success');
        console.log('✅ [bootstrapAdmin] setUserRole:', res?.data);
        return res?.data || { ok: true };
      } catch (e) {
        console.error('❌ [bootstrapAdmin] setUserRole failed:', e);
        notify('Impossibile impostare il ruolo (vedi console)', 'error');
        return { ok: false, error: e?.message || 'failed' };
      }
    };

    // Attach to window
    window.makeMeAdmin = makeMeAdmin;
    console.log('💡 Dev utility loaded: window.makeMeAdmin(role = "admin", token?)');
  } catch (e) {
    console.warn('[bootstrapAdmin] install failed:', e?.message || e);
  }
}
