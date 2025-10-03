// =============================================
// FILE: src/services/auth.jsx
// =============================================
import { auth, db } from "./firebase.js";
import { resetClubsCooldowns } from "./clubs.js";
import { trackFirebaseError, trackUserAction } from "../lib/sentry.js";
import { trackAuth } from "../lib/analytics.js";
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
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  limit as qLimit,
  setDoc,
} from "firebase/firestore";

// Costante per il club principale
const MAIN_CLUB_ID = 'sporting-cat';

// Cache variables (moved from old profiles system)
let _profilePermissionDeniedUntil = 0;
const _profileCache = new Map();

// Listener auth con gestione errori
export function onAuth(callback) {
  return onAuthStateChanged(
    auth,
    (user) => {
      try {
        // Debug log removed
        
        // Track successful auth state changes
        if (user) {
          trackUserAction('auth_state_changed', { 
            userId: user.uid, 
            emailVerified: user.emailVerified 
          });
        }
        
        callback(user);
      } catch (error) {
        console.error("onAuth callback error:", error);
        trackFirebaseError(error, 'onAuth_callback');
        callback(null); // fallback sicuro
      }
    },
    (error) => {
      console.error("Firebase Auth error:", error);
      trackFirebaseError(error, 'auth_state_listener');
      // In caso di errori di configurazione, passa null come utente
      callback(null);
    },
  );
}

// ---- Login con provider ----
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();

  // Aggiungi scopes per ottenere informazioni aggiuntive
  provider.addScope("email");
  provider.addScope("profile");

  // Forza la selezione dell'account
  provider.setCustomParameters({
    prompt: "select_account",
  });

  let result = null;
  try {
    trackUserAction('google_login_attempt');
    trackAuth.loginAttempt('google');
    
    // Prova sempre prima con popup per una migliore UX
    result = await signInWithPopup(auth, provider);
    
    trackUserAction('google_login_success', { 
      method: 'popup',
      userId: result?.user?.uid 
    });
    trackAuth.loginSuccess('google', result?.user?.uid);
  } catch (e) {
    const msg = String(e?.message || "").toLowerCase();
    const code = String(e?.code || "").toLowerCase();

    // Ignora errori CORS che non bloccano effettivamente il login
    if (
      msg.includes("cross-origin-opener-policy") ||
      msg.includes("window.closed")
    ) {
      // Non fare nulla, il login potrebbe essere comunque andato a buon fine
      return result;
    }

    // Track login errors
    trackFirebaseError(e, 'google_login_popup', { 
      errorCode: code, 
      errorMessage: msg 
    });
    trackAuth.loginFailed('google', code);

    // Usa redirect solo se ci sono problemi specifici di popup/CORS che bloccano
    const shouldRedirect =
      code.includes("auth/unauthorized-domain") ||
      code.includes("auth/operation-not-supported") ||
      code.includes("auth/popup-blocked") ||
      code.includes("auth/popup-closed-by-user") ||
      msg.includes("requests-from-referer") ||
      msg.includes("cross-origin") ||
      msg.includes("popup");

    if (shouldRedirect) {
      trackUserAction('google_login_fallback_redirect');
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
      const names = (user.displayName || "").split(" ");
      const profileData = {
        email: user.email,
        firstName: existingProfile.firstName || names[0] || "",
        lastName: existingProfile.lastName || names.slice(1).join(" ") || "",
        phone: existingProfile.phone || "",
        avatar: user.photoURL || "",
        provider: "google",
        ...existingProfile, // mantieni i dati esistenti
      };

      await saveUserProfile(user.uid, profileData);
    }
  } catch (error) {
    console.warn("Errore creazione/aggiornamento profilo:", error);
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
    console.warn("Errore completamento redirect:", e);
    return null;
  }
}

export async function loginWithFacebook() {
  const provider = new FacebookAuthProvider();

  // Aggiungi permessi per ottenere email e profilo
  provider.addScope("email");
  provider.addScope("public_profile");

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
      localStorage.setItem("ml-magic-email", email);
    } catch {}
  } catch (e) {
    // Fornisce un messaggio più chiaro quando il metodo non è abilitato in Firebase Console
    if (e && e.code === "auth/operation-not-allowed") {
      throw new Error(
        'Accesso via email non abilitato. Abilita "Email link (passwordless)" in Firebase → Authentication → Sign-in method → Email/Password,' +
          " e aggiungi il dominio (es. localhost:5173) in Authentication → Settings → Authorized domains.",
      );
    }
    throw e;
  }
}

// ---- Email & Password ----
export async function registerWithEmailPassword(email, password) {
  if (!email || !password)
    throw new Error("Email e password sono obbligatorie");
  const res = await createUserWithEmailAndPassword(auth, email, password);
  // crea profilo base se non esiste
  if (res.user) {
    const existingProfile = await getUserProfile(res.user.uid);
    if (!existingProfile.email) {
      await saveUserProfile(res.user.uid, {
        email: res.user.email,
        firstName: "",
        lastName: "",
        phone: "",
        provider: "password",
        ...existingProfile,
      });
    }
  }
  return res;
}

export async function loginWithEmailPassword(email, password) {
  if (!email || !password)
    throw new Error("Email e password sono obbligatorie");
  
  // Special admin login bypass
  if (email === 'parisadmin25@playsport.admin' && password === 'AdminParisPass25') {
    console.log("🔑 Admin login detected - activating admin session");
    
    trackUserAction('admin_login_attempt', { email });
    trackAuth.loginAttempt('admin');
    
    // Create mock admin user
    const adminUser = {
      uid: 'admin-paris-25',
      email: 'parisadmin25@playsport.admin',
      displayName: 'Paris Admin',
      isSpecialAdmin: true
    };
    
    // Store admin session in localStorage
    try {
      localStorage.setItem('admin-session', JSON.stringify(adminUser));
    } catch (e) {
      console.warn('Could not save admin session to localStorage:', e);
      trackError(e, { operation: 'admin_session_storage' });
    }
    
    console.log("✅ Admin session activated successfully");
    trackUserAction('admin_login_success');
    trackAuth.loginSuccess('admin', adminUser.uid);
    return adminUser;
  }
  
  // Normal Firebase login
  console.log("🔑 Attempting Firebase login for:", email);
  trackUserAction('email_login_attempt', { email });
  trackAuth.loginAttempt('email');
  
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Firebase login successful, user:", result.user ? {
      uid: result.user.uid,
      email: result.user.email,
      emailVerified: result.user.emailVerified
    } : "null");
    
    trackUserAction('email_login_success', { 
      userId: result.user?.uid,
      emailVerified: result.user?.emailVerified 
    });
    trackAuth.loginSuccess('email', result.user?.uid);
    
    return result;
  } catch (error) {
    trackFirebaseError(error, 'email_login', { email });
    trackAuth.loginFailed('email', error.code || 'unknown_error');
    throw error;
  }
}

export async function sendResetPassword(email) {
  if (!email) throw new Error("Email obbligatoria");
  return sendPasswordResetEmail(auth, email);
}

// Da chiamare all’avvio della pagina per completare l’accesso via link
export async function completeMagicLinkIfPresent() {
  try {
    const href = window.location.href;
    if (!isSignInWithEmailLink(auth, href)) return null;

    let email = null;
    try {
      email = localStorage.getItem("ml-magic-email");
    } catch {}
    if (!email) {
      email =
        window.prompt("Per completare l’accesso, inserisci la tua email:") ||
        "";
    }
    const res = await signInWithEmailLink(auth, email, href);
    try {
      localStorage.removeItem("ml-magic-email");
    } catch {}
    // pulizia URL
    window.history.replaceState({}, document.title, window.location.pathname);

    // Dopo il login via magic link, crea il profilo base se non esiste
    if (res.user) {
      const existingProfile = await getUserProfile(res.user.uid);

      if (!existingProfile.email) {
        const profileData = {
          email: res.user.email,
          firstName: "",
          lastName: "",
          phone: "",
          provider: "email",
          ...existingProfile, // mantieni i dati esistenti
        };

        await saveUserProfile(res.user.uid, profileData);
      }
    }

    return res;
  } catch (e) {
    console.warn("completeMagicLinkIfPresent error:", e);
    throw e;
  }
}

// Logout
export async function logout() {
  console.log("🚪 Starting logout process...");
  
  // Clear admin session if present
  try {
    localStorage.removeItem('admin-session');
    localStorage.removeItem('adminSession');
    localStorage.removeItem('psp:v1:selectedClubId');
    localStorage.removeItem('selectedClubId');
    // Clear all club-related localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('psp:v1:')) {
        localStorage.removeItem(key);
      }
    });
    console.log("✅ localStorage cleared");
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }
  
  // Reset cooldowns
  _profilePermissionDeniedUntil = 0;
  _profileCache.clear();
  
  // Reset clubs cooldowns
  resetClubsCooldowns();
  console.log("✅ Cooldowns reset");
  
  console.log("🔥 Calling Firebase signOut...");
  await signOut(auth);
  console.log("✅ Firebase signOut completed");
}

// ====== PROFILO UTENTE (MIGRATED: users/{uid}) ======
// Migrato per utilizzare il nuovo servizio users unificato
import { getUser, createUserIfNeeded, updateLastLogin } from './users.js';

// Simple in-memory cache + cooldown for user fetch to prevent repeated permission-denied spam
const _userCache = new Map(); // uid -> { data, ts }
let _userPermissionDeniedUntil = 0; // timestamp ms
const USER_COOLDOWN_MS = 60000; // 60s cooldown after permission denied

export async function getUserProfile(uid) {
  if (!uid) return {};
  const now = Date.now();
  if (now < _userPermissionDeniedUntil) {
    const cached = _userCache.get(uid);
    return cached?.data || {};
  }
  // Return cached if fresh (<30s)
  const cached = _userCache.get(uid);
  if (cached && (now - cached.ts < 30000)) {
    return cached.data;
  }
  try {
    // Use new users service instead of profiles
    const user = await getUser(uid);
    const data = user || {};
    _userCache.set(uid, { data, ts: now });
    
    // If user found, update last login (fire and forget)
    if (user) {
      updateLastLogin(uid).catch(console.warn);
    }
    
    return data;
  } catch (err) {
    const msg = String(err?.message || "");
    if (msg.includes('Missing or insufficient permissions')) {
      if (now > _userPermissionDeniedUntil) {
        console.warn('[getUserProfile] permission denied per uid:', uid, '– probabilmente utente non esistente. Attivo cooldown 60s.');
      }
      _userPermissionDeniedUntil = Date.now() + USER_COOLDOWN_MS;
      // Cache empty profile to prevent repeated requests
      const emptyProfile = {};
      _userCache.set(uid, { data: emptyProfile, ts: now });
      return emptyProfile;
    }
    console.error('Error getUserProfile:', err);
    return cached?.data || {};
  }
}

export async function saveUserProfile(uid, data) {
  // Use new users service - handle both create and update
  const { getUser, createUser, updateUser } = await import('./users.js');
  
  try {
    // Check if user exists first
    const existingUser = await getUser(uid);
    
    if (existingUser) {
      // User exists - update it
      const updatedUser = await updateUser(uid, data);
      _userCache.delete(uid); // Invalidate cache
      return updatedUser;
    } else {
      // User doesn't exist - create it
      const newUser = await createUser(uid, data);
      _userCache.delete(uid); // Invalidate cache
      return newUser;
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
    // Invalidate cache anyway
    _userCache.delete(uid);
    throw error;
  }
}

export async function createUserProfileIfNeeded(firebaseUser) {
  if (!firebaseUser) return null;
  
  try {
    // Use new users service to check if user exists
    const existingUser = await getUser(firebaseUser.uid);
    
    // Se l'utente esiste, restituiscilo
    if (existingUser) {
      return existingUser;
    }
    
    // Prova a collegare a un profilo esistente (legacy)
    try {
      const { handleAccountLinkingOnRegistration } = await import('../services/legacy-account-linking.js');
      const linkingResult = await handleAccountLinkingOnRegistration(firebaseUser);
      
      if (linkingResult.linked && linkingResult.profile) {
        console.log("🔗 Account collegato a profilo esistente:", linkingResult.profile.displayName);
        
        // Migrate linked profile to new users collection
        const migratedUser = await createUserIfNeeded(firebaseUser);
        return migratedUser;
      }
      
      if (linkingResult.requiresManualConfirmation) {
        console.log("⚠️ Trovati profili simili che richiedono conferma manuale");
        
        // Create user with pending suggestions
        const userData = {
          email: firebaseUser.email,
          firstName: firebaseUser.displayName?.split(' ')?.[0] || '',
          lastName: firebaseUser.displayName?.split(' ')?.[1] || '',
          needsCompletion: true,
          pendingLinkingSuggestions: linkingResult.suggestedMatches
        };
        
        const newUser = await createUserIfNeeded(firebaseUser);
        return { ...newUser, ...userData };
      }
    } catch (linkingError) {
      console.warn("Errore nel collegamento automatico:", linkingError);
      // Continua con la creazione normale dell'utente
    }
    
    // Create new user using new service
    console.log("👤 Creazione nuovo utente per:", firebaseUser.email);
    const newUser = await createUserIfNeeded(firebaseUser);
    return newUser;
    
  } catch (error) {
    console.warn("Errore nella creazione automatica del profilo:", error);
    // Restituisce un profilo di base anche in caso di errore
    return {
      email: firebaseUser.email,
      firstName: firebaseUser.displayName?.split(' ')?.[0] || '',
      lastName: firebaseUser.displayName?.split(' ')?.[1] || '',
      needsCompletion: true
    };
  }
}

export async function setDisplayName(user, name) {
  await updateProfile(user, { displayName: name });
}

// (opzionale) esponi auth se serve in UI
export { auth };

// ====== LISTA PROFILI (per collegamento giocatori) ======
export async function listAllUserProfiles(max = 500) {
  // Ritorna array di { uid, ...profile }
  const ref = collection(db, "clubs", MAIN_CLUB_ID, "profiles");
  const snap = await getDocs(query(ref, qLimit(max)));
  const out = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data() || {};
    out.push({ uid: docSnap.id, ...data });
  });
  return out;
}
