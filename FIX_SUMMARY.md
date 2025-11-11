# 🔧 Fix Applicato: Gestione Corretta Stati Certificati

## 📋 Riepilogo Rapido

**Problema**: Il sistema template email non distingueva correttamente tra certificati Scaduti, In Scadenza e Mancanti

**Causa**: Chiamata errata a `calculateCertificateStatus(player)` invece di `calculateCertificateStatus(expiryDate)`

**Soluzione**: Correzione in 4 punti del componente `SendCertificateEmailModal.jsx`

---

## ✅ Correzioni Applicate

### 1️⃣ Funzione `getTemplateForPlayer()`

```diff
function getTemplateForPlayer(player) {
-  const status = calculateCertificateStatus(player);
+  const status = player.certificateStatus || 
+                 calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);
+  
+  console.log(`📧 Template selection for ${player.name}:`, {
+    status: status.status,
+    daysUntilExpiry: status.daysUntilExpiry,
+  });
  
  if (status.status === 'missing') {
    return 'missing';
  } else if (status.status === 'expired') {
    return 'expired';
- } else if (status.status === 'expiring') {
+ } else if (status.status === 'expiring' || status.status === 'urgent') {
    return 'expiring';
  }
  
  return 'expiring';
}
```

### 2️⃣ Funzione `personalizeMessage()`

```diff
function personalizeMessage(template, player, status) {
  const expiryDate = player.medicalCertificates?.current?.expiryDate;
  const formattedDate = expiryDate 
    ? new Date(expiryDate).toLocaleDateString('it-IT')
    : 'N/A';
  
-  const daysRemaining = status.daysRemaining || 0;
+  const daysRemaining = status.daysUntilExpiry !== null ? status.daysUntilExpiry : 0;

  return {
    subject: template.subject
-      .replace(/\{\{nome\}\}/g, player.name || 'Giocatore')
+      .replace(/\{\{nome\}\}/g, player.name || player.displayName || 'Giocatore')
      .replace(/\{\{dataScadenza\}\}/g, formattedDate)
      .replace(/\{\{giorniRimanenti\}\}/g, Math.abs(daysRemaining).toString())
      .replace(/\{\{nomeClub\}\}/g, clubName || 'Il tuo Club'),
    body: template.body
-      .replace(/\{\{nome\}\}/g, player.name || 'Giocatore')
+      .replace(/\{\{nome\}\}/g, player.name || player.displayName || 'Giocatore')
      .replace(/\{\{dataScadenza\}\}/g, formattedDate)
      .replace(/\{\{giorniRimanenti\}\}/g, Math.abs(daysRemaining).toString())
      .replace(/\{\{nomeClub\}\}/g, clubName || 'Il tuo Club'),
  };
}
```

### 3️⃣ Funzione `handleSend()`

```diff
const emailPromises = selectedPlayers.map(async (player) => {
-  const status = calculateCertificateStatus(player);
+  const status = player.certificateStatus || 
+                 calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);
  const templateType = getTemplateForPlayer(player);
  const template = templates[templateType];
  const personalized = personalizeMessage(template, player, status);
  
  // ...
});
```

### 4️⃣ Raggruppamento `playersByTemplate`

```diff
const playersByTemplate = selectedPlayers.reduce((acc, player) => {
-  const status = calculateCertificateStatus(player);
+  const status = player.certificateStatus || 
+                 calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);
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

## 🎯 Risultato

### Prima (❌ Errato)

Tutti i giocatori finivano nello stesso gruppo perché `calculateCertificateStatus(player)` restituiva sempre lo stesso status generico.

### Dopo (✅ Corretto)

I giocatori vengono correttamente suddivisi in 3 gruppi:

| Stato Certificato | Template | Icona | Oggetto Email |
|------------------|----------|-------|---------------|
| Mancante | `missing` | ❌ | Certificato Medico Mancante |
| Scaduto | `expired` | ⚠️ | Certificato Medico Scaduto |
| In Scadenza | `expiring` | 🔔 | Certificato Medico in Scadenza |

---

## 🧪 Test Rapido

Per verificare il fix:

1. **Apri console browser** (F12)
2. **Seleziona giocatori** con stati diversi
3. **Clicca "Invia Email Certificati"**
4. **Verifica i log**:
   ```
   📧 Template selection for Mario Rossi: {
     status: 'expired',
     daysUntilExpiry: -9
   }
   📧 Template selection for Luigi Verdi: {
     status: 'expiring',
     daysUntilExpiry: 10
   }
   📧 Template selection for Paolo Bianchi: {
     status: 'missing',
     daysUntilExpiry: null
   }
   ```
5. **Verifica nel modal** che i 3 gruppi siano separati correttamente

---

## 📚 Documentazione

- **Fix Completo**: `FIX_TEMPLATE_EMAIL_CERTIFICATI.md`
- **Sistema Template**: `CERTIFICATE_EMAIL_TEMPLATE_SYSTEM.md`
- **Changelog**: `CHANGELOG_TEMPLATE_EMAIL_CERTIFICATI.md`

---

**Status**: ✅ Fix Applicato - Pronto per Test
