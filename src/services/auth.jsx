// =============================================
// FILE: src/services/auth.jsx
// =============================================
import { auth, db } from './firebase.js';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Listener auth con gestione errori
export function onAuth(callback) {
  return onAuthStateChanged(
    auth,
    (user) => {
      try {
        callback(user);
      } catch (error) {
        console.error('onAuth callback error:', error);
        callback(null); // fallback sicuro
      }
    },
    (error) => {
      console.error('Firebase Auth error:', error);
      // In caso di errori di configurazione, passa null come utente
      callback(null);
    }
  );
}

// ---- Login con provider ----
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();

  // Aggiungi scopes per ottenere informazioni aggiuntive
  provider.addScope('email');
  provider.addScope('profile');

  // Forza la selezione dell'account
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  let result = null;
  try {
    // Prova sempre prima con popup per una migliore UX
    result = await signInWithPopup(auth, provider);
  } catch (e) {
    const msg = String(e?.message || '').toLowerCase();
    const code = String(e?.code || '').toLowerCase();

    // Ignora errori CORS che non bloccano effettivamente il login
    if (msg.includes('cross-origin-opener-policy') || msg.includes('window.closed')) {
      // Non fare nulla, il login potrebbe essere comunque andato a buon fine
      return result;
    }

    // Usa redirect solo se ci sono problemi specifici di popup/CORS che bloccano
    const shouldRedirect =
      code.includes('auth/unauthorized-domain') ||
      code.includes('auth/operation-not-supported') ||
      code.includes('auth/popup-blocked') ||
      code.includes('auth/popup-closed-by-user') ||
      msg.includes('requests-from-referer') ||
      msg.includes('cross-origin') ||
      msg.includes('popup');

    if (shouldRedirect) {
      await signInWithRedirect(auth, provider);
      return null; // Il flusso continuerà al ritorno dalla redirect
    }

    // Se non è un problema di popup, rilancia l'errore
    throw e;
  }

  // Dopo il login, crea/aggiorna automaticamente il profilo base
  if (result && result.user) {
    await createOrUpdateUserProfile(result.user);
  }

  return result;
}

// Helper per creare/aggiornare profilo utente
async function createOrUpdateUserProfile(user) {
  try {
    const existingProfile = await getUserProfile(user.uid);

    // Se il profilo non esiste o mancano dati, crealo/aggiornalo
    if (!existingProfile.email || !existingProfile.firstName) {
      const names = (user.displayName || '').split(' ');
      const profileData = {
        email: user.email,
        firstName: existingProfile.firstName || names[0] || '',
        lastName: existingProfile.lastName || names.slice(1).join(' ') || '',
        phone: existingProfile.phone || '',
        avatar: user.photoURL || '',
        provider: 'google',
        ...existingProfile, // mantieni i dati esistenti
      };

      await saveUserProfile(user.uid, profileData);
    }
  } catch (error) {
    console.warn('Errore creazione/aggiornamento profilo:', error);
    // Non bloccare il login per errori di profilo
  }
}

// Da chiamare opzionalmente all'avvio per completare eventuali redirect OAuth
export async function completeProviderRedirectIfNeeded() {
  try {
    const res = await getRedirectResult(auth);
    if (res && res.user) {
      await createOrUpdateUserProfile(res.user);
    }
    return res || null;
  } catch (e) {
    console.warn('Errore completamento redirect:', e);
    return null;
  }
}

export async function loginWithFacebook() {
  const provider = new FacebookAuthProvider();

  // Aggiungi permessi per ottenere email e profilo
  provider.addScope('email');
  provider.addScope('public_profile');

  const result = await signInWithPopup(auth, provider);

  // Dopo il login, crea/aggiorna automaticamente il profilo base
  if (result && result.user) {
    await createOrUpdateUserProfile(result.user);
  }

  return result;
}

// ---- Magic link (email link) ----
const ACTION_CODE_SETTINGS = {
  url: `${window.location.origin}/`, // ritorna alla home dell’app
  handleCodeInApp: true,
};

export async function sendMagicLink(email) {
  try {
    await sendSignInLinkToEmail(auth, email, ACTION_CODE_SETTINGS);
    try {
      localStorage.setItem('ml-magic-email', email);
    } catch {}
  } catch (e) {
    // Fornisce un messaggio più chiaro quando il metodo non è abilitato in Firebase Console
    if (e && e.code === 'auth/operation-not-allowed') {
      throw new Error(
        'Accesso via email non abilitato. Abilita "Email link (passwordless)" in Firebase → Authentication → Sign-in method → Email/Password,' +
          ' e aggiungi il dominio (es. localhost:5173) in Authentication → Settings → Authorized domains.'
      );
    }
    throw e;
  }
}

// ---- Email & Password ----
export async function registerWithEmailPassword(email, password) {
  if (!email || !password) throw new Error('Email e password sono obbligatorie');
  const res = await createUserWithEmailAndPassword(auth, email, password);
  // crea profilo base se non esiste
  if (res.user) {
    const existingProfile = await getUserProfile(res.user.uid);
    if (!existingProfile.email) {
      await saveUserProfile(res.user.uid, {
        email: res.user.email,
        firstName: '',
        lastName: '',
        phone: '',
        provider: 'password',
        ...existingProfile,
      });
    }
  }
  return res;
}

export async function loginWithEmailPassword(email, password) {
  if (!email || !password) throw new Error('Email e password sono obbligatorie');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function sendResetPassword(email) {
  if (!email) throw new Error('Email obbligatoria');
  return sendPasswordResetEmail(auth, email);
}

// Da chiamare all’avvio della pagina per completare l’accesso via link
export async function completeMagicLinkIfPresent() {
  try {
    const href = window.location.href;
    if (!isSignInWithEmailLink(auth, href)) return null;

    let email = null;
    try {
      email = localStorage.getItem('ml-magic-email');
    } catch {}
    if (!email) {
      email = window.prompt('Per completare l’accesso, inserisci la tua email:') || '';
    }
    const res = await signInWithEmailLink(auth, email, href);
    try {
      localStorage.removeItem('ml-magic-email');
    } catch {}
    // pulizia URL
    window.history.replaceState({}, document.title, window.location.pathname);

    // Dopo il login via magic link, crea il profilo base se non esiste
    if (res.user) {
      const existingProfile = await getUserProfile(res.user.uid);

      if (!existingProfile.email) {
        const profileData = {
          email: res.user.email,
          firstName: '',
          lastName: '',
          phone: '',
          provider: 'email',
          ...existingProfile, // mantieni i dati esistenti
        };

        await saveUserProfile(res.user.uid, profileData);
      }
    }

    return res;
  } catch (e) {
    console.warn('completeMagicLinkIfPresent error:', e);
    throw e;
  }
}

// Logout
export async function logout() {
  await signOut(auth);
}

// ====== PROFILO UTENTE (Firestore: profiles/{uid}) ======
export async function getUserProfile(uid) {
  const ref = doc(db, 'profiles', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

export async function saveUserProfile(uid, data) {
  const ref = doc(db, 'profiles', uid);
  await setDoc(ref, { ...data, _updatedAt: Date.now() }, { merge: true });
}

export async function setDisplayName(user, name) {
  await updateProfile(user, { displayName: name });
}

// (opzionale) esponi auth se serve in UI
export { auth };
