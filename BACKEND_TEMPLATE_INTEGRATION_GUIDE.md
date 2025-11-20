# 🔧 Integrazione Backend - Template Multicanale

**Guida per integrare il servizio template in `sendBulkNotifications.clean.js`**

---

## 📦 Servizio Template

**File:** `functions/services/notificationTemplates.js`

**Funzioni disponibili:**
```javascript
const {
  loadNotificationTemplates,    // Carica template da DB
  getTemplateType,              // Determina tipo template da status
  generateEmailMessage,         // Genera email da template
  generateWhatsAppMessage,      // Genera WhatsApp da template
  generatePushNotification,     // Genera push da template
} = require('./services/notificationTemplates.js');
```

---

## 🔄 Integrazione in sendBulkNotifications.clean.js

### Passo 1: Import del servizio

Aggiungi all'inizio del file:

```javascript
const {
  loadNotificationTemplates,
  getTemplateType,
  generateEmailMessage,
  generatePushNotification,
} = require('./services/notificationTemplates.js');
```

### Passo 2: Carica template all'inizio della funzione

Subito dopo la validazione dei parametri:

```javascript
exports.sendBulkCertificateNotifications = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // ... validazione auth e parametri

    const { clubId, playerIds, channel = 'auto' } = data;

    // ✨ NUOVO: Carica template personalizzati
    const templates = await loadNotificationTemplates(clubId);
    logger.info('📝 [Templates] Loaded for club', clubId);

    // ... resto della logica
  });
```

### Passo 3: Sostituisci logica email hardcoded

**PRIMA (hardcoded):**

```javascript
// ❌ Vecchio codice con stringhe fisse
let subject = 'Certificato Medico';
let body = `Ciao ${playerName}, il tuo certificato è scaduto...`;

if (status === 'expired') {
  subject = '⚠️ Certificato Scaduto';
  body = `Il certificato è scaduto il ${expiryDate}...`;
} else if (status === 'expiring') {
  subject = '🔔 Certificato in Scadenza';
  body = `Il certificato scade tra ${daysUntilExpiry} giorni...`;
}
```

**DOPO (con template):**

```javascript
// ✅ Nuovo codice con template dinamici
const templateType = getTemplateType(status.certificateStatus);

const playerData = {
  playerName: profile?.displayName || clubUser?.name || 'Giocatore',
  expiryDate: status.expiryDate || 'N/A',
  daysUntilExpiry: status.daysUntilExpiry || 0,
  clubName: clubData?.name || 'Il Club',
};

const emailContent = generateEmailMessage(templates, templateType, playerData);
const { subject, body } = emailContent;
```

### Passo 4: Applica template per push notifications

**PRIMA:**

```javascript
// ❌ Push notification con testo fisso
await sendPushNotificationToUser(userFirebaseUid, {
  title: 'Certificato medico',
  body: `Il tuo certificato scade il ${expiryDate}`,
  icon: '⚠️',
});
```

**DOPO:**

```javascript
// ✅ Push notification con template
const templateType = getTemplateType(status.certificateStatus);
const pushContent = generatePushNotification(templates, templateType, playerData);

await sendPushNotificationToUser(userFirebaseUid, {
  title: pushContent.title,
  body: pushContent.body,
  icon: '🔔',
  data: { clubId, playerId, certificateStatus: status.certificateStatus },
});
```

---

## 📝 Esempio Completo - Sezione Email

```javascript
// ========================================
// SEZIONE INVIO EMAIL
// ========================================

if (channel === 'email' || channel === 'auto') {
  logger.info('📧 [Email] Processing email channel for player', playerId);

  // 1. Validazioni email
  if (!profile?.email) {
    logger.warn(`⚠️ Player ${playerId} has no email address`);
    results.failed.push({
      playerId,
      channel: 'email',
      reason: 'No email address',
    });
    continue; // Salta questo giocatore
  }

  // 2. Determina tipo template
  const templateType = getTemplateType(status.certificateStatus);
  logger.info(`📝 [Email] Using template type: ${templateType}`);

  // 3. Prepara dati per sostituzione variabili
  const playerData = {
    playerName: profile?.displayName || clubUser?.name || 'Giocatore',
    expiryDate: status.expiryDate || 'N/A',
    daysUntilExpiry: status.daysUntilExpiry || 0,
    clubName: clubData?.name || 'Il Club',
  };

  // 4. Genera contenuto email da template
  const emailContent = generateEmailMessage(templates, templateType, playerData);

  // 5. Invia email
  try {
    await sendEmailViaSendGrid({
      to: profile.email,
      subject: emailContent.subject,
      text: emailContent.body,
      html: emailContent.body.replace(/\n/g, '<br>'), // Converti newline in <br>
    });

    logger.info(`✅ [Email] Sent to ${profile.email}`);

    // 6. Salva notifica in-app
    const userFirebaseUid =
      clubUser?.firebaseUid ||
      clubUser?.linkedFirebaseUid ||
      profile?.firebaseUid ||
      profile?.linkedFirebaseUid;

    if (userFirebaseUid) {
      await saveUserNotification({
        userId: userFirebaseUid,
        title: 'Certificato medico',
        body: emailContent.subject,
        type: 'certificate',
        priority: templateType === 'expired' ? 'high' : 'normal',
        metadata: {
          clubId,
          playerId,
          certificateStatus: status.certificateStatus,
          expiryDate: status.expiryDate,
          daysUntilExpiry: status.daysUntilExpiry,
        },
      });
    }

    results.sent.push({
      playerId,
      channel: 'email',
      email: profile.email,
    });
  } catch (emailError) {
    logger.error('❌ [Email] Failed to send:', emailError);
    results.failed.push({
      playerId,
      channel: 'email',
      reason: emailError.message,
    });
  }
}
```

---

## 📝 Esempio Completo - Sezione Push

```javascript
// ========================================
// SEZIONE INVIO PUSH
// ========================================

if (channel === 'push' || channel === 'auto') {
  logger.info('🔔 [Push] Processing push channel for player', playerId);

  // 1. Estrai Firebase UID
  const userFirebaseUid =
    clubUser?.firebaseUid ||
    clubUser?.linkedFirebaseUid ||
    profile?.firebaseUid ||
    profile?.linkedFirebaseUid ||
    globalUser?.firebaseUid ||
    globalUser?.linkedFirebaseUid;

  if (!userFirebaseUid) {
    logger.warn(`⚠️ Player ${playerId} has no Firebase UID for push`);
    results.failed.push({
      playerId,
      channel: 'push',
      reason: 'No Firebase UID',
    });
    continue;
  }

  // 2. Determina tipo template
  const templateType = getTemplateType(status.certificateStatus);

  // 3. Prepara dati
  const playerData = {
    playerName: profile?.displayName || clubUser?.name || 'Giocatore',
    expiryDate: status.expiryDate || 'N/A',
    daysUntilExpiry: status.daysUntilExpiry || 0,
    clubName: clubData?.name || 'Il Club',
  };

  // 4. Genera notifica da template
  const pushContent = generatePushNotification(templates, templateType, playerData);

  // 5. Salva in-app notification (SEMPRE, anche se push fallisce)
  try {
    await saveUserNotification({
      userId: userFirebaseUid,
      title: pushContent.title,
      body: pushContent.body,
      type: 'certificate',
      priority: templateType === 'expired' ? 'high' : 'normal',
      metadata: {
        clubId,
        playerId,
        certificateStatus: status.certificateStatus,
        expiryDate: status.expiryDate,
        daysUntilExpiry: status.daysUntilExpiry,
      },
    });

    logger.info(`✅ [In-App] Notification saved for ${userFirebaseUid}`);
  } catch (notifError) {
    logger.error('❌ [In-App] Failed to save notification:', notifError);
  }

  // 6. Tenta invio push (non bloccante)
  try {
    await sendPushNotificationToUser(userFirebaseUid, {
      title: pushContent.title,
      body: pushContent.body,
      icon: '🔔',
      data: {
        clubId,
        playerId,
        certificateStatus: status.certificateStatus,
        type: 'certificate',
      },
    });

    logger.info(`✅ [Push] Sent to ${userFirebaseUid}`);

    results.sent.push({
      playerId,
      channel: 'push',
      firebaseUid: userFirebaseUid,
    });
  } catch (pushError) {
    logger.warn('⚠️ [Push] Failed (but in-app saved):', pushError.message);
    results.failed.push({
      playerId,
      channel: 'push',
      reason: pushError.message,
    });
  }
}
```

---

## 🧪 Testing

### Test Locale (Emulator)

```bash
# 1. Avvia emulator
firebase emulators:start --only functions,firestore

# 2. Carica template di test in Firestore
# Usa Firebase Console o script di seed

# 3. Chiama funzione
curl -X POST http://localhost:5001/YOUR_PROJECT_ID/us-central1/sendBulkCertificateNotifications \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "clubId": "test-club",
      "playerIds": ["player-1"],
      "channel": "email"
    }
  }'
```

### Test in Produzione

```javascript
// Da console browser (autenticato come admin)
const functions = getFunctions();
const sendNotifications = httpsCallable(functions, 'sendBulkCertificateNotifications');

await sendNotifications({
  clubId: 'sporting-cat',
  playerIds: ['player-test-id'],
  channel: 'email'
});
```

---

## 📊 Logs Attesi

```
📝 [Templates] Loaded for club: sporting-cat
📧 [Email] Processing email channel for player: player-1
📝 [Email] Using template type: expired
✅ [Email] Sent to mario.rossi@example.com
✅ [In-App] Notification saved for uid-12345
🔔 [Push] Processing push channel for player: player-1
✅ [Push] Sent to uid-12345
```

---

## 🔒 Sicurezza

### Firestore Rules

Assicurati che le regole permettano lettura template:

```javascript
match /clubs/{clubId}/settings/notificationTemplates {
  // Admin può leggere e scrivere
  allow read, write: if isClubAdmin(clubId);
  
  // Cloud Functions possono leggere
  allow read: if request.auth != null;
}
```

---

## 🐛 Troubleshooting

### Template non trovati

**Problema:** Usa sempre template default anche se ho salvato custom

**Soluzione:**
1. Verifica path Firestore: `clubs/{clubId}/settings/notificationTemplates`
2. Controlla che documento esista in Firebase Console
3. Verifica clubId passato alla funzione è corretto
4. Controlla logs: `📝 [Templates] Loaded for club...`

### Variabili non sostituite

**Problema:** Email mostra `{{nome}}` invece di nome reale

**Soluzione:**
1. Verifica `playerData` contiene tutti i campi
2. Controlla `replaceTemplateVariables` viene chiamato
3. Log playerData prima di generare template:
   ```javascript
   logger.info('🔍 Player data:', playerData);
   ```

### Email HTML rotta

**Problema:** Email mostra `<br>` come testo

**Soluzione:**
Usa campo `html` in SendGrid, non `text`:
```javascript
await sendEmailViaSendGrid({
  to: profile.email,
  subject: emailContent.subject,
  html: emailContent.body.replace(/\n/g, '<br>'),
  // ❌ NON: text: emailContent.body
});
```

---

**Prossimi passi:**
1. Integra codice in `sendBulkNotifications.clean.js`
2. Testa in locale con emulator
3. Deploy: `firebase deploy --only functions:sendBulkCertificateNotifications`
4. Test in produzione con singolo giocatore
5. Monitoraggio logs per 24h

---

**File correlati:**
- `functions/services/notificationTemplates.js` - Servizio template
- `functions/sendBulkNotifications.clean.js` - Funzione da aggiornare
- `src/features/admin/components/NotificationTemplateManager.jsx` - UI admin
- `MULTICHANNEL_NOTIFICATION_TEMPLATES.md` - Documentazione completa
