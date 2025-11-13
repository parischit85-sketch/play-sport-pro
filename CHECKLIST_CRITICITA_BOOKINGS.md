# ✅ CHECKLIST CRITICITÀ BOOKINGS

**Data inizio**: 13 Novembre 2025  
**Branch**: ripristino-11-nov  
**Status**: 🔄 IN PROGRESS

---

## 🔴 CRITICITÀ 1: DUAL-WRITE NON IMPLEMENTATO
**Severità**: ⭐⭐⭐⭐⭐ CRITICA  
**Effort**: 4h  
**Priorità**: P0

### Descrizione
Prenotazioni scritte solo in `bookings/` (root), manca scrittura in `clubs/{clubId}/bookings/` (subcollection) → statistiche admin errate.

### Checklist
- [ ] **Step 1.1**: Implementare dual-write in `createCloudBooking()` (2h)
  - [ ] Modificare `src/services/unified-booking-service.js` linea 605
  - [ ] Aggiungere `setDoc()` a subcollection dopo `addDoc()` root
  - [ ] Gestire errori subcollection senza bloccare operazione
  - [ ] Aggiungere log per tracciare successo dual-write

- [ ] **Step 1.2**: Implementare dual-write in `updateCloudBooking()` (1h)
  - [ ] Trovare funzione update esistente
  - [ ] Aggiungere `updateDoc()` a subcollection
  - [ ] Gestire caso booking senza `clubId`
  - [ ] Test update con e senza subcollection

- [ ] **Step 1.3**: Implementare dual-write in `deleteCloudBooking()` (1h)
  - [ ] Trovare funzione delete esistente
  - [ ] Aggiungere `deleteDoc()` da subcollection
  - [ ] Gestire soft delete vs hard delete
  - [ ] Test delete con cleanup completo

- [ ] **Step 1.4**: Script sync bookings esistenti (2h)
  - [ ] Creare `scripts/sync-bookings-to-subcollections.js`
  - [ ] Implementare logica sync con batch writes
  - [ ] Aggiungere dry-run mode per testing
  - [ ] Aggiungere progress logging

- [ ] **Step 1.5**: Testing e verifica (1h)
  - [ ] Run sync script in dry-run
  - [ ] Verificare count: root vs subcollection
  - [ ] Run sync script in produzione
  - [ ] Verificare admin dashboard stats corretti

- [ ] **Step 1.6**: Deploy e monitoring (30min)
  - [ ] Commit changes con message descrittivo
  - [ ] Deploy su Firebase
  - [ ] Monitorare logs per 24h
  - [ ] Verificare no errori dual-write

**Files da modificare**:
- `src/services/unified-booking-service.js`
- `scripts/sync-bookings-to-subcollections.js` (nuovo)

**Test cases**:
- Create booking → verifica in root e subcollection
- Update booking → verifica sync update
- Delete booking → verifica cleanup completo
- Booking senza clubId → skip subcollection gracefully

---

## 🔴 CRITICITÀ 2: NO DISTINZIONE ADMIN BOOKINGS
**Severità**: ⭐⭐⭐⭐ ALTA  
**Effort**: 6h  
**Priorità**: P0  
**Status**: 🔄 IN PROGRESS (2/6 steps completati)

### Descrizione
Admin e utenti normali usano stesso flusso, impossibile distinguere prenotazioni create da admin o tracciare booking proxy.

### Checklist
- [x] **Step 2.1**: Aggiungere campi metadata admin (1h) ✅ COMPLETATO
  - [x] Aggiungere `isAdminCreated: boolean` al booking object
  - [x] Aggiungere `createdByRole: string` (user|club_admin|super_admin)
  - [x] Aggiungere `adminNotes: string | null`
  - [x] Aggiungere `isProxyBooking: boolean`
  - [x] Aggiungere `proxyBookedBy: string | null` (UID admin)
  - [x] Aggiungere `proxyRelation: string | null` (admin|parent|coach)

- [x] **Step 2.2**: Implementare `createAdminBooking()` (2h) ✅ COMPLETATO
  - [x] Creare nuova funzione in `unified-booking-service.js`
  - [x] Aggiungere parametro `targetUserId` per proxy bookings
  - [x] Auto-detect admin role dal user object
  - [x] Gestire campo `userId` correttamente per proxy
  - [x] Validazione: solo club_admin e admin possono usarla
  - [x] Log dettagliato per debugging

- [ ] **Step 2.3**: UI admin mode toggle (2h)
  - [ ] Modificare `src/features/prenota/PrenotazioneCampi.jsx`
  - [ ] Aggiungere checkbox "Prenota come amministratore"
  - [ ] Mostrare toggle solo se `isClubAdmin(clubId) === true`
  - [ ] Aggiungere state `isAdminMode`

- [ ] **Step 2.4**: UI user picker component (1h)
  - [ ] Creare `<UserPicker />` component
  - [ ] Search utenti del club con autocomplete
  - [ ] Mostrare solo se `isAdminMode === true`
  - [ ] Permettere "prenotazione per me" (admin stesso)

- [ ] **Step 2.5**: UI admin notes field (30min)
  - [ ] Aggiungere textarea "Note interne"
  - [ ] Placeholder: "Note visibili solo agli amministratori"
  - [ ] Mostrare solo se `isAdminMode === true`
  - [ ] Max length validation (500 chars)

- [ ] **Step 2.6**: Testing flusso completo (1h)
  - [ ] Test: User normale crea booking → NO admin fields
  - [ ] Test: Admin crea booking per sé → admin fields + auto-confirm
  - [ ] Test: Admin crea booking per cliente → proxy fields popolati
  - [ ] Test: Admin notes salvate e visibili solo ad admin
  - [ ] Verificare security rules permettono admin write

**Files da modificare**:
- `src/services/unified-booking-service.js`
- `src/features/prenota/PrenotazioneCampi.jsx`
- `src/components/UserPicker.jsx` (nuovo)

**Test cases**:
- User booking → `isAdminCreated: false`, `createdByRole: 'user'`
- Admin booking per sé → `isAdminCreated: true`, `userId === createdBy`
- Admin booking per cliente → `isProxyBooking: true`, `userId !== createdBy`
- Admin notes → visibili solo in admin panel

---

## 🟡 CRITICITÀ 3: ID GENERATION INCONSISTENTE
**Severità**: ⭐⭐⭐ MEDIA  
**Effort**: 2h  
**Priorità**: P1

### Descrizione
Client genera ID timestamp-based, Firestore genera ID diverso → campo `legacyId` ridondante, confusione debug.

### Checklist
- [ ] **Step 3.1**: Decidere strategia ID (30min)
  - [ ] Discussione team: Firestore auto-gen vs client-gen
  - [ ] Considerare backward compatibility
  - [ ] Documentare decisione in ADR (Architecture Decision Record)
  - [ ] **Decisione scelta**: ____________________

- [ ] **Step 3.2**: Opzione A - Firestore auto-generated (1h)
  - [ ] Rimuovere `generateBookingId()` call in `createBooking()`
  - [ ] Rimuovere campo `legacyId` dal booking object
  - [ ] Modificare `createCloudBooking()` per usare solo `docRef.id`
  - [ ] Update test cases per non aspettarsi `legacyId`

- [ ] **Step 3.2 ALT**: Opzione B - Client-generated (1h)
  - [ ] Modificare `createCloudBooking()` per usare `setDoc()` invece `addDoc()`
  - [ ] Usare client ID come Firestore doc ID
  - [ ] Rimuovere campo `legacyId` (non più necessario)
  - [ ] Update test cases

- [ ] **Step 3.3**: Migration script (se necessario) (30min)
  - [ ] Script per aggiornare bookings esistenti
  - [ ] Rimuovere campo `legacyId` da documenti vecchi
  - [ ] Dry-run e verifica
  - [ ] Eseguire in produzione

- [ ] **Step 3.4**: Update queries e references (30min)
  - [ ] Cercare tutti usi di `legacyId` nel codebase
  - [ ] Sostituire con `id` standard
  - [ ] Update logs e debug statements
  - [ ] Test end-to-end

**Files da modificare**:
- `src/services/unified-booking-service.js`
- `src/utils/bookingUtils.js` (se contiene `generateBookingId`)
- Eventuali test files

**Test cases**:
- Create booking → solo `id` field, no `legacyId`
- ID univoci e non collisioni
- Backward compatibility con bookings vecchi

---

## 🟡 CRITICITÀ 4: VALIDAZIONE CERTIFICATO MEDICO PERMISSIVA
**Severità**: ⭐⭐⭐ MEDIA  
**Effort**: 3h  
**Priorità**: P1

### Descrizione
Check certificato troppo permissivo: errori permission ignored, in scadenza non blocca, nessun check per utenti senza player profile.

### Checklist
- [ ] **Step 4.1**: Strict mode per certificati (1h)
  - [ ] Aggiungere flag `strictCertificateCheck` in options
  - [ ] Default: `true` (strict mode)
  - [ ] Se player profile non trovato → error (invece di skip)
  - [ ] Se certificato non presente → error
  - [ ] Se permission denied → error in strict mode

- [ ] **Step 4.2**: Critical expiry blocking (1h)
  - [ ] Aggiungere parametro `criticalExpiryDays` (default: 3)
  - [ ] Se certificato scade in <= 3 giorni → block booking
  - [ ] Messaggio chiaro: "Certif. scade tra X giorni, rinnova prima"
  - [ ] Log warning per scadenza 4-7 giorni (non block)
  - [ ] Test vari scenari scadenza

- [ ] **Step 4.3**: Club settings configurabili (1h)
  - [ ] Aggiungere config in `clubs/{clubId}/settings/bookings`:
    ```javascript
    certificateChecks: {
      enabled: true,
      strictMode: true,
      criticalExpiryDays: 3,
      requireForAllBookings: true,
      adminBypass: false
    }
    ```
  - [ ] Caricare settings in `createBooking()`
  - [ ] Applicare settings invece di hardcoded values
  - [ ] Admin panel per modificare settings

- [ ] **Step 4.4**: Error messages migliorati (30min)
  - [ ] Messaggi specifici per ogni scenario:
    - Profilo player non trovato
    - Certificato non presente
    - Certificato scaduto (con giorni)
    - Certificato in scadenza critica
    - Errore tecnico verifica
  - [ ] UI mostrare errori chiaramente
  - [ ] Suggerire azione (es: "Contatta circolo")

- [ ] **Step 4.5**: Testing scenari certificato (30min)
  - [ ] Test: Utente senza player profile → blocked
  - [ ] Test: Player senza certificato → blocked
  - [ ] Test: Certificato scaduto → blocked con messaggio
  - [ ] Test: Certificato scade in 2 giorni → blocked
  - [ ] Test: Certificato scade in 5 giorni → warning, allowed
  - [ ] Test: Certificato valido → success
  - [ ] Test: Admin bypass (se abilitato) → success

**Files da modificare**:
- `src/services/unified-booking-service.js` (linea 181-233)
- `src/hooks/useClubSettings.js` (per caricare config)
- Admin panel per gestire certificate settings

**Test cases**:
- Strict mode ON + no player → error
- Strict mode OFF + no player → warning, proceed
- Expiry in 2 days → blocked
- Expiry in 5 days → warning only

---

## 🟡 CRITICITÀ 5: CROSS-CLUB VISIBILITY INCOMPLETO
**Severità**: ⭐⭐⭐ MEDIA  
**Effort**: 4h  
**Priorità**: P2

### Descrizione
Campo `bookedForUserId` sempre uguale a `userId`, no supporto prenotazioni proxy (admin per cliente, parent per figlio).

### Checklist
- [ ] **Step 5.1**: Semantic fix `bookedForUserId` (1h)
  - [ ] `userId`: chi beneficia della prenotazione (target)
  - [ ] `createdBy`: chi ha creato la prenotazione (creator)
  - [ ] `bookedForUserId`: solo se proxy booking (target user)
  - [ ] Aggiungere `isProxyBooking` flag
  - [ ] Aggiungere `proxyRelation` (admin|parent|coach)
  - [ ] Popolare solo se `targetUserId !== creatorUserId`

- [ ] **Step 5.2**: Enhanced `getUserBookings()` (2h)
  - [ ] Query 1: bookings create dall'utente (`createdBy == uid`)
  - [ ] Query 2: bookings benefitting utente (`userId == uid && isProxyBooking == true`)
  - [ ] Merge results e deduplicate
  - [ ] Sort by date + time
  - [ ] Test: user vede sia proprie che proxy bookings

- [ ] **Step 5.3**: UI per proxy bookings (1h)
  - [ ] Badge "Prenotato da admin" se `isProxyBooking`
  - [ ] Mostrare chi ha creato: `proxyBookedByName`
  - [ ] Icona/label per relazione (admin/parent/coach)
  - [ ] Test rendering diversi scenari

- [ ] **Step 5.4**: Testing multi-club scenarios (30min)
  - [ ] Test: Utente membro di 2 club
  - [ ] Test: Admin club A prenota per user in club A → OK
  - [ ] Test: Admin club A prenota per user in club B → denied
  - [ ] Test: Parent prenota per figlio (se supportato)
  - [ ] Verificare security rules RBAC

**Files da modificare**:
- `src/services/unified-booking-service.js`
- `src/hooks/useBookings.js` (getUserBookings)
- `src/components/BookingCard.jsx` (UI per mostrare proxy info)

**Test cases**:
- Normal booking → `bookedForUserId: null`, `isProxyBooking: false`
- Admin proxy → `bookedForUserId: targetUid`, `userId: targetUid`, `createdBy: adminUid`
- getUserBookings() → include both created and benefitting

---

## 🟢 CRITICITÀ 6: NO TRANSACTION ATOMICA
**Severità**: ⭐⭐ BASSA  
**Effort**: 3h  
**Priorità**: P2

### Descrizione
Validation + Write non atomico → possibili race conditions con doppia prenotazione stesso slot (raro ma possibile).

### Checklist
- [ ] **Step 6.1**: Implementare Firestore transaction (2h)
  - [ ] Modificare `createCloudBooking()` per usare `runTransaction()`
  - [ ] Query bookings esistenti DENTRO transaction
  - [ ] Validate conflict DENTRO transaction
  - [ ] Write se no conflict
  - [ ] Throw error se conflict detected
  - [ ] Test con concurrent requests

- [ ] **Step 6.2**: Fallback con retry logic (1h)
  - [ ] Implement exponential backoff
  - [ ] Max 3 retry attempts
  - [ ] Delay: 100ms, 200ms, 400ms
  - [ ] Log retry attempts
  - [ ] Final error se tutti retry falliscono

- [ ] **Step 6.3**: Testing race conditions (30min)
  - [ ] Script per simulare concurrent bookings
  - [ ] 2 utenti prenotano stesso slot contemporaneamente
  - [ ] Verificare: solo 1 booking creato
  - [ ] Altro utente riceve error "Slot non disponibile"
  - [ ] Performance test: overhead transaction

**Files da modificare**:
- `src/services/unified-booking-service.js`

**Test cases**:
- Concurrent bookings → solo 1 success, altro error
- Sequential bookings → entrambi success se slot diversi
- Performance overhead transaction < 100ms

---

## 🟢 CRITICITÀ 7: NO CLEANUP AUTOMATICO
**Severità**: ⭐⭐ BASSA  
**Effort**: 2h  
**Priorità**: P3

### Descrizione
Bookings cancellati e vecchi rimangono per sempre → storage growth nel tempo.

### Checklist
- [ ] **Step 7.1**: Cloud Function cleanup (1h)
  - [ ] Creare `functions/scheduledCleanup.js`
  - [ ] Schedule: ogni 24h (cron: `0 2 * * *`)
  - [ ] Task 1: Delete cancelled bookings > 90 giorni
  - [ ] Task 2: Archive bookings > 1 anno
  - [ ] Batch writes (max 500 per batch)
  - [ ] Logging dettagliato

- [ ] **Step 7.2**: Archive collection setup (30min)
  - [ ] Creare collection `bookings_archive`
  - [ ] Index per query archive
  - [ ] Security rules per archive (admin read-only)
  - [ ] UI admin per visualizzare archive (opzionale)

- [ ] **Step 7.3**: Deploy e monitoring (30min)
  - [ ] Deploy function a Firebase
  - [ ] Test manuale first run
  - [ ] Verificare logs
  - [ ] Setup alerts se function fails
  - [ ] Monitor storage usage

**Files da modificare**:
- `functions/scheduledCleanup.js` (nuovo)
- `firestore.rules` (aggiungere rules per archive)
- `firestore.indexes.json` (se necessari index)

**Test cases**:
- Cancelled booking > 90 giorni → deleted
- Completed booking > 1 anno → moved to archive
- Recent bookings → non toccati
- Function runs successfully ogni 24h

---

## 📊 PROGRESS TRACKER

### Status Globale
- **Completate**: 1/7 (14%)
- **In Progress**: 0/7
- **Non Iniziate**: 6/7

### ✅ CRITICITÀ 1 - COMPLETATA
- ✅ Soluzione: Eliminata subcollection, mantenuta solo root `bookings/`
- ✅ Index ottimizzati aggiunti e deployati
- ✅ Performance garantite < 300ms
- ✅ Codice semplificato (zero dual-write)
- 📄 Documento: `CRITICITA_1_SOLUZIONE_BOOKINGS.md`

### Timeline Stimato
- **P0 (Critiche)**: ~10h → 2 giorni
- **P1 (Medie)**: ~9h → 2 giorni  
- **P2-P3 (Basse)**: ~9h → 2 giorni
- **TOTALE**: ~28h → 1 settimana (con testing)

### Priority Order
1. 🔴 **CRITICITÀ 1**: Dual-write (4h) ← START HERE
2. 🔴 **CRITICITÀ 2**: Admin bookings (6h)
3. 🟡 **CRITICITÀ 3**: ID consistency (2h)
4. 🟡 **CRITICITÀ 4**: Certificate validation (3h)
5. 🟡 **CRITICITÀ 5**: Cross-club visibility (4h)
6. 🟢 **CRITICITÀ 6**: Transactions (3h)
7. 🟢 **CRITICITÀ 7**: Cleanup (2h)

---

## 📝 NOTE

### Branch Strategy
- Branch corrente: `ripristino-11-nov`
- Creare feature branch per ogni criticità?
  - `fix/dual-write-bookings`
  - `feat/admin-booking-enhancements`
  - etc.

### Testing Strategy
- [ ] Unit tests per ogni modifica
- [ ] E2E tests per flow completi
- [ ] Manual QA checklist
- [ ] Performance regression tests

### Deployment Strategy
- [ ] Deploy incrementale (1 criticità alla volta)
- [ ] Canary deployment per P0 criticities
- [ ] Rollback plan per ogni deploy
- [ ] Monitor logs 24h post-deploy

---

**Prossimo Step**: Iniziare con CRITICITÀ 1 (Dual-write) ✅
