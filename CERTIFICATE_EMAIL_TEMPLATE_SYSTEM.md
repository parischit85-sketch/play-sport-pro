# Sistema Template Email Certificati Medici

## 📋 Panoramica

Sistema completo per l'invio automatizzato di email personalizzate ai giocatori in base allo stato del loro certificato medico. Include gestione template configurabili dall'admin e personalizzazione automatica dei messaggi.

## ✨ Funzionalità Principali

### 1. **Gestione Template** (EmailTemplateManager)
- **Accesso**: Pulsante "⚙️ Gestione Template" nel pannello Certificati Medici
- **Template disponibili**:
  - **Scaduto**: Per certificati già scaduti
  - **In Scadenza**: Per certificati che scadranno presto
  - **Mancante**: Per giocatori senza certificato

- **Variabili disponibili**:
  - `{{nome}}`: Nome completo del giocatore
  - `{{dataScadenza}}`: Data di scadenza (formato DD/MM/YYYY)
  - `{{giorniRimanenti}}`: Giorni rimanenti alla scadenza
  - `{{nomeClub}}`: Nome del club

### 2. **Invio Email Certificati** (SendCertificateEmailModal)
- **Accesso**: Pulsante "📧 Invia Email Certificati" (selezionare giocatori prima)
- **Funzionamento**:
  1. Seleziona automaticamente il template appropriato per ogni giocatore
  2. Personalizza il messaggio con i dati del giocatore
  3. Mostra un riepilogo raggruppato per tipo di template
  4. Permette preview espandibile per ogni gruppo
  5. Invia email individuali a ciascun destinatario

### 3. **Email Personalizzata Generica**
- **Accesso**: Pulsante "✉️ Email Personalizzata"
- **Uso**: Per messaggi custom che non seguono i template certificati

## 🎨 Interfaccia Utente

### Pulsanti nel Pannello Certificati Medici

```
┌─────────────────────────────────────────────────────────────────┐
│ [⚙️ Gestione Template] [📧 Invia Email Certificati]           │
│ [✉️ Email Personalizzata] [🔔 Notifica Push] [🖥️ WhatsApp App] │
└─────────────────────────────────────────────────────────────────┘
```

**Colori distintivi**:
- **Gestione Template**: Viola (purple-600)
- **Email Certificati**: Blu (blue-600)
- **Email Personalizzata**: Indigo (indigo-600)
- **Notifica Push**: Verde (green-600)
- **WhatsApp**: Verde scuro (emerald-700)

## 📂 Struttura Tecnica

### File Creati/Modificati

#### **Nuovi Componenti**

1. **`src/features/admin/components/EmailTemplateManager.jsx`** (281 righe)
   - Gestisce caricamento/salvataggio template da Firestore
   - UI con tabs per i 3 tipi di template
   - Preview in tempo reale delle variabili
   - Reset ai valori di default

2. **`src/features/admin/components/SendCertificateEmailModal.jsx`** (380 righe)
   - Carica template personalizzati dal club
   - Seleziona automaticamente template per ciascun giocatore
   - Personalizza messaggi con dati reali
   - Raggruppa destinatari per tipo di template
   - Preview espandibile per gruppo
   - Invio parallelo con gestione errori

#### **Componenti Modificati**

3. **`src/features/admin/components/MedicalCertificatesManager.jsx`**
   - Aggiunti stati: `showTemplateManager`, `showCertificateEmailModal`
   - Aggiunti 3 pulsanti per email (template, certificati, personalizzata)
   - Renderizzazione condizionale dei nuovi modal

### Firestore Schema

```javascript
// Percorso: clubs/{clubId}/settings/emailTemplates
{
  expired: {
    subject: "⚠️ Certificato Medico Scaduto",
    body: "Ciao {{nome}},\n\nIl tuo certificato è scaduto..."
  },
  expiring: {
    subject: "🔔 Certificato Medico in Scadenza",
    body: "Ciao {{nome}},\n\nIl tuo certificato scadrà il {{dataScadenza}}..."
  },
  missing: {
    subject: "❌ Certificato Medico Mancante",
    body: "Ciao {{nome}},\n\nNon abbiamo il tuo certificato..."
  }
}
```

## 🔄 Flusso di Utilizzo

### Scenario 1: Configurazione Template (Prima Volta)

1. Admin apre pannello Certificati Medici
2. Clicca "⚙️ Gestione Template"
3. Modifica i template per ogni categoria
4. Clicca "💾 Salva Template"
5. Template salvati in Firestore per il club

### Scenario 2: Invio Email Automatizzate

1. Admin seleziona giocatori con certificati problematici
2. Clicca "📧 Invia Email Certificati"
3. Modal mostra riepilogo:
   ```
   📧 Scaduti (2 giocatori)
   ▼ Mostra anteprima
     • Mario Rossi → mario@example.com
     • Luigi Verdi → luigi@example.com
   
   🔔 In Scadenza (3 giocatori)
   ▶ Mostra anteprima
   
   ❌ Mancanti (1 giocatore)
   ▶ Mostra anteprima
   ```
4. Admin espande preview per verificare messaggi
5. Clicca "📧 Invia Email"
6. Sistema invia email individuali con Promise.allSettled
7. Mostra risultati: "✅ 6/6 email inviate con successo"

### Scenario 3: Email Personalizzata Generica

1. Admin seleziona giocatori
2. Clicca "✉️ Email Personalizzata"
3. Scrive oggetto e corpo personalizzati
4. Invia email identica a tutti i selezionati

## 🎯 Logica di Selezione Template

```javascript
function getTemplateForPlayer(player) {
  const status = calculateCertificateStatus(player.medicalCertificateExpiry);
  
  if (status === 'expired') return templates.expired;
  if (status === 'missing') return templates.missing;
  // Tutti gli altri stati (expiring, urgent) usano template "expiring"
  return templates.expiring;
}
```

## 📝 Template di Default

### Template "Scaduto"
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

Per qualsiasi informazione, siamo a tua disposizione.

Cordiali saluti,
{{nomeClub}}
```

### Template "In Scadenza"
```
Oggetto: 🔔 Certificato Medico in Scadenza

Corpo:
Ciao {{nome}},

Ti informiamo che il tuo certificato medico scadrà il {{dataScadenza}} 
(tra {{giorniRimanenti}} giorni).

Per evitare interruzioni nelle tue attività sportive, ti consigliamo 
di rinnovarlo al più presto.

Ti preghiamo di:
1. Prenotare una visita medica
2. Caricare il nuovo certificato nell'app
3. Comunicarci la nuova data di scadenza

Per qualsiasi informazione, siamo a tua disposizione.

Cordiali saluti,
{{nomeClub}}
```

### Template "Mancante"
```
Oggetto: ❌ Certificato Medico Mancante

Corpo:
Ciao {{nome}},

Risulta che non abbiamo ancora ricevuto il tuo certificato medico.

Per poter partecipare alle attività sportive, è obbligatorio avere 
un certificato medico valido.

Ti preghiamo di:
1. Effettuare una visita medica
2. Caricare il certificato nell'app
3. Comunicarci la data di scadenza

Per qualsiasi informazione, siamo a tua disposizione.

Cordiali saluti,
{{nomeClub}}
```

## 🔧 Personalizzazione Messaggi

### Funzione personalizeMessage()

```javascript
function personalizeMessage(template, playerData) {
  let message = template;
  
  // Sostituisce variabili con dati reali
  message = message.replace(/\{\{nome\}\}/g, playerData.displayName);
  message = message.replace(/\{\{dataScadenza\}\}/g, playerData.formattedDate);
  message = message.replace(/\{\{giorniRimanenti\}\}/g, playerData.daysRemaining);
  message = message.replace(/\{\{nomeClub\}\}/g, clubName);
  
  return message;
}
```

### Esempio di Personalizzazione

**Template**:
```
Ciao {{nome}},
Il tuo certificato scadrà il {{dataScadenza}} (tra {{giorniRimanenti}} giorni).
Cordiali saluti, {{nomeClub}}
```

**Dati Giocatore**:
```javascript
{
  displayName: "Mario Rossi",
  medicalCertificateExpiry: "2024-12-31",
  daysRemaining: 45
}
```

**Messaggio Finale**:
```
Ciao Mario Rossi,
Il tuo certificato scadrà il 31/12/2024 (tra 45 giorni).
Cordiali saluti, Sporting Cat
```

## 📊 Gestione Invio Email

### Promise.allSettled per Invio Parallelo

```javascript
const results = await Promise.allSettled(
  selectedPlayers.map((player) =>
    sendClubEmail(clubId, player.email, personalizedSubject, personalizedBody)
  )
);

// Conta successi ed errori
const sent = results.filter((r) => r.status === 'fulfilled').length;
const failed = results.filter((r) => r.status === 'rejected').length;
```

**Vantaggi**:
- Invio parallelo (più veloce)
- Continua anche se alcune email falliscono
- Report dettagliato successi/errori

## ✅ Testing

### Checklist Pre-Deploy

- [ ] Template di default caricano correttamente
- [ ] Salvataggio template in Firestore funziona
- [ ] Caricamento template personalizzati da Firestore
- [ ] Variabili sostituite correttamente
- [ ] Selezione automatica template per stato certificato
- [ ] Raggruppamento corretto nel modal riepilogo
- [ ] Preview espandibile funziona
- [ ] Invio email con sendClubEmail funziona
- [ ] Gestione errori mostra fallimenti specifici
- [ ] Deseleziona giocatori dopo invio riuscito

### Test Case

#### TC1: Gestione Template
1. Apri "Gestione Template"
2. Modifica template "Scaduto"
3. Salva
4. Ricarica pagina
5. **Verifica**: Template salvato persiste

#### TC2: Invio Email Automatizzato
1. Seleziona 1 giocatore scaduto, 1 in scadenza, 1 mancante
2. Clicca "Invia Email Certificati"
3. Espandi tutti i gruppi
4. **Verifica**: 3 template diversi applicati correttamente
5. Invia email
6. **Verifica**: 3 email ricevute con contenuti personalizzati

#### TC3: Reset Template
1. Modifica tutti i template
2. Clicca "🔄 Ripristina Default"
3. **Verifica**: Template ritornano ai valori originali

## 🚨 Troubleshooting

### Template non si salvano
- **Problema**: Errore Firestore
- **Soluzione**: Verifica permessi write su `clubs/{clubId}/settings`

### Variabili non sostituite
- **Problema**: `{{nome}}` appare letteralmente nell'email
- **Soluzione**: Verifica che `personalizeMessage()` riceva dati corretti

### Email non inviate
- **Problema**: sendClubEmail fallisce
- **Soluzione**: Verifica che SendGrid sia configurato (vedi `CLOUD_FUNCTIONS_EMAIL_SETUP.md`)

### Template duplicati
- **Problema**: Alcuni giocatori ricevono template sbagliato
- **Soluzione**: Verifica logica `calculateCertificateStatus()`

## 📈 Miglioramenti Futuri

- [ ] **Anteprima email HTML**: Render con formattazione ricca
- [ ] **Schedulazione invii**: Invia automaticamente a intervalli regolari
- [ ] **Template condizionali**: Es. template diversi per categorie
- [ ] **Statistiche invii**: Tracking aperture/click (con SendGrid)
- [ ] **Multi-lingua**: Template in più lingue
- [ ] **Allegati**: Supporto per documenti (es. modulo certificato)
- [ ] **Template condivisi**: Libreria template tra club

## 📚 Riferimenti

- **SendGrid Setup**: `CLOUD_FUNCTIONS_EMAIL_SETUP.md`
- **Cloud Function**: `functions/sendClubEmail.js`
- **Email Service**: `functions/emailService.js`
- **Status Calculation**: `src/services/certificateService.js`

## 🎉 Stato Attuale

✅ **Sistema Completo e Funzionale**

- Template manager implementato
- Modal riepilogo implementato
- Integrazione nel pannello certificati completa
- Personalizzazione automatica funzionante
- Invio email parallelo con gestione errori

**Pronto per il testing end-to-end!**
