const fs = require('fs');

const code = `// =============================================
// FILE: functions/sendClubEmail.js
// Cloud Function callable per invio messaggi email da club admin
// Riutilizza lo STESSO SCHEMA dell'email di verifica (noreply@play-sport.pro)
// =============================================

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

// =============================================
// CONFIGURAZIONE EMAIL - IDENTICO A sendBulkNotifications.clean.js
// =============================================
let emailConfig = null;

function getEmailConfig() {
  if (!emailConfig) {
    const SENDGRID_ENABLED = !!process.env.SENDGRID_API_KEY;
    const NODEMAILER_ENABLED = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    const EMAIL_USER = process.env.EMAIL_USER || '';
    const FROM_EMAIL = process.env.FROM_EMAIL || EMAIL_USER || 'noreply@play-sport.pro';
    
    const emailUser = String(EMAIL_USER).toLowerCase();
    const fromEmail = String(FROM_EMAIL).toLowerCase();
    const useRegisterIt = emailUser.endsWith('@play-sport.pro') || fromEmail.endsWith('@play-sport.pro');
    
    console.log('🔧 [sendClubEmail] Email Config', {
      sendgridEnabled: SENDGRID_ENABLED,
      nodemailerEnabled: NODEMAILER_ENABLED,
      fromEmail: FROM_EMAIL,
      provider: useRegisterIt ? 'Register.it' : 'Gmail',
    });

    if (SENDGRID_ENABLED) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    let transporter = null;
    if (NODEMAILER_ENABLED) {
      if (useRegisterIt) {
        const host = process.env.SMTP_HOST || 'smtp.register.it';
        const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
        const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : false;
        
        transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          requireTLS: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 30000,
          greetingTimeout: 15000,
          socketTimeout: 30000,
          logger: true,
        });
      } else {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      }
    }

    emailConfig = {
      sendgridEnabled: SENDGRID_ENABLED,
      nodemailerEnabled: NODEMAILER_ENABLED,
      fromEmail: FROM_EMAIL,
      transporter,
    };
  }
  return emailConfig;
}

// =============================================
// PERMISSION CHECK
// =============================================
async function checkAdminPermissions(userId, clubId, userEmail) {
  const clubRef = db.collection('clubs').doc(clubId);
  const clubDoc = await clubRef.get();
  
  if (!clubDoc.exists) {
    console.log('❌ [checkAdminPermissions] Club not found:', clubId);
    return false;
  }
  
  const club = clubDoc.data();
  const requesterEmail = (userEmail || '').toLowerCase();

  const isOwner = club?.ownerId === userId;
  const isAdminFromClub = Array.isArray(club.admins) && club.admins.includes(userId);
  const isAdminFromEmailList = Array.isArray(club.adminEmails) && requesterEmail
    ? club.adminEmails.map((e) => String(e).toLowerCase()).includes(requesterEmail)
    : false;

  const membershipSnap = await clubRef.collection('users').where('userId', '==', userId).limit(1).get();
  let isAdminFromMembership = false;
  if (!membershipSnap.empty) {
    const m = membershipSnap.docs[0].data();
    isAdminFromMembership = m?.isClubAdmin === true || m?.role === 'admin' || m?.role === 'club_admin' ||
      (Array.isArray(m?.roles) && (m.roles.includes('admin') || m.roles.includes('club_admin')));
  }

  const profileRef = clubRef.collection('profiles').doc(userId);
  const profileDoc = await profileRef.get();
  const isAdminFromProfile = profileDoc.exists
    ? profileDoc.data()?.isClubAdmin === true || profileDoc.data()?.role === 'club_admin'
    : false;

  const affiliationId = \`\${userId}_\${clubId}\`;
  const affiliationDoc = await db.collection('affiliations').doc(affiliationId).get();
  const isAdminFromAffiliation = affiliationDoc.exists
    ? (affiliationDoc.data()?.role === 'club_admin' || affiliationDoc.data()?.isClubAdmin === true) &&
      (affiliationDoc.data()?.status || 'approved') === 'approved'
    : false;

  const isAdmin = isOwner || isAdminFromClub || isAdminFromEmailList || isAdminFromMembership || isAdminFromProfile || isAdminFromAffiliation;

  console.log('🔐 [Permissions] sendClubEmail', { clubId, uid: userId, final: isAdmin });

  return isAdmin;
}

// =============================================
// SEND EMAIL FUNCTION
// =============================================
async function sendEmailNotification({ to, subject, html, clubName, replyTo }) {
  const config = getEmailConfig();
  
  console.log('📧 [sendClubEmail] Sending to:', to);

  if (config.nodemailerEnabled && config.transporter) {
    try {
      console.log('📧 [sendClubEmail] Attempting Nodemailer...');
      await config.transporter.sendMail({
        from: \`"\${clubName}" <\${config.fromEmail}>\`,
        to,
        replyTo: replyTo || config.fromEmail,
        subject,
        html,
      });
      console.log('✅ [sendClubEmail] Sent via Nodemailer');
      return { provider: 'nodemailer', success: true };
    } catch (smtpError) {
      console.warn('⚠️ [sendClubEmail] Nodemailer failed:', smtpError.message);
    }
  }

  if (config.sendgridEnabled) {
    try {
      console.log('📧 [sendClubEmail] Attempting SendGrid...');
      await sgMail.send({
        from: { email: config.fromEmail, name: clubName },
        to,
        replyTo: replyTo || config.fromEmail,
        subject,
        html,
      });
      console.log('✅ [sendClubEmail] Sent via SendGrid');
      return { provider: 'sendgrid', success: true };
    } catch (sendgridError) {
      console.error('❌ [sendClubEmail] SendGrid failed:', sendgridError.message);
      throw new Error(\`Email delivery failed: \${sendgridError.message}\`);
    }
  }

  throw new Error('No email provider configured');
}

// =============================================
// CLOUD FUNCTION: sendClubEmail
// =============================================
export const sendClubEmail = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 300,
    secrets: ['EMAIL_USER', 'EMAIL_PASSWORD', 'FROM_EMAIL'],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = request.auth.uid;
    const userEmail = request.auth.token.email || 'unknown';
    const { clubId, recipients, subject, body, isHTML = false, replyTo } = request.data;

    console.log('📧 [sendClubEmail] Request:', { clubId, recipientsCount: recipients?.length, subject });

    if (!clubId) throw new HttpsError('invalid-argument', 'clubId is required');
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new HttpsError('invalid-argument', 'recipients array is required');
    }
    if (!subject || !body) throw new HttpsError('invalid-argument', 'subject and body are required');

    const isAdmin = await checkAdminPermissions(userId, clubId, userEmail);
    if (!isAdmin) {
      console.warn('⚠️ [sendClubEmail] Permission denied:', { userId, clubId });
      throw new HttpsError('permission-denied', 'User is not admin of this club');
    }

    const clubRef = db.collection('clubs').doc(clubId);
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) throw new HttpsError('not-found', 'Club not found');

    const club = clubDoc.data();
    const clubName = club.name || 'Play-Sport';
    const clubReplyTo = replyTo || club.contactEmail || club.email || 'info@sportingcat.it';

    const emailList = [];
    for (const recipient of recipients) {
      try {
        if (typeof recipient === 'string') {
          const playerRef = db.collection('clubs').doc(clubId).collection('users').doc(recipient);
          const playerDoc = await playerRef.get();
          if (playerDoc.exists) {
            const player = playerDoc.data();
            if (player.email) emailList.push({ email: player.email, name: player.displayName || player.name || 'Player' });
          } else {
            const globalUserRef = db.collection('users').doc(recipient);
            const globalUserDoc = await globalUserRef.get();
            if (globalUserDoc.exists) {
              const user = globalUserDoc.data();
              if (user.email) emailList.push({ email: user.email, name: user.displayName || user.firstName || 'Player' });
            }
          }
        } else if (recipient && recipient.email) {
          emailList.push({ email: recipient.email, name: recipient.name || 'Player' });
        }
      } catch (error) {
        console.warn('⚠️ Error resolving recipient:', error.message);
      }
    }

    if (emailList.length === 0) throw new HttpsError('invalid-argument', 'No valid recipients found');

    const results = { success: true, sent: 0, failed: 0, details: [] };

    for (const recipient of emailList) {
      try {
        const result = await sendEmailNotification({
          to: recipient.email,
          subject,
          html: isHTML ? body : \`<p>\${body.split('\\n').map(l => \`<p>\${l}</p>\`).join('')}</p>\`,
          clubName,
          replyTo: clubReplyTo,
        });

        results.sent++;
        results.details.push({ email: recipient.email, name: recipient.name, success: true, provider: result.provider });
        console.log(\`✅ Email sent to \${recipient.email}\`);
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(\`❌ Failed to send to \${recipient.email}: \${error.message}\`);
        results.failed++;
        results.details.push({ email: recipient.email, name: recipient.name, success: false, error: error.message });
      }
    }

    results.success = results.failed === 0;
    console.log('📊 [sendClubEmail] Results:', { sent: results.sent, failed: results.failed });
    return results;
  }
);
`;

fs.writeFileSync('./functions/sendClubEmail.js', code, 'utf8');
console.log('✅ Created sendClubEmail.js successfully');
