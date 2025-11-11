import process from 'node:process';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import emailService from './emailService.js';

if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

const DEFAULT_FROM_EMAIL =
  process.env.FROM_EMAIL || process.env.EMAIL_USER || 'noreply@play-sport.pro';

function sanitizeEmail(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || !trimmed.includes('@')) {
    return null;
  }

  return trimmed;
}

function splitRecipients(recipients = []) {
  const valid = [];
  const invalid = [];
  const seen = new Set();

  for (const raw of recipients) {
    if (!raw) {
      invalid.push({ reason: 'missing-recipient' });
      continue;
    }

    let email = null;
    let name = null;

    if (typeof raw === 'string') {
      email = raw;
    } else if (typeof raw === 'object') {
      email = raw.email || raw.to || raw.address || null;
      name = raw.name || raw.displayName || raw.fullName || raw.label || raw.username || null;
    }

    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      invalid.push({
        reason: 'invalid-email',
        email: email || null,
        name: name || null,
      });
      continue;
    }

    const lower = sanitizedEmail.toLowerCase();
    if (seen.has(lower)) {
      invalid.push({
        reason: 'duplicate-email',
        email: sanitizedEmail,
        name: name || null,
      });
      continue;
    }

    seen.add(lower);
    valid.push({
      email: sanitizedEmail,
      name: name?.trim() || sanitizedEmail,
    });
  }

  return { valid, invalid };
}

function escapeHtml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildHtmlBody(body, isHTML) {
  if (isHTML) {
    return body;
  }

  const safe = escapeHtml(body || '');
  const withBreaks = safe.replace(/\r?\n/g, '<br>');
  return `<div style="font-family: Arial, sans-serif; line-height: 1.5;">${withBreaks}</div>`;
}

function buildPlainTextBody(body, isHTML) {
  if (!body) {
    return '';
  }

  if (!isHTML) {
    return body;
  }

  return body
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function resolveReplyTo(requestedReplyTo, clubData = {}) {
  const requested = sanitizeEmail(requestedReplyTo);
  if (requested) {
    return requested;
  }

  const candidateKeys = [
    'replyToEmail',
    'email',
    'contactEmail',
    'infoEmail',
    'supportEmail',
    'managerEmail',
  ];

  for (const key of candidateKeys) {
    const candidate = sanitizeEmail(clubData[key]);
    if (candidate) {
      return candidate;
    }
  }

  return null;
}

async function checkAdminPermissions(userId, clubId, userEmail) {
  try {
    const clubDoc = await db.collection('clubs').doc(clubId).get();
    if (!clubDoc.exists) {
      console.log('❌ Club non trovato:', clubId);
      return false;
    }

    const clubData = clubDoc.data();
    if (clubData.owner === userId) {
      console.log('✅ [Permissions] Admin verificato: Club owner');
      return true;
    }

    if (Array.isArray(clubData.admins) && clubData.admins.includes(userId)) {
      console.log('✅ [Permissions] Admin verificato: Club admins array');
      return true;
    }

    if (Array.isArray(clubData.adminEmails) && clubData.adminEmails.includes(userEmail)) {
      console.log('✅ [Permissions] Admin verificato: AdminEmails');
      return true;
    }

    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.clubs && userData.clubs[clubId]?.role === 'admin') {
        console.log('✅ [Permissions] Admin verificato: Users collection');
        return true;
      }
    }

    const profileDoc = await db.collection('profiles').doc(userId).get();
    if (profileDoc.exists) {
      const profileData = profileDoc.data();
      if (profileData.adminClubs && profileData.adminClubs.includes(clubId)) {
        console.log('✅ [Permissions] Admin verificato: Profiles collection');
        return true;
      }
    }

    const affiliationSnap = await db
      .collection('affiliations')
      .where('userId', '==', userId)
      .where('clubId', '==', clubId)
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (!affiliationSnap.empty) {
      console.log('✅ [Permissions] Admin verificato: Affiliations collection');
      return true;
    }

    console.log('❌ [Permissions] Nessun permesso admin trovato');
    return false;
  } catch (error) {
    console.error('❌ [Permissions] Errore durante verifica:', error.message);
    return false;
  }
}

export const sendClubEmail = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 300,
    secrets: ['EMAIL_USER', 'EMAIL_PASSWORD', 'FROM_EMAIL', 'SENDGRID_API_KEY'],
  },
  async (request) => {
    console.log('🚀 [sendClubEmail] INIZIO - Function chiamata');
    console.log('🔑 [sendClubEmail] Secrets disponibili:', {
      FROM_EMAIL: process.env.FROM_EMAIL ? `${process.env.FROM_EMAIL.substring(0, 10)}...` : 'MISSING',
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? `${process.env.SENDGRID_API_KEY.substring(0, 10)}... (${process.env.SENDGRID_API_KEY.length} chars)` : 'MISSING',
      EMAIL_USER: process.env.EMAIL_USER ? 'present' : 'MISSING',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'present' : 'MISSING',
    });
    
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = request.auth.uid;
    const userEmail = request.auth.token.email || 'unknown';
    const { clubId, recipients, subject, body, isHTML = false, replyTo } = request.data || {};

    console.log('📋 [sendClubEmail] Request data:', { clubId, userId, userEmail, recipientsCount: recipients?.length, subject });

    if (!clubId || typeof clubId !== 'string') {
      throw new HttpsError('invalid-argument', 'clubId is required');
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new HttpsError(
        'invalid-argument',
        'recipients array is required and must not be empty'
      );
    }

    if (!subject || typeof subject !== 'string') {
      throw new HttpsError('invalid-argument', 'subject is required');
    }

    if (!body || typeof body !== 'string') {
      throw new HttpsError('invalid-argument', 'body is required');
    }

    const { valid: validRecipients, invalid: invalidRecipients } = splitRecipients(recipients);
    if (validRecipients.length === 0) {
      throw new HttpsError('invalid-argument', 'No valid recipient email addresses provided', {
        invalidRecipients,
      });
    }

    console.log('📨 [sendClubEmail] Inizio invio email', {
      clubId,
      userId,
      userEmail,
      requestedRecipients: recipients.length,
      validRecipients: validRecipients.length,
      invalidRecipients: invalidRecipients.length,
      subject,
    });

    const isAdmin = await checkAdminPermissions(userId, clubId, userEmail);
    if (!isAdmin) {
      throw new HttpsError('permission-denied', 'User is not an admin of this club');
    }

    const clubDoc = await db.collection('clubs').doc(clubId).get();
    if (!clubDoc.exists) {
      throw new HttpsError('not-found', 'Club not found');
    }

    const clubData = clubDoc.data() || {};
    const clubName = clubData.name || 'Club';

    const htmlBody = buildHtmlBody(body, isHTML);
    const textBody = buildPlainTextBody(body, isHTML);
    const replyToEmail = resolveReplyTo(replyTo, clubData);
    const replyToHeader = replyToEmail ? { email: replyToEmail, name: clubName } : null;

    const details = [];
    let sent = 0;
    let failed = 0;

    console.log('📧 [sendClubEmail] Invio email a', validRecipients.length, 'destinatari');
    
    const sendResults = await Promise.allSettled(
      validRecipients.map((recipient) =>
        emailService.sendEmail({
          to: recipient.email,
          subject,
          text: textBody,
          html: htmlBody,
          replyTo: replyToHeader,
          type: 'club-broadcast',
          clubId,
        })
      )
    );

    console.log('📊 [sendClubEmail] Risultati Promise.allSettled:', sendResults.map((r, i) => ({
      recipient: validRecipients[i].email,
      status: r.status,
      value: r.status === 'fulfilled' ? r.value : undefined,
      reason: r.status === 'rejected' ? r.reason?.message : undefined,
    })));

    sendResults.forEach((result, index) => {
      const recipient = validRecipients[index];
      console.log(`📋 [sendClubEmail] Risultato ${index + 1}/${sendResults.length}:`, {
        email: recipient.email,
        status: result.status,
        fulfilled: result.status === 'fulfilled',
        value: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason?.message : null,
      });
      
      if (result.status === 'fulfilled') {
        sent += 1;
        details.push({
          success: true,
          email: recipient.email,
          name: recipient.name,
          provider: result.value.service,
          attempt: result.value.attempt,
        });
      } else {
        failed += 1;
        details.push({
          success: false,
          email: recipient.email,
          name: recipient.name,
          error: result.reason?.message || 'Unknown error',
        });
      }
    });

    invalidRecipients.forEach((item) => {
      failed += 1;
      details.push({
        success: false,
        email: item.email || null,
        name: item.name || null,
        error: item.reason,
      });
    });

    const response = {
      success: failed === 0,
      total: validRecipients.length + invalidRecipients.length,
      sent,
      failed,
      invalid: invalidRecipients.length,
      from: DEFAULT_FROM_EMAIL,
      replyTo: replyToEmail,
      clubId,
      clubName,
      details,
    };

    console.log('📊 [sendClubEmail] Risultati invio', {
      clubId,
      sent,
      failed,
      invalid: invalidRecipients.length,
    });

    if (sent === 0) {
      throw new HttpsError('internal', 'No emails were sent', response);
    }

    return response;
  }
);
