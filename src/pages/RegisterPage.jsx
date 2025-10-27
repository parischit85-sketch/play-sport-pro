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
  updateUserProfile,
  setDisplayName,
  getUserProfile,
  sendVerificationEmail,
} from '@services/auth.jsx';
import { validateRegistrationData, normalizeEmail, getE164Format, validateAndNormalizeEmail } from '@utils/validators';
import PasswordStrengthMeter from '@components/registration/PasswordStrengthMeter.jsx';
import EmailValidator from '@components/registration/EmailValidator.jsx';
import PhoneInput from '@components/registration/PhoneInput.jsx';
import TermsOfService from '@components/registration/TermsOfService.jsx';

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
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleRegistration, setIsGoogleRegistration] = useState(false);
  
  // New validation states
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [emailValidation, setEmailValidation] = useState(null);
  const [phoneValidation, setPhoneValidation] = useState(null);

  // Se l'utente è già autenticato, reindirizza alla dashboard
  useEffect(() => {
    if (user && !isGoogleRegistration) {
      navigate('/dashboard');
    }
  }, [user, navigate, isGoogleRegistration]);

  // =============================================
  // FIX: Prevent user from leaving page during registration
  // Prevents data loss if user closes tab while async operations are running
  // =============================================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (loading) {
        e.preventDefault();
        e.returnValue = 'Registrazione in corso... sei sicuro di voler uscire?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [loading]);

  // Mappa gli errori Firebase a messaggi user-friendly in italiano
  const getErrorMessage = (error) => {
    const errorCode = error.code;
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return "Questa email è già registrata. Prova ad accedere o usa un'altra email.";
      case 'auth/weak-password':
        return 'La password deve contenere almeno 6 caratteri.';
      case 'auth/invalid-email':
        return 'Inserisci un indirizzo email valido.';
      case 'auth/operation-not-allowed':
        return 'Registrazione non disponibile al momento. Contatta il supporto.';
      case 'auth/network-request-failed':
        return 'Errore di connessione. Controlla la tua connessione internet e riprova.';
      default:
        return 'Errore durante la registrazione. Riprova più tardi.';
    }
  };

  const validateForm = () => {
    // =============================================
    // UPDATED: Use validators from validators/index.js
    // =============================================
    const validation = validateRegistrationData({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone,
      firstName: formData.firstName,
      lastName: formData.lastName,
    });

    if (!validation.isValid) {
      // Convert validation errors to old format
      const newErrors = {};
      Object.keys(validation.errors).forEach(field => {
        if (Array.isArray(validation.errors[field])) {
          newErrors[field] = validation.errors[field][0]; // Take first error
        }
      });
      setErrors(newErrors);
      return false;
    }

    // Additional validation for email and phone from real-time validators
    if (emailValidation && !emailValidation.isValid) {
      setErrors(prev => ({ ...prev, email: emailValidation.errors[0] }));
      return false;
    }

    if (emailValidation?.isDisposable) {
      setErrors(prev => ({ ...prev, email: 'Email temporanee non sono accettate' }));
      return false;
    }

    if (phoneValidation && !phoneValidation.isValid) {
      setErrors(prev => ({ ...prev, phone: phoneValidation.errors[0] }));
      return false;
    }

    setErrors({});
    return true;
  };  const handleInputChange = (field, value) => {
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

    // Reset API error
    setApiError('');
    
    // Check Terms of Service acceptance
    if (!termsAccepted) {
      setShowTermsError(true);
      alert('Devi accettare i Termini e Condizioni per procedere');
      return;
    }
    setShowTermsError(false);

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

        // =============================================
        // UPDATED: Normalize data using validators before saving
        // =============================================
        const normalizedEmail = normalizeEmail(formData.email);
        const normalizedPhone = getE164Format(formData.phone);

        const profileData = {
          email: normalizedEmail,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: normalizedPhone,
          fiscalCode: formData.fiscalCode.trim(),
          birthDate: formData.birthDate,
          address: formData.address.trim(),
          provider: isGoogleRegistration ? 'google' : 'password',
          termsAcceptedAt: new Date().toISOString(),
          registrationCompleted: true,
        };

        console.log('🔍 Profile data to save:', profileData);

        // =============================================
        // FIX: Properly chain all async operations BEFORE redirect
        // Prevents race condition where redirect happens before data saves
        // =============================================

        console.log('🔍 [DEBUG] Starting profile save process...');
        console.log('🔍 [DEBUG] User ID:', userId);
        console.log('🔍 [DEBUG] Profile data to save:', JSON.stringify(profileData, null, 2));

        // Step 1: Save user profile and wait for completion
        // Use updateUserProfile instead of saveUserProfile to ensure data is saved
        try {
          await updateUserProfile(userId, profileData);
          console.log('✅ [DEBUG] Profile saved successfully to Firestore');
        } catch (saveError) {
          console.error('❌ [DEBUG] Error saving profile:', saveError);
          throw saveError;
        }

        // Step 2: Set display name and wait for completion
        const displayName = `${formData.firstName} ${formData.lastName}`.trim();
        console.log('🔍 [DEBUG] Setting display name:', displayName);
        if (displayName && (userCredential?.user || user)) {
          try {
            await setDisplayName(userCredential?.user || user, displayName);
            console.log('✅ [DEBUG] Display name set successfully');
          } catch (nameError) {
            console.error('❌ [DEBUG] Error setting display name:', nameError);
          }
        }

        // Step 3: Send email verification
        console.log('📧 [DEBUG] Sending verification email...');
        try {
          await sendVerificationEmail(userCredential?.user || user);
          console.log('✅ [DEBUG] Verification email sent successfully');
        } catch (emailError) {
          console.error('⚠️ [DEBUG] Error sending verification email:', emailError);
          // Non-blocking error - continue with registration
        }

        // Step 4: Reload user data and wait for completion
        console.log('🔄 [DEBUG] Reloading user data after profile save...');
        await reloadUserData();
        console.log('✅ [DEBUG] User data reloaded successfully');

        // Step 5: Verify data was saved correctly (debug check)
        const currentUserId = userCredential?.user?.uid || user?.uid;
        console.log('🔍 [DEBUG] Fetching profile to verify save...');
        const debugProfile = await getUserProfile(currentUserId, true);
        console.log('🔍 [DEBUG] Profile fetched from Firestore:', JSON.stringify(debugProfile, null, 2));
        console.log('🔍 [DEBUG] Profile verification:', {
          hasFirstName: !!debugProfile?.firstName,
          hasLastName: !!debugProfile?.lastName,
          hasPhone: !!debugProfile?.phone,
          hasEmail: !!debugProfile?.email,
          firstName: debugProfile?.firstName,
          lastName: debugProfile?.lastName,
          phone: debugProfile?.phone,
          email: debugProfile?.email,
          registrationCompleted: debugProfile?.registrationCompleted,
          isComplete: debugProfile?.firstName && debugProfile?.phone,
        });

        // Step 5: Add buffer time to ensure React Context updates propagate
        // This is critical because reloadUserData() updates state asynchronously
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log('✅ Registration completed successfully');

        // Step 6: Use window.location for full page reload to ensure clean state
        // This forces AuthContext to re-initialize with fresh data from Firestore
        console.log('🔄 Redirecting to dashboard with full page reload...');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Registration error:', error);
      setApiError(getErrorMessage(error));
    } finally {
      setLoading(false);
      setIsGoogleRegistration(false);
    }
  };

  const handleGoogleRegistration = async () => {
    try {
      setLoading(true);
      setApiError(''); // Reset error
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
      setApiError(getErrorMessage(error));
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

            {/* API Error Display */}
            {apiError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{apiError}</span>
                </div>
              </div>
            )}

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
                  
                  {/* Email Validator */}
                  {!isGoogleRegistration && (
                    <EmailValidator 
                      email={formData.email}
                      onChange={(normalized) => handleInputChange('email', normalized)}
                      onValidationChange={setEmailValidation}
                    />
                  )}
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
                        placeholder="Password (almeno 8 caratteri)"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                      
                      {/* Password Strength Meter */}
                      <PasswordStrengthMeter password={formData.password} />
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
                  <PhoneInput
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    onValidationChange={setPhoneValidation}
                    required
                    className={`${T.input} w-full ${errors.phone ? 'border-red-500' : ''}`}
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

              {/* Terms of Service */}
              <div className="pt-4">
                <TermsOfService 
                  accepted={termsAccepted}
                  onAcceptanceChange={setTermsAccepted}
                  showError={showTermsError}
                />
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
