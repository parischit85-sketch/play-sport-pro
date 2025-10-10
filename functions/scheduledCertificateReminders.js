// =============================================
// FILE: functions/scheduledCertificateReminders.js
// Cloud Function per notifiche automatiche certificati medici
// =============================================

/**
 * CONFIGURAZIONE CLOUD FUNCTION
 * 
 * Deploy:
 * firebase deploy --only functions:dailyCertificateCheck
 * 
 * Test locale:
 * firebase emulators:start --only functions
 * 
 * Cron Schedule: Ogni giorno alle 09:00 (Europe/Rome)
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// Inizializza Firebase Admin
initializeApp();
const db = getFirestore();

// =============================================
// CONFIGURAZIONE EMAIL SERVICES
// =============================================

/**
 * Configurazione SendGrid (PRODUZIONE)
 * 
 * Setup:
 * 1. Crea account su https://sendgrid.com
 * 2. Ottieni API Key da Settings > API Keys
 * 3. Configura secret: firebase functions:secrets:set SENDGRID_API_KEY
 * 4. Verifica dominio su SendGrid per deliverability
 */
const SENDGRID_ENABLED = !!process.env.SENDGRID_API_KEY;
if (SENDGRID_ENABLED) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Configurazione Nodemailer/Gmail (SVILUPPO/TEST)
 * 
 * Setup:
 * 1. Vai su https://myaccount.google.com/apppasswords
 * 2. Crea App Password per "Mail"
 * 3. Configura secrets:
 *    firebase functions:secrets:set EMAIL_USER (tua-email@gmail.com)
 *    firebase functions:secrets:set EMAIL_PASSWORD (app-password-generata)
 */
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

// Email mittente (personalizza con il tuo dominio)
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@playsport.pro';
const FROM_NAME = 'Play-Sport.pro';

/**
 * Calcola status certificato (stesso algoritmo del client)
 */
function calculateCertificateStatus(expiryDate) {
  if (!expiryDate) {
    return {
      isValid: false,
      isExpiring: false,
      isExpired: false,
      daysUntilExpiry: null,
      status: 'missing',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry - today;
  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = daysUntilExpiry < 0;
  const isExpiring = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  const isValid = daysUntilExpiry > 0;

  return {
    isValid,
    isExpiring,
    isExpired,
    daysUntilExpiry,
    status: isExpired ? 'expired' : isExpiring ? 'expiring' : 'valid',
  };
}

/**
 * Invia email tramite SendGrid o Nodemailer
 * Fallback automatico se un servizio non è disponibile
 */
async function sendEmail({ to, subject, html, text }) {
  // Valida email destinatario
  if (!to || !to.includes('@')) {
    console.warn('⚠️ [Email] Invalid recipient:', to);
    return false;
  }

  let sent = false;
  let errors = [];

  // STRATEGIA 1: Prova SendGrid (PRODUZIONE)
  if (SENDGRID_ENABLED && !sent) {
    try {
      await sgMail.send({
        to,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        subject,
        text,
        html,
      });
      
      console.log('✅ [SendGrid] Email sent to:', to);
      sent = true;
    } catch (error) {
      console.error('❌ [SendGrid] Error:', error.message);
      errors.push({ service: 'SendGrid', error: error.message });
    }
  }

  // STRATEGIA 2: Fallback su Nodemailer (TEST/BACKUP)
  if (NODEMAILER_ENABLED && !sent) {
    try {
      await transporter.sendMail({
        from: `"${FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
      
      console.log('✅ [Nodemailer] Email sent to:', to);
      sent = true;
    } catch (error) {
      console.error('❌ [Nodemailer] Error:', error.message);
      errors.push({ service: 'Nodemailer', error: error.message });
    }
  }

  // STRATEGIA 3: Nessun servizio configurato
  if (!sent) {
    if (errors.length === 0) {
      console.warn('⚠️ [Email] No email service configured. Set SENDGRID_API_KEY or EMAIL_USER/EMAIL_PASSWORD');
      console.log('📧 [Email Preview] To:', to);
      console.log('📧 [Email Preview] Subject:', subject);
      console.log('📧 [Email Preview] Text:', text.substring(0, 200) + '...');
    } else {
      console.error('❌ [Email] All services failed:', errors);
    }
  }

  return sent;
}

/**
 * Template email per utente
 */
function getUserEmailTemplate({ playerName, clubName, expiryDate, daysRemaining, isExpired }) {
  const formattedDate = new Date(expiryDate).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (isExpired) {
    return {
      subject: `⚠️ Certificato Medico Scaduto - ${clubName}`,
      text: `Ciao ${playerName},\n\nIl tuo certificato medico sportivo è SCADUTO da ${Math.abs(daysRemaining)} giorni (scadenza: ${formattedDate}).\n\nNon puoi effettuare prenotazioni fino al rinnovo del certificato.\n\nContatta il circolo ${clubName} per maggiori informazioni.\n\nGrazie,\nPlay-Sport.pro Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">⚠️ Certificato Medico Scaduto</h2>
          <p>Ciao <strong>${playerName}</strong>,</p>
          <p>Il tuo certificato medico sportivo è <strong style="color: #dc2626;">SCADUTO</strong> da <strong>${Math.abs(daysRemaining)} giorni</strong> (scadenza: ${formattedDate}).</p>
          <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>⚠️ Attenzione:</strong> Non puoi effettuare prenotazioni fino al rinnovo del certificato.</p>
          </div>
          <p>Contatta il circolo <strong>${clubName}</strong> per rinnovare il certificato.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Play-Sport.pro Team</p>
        </div>
      `
    };
  }

  const urgency = daysRemaining <= 7 ? 'URGENTE' : daysRemaining <= 15 ? 'IMPORTANTE' : '';

  return {
    subject: `${urgency ? urgency + ' - ' : ''}Certificato Medico in Scadenza - ${clubName}`,
    text: `Ciao ${playerName},\n\nIl tuo certificato medico sportivo scade tra ${daysRemaining} giorni (scadenza: ${formattedDate}).\n\n${daysRemaining <= 7 ? 'URGENTE: Rinnova subito il certificato per continuare a prenotare!\n\n' : 'Ricordati di rinnovarlo per tempo.\n\n'}Circolo: ${clubName}\n\nGrazie,\nPlay-Sport.pro Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${daysRemaining <= 7 ? '#ea580c' : '#f59e0b'};">${daysRemaining <= 7 ? '🚨' : '⏰'} Certificato Medico in Scadenza</h2>
        <p>Ciao <strong>${playerName}</strong>,</p>
        <p>Il tuo certificato medico sportivo scade tra <strong style="color: ${daysRemaining <= 7 ? '#ea580c' : '#f59e0b'};">${daysRemaining} giorni</strong> (scadenza: ${formattedDate}).</p>
        ${daysRemaining <= 7 ? `
          <div style="background-color: #ffedd5; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #9a3412;"><strong>🚨 URGENTE:</strong> Rinnova subito il certificato per continuare a prenotare!</p>
          </div>
        ` : ''}
        <p>Circolo: <strong>${clubName}</strong></p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Play-Sport.pro Team</p>
      </div>
    `
  };
}

/**
 * Template email per admin club
 */
function getAdminEmailTemplate({ clubName, players }) {
  const expired = players.filter(p => p.status.isExpired);
  const expiringSoon = players.filter(p => p.status.daysUntilExpiry <= 15 && !p.status.isExpired);
  
  const playersList = players.map(p => {
    const status = p.status.isExpired 
      ? `SCADUTO ${Math.abs(p.status.daysUntilExpiry)} giorni fa`
      : `Scade tra ${p.status.daysUntilExpiry} giorni`;
    
    return `- ${p.name} (${p.email || 'nessuna email'}) - ${status}`;
  }).join('\n');

  return {
    subject: `📋 Report Certificati Medici - ${clubName} (${players.length} da controllare)`,
    text: `Report giornaliero certificati medici\n\nCircolo: ${clubName}\n\nRiepilogo:\n- Scaduti: ${expired.length}\n- In scadenza urgente (<15gg): ${expiringSoon.length}\n- Totale da controllare: ${players.length}\n\nGiocatori:\n${playersList}\n\nAccedi alla dashboard per gestire i certificati.\n\nPlay-Sport.pro Admin`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">📋 Report Certificati Medici</h2>
        <p><strong>Circolo:</strong> ${clubName}</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0;">
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${expired.length}</div>
            <div style="font-size: 12px; color: #991b1b;">Scaduti</div>
          </div>
          <div style="background-color: #ffedd5; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #ea580c;">${expiringSoon.length}</div>
            <div style="font-size: 12px; color: #9a3412;">Urgenti (&lt;15gg)</div>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #4b5563;">${players.length}</div>
            <div style="font-size: 12px; color: #374151;">Totale</div>
          </div>
        </div>

        <h3 style="color: #1f2937; margin-top: 30px;">Giocatori da Controllare:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${players.map(p => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px;">
                <strong>${p.name}</strong><br>
                <span style="font-size: 12px; color: #666;">${p.email || 'Nessuna email'}</span>
              </td>
              <td style="padding: 10px; text-align: right;">
                <span style="color: ${p.status.isExpired ? '#dc2626' : p.status.daysUntilExpiry <= 7 ? '#ea580c' : '#f59e0b'}; font-weight: bold;">
                  ${p.status.isExpired ? `Scaduto ${Math.abs(p.status.daysUntilExpiry)}gg fa` : `${p.status.daysUntilExpiry} giorni`}
                </span>
              </td>
            </tr>
          `).join('')}
        </table>

        <div style="margin-top: 30px; text-align: center;">
          <a href="https://play-sport.pro/club/${clubName}/players" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Gestisci Certificati
          </a>
        </div>

        <p style="color: #666; font-size: 12px; margin-top: 30px;">Play-Sport.pro Admin</p>
      </div>
    `
  };
}

/**
 * Cloud Function schedulata - Esegue ogni giorno alle 09:00
 * 
 * Secrets richiesti (configurali con firebase functions:secrets:set):
 * - SENDGRID_API_KEY (opzionale, per SendGrid)
 * - EMAIL_USER (opzionale, per Nodemailer/Gmail)
 * - EMAIL_PASSWORD (opzionale, per Nodemailer/Gmail)
 * - FROM_EMAIL (opzionale, default: noreply@playsport.pro)
 */
export const dailyCertificateCheck = onSchedule(
  {
    schedule: 'every day 09:00',
    timeZone: 'Europe/Rome',
    memory: '256MiB',
    timeoutSeconds: 540, // 9 minuti
    secrets: ['SENDGRID_API_KEY', 'EMAIL_USER', 'EMAIL_PASSWORD', 'FROM_EMAIL'],
  },
  async (event) => {
    console.log('🏥 [Certificate Check] Starting daily certificate expiry check...');
    
    const startTime = Date.now();
    const stats = {
      totalClubs: 0,
      totalPlayers: 0,
      emailsSent: 0,
      errors: 0,
    };

    try {
      // Ottieni tutti i clubs
      const clubsSnapshot = await db.collection('clubs').get();
      stats.totalClubs = clubsSnapshot.size;

      console.log(`📊 [Certificate Check] Found ${stats.totalClubs} clubs to check`);

      // Processa ogni club
      for (const clubDoc of clubsSnapshot.docs) {
        const clubId = clubDoc.id;
        const club = clubDoc.data();
        const clubName = club.name || clubId;

        console.log(`🏛️ [Certificate Check] Processing club: ${clubName} (${clubId})`);

        // Ottieni tutti i giocatori del club
        const playersSnapshot = await db
          .collection('clubs')
          .doc(clubId)
          .collection('players')
          .get();

        const playersToNotify = [];

        // Controlla certificati di ogni giocatore
        for (const playerDoc of playersSnapshot.docs) {
          stats.totalPlayers++;
          
          const player = playerDoc.data();
          const expiryDate = player.medicalCertificates?.current?.expiryDate;

          if (!expiryDate) continue; // Salta se non ha certificato

          const status = calculateCertificateStatus(expiryDate);

          // Alert a 30, 15, 7, 3 giorni e scaduti
          const alertDays = [30, 15, 7, 3, 0, -1, -7, -30]; // Anche dopo scadenza
          const shouldNotify = alertDays.includes(status.daysUntilExpiry) || status.isExpired;

          if (shouldNotify) {
            console.log(`⚠️ [Certificate Check] ${player.name} - ${status.isExpired ? 'EXPIRED' : `${status.daysUntilExpiry} days`}`);

            playersToNotify.push({
              id: playerDoc.id,
              name: player.name,
              email: player.email,
              phone: player.phone,
              linkedAccountId: player.linkedAccountId,
              expiryDate,
              status,
            });

            // Invia email al giocatore
            if (player.email && player.communicationPreferences?.email !== false) {
              try {
                const emailContent = getUserEmailTemplate({
                  playerName: player.name,
                  clubName,
                  expiryDate,
                  daysRemaining: status.daysUntilExpiry,
                  isExpired: status.isExpired,
                });

                await sendEmail({
                  to: player.email,
                  subject: emailContent.subject,
                  text: emailContent.text,
                  html: emailContent.html,
                });

                stats.emailsSent++;

                // Aggiorna contatore reminder
                await playerDoc.ref.update({
                  'medicalCertificates.lastReminderSent': new Date().toISOString(),
                  'medicalCertificates.remindersSent': (player.medicalCertificates?.remindersSent || 0) + 1,
                });
              } catch (error) {
                console.error(`❌ [Email Error] Failed to send to ${player.email}:`, error);
                stats.errors++;
              }
            }
          }
        }

        // Invia report admin se ci sono giocatori da notificare
        if (playersToNotify.length > 0) {
          console.log(`📧 [Admin Report] Sending report for ${clubName}: ${playersToNotify.length} players`);

          // Ottieni email admin del club
          const adminEmails = club.adminEmails || [];
          
          for (const adminEmail of adminEmails) {
            try {
              const emailContent = getAdminEmailTemplate({
                clubName,
                players: playersToNotify,
              });

              await sendEmail({
                to: adminEmail,
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html,
              });

              stats.emailsSent++;
            } catch (error) {
              console.error(`❌ [Admin Email Error] Failed to send to ${adminEmail}:`, error);
              stats.errors++;
            }
          }
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log('✅ [Certificate Check] Completed successfully');
      console.log(`📊 [Stats] Clubs: ${stats.totalClubs}, Players: ${stats.totalPlayers}, Emails: ${stats.emailsSent}, Errors: ${stats.errors}, Duration: ${duration}s`);

      return {
        success: true,
        stats,
        duration,
      };
    } catch (error) {
      console.error('❌ [Certificate Check] Fatal error:', error);
      throw error;
    }
  }
);
