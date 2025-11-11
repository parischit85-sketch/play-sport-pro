// =============================================
// FILE: src/features/admin/components/AdminPushPanel.jsx
// Panel Admin per gestione Push Notifications
// =============================================

import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../services/firebase';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../hooks/useAuth';

export default function AdminPushPanel({ T }) {
  const { user } = useAuth();
  const [message, setMessage] = useState({
    title: '',
    body: '',
    category: 'general',
    priority: 'normal',
    targetType: 'all',
  });

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({
    activeDevices: 0,
    totalSent: 0,
    loading: true,
  });

  // Carica statistiche dispositivi attivi
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const subscriptionsRef = collection(db, 'pushSubscriptions');
      
      // Conta dispositivi attivi (non scaduti)
      const activeQuery = query(
        subscriptionsRef,
        where('isActive', '==', true)
      );
      
      const activeSnapshot = await getCountFromServer(activeQuery);
      
      setStats({
        activeDevices: activeSnapshot.data().count,
        totalSent: 0, // TODO: Caricare da notificationEvents
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSendPush = async () => {
    if (!message.title || !message.body) {
      alert('⚠️ Inserisci titolo e messaggio');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      console.log('📤 Sending push notification...', message);

      const sendBulkNotif = httpsCallable(functions, 'sendBulkCertificateNotifications');

      const response = await sendBulkNotif({
        targetUserIds: [], // Empty = tutti gli utenti
        notificationType: 'push',
        title: message.title,
        body: message.body,
        data: {
          category: message.category,
          priority: message.priority,
          url: getCategoryUrl(message.category),
        },
      });

      setResult({
        success: true,
        data: response.data,
      });

      console.log('✅ Push notification sent:', response.data);

      // Reset form
      setMessage({
        title: '',
        body: '',
        category: 'general',
        priority: 'normal',
        targetType: 'all',
      });

      // Ricarica stats
      setTimeout(loadStats, 1000);
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      });
      console.error('❌ Push notification failed:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTestPush = async () => {
    setSending(true);
    setResult(null);

    try {
      const sendBulkNotif = httpsCallable(functions, 'sendBulkCertificateNotifications');

      // Invia solo all'utente corrente
      const response = await sendBulkNotif({
        targetUserIds: [user.uid],
        notificationType: 'push',
        title: '🧪 Test Push Notification',
        body: 'Questo è un test! Se vedi questa notifica, il sistema funziona perfettamente.',
        data: {
          category: 'general',
          priority: 'normal',
          url: '/dashboard',
        },
      });

      setResult({
        success: true,
        message: 'Test push inviato al tuo dispositivo! Controlla le notifiche.',
        data: response.data,
      });

      console.log('✅ Test push sent:', response.data);
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      });
      console.error('❌ Test push failed:', error);
    } finally {
      setSending(false);
    }
  };

  const getCategoryUrl = (category) => {
    const urls = {
      general: '/dashboard',
      booking: '/bookings',
      match: '/matches',
      certificate: '/certificati',
      tournament: '/tornei',
    };
    return urls[category] || '/dashboard';
  };

  const templateMessages = [
    {
      title: '🎾 Nuovo Torneo Disponibile',
      body: 'È appena iniziato un nuovo torneo! Iscriviti subito per partecipare.',
      category: 'tournament',
    },
    {
      title: '⏰ Promemoria Prenotazione',
      body: 'La tua prenotazione è domani! Non dimenticarti di presentarti in campo.',
      category: 'booking',
    },
    {
      title: '🏆 Classifica Aggiornata',
      body: 'La classifica è stata aggiornata! Scopri la tua nuova posizione.',
      category: 'general',
    },
    {
      title: '📋 Certificato in Scadenza',
      body: 'Il tuo certificato medico scade tra 7 giorni. Rinnovalo subito!',
      category: 'certificate',
    },
  ];

  const applyTemplate = (template) => {
    setMessage((prev) => ({
      ...prev,
      title: template.title,
      body: template.body,
      category: template.category,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${T.text} flex items-center gap-2`}>
              🔔 Push Notifications
            </h2>
            <p className={`text-sm ${T.subtext} mt-1`}>
              Invia notifiche push a tutti i giocatori registrati
            </p>
          </div>
          <button
            onClick={handleTestPush}
            disabled={sending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? '⏳ Invio...' : '🧪 Test Push'}
          </button>
        </div>

        {/* Statistiche rapide */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`${T.cardBg} ${T.border} rounded-lg p-4 text-center`}>
            <div className="text-3xl font-bold text-blue-400">
              {stats.loading ? '...' : stats.activeDevices}
            </div>
            <div className={`text-xs ${T.subtext} mt-1`}>Dispositivi Attivi</div>
          </div>
          <div className={`${T.cardBg} ${T.border} rounded-lg p-4 text-center`}>
            <div className="text-3xl font-bold text-green-400">
              {stats.loading ? '...' : stats.totalSent}
            </div>
            <div className={`text-xs ${T.subtext} mt-1`}>Push Inviate</div>
          </div>
          <div className={`${T.cardBg} ${T.border} rounded-lg p-4 text-center`}>
            <div className="text-3xl font-bold text-orange-400">--</div>
            <div className={`text-xs ${T.subtext} mt-1`}>Tasso Apertura</div>
          </div>
        </div>
      </div>

      {/* Form invio push */}
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold ${T.text} mb-4`}>✉️ Nuova Notifica Push</h3>

        <div className="space-y-4">
          {/* Templates rapidi */}
          <div>
            <label className={`block text-sm font-medium ${T.text} mb-2`}>
              Template Rapidi
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templateMessages.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => applyTemplate(template)}
                  className={`${T.btnSecondary} text-left text-xs py-2 px-3`}
                >
                  {template.title.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>

          {/* Titolo */}
          <div>
            <label className={`block text-sm font-medium ${T.text} mb-2`}>Titolo *</label>
            <input
              type="text"
              value={message.title}
              onChange={(e) => setMessage((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Es: Nuovo torneo disponibile!"
              maxLength={50}
              className={`${T.input} w-full`}
            />
            <p className={`text-xs ${T.subtext} mt-1`}>{message.title.length}/50 caratteri</p>
          </div>

          {/* Messaggio */}
          <div>
            <label className={`block text-sm font-medium ${T.text} mb-2`}>Messaggio *</label>
            <textarea
              value={message.body}
              onChange={(e) => setMessage((prev) => ({ ...prev, body: e.target.value }))}
              placeholder="Es: Iscriviti al torneo di tennis di questo weekend!"
              rows={4}
              maxLength={200}
              className={`${T.input} w-full`}
            />
            <p className={`text-xs ${T.subtext} mt-1`}>{message.body.length}/200 caratteri</p>
          </div>

          {/* Categoria e Priorità */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-2`}>Categoria</label>
              <select
                value={message.category}
                onChange={(e) => setMessage((prev) => ({ ...prev, category: e.target.value }))}
                className={`${T.input} w-full`}
              >
                <option value="general">🔔 Generale</option>
                <option value="booking">📅 Prenotazione</option>
                <option value="match">⚽ Partita</option>
                <option value="certificate">📋 Certificato</option>
                <option value="tournament">🏆 Torneo</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${T.text} mb-2`}>Priorità</label>
              <select
                value={message.priority}
                onChange={(e) => setMessage((prev) => ({ ...prev, priority: e.target.value }))}
                className={`${T.input} w-full`}
              >
                <option value="low">🟢 Bassa</option>
                <option value="normal">🟡 Normale</option>
                <option value="high">🔴 Alta</option>
              </select>
            </div>
          </div>

          {/* Pulsante invio */}
          <button
            onClick={handleSendPush}
            disabled={sending || !message.title || !message.body}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? '⏳ Invio in corso...' : '📤 Invia Push Notification a Tutti'}
          </button>
        </div>

        {/* Risultato */}
        {result && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              result.success
                ? 'bg-green-900/20 border border-green-500'
                : 'bg-red-900/20 border border-red-500'
            }`}
          >
            {result.success ? (
              <div>
                <p className="text-green-200 font-medium">
                  ✅ {result.message || 'Push notification inviata con successo!'}
                </p>
                {result.data && (
                  <p className="text-green-300 text-sm mt-1">
                    Inviate: {result.data.sent || 0} | Fallite: {result.data.failed || 0}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-red-200">❌ Errore: {result.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Info e aiuto */}
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold ${T.text} mb-3`}>ℹ️ Come Funzionano le Push</h3>
        <ul className={`space-y-2 text-sm ${T.subtext}`}>
          <li>• Gli utenti devono attivare le notifiche dalla loro app</li>
          <li>• Le push vengono inviate solo ai dispositivi con permessi attivi</li>
          <li>• Se la push fallisce, viene inviata una email automaticamente</li>
          <li>• Usa "Test Push" per verificare che tutto funzioni sul tuo dispositivo</li>
          <li>• Le notifiche ad alta priorità richiedono interazione dell'utente</li>
        </ul>
      </div>
    </div>
  );
}
