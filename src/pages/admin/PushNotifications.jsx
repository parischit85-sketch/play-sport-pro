/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, functions } from '../../services/firebase.js';
import { collection, query, orderBy, limit, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  Bell,
  Send,
  Users,
  Building2,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

const PushNotifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [notification, setNotification] = useState({
    title: '',
    body: '',
    targetType: 'all', // all, club
    targetClubId: '',
    url: '',
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load clubs for targeting
      const clubsSnap = await getDocs(collection(db, 'clubs'));
      setClubs(
        clubsSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.id,
        }))
      );

      // Load notification history
      const historyQuery = query(
        collection(db, 'notification_history'),
        orderBy('sentAt', 'desc'),
        limit(20)
      );
      const historySnap = await getDocs(historyQuery);
      setHistory(
        historySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    } catch (error) {
      console.error('Errore caricamento dati:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();

    if (!notification.title || !notification.body) {
      setResult({
        success: false,
        message: 'Titolo e messaggio sono obbligatori',
      });
      return;
    }

    if (!window.confirm('Confermi di voler inviare questa notifica?')) {
      return;
    }

    try {
      setSending(true);
      setResult(null);

      // Call Cloud Function to send push notification
      const sendPushNotification = httpsCallable(functions, 'sendBulkPushNotification');
      const response = await sendPushNotification({
        title: notification.title,
        body: notification.body,
        targetType: notification.targetType,
        targetClubId: notification.targetType === 'club' ? notification.targetClubId : null,
        url: notification.url || null,
      });

      // Save to history
      await addDoc(collection(db, 'notification_history'), {
        title: notification.title,
        body: notification.body,
        targetType: notification.targetType,
        targetClubId: notification.targetType === 'club' ? notification.targetClubId : null,
        url: notification.url || null,
        sentAt: Timestamp.now(),
        sentBy: 'admin', // TODO: get current user
        recipientsCount: response.data?.recipientsCount || 0,
        successCount: response.data?.successCount || 0,
        failureCount: response.data?.failureCount || 0,
      });

      setResult({
        success: true,
        message: `Notifica inviata con successo a ${response.data?.successCount || 0} utenti`,
      });

      // Reset form
      setNotification({
        title: '',
        body: '',
        targetType: 'all',
        targetClubId: '',
        url: '',
      });

      // Reload history
      loadData();
    } catch (error) {
      console.error('Errore invio notifica:', error);
      setResult({
        success: false,
        message: error.message || 'Errore durante l\'invio della notifica',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Bell className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Push Notifications</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Notification Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Invia Notifica</h2>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titolo *
                </label>
                <input
                  type="text"
                  value={notification.title}
                  onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                  placeholder="Nuovo torneo disponibile!"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{notification.title.length}/50 caratteri</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Messaggio *
                </label>
                <textarea
                  value={notification.body}
                  onChange={(e) => setNotification({ ...notification, body: e.target.value })}
                  placeholder="Iscriviti ora al torneo di padel..."
                  rows={4}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{notification.body.length}/200 caratteri</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destinatari
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="all"
                      checked={notification.targetType === 'all'}
                      onChange={(e) => setNotification({ ...notification, targetType: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Tutti gli utenti</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="club"
                      checked={notification.targetType === 'club'}
                      onChange={(e) => setNotification({ ...notification, targetType: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Utenti di un circolo specifico</span>
                  </label>
                </div>
              </div>

              {notification.targetType === 'club' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleziona Circolo
                  </label>
                  <select
                    value={notification.targetClubId}
                    onChange={(e) => setNotification({ ...notification, targetClubId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleziona un circolo</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL (opzionale)
                </label>
                <input
                  type="url"
                  value={notification.url}
                  onChange={(e) => setNotification({ ...notification, url: e.target.value })}
                  placeholder="https://app.playsport.com/tournaments/123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL da aprire quando l'utente clicca sulla notifica
                </p>
              </div>

              {result && (
                <div
                  className={`p-4 rounded-lg flex items-start space-x-3 ${
                    result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{result.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Invio in corso...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Invia Notifica</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Invii</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Inviate Oggi</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {history.filter((h) => {
                          const today = new Date().toDateString();
                          return new Date(h.sentAt?.toDate()).toDateString() === today;
                        }).length}
                      </p>
                    </div>
                    <Send className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Successi</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {history.reduce((sum, h) => sum + (h.successCount || 0), 0)}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Totale Inviate</p>
                      <p className="text-2xl font-bold text-orange-900 mt-1">{history.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Utenti Raggiunti</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {history.reduce((sum, h) => sum + (h.recipientsCount || 0), 0)}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifiche Recenti</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessuna notifica inviata</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.body}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>
                              {item.sentAt?.toDate
                                ? new Date(item.sentAt.toDate()).toLocaleString('it-IT')
                                : 'N/A'}
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{item.recipientsCount || 0} destinatari</span>
                            </span>
                            {item.targetType === 'club' && (
                              <span className="flex items-center space-x-1">
                                <Building2 className="w-3 h-3" />
                                <span>{item.targetClubId}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-sm font-medium text-green-600">
                            ✓ {item.successCount || 0}
                          </div>
                          {(item.failureCount || 0) > 0 && (
                            <div className="text-sm font-medium text-red-600">
                              ✗ {item.failureCount}
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
        </div>
      </main>
    </div>
  );
};

export default PushNotifications;
