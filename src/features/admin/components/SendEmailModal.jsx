// =============================================
// FILE: src/features/admin/components/SendEmailModal.jsx
// Modal per invio email personalizzate ai giocatori
// =============================================

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '@contexts/AuthContext';

export default function SendEmailModal({ 
  clubId, 
  selectedPlayers = [], 
  onClose, 
  onSuccess 
}) {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isHTML, setIsHTML] = useState(false);
  const [replyTo, setReplyTo] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // 🧪 Test rapido
  async function handleQuickTest() {
    if (!user?.email) {
      alert('⚠️ Devi essere autenticato per testare');
      return;
    }

    setSubject('🧪 Test email da callable');
    setBody('Questa è una email di test inviata dal callable sendClubEmail.\n\nSe la ricevi, il sistema funziona correttamente!');
    setIsHTML(false);

    // Simula invio a te stesso
    setSending(true);
    setResult(null);

    try {
      const functions = getFunctions();
      const sendEmail = httpsCallable(functions, 'sendClubEmail');

      console.log('🧪 [TEST] Sending test email to:', user.email);

      const payload = {
        clubId: 'sporting-cat', // Club ID corretto
        recipients: [{
          email: user.email,
          name: user.displayName || 'Test User',
        }],
        subject: '🧪 Test email da callable',
        body: 'Questa è una email di test inviata dal callable sendClubEmail.\n\nSe la ricevi, il sistema funziona correttamente!',
        isHTML: false,
      };

      console.log('🧪 [TEST] Payload:', JSON.stringify(payload, null, 2));

      const response = await sendEmail(payload);

      console.log('✅ [TEST] Response:', response.data);
      console.log('✅ [TEST] Full response:', JSON.stringify(response, null, 2));
      setResult(response.data);
    } catch (error) {
      console.error('❌ [TEST] Error:', error);

      let userMessage = error.message;

      // Messaggi più chiari per errori comuni
      if (error.message.includes('No email service configured')) {
        userMessage =
          'Le credenziali email non sono configurate in Firebase. Configura EMAIL_USER, EMAIL_PASSWORD o SENDGRID_API_KEY nei secrets di Firebase.';
      } else if (error.message.includes('Failed to send')) {
        userMessage =
          "Errore durante l'invio email. Verifica le credenziali email in Firebase Functions secrets.";
      } else if (error.message.includes('permission')) {
        userMessage = 'Non hai i permessi admin per questo club.';
      }

      setResult({
        success: false,
        sent: 0,
        failed: 1,
        error: userMessage,
        details: [
          {
            success: false,
            email: user.email,
            name: user.displayName || 'Test User',
            error: userMessage,
          },
        ],
      });
    } finally {
      setSending(false);
    }
  };
  async function handleSend() {
    if (!subject || !body) {
      alert('Oggetto e messaggio sono obbligatori');
      return;
    }

    if (selectedPlayers.length === 0) {
      alert('Seleziona almeno un destinatario');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const functions = getFunctions();
      const sendEmail = httpsCallable(functions, 'sendClubEmail');

      console.log('📧 [SendEmailModal] Sending email to:', selectedPlayers.length, 'players');

      const response = await sendEmail({
        clubId,
        recipients: selectedPlayers.map(p => ({
          email: p.email,
          name: p.name || p.displayName || 'Giocatore',
        })),
        subject,
        body,
        isHTML,
        replyTo: replyTo || undefined,
      });

      console.log('✅ [SendEmailModal] Response:', response.data);

      setResult(response.data);

      if (response.data.success) {
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('❌ [SendEmailModal] Error:', error);
      setResult({
        success: false,
        sent: 0,
        failed: selectedPlayers.length,
        error: error.message,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            📧 Invia Email ai Giocatori
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Chiudi"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Test Rapido Button */}
        <button
          onClick={handleQuickTest}
          disabled={sending}
          className="mb-4 w-full px-4 py-2 border-2 border-orange-500 rounded-lg bg-orange-500 bg-opacity-10 text-orange-400 hover:bg-opacity-20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
          title="Invia un'email di test a te stesso per verificare il funzionamento"
        >
          🧪 Test Rapido - Invia a me stesso
        </button>

        {/* Recipients */}
        <div className="mb-4">
          <div className="text-white font-semibold mb-2">
            Destinatari ({selectedPlayers.length})
          </div>
          <div className="max-h-32 overflow-auto bg-gray-900 p-3 rounded-lg border border-gray-700">
            {selectedPlayers.map((player, i) => (
              <div key={i} className="text-gray-300 text-sm py-1">
                • {player.name || player.displayName} ({player.email})
              </div>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">
            Oggetto *
          </label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Es: Aggiornamento orari allenamento"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            disabled={sending}
          />
        </div>

        {/* Body */}
        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">
            Messaggio *
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={isHTML 
              ? '<p>Il tuo messaggio in HTML...</p>' 
              : 'Il tuo messaggio...'
            }
            rows={8}
            className={`w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none ${isHTML ? 'font-mono text-sm' : ''}`}
            disabled={sending}
          />
        </div>

        {/* HTML Toggle */}
        <div className="mb-4">
          <label className="flex items-center cursor-pointer text-gray-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={isHTML}
              onChange={e => setIsHTML(e.target.checked)}
              disabled={sending}
              className="mr-2 w-4 h-4 accent-blue-600"
            />
            <span>Usa formato HTML (avanzato)</span>
          </label>
        </div>

        {/* Reply To */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-2">
            Email di risposta (opzionale)
          </label>
          <input
            type="email"
            value={replyTo}
            onChange={e => setReplyTo(e.target.value)}
            placeholder="Es: info@tuoclub.it"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            disabled={sending}
          />
          <small className="text-gray-400 text-xs mt-1 block">
            Se non specificata, verrà usata l'email di contatto del club
          </small>
        </div>

        {/* Result */}
        {result && (
          <div className={`p-4 rounded-lg mb-6 border ${
            result.success 
              ? 'bg-green-900 bg-opacity-30 border-green-600 text-green-300' 
              : 'bg-red-900 bg-opacity-30 border-red-600 text-red-300'
          }`}>
            {result.success ? (
              <>
                <div className="font-bold text-lg">✅ Email inviate con successo!</div>
                <div className="text-sm mt-2">
                  Inviate: {result.sent} | Fallite: {result.failed}
                </div>
              </>
            ) : (
              <>
                <div className="font-bold text-lg">❌ Errore durante l'invio</div>
                <div className="text-sm mt-2">
                  {result.error || 'Riprova più tardi'}
                </div>
              </>
            )}

            {/* Details */}
            {result.details && result.details.length > 0 && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-semibold hover:text-white">Dettagli invio</summary>
                <div className="mt-2 max-h-40 overflow-auto">
                  {result.details.map((detail, i) => (
                    <div key={i} className="py-2 border-b border-gray-700 last:border-0">
                      {detail.success ? '✅' : '❌'} {detail.name} ({detail.email})
                      {!detail.success && <div className="text-xs mt-1 text-red-400">• {detail.error}</div>}
                      {detail.success && detail.provider && (
                        <div className="text-xs mt-1 text-green-400">• Via {detail.provider} (tentativo {detail.attempt})</div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-6 py-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Annulla
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject || !body}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Invio in corso...
              </span>
            ) : (
              `Invia a ${selectedPlayers.length} ${selectedPlayers.length === 1 ? 'giocatore' : 'giocatori'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
