# Fix: Gestione Corretta Stati Certificati nel Sistema Template Email

## 🐛 Problema Identificato

Il sistema di template email per i certificati medici non gestiva correttamente la distinzione tra certificati **Scaduti**, **In Scadenza** e **Mancanti**.

### Causa Root

**Errore 1**: Chiamata errata a `calculateCertificateStatus()`
```javascript
// ❌ SBAGLIATO - passava l'intero oggetto player
const status = calculateCertificateStatus(player);
```

La funzione `calculateCertificateStatus()` si aspetta come parametro **solo la data di scadenza** (`expiryDate`), non l'intero oggetto player:

```javascript
// ✅ CORRETTO
export function calculateCertificateStatus(expiryDate) {
  if (!expiryDate) {
    return { status: 'missing', ... };
  }
  // ... calcola status in base alla data
}
```

**Errore 2**: Campo sbagliato per giorni rimanenti
```javascript
// ❌ SBAGLIATO - status.daysRemaining non esiste
const daysRemaining = status.daysRemaining || 0;
```

Il campo corretto restituito da `calculateCertificateStatus()` è `daysUntilExpiry`:

```javascript
// ✅ CORRETTO
const daysRemaining = status.daysUntilExpiry !== null ? status.daysUntilExpiry : 0;
```

---

## ✅ Soluzioni Implementate

### 1. Correzione in `getTemplateForPlayer()`

**File**: `src/features/admin/components/SendCertificateEmailModal.jsx`

**Prima** (errato):
```javascript
function getTemplateForPlayer(player) {
  const status = calculateCertificateStatus(player); // ❌ Passa oggetto intero
  
  if (status.status === 'missing') {
    return 'missing';
  } else if (status.status === 'expired') {
    return 'expired';
  } else if (status.status === 'expiring') {
    return 'expiring';
  }
  
  return 'expiring';
}
```

**Dopo** (corretto):
```javascript
function getTemplateForPlayer(player) {
  // Usa certificateStatus già calcolato da MedicalCertificatesManager
  // Se non c'è, calcolalo passando SOLO la data di scadenza
  const status = player.certificateStatus || 
                 calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);
  
  console.log(`📧 Template selection for ${player.name}:`, {
    status: status.status,
    isExpired: status.isExpired,
    isExpiring: status.isExpiring,
    daysUntilExpiry: status.daysUntilExpiry,
    expiryDate: player.medicalCertificates?.current?.expiryDate
  });
  
  if (status.status === 'missing') {
    return 'missing';
  } else if (status.status === 'expired') {
    return 'expired';
  } else if (status.status === 'expiring' || status.status === 'urgent') {
    return 'expiring'; // Gestisce anche lo stato 'urgent'
  }
  
  return 'expiring'; // Default per casi edge
}
```

**Miglioramenti**:
- ✅ Usa `player.certificateStatus` già calcolato (ottimizzazione)
- ✅ Fallback con chiamata corretta: `calculateCertificateStatus(expiryDate)`
- ✅ Gestisce anche stato `'urgent'` come `'expiring'`
- ✅ Aggiunto logging di debug per troubleshooting

---

### 2. Correzione in `handleSend()`

**Prima** (errato):
```javascript
const emailPromises = selectedPlayers.map(async (player) => {
  const status = calculateCertificateStatus(player); // ❌ Passa oggetto intero
  const templateType = getTemplateForPlayer(player);
  // ...
});
```

**Dopo** (corretto):
```javascript
const emailPromises = selectedPlayers.map(async (player) => {
  // Usa certificateStatus già calcolato o calcolalo al volo
  const status = player.certificateStatus || 
                 calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);
  const templateType = getTemplateForPlayer(player);
  const template = templates[templateType];
  const personalized = personalizeMessage(template, player, status);
  // ...
});
```

---

### 3. Correzione in `playersByTemplate` (raggruppamento)

**Prima** (errato):
```javascript
const playersByTemplate = selectedPlayers.reduce((acc, player) => {
  const status = calculateCertificateStatus(player); // ❌ Passa oggetto intero
  const templateType = getTemplateForPlayer(player);
  // ...
}, {});
```

**Dopo** (corretto):
```javascript
const playersByTemplate = selectedPlayers.reduce((acc, player) => {
  // Usa certificateStatus già calcolato o calcolalo al volo
  const status = player.certificateStatus || 
                 calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);
  const templateType = getTemplateForPlayer(player);
  
  if (!acc[templateType]) {
    acc[templateType] = [];
  }
  
  acc[templateType].push({
    ...player,
    status,
    templateType,
  });
  
  return acc;
}, {});
```

---

### 4. Correzione in `personalizeMessage()`

**Prima** (errato):
```javascript
function personalizeMessage(template, player, status) {
  const expiryDate = player.medicalCertificates?.current?.expiryDate;
  const formattedDate = expiryDate 
    ? new Date(expiryDate).toLocaleDateString('it-IT')
    : 'N/A';
  
  const daysRemaining = status.daysRemaining || 0; // ❌ Campo sbagliato

  return {
    subject: template.subject
      .replace(/\{\{nome\}\}/g, player.name || 'Giocatore')
      // ...
  };
}
```

**Dopo** (corretto):
```javascript
function personalizeMessage(template, player, status) {
  const expiryDate = player.medicalCertificates?.current?.expiryDate;
  const formattedDate = expiryDate 
    ? new Date(expiryDate).toLocaleDateString('it-IT')
    : 'N/A';
  
  // daysUntilExpiry è il campo corretto da calculateCertificateStatus
  const daysRemaining = status.daysUntilExpiry !== null ? status.daysUntilExpiry : 0;

  return {
    subject: template.subject
      .replace(/\{\{nome\}\}/g, player.name || player.displayName || 'Giocatore')
      .replace(/\{\{dataScadenza\}\}/g, formattedDate)
      .replace(/\{\{giorniRimanenti\}\}/g, Math.abs(daysRemaining).toString())
      .replace(/\{\{nomeClub\}\}/g, clubName || 'Il tuo Club'),
    body: template.body
      .replace(/\{\{nome\}\}/g, player.name || player.displayName || 'Giocatore')
      .replace(/\{\{dataScadenza\}\}/g, formattedDate)
      .replace(/\{\{giorniRimanenti\}\}/g, Math.abs(daysRemaining).toString())
      .replace(/\{\{nomeClub\}\}/g, clubName || 'Il tuo Club'),
  };
}
```

**Miglioramenti**:
- ✅ Usa `status.daysUntilExpiry` invece di `status.daysRemaining`
- ✅ Fallback a `player.displayName` se `player.name` non esiste
- ✅ Gestisce correttamente `daysUntilExpiry === null` per certificati mancanti

---

## 🎯 Logica di Selezione Template

### Stati Possibili da `calculateCertificateStatus()`

```javascript
export const CERTIFICATE_STATUS = {
  VALID: 'valid',       // Valido, scadenza lontana
  EXPIRING: 'expiring', // In scadenza (entro EXPIRY_WARNING_DAYS)
  EXPIRED: 'expired',   // Scaduto
  MISSING: 'missing',   // Mancante (null/undefined)
};
```

### Mapping Status → Template

| Status Certificato | Template Usato | Motivo |
|-------------------|----------------|--------|
| `'missing'` | `missing` | Certificato non presente |
| `'expired'` | `expired` | Certificato già scaduto |
| `'expiring'` | `expiring` | Certificato in scadenza |
| `'urgent'` | `expiring` | Scadenza urgente (trattato come expiring) |
| `'valid'` | `expiring` | Default (non dovrebbe accadere in questo contesto) |

### Esempio di Calcolo Status

```javascript
// Giocatore con certificato scaduto
const player1 = {
  name: "Mario Rossi",
  email: "mario@example.com",
  medicalCertificates: {
    current: {
      expiryDate: "2024-11-01" // Scaduto 9 giorni fa
    }
  }
};

const status1 = calculateCertificateStatus("2024-11-01");
// Risultato:
// {
//   status: 'expired',
//   isExpired: true,
//   isExpiring: false,
//   daysUntilExpiry: -9,
//   canBook: false
// }

// Template selezionato: 'expired'
```

```javascript
// Giocatore con certificato in scadenza
const player2 = {
  name: "Luigi Verdi",
  email: "luigi@example.com",
  medicalCertificates: {
    current: {
      expiryDate: "2024-11-20" // Scade tra 10 giorni
    }
  }
};

const status2 = calculateCertificateStatus("2024-11-20");
// Risultato:
// {
//   status: 'expiring',
//   isExpired: false,
//   isExpiring: true,
//   daysUntilExpiry: 10,
//   canBook: true
// }

// Template selezionato: 'expiring'
```

```javascript
// Giocatore senza certificato
const player3 = {
  name: "Paolo Bianchi",
  email: "paolo@example.com",
  medicalCertificates: {
    current: {
      expiryDate: null // Nessun certificato
    }
  }
};

const status3 = calculateCertificateStatus(null);
// Risultato:
// {
//   status: 'missing',
//   isExpired: false,
//   isExpiring: false,
//   daysUntilExpiry: null,
//   canBook: false
// }

// Template selezionato: 'missing'
```

---

## 🔍 Debug e Testing

### 1. Console Logging

Aggiunto logging dettagliato in `getTemplateForPlayer()`:

```javascript
console.log(`📧 Template selection for ${player.name}:`, {
  status: status.status,           // 'missing' | 'expired' | 'expiring' | 'urgent'
  isExpired: status.isExpired,     // boolean
  isExpiring: status.isExpiring,   // boolean
  daysUntilExpiry: status.daysUntilExpiry, // number | null
  expiryDate: player.medicalCertificates?.current?.expiryDate // data originale
});
```

**Output esempio**:
```
📧 Template selection for Mario Rossi: {
  status: 'expired',
  isExpired: true,
  isExpiring: false,
  daysUntilExpiry: -9,
  expiryDate: '2024-11-01'
}
```

### 2. Testing Manual Checklist

- [ ] **Test Certificato Scaduto**
  1. Seleziona giocatore con certificato scaduto
  2. Clicca "📧 Invia Email Certificati"
  3. Verifica che appaia in gruppo "⚠️ Scaduto"
  4. Espandi anteprima
  5. Verifica oggetto: "⚠️ Certificato Medico Scaduto"
  6. Verifica corpo contiene "SCADUTO in data DD/MM/YYYY"

- [ ] **Test Certificato In Scadenza**
  1. Seleziona giocatore con certificato in scadenza (es. tra 10 giorni)
  2. Clicca "📧 Invia Email Certificati"
  3. Verifica che appaia in gruppo "🔔 In Scadenza"
  4. Espandi anteprima
  5. Verifica oggetto: "🔔 Certificato Medico in Scadenza"
  6. Verifica corpo contiene "scadrà il DD/MM/YYYY (tra 10 giorni)"

- [ ] **Test Certificato Mancante**
  1. Seleziona giocatore senza certificato
  2. Clicca "📧 Invia Email Certificati"
  3. Verifica che appaia in gruppo "❌ Mancante"
  4. Espandi anteprima
  5. Verifica oggetto: "❌ Certificato Medico Mancante"
  6. Verifica corpo contiene "non hai ancora caricato il certificato"

- [ ] **Test Misto**
  1. Seleziona 1 scaduto + 1 in scadenza + 1 mancante
  2. Verifica che modal mostri 3 gruppi separati
  3. Verifica conteggi corretti per ciascun gruppo
  4. Invia email
  5. Verifica che tutte e 3 le email siano inviate con template corretti

---

## 📊 Ottimizzazione: Riuso `certificateStatus`

Il componente `MedicalCertificatesManager` già calcola `certificateStatus` per ogni giocatore:

```javascript
// In MedicalCertificatesManager.jsx
const playersWithStatus = useMemo(() => {
  return players.map((player) => {
    const certificateStatus = calculateCertificateStatus(
      player.medicalCertificates?.current?.expiryDate
    );
    return {
      ...player,
      certificateStatus, // ✅ Già calcolato!
    };
  });
}, [players]);
```

Quindi quando i `selectedPlayers` arrivano a `SendCertificateEmailModal`, hanno già il campo `certificateStatus` popolato.

**Vantaggio**:
- ❌ **Prima**: Chiamava `calculateCertificateStatus()` 3 volte per giocatore (getTemplate + handleSend + raggruppamento)
- ✅ **Dopo**: Riusa `player.certificateStatus` già calcolato, calcola solo se mancante

---

## 🎉 Risultato Atteso

### Scenario: 3 giocatori selezionati

**Giocatori**:
1. Mario Rossi - Certificato scaduto il 01/11/2024
2. Luigi Verdi - Certificato scade il 20/11/2024 (tra 10 giorni)
3. Paolo Bianchi - Certificato mancante

**Modal Riepilogo**:
```
┌─────────────────────────────────────────────────┐
│ 📧 Riepilogo Invio Email Certificati            │
├─────────────────────────────────────────────────┤
│                                                  │
│ ⚠️ Scaduto (1 giocatore)                        │
│   • Mario Rossi (mario@example.com)             │
│   ▼ Mostra anteprima                            │
│     Oggetto: ⚠️ Certificato Medico Scaduto      │
│     Corpo: Ciao Mario Rossi,                    │
│            Il tuo certificato è SCADUTO...      │
│                                                  │
│ 🔔 In Scadenza (1 giocatore)                    │
│   • Luigi Verdi (luigi@example.com)             │
│   ▼ Mostra anteprima                            │
│     Oggetto: 🔔 Certificato Medico in Scadenza  │
│     Corpo: Ciao Luigi Verdi,                    │
│            Il tuo certificato scadrà il         │
│            20/11/2024 (tra 10 giorni)...        │
│                                                  │
│ ❌ Mancante (1 giocatore)                       │
│   • Paolo Bianchi (paolo@example.com)           │
│   ▼ Mostra anteprima                            │
│     Oggetto: ❌ Certificato Medico Mancante     │
│     Corpo: Ciao Paolo Bianchi,                  │
│            Non hai ancora caricato...           │
│                                                  │
│           [ 📧 Invia Email (3) ]                │
└─────────────────────────────────────────────────┘
```

---

## 📝 File Modificato

**File**: `src/features/admin/components/SendCertificateEmailModal.jsx`

**Modifiche**:
1. ✅ Linee 100-123: Corretto `getTemplateForPlayer()` con logging
2. ✅ Linee 125-138: Corretto `personalizeMessage()` con campo `daysUntilExpiry`
3. ✅ Linee 147-154: Corretto chiamata in `handleSend()`
4. ✅ Linee 222-239: Corretto raggruppamento in `playersByTemplate`

**Lint Errors**: Solo formattazione (␍ carriage returns) - non impattano la funzionalità

---

## ✅ Stato Finale

🎯 **Il sistema ora gestisce correttamente tutte e 3 le casistiche**:
- ✅ Certificati **Mancanti** → Template "missing"
- ✅ Certificati **Scaduti** → Template "expired"  
- ✅ Certificati **In Scadenza** → Template "expiring"

🔍 **Debug logging attivo** per troubleshooting

⚡ **Ottimizzato** con riuso di `certificateStatus` già calcolato

🚀 **Pronto per testing end-to-end!**
