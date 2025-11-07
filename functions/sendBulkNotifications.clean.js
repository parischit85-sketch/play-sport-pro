// =============================================
// FILE: functions/sendBulkNotifications.clean.js
// Cloud Function callable per invio notifiche certificati con fallback intelligente
// Supporta: email, push, auto (determina automaticamente il canale migliore)
// =============================================

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import webpush from 'web-push';

// Inizializza Admin SDK una sola volta
if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

// =============================================
// CONFIGURAZIONE EMAIL (opzionale)
// =============================================
const SENDGRID_ENABLED = !!process.env.SENDGRID_API_KEY;
if (SENDGRID_ENABLED) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const NODEMAILER_ENABLED = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
let transporter = null;
if (NODEMAILER_ENABLED) {
  // Default intelligenti per provider comuni: Register.it per @play-sport.pro, altrimenti Gmail
  const emailUser = String(process.env.EMAIL_USER || '').toLowerCase();
  const fromEmailEnv = String(process.env.FROM_EMAIL || '').toLowerCase();
  const useRegisterIt =
    emailUser.endsWith('@play-sport.pro') || fromEmailEnv.endsWith('@play-sport.pro');

  const host = process.env.SMTP_HOST || (useRegisterIt ? 'smtp.register.it' : 'smtp.gmail.com');
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : (useRegisterIt ? 465 : 465);
  // Se SMTP_SECURE non è specificato: true per porta 465; false altrimenti
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// Preferire l'EMAIL_USER come mittente predefinito quando si usa Nodemailer/Gmail
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'noreplay@play-sport.pro';
const FROM_NAME = 'Play-Sport.pro';

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
  // Verifica se l'utente ha subscriptions push attive
  const subsSnap = await db
    .collection('pushSubscriptions')
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .where('expiresAt', '>', new Date().toISOString())
    .limit(1)
    .get();

  const hasPushSubscription = !subsSnap.empty;

  // Logica di priorità per canale:
  // 1. Push (se disponibile) - migliore UX
  // 2. Email (se disponibile)
  // 3. Nessuno

  if (hasPushSubscription) {
    return 'push';
  } else if (hasEmail && EMAIL_PROVIDER !== 'none') {
    return 'email';
  } else {
    return null; // Nessun canale disponibile
  }
}

// =============================================
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
      expiredSubs.docs.forEach(doc => {
        batch.update(doc.ref, {
          isActive: false,
          deactivatedAt: now,
          deactivationReason: 'expired'
        });
      });

      await batch.commit();
      console.log('🧹 [Cleanup] Deactivated', expiredSubs.size, 'expired subscriptions');
    }

    // Trova subscriptions duplicate per user/device (mantieni solo la più recente)
    const usersSnap = await db.collection('pushSubscriptions').where('isActive', '==', true).get();
    const userDevices = new Map();

    usersSnap.docs.forEach(doc => {
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
        subs.sort((a, b) => new Date(b.lastUsedAt || b.createdAt) - new Date(a.lastUsedAt || a.createdAt));

        // Mantieni solo la prima (più recente), disattiva le altre
        for (let i = 1; i < subs.length; i++) {
          duplicateBatch.update(db.collection('pushSubscriptions').doc(subs[i].id), {
            isActive: false,
            deactivatedAt: now,
            deactivationReason: 'duplicate-device'
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
      totalProcessed: usersSnap.size
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
async function sendEmailNotification(player, club, status) {
  const { email, name } = player;
  if (!email || !email.includes('@')) {
    throw new Error('Email non valida');
  }

  const { daysUntilExpiry, expiryDate } = status || {};
  const isMissing = status?.type === 'missing' || expiryDate == null;
  const isExpired = !isMissing && typeof daysUntilExpiry === 'number' && daysUntilExpiry < 0;
  const isExpiring = !isMissing && typeof daysUntilExpiry === 'number' && daysUntilExpiry >= 0;

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

  // Reply-To: prova a usare l'email pubblica del club se disponibile
  const clubReplyTo =
    club?.email ||
    club?.contactEmail ||
    club?.infoEmail ||
    club?.supportEmail ||
    FROM_EMAIL;

  if (SENDGRID_ENABLED) {
    await sgMail.send({
      to: email,
      from: { email: FROM_EMAIL, name: club?.name || FROM_NAME },
      replyTo: { email: clubReplyTo, name: club?.name || FROM_NAME },
      subject,
      html,
    });
  } else if (NODEMAILER_ENABLED) {
    await transporter.sendMail({
      from: `"${club?.name || FROM_NAME}" <${FROM_EMAIL}>`,
      replyTo: `"${club?.name || FROM_NAME}" <${clubReplyTo}>`,
      to: email,
      subject,
      html,
    });
  } else {
    // In sviluppo potremmo non avere provider
    throw new Error('Nessun servizio email configurato');
  }
}

// =============================================
// HELPER: invio push (Web Push)
// =============================================
async function sendPushNotificationToUser(userId, notification) {
  console.log('📱 [sendPushNotificationToUser] Starting...', {
    userId,
    notificationTitle: notification?.title,
    webPushEnabled: WEB_PUSH_ENABLED,
    webPushReady: WEB_PUSH_READY,
    vapidConfigured: !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY),
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
    throw new Error('Servizio Push non pronto (configurazione VAPID non valida) [push-service-misconfigured]');
  }

  // Recupera tutte le sottoscrizioni da Firestore (stesso schema usato nelle Netlify Functions)
  console.log('🔍 [Push] Querying subscriptions for userId:', userId);
  const subsSnap = await db
    .collection('pushSubscriptions')
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .where('expiresAt', '>', new Date().toISOString()) // Solo subscriptions non scadute
    .get();

  console.log('📊 [Push] Subscriptions found:', subsSnap.size);

  if (subsSnap.empty) {
    console.warn('⚠️ [Push] No subscriptions found for user:', userId);
    throw new Error('Nessuna sottoscrizione push trovata per questo utente [push-no-subscription]');
  }

  const payload = JSON.stringify(notification);
  const invalidDocs = [];
  const results = await Promise.allSettled(
    subsSnap.docs.map(async (doc) => {
      const sub = doc.data().subscription;
      try {
        await webpush.sendNotification(sub, payload);

        // Aggiorna lastUsedAt per questa subscription
        await doc.ref.update({
          lastUsedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString() // Rinnova expiry
        });

      } catch (err) {
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
          invalidDocs.push(doc.id);
        }
        throw err;
      }
    })
  );

  // Pulisce sottoscrizioni non valide
  if (invalidDocs.length > 0) {
    await Promise.all(invalidDocs.map((id) => db.collection('pushSubscriptions').doc(id).delete()));
  }

  // Determina se almeno un invio è andato a buon fine
  const atLeastOneSuccess = results.some((r) => r.status === 'fulfilled');
  if (!atLeastOneSuccess) {
    const firstRej = results.find((r) => r.status === 'rejected');
    throw new Error(firstRej?.reason?.message || 'Invio push fallito');
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
    secrets: ['EMAIL_USER', 'EMAIL_PASSWORD', 'FROM_EMAIL', 'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'],
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
      throw new HttpsError('invalid-argument', 'notificationType deve essere "email", "push" o "auto"');
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
      ? (affiliationDoc.data()?.role === 'club_admin' || affiliationDoc.data()?.isClubAdmin === true) &&
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

    // Determina provider email disponibile (per diagnostica veloce)
  const EMAIL_PROVIDER = SENDGRID_ENABLED ? 'sendgrid' : NODEMAILER_ENABLED ? 'nodemailer' : 'none';
    const EFFECTIVE_FROM = EMAIL_PROVIDER === 'none' ? null : FROM_EMAIL;

    // Se il tipo è email ma nessun provider è configurato, torna errore chiaro subito
    if (notificationType === 'email' && EMAIL_PROVIDER === 'none') {
      const details = playerIds.map((playerId) => ({
        playerId,
        success: false,
        error: 'Nessun servizio email configurato (configura SENDGRID_API_KEY o EMAIL_USER/EMAIL_PASSWORD)',
        code: 'email-service-unconfigured',
      }));

      return { success: false, sent: 0, failed: playerIds.length, provider: EMAIL_PROVIDER, from: EFFECTIVE_FROM, replyTo: null, details };
    }

    // Elaborazione
    const computedReplyTo =
      club?.email || club?.contactEmail || club?.infoEmail || club?.supportEmail || FROM_EMAIL || null;
  const results = { success: false, sent: 0, failed: 0, provider: EMAIL_PROVIDER, from: EFFECTIVE_FROM, replyTo: computedReplyTo, details: [] };

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

        if (usersSnap.empty && !profileDocSnap.exists) {
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
            errorCode: 'player-not-found'
          });
          
          results.details.push({ playerId, success: false, error: 'Giocatore non trovato nel club' });
          continue;
        }

        const clubUser = usersSnap.empty ? null : usersSnap.docs[0].data();
        const profile = profileDocSnap.exists ? profileDocSnap.data() : null;

        const player = {
          id: playerId,
          name:
            profile?.name ||
            clubUser?.mergedData?.name ||
            clubUser?.userName ||
            `${clubUser?.firstName || ''} ${clubUser?.lastName || ''}`.trim() ||
            'Giocatore',
          email: profile?.email || clubUser?.userEmail || clubUser?.email || '',
        };

        // Determina il canale da usare
        let actualChannel = notificationType;
        if (notificationType === 'auto') {
          const hasEmail = !!(player.email && player.email.includes('@'));
          actualChannel = await determineOptimalChannel(playerId, hasEmail);
          
          // Track channel determination for auto mode
          await trackNotificationEvent({
            type: 'channel-determined',
            channel: actualChannel || 'none',
            userId: playerId,
            clubId,
            notificationType: 'certificate',
            platform: actualChannel === 'push' ? 'web' : actualChannel === 'email' ? 'email' : 'unknown',
            success: !!actualChannel,
            metadata: {
              requestedType: 'auto',
              determinedChannel: actualChannel,
              hasEmail,
              pushAvailable: actualChannel === 'push'
            }
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
                pushChannelAvailable: false // Will be determined by determineOptimalChannel
              }
            });
            
            results.details.push({
              playerId,
              playerName: player.name,
              success: false,
              error: 'Nessun canale di notifica disponibile (né push né email)',
              code: 'no-channel-available'
            });
            continue;
          }
        }

        // Certificato: preferisci profiles.medicalCertificates.current.expiryDate, fallback a users.medicalCertificate.expiryDate
        const expiryDate =
          profile?.medicalCertificates?.current?.expiryDate ||
          clubUser?.medicalCertificate?.expiryDate;

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
                isExpiring: status.daysUntilExpiry >= 0 && status.daysUntilExpiry <= 30
              }
            });
            
            results.sent++;
            results.details.push({ playerId, playerName: player.name, success: true, method: 'email' });
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
              const bodyErrors = err.response.body.errors.map(e => (e?.message || '').toLowerCase()).join(' | ');
              if (bodyErrors.includes('sender identity') || bodyErrors.includes('from address does not match')) {
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
                smtpResponseCode: respCode
              }
            });
            
            results.details.push({ playerId, playerName: player.name, success: false, error: err.message, code: mappedCode });
          }
        } else if (actualChannel === 'push') {
          // Forza il provider corretto per chiarezza nel risultato quando si inviano PUSH
          results.provider = 'push';
          try {
            // Costruisce una notifica generica certificato per push
            const pushNotification = {
              title: 'Certificato medico',
              body: expiryDate
                ? `Il tuo certificato scade il ${
                    (profile?.medicalCertificates?.current?.expiryDate || clubUser?.medicalCertificate?.expiryDate)?.toDate
                      ? (profile?.medicalCertificates?.current?.expiryDate || clubUser?.medicalCertificate?.expiryDate).toDate().toLocaleDateString('it-IT')
                      : new Date(expiryDate).toLocaleDateString('it-IT')
                  }`
                : 'Certificato mancante. Aggiorna i tuoi documenti.',
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png',
              tag: `certificate-${playerId}`,
              data: {
                url: '/profile',
                type: 'certificate',
                clubId,
                playerId,
                timestamp: Date.now(),
              },
            };

            await sendPushNotificationToUser(playerId, pushNotification);
            
            // Track analytics event
            await trackNotificationEvent({
              type: 'sent',
              channel: 'push',
              userId: playerId,
              clubId,
              notificationType: 'certificate',
              platform: 'web',
              success: true,
              metadata: {
                hasExpiryDate: !!expiryDate,
                daysUntilExpiry: status?.daysUntilExpiry,
                isMissing: !expiryDate,
                isExpired: status?.daysUntilExpiry < 0,
                isExpiring: status?.daysUntilExpiry >= 0 && status?.daysUntilExpiry <= 30,
                title: pushNotification.title,
                tag: pushNotification.tag
              }
            });
            
            results.sent++;
            results.details.push({ playerId, playerName: player.name, success: true, method: 'push' });
          } catch (err) {
            let mappedCode = 'push-send-error';
            const msg = (err?.message || '').toLowerCase();
            if (msg.includes('push-service-unconfigured')) mappedCode = 'push-service-unconfigured';
            else if (msg.includes('push-service-misconfigured') || msg.includes('vapid') || msg.includes('public key must be a url safe base 64')) mappedCode = 'push-service-misconfigured';
            else if (msg.includes('no subscription') || msg.includes('nessuna sottoscrizione')) mappedCode = 'push-no-subscription';
            const statusCode = err?.statusCode || err?.status || err?.code || null;

            // Fallback automatico ad EMAIL se la push fallisce per mancanza di sottoscrizione
            if (mappedCode === 'push-no-subscription' && EMAIL_PROVIDER !== 'none' && player?.email) {
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
                    isExpiring: status.daysUntilExpiry >= 0 && status.daysUntilExpiry <= 30
                  }
                });
                
                // Conta come inviato via fallback
                results.sent++;
                results.details.push({ playerId, playerName: player.name, success: true, method: 'email-fallback', reason: 'push-no-subscription' });
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
                    hasExpiryDate: !!expiryDate
                  }
                });
                
                results.details.push({ playerId, playerName: player.name, success: false, error: emailErr.message, code: 'email-fallback-error', fromPushError: mappedCode, statusCode });
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
                  statusCode
                }
              });
              
              results.details.push({ playerId, playerName: player.name, success: false, error: err.message, code: mappedCode, statusCode, webPushReady: WEB_PUSH_READY });
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
          errorCode: 'unexpected-error'
        });
        
        results.details.push({ playerId, success: false, error: err.message, code: 'unexpected-error' });
      }
    }

    results.success = results.failed === 0;
    return results;
  }
);
