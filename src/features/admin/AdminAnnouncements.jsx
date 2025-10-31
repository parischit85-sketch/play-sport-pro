// =============================================
// FILE: src/features/admin/AdminAnnouncements.jsx
// Admin panel for sending push notifications to all users
// =============================================
import React, { useState } from 'react';
import { sendAdminAnnouncementPush } from '@/services/push-notifications-integration';
import { db } from '@services/firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '@/utils/logger';
import { themeTokens } from '@lib/theme.js';

export default function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [priority, setPriority] = useState('normal');
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const T = themeTokens();

  const handleSend = async () => {
    if (!title || !message) {
      alert('⚠️ Inserisci titolo e messaggio');
      return;
    }

    const confirmSend = window.confirm(
      `Sei sicuro di voler inviare questo annuncio a tutti gli utenti${targetAudience !== 'all' ? ` (${targetAudience})` : ''}?`
    );

    if (!confirmSend) return;

    setSending(true);
    setLastResult(null);

    try {
      // Save announcement to Firestore
      const announcementRef = await addDoc(collection(db, 'announcements'), {
        title,
        message,
        targetAudience,
        priority,
        createdAt: serverTimestamp(),
        sentBy: 'admin', // TODO: get from auth context
      });

      logger.log('Announcement saved to Firestore:', announcementRef.id);

      // Send push notification to users
      const sentCount = await sendAdminAnnouncementPush({
        id: announcementRef.id,
        title,
        message,
        targetAudience,
        priority,
      });

      setLastResult({
        success: true,
        sentCount,
        message: `✅ Annuncio inviato a ${sentCount} utenti`,
      });

      // Reset form
      setTitle('');
      setMessage('');
      setTargetAudience('all');
      setPriority('normal');
    } catch (error) {
      logger.error('Error sending announcement:', error);
      setLastResult({
        success: false,
        message: `❌ Errore: ${error.message}`,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`${T.cardBg} ${T.border} rounded-xl shadow-lg p-6 max-w-3xl mx-auto`}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${T.text} mb-2 flex items-center gap-2`}>
          <span className="text-3xl">📢</span>
          Invia Annuncio Push
        </h2>
        <p className={`text-sm ${T.subtext}`}>
          Invia una notifica push a tutti gli utenti dell'app
        </p>
      </div>

      {/* Result Banner */}
      {lastResult && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            lastResult.success
              ? 'bg-green-50 bg-green-900/20 border border-green-200 border-green-700/30 text-green-800 text-green-200'
              : 'bg-red-50 bg-red-900/20 border border-red-200 border-red-700/30 text-red-800 text-red-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <p className="font-medium">{lastResult.message}</p>
            <button
              onClick={() => setLastResult(null)}
              className="text-current opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label className={`block font-medium mb-2 ${T.text}`}>
            Titolo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Es: Manutenzione Programmata"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={50}
            className={`w-full px-4 py-3 ${T.border} rounded-lg ${T.input} focus:ring-2 focus:ring-blue-500 transition-all`}
          />
          <p className={`text-xs ${T.subtext} mt-1`}>{title.length}/50 caratteri</p>
        </div>

        {/* Message Input */}
        <div>
          <label className={`block font-medium mb-2 ${T.text}`}>
            Messaggio <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Es: Il campo 2 sarà chiuso domani dalle 14:00 alle 18:00 per manutenzione ordinaria. Grazie per la comprensione."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            rows={5}
            className={`w-full px-4 py-3 ${T.border} rounded-lg ${T.input} focus:ring-2 focus:ring-blue-500 transition-all resize-none`}
          />
          <p className={`text-xs ${T.subtext} mt-1`}>{message.length}/200 caratteri</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Audience */}
          <div>
            <label className={`block font-medium mb-2 ${T.text}`}>Destinatari</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className={`w-full px-4 py-3 ${T.border} rounded-lg ${T.input} focus:ring-2 focus:ring-blue-500 transition-all`}
            >
              <option value="all">👥 Tutti gli Utenti</option>
              <option value="players">🎾 Solo Giocatori</option>
              <option value="instructors">👨‍🏫 Solo Istruttori</option>
              <option value="club_admins">👔 Solo Admin Club</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className={`block font-medium mb-2 ${T.text}`}>Priorità</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={`w-full px-4 py-3 ${T.border} rounded-lg ${T.input} focus:ring-2 focus:ring-blue-500 transition-all`}
            >
              <option value="normal">📝 Normale</option>
              <option value="high">⚠️ Alta (richiede interazione)</option>
            </select>
            {priority === 'high' && (
              <p className={`text-xs ${T.subtext} mt-1`}>
                Le notifiche ad alta priorità richiedono l'interazione dell'utente
              </p>
            )}
          </div>
        </div>

        {/* Preview Box */}
        {(title || message) && (
          <div className="bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-700/30 rounded-lg p-4">
            <p className={`text-xs font-medium ${T.subtext} mb-2`}>ANTEPRIMA NOTIFICA:</p>
            <div className="bg-white bg-gray-800 rounded-lg p-4 shadow-md max-w-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                  📢
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-white text-sm mb-1">
                    {title || 'Titolo annuncio...'}
                  </p>
                  <p className="text-gray-600 text-gray-400 text-xs">
                    {message || 'Messaggio annuncio...'}
                  </p>
                  <p className="text-gray-400 text-gray-600 text-xs mt-2">Adesso</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending || !title || !message}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-md ${
            sending || !title || !message
              ? 'bg-gray-300 bg-gray-700 text-gray-500 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-[1.02]'
          }`}
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Invio in corso...
            </span>
          ) : (
            '🚀 Invia a Tutti gli Utenti'
          )}
        </button>

        {/* Warning */}
        <div className="bg-yellow-50 bg-yellow-900/20 border border-yellow-200 border-yellow-700/30 rounded-lg p-3">
          <p className="text-xs text-yellow-800 text-yellow-200">
            ⚠️ <strong>Attenzione:</strong> Le notifiche verranno inviate in batch di 10 utenti alla
            volta. L'operazione potrebbe richiedere alcuni secondi per completarsi.
          </p>
        </div>
      </div>
    </div>
  );
}
