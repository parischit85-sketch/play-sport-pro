// =============================================
// FILE: src/components/registration/EmailVerificationFlow.jsx
// Email verification component with resend functionality
// =============================================
import React, { useState, useEffect } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@contexts/AuthContext.jsx';
import { isEmailVerified } from '@services/auth.jsx';

export default function EmailVerificationFlow() {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState(null);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendVerification = async () => {
    if (!user || isSending || resendCooldown > 0) return;

    setIsSending(true);
    setMessage(null);

    try {
      await sendEmailVerification(user, {
        url: window.location.origin + '/dashboard',
        handleCodeInApp: false,
      });

      setMessage({
        type: 'success',
        text: 'Email di verifica inviata! Controlla la tua casella di posta.',
      });
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error) {
      console.error('Error sending verification email:', error);

      if (error.code === 'auth/too-many-requests') {
        setMessage({
          type: 'error',
          text: 'Troppe richieste. Riprova tra qualche minuto.',
        });
        setResendCooldown(120);
      } else {
        setMessage({
          type: 'error',
          text: "Errore durante l'invio. Riprova più tardi.",
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  // Don't show if user is already verified or not logged in
  if (!user || isEmailVerified(user)) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            Email non verificata
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
            Per accedere a tutte le funzionalità, verifica il tuo indirizzo email. Controlla la tua
            casella di posta (inclusa la cartella spam).
          </p>

          {/* Message feedback */}
          {message && (
            <div
              className={`mb-3 p-2 rounded text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Resend button */}
          <button
            onClick={handleSendVerification}
            disabled={isSending || resendCooldown > 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-sm font-medium rounded-md transition-colors disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Invio in corso...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <span>🕒</span>
                Reinvia tra {resendCooldown}s
              </>
            ) : (
              <>
                <span>📧</span>
                Invia email di verifica
              </>
            )}
          </button>

          {/* Help text */}
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-3">
            💡 <strong>Non hai ricevuto l&apos;email?</strong>
            <br />
            • Controlla la cartella spam/posta indesiderata
            <br />• Verifica che l&apos;indirizzo email sia corretto: <strong>{user.email}</strong>
            <br />• L&apos;email potrebbe impiegare qualche minuto ad arrivare
          </p>
        </div>
      </div>
    </div>
  );
}
