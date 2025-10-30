# 📝 CHANGELOG - Form Registrazione Circoli

## [2.1.0] - 2025-10-20 (23:25)

### 🚀 Auto-Creazione Club con Admin Immediato

#### ✨ Added
- **Club creato IMMEDIATAMENTE** con `status: 'pending'`
- **Utente diventa admin SUBITO** (può gestire dashboard)
- **Club NON visibile** ad altri utenti fino approvazione
- **Redirect automatico** a `/club/{clubId}/admin/dashboard`
- **Profilo admin creato** in `clubs/{clubId}/profiles/{userId}`

#### 📊 Workflow Nuovo
```
1. Registra club → Club creato con status='pending'
2. Utente → Admin immediato (role='club_admin')
3. Redirect → Dashboard admin (può configurare tutto)
4. Super-admin approva → Club diventa pubblico
```

#### 🔒 Security
- Club pending **NON searchable** da altri utenti
- Solo admin/owner vede club pending
- `getUserClubMemberships()` già gestisce correttamente

**Dettagli**: `CLUB_AUTO_CREATION_FIX_2025-10-20.md`

---

## [2.0.1] - 2025-10-20 (23:10)

### 🔒 Fix CSP + HTML Validation

#### 🐛 Fixed
- **CSP**: Aggiunto `https://api.cloudinary.com` in `connect-src`
- **HTML**: Fix `<div>` dentro `<p>` (validation warnings)
- **Console**: Nessun errore bloccante

**Dettagli**: `CSP_CLOUDINARY_FIX_2025-10-20.md`

---

## [2.0.0] - 2025-10-20

### 🎉 MAJOR CHANGES

#### ➖ Removed
- **Step 3 "Dati Operatore"** - Completamente rimosso
  - Non più necessario inserire dati personali operatore
  - Dati derivati automaticamente dal nome circolo
  - Semplificazione UX significativa

#### ➕ Added
- **Validazione Password Avanzata**
  - Richiede 8 caratteri invece di 6
  - Richiede almeno 1 carattere speciale (!@#$%^&*...)
  - Feedback visivo in tempo reale (❌/✅)
  - Messaggi helper text informativi

- **Auto-fill Indirizzo da Google Maps** 🗺️
  - Nuova funzione `extractAddressFromMapsLink()`
  - Integrazione API Nominatim per reverse geocoding
  - Estrazione automatica coordinate dal link
  - Auto-compilazione campi: Via, Città, CAP, Provincia
  - Spinner e feedback durante estrazione
  - Fallback graceful a compilazione manuale

- **Validazioni Campi Indirizzo**
  - CAP ora obbligatorio con pattern HTML5 `[0-9]{5}`
  - Provincia ora obbligatoria (2 lettere)
  - Via obbligatoria
  - Città obbligatoria

- **UI/UX Improvements**
  - Progress bar ridotta a 2 step
  - Box Google Maps evidenziato con bordo blu
  - Icona Globe per campo Google Maps
  - Pulsante Info (ℹ️) per istruzioni
  - Provincia auto-uppercase
  - Sezione indirizzo separata visivamente

#### 🔄 Changed
- **Step 1** - Ora include solo dati circolo base
  - Nome circolo (obbligatorio)
  - Email (obbligatorio)
  - Telefono (obbligatorio)
  - Password 8 char + speciale (obbligatorio)
  - Conferma password (obbligatorio)

- **Step 2** - Ora include dettagli + indirizzo completo
  - Logo (opzionale)
  - Descrizione (opzionale invece di obbligatoria)
  - Google Maps con auto-fill (opzionale)
  - Indirizzo completo (tutto obbligatorio)

- **Validazioni**
  - `canProceedToStep2`: aggiunta verifica `isPasswordValid()`
  - `canSubmit`: ora richiede tutti i campi indirizzo
  - Rimossa `canProceedToStep3`

- **Firebase Data**
  - `adminData` ora derivato da clubName invece di campi dedicati
  - `firstName`: primo word del clubName
  - `lastName`: resto del clubName
  - `email`: clubEmail
  - `phone`: clubPhone

#### 🐛 Fixed
- CAP validation non presente → aggiunta pattern HTML5
- Provincia non richiesta → ora obbligatoria
- Password troppo debole (6 char) → rafforzata (8 + speciale)
- Mancava feedback visivo password → implementato

---

## [1.0.0] - 2025-10-07

### Initial Release
- Form registrazione circoli a 3 step
- Upload logo su Cloudinary
- Validazione base campi
- Dark mode support
- Mobile responsive

---

## 🔗 Links

- [Documentazione Modifiche](MODIFICHE_FORM_REGISTRAZIONE_2025-10-20.md)
- [Guida Test](TEST_FORM_REGISTRAZIONE.md)
- [Riepilogo Completo](RIEPILOGO_COMPLETO.md)

---

## 📊 Migration Guide

### Per utenti esistenti
- Nessuna migrazione dati necessaria
- Form solo per nuove registrazioni
- Dati esistenti non impattati

### Per sviluppatori
```javascript
// PRIMA
formData.adminFirstName
formData.adminLastName
formData.adminEmail
formData.adminPhone

// DOPO
// Campi rimossi, derivati automaticamente:
const [firstName, ...rest] = clubName.split(' ');
const lastName = rest.join(' ');
const email = clubEmail;
const phone = clubPhone;
```

### Breaking Changes
- ❌ `adminFirstName` rimosso
- ❌ `adminLastName` rimosso
- ❌ `adminEmail` rimosso
- ❌ `adminPhone` rimosso
- ❌ Step 3 rimosso
- ✅ Tutti i campi indirizzo ora obbligatori

---

**Versione**: 2.0.0  
**Data Release**: 20 Ottobre 2025  
**Status**: ✅ Production Ready
