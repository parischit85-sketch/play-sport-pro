/**
 * @fileoverview NotificationTemplateSystem - Sistema completo di template per notifiche
 *
 * Features:
 * - 10+ pre-built templates pronti all'uso
 * - Template engine con variabili placeholder
 * - Rich media support (hero images, icons)
 * - Action buttons customizzabili
 * - Deep linking automatico
 * - Multi-language support
 * - Template versioning
 * - A/B test variants
 *
 * @author Play Sport Pro Team
 * @version 2.0.0
 * @since Phase 4
 */

/**
 * Template Categories
 */
export const TEMPLATE_CATEGORIES = {
  TRANSACTIONAL: 'transactional',
  PROMOTIONAL: 'promotional',
  INFORMATIONAL: 'informational',
  CRITICAL: 'critical',
  SOCIAL: 'social',
};

/**
 * Pre-built Notification Templates
 */
export const NOTIFICATION_TEMPLATES = {
  /**
   * CERTIFICATE_EXPIRING - Certificato in scadenza
   */
  CERTIFICATE_EXPIRING: {
    id: 'CERTIFICATE_EXPIRING',
    name: 'Certificate Expiring',
    category: TEMPLATE_CATEGORIES.CRITICAL,
    version: '1.0',

    title: '⚠️ Certificato in scadenza',
    body: 'Il tuo certificato medico scade tra {{daysLeft}} giorni. Rinnovalo ora per continuare a giocare!',

    icon: '/icons/certificate-warning.png',
    badge: '/icons/badge-critical.png',
    image: '/images/notifications/certificate-expiring.jpg',

    actions: [
      {
        action: 'renew',
        title: 'Rinnova Ora',
        icon: '/icons/renew.png',
      },
      {
        action: 'remind_later',
        title: 'Ricordamelo',
        icon: '/icons/reminder.png',
      },
    ],

    deepLink: '/certificates/renew?id={{certificateId}}',

    variables: ['daysLeft', 'expiryDate', 'certificateId'],

    metadata: {
      priority: 'high',
      requiresInteraction: true,
      vibrate: [200, 100, 200],
      sound: 'notification-important.mp3',
    },
  },

  /**
   * BOOKING_CONFIRMED - Prenotazione confermata
   */
  BOOKING_CONFIRMED: {
    id: 'BOOKING_CONFIRMED',
    name: 'Booking Confirmed',
    category: TEMPLATE_CATEGORIES.TRANSACTIONAL,
    version: '1.0',

    title: '✅ Prenotazione confermata!',
    body: 'Campo {{fieldName}} prenotato per {{date}} alle {{time}}. Ci vediamo lì!',

    icon: '/icons/booking-confirmed.png',
    badge: '/icons/badge-success.png',
    image: '/images/notifications/booking-confirmed.jpg',

    actions: [
      {
        action: 'view_details',
        title: 'Dettagli',
        icon: '/icons/view.png',
      },
      {
        action: 'add_to_calendar',
        title: 'Aggiungi a Calendario',
        icon: '/icons/calendar.png',
      },
    ],

    deepLink: '/bookings/{{bookingId}}',

    variables: ['fieldName', 'date', 'time', 'bookingId', 'clubName'],

    metadata: {
      priority: 'high',
      requiresInteraction: false,
      vibrate: [200],
      sound: 'notification-success.mp3',
    },
  },

  /**
   * PAYMENT_DUE - Pagamento in scadenza
   */
  PAYMENT_DUE: {
    id: 'PAYMENT_DUE',
    name: 'Payment Due',
    category: TEMPLATE_CATEGORIES.CRITICAL,
    version: '1.0',

    title: '💳 Pagamento in scadenza',
    body: 'Quota associativa di €{{amount}} da pagare entro il {{dueDate}}.',

    icon: '/icons/payment-due.png',
    badge: '/icons/badge-warning.png',
    image: '/images/notifications/payment-due.jpg',

    actions: [
      {
        action: 'pay_now',
        title: 'Paga Ora',
        icon: '/icons/payment.png',
      },
      {
        action: 'view_invoice',
        title: 'Vedi Fattura',
        icon: '/icons/invoice.png',
      },
    ],

    deepLink: '/payments/pay?id={{paymentId}}',

    variables: ['amount', 'dueDate', 'paymentId', 'invoiceNumber'],

    metadata: {
      priority: 'high',
      requiresInteraction: true,
      vibrate: [200, 100, 200],
      sound: 'notification-important.mp3',
    },
  },

  /**
   * MESSAGE_RECEIVED - Messaggio ricevuto
   */
  MESSAGE_RECEIVED: {
    id: 'MESSAGE_RECEIVED',
    name: 'Message Received',
    category: TEMPLATE_CATEGORIES.SOCIAL,
    version: '1.0',

    title: '💬 Nuovo messaggio da {{senderName}}',
    body: '{{messagePreview}}',

    icon: '{{senderAvatar}}',
    badge: '/icons/badge-message.png',

    actions: [
      {
        action: 'reply',
        title: 'Rispondi',
        icon: '/icons/reply.png',
        type: 'text',
        placeholder: 'Scrivi una risposta...',
      },
      {
        action: 'view',
        title: 'Visualizza',
        icon: '/icons/view.png',
      },
    ],

    deepLink: '/messages/{{conversationId}}',

    variables: ['senderName', 'senderAvatar', 'messagePreview', 'conversationId'],

    metadata: {
      priority: 'normal',
      requiresInteraction: false,
      vibrate: [100, 50, 100],
      sound: 'notification-message.mp3',
    },
  },

  /**
   * PROMO_FLASH - Promo flash limitata
   */
  PROMO_FLASH: {
    id: 'PROMO_FLASH',
    name: 'Flash Sale Promo',
    category: TEMPLATE_CATEGORIES.PROMOTIONAL,
    version: '1.0',

    title: '🔥 Flash Sale: {{discount}}% di sconto!',
    body: '{{description}} - Valido solo {{validUntil}}!',

    icon: '/icons/promo-flash.png',
    badge: '/icons/badge-promo.png',
    image: '{{promoImage}}',

    actions: [
      {
        action: 'claim_now',
        title: 'Approfitta Ora',
        icon: '/icons/claim.png',
      },
      {
        action: 'share',
        title: 'Condividi',
        icon: '/icons/share.png',
      },
    ],

    deepLink: '/promos/{{promoId}}',

    variables: ['discount', 'description', 'validUntil', 'promoId', 'promoImage'],

    metadata: {
      priority: 'normal',
      requiresInteraction: false,
      vibrate: [100],
      sound: 'notification-promo.mp3',
    },
  },

  /**
   * BOOKING_REMINDER - Promemoria prenotazione
   */
  BOOKING_REMINDER: {
    id: 'BOOKING_REMINDER',
    name: 'Booking Reminder',
    category: TEMPLATE_CATEGORIES.INFORMATIONAL,
    version: '1.0',

    title: '⏰ Promemoria: Partita tra {{hoursUntil}} ore',
    body: '{{fieldName}} - {{date}} alle {{time}}. Sei pronto?',

    icon: '/icons/reminder.png',
    badge: '/icons/badge-info.png',
    image: '/images/notifications/booking-reminder.jpg',

    actions: [
      {
        action: 'directions',
        title: 'Indicazioni',
        icon: '/icons/map.png',
      },
      {
        action: 'cancel',
        title: 'Annulla',
        icon: '/icons/cancel.png',
      },
    ],

    deepLink: '/bookings/{{bookingId}}',

    variables: ['hoursUntil', 'fieldName', 'date', 'time', 'bookingId', 'clubAddress'],

    metadata: {
      priority: 'normal',
      requiresInteraction: false,
      vibrate: [200],
      sound: 'notification-reminder.mp3',
    },
  },

  /**
   * CERTIFICATE_UPLOADED - Certificato caricato in attesa
   */
  CERTIFICATE_UPLOADED: {
    id: 'CERTIFICATE_UPLOADED',
    name: 'Certificate Uploaded',
    category: TEMPLATE_CATEGORIES.INFORMATIONAL,
    version: '1.0',

    title: '📄 Certificato ricevuto',
    body: 'Il tuo certificato è stato ricevuto e sarà verificato entro 24 ore.',

    icon: '/icons/certificate-pending.png',
    badge: '/icons/badge-info.png',
    image: '/images/notifications/certificate-uploaded.jpg',

    actions: [
      {
        action: 'view_status',
        title: 'Vedi Stato',
        icon: '/icons/view.png',
      },
    ],

    deepLink: '/certificates/{{certificateId}}',

    variables: ['certificateId', 'uploadDate'],

    metadata: {
      priority: 'normal',
      requiresInteraction: false,
      vibrate: [100],
      sound: 'notification-info.mp3',
    },
  },

  /**
   * CERTIFICATE_APPROVED - Certificato approvato
   */
  CERTIFICATE_APPROVED: {
    id: 'CERTIFICATE_APPROVED',
    name: 'Certificate Approved',
    category: TEMPLATE_CATEGORIES.INFORMATIONAL,
    version: '1.0',

    title: '✅ Certificato approvato!',
    body: 'Il tuo certificato medico è stato verificato e approvato. Puoi tornare in campo!',

    icon: '/icons/certificate-approved.png',
    badge: '/icons/badge-success.png',
    image: '/images/notifications/certificate-approved.jpg',

    actions: [
      {
        action: 'book_now',
        title: 'Prenota Ora',
        icon: '/icons/booking.png',
      },
      {
        action: 'view_certificate',
        title: 'Vedi Certificato',
        icon: '/icons/view.png',
      },
    ],

    deepLink: '/certificates/{{certificateId}}',

    variables: ['certificateId', 'validUntil'],

    metadata: {
      priority: 'normal',
      requiresInteraction: false,
      vibrate: [200, 100, 200],
      sound: 'notification-success.mp3',
    },
  },

  /**
   * SYSTEM_MAINTENANCE - Manutenzione sistema
   */
  SYSTEM_MAINTENANCE: {
    id: 'SYSTEM_MAINTENANCE',
    name: 'System Maintenance',
    category: TEMPLATE_CATEGORIES.INFORMATIONAL,
    version: '1.0',

    title: '🔧 Manutenzione programmata',
    body: 'Il sistema sarà offline {{startTime}}-{{endTime}} per manutenzione.',

    icon: '/icons/maintenance.png',
    badge: '/icons/badge-info.png',

    actions: [
      {
        action: 'more_info',
        title: 'Maggiori Info',
        icon: '/icons/info.png',
      },
    ],

    deepLink: '/system/status',

    variables: ['startTime', 'endTime', 'duration'],

    metadata: {
      priority: 'low',
      requiresInteraction: false,
      vibrate: [100],
      sound: 'notification-info.mp3',
    },
  },

  /**
   * CLUB_NEWS - News dal club
   */
  CLUB_NEWS: {
    id: 'CLUB_NEWS',
    name: 'Club News',
    category: TEMPLATE_CATEGORIES.INFORMATIONAL,
    version: '1.0',

    title: '📰 {{clubName}}: {{newsTitle}}',
    body: '{{newsPreview}}',

    icon: '{{clubLogo}}',
    badge: '/icons/badge-news.png',
    image: '{{newsImage}}',

    actions: [
      {
        action: 'read_more',
        title: 'Leggi di più',
        icon: '/icons/read.png',
      },
      {
        action: 'share',
        title: 'Condividi',
        icon: '/icons/share.png',
      },
    ],

    deepLink: '/news/{{newsId}}',

    variables: ['clubName', 'clubLogo', 'newsTitle', 'newsPreview', 'newsImage', 'newsId'],

    metadata: {
      priority: 'low',
      requiresInteraction: false,
      vibrate: [100],
      sound: 'notification-info.mp3',
    },
  },
};

/**
 * NotificationTemplateRenderer - Render templates con variabili
 */
class NotificationTemplateRenderer {
  constructor() {
    this.templates = NOTIFICATION_TEMPLATES;
  }

  /**
   * Render template con variabili
   * @param {string} templateId - ID template
   * @param {Object} variables - Variabili da sostituire
   * @param {string} language - Lingua (default: 'it')
   * @returns {Object} Notifica renderizzata
   */
  render(templateId, variables = {}, language = 'it') {
    const template = this.templates[templateId];

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate variables
    const missingVars = template.variables.filter((v) => !(v in variables));
    if (missingVars.length > 0) {
      console.warn(`Missing variables for template ${templateId}:`, missingVars);
    }

    // Render title e body sostituendo {{variabili}}
    const renderedTitle = this._replaceVariables(template.title, variables);
    const renderedBody = this._replaceVariables(template.body, variables);
    const renderedDeepLink = this._replaceVariables(template.deepLink, variables);

    // Render icon/image URLs
    const renderedIcon = this._replaceVariables(template.icon || '', variables);
    const renderedImage = this._replaceVariables(template.image || '', variables);

    // Render actions
    const renderedActions = template.actions?.map((action) => ({
      ...action,
      title: this._replaceVariables(action.title, variables),
    }));

    return {
      templateId,
      title: renderedTitle,
      body: renderedBody,
      icon: renderedIcon,
      badge: template.badge,
      image: renderedImage,
      actions: renderedActions,
      data: {
        deepLink: renderedDeepLink,
        templateId,
        ...variables,
      },
      ...template.metadata,
    };
  }

  /**
   * Replace {{variables}} in string
   * @private
   */
  _replaceVariables(text, variables) {
    if (!text) return '';

    return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables[varName] !== undefined ? variables[varName] : match;
    });
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId) {
    return this.templates[templateId];
  }

  /**
   * Get all templates
   */
  getAllTemplates() {
    return Object.values(this.templates);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category) {
    return Object.values(this.templates).filter((t) => t.category === category);
  }

  /**
   * Create custom template
   */
  createCustomTemplate(templateId, templateConfig) {
    // Validate required fields
    const required = ['name', 'category', 'title', 'body'];
    const missing = required.filter((field) => !(field in templateConfig));

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    this.templates[templateId] = {
      id: templateId,
      version: '1.0',
      variables: [],
      actions: [],
      metadata: {
        priority: 'normal',
        requiresInteraction: false,
      },
      ...templateConfig,
    };

    return this.templates[templateId];
  }

  /**
   * Create A/B test variants
   */
  createABVariants(baseTemplateId, variants) {
    const baseTemplate = this.templates[baseTemplateId];

    if (!baseTemplate) {
      throw new Error(`Base template not found: ${baseTemplateId}`);
    }

    const variantTemplates = {};

    variants.forEach((variant, index) => {
      const variantId = `${baseTemplateId}_VARIANT_${index + 1}`;

      variantTemplates[variantId] = {
        ...baseTemplate,
        id: variantId,
        name: `${baseTemplate.name} - Variant ${index + 1}`,
        ...variant,
        metadata: {
          ...baseTemplate.metadata,
          abTestVariant: index + 1,
          baseTemplateId,
        },
      };

      this.templates[variantId] = variantTemplates[variantId];
    });

    return variantTemplates;
  }

  /**
   * Preview template (HTML visualization)
   */
  previewHTML(templateId, variables = {}) {
    const rendered = this.render(templateId, variables);

    return `
      <div class="notification-preview" style="
        max-width: 400px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        ${
          rendered.image
            ? `
          <img src="${rendered.image}" style="
            width: 100%;
            height: 200px;
            object-fit: cover;
          " />
        `
            : ''
        }
        
        <div style="padding: 16px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            ${
              rendered.icon
                ? `
              <img src="${rendered.icon}" style="
                width: 48px;
                height: 48px;
                border-radius: 8px;
              " />
            `
                : ''
            }
            
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
                ${rendered.title}
              </h3>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">
                ${rendered.body}
              </p>
            </div>
          </div>
          
          ${
            rendered.actions && rendered.actions.length > 0
              ? `
            <div style="
              display: flex;
              gap: 8px;
              margin-top: 16px;
              padding-top: 16px;
              border-top: 1px solid #e5e5e5;
            ">
              ${rendered.actions
                .map(
                  (action) => `
                <button style="
                  flex: 1;
                  padding: 8px 16px;
                  background: #3b82f6;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                ">
                  ${action.title}
                </button>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  }
}

// Singleton instance
export const templateRenderer = new NotificationTemplateRenderer();

export default NotificationTemplateRenderer;
