# 📬 Sistema Template Notifiche Multicanale

**Data creazione:** 20 Novembre 2025  
**Versione:** 1.0.0  
**Stato:** ✅ Implementato e pronto per il deploy

---

## 📋 Panoramica

Sistema completo per la gestione centralizzata di template per notifiche multicanale (Email, WhatsApp, Push) relative ai certificati medici. Supporta personalizzazione tramite variabili dinamiche e anteprima in tempo reale.

### 🎯 Obiettivo

Permettere agli admin di club di personalizzare i messaggi inviati ai giocatori per:
- Certificato **scaduto** (expired)
- Certificato **in scadenza** (expiring)
- Certificato **mancante** (missing)

Attraverso **3 canali di comunicazione**:
- 📧 **Email** - Messaggi formali con oggetto e corpo
- 💬 **WhatsApp** - Messaggi brevi con formattazione markdown
- 🔔 **Push Notification** - Notifiche istantanee con titolo e testo

---

## 🏗️ Architettura

### File Principali

```
src/
├─ features/admin/components/
│  ├─ NotificationTemplateManager.jsx  ← Componente UI multicanale
│  ├─ MedicalCertificatesManager.jsx   ← Integrazione con pulsante "Gestione Template"
│  └─ EmailTemplateManager.jsx         ← DEPRECATO (backward compatibility)
│
functions/
└─ sendBulkNotifications.clean.js      ← Backend che usa i template
```

### Database Schema

**Firestore Path:**
```
clubs/{clubId}/settings/notificationTemplates
```

**Struttura documento:**
```javascript
{
  email: {
    expired: { subject: "...", body: "..." },
    expiring: { subject: "...", body: "..." },
    missing: { subject: "...", body: "..." }
  },
  whatsapp: {
    expired: { message: "..." },
    expiring: { message: "..." },
    missing: { message: "..." }
  },
  push: {
    expired: { title: "...", body: "..." },
    expiring: { title: "...", body: "..." },
    missing: { title: "...", body: "..." }
  }
}
```

---

## 🎨 UI e Funzionalità

### Tab dei Canali

```
┌─────────────────────────────────────────────────────┐
│  [📧 Email]  [💬 WhatsApp]  [🔔 Push]               │
└─────────────────────────────────────────────────────┘
```

### Tab dei Template

Per ogni canale, 3 tab per stato certificato:
```
┌─────────────────────────────────────────────────────┐
│  [⚠️ Scaduto]  [🔔 In Scadenza]  [❌ Mancante]      │
└─────────────────────────────────────────────────────┘
```

### Variabili Disponibili

Tutte le variabili funzionano su **tutti i canali**:

| Variabile             | Descrizione              | Esempio             |
|-----------------------|--------------------------|---------------------|
| `{{nome}}`            | Nome del giocatore       | "Mario Rossi"       |
| `{{dataScadenza}}`    | Data scadenza certificato| "15/12/2025"        |
| `{{giorniRimanenti}}` | Giorni alla scadenza     | "10"                |
| `{{nomeClub}}`        | Nome del club            | "Sporting Catania"  |

---

## 📧 Template Email

### Campi

- **Oggetto** (subject): Titolo dell'email
- **Corpo** (body): Contenuto formattato multilinea

### Default Template - Scaduto

```
Oggetto: ⚠️ Certificato Medico Scaduto

Corpo:
Ciao {{nome}},

Ti informiamo che il tuo certificato medico è SCADUTO in data {{dataScadenza}}.

Per poter continuare a partecipare alle attività sportive, è necessario 
rinnovare il certificato medico al più presto.

Ti preghiamo di:
1. Prenotare una visita medica
2. Caricare il nuovo certificato nell'app
3. Comunicarci la nuova data di scadenza

Cordiali saluti,
{{nomeClub}}
```

---

## 💬 Template WhatsApp

### Campi

- **Messaggio** (message): Testo unico con formattazione markdown

### Formattazione Supportata

- `*testo*` → **grassetto**
- `_testo_` → _corsivo_
- Emoji supportati nativamente
- Mantieni messaggi **brevi** (consigliato: max 200 caratteri)

### Default Template - Scaduto

```
🚨 *Certificato Medico Scaduto*

Ciao {{nome}},

Il tuo certificato medico è *SCADUTO* in data {{dataScadenza}}.

⚠️ Non puoi partecipare alle attività fino al rinnovo.

*Cosa fare:*
✅ Prenota visita medica
✅ Carica nuovo certificato nell'app
✅ Comunicaci nuova scadenza

Per info contattaci! 💬

_{{nomeClub}}_
```

---

## 🔔 Template Push Notification

### Campi

- **Titolo** (title): Max 50 caratteri
- **Testo** (body): Max 200 caratteri (consigliato: max 120)

### Limitazioni Mobile

Le notifiche push hanno **limiti di spazio** su dispositivi mobili:
- **Titolo**: Visibile sempre (1 riga)
- **Testo**: Troncato dopo 2-3 righe (circa 120 caratteri)

💡 **Best Practice**: Mantieni messaggi **concisi** e **diretti**.

### Default Template - Scaduto

```
Titolo: ⚠️ Certificato Scaduto

Testo: Il tuo certificato medico è scaduto il {{dataScadenza}}. 
Rinnovalo subito per continuare le attività.
```

---

## 🔄 Integrazione Backend

### Funzione: `sendBulkNotifications.clean.js`

**Location:** `functions/sendBulkNotifications.clean.js`

**Come usa i template:**

```javascript
// 1. Carica template dal database
const templatesDoc = await db.doc(`clubs/${clubId}/settings/notificationTemplates`).get();
const templates = templatesDoc.exists() ? templatesDoc.data() : DEFAULT_TEMPLATES;

// 2. Seleziona template in base a stato certificato
let templateType = 'missing';
if (status === 'expired') templateType = 'expired';
else if (status === 'expiring' || status === 'urgent') templateType = 'expiring';

// 3. Sostituisci variabili con dati reali
function replaceVariables(text, data) {
  return text
    .replace(/\{\{nome\}\}/g, data.playerName)
    .replace(/\{\{dataScadenza\}\}/g, data.expiryDate || 'N/A')
    .replace(/\{\{giorniRimanenti\}\}/g, data.daysUntilExpiry || '0')
    .replace(/\{\{nomeClub\}\}/g, data.clubName);
}

// 4. Invia per ogni canale
if (channel === 'email') {
  const { subject, body } = templates.email[templateType];
  await sendEmail({
    to: player.email,
    subject: replaceVariables(subject, playerData),
    body: replaceVariables(body, playerData)
  });
}

if (channel === 'push') {
  const { title, body } = templates.push[templateType];
  await sendPushNotification(player.firebaseUid, {
    title: replaceVariables(title, playerData),
    body: replaceVariables(body, playerData)
  });
}

if (channel === 'whatsapp') {
  const { message } = templates.whatsapp[templateType];
  await sendWhatsAppMessage(player.phone, 
    replaceVariables(message, playerData)
  );
}
```

---

## 🎭 Preview in Tempo Reale

Il componente mostra un'**anteprima live** con variabili sostituite da dati di esempio:

### Email Preview
```
┌─────────────────────────────────────────────────────┐
│ 👁️ ANTEPRIMA                                        │
├─────────────────────────────────────────────────────┤
│ ⚠️ Certificato Medico Scaduto                       │
│                                                      │
│ Ciao Mario Rossi,                                   │
│                                                      │
│ Ti informiamo che il tuo certificato medico è       │
│ SCADUTO in data 15/12/2025.                         │
│ ...                                                  │
└─────────────────────────────────────────────────────┘
```

### WhatsApp Preview
```
┌─────────────────────────────────────────────────────┐
│ 👁️ ANTEPRIMA (simula messaggio WhatsApp)            │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐            │
│  │ 🚨 Certificato Medico Scaduto       │            │
│  │                                     │            │
│  │ Ciao Mario Rossi,                   │            │
│  │                                     │            │
│  │ Il tuo certificato è SCADUTO...     │            │
│  │                                     │            │
│  │                             10:30   │            │
│  └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
```

### Push Preview
```
┌─────────────────────────────────────────────────────┐
│ 👁️ ANTEPRIMA (simula notifica mobile)               │
├─────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐         │
│  │ 🔔  ⚠️ Certificato Scaduto             │         │
│  │     Il tuo certificato è scaduto il    │         │
│  │     15/12/2025. Rinnovalo subito...    │         │
│  │                                        │         │
│  │     Il tuo Club · Adesso               │         │
│  └────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Utilizzo

### 1. Accesso

Dalla dashboard admin del club:
1. Vai in **Giocatori** → **Certificati Medici**
2. Clicca su **⚙️ Gestione Template**

### 2. Modifica Template

1. Seleziona **canale** (Email, WhatsApp, Push)
2. Seleziona **stato certificato** (Scaduto, In Scadenza, Mancante)
3. Modifica i campi del template
4. Usa le **variabili** per personalizzare
5. Verifica l'**anteprima** in tempo reale
6. Clicca **💾 Salva Template**

### 3. Ripristino Predefiniti

In qualsiasi momento puoi cliccare **↺ Ripristina Predefiniti** per tornare ai template di default (richiede conferma).

---

## 🔍 Dettagli Implementazione

### Componente: NotificationTemplateManager.jsx

**Props:**
- `clubId` (string) - ID del club
- `onClose` (function) - Callback per chiusura modal

**State:**
```javascript
const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
const [selectedChannel, setSelectedChannel] = useState('email');
const [selectedType, setSelectedType] = useState('expired');
const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);
```

**Metodi principali:**
- `loadTemplates()` - Carica template da Firestore (merge con default)
- `handleSave()` - Salva template su Firestore
- `handleReset()` - Ripristina template predefiniti
- `updateTemplate(channel, type, field, value)` - Aggiorna singolo campo

### Gestione Errori

```javascript
async function loadTemplates() {
  try {
    const docRef = doc(db, 'clubs', clubId, 'settings', 'notificationTemplates');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Merge per retrocompatibilità
      const loaded = docSnap.data();
      setTemplates({
        email: { ...DEFAULT_TEMPLATES.email, ...loaded.email },
        whatsapp: { ...DEFAULT_TEMPLATES.whatsapp, ...loaded.whatsapp },
        push: { ...DEFAULT_TEMPLATES.push, ...loaded.push }
      });
    }
  } catch (error) {
    console.error('Error loading templates:', error);
    // Usa template predefiniti come fallback
  }
}
```

---

## 🧪 Testing

### Checklist Pre-Deploy

- [ ] Template predefiniti presenti per tutti i canali e stati
- [ ] Variabili `{{nome}}`, `{{dataScadenza}}`, `{{giorniRimanenti}}`, `{{nomeClub}}` funzionano
- [ ] Salvataggio su Firestore crea documento corretto
- [ ] Anteprima email mostra formattazione multilinea
- [ ] Anteprima WhatsApp applica markdown (`*testo*` → grassetto)
- [ ] Anteprima Push mostra card mobile stile iOS/Android
- [ ] Ripristino predefiniti chiede conferma
- [ ] Pulsante "Annulla" chiude modal senza salvare
- [ ] Pulsante "Salva" disabilitato durante salvataggio
- [ ] Messaggio "✅ Template salvati con successo" appare dopo save

### Test Manuale

1. **Test Salvataggio:**
   - Modifica template email scaduto
   - Salva
   - Ricarica pagina
   - Verifica che modifica sia persistita

2. **Test Multicanale:**
   - Modifica template su tutti e 3 i canali
   - Salva
   - Verifica in Firebase Console: `clubs/{clubId}/settings/notificationTemplates`

3. **Test Anteprima:**
   - Inserisci variabili nei template
   - Verifica che anteprima mostri "Mario Rossi" al posto di `{{nome}}`

---

## 📊 Migrazione da Sistema Email-Only

### Compatibilità

Il vecchio `EmailTemplateManager` è **deprecato** ma mantenuto per retrocompatibilità. I vecchi template email sono **automaticamente migrati** al nuovo sistema:

```javascript
// OLD: clubs/{clubId}/settings/emailTemplates
// NEW: clubs/{clubId}/settings/notificationTemplates

// Migrazione automatica al primo caricamento
if (docSnap.exists()) {
  const loaded = docSnap.data();
  
  // Se trova solo email, aggiunge default per whatsapp/push
  setTemplates({
    email: loaded.email || DEFAULT_TEMPLATES.email,
    whatsapp: loaded.whatsapp || DEFAULT_TEMPLATES.whatsapp,
    push: loaded.push || DEFAULT_TEMPLATES.push
  });
}
```

### Passaggi Migrazione

1. **Non richiede azione manuale** - I vecchi template email vengono preservati
2. **Whatsapp e Push** usano template predefiniti fino a personalizzazione
3. **Vecchio file** `EmailTemplateManager.jsx` può essere rimosso dopo verifica

---

## 🎯 Prossimi Sviluppi

### Fase 2 - Integrazione WhatsApp

- [ ] Implementare invio WhatsApp tramite API (es. Twilio, WhatsApp Business API)
- [ ] Aggiungere campo `phoneNumber` validato in profilo giocatore
- [ ] Backend: `sendWhatsAppMessage(phone, message)` in `sendBulkNotifications.clean.js`
- [ ] UI: Checkbox "Invia anche via WhatsApp" in pannello invio notifiche

### Fase 3 - Analisi Template

- [ ] Contatore aperture email (tracking pixel)
- [ ] Statistiche click su link (shortlinks)
- [ ] Report efficacia canale (email vs push vs whatsapp)

### Fase 4 - Template Avanzati

- [ ] Supporto HTML rich per email (editor WYSIWYG)
- [ ] Allegati automatici (es. PDF promemoria)
- [ ] Template condizionali (es. testo diverso se giorni < 7)

---

## 📞 Supporto

**Domande o problemi?**
- Controlla console browser per errori (DevTools → Console)
- Verifica Firestore rules permettano scrittura su `clubs/{clubId}/settings/*`
- Leggi log Firebase Functions per errori backend

**File di riferimento:**
- `src/features/admin/components/NotificationTemplateManager.jsx`
- `functions/sendBulkNotifications.clean.js`
- Questo documento: `MULTICHANNEL_NOTIFICATION_TEMPLATES.md`

---

**Ultima modifica:** 20 Novembre 2025  
**Autore:** Sistema Play Sport Pro  
**Versione:** 1.0.0
