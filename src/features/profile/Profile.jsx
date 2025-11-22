// =============================================
// FILE: src/features/profile/Profile.jsx
// FUTURISTIC REDESIGN - Modern glassmorphism UI
// =============================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@contexts/NotificationContext';
import Section from '@ui/Section.jsx';
import { auth, getUserProfile, updateUserProfile, setDisplayName } from '@services/auth';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
// import { useUI } from '@contexts/UIContext.jsx'; // Rimosso - tema scuro forzato
import ClubAdminProfile from './ClubAdminProfile.jsx';
import PushNotificationPanel from '@components/debug/PushNotificationPanel.jsx';
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
        }
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

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
            className={`flex items-center gap-6 p-6 ${T.cardBg} border border-blue-500/30 rounded-2xl`}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-500/30 shadow-2xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 ring-4 ring-blue-500/30 flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className={`text-2xl font-bold ${T.text} truncate mb-1`}>
                {user.displayName || 'Utente'}
              </h3>
              <p className={`${T.accentInfo} text-lg truncate mb-2`}>{user.email}</p>
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

          {/* Push Notifications Panel */}
          <PushNotificationPanel />

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

          {/* Statistiche account */}
          <div className={`grid grid-cols-2 gap-6 pt-6 border-t ${T.border}`}>
            <div className={`text-center p-4 ${T.cardBg} border border-blue-500/30 rounded-2xl`}>
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {user.metadata.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString('it-IT')
                  : 'N/A'}
              </div>
              <div className={`text-sm font-medium ${T.subtext}`}>Registrato il</div>
            </div>
            <div className={`text-center p-4 ${T.cardBg} border border-purple-500/30 rounded-2xl`}>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {user.metadata.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString('it-IT')
                  : 'N/A'}
              </div>
              <div className={`text-sm font-medium ${T.subtext}`}>Ultimo accesso</div>
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

      {/* Gestione Profilo */}
      <Section title="Gestione Dati 📝" T={T}>
        <div className={`${T.cardBg} ${T.border} rounded-3xl p-6 shadow-2xl`}>
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
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
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
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
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
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
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
                    onChange={(e) => setForm((f) => ({ ...f, fiscalCode: e.target.value }))}
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
                    onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
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
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Via, Città, CAP"
                  />
                </div>
              </div>

              <div className={`flex flex-col sm:flex-row gap-4 pt-6 border-t ${T.border}`}>
                <button
                  type="button"
                  className={`${T.btnPrimary} text-white px-8 py-3 rounded-xl font-semibold ${T.transitionNormal} hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
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
      </Section>

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
