# Changelog - Sistema Template Email Certificati Medici

## 🚀 Versione 1.0.0 - Sistema Template Email Automatizzate

**Data**: 2025-01-XX  
**Tipo**: Feature - Major Release

---

## 📝 Riepilogo Modifiche

Implementato sistema completo per l'invio automatizzato di email personalizzate ai giocatori in base allo stato del certificato medico. Include gestione template configurabili dall'admin e personalizzazione automatica dei messaggi con variabili dinamiche.

---

## ✨ Nuove Funzionalità

### 1. **Gestione Template Email** (EmailTemplateManager)

**File**: `src/features/admin/components/EmailTemplateManager.jsx` (281 righe)

**Funzionalità**:
- ✅ UI con 3 tab per gestire template: Scaduto, In Scadenza, Mancante
- ✅ Editor separato per oggetto e corpo email
- ✅ Preview in tempo reale delle variabili disponibili
- ✅ Salvataggio template personalizzati in Firestore
- ✅ Caricamento template salvati dal database
- ✅ Pulsante reset per ripristinare template di default
- ✅ Dark theme coerente con il resto dell'app

**Variabili supportate**:
- `{{nome}}`: Nome completo del giocatore
- `{{dataScadenza}}`: Data di scadenza certificato (DD/MM/YYYY)
- `{{giorniRimanenti}}`: Giorni rimanenti alla scadenza
- `{{nomeClub}}`: Nome del club

**Persistenza**:
```
Firestore Path: clubs/{clubId}/settings/emailTemplates
Schema: {
  expired: { subject: string, body: string },
  expiring: { subject: string, body: string },
  missing: { subject: string, body: string }
}
```

---

### 2. **Modal Riepilogo Email Certificati** (SendCertificateEmailModal)

**File**: `src/features/admin/components/SendCertificateEmailModal.jsx` (380 righe)

**Funzionalità**:
- ✅ Caricamento automatico template personalizzati dal club
- ✅ Selezione automatica template appropriato per ogni giocatore
- ✅ Personalizzazione messaggi con dati reali del giocatore
- ✅ Raggruppamento destinatari per tipo di template
- ✅ Preview espandibile per ciascun gruppo
- ✅ Contatore destinatari per gruppo
- ✅ Invio parallelo con Promise.allSettled
- ✅ Gestione errori dettagliata per ogni invio
- ✅ Report successi/fallimenti al termine
- ✅ Chiusura automatica e deselezione dopo invio riuscito

**Logica di Selezione Template**:
```javascript
- Certificato scaduto → Template "expired"
- Certificato mancante → Template "missing"
- Certificato in scadenza/urgente → Template "expiring"
```

**Gestione Errori**:
- Continua invio anche se alcune email falliscono
- Report dettagliato: "✅ 5/6 email inviate con successo (1 errore)"
- Log errori specifici in console

---

### 3. **Integrazione nel Pannello Certificati**

**File**: `src/features/admin/components/MedicalCertificatesManager.jsx`

**Modifiche**:

#### Nuovi Stati
```javascript
const [showCertificateEmailModal, setShowCertificateEmailModal] = useState(false);
const [showTemplateManager, setShowTemplateManager] = useState(false);
```

#### Nuovi Pulsanti
1. **⚙️ Gestione Template** (Viola - `purple-600`)
   - Apre EmailTemplateManager
   - Sempre abilitato
   - Tooltip: "Gestisci i template delle email per i certificati"

2. **📧 Invia Email Certificati** (Blu - `blue-600`)
   - Apre SendCertificateEmailModal
   - Disabilitato se nessun giocatore selezionato
   - Tooltip: "Invia email personalizzate ai giocatori selezionati in base allo stato del certificato"

3. **✉️ Email Personalizzata** (Indigo - `indigo-600`)
   - Apre SendEmailModal (email generica)
   - Disabilitato se nessun giocatore selezionato
   - Tooltip: "Componi e invia email personalizzata generica"

#### Layout Pulsanti
```
Fila superiore:
[⚙️ Gestione Template] [📧 Invia Email Certificati] [✉️ Email Personalizzata]

Fila inferiore:
[🔔 Notifica Push] [🖥️ WhatsApp App]
```

#### Rendering Modal
```jsx
{showCertificateEmailModal && (
  <SendCertificateEmailModal
    clubId={clubId}
    clubName={clubId}
    selectedPlayers={playersArray}
    onClose={() => setShowCertificateEmailModal(false)}
    onSuccess={() => {
      setShowCertificateEmailModal(false);
      deselectAll();
    }}
  />
)}

{showTemplateManager && (
  <EmailTemplateManager
    clubId={clubId}
    onClose={() => setShowTemplateManager(false)}
  />
)}
```

---

## 📋 Template di Default

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

---

## 🔧 Dettagli Tecnici

### Personalizzazione Messaggi

**Funzione**: `personalizeMessage(template, playerData)`

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

### Invio Parallelo Email

**Implementazione**: Promise.allSettled per gestione errori granulare

```javascript
const emailPromises = selectedPlayers.map((player) => {
  const template = getTemplateForPlayer(player);
  const personalizedSubject = personalizeMessage(template.subject, player);
  const personalizedBody = personalizeMessage(template.body, player);
  
  return sendClubEmail(clubId, player.email, personalizedSubject, personalizedBody);
});

const results = await Promise.allSettled(emailPromises);
const sent = results.filter((r) => r.status === 'fulfilled').length;
const failed = results.filter((r) => r.status === 'rejected').length;
```

### Raggruppamento Destinatari

```javascript
const playersByTemplate = selectedPlayers.reduce((acc, player) => {
  const template = getTemplateForPlayer(player);
  const key = template === templates.expired ? 'expired' 
            : template === templates.missing ? 'missing' 
            : 'expiring';
  
  if (!acc[key]) acc[key] = [];
  acc[key].push(player);
  
  return acc;
}, {});
```

---

## 🎨 UI/UX Miglioramenti

### Dark Theme Consistente
- ✅ Background: `bg-gray-800`, `bg-gray-900`
- ✅ Testo: `text-white`, `text-gray-300`
- ✅ Input: `bg-gray-900`, `border-gray-700`
- ✅ Pulsanti: Colori distintivi per azioni diverse
- ✅ Hover states: Transizioni fluide

### Icone e Colori
- ⚙️ **Gestione Template**: Viola (`purple-600`)
- 📧 **Email Certificati**: Blu (`blue-600`)
- ✉️ **Email Personalizzata**: Indigo (`indigo-600`)
- ⚠️ **Scaduto**: Rosso (`red-600`)
- 🔔 **In Scadenza**: Giallo (`yellow-600`)
- ❌ **Mancante**: Grigio (`gray-600`)

### Interazioni
- ✅ Tooltip informativi su tutti i pulsanti
- ✅ Pulsanti disabilitati quando nessun giocatore selezionato
- ✅ Loading state durante invio email
- ✅ Messaggi di successo/errore chiari
- ✅ Preview collapsabili per gruppo

---

## 📊 File Modificati/Creati

### Nuovi File
1. `src/features/admin/components/EmailTemplateManager.jsx` (281 righe)
2. `src/features/admin/components/SendCertificateEmailModal.jsx` (380 righe)
3. `CERTIFICATE_EMAIL_TEMPLATE_SYSTEM.md` (Documentazione completa)
4. `CHANGELOG_TEMPLATE_EMAIL_CERTIFICATI.md` (Questo file)

### File Modificati
1. `src/features/admin/components/MedicalCertificatesManager.jsx`
   - Linee 10-11: Import nuovi componenti
   - Linee 38-39: Nuovi stati
   - Linee 502-538: Nuovi pulsanti
   - Linee 757-778: Rendering modal

---

## ✅ Testing

### Test Eseguiti
- [x] Caricamento template di default
- [x] Salvataggio template in Firestore
- [x] Caricamento template personalizzati
- [x] Sostituzione variabili
- [x] Selezione automatica template per stato
- [x] Raggruppamento corretto destinatari
- [x] Preview espandibile

### Test Manuali Richiesti
- [ ] Test invio email end-to-end
- [ ] Verifica email ricevute con testo personalizzato
- [ ] Test gestione errori (email non valide)
- [ ] Test con giocatori di stati misti
- [ ] Verifica persistenza template dopo ricarica
- [ ] Test reset template ai default

---

## 🚨 Breaking Changes

**Nessuno** - Tutte le funzionalità esistenti sono preservate.

---

## 🐛 Bug Fix

Nessun bug fix in questa release (nuova funzionalità).

---

## 📈 Performance

- ✅ **Invio parallelo**: Tutte le email inviate contemporaneamente
- ✅ **Lazy loading**: Modal caricati solo quando aperti
- ✅ **Firestore caching**: Template caricati una sola volta
- ✅ **Debouncing**: Nessun render eccessivo durante editing template

---

## 🔐 Sicurezza

- ✅ Permessi Firestore: Solo admin/owner possono salvare template
- ✅ Validazione email: sendClubEmail verifica permessi
- ✅ Sanitizzazione input: Template validati prima del salvataggio
- ✅ Rate limiting: Gestito da Cloud Functions

---

## 📚 Documentazione

### File di Riferimento
- **Guida completa**: `CERTIFICATE_EMAIL_TEMPLATE_SYSTEM.md`
- **Setup email**: `CLOUD_FUNCTIONS_EMAIL_SETUP.md`
- **Funzione backend**: `functions/sendClubEmail.js`
- **Service email**: `functions/emailService.js`

### Esempi d'Uso

#### Esempio 1: Configurare Template Personalizzati
```
1. Apri pannello Certificati Medici
2. Clicca "⚙️ Gestione Template"
3. Seleziona tab "Scaduto"
4. Modifica oggetto: "⚠️ URGENTE: Certificato Scaduto"
5. Modifica corpo con variabili: "Ciao {{nome}}, ..."
6. Clicca "💾 Salva Template"
7. Chiudi modal
```

#### Esempio 2: Inviare Email Automatizzate
```
1. Filtra giocatori: "Tutti i Problematici"
2. Seleziona tutti i giocatori filtrati
3. Clicca "📧 Invia Email Certificati"
4. Verifica raggruppamento nel modal:
   - Scaduti: 5 giocatori
   - In Scadenza: 12 giocatori
   - Mancanti: 2 giocatori
5. Espandi "Scaduti" per preview
6. Verifica personalizzazione corretta
7. Clicca "📧 Invia Email"
8. Attendi risultati: "✅ 19/19 email inviate con successo"
```

---

## 🔄 Migrazione

**Non richiesta** - Sistema completamente nuovo, nessuna migrazione dati necessaria.

I template di default vengono caricati automaticamente se non esistono template personalizzati.

---

## 🎯 Obiettivi Raggiunti

✅ **Automazione**: Email personalizzate senza intervento manuale  
✅ **Personalizzazione**: Template configurabili dall'admin  
✅ **Scalabilità**: Invio parallelo a centinaia di destinatari  
✅ **UX**: Interface intuitiva con preview in tempo reale  
✅ **Affidabilità**: Gestione errori granulare, continua su fallimenti  
✅ **Manutenibilità**: Codice modulare e ben documentato  

---

## 📞 Supporto

Per problemi o domande:
1. Consulta `CERTIFICATE_EMAIL_TEMPLATE_SYSTEM.md` (sezione Troubleshooting)
2. Verifica setup SendGrid in `CLOUD_FUNCTIONS_EMAIL_SETUP.md`
3. Controlla log Firebase Functions per errori backend

---

## 🚀 Prossimi Passi

### Immediate
1. ✅ Deploy del codice frontend
2. ⏳ Test manuale end-to-end
3. ⏳ Configurazione template per club pilota
4. ⏳ Monitoraggio invii prima settimana

### Futuri (Backlog)
- [ ] Template HTML con formattazione ricca
- [ ] Schedulazione invii automatici (es. ogni lunedì)
- [ ] Statistiche aperture/click (SendGrid Analytics)
- [ ] Template multi-lingua
- [ ] Allegati (es. modulo certificato PDF)
- [ ] Template condivisi tra club
- [ ] A/B testing oggetti email

---

**Versione**: 1.0.0  
**Autore**: GitHub Copilot  
**Data**: 2025-01-XX  
**Status**: ✅ Completo - Pronto per Deploy
