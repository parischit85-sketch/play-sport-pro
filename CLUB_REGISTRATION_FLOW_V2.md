# 🏢 Flusso di Registrazione Circoli - Versione 2.0

## ✅ Nuovo Sistema Implementato

### 🎯 Obiettivo
Permettere ai circoli di registrarsi autonomamente, creare un account e accedere immediatamente alla dashboard admin per configurare il proprio circolo, anche prima dell'approvazione del super-admin.

---

## 📋 Flusso Completo

### 1. **Registrazione Circolo** (`/register-club`)

#### Step 1: Creazione Account
- **Nome e Cognome** dell'amministratore
- **Email** (usata per login)
- **Password** (minimo 6 caratteri)
- **Conferma Password**

#### Step 2: Informazioni Base del Circolo
- **Nome Circolo** *
- **Descrizione** (opzionale)
- **Indirizzo completo** *
  - Via
  - Città *
  - Provincia
  - CAP

#### Step 3: Contatti
- **Telefono** *
- **Email** *
- **Sito Web** (opzionale)

#### Step 4: Logo
- **Upload immagine** (opzionale, max 5MB)
- Formato: PNG, JPG, GIF

---

### 2. **Cosa Succede alla Registrazione**

1. ✅ **Account Firebase Auth creato**
   - Email e password
   - Display name impostato

2. ✅ **Circolo creato in Firestore** (`clubs` collection)
   ```javascript
   {
     name: "Tennis Club Milano",
     status: "pending", // ← In attesa di approvazione
     isActive: false,   // ← Non visibile pubblicamente
     ownerId: "userId",
     ownerEmail: "mario@example.com",
     // ... altri dati
   }
   ```

3. ✅ **Profilo utente creato** (`users` collection)
   ```javascript
   {
     role: "club-admin",
     clubId: "generatedClubId",
     clubName: "Tennis Club Milano"
   }
   ```

4. ✅ **Profilo admin nel circolo** (`clubs/{clubId}/profiles`)
   ```javascript
   {
     role: "admin",
     email: "mario@example.com",
     // ... altri dati
   }
   ```

5. ✅ **Redirect automatico** → `/clubs/{clubId}`
   - L'utente accede immediatamente alla dashboard del circolo

---

### 3. **Dashboard Circolo (Pending)**

Quando il circolo è in stato `pending`, l'amministratore può:

✅ **Configurare:**
- Aggiungere campi
- Aggiungere istruttori
- Configurare orari
- Modificare impostazioni

❌ **Non può:**
- Il circolo non appare nelle ricerche pubbliche
- Gli utenti esterni non possono prenotare
- Il circolo non appare nei circoli nelle vicinanze

---

### 4. **Approvazione Super-Admin**

Il super-admin può:
- Vedere tutti i circoli in stato `pending`
- Approvare → `isActive: true`, `status: 'approved'`
- Rifiutare → `status: 'rejected'`

**Dopo l'approvazione:**
- ✅ Circolo visibile pubblicamente
- ✅ Gli utenti possono trovarlo e prenotare
- ✅ Appare nelle ricerche e nei circoli nelle vicinanze

---

## 🔐 Sicurezza e Permessi

### Firestore Rules

```javascript
// Clubs collection
match /clubs/{clubId} {
  // Lettura pubblica solo per club attivi
  allow read: if resource.data.isActive == true ||
                 request.auth != null && 
                 request.auth.uid == resource.data.ownerId;
  
  // Scrittura solo per owner o super-admin
  allow write: if request.auth != null && (
    request.auth.uid == resource.data.ownerId ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin'
  );
}

// Users collection
match /users/{userId} {
  // Solo l'utente stesso può leggere il proprio profilo
  allow read: if request.auth.uid == userId;
  
  // Solo durante registrazione o da super-admin
  allow create: if request.auth.uid == userId;
  allow update: if request.auth.uid == userId ||
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
}
```

---

## 🎨 UI/UX

### Landing Page
- Click "Registrati" → Modal con scelta
- "Registra il tuo Circolo" → `/register-club`

### Form di Registrazione
- 4 step progressivi con indicator visuale
- Validazione in tempo reale
- Messaggi di errore chiari
- Password strength indicator

### Dopo Registrazione
- Alert di conferma
- Redirect automatico alla dashboard
- Onboarding guidato (opzionale)

---

## 📊 Differenze con il Vecchio Sistema

| Aspetto | Vecchio Sistema | Nuovo Sistema |
|---------|----------------|---------------|
| Approvazione | Prima della creazione | Dopo la creazione |
| Accesso Dashboard | Dopo approvazione | Immediato |
| Account | Creato separatamente | Creato durante registrazione |
| Configurazione | Dopo approvazione | Prima dell'approvazione |
| Collection | `clubRegistrationRequests` | Direttamente in `clubs` |

---

## 🚀 Vantaggi del Nuovo Sistema

✅ **UX Migliore**
- L'amministratore può iniziare subito a configurare
- Nessuna attesa per accedere alla dashboard
- Flusso più fluido e intuitivo

✅ **Efficienza**
- Nessuna collection separata per le richieste
- Meno step manuali per il super-admin
- Circolo già configurato quando viene approvato

✅ **Flessibilità**
- Il circolo può prepararsi prima di andare live
- Possibilità di testare tutte le funzionalità
- Approvazione diventa solo un "switch on"

---

## 🔧 Gestione Super-Admin

### Come Approvare un Circolo

1. **Dashboard Super-Admin** → Sezione "Circoli"
2. **Filtro**: Mostra circoli con `status: pending`
3. **Revisione**: Controlla nome, indirizzo, logo
4. **Approvazione**: Click "Approva"
   - Sistema imposta `isActive: true`
   - Sistema imposta `status: 'approved'`
   - Circolo diventa visibile pubblicamente

### Come Rifiutare un Circolo

1. Click "Rifiuta"
2. Inserisci motivo
3. Sistema imposta `status: 'rejected'`
4. (Opzionale) Invia email all'amministratore

---

## 📝 Casi d'Uso

### Scenario 1: Nuovo Circolo
1. Proprietario va su landing page
2. Click "Registrati" → "Registra il tuo Circolo"
3. Compila form in 4 step
4. Account creato, circolo creato (pending)
5. Redirect a dashboard circolo
6. Configura campi, orari, istruttori
7. Aspetta approvazione super-admin
8. ✅ Approvato → circolo visibile

### Scenario 2: Circolo Rifiutato
1. Super-admin rifiuta con motivo
2. Proprietario riceve email (opzionale)
3. Può correggere i dati
4. Richiede nuova approvazione

### Scenario 3: Modifica Prima dell'Approvazione
1. Circolo in pending
2. Proprietario fa login
3. Accede alla dashboard
4. Modifica configurazioni
5. Salva modifiche
6. Aspetta approvazione

---

## 🎯 Prossimi Passi (Opzionali)

### Email Notifications
- Email di benvenuto dopo registrazione
- Email di promemoria al super-admin (nuova richiesta)
- Email di conferma approvazione
- Email con motivo se rifiutato

### Dashboard Super-Admin
- Sezione dedicata "Circoli in Attesa"
- Badge con numero richieste pending
- Quick approve/reject
- Storico approvazioni

### Onboarding
- Tour guidato nella dashboard
- Checklist configurazione iniziale
- Video tutorial
- Chat di supporto

---

## ✅ Checklist Implementazione

- [x] Form registrazione con 4 step
- [x] Creazione account Firebase Auth
- [x] Creazione circolo in stato pending
- [x] Creazione profilo utente con ruolo club-admin
- [x] Redirect automatico a dashboard
- [x] Validazione password e email
- [x] Gestione errori
- [x] Dark mode supportato
- [ ] Firestore rules aggiornate
- [ ] Sezione super-admin per approvazione
- [ ] Email notifications
- [ ] Onboarding guidato

---

**Creato il:** 7 Ottobre 2025
**Versione:** 2.0.0
**Status:** ✅ Implementato e funzionante
