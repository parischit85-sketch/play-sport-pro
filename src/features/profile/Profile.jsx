// =============================================
// FILE: src/features/profile/Profile.jsx
// FUTURISTIC REDESIGN - Modern glassmorphism UI
// =============================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@contexts/NotificationContext';
import Section from '@ui/Section.jsx';
import { auth, getUserProfile, updateUserProfile, setDisplayName } from '@services/auth';
import { uploadProfilePicture } from '@services/users';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
// import { useUI } from '@contexts/UIContext.jsx'; // Rimosso - tema scuro forzato
import ClubAdminProfile from './ClubAdminProfile.jsx';
import CertificateExpiryAlert from './CertificateExpiryAlert.jsx';
import UserGDPRPanel from './UserGDPRPanel.jsx';

export default function Profile({ T }) {
  const { showSuccess, showError, confirm } = useNotifications();
  // Profile component rendered
  const user = auth.currentUser;
  const navigate = useNavigate();
  // useUI() non più necessario - tema scuro forzato
  const { logout, setUserProfile, reloadUserData, userRole, isClubAdmin, getFirstAdminClub } =
    useAuth();
  const { clubId, club } = useClub();

  // Debug: mostra i valori per capire il problema
  // console.log('🔍 Profile Debug:', {
  //   isClubAdmin: typeof isClubAdmin === 'function' ? isClubAdmin(clubId) : isClubAdmin,
  //   clubId,
  //   club: club ? club.name : 'null',
  //   userRole,
  //   user: user ? { uid: user.uid, email: user.email } : 'null',
  //   userAffiliations: userAffiliations || []
  // });

  // Check if user is admin of any club and get first admin club
  const firstAdminClubId = getFirstAdminClub ? getFirstAdminClub() : null;
  const actualClubId = clubId || firstAdminClubId;
  const isActuallyAdmin = isClubAdmin(actualClubId);

  // Debug esteso per capire il problema di admin detection
  // console.log('🔧 Admin Detection Debug:', {
  //   firstAdminClubId,
  //   actualClubId,
  //   isActuallyAdmin,
  //   userAffiliationsDetails: userAffiliations.map(a => ({
  //     clubId: a.clubId,
  //     role: a.role,
  //     status: a.status,
  //     isClubAdmin: a.isClubAdmin
  //   }))
  // });

  // URL parameter to force normal profile
  const urlParams = new URLSearchParams(window.location.search);
  const forceNormalProfile = urlParams.get('normal') === 'true';

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    fiscalCode: '',
    birthDate: '',
    address: '',
  });
  const [userProfile, setUserProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isDataExpanded, setIsDataExpanded] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (user) {
        const data = await getUserProfile(user.uid);
        if (active) {
          setUserProfileData(data);
          setForm((f) => ({
            ...f,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            fiscalCode: data.fiscalCode || '',
            birthDate: data.birthDate || '',
            address: data.address || '',
          }));
          // Reset dirty state after loading
          setIsDirty(false);
        }
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const handleInputChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setIsDirty(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const downloadURL = await uploadProfilePicture(user.uid, file);
      
      // Update local state immediately
      if (userProfile) {
        setUserProfileData({ ...userProfile, avatar: downloadURL });
      }
      
      // Force reload user data to update context
      await reloadUserData();
      
      showSuccess('Foto profilo aggiornata!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showError('Errore caricamento foto: ' + error.message);
    } finally {
      setSaving(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // If user is admin and not forcing normal profile, render admin profile
  if (isActuallyAdmin && actualClubId && !forceNormalProfile) {
    return (
      <div className="space-y-4">
        <div
          className={`flex justify-between items-center ${T.cardBg} border border-blue-500/30 p-4 rounded-xl`}
        >
          <div className="text-sm">
            <strong>👔 Modalità Admin</strong> - Stai visualizzando l&apos;interfaccia di gestione
            del club
          </div>
          <button
            onClick={() => (window.location.href = '/profile?normal=true')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            👤 Profilo Utente
          </button>
        </div>
        <ClubAdminProfile T={T} club={club} clubId={actualClubId} />
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateUserProfile(user.uid, form);
      const name = [form.firstName, form.lastName].filter(Boolean).join(' ');
      if (name) await setDisplayName(user, name);

      // Ricarica il profilo nell'AuthContext
      const updatedProfile = await getUserProfile(user.uid);
      setUserProfile(updatedProfile);

      // Ricarica anche i dati dell'utente (affiliazioni, ecc.)
      await reloadUserData();

      showSuccess('Profilo salvato!');
      setIsDirty(false);
      setIsDataExpanded(false);

      // Se il profilo è ora completo, naviga alla dashboard
      if (updatedProfile.firstName && updatedProfile.phone) {
        console.log('✅ Profile completed, navigating to dashboard');
        navigate('/dashboard');
      }
    } catch (e) {
      showError('Errore salvataggio: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Logout',
      message: 'Sei sicuro di voler uscire?',
      variant: 'warning',
      confirmText: 'Esci',
      cancelText: 'Annulla',
    });
    if (confirmed) {
      try {
        console.log('🚪 Initiating logout...');
        await logout();
        console.log('✅ Logout successful, redirecting...');
        // Forza la navigazione alla home dopo logout
        navigate('/', { replace: true });
        // Ricarica la pagina per pulire completamente lo stato
        window.location.reload();
      } catch (e) {
        console.error('❌ Logout error:', e);
        showError('Errore durante il logout: ' + (e?.message || e));
      }
    }
  };

  const getProviderIcon = (providerId) => {
    switch (providerId) {
      case 'google.com':
        return (
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
        );
      case 'facebook.com':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9C7.9 1 7 1.9 7 3V21C7 22.1 7.9 23 9 23H15C16.1 23 17 22.1 17 21V19L21 15V9H21ZM15 3V7H19L15 3ZM9 19V21H15V19H9Z" />
          </svg>
        );
    }
  };

  const getProviderName = (providerId) => {
    switch (providerId) {
      case 'google.com':
        return 'Google';
      case 'facebook.com':
        return 'Facebook';
      default:
        return 'Email';
    }
  };

  if (!user) {
    return (
      <Section title="Profilo" T={T}>
        <div className={`rounded-2xl ${T.cardBg} ${T.border} p-4`}>
          <div className="text-sm">
            Devi effettuare l’accesso per gestire il profilo (vai nella tab “Accesso”).
          </div>
        </div>
      </Section>
    );
  }

  return (
    <div className="space-y-8">
      {/* Certificate Expiry Alert */}
      <CertificateExpiryAlert />

      {/* Banner per admin che visualizzano profilo normale */}
      {isActuallyAdmin && forceNormalProfile && (
        <div className={`${T.cardBg} border border-orange-500/30 p-4 rounded-xl`}>
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <strong>👤 Modalità Utente</strong> - Stai visualizzando il profilo come utente
              normale
            </div>
            <button
              onClick={() => (window.location.href = '/profile')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              👔 Torna alla Gestione Club
            </button>
          </div>
        </div>
      )}

      {/* Informazioni Account */}
      <Section title="Profilo Utente 👤" T={T}>
        <div className={`${T.cardBg} ${T.border} rounded-3xl p-6 space-y-6 shadow-2xl`}>
          {/* Header con avatar e info principali */}
          <div
            className={`flex items-center gap-6 p-6 ${T.cardBg} border border-blue-500/30 rounded-2xl relative overflow-hidden`}
          >
            <div className="relative group">
              {userProfile?.avatar || user.photoURL ? (
                <img
                  src={userProfile?.avatar || user.photoURL}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-500/30 shadow-2xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 ring-4 ring-blue-500/30 flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-500 transition-colors z-10"
                title="Cambia foto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={`text-2xl font-bold ${T.text} truncate mb-1`}>
                {user.displayName || 'Utente'}
              </h3>
              
              {userProfile?.pspId && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 text-sm font-mono bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg border border-blue-500/30">
                    <span className="opacity-70">ID:</span>
                    <span className="font-bold">#{userProfile.pspId}</span>
                  </span>
                </div>
              )}

              <p className={`${T.accentInfo} text-sm truncate mb-2`}>{user.email}</p>
              <div className="flex items-center gap-3">
                {user.providerData[0] && getProviderIcon(user.providerData[0].providerId)}
                <span className={`text-sm font-medium ${T.subtext}`}>
                  Accesso tramite{' '}
                  {user.providerData[0]
                    ? getProviderName(user.providerData[0].providerId)
                    : 'Email'}
                </span>
                <div
                  className={`flex items-center gap-1 ${T.cardBg} border border-emerald-500/30 px-3 py-1 rounded-full`}
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className={`text-xs font-medium text-emerald-400`}>Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stato Account */}
          <div
            className={`flex items-center justify-between p-4 ${T.cardBg} border border-emerald-500/30 rounded-2xl`}
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg"></div>
              <span className="text-lg font-bold text-emerald-400">Account Attivo</span>
            </div>
            <div
              className={`flex items-center gap-2 ${T.cardBg} border border-emerald-500/30 px-3 py-1 rounded-full`}
            >
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-emerald-400">Email verificata</span>
            </div>
          </div>

          {/* Statistiche account compatte */}
          <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${T.border}`}>
            <div className={`flex items-center gap-3 p-3 ${T.cardBg} border border-blue-500/20 rounded-xl`}>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className={`text-xs font-medium ${T.subtext}`}>Registrato</div>
                <div className="text-sm font-bold text-blue-400">
                  {user.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString('it-IT')
                    : 'N/A'}
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-3 ${T.cardBg} border border-purple-500/20 rounded-xl`}>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className={`text-xs font-medium ${T.subtext}`}>Ultimo accesso</div>
                <div className="text-sm font-bold text-purple-400">
                  {user.metadata.lastSignInTime
                    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('it-IT')
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Toggle RIMOSSO - Tema scuro forzato */}

          {/* Pulsante Extra (Mobile) - Solo per Admin */}
          {(userRole === 'super_admin' ||
            (user && user.userProfile?.role === 'admin') ||
            isClubAdmin(clubId)) && (
            <div className={`pt-6 border-t ${T.border}`}>
              <button
                type="button"
                onClick={() => navigate('/extra')}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium text-white ${T.btnPrimary} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Funzioni Extra
              </button>
            </div>
          )}

          {/* Pulsante Logout */}
          <div className={`pt-6 border-t ${T.border}`}>
            <button
              type="button"
              onClick={handleLogout}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Esci dall&apos;account
            </button>
          </div>
        </div>
      </Section>

      {/* Gestione Profilo - Collapsible */}
      <Section title="Gestione Dati 📝" T={T}>
        <div className={`${T.cardBg} ${T.border} rounded-3xl overflow-hidden shadow-2xl transition-all duration-300`}>
          <button 
            onClick={() => setIsDataExpanded(!isDataExpanded)}
            className={`w-full flex items-center justify-between p-6 ${isDataExpanded ? 'border-b ' + T.border : ''} hover:bg-white/5 transition-colors`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDataExpanded ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/10 text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className={`text-lg font-bold ${T.text}`}>Modifica Dati Personali</h3>
                <p className={`text-sm ${T.subtext}`}>Aggiorna le tue informazioni di contatto</p>
              </div>
            </div>
            <svg 
              className={`w-6 h-6 ${T.subtext} transition-transform duration-300 ${isDataExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDataExpanded && (
            <div className="p-6 animate-fadeIn">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className={`text-sm ${T.subtext}`}>Caricamento profilo...</div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="firstName" className={`text-sm font-semibold ${T.text}`}>
                        Nome *
                      </label>
                      <input
                        id="firstName"
                        className={`px-4 py-3 ${T.input} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent ${T.transitionNormal}`}
                        value={form.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Inserisci il tuo nome"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="lastName" className={`text-sm font-semibold ${T.text}`}>
                        Cognome
                      </label>
                      <input
                        id="lastName"
                        className={`px-4 py-3 ${T.input} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent ${T.transitionNormal}`}
                        value={form.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Inserisci il tuo cognome"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="phone" className={`text-sm font-semibold ${T.text}`}>
                        Telefono *
                      </label>
                      <input
                        id="phone"
                        className={`px-4 py-3 ${T.input} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent ${T.transitionNormal}`}
                        value={form.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+39 123 456 7890"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="fiscalCode" className={`text-sm font-semibold ${T.text}`}>
                        Codice Fiscale
                      </label>
                      <input
                        id="fiscalCode"
                        className={`px-4 py-3 ${T.input} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent ${T.transitionNormal}`}
                        value={form.fiscalCode}
                        onChange={(e) => handleInputChange('fiscalCode', e.target.value)}
                        placeholder="RSSMRA80A01H501U"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="birthDate" className={`text-sm font-semibold ${T.text}`}>
                        Data di nascita
                      </label>
                      <input
                        id="birthDate"
                        type="date"
                        className={`px-4 py-3 ${T.input} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent ${T.transitionNormal}`}
                        value={form.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="email" className={`text-sm font-semibold ${T.text}`}>
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className={`px-4 py-3 ${T.inputBg} ${T.border} rounded-xl ${T.subtext} cursor-not-allowed`}
                        value={user.email || ''}
                        disabled
                      />
                    </div>
                    <div className="flex flex-col sm:col-span-2 space-y-2">
                      <label htmlFor="address" className={`text-sm font-semibold ${T.text}`}>
                        Indirizzo
                      </label>
                      <input
                        id="address"
                        className={`px-4 py-3 ${T.input} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent ${T.transitionNormal}`}
                        value={form.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Via, Città, CAP"
                      />
                    </div>
                  </div>

                  <div className={`flex flex-col sm:flex-row gap-4 pt-6 border-t ${T.border}`}>
                    {/* Standard Save Button (Desktop/Inline) */}
                    <button
                      type="button"
                      className={`${T.btnPrimary} text-white px-8 py-3 rounded-xl font-semibold ${T.transitionNormal} hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Salvando...
                        </span>
                      ) : (
                        'Salva Modifiche'
                      )}
                    </button>
                  </div>

                  <p className={`text-sm ${T.subtext} italic`}>* Campi obbligatori</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* Floating Action Button (FAB) for Saving */}
      <div 
        className={`fixed bottom-24 right-6 z-50 transition-all duration-500 transform ${
          isDirty ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 pr-6"
        >
          {saving ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          )}
          <span className="font-bold">Salva</span>
        </button>
      </div>

      {/* GDPR - Export & Delete Data */}
      {userProfile && (
        <Section title="Protezione Dati (GDPR) 🔒" T={T}>
          <UserGDPRPanel
            user={user}
            userProfile={userProfile}
            clubId={clubId || userProfile.clubId || getFirstAdminClub?.()}
          />
        </Section>
      )}
    </div>
  );
}
