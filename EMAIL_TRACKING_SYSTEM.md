# 📧 Email Tracking per Certificati Medici

## 🎯 Funzionalità

Sistema di tracking degli invii email per i certificati medici che permette agli admin del club di visualizzare quando è stata inviata l'ultima email a ciascun giocatore.

---

## ✨ Caratteristiche

### 1. **Salvataggio Automatico**
- ✅ Ogni email inviata viene tracciata in Firestore
- ✅ Salva: data/ora invio, tipo template, oggetto, successo/fallimento
- ✅ Mantiene storico completo di tutte le email inviate

### 2. **Visualizzazione Badge**
- ✅ Badge colorato con icona e data relativa
- ✅ Icone diverse per tipo di email:
  - ⚠️ Certificato Scaduto
  - 🔔 Certificato In Scadenza
  - ❌ Certificato Mancante
  - 📧 Email Generica

### 3. **Tooltip Dettagliato**
- ✅ Appare al passaggio del mouse sul badge
- ✅ Mostra:
  - Data/ora invio (formato relativo o assoluto)
  - Tipo di template usato
  - Oggetto dell'email inviata

---

## 🔧 Implementazione Tecnica

### File Creati

#### `src/services/emailTracking.js` (135 righe)

**Funzioni Principali**:

```javascript
// Salva tracking email in Firestore
trackCertificateEmail(clubId, playerId, emailInfo)

// Ottiene ultima email inviata
getLastEmailSent(player)

// Formatta data in formato relativo
formatLastEmailDate(player)

// Storico completo email
getEmailHistory(player)

// Conta email inviate
getEmailCount(player)

// Verifica email recente (<24h)
hasRecentEmail(player)
```

### File Modificati

#### 1. `SendCertificateEmailModal.jsx`

**Modifiche**:
- Import `trackCertificateEmail`
- Tracking automatico dopo invio riuscito (linee 197-209)

**Codice**:
```javascript
// Dopo invio email riuscito
if (result.status === 'fulfilled' && result.value?.data?.success) {
  // ... altri codice ...
  
  // Salva tracking dell'email inviata
  const status = player.certificateStatus || 
                 calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);
  const templateType = getTemplateForPlayer(player);
  const template = templates[templateType];
  const personalized = personalizeMessage(template, player, status);
  
  await trackCertificateEmail(clubId, player.id, {
    type: 'certificate',
    templateType: templateType,
    subject: personalized.subject,
    success: true,
  });
}
```

#### 2. `MedicalCertificatesManager.jsx`

**Modifiche**:
- Import `getLastEmailSent`, `formatLastEmailDate`
- Badge email nella lista giocatori (linee 678-741)

**Codice**:
```jsx
{/* Icona Email Inviata */}
{(() => {
  const lastEmail = getLastEmailSent(player);
  if (!lastEmail) return null;
  
  const emailDate = formatLastEmailDate(player);
  const templateIcons = {
    expired: '⚠️',
    expiring: '🔔',
    missing: '❌',
    generic: '📧',
  };
  const icon = templateIcons[lastEmail.templateType] || '📧';
  
  return (
    <div className="shrink-0 group relative cursor-help">
      {/* Badge */}
      <div className="flex items-center gap-1 px-2 py-1 bg-blue-900/30 border border-blue-600/50 rounded-lg">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-blue-300 font-medium">
          {emailDate}
        </span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute ... group-hover:opacity-100 ...">
        <div className="text-xs space-y-1.5">
          <div>Data: {emailDate}</div>
          <div>Tipo: {lastEmail.templateType}</div>
          <div>Oggetto: "{lastEmail.subject}"</div>
        </div>
      </div>
    </div>
  );
})()}
```

---

## 📊 Struttura Dati Firestore

### Schema Player

```javascript
// Percorso: clubs/{clubId}/players/{playerId}
{
  // ... altri campi player ...
  
  medicalCertificates: {
    current: {
      expiryDate: "2024-12-31",
      // ... altri campi ...
    },
    
    // NUOVO: Storico email inviate
    emailHistory: [
      {
        sentAt: "2024-11-10T14:30:00.000Z",
        type: "certificate",
        templateType: "expired",
        subject: "⚠️ Certificato Medico Scaduto",
        success: true
      },
      {
        sentAt: "2024-11-05T09:15:00.000Z",
        type: "certificate",
        templateType: "expiring",
        subject: "🔔 Certificato Medico in Scadenza",
        success: true
      }
    ],
    
    // NUOVO: Data ultimo invio (per query veloci)
    lastEmailSent: "2024-11-10T14:30:00.000Z"
  }
}
```

### Campo `emailHistory[]`

Ogni elemento contiene:

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `sentAt` | ISO String | Data/ora invio email |
| `type` | String | Tipo email ('certificate', 'reminder', 'custom') |
| `templateType` | String | Template usato ('expired', 'expiring', 'missing', 'generic') |
| `subject` | String | Oggetto email inviata |
| `success` | Boolean | Invio riuscito (true/false) |

---

## 🎨 UI/UX

### Badge Email

**Aspetto**:
```
┌─────────────────┐
│ ⚠️  2h fa       │  ← Badge blu con icona e tempo relativo
└─────────────────┘
```

**Colori**:
- Background: `bg-blue-900/30`
- Border: `border-blue-600/50`
- Testo: `text-blue-300`

**Posizionamento**:
- Tra "Status Certificato" e "Azioni" (pulsante Apri Scheda)
- Allineato verticalmente con gli altri elementi

### Tooltip

**Trigger**: Hover sul badge

**Contenuto**:
```
┌─────────────────────────────────┐
│ ⚠️ Email Inviata               │
├─────────────────────────────────┤
│ Data: 2 ore fa                  │
│ Tipo: expired                   │
│ Oggetto:                        │
│   "⚠️ Certificato Medico       │
│    Scaduto"                     │
└─────────────────────────────────┘
```

**Stile**:
- Background: `bg-gray-900`
- Border: `border-gray-700`
- Shadow: `shadow-xl`
- Posizione: Sotto il badge, allineato a destra
- Larghezza: `w-64` (256px)

---

## 📅 Formattazione Date

### Formato Relativo (Recenti)

| Tempo Trascorso | Formato Visualizzato |
|-----------------|----------------------|
| < 1 minuto | "Appena inviata" |
| 1-59 minuti | "15 min fa" |
| 1-23 ore | "2h fa" |
| 1 giorno | "Ieri" |
| 2-6 giorni | "3 giorni fa" |

### Formato Assoluto (Vecchie)

| Tempo Trascorso | Formato Visualizzato |
|-----------------|----------------------|
| > 7 giorni | "05/11/2024" |

**Logica**:
```javascript
const diffMins = Math.floor((now - date) / 60000);
const diffHours = Math.floor((now - date) / 3600000);
const diffDays = Math.floor((now - date) / 86400000);

if (diffMins < 1) return 'Appena inviata';
if (diffMins < 60) return `${diffMins} min fa`;
if (diffHours < 24) return `${diffHours}h fa`;
if (diffDays === 1) return 'Ieri';
if (diffDays < 7) return `${diffDays} giorni fa`;
return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
```

---

## 🔄 Flusso Completo

### 1. Admin Invia Email

```
MedicalCertificatesManager
  ↓
Seleziona giocatori
  ↓
Clicca "📧 Invia Email Certificati"
  ↓
SendCertificateEmailModal
  ↓
Invia email via sendClubEmail
  ↓
SE SUCCESSO:
  trackCertificateEmail(clubId, playerId, emailInfo)
  ↓
  Firestore: players/{playerId}/medicalCertificates
    - emailHistory += nuovo log
    - lastEmailSent = data invio
```

### 2. Visualizzazione Badge

```
MedicalCertificatesManager carica players
  ↓
Per ogni player:
  lastEmail = getLastEmailSent(player)
  ↓
  SE lastEmail esiste:
    emailDate = formatLastEmailDate(player)
    icon = templateIcons[lastEmail.templateType]
    ↓
    Renderizza badge con icona + data
```

### 3. Tooltip al Hover

```
Mouse over badge
  ↓
CSS: group-hover:opacity-100
  ↓
Mostra tooltip con:
  - Data formattata
  - Tipo template
  - Oggetto email
```

---

## 🧪 Testing

### Test Case 1: Primo Invio

1. Seleziona giocatore senza storico email
2. Invia email certificato scaduto
3. **Verifica**:
   - ✅ Badge appare con icona ⚠️
   - ✅ Data mostra "Appena inviata"
   - ✅ Tooltip mostra oggetto corretto

### Test Case 2: Invii Multipli

1. Invia email a stesso giocatore più volte
2. **Verifica**:
   - ✅ Badge mostra solo l'ULTIMA email
   - ✅ emailHistory contiene tutte le email
   - ✅ lastEmailSent corrisponde all'ultima

### Test Case 3: Formattazione Date

1. Invia email
2. Aspetta 5 minuti
3. Ricarica pagina
4. **Verifica**: Badge mostra "5 min fa"
5. Cambia manualmente `sentAt` a ieri
6. Ricarica pagina
7. **Verifica**: Badge mostra "Ieri"

### Test Case 4: Tooltip

1. Passa mouse su badge
2. **Verifica**:
   - ✅ Tooltip appare dopo hover
   - ✅ Mostra data, tipo, oggetto
   - ✅ Scompare quando mouse esce

---

## 🎯 Vantaggi per Admin

### Prima (Senza Tracking)
❌ Non sa quali giocatori hanno già ricevuto email  
❌ Rischio di inviare email duplicate  
❌ Nessuna visibilità sullo storico comunicazioni

### Dopo (Con Tracking)
✅ Vede immediatamente chi ha ricevuto email  
✅ Sa quando è stata inviata l'ultima comunicazione  
✅ Evita spam con notifiche ripetute  
✅ Può filtrare giocatori già avvisati  
✅ Storico completo per audit

---

## 💡 Casi d'Uso

### Scenario 1: Certificati Scaduti
```
Admin apre pannello certificati
  ↓
Vede 10 giocatori con certificato scaduto
  ↓
3 hanno badge ⚠️ "1 giorno fa"
  ↓
Admin decide di inviare email solo ai 7 rimanenti
```

### Scenario 2: Follow-up
```
Admin inviò email 5 giorni fa
  ↓
Giocatore non ha ancora rinnovato
  ↓
Badge mostra "5 giorni fa"
  ↓
Admin decide di inviare reminder o contattare telefonicamente
```

### Scenario 3: Audit
```
Admin clicca su badge
  ↓
Tooltip mostra esattamente quale email fu inviata
  ↓
Verifica che il messaggio corretto sia stato usato
```

---

## 🔮 Miglioramenti Futuri

### Immediate
- [ ] Filtro "Email inviate nelle ultime 24h"
- [ ] Badge colore diverso per email fallite (rosso)
- [ ] Contatore email totali inviate al giocatore

### Medio Termine
- [ ] Click su badge apre storico completo email
- [ ] Export CSV storico comunicazioni
- [ ] Grafico timeline invii email

### Lungo Termine
- [ ] Tracking aperture email (SendGrid webhook)
- [ ] Tracking click link nelle email
- [ ] Risposta automatica se giocatore carica certificato dopo email

---

## 📚 API Reference

### `trackCertificateEmail(clubId, playerId, emailInfo)`

Salva tracking di un invio email.

**Parametri**:
- `clubId` (string): ID del club
- `playerId` (string): ID del giocatore
- `emailInfo` (object): Dati email
  - `type` (string): 'certificate' | 'reminder' | 'custom'
  - `templateType` (string): 'expired' | 'expiring' | 'missing' | 'generic'
  - `subject` (string): Oggetto email
  - `success` (boolean): Default true

**Returns**: `Promise<void>`

**Esempio**:
```javascript
await trackCertificateEmail('sporting-cat', 'player123', {
  type: 'certificate',
  templateType: 'expired',
  subject: '⚠️ Certificato Medico Scaduto',
  success: true
});
```

---

### `getLastEmailSent(player)`

Ottiene l'ultimo invio email per un giocatore.

**Parametri**:
- `player` (object): Oggetto giocatore da Firestore

**Returns**: `object | null`

**Esempio**:
```javascript
const lastEmail = getLastEmailSent(player);
if (lastEmail) {
  console.log(lastEmail.sentAt); // "2024-11-10T14:30:00.000Z"
  console.log(lastEmail.templateType); // "expired"
}
```

---

### `formatLastEmailDate(player)`

Formatta data ultima email in formato leggibile.

**Parametri**:
- `player` (object): Oggetto giocatore

**Returns**: `string` - Data formattata o ''

**Esempi**:
```javascript
formatLastEmailDate(player) // "2h fa"
formatLastEmailDate(player) // "Ieri"
formatLastEmailDate(player) // "05/11/2024"
```

---

## ✅ Checklist Deploy

- [x] Servizio `emailTracking.js` creato
- [x] Import in `SendCertificateEmailModal.jsx`
- [x] Tracking dopo invio email implementato
- [x] Import in `MedicalCertificatesManager.jsx`
- [x] Badge email renderizzato nella lista
- [x] Tooltip con dettagli implementato
- [x] Formattazione date relative/assolute
- [x] Icone diverse per tipo template
- [ ] Test funzionale end-to-end
- [ ] Verifica su mobile
- [ ] Verifica performance con molti giocatori

---

**Status**: ✅ Implementato - Pronto per Test  
**Versione**: 1.0.0  
**Data**: 2024-11-10
