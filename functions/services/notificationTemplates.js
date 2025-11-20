// =============================================
// FILE: functions/services/notificationTemplates.js
// Servizio per caricamento e applicazione template multicanale
// =============================================

import { getFirestore } from 'firebase-admin/firestore';

// Template predefiniti (fallback se non trovati in DB)
const DEFAULT_TEMPLATES = {
  email: {
    expired: {
      subject: '⚠️ Certificato Medico Scaduto',
      body: `Ciao {{nome}},

Ti informiamo che il tuo certificato medico è SCADUTO in data {{dataScadenza}}.

Per poter continuare a partecipare alle attività sportive, è necessario rinnovare il certificato medico al più presto.

Ti preghiamo di:
1. Prenotare una visita medica
2. Caricare il nuovo certificato nell'app
3. Comunicarci la nuova data di scadenza

Per qualsiasi informazione, siamo a tua disposizione.

Cordiali saluti,
{{nomeClub}}`,
    },
    expiring: {
      subject: '🔔 Certificato Medico in Scadenza',
      body: `Ciao {{nome}},

Ti informiamo che il tuo certificato medico scadrà il {{dataScadenza}} (tra {{giorniRimanenti}} giorni).

Per evitare interruzioni nelle tue attività sportive, ti consigliamo di rinnovarlo al più presto.

Ti preghiamo di:
1. Prenotare una visita medica
2. Caricare il nuovo certificato nell'app
3. Comunicarci la nuova data di scadenza

Per qualsiasi informazione, siamo a tua disposizione.

Cordiali saluti,
{{nomeClub}}`,
    },
    missing: {
      subject: '❌ Certificato Medico Mancante',
      body: `Ciao {{nome}},

Risulta che non hai ancora caricato il certificato medico.

Per poter partecipare alle attività sportive del nostro club, è OBBLIGATORIO essere in possesso di un certificato medico valido.

Ti preghiamo di:
1. Effettuare la visita medica
2. Caricare il certificato nell'app
3. Comunicarci la data di scadenza

Per qualsiasi informazione, siamo a tua disposizione.

Cordiali saluti,
{{nomeClub}}`,
    },
  },
  whatsapp: {
    expired: {
      message: `🚨 *Certificato Medico Scaduto*

Ciao {{nome}},

Il tuo certificato medico è *SCADUTO* in data {{dataScadenza}}.

⚠️ Non puoi partecipare alle attività fino al rinnovo.

*Cosa fare:*
✅ Prenota visita medica
✅ Carica nuovo certificato nell'app
✅ Comunicaci nuova scadenza

Per info contattaci! 💬

_{{nomeClub}}_`,
    },
    expiring: {
      message: `⏰ *Certificato in Scadenza*

Ciao {{nome}},

Il tuo certificato scadrà il *{{dataScadenza}}* (tra {{giorniRimanenti}} giorni).

*Rinnova subito per evitare interruzioni!*

*Cosa fare:*
✅ Prenota visita medica
✅ Carica nuovo certificato nell'app
✅ Comunicaci nuova scadenza

Per info contattaci! 💬

_{{nomeClub}}_`,
    },
    missing: {
      message: `📋 *Certificato Medico Mancante*

Ciao {{nome}},

Non risulta ancora caricato il tuo certificato medico.

⚠️ *OBBLIGATORIO per partecipare alle attività!*

*Cosa fare:*
✅ Effettua visita medica
✅ Carica certificato nell'app
✅ Comunicaci data scadenza

Per info contattaci! 💬

_{{nomeClub}}_`,
    },
  },
  push: {
    expired: {
      title: '⚠️ Certificato Scaduto',
      body: 'Il tuo certificato medico è scaduto il {{dataScadenza}}. Rinnovalo subito per continuare le attività.',
    },
    expiring: {
      title: '🔔 Certificato in Scadenza',
      body: 'Il tuo certificato scadrà tra {{giorniRimanenti}} giorni ({{dataScadenza}}). Rinnovalo ora!',
    },
    missing: {
      title: '❌ Certificato Mancante',
      body: 'Carica il tuo certificato medico per partecipare alle attività del club.',
    },
  },
};

/**
 * Carica i template personalizzati dal DB o usa i default
 * @param {string} clubId - ID del club
 * @returns {Promise<object>} Template multicanale
 */
async function loadNotificationTemplates(clubId) {
  try {
    const db = getFirestore();
    const templateDoc = await db
      .collection('clubs')
      .doc(clubId)
      .collection('settings')
      .doc('notificationTemplates')
      .get();

    if (templateDoc.exists) {
      const customTemplates = templateDoc.data();

      // Merge con default per garantire tutti i campi
      return {
        email: { ...DEFAULT_TEMPLATES.email, ...customTemplates.email },
        whatsapp: { ...DEFAULT_TEMPLATES.whatsapp, ...customTemplates.whatsapp },
        push: { ...DEFAULT_TEMPLATES.push, ...customTemplates.push },
      };
    }

    // Se non esistono template custom, usa default
    console.log(`📝 [Templates] Using default templates for club ${clubId}`);
    return DEFAULT_TEMPLATES;
  } catch (error) {
    console.error('❌ [Templates] Error loading templates, using defaults:', error);
    return DEFAULT_TEMPLATES;
  }
}

/**
 * Sostituisce le variabili nel template con valori reali
 * @param {string} text - Testo del template con variabili
 * @param {object} data - Dati per sostituire variabili
 * @returns {string} Testo con variabili sostituite
 */
function replaceTemplateVariables(text, data) {
  if (!text) return '';

  return text
    .replace(/\{\{nome\}\}/g, data.playerName || 'Giocatore')
    .replace(/\{\{dataScadenza\}\}/g, data.expiryDate || 'N/A')
    .replace(/\{\{giorniRimanenti\}\}/g, String(data.daysUntilExpiry || 0))
    .replace(/\{\{nomeClub\}\}/g, data.clubName || 'Il Club');
}

/**
 * Determina il tipo di template in base allo stato del certificato
 * @param {string} status - expired | expiring | urgent | missing | valid
 * @returns {string} expired | expiring | missing
 */
function getTemplateType(status) {
  if (status === 'expired') return 'expired';
  if (status === 'expiring' || status === 'urgent') return 'expiring';
  if (status === 'missing') return 'missing';
  return 'missing'; // fallback
}

/**
 * Genera messaggio email da template
 * @param {object} templates - Template caricati
 * @param {string} templateType - expired | expiring | missing
 * @param {object} data - Dati giocatore
 * @returns {object} { subject, body }
 */
function generateEmailMessage(templates, templateType, data) {
  const template = templates.email[templateType];
  return {
    subject: replaceTemplateVariables(template.subject, data),
    body: replaceTemplateVariables(template.body, data),
  };
}

/**
 * Genera messaggio WhatsApp da template
 * @param {object} templates - Template caricati
 * @param {string} templateType - expired | expiring | missing
 * @param {object} data - Dati giocatore
 * @returns {string} Messaggio formattato
 */
function generateWhatsAppMessage(templates, templateType, data) {
  const template = templates.whatsapp[templateType];
  return replaceTemplateVariables(template.message, data);
}

/**
 * Genera notifica push da template
 * @param {object} templates - Template caricati
 * @param {string} templateType - expired | expiring | missing
 * @param {object} data - Dati giocatore
 * @returns {object} { title, body }
 */
function generatePushNotification(templates, templateType, data) {
  const template = templates.push[templateType];
  return {
    title: replaceTemplateVariables(template.title, data),
    body: replaceTemplateVariables(template.body, data),
  };
}

export {
  loadNotificationTemplates,
  replaceTemplateVariables,
  getTemplateType,
  generateEmailMessage,
  generateWhatsAppMessage,
  generatePushNotification,
  DEFAULT_TEMPLATES,
};
