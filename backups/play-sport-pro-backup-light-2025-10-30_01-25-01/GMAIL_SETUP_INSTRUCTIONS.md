# 📧 Setup Gmail/Nodemailer - Istruzioni Step-by-Step

## ⚡ Setup Rapido (5 minuti)

### Step 1: Abilita Verifica in 2 Passaggi

1. Vai su: https://myaccount.google.com/security
2. Scorri fino a "Accesso a Google"
3. Clicca su **"Verifica in 2 passaggi"**
4. Se non attiva, clicca **"Inizia"** e segui la procedura

✅ **Checkpoint**: Verifica in 2 passaggi attiva

---

### Step 2: Genera App Password

1. Vai su: https://myaccount.google.com/apppasswords
2. Potrebbe chiederti di inserire la password Google
3. Nel menu a tendina:
   - **Seleziona app**: Scegli "Mail"
   - **Seleziona dispositivo**: Scegli "Other" (Altro)
   - **Nome**: Scrivi "Play-Sport Cloud Function"
4. Clicca **"Genera"**
5. Google ti mostrerà una password di 16 caratteri tipo: `abcd efgh ijkl mnop`

⚠️ **IMPORTANTE**: Copia subito questa password! Si mostra solo 1 volta.

✅ **Checkpoint**: App Password copiata negli appunti

---

### Step 3: Configura Firebase Secrets

Apri PowerShell nella root del progetto e esegui:

```powershell
# Torna alla root del progetto
cd C:\Users\paris\Downloads\play-sport-backup-2025-10-05_23-30-00

# Configura email mittente (la tua Gmail)
firebase functions:secrets:set EMAIL_USER
# Quando richiesto, incolla: tua-email@gmail.com

# Configura App Password (quella generata al Step 2)
firebase functions:secrets:set EMAIL_PASSWORD
# Quando richiesto, incolla: abcdefghijklmnop (SENZA SPAZI!)

# Configura email mittente per "From" (opzionale)
firebase functions:secrets:set FROM_EMAIL
# Quando richiesto, incolla: noreply@playsport.pro
# OPPURE usa la tua Gmail se non hai dominio
```

✅ **Checkpoint**: Secrets configurati

---

### Step 4: Verifica Configurazione

```powershell
# Lista secrets configurati
firebase functions:secrets:access EMAIL_USER
firebase functions:secrets:access EMAIL_PASSWORD
```

Dovresti vedere output tipo:
```
EMAIL_USER configured
EMAIL_PASSWORD configured
```

✅ **Checkpoint**: Secrets verificati

---

### Step 5: Deploy Cloud Function

```powershell
# Deploy solo la function certificati
firebase deploy --only functions:dailyCertificateCheck
```

Attendi il deploy (1-2 minuti). Output atteso:
```
✔  functions[dailyCertificateCheck] Successful create operation.
Function URL (dailyCertificateCheck): https://...
```

✅ **Checkpoint**: Function deployata

---

### Step 6: Test Manuale

**Opzione A - Console Firebase**:
1. Apri https://console.firebase.google.com
2. Seleziona progetto
3. Vai su **Functions**
4. Trova `dailyCertificateCheck`
5. Clicca **"Test function"**
6. Clicca **"Run test"**
7. Controlla logs per verificare invio email

**Opzione B - Logs in tempo reale**:
```powershell
firebase functions:log --only dailyCertificateCheck --tail
```

Cerca linee tipo:
```
✅ [Nodemailer] Email sent to: player@example.com
```

✅ **Checkpoint**: Email inviata con successo

---

## 🎯 Quick Commands

```powershell
# Setup completo in 3 comandi
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASSWORD
firebase deploy --only functions:dailyCertificateCheck

# Verifica
firebase functions:log --only dailyCertificateCheck | Select-String "Email"

# Test locale (opzionale)
firebase emulators:start --only functions
```

---

## ⚠️ Troubleshooting

### Errore: "App Passwords not available"
**Causa**: Verifica in 2 passaggi non attiva  
**Soluzione**: Vai su https://myaccount.google.com/security e attiva "Verifica in 2 passaggi"

### Errore: "Invalid credentials"
**Causa**: App Password sbagliata o con spazi  
**Soluzione**: 
1. Rimuovi spazi dalla password (deve essere 16 caratteri continui)
2. Ri-configura secret:
```powershell
firebase functions:secrets:set EMAIL_PASSWORD
```

### Email finite in spam
**Soluzione**:
1. Aggiungi mittente (tua Gmail) a whitelist
2. Chiedi destinatari di marcare come "Non spam"
3. Per produzione, usa SendGrid con dominio verificato

### Errore: "Secret not found"
**Causa**: Secret non configurato correttamente  
**Soluzione**:
```powershell
# Riconfigura tutti i secrets
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASSWORD
firebase functions:secrets:set FROM_EMAIL
```

---

## 📊 Limiti Gmail

- **500 email/giorno**: Limite gratuito Gmail
- **Stima Play-Sport**: ~43 email/giorno → **OK per produzione piccola** ✅
- **Deliverability**: Media (rischio spam senza dominio)

**Raccomandazione**: Usa Gmail per test, poi passa a SendGrid per produzione.

---

## 🔄 Next Steps

Dopo setup Gmail:

1. ✅ **Test email ricevute**: Controlla inbox giocatori
2. ✅ **Monitora logs**: `firebase functions:log`
3. ⏭️ **Setup SendGrid** (opzionale, per produzione): Vedi `EMAIL_SERVICE_CONFIGURATION.md`
4. ⏭️ **Verifica dominio** (opzionale, per evitare spam)

---

**Creato**: 2025-10-10  
**Versione**: 1.0.0  
**Servizio**: Gmail/Nodemailer
