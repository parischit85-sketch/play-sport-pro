// =============================================
// FILE: src/pages/BookingPage.jsx
// =============================================
import React, { useState } from 'react';
import { themeTokens } from '@lib/theme.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { resendVerificationEmail } from '@services/auth.jsx';
import ModernBookingInterface from '@features/booking/ModernBookingInterface.jsx';
import ClubSelectionForBooking from '@components/booking/ClubSelectionForBooking.jsx';

export default function BookingPage() {
  const { user } = useAuth();
  const { clubId, hasClub } = useClub();
  const T = React.useMemo(() => themeTokens(), []);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  // BLOCCO: Email non verificata
  if (user && !user.emailVerified) {
    const handleResend = async () => {
      setSending(true);
      setMessage('');
      
      try {
        await resendVerificationEmail(user);
        setMessage('✅ Email di verifica inviata! Controlla la tua casella di posta.');
      } catch (error) {
        console.error('Error resending verification email:', error);
        setMessage('❌ Errore nell\'invio. Riprova tra qualche minuto.');
      } finally {
        setSending(false);
      }
    };

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📧</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '12px',
          }}>
            Verifica la tua email
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            marginBottom: '24px',
            lineHeight: '1.6',
          }}>
            Per prenotare campi devi prima verificare il tuo indirizzo email: <strong>{user.email}</strong>
          </p>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            marginBottom: '24px',
          }}>
            Ti abbiamo inviato un'email con un link di verifica. Clicca sul link nell'email per attivare il tuo account.
          </p>

          <button
            onClick={handleResend}
            disabled={sending}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#10B981',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.7 : 1,
              marginBottom: '16px',
              transition: 'all 0.2s ease',
            }}
          >
            {sending ? '⏳ Invio in corso...' : '📧 Reinvia email di verifica'}
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: 'transparent',
              color: '#6B7280',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            🔄 Ho verificato la mia email
          </button>

          {message && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
              color: message.includes('✅') ? '#155724' : '#721c24',
              fontSize: '14px',
            }}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Se non c'è un circolo selezionato, mostra la selezione del circolo
  if (!hasClub || !clubId) {
    return <ClubSelectionForBooking bookingType="campo" T={T} />;
  }

  // Se c'è un circolo selezionato, mostra l'interfaccia di prenotazione normale
  return (
    <ModernBookingInterface T={T} user={user} state={null} setState={() => {}} clubId={clubId} />
  );
}
