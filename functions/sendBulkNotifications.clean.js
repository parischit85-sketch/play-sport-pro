// =============================================
// FILE: functions/sendBulkNotifications.clean.js
// Cloud Function callable per invio notifiche certificati con fallback intelligente
// Supporta: email, push, auto (determina automaticamente il canale migliore)
// VERSION: 2.1.0 - Optimized queries (userId + orderBy only)
// =============================================

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import webpush from 'web-push';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { saveUserNotification } from './userNotifications.js';

// Inizializza Admin SDK una sola volta
if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

// =============================================
// CONFIGURAZIONE EMAIL (runtime, dopo che i secrets sono caricati)
// =============================================
let emailConfig = null;

function getEmailConfig() {
  if (!emailConfig) {
    // Sanitize env vars (trim CRLF and spaces)
    const rawEmailUser = process.env.EMAIL_USER || '';
    const rawFromEmail = process.env.FROM_EMAIL || '';
    const EMAIL_USER = String(rawEmailUser).replace(/\r|\n/g, '').trim();
    const FROM_EMAIL_RAW = String(rawFromEmail).replace(/\r|\n/g, '').trim();
    const SENDGRID_ENABLED = !!process.env.SENDGRID_API_KEY;
    const NODEMAILER_ENABLED = !!(EMAIL_USER && process.env.EMAIL_PASSWORD);

    // SMTP override envs
    const SMTP_HOST = (process.env.SMTP_HOST || '').trim();
    const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
    const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

    // Normalize emails for detection
    const emailUserLower = EMAIL_USER.toLowerCase();
    const fromEmailLower = FROM_EMAIL_RAW.toLowerCase();
    const isGmailUser = /@gmail\.com$|@googlemail\.com$/.test(emailUserLower);
    const isPlaySportDomain =
      emailUserLower.endsWith('@play-sport.pro') || fromEmailLower.endsWith('@play-sport.pro');

    // Prefer a safe "from" that matches the authenticated account when using Gmail
    // Otherwise use provided FROM_EMAIL or fallback to EMAIL_USER or noreply
    let effectiveFrom = FROM_EMAIL_RAW || EMAIL_USER || 'noreply@play-sport.pro';
    effectiveFrom = String(effectiveFrom).replace(/\r|\n/g, '').trim();

    let transporter = null;
    let provider = 'none';

    if (NODEMAILER_ENABLED) {
      if (SMTP_HOST) {
        // Explicit SMTP configuration (recommended for non-Gmail domains)
        transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_SECURE,
          auth: {
            user: EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        });
        provider = 'smtp';
        console.log('📧 [Email Provider] Using explicit SMTP', {
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_SECURE,
        });
      } else if (isGmailUser) {
        // Gmail account
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        });
        provider = 'gmail';
        // Force from to the authenticated Gmail to pass DMARC/Sender Policy
        effectiveFrom = EMAIL_USER;
        console.log('📧 [Email Provider] Using Gmail via Nodemailer');
      } else if (isPlaySportDomain) {
        // Heuristic for play-sport.pro SMTP (can override with SMTP_HOST env)
        transporter = nodemailer.createTransport({
          host: 'smtp.register.it',
          port: 587,
          secure: false,
          auth: {
            user: EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        });
        provider = 'smtp';
        console.log(
          '📧 [Email Provider] Using Register.it SMTP defaults (override with SMTP_HOST if needed)'
        );
      } else {
        // Generic SMTP guess based on domain (best-effort)
        const domain = EMAIL_USER.split('@')[1] || 'localhost';
        transporter = nodemailer.createTransport({
          host: `smtp.${domain}`,
          port: 587,
          secure: false,
          auth: {
            user: EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        });
        provider = 'smtp';
        console.log('📧 [Email Provider] Using generic SMTP guess', {
          host: `smtp.${domain}`,
          port: 587,
        });
      }
    }

    // SendGrid kept available but disabled by default to avoid "Forbidden" on unverified sender
    const sendgridEnabled = false && SENDGRID_ENABLED;

    console.log('🔧 [Email Config]', {
      sendgridEnabled: sendgridEnabled,
      nodemailerEnabled: NODEMAILER_ENABLED,
      provider,
      fromEmail: effectiveFrom,
    });

    emailConfig = {
      sendgridEnabled: sendgridEnabled,
      nodemailerEnabled: NODEMAILER_ENABLED,
      fromEmail: effectiveFrom,
      transporter,
      provider,
      replyToPreferred: true, // prefer setting Reply-To to club email
    };
  }
  return emailConfig;
}

// =============================================
// CONFIGURAZIONE WEB PUSH (VAPID)
// =============================================
// Sanitize VAPID keys from env (trim, strip quotes/newlines, enforce URL-safe)
function sanitizeVapidKey(key) {
  if (!key) return '';
  let k = String(key).trim();
  // rimuove apici accidentali
  k = k.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
  // normalizza spazi e newline
  k = k.replace(/\r|\n|\s+/g, '');
  // forza URL-safe base64
  k = k.replace(/\+/g, '-').replace(/\//g, '_');
  // rimuovi padding '=' se presente (web-push richiede senza '=')
  k = k.replace(/=+$/g, '');
  return k;
}

const RAW_VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const RAW_VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_PUBLIC_KEY = sanitizeVapidKey(RAW_VAPID_PUBLIC_KEY);
const VAPID_PRIVATE_KEY = sanitizeVapidKey(RAW_VAPID_PRIVATE_KEY);
const WEB_PUSH_ENABLED = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
let WEB_PUSH_READY = false;

console.log('🔧 [Web Push Config]', {
  publicKeyPresent: !!VAPID_PUBLIC_KEY,
  privateKeyPresent: !!VAPID_PRIVATE_KEY,
  enabled: WEB_PUSH_ENABLED,
  publicKeyPreview: VAPID_PUBLIC_KEY ? `${VAPID_PUBLIC_KEY.substring(0, 20)}...` : 'MISSING',
  diagnostics: {
    rawPublicLen: (RAW_VAPID_PUBLIC_KEY || '').length,
    rawPrivateLen: (RAW_VAPID_PRIVATE_KEY || '').length,
    hasEqPublic: /=/.test(RAW_VAPID_PUBLIC_KEY || ''),
    hasEqPrivate: /=/.test(RAW_VAPID_PRIVATE_KEY || ''),
  },
});

if (WEB_PUSH_ENABLED) {
  try {
    webpush.setVapidDetails('mailto:support@play-sport.pro', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    WEB_PUSH_READY = true;
    console.log('✅ Web Push VAPID configured successfully');
  } catch (e) {
    WEB_PUSH_READY = false;
    console.warn('⚠️ Web Push VAPID configuration failed:', e?.message || e);
  }
} else {
  console.warn('⚠️ Web Push disabled: VAPID keys not found in environment');
}

// =============================================
// HELPER: determina canale ottimale per utente
// =============================================
async function determineOptimalChannel(userId, hasEmail) {
  console.log('🔍 [determineOptimalChannel] Checking for user:', userId, 'hasEmail:', hasEmail);
  console.log('🔍 [determineOptimalChannel] Starting pushSubscriptions query...');

  try {
    // Verifica se l'utente ha subscriptions push attive
    // Query SENZA orderBy per evitare problemi se manca createdAt
    const subsSnap = await db.collection('pushSubscriptions').where('userId', '==', userId).get();

    console.log('🔍 [determineOptimalChannel] Query completed. Docs found:', subsSnap.size);

    // Filtra in memoria per isActive e expiresAt
    const now = new Date().toISOString();
    const hasPushSubscription =
      !subsSnap.empty &&
      subsSnap.docs.some((doc) => {
        const data = doc.data();
        const isValid = data.isActive === true && (!data.expiresAt || data.expiresAt > now);
        console.log('🔍 [determineOptimalChannel] Doc data:', {
          id: doc.id,
          isActive: data.isActive,
          expiresAt: data.expiresAt,
          createdAt: data.createdAt,
          now,
          isValid,
          hasEndpoint: !!(data.endpoint || data.subscription?.endpoint),
          type: data.type,
        });
        return isValid;
      });

    console.log(
      '🔍 [determineOptimalChannel] hasPushSubscription:',
      hasPushSubscription,
      'subs found:',
      subsSnap.size
    );

    // Logica di priorità per canale:
    // 1. Push (se disponibile) - migliore UX
    // 2. Email (se disponibile)
    // 3. Nessuno

    if (hasPushSubscription) {
      console.log('🔍 [determineOptimalChannel] Returning: push');
      return 'push';
    } else if (hasEmail && EMAIL_PROVIDER !== 'none') {
      console.log(
        '🔍 [determineOptimalChannel] Returning: email (EMAIL_PROVIDER:',
        EMAIL_PROVIDER,
        ')'
      );
      return 'email';
    } else {
      console.log('🔍 [determineOptimalChannel] Returning: null (no channel available)');
      return null; // Nessun canale disponibile
    }
  } catch (error) {
    console.error('❌ [determineOptimalChannel] Query error:', error);
    console.error('❌ [determineOptimalChannel] Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack?.substring(0, 500),
    });
    // In caso di errore, fallback a email se disponibile
    if (hasEmail && EMAIL_PROVIDER !== 'none') {
      console.log('🔍 [determineOptimalChannel] Fallback to email due to push query error');
      return 'email';
    }
    return null;
  }
} // =============================================
// HELPER: lifecycle management subscriptions
// =============================================
async function cleanupExpiredSubscriptions() {
  try {
    const now = new Date().toISOString();
    console.log('🧹 [Cleanup] Starting expired subscriptions cleanup at:', now);

    // Trova subscriptions scadute (più vecchie di 7 giorni)
    const expiredSubs = await db
      .collection('pushSubscriptions')
      .where('expiresAt', '<', now)
      .where('isActive', '==', true)
      .get();

    console.log('🧹 [Cleanup] Found', expiredSubs.size, 'expired subscriptions');

    if (!expiredSubs.empty) {
      const batch = db.batch();
      expiredSubs.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isActive: false,
          deactivatedAt: now,
          deactivationReason: 'expired',
        });
      });

      await batch.commit();
      console.log('🧹 [Cleanup] Deactivated', expiredSubs.size, 'expired subscriptions');
    }

    // Trova subscriptions duplicate per user/device (mantieni solo la più recente)
    const usersSnap = await db.collection('pushSubscriptions').where('isActive', '==', true).get();
    const userDevices = new Map();

    usersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const key = `${data.userId}-${data.deviceId}`;

      if (!userDevices.has(key)) {
        userDevices.set(key, []);
      }
      userDevices.get(key).push({ id: doc.id, ...data });
    });

    let duplicatesRemoved = 0;
    const duplicateBatch = db.batch();

    for (const [key, subs] of userDevices) {
      if (subs.length > 1) {
        // Ordina per lastUsedAt (più recente prima)
        subs.sort(
          (a, b) => new Date(b.lastUsedAt || b.createdAt) - new Date(a.lastUsedAt || a.createdAt)
        );

        // Mantieni solo la prima (più recente), disattiva le altre
        for (let i = 1; i < subs.length; i++) {
          duplicateBatch.update(db.collection('pushSubscriptions').doc(subs[i].id), {
            isActive: false,
            deactivatedAt: now,
            deactivationReason: 'duplicate-device',
          });
          duplicatesRemoved++;
        }
      }
    }

    if (duplicatesRemoved > 0) {
      await duplicateBatch.commit();
      console.log('🧹 [Cleanup] Removed', duplicatesRemoved, 'duplicate subscriptions');
    }

    return {
      expiredDeactivated: expiredSubs.size,
      duplicatesRemoved,
      totalProcessed: usersSnap.size,
    };
  } catch (error) {
    console.error('🧹 [Cleanup] Error during cleanup:', error);
    throw error;
  }
}

// =============================================
// HELPER: analytics notifiche
// =============================================
async function trackNotificationEvent(eventData) {
  try {
    const event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    await db.collection('notificationEvents').add(event);
    console.log('📊 [Analytics] Tracked event:', event.type, 'for user:', event.userId);
  } catch (error) {
    console.error('📊 [Analytics] Failed to track event:', error);
    // Non bloccare l'invio della notifica per errori di analytics
  }
}

// =============================================
// HELPER: invio email
// =============================================
async function sendEmailNotification(player, club, status) {
  const { email, name } = player;
  if (!email || !email.includes('@')) {
    throw new Error('Email non valida');
  }

  const config = getEmailConfig();
  if (!config.sendgridEnabled && !config.nodemailerEnabled) {
    throw new Error('Nessun servizio email configurato');
  }

  const { daysUntilExpiry, expiryDate } = status || {};
  const isMissing = status?.type === 'missing' || expiryDate == null;
  const isExpired = !isMissing && typeof daysUntilExpiry === 'number' && daysUntilExpiry < 0;

  let subject;
  let html;
  if (isMissing) {
    subject = `⚠️ Certificato medico mancante - ${club.name}`;
    html = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>${club.name}</h2>
          <p>Ciao ${name},</p>
          <p>Non risulta alcun certificato medico caricato a sistema.</p>
          <p>Per poter partecipare alle attività è necessario caricare un certificato medico valido.</p>
          <p>Accedi all'area personale dell'app/portale per caricarlo oppure consegnalo in segreteria.</p>
        </body>
      </html>
    `;
  } else {
    const urgencyEmoji = isExpired ? '🚨' : daysUntilExpiry <= 7 ? '⚠️' : '⏰';
    subject = `${urgencyEmoji} Certificato medico - ${club.name}`;
    html = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>${club.name}</h2>
          <p>Ciao ${name},</p>
          <p>Il tuo certificato ${isExpired ? 'è scaduto' : `scade tra ${daysUntilExpiry} giorni`}.</p>
          <p><strong>Scadenza:</strong> ${expiryDate}</p>
        </body>
      </html>
    `;
  }

  // Always send From the authenticated account (config.fromEmail) to avoid DMARC/SPF issues,
  // and set Reply-To to the club address if available.
  const clubReplyTo =
    club?.email || club?.contactEmail || club?.infoEmail || club?.supportEmail || null;
  const fromEmail = config.fromEmail;
  const fromName = club?.name || 'Play-Sport.pro';

  // Prova SendGrid
  if (config.sendgridEnabled) {
    const msg = {
      to: email,
      from: { email: fromEmail, name: fromName },
      subject,
      html,
    };
    if (clubReplyTo) msg.replyTo = clubReplyTo;
    await sgMail.send(msg);
    return;
  }

  // Fallback Nodemailer
  if (config.nodemailerEnabled) {
    const mail = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject,
      html,
    };
    if (clubReplyTo) mail.replyTo = clubReplyTo;

    // Enforce a hard timeout to avoid hanging the callable
    const SEND_TIMEOUT_MS = 15000;
    await Promise.race([
      config.transporter.sendMail(mail),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP timeout after 15s')), SEND_TIMEOUT_MS)
      ),
    ]);
  }
}

// =============================================
// HELPER: invio push (Web Push)
// =============================================
async function sendPushNotificationToUser(userId, notification, playerData = null) {
  // SEMPRE usa firebaseUid - le pushSubscriptions sono salvate SOLO con firebaseUid
  const firebaseUid = playerData?.firebaseUid || playerData?.linkedFirebaseUid;

  if (!firebaseUid) {
    console.warn('⚠️ [sendPushNotificationToUser] No Firebase UID available', {
      clubUserId: userId,
      playerData: {
        hasFirebaseUid: 'firebaseUid' in (playerData || {}),
        hasLinkedFirebaseUid: 'linkedFirebaseUid' in (playerData || {}),
      },
    });
    throw new Error('Firebase UID richiesto per push notifications');
  }

  console.log('📱 [sendPushNotificationToUser] Starting...', {
    clubUserId: userId,
    firebaseUid,
    lookupStrategy: 'SEMPRE firebaseUid (schema pushSubscriptions corretto)',
    notificationTitle: notification?.title,
    notificationBody: notification?.body,
    notificationData: notification?.data,
    webPushEnabled: WEB_PUSH_ENABLED,
    webPushReady: WEB_PUSH_READY,
    vapidConfigured: !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY),
    hasPlayerData: !!playerData,
    playerDataKeys: playerData ? Object.keys(playerData) : [],
  });

  if (!WEB_PUSH_ENABLED) {
    console.error('❌ [Push] VAPID keys not configured!', {
      publicKeyPresent: !!VAPID_PUBLIC_KEY,
      privateKeyPresent: !!VAPID_PRIVATE_KEY,
      envVarsList: Object.keys(process.env).filter((k) => k.includes('VAPID')),
    });
    throw new Error('Servizio Push non configurato (VAPID mancante) [push-service-unconfigured]');
  }

  if (!WEB_PUSH_READY) {
    console.error('❌ [Push] Web Push not ready: VAPID configuration failed.');
    throw new Error(
      'Servizio Push non pronto (configurazione VAPID non valida) [push-service-misconfigured]'
    );
  }

  // Recupera tutte le sottoscrizioni da Firestore usando firebaseUid
  console.log('🔍 [Push] Querying pushSubscriptions', {
    firebaseUid,
    clubUserId: userId,
    collection: 'pushSubscriptions',
    queryField: 'firebaseUid',
    queryValue: firebaseUid,
    queryType: typeof firebaseUid,
  });

  // Query con firebaseUid (campo corretto nel documento)
  const subsSnap = await db
    .collection('pushSubscriptions')
    .where('firebaseUid', '==', firebaseUid)
    .get();

  console.log('📊 [Push] Query completed:', {
    totalDocs: subsSnap.size,
    isEmpty: subsSnap.empty,
    docIds: subsSnap.docs.map((d) => d.id),
    firebaseUidQueried: firebaseUid,
  });

  // 🔧 MULTI-DEVICE: NON eliminiamo subscription duplicate dello stesso utente!
  // Un utente può avere più dispositivi (PC, telefono, tablet) attivi contemporaneamente.
  // Invieremo la notifica a TUTTI i dispositivi e elimineremo solo quelli con errori (404/410).
  if (subsSnap.size > 1) {
    console.log(
      `📱 [Push] Found ${subsSnap.size} active devices for user ${firebaseUid} - will send to all`
    );
  }

  if (subsSnap.size === 0) {
    console.warn('⚠️ [Push] No subscriptions found at all for user:', {
      firebaseUid,
      clubUserId: userId,
      queryExecuted: 'pushSubscriptions.where(firebaseUid, ==, ' + firebaseUid + ')',
      suggestion: 'Verifica che il documento abbia il campo firebaseUid corretto',
    });
  } else {
    console.log(
      '📄 [Push] All subscriptions (before filtering):',
      subsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          firebaseUid: data.firebaseUid,
          endpoint: data.endpoint?.substring(0, 50) + '...',
          active: data.active,
          isActive: data.isActive,
          deviceId: data.deviceId,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt,
        };
      })
    );
  }

  // Filtra in memoria per isActive e expiresAt
  const now = new Date().toISOString();
  const validDocs = subsSnap.docs.filter((doc) => {
    const data = doc.data();

    // Log RAW data prima di processare
    console.log('🔍 [Push] RAW document data:', {
      id: doc.id,
      rawActive: data.active,
      rawIsActive: data.isActive,
      rawExpiresAt: data.expiresAt,
      rawType: data.type,
    });

    // Supporta sia 'active' che 'isActive' (schema flessibile)
    const activeField = data.active !== undefined ? data.active : data.isActive;
    // Se expiresAt non esiste, la subscription è valida (non scade)
    const isValid = activeField === true && (!data.expiresAt || data.expiresAt > now);

    console.log('🔍 [Push] Validation result:', {
      id: doc.id,
      activeField,
      expiresAt: data.expiresAt,
      now,
      isValid,
      validationReason: isValid
        ? 'OK'
        : activeField !== true
          ? 'not active (value: ' + activeField + ')'
          : 'expired',
      deviceId: data.deviceId,
    });

    return isValid;
  });

  console.log('📊 [Push] Subscriptions found:', subsSnap.size, 'valid:', validDocs.length);

  if (validDocs.length > 0) {
    console.log(
      '✅ [Push] Valid subscription IDs:',
      validDocs.map((d) => d.id)
    );
    validDocs.forEach((doc, i) => {
      const data = doc.data();
      const endpoint = data.endpoint || data.subscription?.endpoint;
      const keys = data.keys || data.subscription?.keys;
      console.log(`📄 [Push] Subscription ${i + 1}:`, {
        id: doc.id,
        type: data.type,
        endpoint: endpoint ? endpoint.substring(0, 50) + '...' : 'MISSING',
        hasKeys: !!(keys?.p256dh && keys?.auth),
        deviceId: data.deviceId,
      });
    });
  }

  if (validDocs.length === 0) {
    console.warn('⚠️ [Push] No active subscriptions found for user:', userId);
    throw new Error(
      'Nessuna sottoscrizione push attiva trovata per questo utente [push-no-subscription]'
    );
  }

  const payload = JSON.stringify(notification);
  const invalidDocs = [];
  const results = await Promise.allSettled(
    validDocs.map(async (doc) => {
      const data = doc.data();
      // Support both schemas: top-level endpoint/keys or nested under subscription
      const sub = {
        endpoint: data.endpoint || data.subscription?.endpoint,
        keys: data.keys || data.subscription?.keys,
      };

      console.log('📤 [Push] Sending to subscription:', {
        docId: doc.id,
        endpoint: sub.endpoint ? sub.endpoint.substring(0, 50) + '...' : 'MISSING',
        hasKeys: !!(sub.keys?.p256dh && sub.keys?.auth),
      });

      try {
        await webpush.sendNotification(sub, payload);

        console.log('✅ [Push] Notification sent successfully:', {
          docId: doc.id,
          endpoint: sub.endpoint?.substring(0, 50) + '...',
        });

        // Aggiorna lastUsedAt per questa subscription
        await doc.ref.update({
          lastUsedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Rinnova expiry
        });
      } catch (err) {
        console.error('❌ [Push] Failed to send notification:', {
          docId: doc.id,
          endpoint: sub.endpoint?.substring(0, 50) + '...',
          errorMessage: err?.message,
          errorStatusCode: err?.statusCode || err?.status || err?.code,
          errorBody: err?.body,
          errorStack: err?.stack?.substring(0, 200),
        });

        // Se la sottoscrizione non è più valida, segna per eliminazione
        const msg = String(err?.message || '').toLowerCase();
        const statusCode = err?.statusCode || err?.status || err?.code;
        // Considera invalide anche 401/403 (VAPID mismatch o unauthorized) oltre a 404/410
        if (
          statusCode === 404 ||
          statusCode === 410 ||
          statusCode === 401 ||
          statusCode === 403 ||
          msg.includes('gone') ||
          msg.includes('unsubscribed') ||
          msg.includes('unauthorized') ||
          msg.includes('forbidden') ||
          msg.includes('unauth') ||
          msg.includes('vapid')
        ) {
          console.warn('🗑️ [Push] Marking subscription as invalid (will be deleted):', doc.id);
          invalidDocs.push(doc.id);
        }
        throw err;
      }
    })
  );

  // Log dettagliato dei risultati Promise.allSettled
  console.log('📊 [Push] Promise.allSettled results:', {
    total: results.length,
    fulfilled: results.filter((r) => r.status === 'fulfilled').length,
    rejected: results.filter((r) => r.status === 'rejected').length,
  });

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error('❌ [Push] Subscription send failed:', {
        index,
        reason: result.reason?.message || result.reason,
        statusCode: result.reason?.statusCode,
        stack: result.reason?.stack?.substring(0, 200),
      });
    } else {
      console.log('✅ [Push] Subscription send succeeded:', { index });
    }
  });

  // Pulisce sottoscrizioni non valide
  if (invalidDocs.length > 0) {
    console.log('🗑️ [Push] Deleting invalid subscriptions:', invalidDocs);
    await Promise.all(invalidDocs.map((id) => db.collection('pushSubscriptions').doc(id).delete()));
  }

  // Determina se almeno un invio è andato a buon fine
  const atLeastOneSuccess = results.some((r) => r.status === 'fulfilled');
  if (!atLeastOneSuccess) {
    const firstRej = results.find((r) => r.status === 'rejected');
    console.error('❌ [Push] ALL sends failed. First rejection:', {
      message: firstRej?.reason?.message,
      statusCode: firstRej?.reason?.statusCode,
      fullReason: firstRej?.reason,
    });
    throw new Error(firstRej?.reason?.message || 'Invio push fallito');
  }
}

// =============================================
// HELPER: invio push nativo (FCM per Android, APNs per iOS)
// =============================================
async function sendNativePushNotification(userId, notification) {
  console.log('📱 [sendNativePush] Starting for user:', userId);

  // Query native push subscriptions (type: 'native')
  // Query semplificata per evitare problemi con indici compositi
  const nativeSubsSnap = await db
    .collection('pushSubscriptions')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  // Filtra in memoria per type, isActive e expiresAt
  const now = new Date().toISOString();
  const validNativeDocs = nativeSubsSnap.docs.filter((doc) => {
    const data = doc.data();
    return data.type === 'native' && data.isActive === true && (data.expiresAt || '') > now;
  });

  console.log(
    '📊 [Native Push] Found subscriptions:',
    nativeSubsSnap.size,
    'valid native:',
    validNativeDocs.length
  );

  if (validNativeDocs.length === 0) {
    console.warn('⚠️ [Native Push] No native subscriptions for user:', userId);
    throw new Error('Nessuna sottoscrizione nativa trovata [native-push-no-subscription]');
  }

  const messaging = getMessaging();
  const results = [];
  const invalidDocs = [];

  for (const doc of validNativeDocs) {
    const sub = doc.data();
    const token = sub.fcmToken || sub.apnsToken;
    const platform = sub.platform; // 'android' | 'ios'

    if (!token) {
      console.warn('[Native Push] Missing token in subscription:', doc.id);
      invalidDocs.push(doc.id);
      continue;
    }

    try {
      // Costruisci messaggio FCM (compatibile con sia Android che iOS)
      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: {
            icon: notification.icon || '/icon-192x192.png',
            color: '#1976d2',
            tag: notification.tag,
            clickAction: notification.data?.url || '/',
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
              alert: {
                title: notification.title,
                body: notification.body,
              },
            },
          },
          fcmOptions: {
            imageUrl: notification.icon,
          },
        },
      };

      console.log(`[Native Push] Sending to ${platform} device:`, token.substring(0, 20) + '...');
      await messaging.send(message);

      // Update lastUsedAt
      await doc.ref.update({
        lastUsedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

      results.push({ success: true, platform });
    } catch (error) {
      console.error(`[Native Push] Error sending to ${platform}:`, error.message);

      // Handle token errors (invalid/expired)
      const errorCode = error?.code || error?.errorInfo?.code;
      if (
        errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered' ||
        errorCode === 'messaging/invalid-argument'
      ) {
        console.log('[Native Push] Token invalid, marking for deletion:', doc.id);
        invalidDocs.push(doc.id);
      }

      results.push({ success: false, platform, error: error.message });
    }
  }

  // Cleanup invalid tokens
  if (invalidDocs.length > 0) {
    await Promise.all(
      invalidDocs.map(async (id) => {
        await db.collection('pushSubscriptions').doc(id).update({
          isActive: false,
          deactivatedAt: new Date().toISOString(),
          deactivationReason: 'invalid-token',
        });
      })
    );
    console.log('[Native Push] Deactivated', invalidDocs.length, 'invalid subscriptions');
  }

  const successCount = results.filter((r) => r.success).length;
  if (successCount === 0) {
    throw new Error('Tutti gli invii nativi sono falliti [native-push-all-failed]');
  }

  console.log(`[Native Push] Sent successfully to ${successCount}/${results.length} devices`);
  return { successCount, totalDevices: results.length, results };
}

// =============================================
// HELPER: invio push unificato (prova native, fallback a web push)
// =============================================
async function sendUnifiedPushNotification(userId, notification, playerData = null) {
  const firebaseUid = playerData?.firebaseUid || playerData?.linkedFirebaseUid;
  const linkedUid = playerData?.linkedFirebaseUid;
  const nativeLookupId = firebaseUid || linkedUid || userId;
  console.log('[Unified Push] Attempting notification', {
    originalUserId: userId,
    nativeLookupId,
    hasPlayerData: !!playerData,
    playerHasFirebaseUid: !!firebaseUid,
    playerHasLinkedFirebaseUid: !!linkedUid,
  });

  // 1) Try native push first (FCM/APNs)
  try {
    const nativeResult = await sendNativePushNotification(nativeLookupId, notification);
    console.log('[Unified Push] Native push successful:', nativeResult);
    return { method: 'native', ...nativeResult };
  } catch (nativeError) {
    console.warn('[Unified Push] Native push failed:', nativeError.message);

    // 2) Fallback to Web Push (passa playerData per lookup corretto)
    try {
      await sendPushNotificationToUser(userId, notification, playerData);
      console.log('[Unified Push] Web push fallback successful');
      return { method: 'web-push-fallback', nativeError: nativeError.message };
    } catch (webError) {
      console.error('[Unified Push] Both native and web push failed');
      throw new Error(
        `Push notification failed: Native (${nativeError.message}), Web (${webError.message}) [push-no-subscription]`
      );
    }
  }
}

// =============================================
// CLOUD FUNCTION: sendBulkCertificateNotifications (callable)
// =============================================
export const sendBulkCertificateNotifications = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 300,
    // Secrets necessari per email e push notifications
    secrets: ['EMAIL_USER', 'EMAIL_PASSWORD', 'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'],
  },
  async (request) => {
    const { data, auth } = request;

    // Auth richiesta
    if (!auth || !auth.uid) {
      throw new HttpsError('unauthenticated', 'Autenticazione richiesta');
    }

    // Validazione input
    const { clubId, playerIds, notificationType } = data || {};
    if (!clubId || typeof clubId !== 'string') {
      throw new HttpsError('invalid-argument', 'clubId è richiesto');
    }
    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      throw new HttpsError('invalid-argument', 'playerIds deve essere un array non vuoto');
    }
    if (!['email', 'push', 'auto'].includes(notificationType)) {
      throw new HttpsError(
        'invalid-argument',
        'notificationType deve essere "email", "push" o "auto"'
      );
    }

    // Verifica permessi admin
    const clubRef = db.collection('clubs').doc(clubId);
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) {
      throw new HttpsError('not-found', 'Club non trovato');
    }
    const club = clubDoc.data();

    // 1) Owner del club
    const isOwner = club?.ownerId === auth.uid;

    // 2) Admin tramite campo "admins" nel documento club
    const isAdminFromClub = Array.isArray(club.admins) && club.admins.includes(auth.uid);

    // 3) Admin tramite email presente in adminEmails
    const requesterEmail = (auth?.token?.email || '').toLowerCase();
    const isAdminFromEmailList =
      Array.isArray(club.adminEmails) && requesterEmail
        ? club.adminEmails.map((e) => String(e).toLowerCase()).includes(requesterEmail)
        : false;

    // 4) Admin tramite membership nella sotto-collezione corretta: clubs/{clubId}/users
    const membershipSnap = await clubRef
      .collection('users')
      .where('userId', '==', auth.uid)
      .limit(1)
      .get();
    let isAdminFromMembership = false;
    if (!membershipSnap.empty) {
      const m = membershipSnap.docs[0].data();
      isAdminFromMembership =
        m?.isClubAdmin === true ||
        m?.role === 'admin' ||
        m?.role === 'club_admin' ||
        (Array.isArray(m?.roles) && (m.roles.includes('admin') || m.roles.includes('club_admin')));
    }

    // 5) Admin tramite profilo legacy: clubs/{clubId}/profiles/{uid}
    const profileRef = clubRef.collection('profiles').doc(auth.uid);
    const profileDoc = await profileRef.get();
    const isAdminFromProfile = profileDoc.exists
      ? profileDoc.data()?.isClubAdmin === true || profileDoc.data()?.role === 'club_admin'
      : false;

    // 6) Admin tramite affiliations/{uid}_{clubId}
    const affiliationId = `${auth.uid}_${clubId}`;
    const affiliationDoc = await db.collection('affiliations').doc(affiliationId).get();
    const isAdminFromAffiliation = affiliationDoc.exists
      ? (affiliationDoc.data()?.role === 'club_admin' ||
          affiliationDoc.data()?.isClubAdmin === true) &&
        (affiliationDoc.data()?.status || 'approved') === 'approved'
      : false;

    const isAdmin =
      isOwner ||
      isAdminFromClub ||
      isAdminFromEmailList ||
      isAdminFromMembership ||
      isAdminFromProfile ||
      isAdminFromAffiliation;

    console.log('🔐 [Permissions] sendBulkCertificateNotifications', {
      clubId,
      uid: auth.uid,
      email: requesterEmail || null,
      isOwner,
      isAdminFromClub,
      isAdminFromEmailList,
      isAdminFromMembership,
      isAdminFromProfile,
      isAdminFromAffiliation,
      final: isAdmin,
    });
    if (!isAdmin) {
      throw new HttpsError('permission-denied', 'Permessi insufficienti per questo club');
    }

    // Determina provider email usando getEmailConfig (lazy init dopo secrets load)
    const config = getEmailConfig();
    const EMAIL_PROVIDER = config.sendgridEnabled
      ? 'sendgrid'
      : config.nodemailerEnabled
        ? 'nodemailer'
        : 'none';
    const EFFECTIVE_FROM = config.fromEmail;

    // Se il tipo è email ma nessun provider è configurato, torna errore chiaro subito
    if (notificationType === 'email' && EMAIL_PROVIDER === 'none') {
      const details = playerIds.map((playerId) => ({
        playerId,
        success: false,
        error:
          'Nessun servizio email configurato (configura SENDGRID_API_KEY o EMAIL_USER/EMAIL_PASSWORD)',
        code: 'email-service-unconfigured',
      }));

      return {
        success: false,
        sent: 0,
        failed: playerIds.length,
        provider: EMAIL_PROVIDER,
        from: EFFECTIVE_FROM,
        replyTo: null,
        details,
      };
    }

    // Elaborazione
    const computedReplyTo =
      club?.email ||
      club?.contactEmail ||
      club?.infoEmail ||
      club?.supportEmail ||
      EFFECTIVE_FROM ||
      null;
    const results = {
      success: false,
      sent: 0,
      failed: 0,
      provider: EMAIL_PROVIDER,
      from: EFFECTIVE_FROM,
      replyTo: computedReplyTo,
      details: [],
    };

    for (const playerId of playerIds) {
      try {
        // 1) Trova l’utente nella sotto-collezione corretta clubs/{clubId}/users
        const usersSnap = await db
          .collection('clubs')
          .doc(clubId)
          .collection('users')
          .where('userId', '==', playerId)
          .limit(1)
          .get();

        // 2) Fallback: profilo legacy clubs/{clubId}/profiles/{playerId}
        const profileDocSnap = await db
          .collection('clubs')
          .doc(clubId)
          .collection('profiles')
          .doc(playerId)
          .get();

        // 3) ULTIMO FALLBACK: collezione globale users (se non trovato nelle collezioni club)
        let globalUserDoc = null;
        if (usersSnap.empty && !profileDocSnap.exists) {
          console.log(
            '🔄 Player not found in club collections, checking global users collection...'
          );
          globalUserDoc = await db.collection('users').doc(playerId).get();
          if (globalUserDoc.exists) {
            console.log('✅ Found player in global users collection, will create club record');
          }
        }

        if (usersSnap.empty && !profileDocSnap.exists && !globalUserDoc?.exists) {
          results.failed++;

          // Track player not found event
          await trackNotificationEvent({
            type: 'failed',
            channel: 'none',
            userId: playerId,
            clubId,
            notificationType: 'certificate',
            platform: 'unknown',
            success: false,
            error: 'Giocatore non trovato nel club',
            errorCode: 'player-not-found',
          });

          results.details.push({
            playerId,
            success: false,
            error: 'Giocatore non trovato nel club',
          });
          continue;
        }

        const clubUser = usersSnap.empty ? null : usersSnap.docs[0].data();
        const profile = profileDocSnap.exists ? profileDocSnap.data() : null;
        const globalUser = globalUserDoc?.exists ? globalUserDoc.data() : null;

        // 🔎 DEBUG LINKAGE: verifica campi firebaseUid / linkedFirebaseUid
        const debugLinkage = {
          playerId,
          clubId,
          clubUserExists: !!clubUser,
          profileExists: !!profile,
          globalUserExists: !!globalUser,
          clubUser_linkedFirebaseUid: clubUser?.linkedFirebaseUid || null,
          clubUser_firebaseUid: clubUser?.firebaseUid || null,
          profile_linkedFirebaseUid: profile?.linkedFirebaseUid || null,
          profile_firebaseUid: profile?.firebaseUid || null,
          global_linkedFirebaseUid: globalUser?.linkedFirebaseUid || null,
          global_firebaseUid: globalUser?.firebaseUid || null,
          chosenLookupId_prePush:
            clubUser?.firebaseUid ||
            clubUser?.linkedFirebaseUid ||
            profile?.firebaseUid ||
            profile?.linkedFirebaseUid ||
            playerId,
          looksLikeFirebaseUid: /^[A-Za-z0-9]{28}$/.test(
            clubUser?.firebaseUid ||
              clubUser?.linkedFirebaseUid ||
              profile?.firebaseUid ||
              profile?.linkedFirebaseUid ||
              ''
          ),
          note: 'Se chosenLookupId_prePush è uguale al club playerId significa che manca il campo firebaseUid/linkedFirebaseUid',
        };
        console.log('🧩 [LinkageDebug] Player linkage status:', debugLinkage);

        // Se trovato nella collezione globale ma non in quelle del club, crea un record temporaneo
        if (globalUser && !clubUser && !profile) {
          console.log('🔄 Creating temporary club user record from global user data...');
          try {
            const clubUserData = {
              userId: playerId,
              firstName: globalUser.firstName || '',
              lastName: globalUser.lastName || '',
              userEmail: globalUser.email || '',
              email: globalUser.email || '',
              userName:
                globalUser.displayName ||
                `${globalUser.firstName || ''} ${globalUser.lastName || ''}`.trim(),
              mergedData: {
                name:
                  globalUser.displayName ||
                  `${globalUser.firstName || ''} ${globalUser.lastName || ''}`.trim(),
                email: globalUser.email || '',
              },
              createdAt: new Date(),
              source: 'global-fallback',
            };

            await db
              .collection('clubs')
              .doc(clubId)
              .collection('users')
              .doc(playerId)
              .set(clubUserData);
            console.log('✅ Created temporary club user record');
          } catch (createError) {
            console.warn('⚠️ Failed to create temporary club user record:', createError.message);
          }
        }

        const player = {
          id: playerId,
          name:
            profile?.name ||
            clubUser?.mergedData?.name ||
            clubUser?.userName ||
            globalUser?.displayName ||
            `${clubUser?.firstName || globalUser?.firstName || ''} ${clubUser?.lastName || globalUser?.lastName || ''}`.trim() ||
            'Giocatore',
          email:
            profile?.email || clubUser?.userEmail || clubUser?.email || globalUser?.email || '',
        };

        console.log('👤 [Player Data] for', playerId, ':', {
          name: player.name,
          email: player.email,
          hasProfile: !!profile,
          hasClubUser: !!clubUser,
          hasGlobalUser: !!globalUser,
          profileEmail: profile?.email,
          clubUserEmail: clubUser?.userEmail || clubUser?.email,
          globalUserEmail: globalUser?.email,
          source: globalUser ? 'global-fallback' : clubUser ? 'club-user' : 'club-profile',
        });

        // Determina il canale da usare
        let actualChannel = notificationType;
        if (notificationType === 'auto') {
          const hasEmail = !!(player.email && player.email.includes('@'));
          console.log(
            '🤖 [Auto Channel] notificationType=auto, hasEmail:',
            hasEmail,
            'EMAIL_PROVIDER:',
            EMAIL_PROVIDER
          );
          actualChannel = await determineOptimalChannel(playerId, hasEmail);

          console.log('🤖 [Auto Channel] determined actualChannel:', actualChannel);

          // Track channel determination for auto mode
          await trackNotificationEvent({
            type: 'channel-determined',
            channel: actualChannel || 'none',
            userId: playerId,
            clubId,
            notificationType: 'certificate',
            platform:
              actualChannel === 'push' ? 'web' : actualChannel === 'email' ? 'email' : 'unknown',
            success: !!actualChannel,
            metadata: {
              requestedType: 'auto',
              determinedChannel: actualChannel,
              hasEmail,
              pushAvailable: actualChannel === 'push',
            },
          });

          if (!actualChannel) {
            results.failed++;

            // Track no channel available event
            await trackNotificationEvent({
              type: 'failed',
              channel: 'none',
              userId: playerId,
              clubId,
              notificationType: 'certificate',
              platform: 'unknown',
              success: false,
              error: 'Nessun canale di notifica disponibile (né push né email)',
              errorCode: 'no-channel-available',
              metadata: {
                hasEmail: !!(player.email && player.email.includes('@')),
                pushChannelAvailable: false, // Will be determined by determineOptimalChannel
              },
            });

            results.details.push({
              playerId,
              playerName: player.name,
              success: false,
              error: 'Nessun canale di notifica disponibile (né push né email)',
              code: 'no-channel-available',
            });
            continue;
          }
        }

        // Certificato: preferisci profiles.medicalCertificates.current.expiryDate, fallback a users.medicalCertificate.expiryDate, poi global user
        const expiryDate =
          profile?.medicalCertificates?.current?.expiryDate ||
          clubUser?.medicalCertificate?.expiryDate ||
          globalUser?.medicalCertificate?.expiryDate;

        if (actualChannel === 'email') {
          try {
            let status;
            if (!expiryDate) {
              // Invia comunque una mail informativa per certificato mancante
              status = { type: 'missing', expiryDate: null, daysUntilExpiry: null };
            } else {
              const expiry = expiryDate?.toDate ? expiryDate.toDate() : new Date(expiryDate);
              const daysUntilExpiry = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
              status = { expiryDate: expiry.toLocaleDateString('it-IT'), daysUntilExpiry };
            }

            await sendEmailNotification(player, club, status);

            // Track analytics event
            await trackNotificationEvent({
              type: 'sent',
              channel: 'email',
              userId: playerId,
              clubId,
              notificationType: 'certificate',
              platform: 'email',
              success: true,
              metadata: {
                hasExpiryDate: !!expiryDate,
                daysUntilExpiry: status.daysUntilExpiry,
                isMissing: status.type === 'missing',
                isExpired: status.daysUntilExpiry < 0,
                isExpiring: status.daysUntilExpiry >= 0 && status.daysUntilExpiry <= 30,
              },
            });

            // ✅ Salva notifica in-app per l'utente (non bloccante)
            try {
              await saveUserNotification({
                userId: playerId,
                title: 'Certificato medico',
                body: expiryDate
                  ? `Il tuo certificato scade il ${status.expiryDate}`
                  : 'Certificato mancante. Aggiorna i tuoi documenti.',
                type: 'certificate',
                icon: '/icons/icon-192x192.png',
                actionUrl: '/profile',
                priority:
                  status.type === 'missing' || status.daysUntilExpiry < 0
                    ? 'urgent'
                    : status.daysUntilExpiry <= 30
                      ? 'high'
                      : 'normal',
                metadata: {
                  clubId,
                  certificateStatus: status.type || 'active',
                  expiryDate: status.expiryDate,
                  daysUntilExpiry: status.daysUntilExpiry,
                  sentVia: 'email',
                },
              });
            } catch (notifErr) {
              console.warn('⚠️ [Email] Could not save in-app notification:', notifErr.message);
            }

            results.sent++;
            results.details.push({
              playerId,
              playerName: player.name,
              success: true,
              method: 'email',
            });
          } catch (err) {
            results.failed++;
            // Mappa alcuni errori SMTP comuni per una diagnostica migliore
            let mappedCode = 'email-send-error';
            const msg = (err?.message || '').toLowerCase();
            const respCode = err?.responseCode || err?.code;
            if (respCode === 535 || msg.includes('5.7.8') || msg.includes('badcredentials')) {
              mappedCode = 'smtp-535-bad-credentials';
            } else if (msg.includes('invalid login') || msg.includes('auth')) {
              mappedCode = 'smtp-auth-failed';
            } else if (msg.includes('from') && msg.includes('not allowed')) {
              mappedCode = 'smtp-from-not-allowed';
            } else if (err?.response?.body?.errors && Array.isArray(err.response.body.errors)) {
              const bodyErrors = err.response.body.errors
                .map((e) => (e?.message || '').toLowerCase())
                .join(' | ');
              if (
                bodyErrors.includes('sender identity') ||
                bodyErrors.includes('from address does not match')
              ) {
                mappedCode = 'sendgrid-from-not-verified';
              }
            }

            // Track failed email event
            await trackNotificationEvent({
              type: 'failed',
              channel: 'email',
              userId: playerId,
              clubId,
              notificationType: 'certificate',
              platform: 'email',
              success: false,
              error: err.message,
              errorCode: mappedCode,
              metadata: {
                hasExpiryDate: !!expiryDate,
                smtpResponseCode: respCode,
              },
            });

            results.details.push({
              playerId,
              playerName: player.name,
              success: false,
              error: err.message,
              code: mappedCode,
            });
          }
        } else if (actualChannel === 'push') {
          // Forza il provider corretto per chiarezza nel risultato quando si inviano PUSH
          results.provider = 'push';
          try {
            // Calcola status certificato (stesso calcolo del canale email)
            let status;
            if (!expiryDate) {
              status = { type: 'missing', expiryDate: null, daysUntilExpiry: null };
            } else {
              const expiry = expiryDate?.toDate ? expiryDate.toDate() : new Date(expiryDate);
              const daysUntilExpiry = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
              status = { expiryDate: expiry.toLocaleDateString('it-IT'), daysUntilExpiry };
            }

            // Costruisce una notifica generica certificato per push
            const pushNotification = {
              title: 'Certificato medico',
              body: expiryDate
                ? `Il tuo certificato scade il ${status.expiryDate}`
                : 'Certificato mancante. Aggiorna i tuoi documenti.',
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-192x192.png',
              tag: `certificate-${playerId}`,
              data: {
                url: '/profile',
                type: 'certificate',
                clubId,
                playerId,
                timestamp: Date.now(),
              },
            };

            // NUOVO: usa unified push (prova native FCM/APNs poi fallback a Web Push)
            // Passa clubUser o profile come playerData per il lookup corretto della subscription
            const pushResult = await sendUnifiedPushNotification(
              playerId,
              pushNotification,
              clubUser || profile || globalUser
            );

            // Track analytics event
            await trackNotificationEvent({
              type: 'sent',
              channel: 'push',
              userId: playerId,
              clubId,
              notificationType: 'certificate',
              platform: pushResult.method === 'native' ? 'native' : 'web',
              success: true,
              metadata: {
                hasExpiryDate: !!expiryDate,
                daysUntilExpiry: status.daysUntilExpiry,
                isMissing: status.type === 'missing',
                isExpired: status.daysUntilExpiry !== null && status.daysUntilExpiry < 0,
                isExpiring:
                  status.daysUntilExpiry !== null &&
                  status.daysUntilExpiry >= 0 &&
                  status.daysUntilExpiry <= 30,
                title: pushNotification.title,
                tag: pushNotification.tag,
                pushMethod: pushResult.method,
              },
            });

            // ✅ Salva notifica in-app per l'utente (non bloccante)
            try {
              const isExpired = status.daysUntilExpiry !== null && status.daysUntilExpiry < 0;
              const isExpiring =
                status.daysUntilExpiry !== null &&
                status.daysUntilExpiry >= 0 &&
                status.daysUntilExpiry <= 30;
              await saveUserNotification({
                userId: playerId,
                title: pushNotification.title,
                body: pushNotification.body,
                type: 'certificate',
                icon: pushNotification.icon,
                actionUrl: '/profile',
                priority:
                  status.type === 'missing' || isExpired
                    ? 'urgent'
                    : isExpiring
                      ? 'high'
                      : 'normal',
                metadata: {
                  clubId,
                  certificateStatus: status.type || 'active',
                  expiryDate: status.expiryDate,
                  daysUntilExpiry: status.daysUntilExpiry,
                  sentVia: 'push',
                },
              });
              console.log('✅ [Push] In-app notification saved for user:', playerId);
            } catch (notifErr) {
              console.warn('⚠️ [Push] Could not save in-app notification:', notifErr.message);
            }

            results.sent++;
            results.details.push({
              playerId,
              playerName: player.name,
              success: true,
              method: pushResult.method === 'native' ? 'native-push' : 'web-push',
            });
          } catch (err) {
            let mappedCode = 'push-send-error';
            const msg = (err?.message || '').toLowerCase();
            if (msg.includes('push-service-unconfigured')) mappedCode = 'push-service-unconfigured';
            else if (
              msg.includes('push-service-misconfigured') ||
              msg.includes('vapid') ||
              msg.includes('public key must be a url safe base 64')
            )
              mappedCode = 'push-service-misconfigured';
            else if (msg.includes('no subscription') || msg.includes('nessuna sottoscrizione'))
              mappedCode = 'push-no-subscription';
            const statusCode = err?.statusCode || err?.status || err?.code || null;

            // Fallback automatico ad EMAIL solo se la richiesta NON era esplicitamente "push"
            // Se l'admin ha selezionato "push", NON inviare email.
            if (
              mappedCode === 'push-no-subscription' &&
              notificationType !== 'push' &&
              EMAIL_PROVIDER !== 'none' &&
              player?.email
            ) {
              try {
                // Calcola status per email (come nel ramo email)
                let status;
                if (!expiryDate) {
                  status = { type: 'missing', expiryDate: null, daysUntilExpiry: null };
                } else {
                  const expiry = expiryDate?.toDate ? expiryDate.toDate() : new Date(expiryDate);
                  const daysUntilExpiry = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
                  status = { expiryDate: expiry.toLocaleDateString('it-IT'), daysUntilExpiry };
                }
                await sendEmailNotification(player, club, status);

                // Track successful fallback event
                await trackNotificationEvent({
                  type: 'sent',
                  channel: 'email',
                  userId: playerId,
                  clubId,
                  notificationType: 'certificate',
                  platform: 'email',
                  success: true,
                  fallbackFrom: 'push',
                  fallbackReason: 'push-no-subscription',
                  metadata: {
                    hasExpiryDate: !!expiryDate,
                    daysUntilExpiry: status.daysUntilExpiry,
                    isMissing: status.type === 'missing',
                    isExpired: status.daysUntilExpiry < 0,
                    isExpiring: status.daysUntilExpiry >= 0 && status.daysUntilExpiry <= 30,
                  },
                });

                // ✅ Salva notifica in-app per fallback email (non bloccante)
                try {
                  await saveUserNotification({
                    userId: playerId,
                    title: 'Certificato medico',
                    body: expiryDate
                      ? `Il tuo certificato scade il ${status.expiryDate}`
                      : 'Certificato mancante. Aggiorna i tuoi documenti.',
                    type: 'certificate',
                    icon: '/icons/icon-192x192.png',
                    actionUrl: '/profile',
                    priority:
                      status.type === 'missing' || status.daysUntilExpiry < 0
                        ? 'urgent'
                        : status.daysUntilExpiry <= 30
                          ? 'high'
                          : 'normal',
                    metadata: {
                      clubId,
                      certificateStatus: status.type || 'active',
                      expiryDate: status.expiryDate,
                      daysUntilExpiry: status.daysUntilExpiry,
                      sentVia: 'email-fallback',
                      fallbackReason: 'push-no-subscription',
                    },
                  });
                } catch (notifErr) {
                  console.warn(
                    '⚠️ [Email Fallback] Could not save in-app notification:',
                    notifErr.message
                  );
                }

                // Conta come inviato via fallback
                results.sent++;
                results.details.push({
                  playerId,
                  playerName: player.name,
                  success: true,
                  method: 'email-fallback',
                  reason: 'push-no-subscription',
                });
              } catch (emailErr) {
                results.failed++;

                // Track failed fallback event
                await trackNotificationEvent({
                  type: 'failed',
                  channel: 'email',
                  userId: playerId,
                  clubId,
                  notificationType: 'certificate',
                  platform: 'email',
                  success: false,
                  fallbackFrom: 'push',
                  fallbackReason: 'push-no-subscription',
                  error: emailErr.message,
                  errorCode: 'email-fallback-error',
                  metadata: {
                    originalPushError: mappedCode,
                    hasExpiryDate: !!expiryDate,
                  },
                });

                results.details.push({
                  playerId,
                  playerName: player.name,
                  success: false,
                  error: emailErr.message,
                  code: 'email-fallback-error',
                  fromPushError: mappedCode,
                  statusCode,
                });
              }
            } else {
              results.failed++;

              // Track failed push event (no fallback)
              await trackNotificationEvent({
                type: 'failed',
                channel: 'push',
                userId: playerId,
                clubId,
                notificationType: 'certificate',
                platform: 'web',
                success: false,
                error: err.message,
                errorCode: mappedCode,
                metadata: {
                  hasExpiryDate: !!expiryDate,
                  webPushReady: WEB_PUSH_READY,
                  statusCode,
                },
              });

              results.details.push({
                playerId,
                playerName: player.name,
                success: false,
                error: err.message,
                code: mappedCode,
                statusCode,
                webPushReady: WEB_PUSH_READY,
              });
            }
          }
        }
      } catch (err) {
        results.failed++;

        // Track unexpected error event
        await trackNotificationEvent({
          type: 'failed',
          channel: 'unknown',
          userId: playerId,
          clubId,
          notificationType: 'certificate',
          platform: 'unknown',
          success: false,
          error: err.message,
          errorCode: 'unexpected-error',
        });

        results.details.push({
          playerId,
          success: false,
          error: err.message,
          code: 'unexpected-error',
        });
      }
    }

    results.success = results.failed === 0;
    return results;
  }
);

// =============================================
// CLOUD FUNCTION: savePushSubscription (callable)
// Salva/aggiorna una sottoscrizione Web Push nella collezione top-level
// Schema compatibile con le Netlify Functions esistenti
// Doc ID: `${userId}_${deviceId}` per accesso diretto senza query
// =============================================
export const savePushSubscription = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
  },
  async (request) => {
    const { data, auth } = request;
    const { firebaseUid, subscription, endpoint, deviceId } = data || {};

    if (!firebaseUid || !subscription || !endpoint) {
      throw new HttpsError(
        'invalid-argument',
        'Parametri obbligatori mancanti: firebaseUid, subscription, endpoint'
      );
    }

    // Facoltativo: se autenticato, permette solo di salvare per se stessi
    // Se necessario, commentare questa verifica per supportare salvataggi server-side
    if (auth?.uid && auth.uid !== firebaseUid) {
      throw new HttpsError(
        'permission-denied',
        "Firebase UID non corrisponde all'utente autenticato"
      );
    }

    // Validazione minima della subscription
    if (
      typeof subscription !== 'object' ||
      !subscription.endpoint ||
      !subscription.keys ||
      !subscription.keys.p256dh ||
      !subscription.keys.auth
    ) {
      throw new HttpsError('invalid-argument', 'Formato subscription non valido');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 giorni

    const finalDeviceId = deviceId || generateDeviceIdForServer(subscription);
    const compositeDocId = `${firebaseUid}_${finalDeviceId}`;

    console.log('🛰️ [savePushSubscription] Incoming subscription', {
      firebaseUid,
      endpointPreview: String(endpoint).slice(0, 60),
      deviceId: finalDeviceId,
      compositeDocId,
      authUid: auth?.uid || null,
      authMatches: auth?.uid === firebaseUid,
    });

    await db.collection('pushSubscriptions').doc(compositeDocId).set(
      {
        firebaseUid,
        deviceId: finalDeviceId,
        subscription,
        endpoint,
        timestamp: now.toISOString(),
        lastUsedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        createdAt: now.toISOString(),
      },
      { merge: true }
    );

    console.log('✅ [savePushSubscription] Stored subscription document', {
      docId: compositeDocId,
      firebaseUid,
      collection: 'pushSubscriptions',
    });

    return { success: true, id: compositeDocId };
  }
);

// Helper server-side per generare un deviceId deterministico
function generateDeviceIdForServer(subscription) {
  try {
    const endpoint = String(subscription?.endpoint || '');
    const p256dh = String(subscription?.keys?.p256dh || '');
    const base = endpoint + '|' + p256dh;
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
      const ch = base.charCodeAt(i);
      hash = (hash << 5) - hash + ch;
      hash |= 0; // 32-bit
    }
    return 'device-' + Math.abs(hash).toString(36);
  } catch {
    return 'device-' + Date.now().toString(36);
  }
}

// =============================================
// CLOUD FUNCTION: getPushStatusForPlayers (callable)
// Ritorna stato push (web/native) per una lista di playerIds
// =============================================
export const getPushStatusForPlayers = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 120,
  },
  async (request) => {
    const { data, auth } = request;
    if (!auth || !auth.uid) {
      throw new HttpsError('unauthenticated', 'Autenticazione richiesta');
    }

    const { clubId, playerIds } = data || {};
    if (!clubId || typeof clubId !== 'string') {
      throw new HttpsError('invalid-argument', 'clubId è richiesto');
    }
    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      throw new HttpsError('invalid-argument', 'playerIds deve essere un array non vuoto');
    }

    // Permessi come nella funzione principale
    const clubRef = db.collection('clubs').doc(clubId);
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) throw new HttpsError('not-found', 'Club non trovato');
    const club = clubDoc.data();

    const isOwner = club?.ownerId === auth.uid;
    const isAdminFromClub = Array.isArray(club.admins) && club.admins.includes(auth.uid);
    const requesterEmail = (auth?.token?.email || '').toLowerCase();
    const isAdminFromEmailList =
      Array.isArray(club.adminEmails) && requesterEmail
        ? club.adminEmails.map((e) => String(e).toLowerCase()).includes(requesterEmail)
        : false;
    const membershipSnap = await clubRef
      .collection('users')
      .where('userId', '==', auth.uid)
      .limit(1)
      .get();
    let isAdminFromMembership = false;
    if (!membershipSnap.empty) {
      const m = membershipSnap.docs[0].data();
      isAdminFromMembership =
        m?.isClubAdmin === true ||
        m?.role === 'admin' ||
        m?.role === 'club_admin' ||
        (Array.isArray(m?.roles) && (m.roles.includes('admin') || m.roles.includes('club_admin')));
    }
    const profileRef = clubRef.collection('profiles').doc(auth.uid);
    const profileDoc = await profileRef.get();
    const isAdminFromProfile = profileDoc.exists
      ? profileDoc.data()?.isClubAdmin === true || profileDoc.data()?.role === 'club_admin'
      : false;
    const affiliationId = `${auth.uid}_${clubId}`;
    const affiliationDoc = await db.collection('affiliations').doc(affiliationId).get();
    const isAdminFromAffiliation = affiliationDoc.exists
      ? (affiliationDoc.data()?.role === 'club_admin' ||
          affiliationDoc.data()?.isClubAdmin === true) &&
        (affiliationDoc.data()?.status || 'approved') === 'approved'
      : false;
    const isAdmin =
      isOwner ||
      isAdminFromClub ||
      isAdminFromEmailList ||
      isAdminFromMembership ||
      isAdminFromProfile ||
      isAdminFromAffiliation;
    if (!isAdmin)
      throw new HttpsError('permission-denied', 'Permessi insufficienti per questo club');

    const nowIso = new Date().toISOString();
    const result = {};

    for (const pid of playerIds) {
      try {
        const snap = await db
          .collection('pushSubscriptions')
          .where('userId', '==', pid)
          .orderBy('createdAt', 'desc')
          .get();

        const valid = snap.docs.filter((doc) => {
          const d = doc.data();
          return d.isActive === true && (d.expiresAt || '') > nowIso;
        });

        let webCount = 0;
        let nativeCount = 0;
        let latestExpiry = null;
        let latestType = null;

        for (const doc of valid) {
          const d = doc.data();
          const isNative = d.type === 'native' && (d.fcmToken || d.apnsToken);
          const hasWebKeys =
            (d?.keys?.p256dh && d?.keys?.auth) ||
            (d?.subscription?.keys?.p256dh && d?.subscription?.keys?.auth);
          if (isNative) nativeCount += 1;
          else if (hasWebKeys) webCount += 1;
          const exp = d.expiresAt || null;
          if (exp && (!latestExpiry || exp > latestExpiry)) {
            latestExpiry = exp;
            latestType = isNative ? 'native' : hasWebKeys ? 'web' : 'unknown';
          }
        }

        result[pid] = {
          hasNative: nativeCount > 0,
          hasWeb: webCount > 0,
          nativeCount,
          webCount,
          latestExpiry,
          latestType,
        };
      } catch (e) {
        result[pid] = { error: e.message || String(e) };
      }
    }

    return { success: true, count: Object.keys(result).length, statuses: result };
  }
);

// =============================================
// CLOUD FUNCTION: sendTestPush (callable)
// Invia una push di test ad un singolo utente (nativa -> web fallback)
// =============================================
export const sendTestPush = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    secrets: ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'],
  },
  async (request) => {
    const { data, auth } = request;
    if (!auth || !auth.uid) {
      throw new HttpsError('unauthenticated', 'Autenticazione richiesta');
    }

    const { clubId, playerId } = data || {};
    if (!clubId || typeof clubId !== 'string') {
      throw new HttpsError('invalid-argument', 'clubId è richiesto');
    }
    if (!playerId || typeof playerId !== 'string') {
      throw new HttpsError('invalid-argument', 'playerId è richiesto');
    }

    // Permessi admin
    const clubRef = db.collection('clubs').doc(clubId);
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) throw new HttpsError('not-found', 'Club non trovato');
    const club = clubDoc.data();

    const isOwner = club?.ownerId === auth.uid;
    const isAdminFromClub = Array.isArray(club.admins) && club.admins.includes(auth.uid);
    const requesterEmail = (auth?.token?.email || '').toLowerCase();
    const isAdminFromEmailList =
      Array.isArray(club.adminEmails) && requesterEmail
        ? club.adminEmails.map((e) => String(e).toLowerCase()).includes(requesterEmail)
        : false;
    const membershipSnap = await clubRef
      .collection('users')
      .where('userId', '==', auth.uid)
      .limit(1)
      .get();
    let isAdminFromMembership = false;
    if (!membershipSnap.empty) {
      const m = membershipSnap.docs[0].data();
      isAdminFromMembership =
        m?.isClubAdmin === true ||
        m?.role === 'admin' ||
        m?.role === 'club_admin' ||
        (Array.isArray(m?.roles) && (m.roles.includes('admin') || m.roles.includes('club_admin')));
    }
    const profileRef = clubRef.collection('profiles').doc(auth.uid);
    const profileDoc = await profileRef.get();
    const isAdminFromProfile = profileDoc.exists
      ? profileDoc.data()?.isClubAdmin === true || profileDoc.data()?.role === 'club_admin'
      : false;
    const affiliationId = `${auth.uid}_${clubId}`;
    const affiliationDoc = await db.collection('affiliations').doc(affiliationId).get();
    const isAdminFromAffiliation = affiliationDoc.exists
      ? (affiliationDoc.data()?.role === 'club_admin' ||
          affiliationDoc.data()?.isClubAdmin === true) &&
        (affiliationDoc.data()?.status || 'approved') === 'approved'
      : false;
    const isAdmin =
      isOwner ||
      isAdminFromClub ||
      isAdminFromEmailList ||
      isAdminFromMembership ||
      isAdminFromProfile ||
      isAdminFromAffiliation;
    if (!isAdmin)
      throw new HttpsError('permission-denied', 'Permessi insufficienti per questo club');

    // Costruisci notifica test
    const notification = {
      title: 'Test Push',
      body: 'Notifica di test inviata dal club admin',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: `test-push-${playerId}-${Date.now()}`,
      data: {
        url: '/profile',
        type: 'test-push',
        clubId,
        playerId,
        timestamp: Date.now(),
      },
    };

    try {
      const result = await sendUnifiedPushNotification(playerId, notification);
      return { success: true, method: result.method };
    } catch (err) {
      // Propaga un errore dettagliato ma in forma HttpsError
      throw new HttpsError('failed-precondition', err?.message || 'Invio test push fallito');
    }
  }
);

// =============================================
// CALLABLE FUNCTIONS FOR PUSH NOTIFICATIONS (User-facing)
// =============================================

/**
 * Send push notification to a specific user (simplified for frontend)
 * Called by frontend: sendPushNotification({ firebaseUid, notification })
 */
export const sendPushNotification = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    secrets: ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'],
  },
  async (request) => {
    const { data, auth } = request;

    // User must be authenticated
    if (!auth || !auth.uid) {
      throw new HttpsError('unauthenticated', 'Autenticazione richiesta');
    }

    const { firebaseUid, notification } = data || {};

    if (!firebaseUid) {
      throw new HttpsError('invalid-argument', 'firebaseUid è richiesto');
    }

    // User can only send test notifications to themselves
    if (auth.uid !== firebaseUid) {
      throw new HttpsError('permission-denied', 'Puoi inviare notifiche solo a te stesso');
    }

    if (!notification || typeof notification !== 'object') {
      throw new HttpsError('invalid-argument', 'notification object è richiesto');
    }

    try {
      // Use internal function to send push notification
      await sendPushNotificationToUser(firebaseUid, notification, { firebaseUid });
      return { success: true };
    } catch (err) {
      console.error('❌ [sendPushNotification] Error:', err);
      throw new HttpsError('internal', err?.message || 'Invio notifica push fallito');
    }
  }
);

/**
 * Remove push subscription from Firestore
 * Called by frontend: removePushSubscription({ firebaseUid, endpoint })
 */
export const removePushSubscription = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 30,
  },
  async (request) => {
    const { data, auth } = request;

    // User must be authenticated
    if (!auth || !auth.uid) {
      throw new HttpsError('unauthenticated', 'Autenticazione richiesta');
    }

    const { firebaseUid, endpoint } = data || {};

    if (!firebaseUid) {
      throw new HttpsError('invalid-argument', 'firebaseUid è richiesto');
    }

    if (!endpoint) {
      throw new HttpsError('invalid-argument', 'endpoint è richiesto');
    }

    // User can only remove their own subscriptions
    if (auth.uid !== firebaseUid) {
      throw new HttpsError('permission-denied', 'Puoi rimuovere solo le tue sottoscrizioni');
    }

    try {
      console.log('🗑️ [removePushSubscription] Removing subscription...', {
        firebaseUid,
        endpoint: endpoint.substring(0, 50) + '...',
      });

      // Query for the subscription document
      const subscriptionsRef = db.collection('pushSubscriptions');
      const querySnapshot = await subscriptionsRef
        .where('firebaseUid', '==', firebaseUid)
        .where('endpoint', '==', endpoint)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        console.warn('⚠️ [removePushSubscription] Subscription not found', { firebaseUid });
        return { success: true, deleted: false, reason: 'not-found' };
      }

      // Delete the subscription document
      await querySnapshot.docs[0].ref.delete();

      console.log('✅ [removePushSubscription] Subscription removed successfully', { firebaseUid });
      return { success: true, deleted: true };
    } catch (err) {
      console.error('❌ [removePushSubscription] Error:', err);
      throw new HttpsError('internal', err?.message || 'Rimozione sottoscrizione fallita');
    }
  }
);
