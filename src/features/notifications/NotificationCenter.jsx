// =============================================
// FILE: src/features/notifications/NotificationCenter.jsx
// Centro notifiche in-app per utenti
// =============================================
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@contexts/AuthContext';
import { useNotifications } from '@contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { themeTokens } from '@lib/theme';

// Stili CSS per animazioni e scrollbar personalizzata
const customStyles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scale-in {
    from { 
      opacity: 0;
      transform: scale(0.95);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  
  .animate-scale-in {
    animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.3);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.5);
  }
`;

// Inietta gli stili
if (typeof document !== 'undefined' && !document.getElementById('notification-center-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'notification-center-styles';
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

export default function NotificationCenter({ T, onClose }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'certificate' | 'booking'
  const [expanded, setExpanded] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [clubName, setClubName] = useState(null);
  const [clubLogo, setClubLogo] = useState(null);
  const [clubPhone, setClubPhone] = useState(null);

  const functions = getFunctions();
  const db = getFirestore();

  // Se non c'è T, usa themeTokens
  const themeT = T || themeTokens();

  // Carica notifiche
  const loadNotifications = useCallback(async () => {
    console.log('🔔 [NotificationCenter] loadNotifications called', {
      user: user?.uid,
      filter,
    });

    if (!user) {
      console.log('⚠️ [NotificationCenter] No user, skipping load');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const getNotifications = httpsCallable(functions, 'getUserNotifications');

      const params = {
        limit: 50,
        unreadOnly: filter === 'unread',
        type: filter === 'certificate' || filter === 'booking' ? filter : null,
      };

      console.log('📡 [NotificationCenter] Calling getUserNotifications with:', params);
      const result = await getNotifications(params);
      console.log('✅ [NotificationCenter] Got response:', {
        notificationsCount: result.data.notifications?.length || 0,
        unreadCount: result.data.unreadCount || 0,
        rawData: result.data,
      });

      setNotifications(result.data.notifications || []);
      setUnreadCount(result.data.unreadCount || 0);
    } catch (error) {
      console.error('❌ [NotificationCenter] Error loading:', error);
      console.error('❌ [NotificationCenter] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      showError('Errore nel caricamento delle notifiche');
    } finally {
      setLoading(false);
    }
  }, [user, filter, functions, showError]);

  // Carica al mount e quando cambia filtro
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Marca come letta
  const markAsRead = async (notificationId) => {
    try {
      const markRead = httpsCallable(functions, 'markNotificationsAsRead');
      await markRead({ notificationIds: [notificationId] });

      // Aggiorna UI
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[NotificationCenter] Error marking as read:', error);
    }
  };

  // Marca tutte come lette
  const markAllAsRead = async () => {
    try {
      const markRead = httpsCallable(functions, 'markNotificationsAsRead');
      await markRead({ markAll: true });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      showSuccess('Tutte le notifiche sono state contrassegnate come lette');
    } catch (error) {
      console.error('[NotificationCenter] Error marking all as read:', error);
      showError("Errore durante l'operazione");
    }
  };

  // Archivia notifica
  const archiveNotification = async (notificationId) => {
    try {
      const archive = httpsCallable(functions, 'archiveNotifications');
      await archive({ notificationIds: [notificationId], archive: true });

      // Rimuovi dalla vista
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      showSuccess('Notifica archiviata');
    } catch (error) {
      console.error('[NotificationCenter] Error archiving:', error);
      showError("Errore durante l'archiviazione");
    }
  };

  // Cancella notifica
  const deleteNotification = async (notificationId) => {
    try {
      const archive = httpsCallable(functions, 'archiveNotifications');
      await archive({
        notificationIds: [notificationId],
        deleteNotifications: true,
      });

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      showSuccess('Notifica eliminata');
    } catch (error) {
      console.error('[NotificationCenter] Error deleting:', error);
      showError("Errore durante l'eliminazione");
    }
  };

  // Gestisce il click sulla notifica
  const handleNotificationClick = async (notification) => {
    console.log('🔔 [NotificationCenter] Notification clicked:', notification);

    // Marca come letta se non lo è già
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Carica il nome e logo del club se presente
    if (notification.metadata?.clubId) {
      try {
        const clubRef = doc(db, 'clubs', notification.metadata.clubId);
        const clubSnap = await getDoc(clubRef);
        if (clubSnap.exists()) {
        const clubData = clubSnap.data();
        setClubName(clubData.name || notification.metadata.clubId);
        // Prova sia 'logoUrl' che 'logo' per compatibilità
        setClubLogo(clubData.logoUrl || clubData.logo || null);
        // Priorità: whatsappNumber > phone > phoneNumber
        setClubPhone(clubData.whatsappNumber || clubData.phone || clubData.phoneNumber || null);
        console.log('✅ Club data loaded:', {
          name: clubData.name,
          logo: clubData.logoUrl || clubData.logo,
          whatsapp: clubData.whatsappNumber,
          phone: clubData.phone || clubData.phoneNumber,
          allData: clubData,
        });
      } else {
          setClubName(notification.metadata.clubId);
          setClubLogo(null);
        }
      } catch (error) {
        console.error('Error loading club data:', error);
        setClubName(notification.metadata.clubId);
        setClubLogo(null);
      }
    } else {
      setClubName(null);
      setClubLogo(null);
    }

    // Apri il popup con i dettagli
    setSelectedNotification(notification);
  };

  // Chiudi popup
  const closeNotificationPopup = () => {
    setSelectedNotification(null);
    setClubName(null);
    setClubLogo(null);
    setClubPhone(null);
  };

  // Azione dal popup (vai all'URL o apri WhatsApp)
  const handleNotificationAction = () => {
    // Per notifiche certificato, apri WhatsApp
    if (selectedNotification?.type === 'certificate' && clubPhone) {
      const phoneNumber = clubPhone.replace(/[^0-9+]/g, ''); // Rimuove spazi e caratteri speciali
      const message = encodeURIComponent(`Ciao! Ti contatto riguardo al certificato medico.`);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      console.log('📱 [NotificationCenter] Opening WhatsApp:', whatsappUrl);
      window.open(whatsappUrl, '_blank');
      closeNotificationPopup();
      return;
    }
    
    // Per altre notifiche, vai all'URL
    if (selectedNotification?.actionUrl) {
      console.log('📡 [NotificationCenter] Navigating to:', selectedNotification.actionUrl);
      navigate(selectedNotification.actionUrl);
      closeNotificationPopup();
    }
  };

  // Icona per tipo notifica
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'certificate':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
            <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        );
      case 'booking':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'tournament':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        );
    }
  };

  // Colore per tipo/priorità
  const getNotificationColor = (type, priority) => {
    if (priority === 'urgent') return 'bg-red-500/20 text-red-400';
    if (priority === 'high') return 'bg-orange-500/20 text-orange-400';

    switch (type) {
      case 'certificate':
        return 'bg-blue-500/20 text-blue-400';
      case 'booking':
        return 'bg-green-500/20 text-green-400';
      case 'tournament':
        return 'bg-purple-500/20 text-purple-400';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'success':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Formatta data
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';

    let date;
    if (dateValue._seconds) {
      date = new Date(dateValue._seconds * 1000);
    } else if (dateValue.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else {
      date = new Date(dateValue);
    }

    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Ora';
      if (diffMins < 60) return `${diffMins} min fa`;
      return `${Math.floor(diffHours)} ore fa`;
    }

    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filters = [
    { key: 'all', label: 'Tutte' },
    { key: 'unread', label: 'Non lette' },
    { key: 'certificate', label: 'Certificati' },
    { key: 'booking', label: 'Prenotazioni' },
  ];

  if (!user) return null;

  return (
    <div className={`rounded-2xl ${themeT.card} overflow-hidden shadow-2xl border-2 ${themeT.border} bg-gradient-to-br from-gray-800/95 via-gray-850/95 to-gray-900/95 backdrop-blur-sm`}>
      {/* Barra decorativa superiore con gradiente */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      {/* Header */}
      <div
        className={`px-4 py-3 flex items-center justify-between cursor-pointer bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent ${themeT.cardHover}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h2 className={`text-lg font-bold ${themeT.text} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>Notifiche</h2>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-400">{unreadCount} non {unreadCount === 1 ? 'letta' : 'lette'}</span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={`p-1 rounded transition-colors ${themeT.hoverBg}`}
        >
          <svg
            className={`w-5 h-5 ${themeT.text} transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Contenuto espandibile */}
      {expanded && (
        <>
          {/* Filtri */}
          <div className={`px-4 py-3 border-t ${themeT.border} flex gap-2 flex-wrap`}>
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-blue-500 text-white shadow-lg'
                    : `${themeT.bg} ${themeT.text} hover:bg-blue-500/20`
                }`}
              >
                {f.label}
              </button>
            ))}

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
              >
                Segna tutte come lette
              </button>
            )}
          </div>

          {/* Lista notifiche */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className={`mt-2 text-sm ${themeT.subtext}`}>Caricamento...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-600 mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <p className={`text-sm ${themeT.subtext}`}>
                  {filter === 'unread' ? 'Nessuna notifica non letta' : 'Nessuna notifica'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors ${!notification.read ? 'bg-blue-500/5' : ''}`}
                  >
                    <div className="flex gap-3">
                      {/* Icona */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationColor(
                          notification.type,
                          notification.priority
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Contenuto - Cliccabile */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <h3 className={`font-semibold ${themeT.text} ${!notification.read ? 'font-bold' : ''}`}>
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </h3>
                        <p className={`text-sm mt-1 ${themeT.subtext}`}>{notification.body}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
                      </div>

                      {/* Azioni */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Segna come letta"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveNotification(notification.id);
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Archivia"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                            <path
                              fillRule="evenodd"
                              d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          title="Elimina"
                        >
                          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Popup dettaglio notifica - Ultra Modern Full Screen */}
      {selectedNotification && createPortal(
        <div
          className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-[9999] animate-fade-in overflow-y-auto flex items-start justify-center p-4 md:p-8 pt-12 md:pt-16"
          onClick={closeNotificationPopup}
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
          }}
        >
          <div
            className="relative w-full max-w-4xl bg-gradient-to-br from-gray-800/95 via-gray-850/95 to-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bordo decorativo superiore con gradiente */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            {/* Pulsante chiudi premium - posizionato in alto a destra assoluto */}
            <button
              onClick={closeNotificationPopup}
              className="absolute top-5 right-5 z-10 p-2.5 rounded-full bg-gradient-to-br from-red-500/10 to-red-600/20 hover:from-red-500/20 hover:to-red-600/30 border-2 border-red-500/40 transition-all hover:scale-110 active:scale-95 shadow-xl shadow-red-500/20 backdrop-blur-sm"
              title="Chiudi"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Pattern decorativo superiore */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>
            <div className="absolute top-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            {/* Header compatto con layout ottimizzato */}
            <div
              className={`relative px-6 py-5 border-b border-white/10 ${
                selectedNotification.priority === 'urgent'
                  ? 'bg-gradient-to-br from-red-500/15 via-red-400/8 to-transparent'
                  : selectedNotification.priority === 'high'
                    ? 'bg-gradient-to-br from-orange-500/15 via-orange-400/8 to-transparent'
                    : 'bg-gradient-to-br from-blue-500/15 via-purple-500/8 to-transparent'
              }`}
            >
              {/* Pattern decorativo header */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
              }}></div>
              
              <div className="relative">
                {/* Riga 1: Badge priorità in alto al centro */}
                {selectedNotification.priority && selectedNotification.priority !== 'normal' && (
                  <div className="flex justify-center mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-sm ${
                        selectedNotification.priority === 'urgent'
                          ? 'bg-red-500/30 text-red-300 border border-red-500/50 shadow-lg shadow-red-500/20'
                          : 'bg-orange-500/30 text-orange-300 border border-orange-500/50 shadow-lg shadow-orange-500/20'
                      }`}
                    >
                      {selectedNotification.priority === 'urgent' ? '🔴 URGENTE' : '⚠️ PRIORITÀ ALTA'}
                    </span>
                  </div>
                )}
                
                {/* Riga 2: Logo + Nome club */}
                {(clubLogo || clubName) && (
                  <div className="flex items-center gap-3 mb-4">
                    {clubLogo && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg border border-white/20 bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0 p-1.5">
                        <img
                          src={clubLogo}
                          alt={clubName || 'Logo circolo'}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.error('❌ Error loading logo:', clubLogo);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {clubName && (
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Inviato da</span>
                        <h4 className="text-base font-bold text-white">{clubName}</h4>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Riga 3: Icona + Titolo + Data */}
                <div className="flex items-start gap-3">
                  {/* Icona tipo notifica */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg transform transition-all hover:scale-105 ${
                      getNotificationColor(selectedNotification.type, selectedNotification.priority)
                    } ring-1 ring-white/10`}
                  >
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  
                  {/* Titolo e metadata */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white leading-tight mb-1.5">
                      {selectedNotification.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">
                        {new Date(selectedNotification.createdAt).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}{' '}
                        - {new Date(selectedNotification.createdAt).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Corpo messaggio - Design card con glassmorphism */}
            <div className="p-8 md:p-12 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-xl leading-relaxed text-gray-200 whitespace-pre-wrap">
                  {selectedNotification.body}
                </p>
              </div>
            </div>

            {/* Footer azioni - Ultra modern */}
            <div className="px-8 py-6 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent backdrop-blur-sm">
              <div className="flex gap-3">
                {/* Bottone primario: WhatsApp per certificati, altrimenti vai ai dettagli */}
                {(selectedNotification.type === 'certificate' && clubPhone) || selectedNotification.actionUrl ? (
                  <button
                    onClick={handleNotificationAction}
                    className={`flex-1 group relative px-6 py-4 text-white rounded-2xl font-bold text-lg shadow-2xl transform hover:scale-[1.02] active:scale-95 transition-all overflow-hidden ${
                      selectedNotification.type === 'certificate'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/40 hover:shadow-green-500/60'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/40 hover:shadow-blue-500/60'
                    }`}
                  >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                      selectedNotification.type === 'certificate'
                        ? 'bg-gradient-to-r from-green-400 to-green-500'
                        : 'bg-gradient-to-r from-blue-400 to-purple-500'
                    }`}></div>
                    <span className="relative flex items-center justify-center gap-3">
                      {selectedNotification.type === 'certificate' ? (
                        <>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          Contatta Circolo
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                          Vai ai dettagli
                        </>
                      )}
                    </span>
                  </button>
                ) : null}
                <button
                  onClick={closeNotificationPopup}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-lg border border-white/20 hover:border-white/40 transform hover:scale-[1.02] active:scale-95 transition-all backdrop-blur-sm"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

