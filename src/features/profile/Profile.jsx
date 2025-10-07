// =============================================
// FILE: src/features/profile/Profile.jsx
// FUTURISTIC REDESIGN - Modern glassmorphism UI
// =============================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '@ui/Section.jsx';
import { auth, getUserProfile, saveUserProfile, setDisplayName } from '@services/auth';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';
import ClubAdminProfile from './ClubAdminProfile.jsx';
import PushNotificationPanel from '@/components/debug/PushNotificationPanel.jsx';

export default function Profile({ T }) {
  // Profile component rendered
  const user = auth.currentUser;
  const navigate = useNavigate();
  const { darkMode, toggleTheme, addNotification } = useUI();
  const {
    logout,
    setUserProfile,
    reloadUserData,
    userRole,
    isClubAdmin,
    userAffiliations,
    getFirstAdminClub,
  } = useAuth();
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

  // If user is admin and not forcing normal profile, render admin profile
  if (isActuallyAdmin && actualClubId && !forceNormalProfile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <div className="text-sm">
            <strong>👔 Modalità Admin</strong> - Stai visualizzando l'interfaccia di gestione del
            club
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

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    fiscalCode: '',
    birthDate: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (user) {
        const data = await getUserProfile(user.uid);
        if (active) {
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

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await saveUserProfile(user.uid, form);
      const name = [form.firstName, form.lastName].filter(Boolean).join(' ');
      if (name) await setDisplayName(user, name);

      // Ricarica il profilo nell'AuthContext
      const updatedProfile = await getUserProfile(user.uid);
      setUserProfile(updatedProfile);

      // Ricarica anche i dati dell'utente (affiliazioni, ecc.)
      await reloadUserData();

      alert('Profilo salvato!');

      // Se il profilo è ora completo, naviga alla dashboard
      if (updatedProfile.firstName && updatedProfile.phone) {
        console.log('✅ Profile completed, navigating to dashboard');
        navigate('/dashboard');
      }
    } catch (e) {
      alert('Errore salvataggio: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Sei sicuro di voler uscire?')) {
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
        alert('Errore durante il logout: ' + (e?.message || e));
      }
    }
  };

  // Simula aggiunta a prenotazione -> notifica test
  const simulateAddedToBooking = () => {
    const when = new Date(Date.now() + 45 * 60000); // +45 min
    const time = when.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const fake = {
      court: 'Campo 2',
      club: (club && club.name) || 'Club Demo',
      time,
      date: when.toISOString().slice(0, 10),
    };
    addNotification({
      type: 'success',
      title: 'Aggiunto alla prenotazione',
      message: `Sei stato aggiunto su ${fake.court} alle ${fake.time} (${fake.club})`,
    });
    console.log('🔔 [Profile] Simulated booking addition notification:', fake);
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
      {/* Banner per admin che visualizzano profilo normale */}
      {isActuallyAdmin && forceNormalProfile && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30 p-4 rounded-xl">
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
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 space-y-6 shadow-2xl">
          {/* Header con avatar e info principali */}
          <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate mb-1">
                {user.displayName || 'Utente'}
              </h3>
              <p className="text-blue-600 dark:text-blue-400 text-lg truncate mb-2">{user.email}</p>
              <div className="flex items-center gap-3">
                {user.providerData[0] && getProviderIcon(user.providerData[0].providerId)}
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Accesso tramite{' '}
                  {user.providerData[0]
                    ? getProviderName(user.providerData[0].providerId)
                    : 'Email'}
                </span>
                <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Online
                  </span>
                </div>
              </div>
            </div>
            {/* Pulsante test notifica prenotazione */}
            <div className="mt-4">
              <button
                type="button"
                onClick={simulateAddedToBooking}
                className="px-4 py-2 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white shadow inline-flex items-center gap-2"
              >
                🏓 Test notifica prenotazione
              </button>
            </div>
          </div>

          {/* Push Notifications Panel */}
          <PushNotificationPanel />

          {/* Stato Account */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg"></div>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                Account Attivo
              </span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-800/50 px-3 py-1 rounded-full">
              <svg
                className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Email verificata
              </span>
            </div>
          </div>

          {/* Statistiche account */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/20 dark:border-gray-600/20">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200/30 dark:border-blue-700/30">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {user.metadata.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString('it-IT')
                  : 'N/A'}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Registrato il
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl border border-purple-200/30 dark:border-purple-700/30">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {user.metadata.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString('it-IT')
                  : 'N/A'}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Ultimo accesso
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/30 dark:border-gray-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  {darkMode ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Tema dell'App</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {darkMode ? 'Modalità scura attiva' : 'Modalità chiara attiva'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                  darkMode
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={darkMode}
                aria-label="Cambia tema"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                    darkMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Pulsante Extra (Mobile) - Solo per Admin */}
          {(userRole === 'super_admin' ||
            (user && user.userProfile?.role === 'admin') ||
            isClubAdmin(clubId)) && (
            <div className="pt-6 border-t border-white/20 dark:border-gray-600/20">
              <button
                type="button"
                onClick={() => navigate('/extra')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-xl"
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
          <div className="pt-6 border-t border-white/20 dark:border-gray-600/20">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Esci dall'account
            </button>
          </div>
        </div>
      </Section>

      {/* Gestione Profilo */}
      <Section title="Gestione Dati 📝" T={T}>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-6 shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm">Caricamento profilo...</div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Nome *
                  </label>
                  <input
                    className="px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    placeholder="Inserisci il tuo nome"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Cognome
                  </label>
                  <input
                    className="px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    placeholder="Inserisci il tuo cognome"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Telefono *
                  </label>
                  <input
                    className="px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+39 123 456 7890"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Codice Fiscale
                  </label>
                  <input
                    className="px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    value={form.fiscalCode}
                    onChange={(e) => setForm((f) => ({ ...f, fiscalCode: e.target.value }))}
                    placeholder="RSSMRA80A01H501U"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Data di nascita
                  </label>
                  <input
                    type="date"
                    className="px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    value={form.birthDate}
                    onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    className="px-4 py-3 bg-gray-100/60 dark:bg-gray-600/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    value={user.email || ''}
                    disabled
                  />
                </div>
                <div className="flex flex-col sm:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Indirizzo
                  </label>
                  <input
                    className="px-4 py-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Via, Città, CAP"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/20 dark:border-gray-600/20">
                <button
                  type="button"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

              <p className="text-sm text-gray-500 dark:text-gray-400 italic">* Campi obbligatori</p>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
