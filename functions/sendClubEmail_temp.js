// =============================================
// FILE: functions/sendBulkNotifications.clean.js
// Cloud Function callable per invio notifiche certificati con fallback intelligente
// Supporta: email, push, auto (determina automaticamente il canale migliore)
// =============================================

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import webpush from 'web-push';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

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
    const SENDGRID_ENABLED = !!process.env.SENDGRID_API_KEY;
    const NODEMAILER_ENABLED = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    const EMAIL_USER = process.env.EMAIL_USER || '';
    const FROM_EMAIL = process.env.FROM_EMAIL || EMAIL_USER || 'noreply@play-sport.pro';
    
    // Detect provider: Register.it for @play-sport.pro, Gmail otherwise
    const emailUser = String(EMAIL_USER).toLowerCase();
    const fromEmail = String(FROM_EMAIL).toLowerCase();
    const useRegisterIt = emailUser.endsWith('@play-sport.pro') || fromEmail.endsWith('@play-sport.pro');
    
    console.log('🔧 [Email Config]', {
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
        // Register.it SMTP configuration - try port 587 with STARTTLS
        const host = process.env.SMTP_HOST || 'smtp.register.it';
        const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
        const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : false;
        
        transporter = nodemailer.createTransport({
          host,
          port,
          secure, // false for STARTTLS
          requireTLS: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false, // For debugging - remove in production if it works
          },
          connectionTimeout: 30000, // 30 secondi
          greetingTimeout: 15000,
          socketTimeout: 30000,
          logger: true, // Enable debugging
        });
      } else {
        // Gmail configuration
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
// CONFIGURAZIONE WEB PUSH (VAPID)
// =============================================
// Sanitize VAPID keys from env (trim, strip quotes/newlines, enforce URL-safe)
function sanitizeVapidKey(key) {
