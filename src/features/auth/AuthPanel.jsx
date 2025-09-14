// =============================================
// FILE: src/features/auth/AuthPanel.jsx
// =============================================
import React, { useEffect, useState } from "react";
import Section from "@ui/Section.jsx";
import {
  loginWithGoogle,
  loginWithFacebook,
  sendMagicLink,
  completeMagicLinkIfPresent,
  logout,
  saveUserProfile,
  setDisplayName,
} from "@services/auth.jsx";

export default function AuthPanel({ T, user, userProfile, setUserProfile }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sending, setSending] = useState(false);
  const emailLinkEnabled =
    import.meta.env.VITE_AUTH_EMAIL_LINK_ENABLED === "true";
  // method: password | magic
  const [method, setMethod] = useState(emailLinkEnabled ? "magic" : "password");
  // action: login | register
  const [action, setAction] = useState("login");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    completeMagicLinkIfPresent().catch(() => {});
  }, []);

  useEffect(() => {
    if (user && userProfile) {
      const isComplete = userProfile.firstName && userProfile.phone;
      if (!isComplete) {
        setShowProfileForm(true);
        setProfileForm({
          firstName: userProfile.firstName || "",
          lastName: userProfile.lastName || "",
          phone: userProfile.phone || "",
        });
      }
    }
  }, [user, userProfile]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Il profilo verrà caricato automaticamente dall'App
      // L'app cambierà automaticamente tab grazie all'effetto in App.jsx
    } catch (e) {
      console.error("❌ Errore Google login:", e);
      let message = e?.message || String(e);

      // Messaggi più chiari per errori comuni
      if (e?.code === "auth/popup-closed-by-user") {
        message = "Popup chiuso. Riprova il login.";
      } else if (e?.code === "auth/unauthorized-domain") {
        message =
          "Dominio non autorizzato. Controlla la configurazione Firebase Console.";
      } else if (e?.code === "auth/operation-not-allowed") {
        message =
          "Login Google non abilitato. Controlla la configurazione Firebase Console.";
      } else if (e?.code === "auth/popup-blocked") {
        message =
          "Popup bloccato dal browser. Abilita i popup per questo sito.";
      }

      alert("Errore Google: " + message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook();
      // Il profilo verrà caricato automaticamente dall'App
    } catch (e) {
      alert("Errore Facebook: " + (e?.message || e));
    }
  };

  const handleSendMagicLink = async () => {
    try {
      setSending(true);
      await sendMagicLink(email.trim());
      alert(
        "Ti abbiamo inviato un link di accesso via email. Aprilo da questo dispositivo.",
      );
    } catch (e) {
      alert("Errore invio link: " + (e?.message || e));
    } finally {
      setSending(false);
    }
  };

  const handlePasswordAuth = async () => {
    try {
      setSending(true);
      // Validazioni base lato client
      if (action === "register") {
        if (password.length < 6) {
          alert("La password deve contenere almeno 6 caratteri.");
          return;
        }
        if (confirmPassword !== password) {
          alert("Le password non coincidono.");
          return;
        }
        // Registrazione
        console.log("🔐 Attempting registration for:", email.trim());
        const { registerWithEmailPassword } = await import(
          "@services/auth.jsx"
        );
        await registerWithEmailPassword(email.trim(), password);
        console.log("✅ Registration successful");
      } else {
        // Login
        console.log("🔐 Attempting login for:", email.trim());
        const { loginWithEmailPassword } = await import("@services/auth.jsx");
        await loginWithEmailPassword(email.trim(), password);
        console.log("✅ Login successful");
      }
      // L'app cambierà automaticamente tab grazie all'effetto in App.jsx
    } catch (e) {
      console.error("❌ Auth error:", e);
      let message = e?.message || String(e);

      // Provide more helpful error messages
      if (e?.code === "auth/user-not-found") {
        message = "Account non trovato. Prova a registrarti prima.";
      } else if (e?.code === "auth/wrong-password") {
        message = "Password non corretta.";
      } else if (e?.code === "auth/email-already-in-use") {
        message = "Email già in uso. Prova ad accedere invece di registrarti.";
      } else if (e?.code === "auth/weak-password") {
        message = "Password troppo debole. Usa almeno 6 caratteri.";
      } else if (e?.code === "auth/invalid-email") {
        message = "Formato email non valido.";
      } else if (e?.code === "auth/operation-not-allowed") {
        message =
          "Accesso con email/password non abilitato. Controlla la configurazione Firebase Console.";
      }

      alert("Errore accesso: " + message);
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const { sendResetPassword } = await import("@services/auth.jsx");
      await sendResetPassword(email.trim());
      alert("Email per il reset inviata (se l’account esiste).");
    } catch (e) {
      alert("Errore reset password: " + (e?.message || e));
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.firstName.trim()) {
      alert("Il nome è obbligatorio");
      return;
    }
    if (!profileForm.phone.trim()) {
      alert("Il numero di telefono è obbligatorio");
      return;
    }

    try {
      setSavingProfile(true);

      const updatedProfile = {
        ...userProfile,
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
        email: user.email,
      };

      await saveUserProfile(user.uid, updatedProfile);

      // Aggiorna il display name
      const displayName = [profileForm.firstName, profileForm.lastName]
        .filter(Boolean)
        .join(" ");
      if (displayName) {
        await setDisplayName(user, displayName);
      }

      setUserProfile(updatedProfile);
      setShowProfileForm(false);
    } catch (e) {
      alert("Errore salvataggio profilo: " + (e?.message || e));
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <Section title="Benvenuto in Sporting Cat" T={T}>
          <div className={`rounded-2xl ${T.cardBg} ${T.border} p-6 space-y-4`}>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">Accedi o Registrati</h2>
              <p className={`text-sm ${T.subtext}`}>
                Per accedere alla piattaforma è necessario registrarsi con
                email, nome e numero di telefono
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                className={`${T.btnPrimary} flex items-center justify-center gap-2`}
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continua con Google
              </button>

              <button
                type="button"
                className={`${T.btnGhost} flex items-center justify-center gap-2`}
                onClick={handleFacebookLogin}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continua con Facebook
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className={`w-full border-t ${T.border}`} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`${T.cardBg} px-2 ${T.subtext}`}>Oppure</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Toggle rapido: Accedi | Registrati */}
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  className={`${T.btnGhost} ${action === "login" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setAction("login")}
                >
                  Accedi
                </button>
                <button
                  type="button"
                  className={`${T.btnGhost} ${action === "register" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setAction("register")}
                >
                  Registrati
                </button>
              </div>

              {/* Toggle metodo (solo se abilitato il magic link) */}
              {emailLinkEnabled && (
                <div className="flex gap-2 text-sm">
                  <button
                    type="button"
                    className={`${T.btnGhost} ${method === "password" ? "opacity-100" : "opacity-60"}`}
                    onClick={() => setMethod("password")}
                  >
                    Email + Password
                  </button>
                  <button
                    type="button"
                    className={`${T.btnGhost} ${method === "magic" ? "opacity-100" : "opacity-60"}`}
                    onClick={() => setMethod("magic")}
                  >
                    Email link
                  </button>
                </div>
              )}

              {/* Campi e azioni */}
              <div>
                <label
                  htmlFor="auth-email"
                  className={`text-sm font-medium ${T.subtext}`}
                >
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  placeholder="esempio@mail.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${T.input} w-full mt-1`}
                />
              </div>

              {method === "password" && (
                <>
                  <div>
                    <label
                      htmlFor="auth-password"
                      className={`text-sm font-medium ${T.subtext}`}
                    >
                      Password
                    </label>
                    <input
                      id="auth-password"
                      type="password"
                      value={password}
                      placeholder="Almeno 6 caratteri"
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${T.input} w-full mt-1`}
                    />
                  </div>
                  {action === "register" && (
                    <div>
                      <label
                        htmlFor="auth-confirm"
                        className={`text-sm font-medium ${T.subtext}`}
                      >
                        Conferma password
                      </label>
                      <input
                        id="auth-confirm"
                        type="password"
                        value={confirmPassword}
                        placeholder="Ripeti la password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${T.input} w-full mt-1`}
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      className={T.btnPrimary}
                      disabled={
                        !email ||
                        !password ||
                        (action === "register" && !confirmPassword) ||
                        sending
                      }
                      onClick={handlePasswordAuth}
                    >
                      {action === "register" ? "Registrati" : "Accedi"}
                    </button>
                    <button
                      type="button"
                      className={T.btnGhost}
                      onClick={() =>
                        setAction(action === "register" ? "login" : "register")
                      }
                    >
                      {action === "register"
                        ? "Hai già un account? Accedi"
                        : "Non hai un account? Registrati"}
                    </button>
                    {action === "login" && (
                      <button
                        type="button"
                        className="text-xs underline"
                        disabled={!email}
                        onClick={handleResetPassword}
                      >
                        Recupera password
                      </button>
                    )}
                  </div>
                </>
              )}

              {method === "magic" && emailLinkEnabled && (
                <>
                  <button
                    type="button"
                    className={T.btnGhost}
                    disabled={!email || sending}
                    onClick={handleSendMagicLink}
                  >
                    {sending ? "Invio in corso..." : "Invia link di accesso"}
                  </button>
                  <p className={`text-xs ${T.subtext}`}>
                    Ti invieremo un link di accesso via email. Aprilo da questo
                    dispositivo per completare l’accesso.
                  </p>
                </>
              )}
            </div>
          </div>
        </Section>
      </div>
    );
  }

  if (showProfileForm || !userProfile?.firstName || !userProfile?.phone) {
    return (
      <div className="space-y-6">
        <Section title="Completa la Registrazione" T={T}>
          <div className={`rounded-2xl ${T.cardBg} ${T.border} p-6 space-y-4`}>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">
                Ciao {user.displayName || user.email}!
              </h2>
              <p className={`text-sm ${T.subtext}`}>
                Per completare la registrazione, inserisci i tuoi dati:
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <label
                  htmlFor="profile-firstname"
                  className={`text-sm font-medium ${T.subtext}`}
                >
                  Nome *
                </label>
                <input
                  id="profile-firstname"
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                  className={`${T.input} w-full mt-1`}
                  placeholder="Inserisci il tuo nome"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-lastname"
                  className={`text-sm font-medium ${T.subtext}`}
                >
                  Cognome
                </label>
                <input
                  id="profile-lastname"
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                  className={`${T.input} w-full mt-1`}
                  placeholder="Inserisci il tuo cognome"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-phone"
                  className={`text-sm font-medium ${T.subtext}`}
                >
                  Numero di Telefono *
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className={`${T.input} w-full mt-1`}
                  placeholder="+39 123 456 7890"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className={`text-sm font-medium ${T.subtext}`}
                >
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className={`${T.input} w-full mt-1 opacity-50 cursor-not-allowed`}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                className={T.btnPrimary}
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? "Salvando..." : "Completa Registrazione"}
              </button>

              <button
                type="button"
                className="text-rose-500 hover:opacity-80 text-sm px-4"
                onClick={() => logout()}
              >
                Esci
              </button>
            </div>

            <p className={`text-xs ${T.subtext}`}>* Campi obbligatori</p>
          </div>
        </Section>
      </div>
    );
  }

  return null; // L'utente è autenticato e ha completato il profilo
}
