import { useState, useEffect } from 'react';
import { auth } from '@services/firebase';
import { logout } from '@services/auth';
import Section from '@ui/Section';
import Modal from '@ui/Modal';
import Extra from '@features/extra/Extra';
import NotificationSettings from '@components/NotificationSettings';
import PWAInstallButton from '@components/PWAInstallButton';
import {
  getActiveUserBookings,
  getUserBookingHistory,
  cancelBooking,
} from '@services/unified-booking-service.js';

function Profile({ T, state, setState, derived, leagueId, setLeagueId, clubMode, setClubMode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Stati per prenotazioni
  const [activeBookings, setActiveBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);

      // Carica prenotazioni se l'utente è autenticato
      if (user) {
        loadUserBookings(user);
      } else {
        setActiveBookings([]);
        setBookingHistory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Funzione per caricare le prenotazioni dell'utente
  const loadUserBookings = async (user) => {
    if (!user) return;

    setLoadingBookings(true);
    try {
      const [active, history] = await Promise.all([
        getActiveUserBookings(user.uid),
        getUserBookingHistory(user.uid),
      ]);

      setActiveBookings(active);
      setBookingHistory(history);
    } catch (error) {
      console.error('Errore caricamento prenotazioni:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Funzione per cancellare una prenotazione
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) return;

    try {
  await cancelBooking(bookingId, user);
      // Ricarica le prenotazioni
      await loadUserBookings(user);
      alert('Prenotazione cancellata con successo!');
    } catch (error) {
      console.error('Errore cancellazione prenotazione:', error);
      alert('Errore durante la cancellazione. Riprova più tardi.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const getProviderIcon = (providerId) => {
    switch (providerId) {
      case 'google.com':
        return '🔗';
      case 'facebook.com':
        return '📘';
      case 'password':
        return '🔐';
      default:
        return '📧';
    }
  };

  const getProviderName = (providerId) => {
    switch (providerId) {
      case 'google.com':
        return 'Google';
      case 'facebook.com':
        return 'Facebook';
      case 'password':
        return 'Email/Password';
      default:
        return 'Email';
    }
  };

  if (loading) {
    return (
      <Section title="Profilo Utente" icon="👤" T={T}>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  if (!user) {
    return (
      <Section title="Profilo Utente" icon="👤" T={T}>
        <div className="text-center py-16">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-3xl">👤</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Non autenticato</h3>
          <p className="text-gray-600">Effettua il login per accedere al tuo profilo</p>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Profilo Utente" icon="👤" T={T}>
      <div className="space-y-8">
        {/* Header del Profilo */}
        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 sm:p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white/20 shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-2xl border-4 border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white text-2xl sm:text-3xl">👤</span>
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-2 sm:border-4 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{user.displayName || 'Utente'}</h2>
              <p className="text-white/80 mb-3 text-sm sm:text-base break-all">{user.email}</p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
                  ✅ Verificato
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
                  {getProviderIcon(user.providerData[0]?.providerId)}{' '}
                  <span className="hidden sm:inline">
                    {getProviderName(user.providerData[0]?.providerId)}
                  </span>
                  <span className="sm:hidden">
                    {getProviderName(user.providerData[0]?.providerId).split('/')[0]}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-8 min-w-max px-2 sm:px-0">
            {[
              { id: 'overview', label: 'Info', icon: '📊' },
              { id: 'bookings', label: 'Attive', icon: '📅' },
              { id: 'history', label: 'Storico', icon: '🗂️' },
              { id: 'notifications', label: 'Notifiche', mobileLabel: 'Push', icon: '🔔' },
              { id: 'security', label: 'Sicurezza', mobileLabel: 'Extra', icon: '🔒' },
              { id: 'activity', label: 'Attività', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.mobileLabel || tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Informazioni Principali */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Informazioni Account</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors self-start sm:self-auto"
                  >
                    {isEditing ? '💾 Salva' : '✏️ Modifica'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:gap-6">
                  <div>
                    <label
                      htmlFor="profile-displayName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nome Display
                    </label>
                    <input
                      id="profile-displayName"
                      type="text"
                      value={user.displayName || ''}
                      disabled={!isEditing}
                      className={`w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm lg:text-base ${
                        isEditing ? 'bg-white' : 'bg-gray-50 text-gray-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm lg:text-base break-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-uid"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      ID Utente
                    </label>
                    <input
                      id="profile-uid"
                      type="text"
                      value={user.uid?.substring(0, 15) + '...' || ''}
                      disabled
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-xs lg:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-created"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Data Registrazione
                    </label>
                    <input
                      id="profile-created"
                      type="text"
                      value={
                        user.metadata?.creationTime
                          ? new Date(user.metadata.creationTime).toLocaleDateString('it-IT')
                          : 'N/A'
                      }
                      disabled
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm lg:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar con statistiche */}
            <div className="space-y-4 lg:space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Account</h3>
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm lg:text-base">Sessioni attive</span>
                    <span className="font-semibold text-green-600">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm lg:text-base">Ultimo accesso</span>
                    <span className="text-xs lg:text-sm text-gray-900">
                      {user.metadata?.lastSignInTime
                        ? new Date(user.metadata.lastSignInTime).toLocaleDateString('it-IT')
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm lg:text-base">Email verificata</span>
                    <span className="text-green-600">✅</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
                <div className="space-y-2 lg:space-y-3">
                  <button className="w-full px-3 lg:px-4 py-2 lg:py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    🔄 Aggiorna Profilo
                  </button>
                  <button className="w-full px-3 lg:px-4 py-2 lg:py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    📧 Cambia Email
                  </button>
                  <button className="w-full px-3 lg:px-4 py-2 lg:py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    🔐 Cambia Password
                  </button>
                </div>
              </div>

              {/* Sezione PWA Installation */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 lg:p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M6.938 12.79a2.121 2.121 0 000-1.58c.232-.382.555-.728.955-.955C8.667 9.75 10.25 9 12 9s3.333.75 4.107 1.255c.4.227.723.573.955.955a2.121 2.121 0 000 1.58m-4.498 1.175l1.436-1.436m0 0l1.436 1.436m-1.436-1.436v4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">📱 Installa App</h3>
                </div>

                <p className="text-sm text-blue-800 mb-4">
                  Installa Paris League come app sul tuo dispositivo per un accesso più veloce e
                  notifiche push.
                </p>

                {/* Pulsante di installazione */}
                <PWAInstallButton className="w-full justify-center mb-3" />

                {/* Benefici dell'installazione */}
                <div className="bg-white/50 rounded-lg p-3 mt-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">✨ Vantaggi dell'app:</h4>
                  <ul className="space-y-1 text-xs text-blue-800">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span>Accesso veloce dalla home screen</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span>Notifiche push per prenotazioni</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span>Funziona offline per visualizzare dati</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span>Esperienza app nativa</span>
                    </li>
                  </ul>
                </div>

                {/* Link alle notifiche */}
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="w-full mt-3 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-white/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5-5-5h5V12h10v5z"
                    />
                  </svg>
                  Configura Notifiche
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Prenotazioni Attive */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Prenotazioni Attive</h3>
                <button
                  onClick={() => loadUserBookings(user)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  🔄 Ricarica
                </button>
              </div>

              {loadingBookings ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Caricamento prenotazioni...</p>
                </div>
              ) : activeBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📅</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Nessuna prenotazione attiva
                  </h4>
                  <p className="text-gray-600">Le tue prossime prenotazioni appariranno qui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 mb-3 sm:mb-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                            <span className="text-base sm:text-lg font-semibold text-emerald-600 mb-1 sm:mb-0">
                              {booking.courtName || `Campo ${booking.courtId}`}
                            </span>
                            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full self-start">
                              {booking.status === 'confirmed' ? 'Confermata' : booking.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">📅 Data:</span>
                              <br />
                              <span className="text-xs sm:text-sm">
                                {new Date(booking.date).toLocaleDateString('it-IT', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">🕐 Orario:</span>
                              <br />
                              <span className="text-xs sm:text-sm">
                                {booking.time} ({booking.duration}min)
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">💰 Prezzo:</span>
                              <br />
                              <span className="text-xs sm:text-sm">€{booking.price}</span>
                            </div>
                            <div>
                              <span className="font-medium">👥 Giocatori:</span>
                              <br />
                              <span className="text-xs sm:text-sm">
                                {booking.players?.length || 1}
                              </span>
                            </div>
                          </div>
                          {booking.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">📝 Note:</span> {booking.notes}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 sm:mt-4 sm:ml-4 sm:flex-shrink-0">
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="w-full sm:w-auto px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            ❌ Cancella
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Storico Prenotazioni */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Storico Prenotazioni</h3>
                <button
                  onClick={() => loadUserBookings(user)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  🔄 Ricarica
                </button>
              </div>

              {loadingBookings ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Caricamento storico...</p>
                </div>
              ) : bookingHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🗂️</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Nessuna prenotazione passata
                  </h4>
                  <p className="text-gray-600">Lo storico delle tue prenotazioni apparirà qui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingHistory.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-75"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg font-semibold text-gray-600">
                              {booking.courtName || `Campo ${booking.courtId}`}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {booking.status === 'confirmed'
                                ? 'Completata'
                                : booking.status === 'cancelled'
                                  ? 'Cancellata'
                                  : booking.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">📅 Data:</span>
                              <br />
                              <span className="text-xs sm:text-sm">
                                {new Date(booking.date).toLocaleDateString('it-IT', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">🕐 Orario:</span>
                              <br />
                              <span className="text-xs sm:text-sm">
                                {booking.time} ({booking.duration}min)
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">💰 Prezzo:</span>
                              <br />
                              <span className="text-xs sm:text-sm">€{booking.price}</span>
                            </div>
                            <div>
                              <span className="font-medium">👥 Giocatori:</span>
                              <br />
                              <span className="text-xs sm:text-sm">
                                {booking.players?.length || 1}
                              </span>
                            </div>
                          </div>
                          {booking.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">📝 Note:</span> {booking.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Notifiche Push */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <NotificationSettings className="shadow-sm" />

            {/* Info aggiuntive sulle notifiche */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">
                    💡 Come funzionano le notifiche
                  </h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>
                      • <strong>Prenotazioni:</strong> Riceverai conferme immediate quando prenoti
                      un campo
                    </p>
                    <p>
                      • <strong>Promemoria:</strong> Ti avvisiamo 30 minuti prima dell'inizio
                      partita
                    </p>
                    <p>
                      • <strong>Tornei:</strong> Aggiornamenti su bracket e risultati dei tornei
                    </p>
                    <p>
                      • <strong>Classifica:</strong> Notifiche quando la tua posizione cambia
                    </p>
                  </div>

                  <div className="mt-4 p-3 bg-white/50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">🔒 Privacy:</span> Le notifiche sono gestite
                      localmente. Nessun dato personale viene condiviso con server esterni.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiche notifiche (se implementato) */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-4">📊 Statistiche Notifiche</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Inviate oggi</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Totali settimana</div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Le statistiche saranno disponibili dopo aver ricevuto le prime notifiche
              </p>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <Extra
            state={state}
            setState={setState}
            derived={derived}
            leagueId={leagueId}
            setLeagueId={setLeagueId}
            clubMode={clubMode}
            setClubMode={setClubMode}
            T={T}
          />
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Attività Recente</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🔑</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Login effettuato</p>
                    <p className="text-sm text-gray-600">
                      {user.metadata?.lastSignInTime
                        ? new Date(user.metadata.lastSignInTime).toLocaleString('it-IT')
                        : 'Data non disponibile'}
                    </p>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Successo</span>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Account creato</p>
                    <p className="text-sm text-gray-600">
                      {user.metadata?.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleString('it-IT')
                        : 'Data non disponibile'}
                    </p>
                  </div>
                  <span className="text-blue-600 text-sm font-medium">Completato</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer con Logout */}
        <div className="flex justify-center pt-6 lg:pt-8 border-t border-gray-200">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full sm:w-auto px-6 lg:px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            🚪 Disconnetti Account
          </button>
        </div>
      </div>

      {/* Modal di conferma logout modernizzato */}
      {showLogoutModal && (
        <Modal
          open={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          title="Conferma Disconnessione"
          T={T}
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Disconnetti Account</h3>
              <p className="text-gray-600">
                Sei sicuro di voler disconnettere il tuo account? Dovrai effettuare nuovamente il
                login per accedere.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 sm:px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors order-2 sm:order-1"
              >
                Annulla
              </button>
              <button
                onClick={handleLogout}
                className="px-4 sm:px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg order-1 sm:order-2"
              >
                Conferma Disconnessione
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Section>
  );
}

export default Profile;
