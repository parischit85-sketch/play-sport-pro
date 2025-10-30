// =============================================
// FILE: src/pages/RegisterClubPage.jsx
// Pagina di registrazione per i circoli sportivi
// =============================================
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Upload,
  ArrowLeft,
  Check,
  Lock,
  User,
  Info,
  X,
} from 'lucide-react';
import { themeTokens, LOGO_URL } from '@lib/theme.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { auth, db } from '@services/firebase.js';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import LogoEditor from '@components/shared/LogoEditor.jsx';

export default function RegisterClubPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);

  const [formData, setFormData] = useState({
    // STEP 1: Dati circolo base
    clubName: '',
    clubEmail: '',
    clubPhone: '',
    password: '',
    confirmPassword: '',

    // STEP 2: Info circolo dettagliate
    logo: null,
    description: '',
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Italia',
    },
    googleMapsLink: '',
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Dati circolo, 2: Logo e dettagli
  const [showMapsInstructions, setShowMapsInstructions] = useState(false);
  const [extractingAddress, setExtractingAddress] = useState(false);
  
  // Stati per Logo Editor
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const [originalLogoSrc, setOriginalLogoSrc] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Funzione per validare password (8 caratteri + 1 speciale)
  const isPasswordValid = (pwd) => {
    if (!pwd || pwd.length < 8) return false;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return hasSpecialChar;
  };

  // Funzione per estrarre indirizzo da link Google Maps
  const extractAddressFromMapsLink = async (mapsLink) => {
    if (!mapsLink) return;
    
    setExtractingAddress(true);
    try {
      // Estrai coordinate dal link
      const coordsMatch = mapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (!coordsMatch) {
        console.log('Coordinate non trovate nel link');
        setExtractingAddress(false);
        return;
      }

      const lat = coordsMatch[1];
      const lng = coordsMatch[2];

      // Usa Nominatim per reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PlaySportPro/1.0'
          }
        }
      );

      if (!response.ok) throw new Error('Errore nel recupero indirizzo');

      const data = await response.json();
      const addr = data.address;

      // Auto-compila i campi indirizzo
      setFormData((prev) => ({
        ...prev,
        address: {
          street: `${addr.road || ''} ${addr.house_number || ''}`.trim() || prev.address.street,
          city: addr.city || addr.town || addr.village || prev.address.city,
          province: addr.state_code || addr.county?.substring(0, 2).toUpperCase() || prev.address.province,
          postalCode: addr.postcode || prev.address.postalCode,
          country: addr.country || 'Italia',
        },
      }));

      console.log('✅ Indirizzo estratto con successo');
    } catch (error) {
      console.error('Errore estrazione indirizzo:', error);
    } finally {
      setExtractingAddress(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        contact: { ...prev.contact, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verifica dimensione file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Il file è troppo grande. Dimensione massima: 5MB');
        return;
      }

      // Verifica tipo file
      if (!file.type.startsWith('image/')) {
        alert('Formato file non valido. Usa PNG, JPG o GIF');
        return;
      }

      // Apri l'editor invece di fare upload diretto
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalLogoSrc(reader.result);
        setShowLogoEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestione completamento editor logo
  const handleLogoEditorComplete = async (croppedBlob) => {
    try {
      setShowLogoEditor(false);
      setUploading(true);

      // Crea un File dal blob
      const croppedFile = new File([croppedBlob], 'logo.jpg', { type: 'image/jpeg' });
      setLogoFile(croppedFile);

      // Preview locale del logo croppato
      const previewUrl = URL.createObjectURL(croppedBlob);
      setLogoPreview(previewUrl);

      // Upload su Cloudinary (usando ID temporaneo)
      const tempClubId = `temp_${Date.now()}`;
      const logoUrl = await uploadLogo(croppedFile, tempClubId);
      setFormData((prev) => ({ ...prev, logo: logoUrl }));

      console.log('✅ Logo uploaded:', logoUrl);
    } catch (error) {
      console.error('Errore upload logo:', error);
      alert('Errore durante il caricamento del logo. Riprova.');
    } finally {
      setUploading(false);
    }
  };

  // Gestione annullamento editor logo
  const handleLogoEditorCancel = () => {
    setShowLogoEditor(false);
    setOriginalLogoSrc(null);
  };

  // Funzione per upload logo su Cloudinary
  const uploadLogo = async (file, clubId) => {
    try {
      setUploading(true);

      const cloudName = 'dlmi2epev';
      const uploadPreset = 'club_logos';

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('upload_preset', uploadPreset);
      uploadFormData.append('folder', `playsport/logos/${clubId}`);
      uploadFormData.append('public_id', `logo_${Date.now()}`);

      console.log('📤 Uploading logo to Cloudinary...');
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error details:', error);
        throw new Error(error.error?.message || 'Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      console.log('✅ Logo caricato con successo su Cloudinary:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error("❌ Errore durante l'upload del logo:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validazione password
      if (!isPasswordValid(formData.password)) {
        setError('La password deve contenere almeno 8 caratteri e un carattere speciale');
        setLoading(false);
        return;
      }

      // 1. Crea l'account Firebase Auth usando l'email del circolo
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.clubEmail,
        formData.password
      );
      const newUser = userCredential.user;

      // 2. Aggiorna il profilo con il nome del circolo
      await updateProfile(newUser, {
        displayName: formData.clubName,
      });

      // 2.5. Invia email di verifica
      console.log('📧 Sending email verification...');
      try {
        await sendEmailVerification(newUser, {
          url: `${window.location.origin}/club/${newUser.uid}/admin/dashboard`,
          handleCodeInApp: false,
        });
        console.log('✅ Email verification sent');
      } catch (emailError) {
        console.warn('⚠️ Failed to send verification email:', emailError);
        // Non bloccare la registrazione se l'email fallisce
      }

      // 3. Convert logo to Base64 for storing in Firestore
      let logoBase64 = null;
      if (formData.logo) {
        // formData.logo should be a data URL from preview
        logoBase64 = formData.logo;
      }

      // =============================================
      // NEW FLOW: Create club immediately with 'pending' status
      // User becomes admin immediately but club is not searchable
      // =============================================

      // 3. Create club document with 'pending' status
      const clubData = {
        name: formData.clubName,
        description: formData.description || '',
        address: {
          street: formData.address.street,
          city: formData.address.city,
          province: formData.address.province || '',
          postalCode: formData.address.postalCode || '',
          country: formData.address.country || 'Italia',
        },
        contact: {
          phone: formData.clubPhone,
          email: formData.clubEmail,
          website: formData.googleMapsLink || '',
        },
        logoUrl: logoBase64, // Store logo URL
        googleMapsLink: formData.googleMapsLink || '',
        status: 'pending', // 🔒 Club is NOT searchable by other users
        isActive: false, // 🔒 Club is NOT active yet
        ownerId: newUser.uid,
        ownerEmail: formData.clubEmail,
        managers: [newUser.uid],
        settings: {
          bookingDuration: 90,
          advanceBookingDays: 14,
          cancellationHours: 24,
          allowGuestBooking: false,
        },
        sports: [],
        courts: [],
        instructors: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        requestedAt: serverTimestamp(),
        approvedAt: null,
      };

      const clubRef = await addDoc(collection(db, 'clubs'), clubData);
      const clubId = clubRef.id;
      console.log('✅ Club created with ID:', clubId, 'status: pending');

      // 4. Crea il profilo utente
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email: formData.clubEmail,
        displayName: formData.clubName,
        firstName: formData.clubName.split(' ')[0] || 'Admin',
        lastName: formData.clubName.split(' ').slice(1).join(' ') || '',
        phone: formData.clubPhone,
        provider: 'password',
        createdAt: serverTimestamp(),
        registeredAt: serverTimestamp(),
      });
      console.log('✅ User profile created');

      // 5. Create admin profile in clubs/{clubId}/profiles/{userId}
      await setDoc(doc(db, 'clubs', clubId, 'profiles', newUser.uid), {
        userId: newUser.uid,
        clubId: clubId,
        firstName: formData.clubName.split(' ')[0] || 'Admin',
        lastName: formData.clubName.split(' ').slice(1).join(' ') || '',
        email: formData.clubEmail,
        phone: formData.clubPhone,
        role: 'club_admin', // 👑 Admin role
        isClubAdmin: true,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        joinedAt: serverTimestamp(),
        addedBy: 'system',
      });
      console.log('✅ Admin profile created in club');

      // 6. Save registration request for admin approval tracking
      const registrationRequest = {
        clubId: clubId,
        name: formData.clubName,
        status: 'pending',
        requestedAt: serverTimestamp(),
        approvedAt: null,
        adminData: {
          userId: newUser.uid,
          email: formData.clubEmail,
          phone: formData.clubPhone,
        },
      };

      await addDoc(collection(db, 'clubRegistrationRequests'), registrationRequest);
      console.log('✅ Registration request saved for admin tracking');

      // 7. Success message and redirect to admin dashboard
      alert(
        `✅ Club Creato!\n\n` +
        `Il circolo "${formData.clubName}" è stato creato.\n\n` +
        `📧 IMPORTANTE: Controlla la tua email!\n` +
        `Abbiamo inviato un'email di verifica a:\n` +
        `${formData.clubEmail}\n\n` +
        `Devi verificare l'email per accedere a tutte le funzionalità.\n\n` +
        `⏳ Status: In attesa di approvazione\n\n` +
        `Puoi già:\n` +
        `• Configurare i campi\n` +
        `• Aggiungere fasce orarie\n` +
        `• Gestire le impostazioni\n\n` +
        `Il circolo sarà visibile agli utenti dopo l'approvazione del super-admin.`
      );

      // Redirect to club admin dashboard
      navigate(`/club/${clubId}/admin/dashboard`);
    } catch (err) {
      console.error('Error registering club:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Questa email è già registrata. Usa un'altra email o accedi.");
      } else if (err.code === 'auth/weak-password') {
        setError('La password deve essere di almeno 8 caratteri con un carattere speciale.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email non valida.');
      } else {
        setError('Errore durante la registrazione. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Validazioni per ogni step
  const canProceedToStep2 =
    formData.clubName &&
    formData.clubEmail &&
    formData.clubPhone &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    isPasswordValid(formData.password);

  const canSubmit = 
    formData.address.street &&
    formData.address.city &&
    formData.address.postalCode &&
    formData.address.province;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Play-Sport.pro" className="h-10" />
              <span className="text-xl font-bold text-white">
                Play-Sport.pro
              </span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna alla home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Registra il Tuo Circolo
          </h1>
          <p className="text-xl text-gray-300">
            Unisciti alla nostra piattaforma e gestisci il tuo circolo sportivo in modo
            professionale
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step > s
                        ? 'bg-emerald-500 text-white'
                        : step === s
                          ? 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                  <span
                    className={`text-sm font-medium ${step >= s ? 'text-white' : 'text-gray-500'}`}
                  >
                    {s === 1 ? 'Dati Circolo' : 'Dettagli & Indirizzo'}
                  </span>
                </div>
                {s < 2 && (
                  <div
                    className={`w-12 h-1 rounded ${step > s ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Step 1: Dati Circolo Base */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                📋 Dati del Circolo
              </h2>

              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-300">
                  Inserisci i dati principali del tuo circolo sportivo. Questi dati saranno
                  utilizzati per creare l'account e per il login.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome del Circolo *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="clubName"
                    value={formData.clubName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="es: Sporting Club Milano"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email del Circolo *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="clubEmail"
                    value={formData.clubEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@circolo.com"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Questa email sarà usata per il login alla piattaforma
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefono del Circolo *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="clubPhone"
                    value={formData.clubPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+39 02 1234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minimo 8 caratteri con 1 speciale"
                  />
                </div>
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-gray-400">
                    Deve contenere almeno 8 caratteri e un carattere speciale (!@#$%^&*...)
                  </p>
                  {formData.password && !isPasswordValid(formData.password) && (
                    <p className="text-xs text-red-400">
                      ❌ Password non valida (serve 8 caratteri + 1 speciale)
                    </p>
                  )}
                  {formData.password && isPasswordValid(formData.password) && (
                    <p className="text-xs text-green-400">
                      ✅ Password valida
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Conferma Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ripeti la password"
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">
                    Le password non corrispondono
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continua →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Logo e Dettagli */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                📍 Dettagli & Indirizzo
              </h2>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Logo del Circolo (opzionale)
                </label>
                <div className="flex flex-col items-center gap-4">
                  {formData.logo && (
                    <div className="relative">
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="w-32 h-32 object-contain rounded-lg border-2 border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logo: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      disabled={uploading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100"
                    />
                    {uploading && (
                      <p className="text-sm text-blue-400 mt-2">
                        📤 Caricamento in corso...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrizione (opzionale)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Breve descrizione del tuo circolo sportivo..."
                />
              </div>

              {/* Google Maps Link con Auto-fill */}
              <div className="bg-blue-900/20 border-2 border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Globe className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      Link Google Maps (opzionale ma consigliato)
                    </h3>
                    <p className="text-sm text-gray-400">
                      Incolla il link completo da Google Maps per auto-compilare l'indirizzo
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMapsInstructions(true)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="url"
                  name="googleMapsLink"
                  value={formData.googleMapsLink}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.value && e.target.value.includes('google.com/maps')) {
                      extractAddressFromMapsLink(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.google.com/maps/place/..."
                />
                {extractingAddress && (
                  <p className="text-sm text-blue-400 mt-2 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Estrazione indirizzo in corso...
                  </p>
                )}
              </div>

              {/* Address Fields */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="font-semibold text-white mb-4">
                  Indirizzo Completo *
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Via e numero civico *
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Via Roma, 123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Città *
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Milano"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CAP *
                    </label>
                    <input
                      type="text"
                      name="address.postalCode"
                      value={formData.address.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="20100"
                      maxLength={5}
                      pattern="[0-9]{5}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Provincia *
                    </label>
                    <input
                      type="text"
                      name="address.province"
                      value={formData.address.province}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-white text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MI"
                      maxLength={2}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border-2 border-gray-600 text-gray-300 hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  ← Indietro
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Registrazione...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-5 h-5" />
                      Completa Registrazione
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Google Maps Instructions Modal */}
        {showMapsInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">
                  Come ottenere il link Google Maps
                </h3>
                <button
                  onClick={() => setShowMapsInstructions(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-300">
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-blue-200 font-medium">
                    💡 Usa il link completo dalla barra degli indirizzi del browser, NON il link
                    abbreviato!
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Apri Google Maps</p>
                    <p className="text-gray-400">
                      Vai su{' '}
                      <a
                        href="https://maps.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        maps.google.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Cerca il tuo circolo</p>
                    <p className="text-gray-400">
                      Digita l'indirizzo completo del tuo circolo sportivo
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Copia dalla barra degli indirizzi</p>
                    <p className="text-gray-400">
                      Copia il <strong>link COMPLETO</strong> dalla barra degli indirizzi del
                      browser
                    </p>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-green-400">
                        ✅ Esempio corretto:
                        <br />
                        https://www.google.com/maps/place/...
                      </p>
                      <p className="text-xs text-red-400">
                        ❌ NON usare:
                        <br />
                        maps.app.goo.gl/xyz (link abbreviato)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Incolla nel campo sopra</p>
                    <p className="text-gray-400">
                      Incolla il link completo nel campo "Link Google Maps"
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMapsInstructions(false)}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Ho capito
              </button>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-400">
          Hai già un account?{' '}
          <Link
            to="/login"
            className="text-blue-400 hover:underline font-medium"
          >
            Accedi qui
          </Link>
        </div>
      </div>

      {/* Logo Editor Modal */}
      {showLogoEditor && originalLogoSrc && (
        <LogoEditor
          imageSrc={originalLogoSrc}
          onComplete={handleLogoEditorComplete}
          onCancel={handleLogoEditorCancel}
        />
      )}
    </div>
  );
}

