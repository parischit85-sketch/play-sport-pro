// =============================================
// FILE: src/components/auth/EmailVerificationBanner.jsx
// =============================================
import React, { useState } from 'react';
import { useAuth } from '@contexts/AuthContext.jsx';
import { resendVerificationEmail, isEmailVerified } from '@services/auth.jsx';

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [dismissed, setDismissed] = useState(false);

  // Non mostrare se:
  // - Email già verificata
  // - Nessun utente loggato
  // - Banner dismissato
  if (!user || isEmailVerified(user) || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    setMessage('');

    try {
      await resendVerificationEmail(user);
      setMessage('✅ Email di verifica inviata! Controlla la tua casella di posta.');
    } catch (error) {
      console.error('Error resending verification email:', error);
      setMessage('❌ Errore nell\'invio dell\'email. Riprova tra qualche minuto.');
    } finally {
      setSending(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const styles = {
    banner: {
      backgroundColor: '#FEF3C7', // amber-100
      border: '2px solid #F59E0B', // amber-500
      borderRadius: '12px',
      padding: '16px 20px',
      margin: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      position: 'relative',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    },
    icon: {
      fontSize: '24px',
      flexShrink: 0,
    },
    content: {
      flex: 1,
    },
    title: {
      fontWeight: '600',
      fontSize: '16px',
      color: '#92400E', // amber-800
      marginBottom: '4px',
    },
    text: {
      fontSize: '14px',
      color: '#78350F', // amber-900
      lineHeight: '1.5',
    },
    actions: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      marginTop: '8px',
    },
    button: {
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    primaryButton: {
      backgroundColor: '#10B981', // emerald-500
      color: '#fff',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: '#78350F', // amber-900
      border: '1px solid #F59E0B', // amber-500
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#92400E', // amber-800
      padding: '4px',
      lineHeight: 1,
      opacity: 0.7,
      transition: 'opacity 0.2s ease',
    },
    message: {
      fontSize: '14px',
      padding: '8px 12px',
      borderRadius: '8px',
      backgroundColor: '#fff',
      marginTop: '8px',
    },
  };

  return (
    <div style={styles.banner}>
      <div style={styles.header}>
        <div style={styles.icon}>⚠️</div>
        <div style={styles.content}>
          <div style={styles.title}>Verifica la tua email</div>
          <div style={styles.text}>
            Ti abbiamo inviato un'email di verifica a <strong>{user.email}</strong>.
            <br />
            Per prenotare campi devi verificare il tuo indirizzo email.
          </div>
        </div>
        <button
          style={styles.closeButton}
          onClick={handleDismiss}
          onMouseEnter={(e) => (e.target.style.opacity = 1)}
          onMouseLeave={(e) => (e.target.style.opacity = 0.7)}
          aria-label="Chiudi"
        >
          ×
        </button>
      </div>

      <div style={styles.actions}>
        <button
          style={{ ...styles.button, ...styles.primaryButton }}
          onClick={handleResend}
          disabled={sending}
          onMouseEnter={(e) => {
            if (!sending) e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {sending ? '⏳ Invio in corso...' : '📧 Reinvia email'}
        </button>

        <button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={() => window.location.reload()}
        >
          🔄 Ho verificato la mia email
        </button>
      </div>

      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
}

