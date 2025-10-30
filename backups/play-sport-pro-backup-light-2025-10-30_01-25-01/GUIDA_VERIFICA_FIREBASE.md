# Guida Verifica Configurazione Firebase
**Data**: 15 Ottobre 2025  
**Progetto**: PlaySport Pro  
**Ambiente**: Produzione  

## 📋 Panoramica

Questa guida ti aiuta a verificare che tutte le configurazioni Firebase siano corrette per il deployment in produzione.

---

## 1. Configurazione Ambiente

### 1.1 File `.env` Produzione

Verifica che esistano questi file:
- `.env.production` - Configurazione produzione
- `.env.local` - Variabili locali (NON committare)

**Variabili Richieste in `.env.production`**:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

✅ **Checklist**:
- [ ] File `.env.production` esiste
- [ ] Tutte le variabili sono popolate
- [ ] Nessuna variabile contiene "your-" o placeholder
- [ ] `GA_MEASUREMENT_ID` inizia con "G-"
- [ ] File `.env` NON è committato in Git (.gitignore corretto)

---

## 2. Firebase Console - Verifica Progetto

### 2.1 Accesso Console
1. Vai a: https://console.firebase.google.com/
2. Seleziona il progetto corretto
3. Verifica il nome progetto

✅ **Checklist**:
- [ ] Accesso alla console funziona
- [ ] Progetto corretto selezionato
- [ ] Piano di billing attivo (se necessario)

### 2.2 Authentication

**Percorso**: Build → Authentication → Sign-in methods

Verifica provider abilitati:
- [ ] Email/Password abilitato
- [ ] Google abilitato (se usato)
- [ ] Altri provider configurati

**Domini Autorizzati**:
- [ ] `localhost` presente (dev)
- [ ] Dominio produzione aggiunto
- [ ] Domini staging aggiunti (se esistono)

**Impostazioni**:
- [ ] Email verification abilitato
- [ ] Password reset configurato
- [ ] Template email personalizzati (opzionale)

---

## 3. Firestore Database

### 3.1 Struttura Database

**Percorso**: Build → Firestore Database

Verifica collezioni principali:
```
/clubs
  /{clubId}
    /affiliations
    /bookings
    /courts
    /players
    /matches
    /playerRatingHistory
    /settings

/users
  /{userId}
    - email
    - displayName
    - role
    - ...

/bookings
  /{bookingId}
    - clubId
    - courtId
    - date
    - ...
```

✅ **Checklist**:
- [ ] Database creato
- [ ] Mode: Production (non Test)
- [ ] Location corretta (es: europe-west1)
- [ ] Collezioni principali esistono
- [ ] Indici creati per query complesse

### 3.2 Indici Firestore

**Percorso**: Firestore Database → Indexes

Indici necessari (esempio):
```
Collection: bookings
Fields: clubId (Ascending), date (Ascending)
Status: Enabled

Collection: players  
Fields: clubId (Ascending), rating (Descending)
Status: Enabled

Collection: matches
Fields: clubId (Ascending), date (Descending)
Status: Enabled
```

✅ **Checklist**:
- [ ] Indici per query comuni creati
- [ ] Nessun indice in "Building" per troppo tempo
- [ ] Indici "Failed" risolti

---

## 4. Security Rules

### 4.1 Firestore Rules

**Percorso**: Firestore Database → Rules

**Regole Base Sicure**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isClubAdmin(clubId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.clubId == clubId &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'club_admin'];
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if isAdmin();
    }
    
    // Clubs collection
    match /clubs/{clubId} {
      allow read: if true; // Public read
      allow write: if isClubAdmin(clubId) || isAdmin();
      
      // Sub-collections
      match /{subcollection}/{document=**} {
        allow read: if isAuthenticated();
        allow write: if isClubAdmin(clubId) || isAdmin();
      }
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                      (request.auth.uid == resource.data.userId || isAdmin());
      allow delete: if isAdmin();
    }
  }
}
```

✅ **Checklist**:
- [ ] Rules pubblicate (non in bozza)
- [ ] Nessun `allow read, write: if true` in produzione
- [ ] Autenticazione richiesta per operazioni sensibili
- [ ] Admin check implementato
- [ ] Test rules eseguiti (Firebase Emulator)

### 4.2 Storage Rules

**Percorso**: Storage → Rules

**Regole Base**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Club logos
    match /clubs/{clubId}/logo.{extension} {
      allow read: if true;
      allow write: if request.auth != null &&
                     request.resource.size < 5 * 1024 * 1024 && // 5MB
                     request.resource.contentType.matches('image/.*');
    }
    
    // Court images
    match /courts/{courtId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User profiles
    match /users/{userId}/profile.{extension} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.uid == userId &&
                     request.resource.size < 2 * 1024 * 1024; // 2MB
    }
  }
}
```

✅ **Checklist**:
- [ ] Storage configurato
- [ ] Rules pubblicate
- [ ] Limiti dimensione file impostati
- [ ] Validazione tipo file implementata
- [ ] Nessun accesso pubblico in scrittura

---

## 5. Google Analytics GA4

### 5.1 Configurazione GA4

**Percorso**: Google Analytics → Admin

✅ **Checklist**:
- [ ] Proprietà GA4 creata
- [ ] Stream web configurato
- [ ] Measurement ID inizia con "G-"
- [ ] Enhanced measurement abilitato
- [ ] Data retention configurato (almeno 14 mesi)

### 5.2 Eventi Personalizzati

Verifica che questi eventi siano configurati in GA4:
- `login`
- `sign_up`
- `booking_created`
- `booking_cancelled`
- `page_view`
- `button_click`

✅ **Checklist**:
- [ ] Eventi custom appaiono in real-time
- [ ] Parametri eventi corretti
- [ ] Conversioni configurate
- [ ] Debug View funziona

### 5.3 Privacy & GDPR

**Percorso**: Google Analytics → Admin → Data Settings

✅ **Checklist**:
- [ ] IP anonymization abilitato
- [ ] Data deletion requests configurati
- [ ] Google signals disabilitato (per GDPR)
- [ ] Cookie consent implementato in app

---

## 6. Cloud Functions (se usate)

### 6.1 Deployment Functions

**Percorso**: Build → Functions

✅ **Checklist**:
- [ ] Functions deployate correttamente
- [ ] Nessuna function in errore
- [ ] Logs senza errori critici
- [ ] Trigger configurati correttamente

### 6.2 Environment Variables Functions

**File**: `functions/.env` (se usato)

✅ **Checklist**:
- [ ] Variabili ambiente settate
- [ ] Nessuna chiave segreta in codice
- [ ] Service account configurato

---

## 7. Configurazione Email

### 7.1 SMTP/SendGrid (se usato)

✅ **Checklist**:
- [ ] Provider email configurato
- [ ] API key valida
- [ ] Template email esistono
- [ ] Email from verificato
- [ ] Test invio email funziona

### 7.2 Firebase Email Templates

**Percorso**: Authentication → Templates

Email da configurare:
- [ ] Email verification
- [ ] Password reset
- [ ] Email change
- [ ] SMS verification (se usato)

✅ **Checklist**:
- [ ] Template personalizzati
- [ ] Logo aziendale incluso
- [ ] Link corretti per produzione
- [ ] Test email ricevute

---

## 8. Performance & Monitoring

### 8.1 Firebase Performance

**Percorso**: Release & Monitor → Performance

✅ **Checklist**:
- [ ] Performance monitoring abilitato
- [ ] SDK installato
- [ ] Custom traces configurati
- [ ] Alert configurati (opzionale)

### 8.2 Crashlytics (opzionale)

**Percorso**: Release & Monitor → Crashlytics

✅ **Checklist**:
- [ ] Crashlytics abilitato
- [ ] Reports funzionanti
- [ ] Nessun crash critico

---

## 9. Billing & Quotas

### 9.1 Piano Firebase

**Percorso**: Project Settings → Usage and billing

✅ **Checklist**:
- [ ] Piano Blaze abilitato (pay-as-you-go)
- [ ] Budget alerts configurati
- [ ] Limite spesa impostato (opzionale)
- [ ] Metodo pagamento valido

### 9.2 Quotas & Limiti

Verifica limiti per:
- [ ] Firestore: Reads/Writes/Deletes
- [ ] Storage: GB stored/GB downloaded
- [ ] Cloud Functions: Invocations
- [ ] Authentication: Active users

**Limiti Consigliati**:
```
Firestore Reads: 50K-100K/day per utente attivo
Storage: 5GB gratis, poi pay-as-you-go
Functions: 125K invocations gratis, poi pay-as-you-go
```

---

## 10. Testing Finale Configurazione

### 10.1 Test Connessione

Esegui questo test nell'app:

```javascript
// Console browser
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

// Test read
const testRead = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'clubs'));
    console.log('✅ Firestore Read OK:', snapshot.size, 'documents');
  } catch (error) {
    console.error('❌ Firestore Read FAILED:', error);
  }
};

testRead();
```

✅ **Checklist**:
- [ ] Test read funziona
- [ ] Nessun errore CORS
- [ ] Nessun errore permessi
- [ ] Latenza accettabile (<500ms)

### 10.2 Test Security Rules

**Percorso**: Firestore → Rules → Simulator

Test da eseguire:
```
Simulation type: get
Location: /users/{userId}
Auth: Authenticated as {userId}
Expected: ALLOW

Simulation type: update
Location: /users/{otherUserId}  
Auth: Authenticated as {userId}
Expected: DENY

Simulation type: list
Location: /clubs
Auth: Not authenticated
Expected: ALLOW (public read)
```

✅ **Checklist**:
- [ ] Test authenticated users PASS
- [ ] Test unauthenticated users FAIL appropriately
- [ ] Test admin users PASS
- [ ] Test cross-user access FAIL

---

## 📊 Riepilogo Configurazione

### Componenti Verificati
- [ ] Environment variables
- [ ] Firebase project setup
- [ ] Authentication
- [ ] Firestore database
- [ ] Security rules (Firestore + Storage)
- [ ] Google Analytics GA4
- [ ] Cloud Functions (se usate)
- [ ] Email configuration
- [ ] Performance monitoring
- [ ] Billing & quotas

### Problemi Trovati
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Azioni Necessarie
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## ✅ Approvazione

**Configurazione Firebase Pronta per Produzione**: 

⬜ SÌ, tutto verificato  
⬜ NO, azioni richieste sopra  

**Verificato da**: _______________  
**Data**: _______________  

---

## 📚 Risorse

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Security Rules Guide](https://firebase.google.com/docs/rules)
- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)

**Supporto**: contatta team sviluppo per assistenza
