# Changelog - Template Notifiche Multicanale

**Data:** 20 Novembre 2025  
**Versione:** 2.3.0  
**Tipo:** Feature

---

## 🎯 Nuova Feature: Gestione Template Multicanale

### Cosa è stato aggiunto

Sistema completo per la gestione centralizzata di template per notifiche multicanale (Email, WhatsApp, Push) relative ai certificati medici.

### 📋 File Creati

1. **`src/features/admin/components/NotificationTemplateManager.jsx`** (451 righe)
   - Componente React per UI gestione template
   - Tab per 3 canali: Email, WhatsApp, Push
   - Tab per 3 stati certificato: Scaduto, In Scadenza, Mancante
   - Anteprima live con sostituzione variabili
   - Salvataggio su Firestore

2. **`functions/services/notificationTemplates.js`** (288 righe)
   - Servizio backend per caricamento template da DB
   - Funzioni helper per generare messaggi con variabili
   - Gestione fallback su template predefiniti
   - Export: `loadNotificationTemplates`, `generateEmailMessage`, `generatePushNotification`

3. **Documentazione:**
   - `MULTICHANNEL_NOTIFICATION_TEMPLATES.md` - Documentazione completa sistema
   - `BACKEND_TEMPLATE_INTEGRATION_GUIDE.md` - Guida integrazione backend
   - `TEMPLATE_SYSTEM_SUMMARY.md` - Riepilogo implementazione

### 🔧 File Modificati

1. **`src/features/admin/components/MedicalCertificatesManager.jsx`**
   - Import: `EmailTemplateManager` → `NotificationTemplateManager`
   - Pulsante "Gestione Template" ora apre modal multicanale

### ✨ Funzionalità

#### UI Admin
- ✅ 3 canali di notifica configurabili (Email, WhatsApp, Push)
- ✅ 3 template per stato certificato (Scaduto, In Scadenza, Mancante)
- ✅ Editor testo con anteprima in tempo reale
- ✅ Anteprima stile email/WhatsApp/Push con variabili sostituite
- ✅ Pulsante "Salva Template" (Firestore)
- ✅ Pulsante "Ripristina Predefiniti" (con conferma)
- ✅ Validazione lunghezza (Push: max 50 char title, 200 char body)

#### Variabili Template
- `{{nome}}` - Nome del giocatore
- `{{dataScadenza}}` - Data scadenza certificato
- `{{giorniRimanenti}}` - Giorni alla scadenza
- `{{nomeClub}}` - Nome del club

#### Database
- **Path:** `clubs/{clubId}/settings/notificationTemplates`
- **Struttura:** 3 canali × 3 stati = 9 template configurabili

### 📊 Esempi Template Predefiniti

#### Email - Certificato Scaduto
```
Oggetto: ⚠️ Certificato Medico Scaduto
Corpo: Ciao {{nome}}, il tuo certificato è scaduto il {{dataScadenza}}...
```

#### WhatsApp - Certificato In Scadenza
```
⏰ *Certificato in Scadenza*
Ciao {{nome}}, scade tra {{giorniRimanenti}} giorni!
```

#### Push - Certificato Mancante
```
Titolo: ❌ Certificato Mancante
Testo: Carica il tuo certificato medico per partecipare...
```

### 🔄 Compatibilità

- ✅ Retrocompatibile con vecchio sistema email-only
- ✅ Merge automatico tra template custom e default
- ✅ `EmailTemplateManager.jsx` deprecato ma mantenuto

### 🚧 Integrazione Backend (TODO)

**IMPORTANTE:** Il servizio backend è pronto ma richiede integrazione manuale in `sendBulkNotifications.clean.js`.

**Passi richiesti:**
1. Import servizio template
2. Caricamento template all'inizio della funzione
3. Sostituzione logica email/push hardcoded con chiamate al servizio
4. Test in locale con emulator
5. Test in produzione con singolo giocatore

**Vedi:** `BACKEND_TEMPLATE_INTEGRATION_GUIDE.md` per codice dettagliato.

### 🧪 Testing

#### Frontend
```bash
npm run dev
# 1. Login come admin
# 2. Giocatori → Certificati Medici
# 3. Clicca "Gestione Template"
# 4. Modifica template, verifica anteprima
# 5. Salva e controlla Firestore Console
```

#### Backend
```bash
firebase emulators:start --only functions,firestore
# Testa con chiamata HTTP/callable a sendBulkCertificateNotifications
```

### 📦 Deploy

```powershell
# Frontend
npm run build
firebase deploy --only hosting

# Backend (dopo integrazione)
firebase deploy --only functions:sendBulkCertificateNotifications
```

### 🎯 Prossimi Sviluppi

**Fase 2 - Integrazione WhatsApp:**
- [ ] API WhatsApp Business (Twilio/Meta)
- [ ] Campo `phoneNumber` in profili giocatori
- [ ] Backend: `sendWhatsAppMessage(phone, message)`

**Fase 3 - Analytics:**
- [ ] Tracking aperture email (pixel)
- [ ] Tracking click link (shortlinks)
- [ ] Report efficacia canale

**Fase 4 - Editor Avanzato:**
- [ ] HTML rich editor per email (WYSIWYG)
- [ ] Allegati automatici (PDF)
- [ ] Template condizionali

### 🐛 Known Issues

- ❌ Integrazione backend non completata (richiede modifica manuale `sendBulkNotifications.clean.js`)
- ❌ WhatsApp solo template (API non integrata)
- ⚠️ Line endings CRLF su Windows (lint warning, non critico)

### 📝 Breaking Changes

Nessuno - completamente retrocompatibile.

### 🔐 Sicurezza

**Firestore Rules richieste:**
```javascript
match /clubs/{clubId}/settings/notificationTemplates {
  allow read, write: if isClubAdmin(clubId);
  allow read: if request.auth != null; // Cloud Functions
}
```

### 📞 Supporto

**File di riferimento:**
- `src/features/admin/components/NotificationTemplateManager.jsx`
- `functions/services/notificationTemplates.js`
- `MULTICHANNEL_NOTIFICATION_TEMPLATES.md` - Documentazione completa

---

**Commit:** `feat: add multichannel notification template manager`  
**Branch:** Suggerito: `feature/multichannel-templates`  
**Reviewer:** Testare UI admin + verificare Firestore save funzionante
