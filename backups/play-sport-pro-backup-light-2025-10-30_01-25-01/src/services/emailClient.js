// =============================================
// FILE: src/services/emailClient.js
// Client-side email service per trigger manuali
// =============================================

import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

/**
 * Email Client Service
 *
 * Fornisce metodi per triggere invio email dal client
 * quando non è possibile usare Firestore triggers
 * (es. reminder schedulati, welcome email, ecc.)
 */
class EmailClient {
  /**
   * Invia email di benvenuto a nuovo utente
   */
  async sendWelcomeEmail(userId, clubId) {
    try {
      const sendWelcome = httpsCallable(functions, 'sendWelcomeEmail');
      const result = await sendWelcome({ userId, clubId });

      console.log('✅ [EmailClient] Welcome email sent:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ [EmailClient] Failed to send welcome email:', error);
      throw error;
    }
  }

  /**
   * Invia reminder prenotazione (24h prima)
   * Chiamato da uno scheduler client-side o Cloud Function schedulata
   */
  async sendBookingReminder(bookingId) {
    try {
      const sendReminder = httpsCallable(functions, 'sendBookingReminder');
      const result = await sendReminder({ bookingId });

      console.log('✅ [EmailClient] Booking reminder sent:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ [EmailClient] Failed to send reminder:', error);
      throw error;
    }
  }

  /**
   * Invia email di reset password
   */
  async sendPasswordResetEmail(email, clubId) {
    try {
      const sendReset = httpsCallable(functions, 'sendPasswordResetEmail');
      const result = await sendReset({ email, clubId });

      console.log('✅ [EmailClient] Password reset email sent:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ [EmailClient] Failed to send password reset:', error);
      throw error;
    }
  }

  /**
   * Invia email di conferma pagamento
   */
  async sendPaymentConfirmation(paymentId, userId) {
    try {
      const sendPayment = httpsCallable(functions, 'sendPaymentConfirmation');
      const result = await sendPayment({ paymentId, userId });

      console.log('✅ [EmailClient] Payment confirmation sent:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ [EmailClient] Failed to send payment confirmation:', error);
      throw error;
    }
  }

  /**
   * Invia email personalizzata
   * Per casi d'uso specifici non coperti dai template
   */
  async sendCustomEmail({ to, subject, text, html, templateData = null }) {
    try {
      const sendCustom = httpsCallable(functions, 'sendCustomEmail');
      const result = await sendCustom({ to, subject, text, html, templateData });

      console.log('✅ [EmailClient] Custom email sent:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ [EmailClient] Failed to send custom email:', error);
      throw error;
    }
  }

  /**
   * Invia email di test (per diagnostica)
   */
  async sendTestEmail(to) {
    try {
      const sendTest = httpsCallable(functions, 'sendTestEmail');
      const result = await sendTest({ to });

      console.log('✅ [EmailClient] Test email sent:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ [EmailClient] Failed to send test email:', error);
      throw error;
    }
  }

  /**
   * Ottieni statistiche invio email per un club
   */
  async getEmailStats(clubId, days = 30) {
    try {
      const getStats = httpsCallable(functions, 'getEmailStats');
      const result = await getStats({ clubId, days });

      return result.data;
    } catch (error) {
      console.error('❌ [EmailClient] Failed to get email stats:', error);
      throw error;
    }
  }

  /**
   * Verifica configurazione email service
   */
  async verifyEmailConfiguration() {
    try {
      const verify = httpsCallable(functions, 'verifyEmailConfiguration');
      const result = await verify();

      console.log('🔧 [EmailClient] Email configuration:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ [EmailClient] Failed to verify configuration:', error);
      throw error;
    }
  }

  /**
   * Monitora stato email queue
   * Per admin: vedere email pending/failed
   */
  async getEmailQueueStatus() {
    try {
      const getQueue = httpsCallable(functions, 'getEmailQueueStatus');
      const result = await getQueue();

      return result.data;
    } catch (error) {
      console.error('❌ [EmailClient] Failed to get queue status:', error);
      throw error;
    }
  }

  /**
   * Riprova invio email fallita
   * Per admin: retry manuale
   */
  async retryFailedEmail(emailLogId) {
    try {
      const retry = httpsCallable(functions, 'retryFailedEmail');
      const result = await retry({ emailLogId });

      console.log('✅ [EmailClient] Email retry initiated:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ [EmailClient] Failed to retry email:', error);
      throw error;
    }
  }
}

// =============================================
// EXPORT SINGLETON
// =============================================

const emailClient = new EmailClient();
export default emailClient;

/**
 * Hook React per email service
 *
 * Usage:
 * const { sendWelcomeEmail, sendTestEmail } = useEmailService();
 * await sendWelcomeEmail(userId, clubId);
 */
export function useEmailService() {
  return emailClient;
}

/**
 * Utility: Valida email
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Utility: Formatta email per display
 */
export function formatEmail(email) {
  if (!email) return '';
  return email.toLowerCase().trim();
}

/**
 * Utility: Ottieni provider email
 */
export function getEmailProvider(email) {
  if (!email) return 'unknown';

  const domain = email.split('@')[1];

  const providers = {
    'gmail.com': 'Gmail',
    'googlemail.com': 'Gmail',
    'outlook.com': 'Outlook',
    'hotmail.com': 'Hotmail',
    'yahoo.com': 'Yahoo',
    'icloud.com': 'iCloud',
    'live.com': 'Live',
  };

  return providers[domain] || domain;
}
