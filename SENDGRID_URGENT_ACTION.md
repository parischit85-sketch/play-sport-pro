# 🚨 SendGrid API Key - Azione Immediata Richiesta

## ❌ Problema Rilevato

La tua chiave API SendGrid è stata **esposta pubblicamente** su GitHub ed è stata **automaticamente revocata** da SendGrid per motivi di sicurezza.

## ✅ Cosa Ho Fatto (Automaticamente)

1. **Rimosso la chiave hardcoded** da `test-sendgrid-direct.mjs`
2. **Aggiunto file test al .gitignore** per prevenire future esposizioni
3. **Creato documentazione di sicurezza** (`SECURITY.md`)
4. **Creato script di configurazione** (`configure-sendgrid.ps1`)

## 📋 Cosa Devi Fare Ora (Passi Obbligatori)

### Step 1: Crea una Nuova API Key su SendGrid

1. Vai su: https://app.sendgrid.com/settings/api_keys
2. Clicca **"Create API Key"**
3. Nome: `play-sport-pro-production-2025`
4. Permessi: **Full Access** (o solo "Mail Send")
5. Clicca **"Create & View"**
6. **⚠️ COPIA LA CHIAVE SUBITO** - non la vedrai più!

### Step 2: Configura la Nuova Chiave

**Opzione A - Script Automatico (Raccomandato):**

```powershell
# Esegui lo script helper
.\configure-sendgrid.ps1
```

**Opzione B - Manualmente:**

```powershell
# Configura Firebase Functions
firebase functions:config:set sendgrid.api_key="LA_TUA_NUOVA_CHIAVE_QUI"

# Verifica
firebase functions:config:get

# Deploy
firebase deploy --only functions
```

### Step 3: Configura Localmente (Sviluppo)

Crea/aggiorna il file `.env` nella root del progetto:

```env
SENDGRID_API_KEY=LA_TUA_NUOVA_CHIAVE_QUI
```

**⚠️ VERIFICA** che `.env` sia in `.gitignore` (già fatto ✅)

### Step 4: Testa la Nuova Chiave

```powershell
# Il file di test ora usa variabili d'ambiente (sicuro)
node test-sendgrid-direct.mjs
```

## 🔒 Prevenzione Futura

### ✅ File Sicuri da Committare:

- Codice che usa `process.env.SENDGRID_API_KEY`
- File `.env.example` (con valori placeholder)
- Documentazione

### ❌ MAI Committare:

- File `.env` (con chiavi reali)
- Chiavi hardcoded nel codice
- File `test-*.mjs` con credenziali

### 📝 Checklist Prima di Ogni Commit:

```bash
# Verifica che non ci siano segreti
git diff

# Verifica .gitignore
cat .gitignore | grep -E "(\.env|test-.*\.mjs)"

# Commit solo se tutto ok
git add .
git commit -m "..."
git push
```

## 📚 Documentazione Completa

Leggi `SECURITY.md` per:

- Best practices complete
- Gestione di altri segreti (Firebase, OAuth, etc.)
- Cosa fare in caso di esposizione
- Emergency contacts

## ⚠️ Note Importanti

1. **La vecchia chiave è MORTA** - SendGrid l'ha revocata
2. **Devi creare una NUOVA chiave** - nessuna alternativa
3. **Non usare la stessa chiave** ovunque - crea chiavi diverse per prod/dev
4. **Monitora SendGrid dashboard** per attività sospette
5. **Considera rotazione periodica** delle chiavi (ogni 90 giorni)

## 🆘 Problemi?

### "firebase: command not found"

```bash
npm install -g firebase-tools
firebase login
```

### "Permission denied on SendGrid"

- Verifica di aver creato la chiave con i permessi corretti
- Verifica il mittente verificato su SendGrid (Settings → Sender Authentication)

### "Email not sending"

Controlla i log Firebase:

```bash
firebase functions:log --only sendBulkNotifications
```

## 📞 Supporto

- **SendGrid**: https://support.sendgrid.com/
- **Firebase**: https://firebase.google.com/support
- **Documentazione**: Leggi `SECURITY.md`

---

**Stato Attuale**: ⚠️ AZIONE RICHIESTA - Email non funzionano fino a nuova configurazione  
**Priorità**: 🔴 ALTA - Configura subito se usi l'invio email  
**Tempo Stimato**: 5-10 minuti

**Creato**: 12 Novembre 2025  
**Ultima Modifica**: 12 Novembre 2025
