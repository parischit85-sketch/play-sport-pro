// =============================================
// FILE: functions/emailService.js
// Servizio centralizzato per invio email con retry e queue
// =============================================

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// Inizializza Firebase Admin (se non già fatto)
try {
  initializeApp();
} catch (error) {
  // App già inizializzata
}

const db = getFirestore();

// =============================================
// CONFIGURAZIONE
// =============================================

const SENDGRID_ENABLED = !!process.env.SENDGRID_API_KEY;
if (SENDGRID_ENABLED) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const NODEMAILER_ENABLED = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
let transporter = null;

if (NODEMAILER_ENABLED) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@play-sport.pro';
const FROM_NAME = 'Play-Sport.pro';

// Configurazione retry
const RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 1000, // 1 secondo
  backoffMultiplier: 2, // Exponential backoff
};

// =============================================
// EMAIL SERVICE CLASS
// =============================================

class EmailService {
  /**
   * Invia email con retry automatico e fallback
   */
  async sendEmail({ to, subject, text, html, from = null, attachments = [] }) {
    // Validazione
    if (!to || !to.includes('@')) {
      throw new Error('Invalid email recipient');
    }

    if (!subject || !text) {
      throw new Error('Subject and text are required');
    }

    // Log richiesta
    console.log(`📧 [EmailService] Sending email to: ${to}`);
    console.log(`📧 [EmailService] Subject: ${subject}`);

    let lastError = null;
    let attempt = 0;

    // Retry loop
    while (attempt < RETRY_CONFIG.maxAttempts) {
      attempt++;
      
      try {
        // Prova SendGrid
        if (SENDGRID_ENABLED) {
          await this._sendViaSendGrid({ to, subject, text, html, from, attachments });
          console.log(`✅ [EmailService] Email sent via SendGrid (attempt ${attempt})`);
          await this._logEmail({ to, subject, service: 'SendGrid', status: 'sent', attempt });
          return { success: true, service: 'SendGrid', attempt };
        }

        // Fallback a Nodemailer
        if (NODEMAILER_ENABLED) {
          await this._sendViaNodemailer({ to, subject, text, html, from, attachments });
          console.log(`✅ [EmailService] Email sent via Nodemailer (attempt ${attempt})`);
          await this._logEmail({ to, subject, service: 'Nodemailer', status: 'sent', attempt });
          return { success: true, service: 'Nodemailer', attempt };
        }

        // Nessun servizio configurato
        throw new Error('No email service configured');
      } catch (error) {
        lastError = error;
        console.error(`❌ [EmailService] Attempt ${attempt} failed:`, error.message);

        // Se è l'ultimo tentativo, non fare retry
        if (attempt >= RETRY_CONFIG.maxAttempts) {
          break;
        }

        // Exponential backoff
        const delay = RETRY_CONFIG.delayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
        console.log(`⏳ [EmailService] Retrying in ${delay}ms...`);
        await this._sleep(delay);
      }
    }

    // Tutti i tentativi falliti
    console.error(`❌ [EmailService] All attempts failed for ${to}`);
    await this._logEmail({ to, subject, service: 'Failed', status: 'failed', attempt, error: lastError.message });
    
    throw new Error(`Failed to send email after ${RETRY_CONFIG.maxAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Invia email via SendGrid
   */
  async _sendViaSendGrid({ to, subject, text, html, from, attachments }) {
    const msg = {
      to,
      from: from || {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      text,
      html,
    };

    if (attachments && attachments.length > 0) {
      msg.attachments = attachments.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.type || 'application/pdf',
        disposition: 'attachment',
      }));
    }

    await sgMail.send(msg);
  }

  /**
   * Invia email via Nodemailer
   */
  async _sendViaNodemailer({ to, subject, text, html, from, attachments }) {
    const mailOptions = {
      from: from || `"${FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map(att => ({
        content: att.content,
        filename: att.filename,
        contentType: att.type || 'application/pdf',
      }));
    }

    await transporter.sendMail(mailOptions);
  }

  /**
   * Invia email in batch (max 100 per batch)
   */
  async sendBulkEmails(emails) {
    console.log(`📧 [EmailService] Sending bulk emails: ${emails.length} total`);

    const results = {
      total: emails.length,
      sent: 0,
      failed: 0,
      errors: [],
    };

    // Processa in batch di 100
    const batchSize = 100;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      console.log(`📧 [EmailService] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(emails.length / batchSize)}`);

      const promises = batch.map(async (email) => {
        try {
          await this.sendEmail(email);
          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            email: email.to,
            error: error.message,
          });
        }
      });

      await Promise.allSettled(promises);

      // Rate limiting: pausa tra batch
      if (i + batchSize < emails.length) {
        await this._sleep(1000); // 1 secondo tra batch
      }
    }

    console.log(`✅ [EmailService] Bulk send completed: ${results.sent} sent, ${results.failed} failed`);
    return results;
  }

  /**
   * Accoda email per invio asincrono
   */
  async queueEmail(emailData) {
    console.log(`📋 [EmailService] Queueing email for ${emailData.to}`);

    const queueRef = await db.collection('emailQueue').add({
      ...emailData,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
      scheduledFor: emailData.scheduledFor || new Date(),
    });

    console.log(`✅ [EmailService] Email queued with ID: ${queueRef.id}`);
    return queueRef.id;
  }

  /**
   * Processa email dalla queue (chiamato da Cloud Function schedulata)
   */
  async processEmailQueue() {
    console.log('📋 [EmailService] Processing email queue...');

    const now = new Date();
    const queueSnapshot = await db
      .collection('emailQueue')
      .where('status', '==', 'pending')
      .where('scheduledFor', '<=', now)
      .limit(100)
      .get();

    console.log(`📋 [EmailService] Found ${queueSnapshot.size} emails to process`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
    };

    for (const doc of queueSnapshot.docs) {
      const emailData = doc.data();
      results.processed++;

      try {
        await this.sendEmail(emailData);
        
        // Marca come inviata
        await doc.ref.update({
          status: 'sent',
          sentAt: new Date(),
          attempts: emailData.attempts + 1,
        });

        results.sent++;
      } catch (error) {
        console.error(`❌ [EmailService] Failed to process queue item ${doc.id}:`, error);

        // Incrementa tentativi
        const newAttempts = emailData.attempts + 1;

        if (newAttempts >= RETRY_CONFIG.maxAttempts) {
          // Troppi tentativi, marca come fallita
          await doc.ref.update({
            status: 'failed',
            error: error.message,
            attempts: newAttempts,
            failedAt: new Date(),
          });
        } else {
          // Riprova più tardi (exponential backoff)
          const nextAttempt = new Date(Date.now() + RETRY_CONFIG.delayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, newAttempts));
          
          await doc.ref.update({
            attempts: newAttempts,
            scheduledFor: nextAttempt,
            lastError: error.message,
          });
        }

        results.failed++;
      }
    }

    console.log(`✅ [EmailService] Queue processing completed: ${results.sent} sent, ${results.failed} failed`);
    return results;
  }

  /**
   * Invia email di test
   */
  async sendTestEmail(to) {
    console.log(`🧪 [EmailService] Sending test email to ${to}`);

    return await this.sendEmail({
      to,
      subject: '🧪 Test Email - Play-Sport.pro',
      text: 'This is a test email from Play-Sport.pro email system.\n\nIf you received this, the email configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">🧪 Test Email</h2>
          <p>This is a test email from <strong>Play-Sport.pro</strong> email system.</p>
          <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              ✅ If you received this, the email configuration is working correctly!
            </p>
          </div>
          <p style="color: #6b7280; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
    });
  }

  /**
   * Verifica configurazione email
   */
  async verifyConfiguration() {
    const config = {
      sendgrid: SENDGRID_ENABLED,
      nodemailer: NODEMAILER_ENABLED,
      fromEmail: FROM_EMAIL,
      fromName: FROM_NAME,
    };

    console.log('🔧 [EmailService] Configuration:', config);

    if (!SENDGRID_ENABLED && !NODEMAILER_ENABLED) {
      throw new Error('No email service configured. Set SENDGRID_API_KEY or EMAIL_USER/EMAIL_PASSWORD');
    }

    // Test connessione Nodemailer
    if (NODEMAILER_ENABLED && transporter) {
      try {
        await transporter.verify();
        console.log('✅ [EmailService] Nodemailer connection verified');
      } catch (error) {
        console.error('❌ [EmailService] Nodemailer connection failed:', error.message);
        throw error;
      }
    }

    return config;
  }

  /**
   * Ottieni statistiche email
   */
  async getEmailStats(clubId = null, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = db
      .collection('emailLogs')
      .where('timestamp', '>=', startDate);

    if (clubId) {
      query = query.where('clubId', '==', clubId);
    }

    const snapshot = await query.get();

    const stats = {
      total: snapshot.size,
      sent: 0,
      failed: 0,
      byService: {},
      byType: {},
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      
      if (data.status === 'sent') stats.sent++;
      if (data.status === 'failed') stats.failed++;

      stats.byService[data.service] = (stats.byService[data.service] || 0) + 1;
      stats.byType[data.type || 'unknown'] = (stats.byType[data.type || 'unknown'] || 0) + 1;
    });

    return stats;
  }

  /**
   * Log email inviate (per analytics)
   */
  async _logEmail({ to, subject, service, status, attempt, error = null, type = 'transactional', clubId = null }) {
    try {
      await db.collection('emailLogs').add({
        to,
        subject,
        service,
        status,
        attempt,
        error,
        type,
        clubId,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('❌ [EmailService] Failed to log email:', err);
      // Non bloccare l'invio se il logging fallisce
    }
  }

  /**
   * Sleep utility
   */
  async _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =============================================
// EXPORT SINGLETON
// =============================================

const emailService = new EmailService();
export default emailService;
