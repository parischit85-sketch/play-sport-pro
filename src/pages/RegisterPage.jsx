// =============================================
// FILE: src/pages/RegisterPage.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { themeTokens, LOGO_URL } from '@lib/theme.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import {
  registerWithEmailPassword,
  loginWithGoogle,
  saveUserProfile,
  setDisplayName,
  getUserProfile,
} from '@services/auth.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, setUserProfile, reloadUserData } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    fiscalCode: '',
    birthDate: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isGoogleRegistration, setIsGoogleRegistration] = useState(false);

  // Se l'utente è già autenticato, reindirizza alla dashboard
  useEffect(() => {
    if (user && !isGoogleRegistration) {
      navigate('/dashboard');
    }
  }, [user, navigate, isGoogleRegistration]);

  const validateForm = () => {
    const newErrors = {};

    // Campi obbligatori
    if (!formData.email.trim()) {
      newErrors.email = 'Email è obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (!isGoogleRegistration) {
      if (!formData.password) {
        newErrors.password = 'Password è obbligatoria';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password deve essere di almeno 6 caratteri';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Conferma password è obbligatoria';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Le password non coincidono';
      }
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome è obbligatorio';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Cognome è obbligatorio';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Numero di telefono è obbligatorio';
    } else if (!/^\+?\d{8,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numero di telefono non valido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Rimuovi errore quando l'utente inizia a digitare
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Compila tutti i campi obbligatori correttamente');
      return;
    }

    setLoading(true);

    try {
      let userCredential;

      if (!isGoogleRegistration) {
        // Registrazione email/password
        userCredential = await registerWithEmailPassword(formData.email.trim(), formData.password);
      }

      // Salva il profilo completo
      const userId = userCredential?.user?.uid || user?.uid;
      if (userId) {
        console.log('🔍 Form data before saving:', formData);

        const profileData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          fiscalCode: formData.fiscalCode.trim(),
          birthDate: formData.birthDate,
          address: formData.address.trim(),
          registrationCompleted: true,
        };

        console.log('🔍 Profile data to save:', profileData);

        await saveUserProfile(userId, profileData);

        // Imposta display name
        const displayName = `${formData.firstName} ${formData.lastName}`.trim();
        if (displayName && (userCredential?.user || user)) {
          await setDisplayName(userCredential?.user || user, displayName);
        }

        console.log('🔄 Reloading user data after profile save...');

        // Aggiorna il profilo nel context utilizzando reloadUserData
        await reloadUserData();

        // Debug: verifica lo stato del profilo dopo il reload
        const currentUserId = userCredential?.user?.uid || user?.uid;
        const debugProfile = await getUserProfile(currentUserId, true);
        console.log('🔍 Debug profile after reload:', {
          firstName: debugProfile?.firstName,
          phone: debugProfile?.phone,
          isComplete: debugProfile?.firstName && debugProfile?.phone,
        });

        console.log('✅ Registration completed successfully');

        // Force page reload per assicurarsi che tutto lo stato sia aggiornato
        console.log('� Forcing page reload to ensure fresh state...');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Errore durante la registrazione: ' + (error.message || error));
    } finally {
      setLoading(false);
      setIsGoogleRegistration(false);
    }
  };

  const handleGoogleRegistration = async () => {
    try {
      setLoading(true);
      const result = await loginWithGoogle();

      if (result.user) {
        // Controlla se l'utente ha già completato la registrazione
        const existingProfile = await getUserProfile(result.user.uid);

        if (existingProfile.registrationCompleted) {
          // Utente già registrato, vai alla dashboard
          navigate('/dashboard');
        } else {
          // Nuovo utente, importa i dati da Google e abilita la modifica
          setIsGoogleRegistration(true);
          setFormData((prev) => ({
            ...prev,
            email: result.user.email || '',
            firstName: result.user.displayName?.split(' ')[0] || '',
            lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          }));
        }
      }
    } catch (error) {
      console.error('Google registration error:', error);
      alert('Errore durante la registrazione con Google: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${T.pageBg} ${T.text}`}>
      <header className={`sticky top-0 z-20 ${T.headerBg}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-10 w-auto rounded-md shadow shrink-0 flex items-center">
              <img
                src={LOGO_URL}
                alt="Play-Sport.pro"
                className="h-10 w-auto select-none dark:bg-white dark:rounded-md dark:p-1"
                draggable={false}
              />
            </div>
            <div className="text-lg sm:text-2xl font-bold tracking-wide truncate text-neutral-900 dark:text-white">
              Play-Sport.pro
            </div>
          </div>
          <div />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-5 sm:py-6">
        <div className="flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className={`mt-6 text-center text-3xl font-extrabold ${T.text}`}>
                Registrazione
              </h2>
              <p className={`mt-2 text-center text-sm ${T.subtext}`}>
                Crea il tuo account per iniziare
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${T.text} mb-1`}>
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isGoogleRegistration}
                    className={`${T.input} w-full ${errors.email ? 'border-red-500' : ''} ${isGoogleRegistration ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password (nascosta per registrazione Google) */}
                {!isGoogleRegistration && (
                  <>
                    <div>
                      <label
                        htmlFor="password"
                        className={`block text-sm font-medium ${T.text} mb-1`}
                      >
                        Password *
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className={`${T.input} w-full ${errors.password ? 'border-red-500' : ''}`}
                        placeholder="Password (almeno 6 caratteri)"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className={`block text-sm font-medium ${T.text} mb-1`}
                      >
                        Conferma Password *
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        className={`${T.input} w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="Conferma password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Nome */}
                <div>
                  <label htmlFor="firstName" className={`block text-sm font-medium ${T.text} mb-1`}>
                    Nome *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className={`${T.input} w-full ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder="Nome"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>

                {/* Cognome */}
                <div>
                  <label htmlFor="lastName" className={`block text-sm font-medium ${T.text} mb-1`}>
                    Cognome *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className={`${T.input} w-full ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder="Cognome"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>

                {/* Telefono */}
                <div>
                  <label htmlFor="phone" className={`block text-sm font-medium ${T.text} mb-1`}>
                    Numero di telefono *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    className={`${T.input} w-full ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+39 123 456 7890"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Campi facoltativi */}
                <div className="pt-4 border-t border-emerald-400/50 dark:border-gray-600">
                  <h3 className={`text-sm font-medium ${T.text} mb-3`}>
                    Informazioni aggiuntive (facoltative)
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="fiscalCode"
                        className={`block text-sm font-medium ${T.subtext} mb-1`}
                      >
                        Codice fiscale
                      </label>
                      <input
                        id="fiscalCode"
                        name="fiscalCode"
                        type="text"
                        className={`${T.input} w-full`}
                        placeholder="Codice fiscale"
                        value={formData.fiscalCode}
                        onChange={(e) => handleInputChange('fiscalCode', e.target.value)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="birthDate"
                        className={`block text-sm font-medium ${T.subtext} mb-1`}
                      >
                        Data di nascita
                      </label>
                      <input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        className={`${T.input} w-full`}
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className={`block text-sm font-medium ${T.subtext} mb-1`}
                      >
                        Indirizzo
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        className={`${T.input} w-full`}
                        placeholder="Via, Città, CAP"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Pulsante registrazione */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`${T.btnPrimary} w-full py-3 text-sm font-medium rounded-md disabled:opacity-50`}
                >
                  {loading
                    ? 'Registrazione in corso...'
                    : isGoogleRegistration
                      ? 'Completa registrazione'
                      : 'Registrati'}
                </button>

                {/* Registrazione Google (solo se non è già in corso) */}
                {!isGoogleRegistration && (
                  <button
                    type="button"
                    onClick={handleGoogleRegistration}
                    disabled={loading}
                    className={`${T.btnGhost} w-full py-3 text-sm font-medium rounded-md border disabled:opacity-50 flex items-center justify-center gap-2`}
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
                    Registrati con Google
                  </button>
                )}
              </div>

              <div className="text-center">
                <p className={`text-sm ${T.subtext}`}>
                  Hai già un account?{' '}
                  <Link
                    to="/login"
                    className={`font-medium ${T.text} hover:${T.neonText} transition-colors duration-200`}
                  >
                    Accedi qui
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
