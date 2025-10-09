# 🏢 Sistema di Registrazione Circoli

## ✅ Implementazione Completata

### Panoramica
Sistema completo per la registrazione di nuovi circoli sportivi con approvazione manuale da parte dell'amministratore.

---

## 📋 Componenti Implementati

### 1. **RegistrationTypeModal** (`src/components/ui/RegistrationTypeModal.jsx`)
Modal che appare quando l'utente clicca "Registrati" dalla landing page.

**Funzionalità:**
- 2 opzioni: Utente o Circolo
- Design con card gradient (verde/blu)
- Icone User e Building2
- Navigazione verso `/register` o `/register-club`

---

### 2. **RegisterClubPage** (`src/pages/RegisterClubPage.jsx`)
Form multi-step per la registrazione di un nuovo circolo.

**Caratteristiche:**
- **3 Step progressivi:**
  1. **Info Base**: Nome, descrizione, indirizzo completo
  2. **Contatti**: Telefono, email, sito web
  3. **Logo**: Upload immagine (opzionale, max 5MB)

**Validazione:**
- Campi obbligatori: nome, indirizzo, città, telefono, email
- Controllo dimensione file logo (max 5MB)
- Controllo formato file (solo immagini)

**Storage:**
- Logo convertito in Base64
- Salvataggio in Firestore: collection `clubRegistrationRequests`
- Status: `pending`

---

### 3. **ClubRegistrationRequests** (`src/pages/admin/ClubRegistrationRequests.jsx`)
Pannello admin per gestire le richieste di registrazione.

**Funzionalità:**
- ✅ Visualizza tutte le richieste in attesa
- ✅ Espandi dettagli (descrizione, indirizzo, contatti)
- ✅ Preview logo
- ✅ Approva richiesta → crea circolo
- ✅ Rifiuta richiesta (con motivo)

**Processo di Approvazione:**
1. Upload logo su Firebase Storage (se presente)
2. Creazione documento in collection `clubs`
3. Aggiornamento status richiesta a `approved`
4. Salvataggio `clubId` nella richiesta

---

## 🔄 Flusso Completo

### Lato Utente

1. **Landing Page**
   - Click su "Registrati"
   - Si apre `RegistrationTypeModal`

2. **Scelta Tipo**
   - **Utente** → `/register` (registrazione normale con Google)
   - **Circolo** → `/register-club` (form completo)

3. **Form Registrazione Circolo**
   - Step 1: Compila info base
   - Step 2: Inserisci contatti
   - Step 3: Upload logo (opzionale)
   - Submit → salva in `clubRegistrationRequests`

4. **Conferma**
   - Messaggio di successo
   - "Ti contatteremo presto"
   - Redirect alla home

---

### Lato Admin

1. **Accesso Admin**
   - Login: `/admin/login`
   - Dashboard: `/admin/dashboard`

2. **Notifica Richieste**
   - Card "Richieste Circoli" evidenziata in giallo
   - Numero richieste in attesa visibile

3. **Gestione Richieste**
   - Click su "Richieste Circoli"
   - Vai a `/admin/club-requests`

4. **Revisione**
   - Visualizza lista richieste
   - Click "Dettagli" per espandere
   - Vedi tutti i dati: nome, descrizione, indirizzo, contatti, logo

5. **Approvazione**
   - Click "Approva"
   - Sistema:
     * Carica logo su Storage
     * Crea circolo in `clubs`
     * Aggiorna status richiesta
   - Conferma con ID circolo

6. **Rifiuto** (opzionale)
   - Click "Rifiuta"
   - Inserisci motivo
   - Status → `rejected`

---

## 🗄️ Struttura Dati

### Collection: `clubRegistrationRequests`

```javascript
{
  name: "Tennis Club Milano",
  description: "Circolo sportivo...",
  address: {
    street: "Via Roma, 123",
    city: "Milano",
    province: "MI",
    postalCode: "20100",
    country: "Italia"
  },
  contact: {
    phone: "+39 123 456 7890",
    email: "info@tennisclub.it",
    website: "https://www.tennisclub.it" // opzionale
  },
  logoBase64: "data:image/png;base64,iVBOR...", // opzionale
  status: "pending", // pending | approved | rejected
  requestedAt: Timestamp,
  approvedAt: Timestamp | null,
  approvedBy: "adminUserId" | null,
  clubId: "generatedClubId" | null, // dopo approvazione
  rejectionReason: "Motivo..." | null // se rifiutato
}
```

### Collection: `clubs` (dopo approvazione)

```javascript
{
  name: "Tennis Club Milano",
  description: "Circolo sportivo...",
  address: { ... },
  location: {
    city: "Milano",
    province: "MI",
    coordinates: null // TODO: geocoding
  },
  contact: { ... },
  logo: "https://firebasestorage.googleapis.com/...", // URL finale
  settings: {
    bookingDuration: 90,
    advanceBookingDays: 14,
    cancellationHours: 24,
    allowGuestBooking: false
  },
  sports: [],
  courts: [],
  instructors: [],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: true
}
```

---

## 🎯 Accesso alle Funzionalità

### URL Principali

| Pagina | URL | Accesso |
|--------|-----|---------|
| Landing Page | `/` | Pubblico |
| Modal Registrazione | - | Pubblico |
| Form Utente | `/register` | Pubblico |
| Form Circolo | `/register-club` | Pubblico |
| Admin Login | `/admin/login` | Admin |
| Admin Dashboard | `/admin/dashboard` | Admin |
| Richieste Circoli | `/admin/club-requests` | Admin |

### Come Accedere

**Registrare un Circolo:**
1. Vai su https://play-sport-pro-v2-2025.netlify.app/
2. Click su "Registrati"
3. Scegli "Registra il tuo Circolo"
4. Compila il form in 3 step
5. Submit

**Approvare una Richiesta:**
1. Vai su https://play-sport-pro-v2-2025.netlify.app/admin/login
2. Login con credenziali admin
3. Dashboard → "Richieste Circoli"
4. Oppure vai direttamente a `/admin/club-requests`
5. Approva o Rifiuta

---

## ⚡ Vantaggi del Sistema

✅ **Nessun problema CORS** - Logo in Base64, upload solo dopo approvazione
✅ **Controllo qualità** - Admin verifica manualmente ogni richiesta
✅ **Tracciabilità** - Tutte le richieste archiviate in Firestore
✅ **UX ottimizzata** - Form step-by-step facile da compilare
✅ **Sicurezza** - Nessun accesso diretto alla collection `clubs`
✅ **Flessibilità** - Admin può rifiutare con motivo

---

## 🔧 Configurazione Firebase

### Regole Firestore

Assicurati che le regole permettano:

```javascript
// Scrittura pubblica per richieste (solo creazione)
match /clubRegistrationRequests/{requestId} {
  allow create: if true; // Chiunque può creare una richiesta
  allow read, update, delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

// Solo admin può gestire clubs
match /clubs/{clubId} {
  allow read: if true; // Tutti possono leggere
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Regole Storage

```javascript
// Solo admin può caricare loghi
match /clubs/logos/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## 🚀 Prossimi Passi (Opzionali)

### Miglioramenti Futuri

1. **Email Notifica**
   - Invia email all'admin quando arriva nuova richiesta
   - Invia email al richiedente quando viene approvato/rifiutato

2. **Geocoding Automatico**
   - Converti indirizzo in coordinate GPS
   - Mostra circolo sulla mappa

3. **Dashboard Statistiche**
   - Grafico richieste per mese
   - Tasso di approvazione
   - Tempo medio di risposta

4. **Bulk Actions**
   - Approva/Rifiuta multiple richieste contemporaneamente

5. **Filtri e Ricerca**
   - Filtra per città, data, status
   - Ricerca per nome circolo

6. **Storico Completo**
   - Visualizza anche richieste approvate/rifiutate
   - Possibilità di ri-attivare circoli

---

## 📝 Note Tecniche

- **Base64 vs Storage**: Logo salvato in base64 nella richiesta, poi caricato su Storage solo dopo approvazione
- **Validazione**: Dimensione max 5MB per evitare documenti Firestore troppo grandi
- **Performance**: Query filtrata solo su `status: pending` per velocità
- **Dark Mode**: Tutte le pagine supportano dark mode

---

## ✅ Checklist Deploy

- [x] Componente `RegistrationTypeModal` creato
- [x] Pagina `RegisterClubPage` creata
- [x] Pagina admin `ClubRegistrationRequests` creata
- [x] Route `/register-club` aggiunta
- [x] Route `/admin/club-requests` aggiunta
- [x] Link nel menu admin dashboard
- [x] Validazione form implementata
- [x] Gestione errori implementata
- [x] Dark mode supportato
- [ ] Regole Firestore configurate
- [ ] Regole Storage configurate
- [ ] Test completo end-to-end
- [ ] Deploy su produzione

---

## 🎓 Come Testare Localmente

1. **Registra un circolo di test:**
   ```
   http://localhost:5173/
   → Click "Registrati"
   → "Registra il tuo Circolo"
   → Compila form con dati fittizi
   ```

2. **Verifica su Firestore:**
   - Firebase Console → Firestore
   - Collection `clubRegistrationRequests`
   - Dovresti vedere il nuovo documento con `status: pending`

3. **Accedi come admin:**
   ```
   http://localhost:5173/admin/login
   → Login
   → Dashboard → "Richieste Circoli"
   ```

4. **Approva la richiesta:**
   - Click "Approva"
   - Verifica che il circolo sia creato in `clubs`
   - Verifica che lo status sia `approved`

---

**Creato il:** 7 Ottobre 2025
**Ultima modifica:** 7 Ottobre 2025
**Versione:** 1.0.0
