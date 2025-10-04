# 🔍 Debug: Fasce Orarie Lezioni Non Visibili in Produzione

## Problema
**Sintomo**: Accedendo dal sito in produzione, nella sezione "Prenota Lezione" non si vedono le disponibilità, mentre in localhost funziona correttamente con lo stesso account.

## Cause Possibili

### 1. **Club ID Non Corretto o Mancante** ⚠️
**Probabilità**: ALTA  
**Descrizione**: Il `clubId` potrebbe non essere passato correttamente al componente LessonBookingInterface in produzione.

**Come verificare**:
1. Apri la Console del Browser (F12)
2. Cerca il log: `🔍 [LessonBooking] Setting up timeSlots listener:`
3. Verifica che `currentClubId` sia presente e corretto

**Soluzione se manca**:
- Verifica che il routing passi correttamente il `clubId`
- Controlla che `useClub()` ritorni il `selectedClub` corretto

### 2. **Errore Permessi Firestore** 🔒
**Probabilità**: MEDIA  
**Descrizione**: Le regole di sicurezza Firestore potrebbero bloccare la lettura della collezione `timeSlots` in produzione.

**Come verificare**:
1. Console Browser → Cerca errori con: `❌ [LessonBooking] Error in real-time listener:`
2. Verifica il messaggio di errore per codici come `permission-denied`

**Soluzione**:
Aggiungere/verificare le regole Firestore in `firestore.rules`:
```javascript
match /clubs/{clubId}/timeSlots/{slotId} {
  // Lettura: tutti gli utenti autenticati possono leggere
  allow read: if request.auth != null;
  
  // Scrittura: solo istruttori del club o admin
  allow write: if request.auth != null && (
    isInstructor(clubId, request.auth.uid) ||
    isClubAdmin(clubId, request.auth.uid)
  );
}
```

### 3. **Listener Non Si Attiva** 📡
**Probabilità**: MEDIA  
**Descrizione**: Il listener real-time potrebbe non attivarsi correttamente in produzione a causa di import dinamici o problemi di bundle.

**Come verificare**:
1. Console Browser → Cerca: `🔌 [LessonBooking] Importing Firestore modules...`
2. Verifica che compaia: `✅ [LessonBooking] Listener setup completed`

**Soluzione**:
Se gli import falliscono, potrebbe essere un problema di build. Verifica il bundle in produzione.

### 4. **Fasce Orarie Non Salvate Correttamente** 💾
**Probabilità**: BASSA  
**Descrizione**: Le fasce create in localhost potrebbero non essere state salvate su Firebase, ma solo in stato locale.

**Come verificare**:
1. Vai su Firebase Console → Firestore Database
2. Naviga in: `clubs/{clubId}/timeSlots`
3. Verifica che ci siano documenti

**Soluzione**:
Ricrea le fasce orarie direttamente in produzione.

## Log Aggiunti per il Debug

Ho aggiunto log dettagliati in `LessonBookingInterface.jsx` che ti aiuteranno a diagnosticare:

### Log da cercare nella Console Browser:

1. **Setup Listener**:
```
🔍 [LessonBooking] Setting up timeSlots listener:
  clubId: "..."
  selectedClubId: "..."
  currentClubId: "..."
  hasClubId: true/false
```

2. **Caricamento Moduli**:
```
🔌 [LessonBooking] Importing Firestore modules...
📡 [LessonBooking] Creating listener for path: clubs/.../timeSlots
✅ [LessonBooking] Listener setup completed
```

3. **Dati Ricevuti**:
```
📚 [LessonBooking] Real-time update - instructor time slots:
  count: X
  path: "clubs/.../timeSlots"
  slots: [...]
```

4. **Merge Configurazioni**:
```
🔄 [LessonBooking] Merging time slots:
  adminSlots: X
  instructorSlots: Y
  
✅ [LessonBooking] Merged config:
  totalSlots: X+Y
  slots: [...]
```

5. **Verifica Disponibilità Date**:
```
🔍 [hasAvailableSlotsForDate] Checking date: YYYY-MM-DD
  totalSlots: X
  activeSlots: Y
```

## Procedura di Debug

### Step 1: Verifica Club ID
1. Accedi al sito in produzione
2. Apri Console Browser (F12)
3. Vai in "Prenota Lezione"
4. Cerca il log `🔍 [LessonBooking] Setting up timeSlots listener:`
5. **Verifica che `currentClubId` non sia `null` o `undefined`**

### Step 2: Verifica Listener
1. Cerca il log `✅ [LessonBooking] Listener setup completed`
2. Se non c'è, cerca errori con `❌`
3. Annota il messaggio di errore

### Step 3: Verifica Dati Ricevuti
1. Cerca il log `📚 [LessonBooking] Real-time update`
2. Verifica che `count` sia > 0
3. Se count è 0, vai su Firebase Console e verifica i dati

### Step 4: Verifica Merge
1. Cerca il log `✅ [LessonBooking] Merged config`
2. Verifica che `totalSlots` > 0
3. Se è 0, il problema è nei dati sorgente

### Step 5: Verifica Disponibilità
1. Seleziona una data nel calendario
2. Cerca il log `🔍 [hasAvailableSlotsForDate]`
3. Verifica che `activeSlots` > 0

## Fix Rapidi

### Fix 1: Club ID Mancante
Se `currentClubId` è null, aggiungi il clubId esplicitamente:
- Verifica il routing della pagina
- Assicurati che `useClub()` sia inizializzato correttamente

### Fix 2: Permessi Firestore
Se vedi `permission-denied`, aggiungi le regole Firestore e fai deploy:
```bash
firebase deploy --only firestore:rules
```

### Fix 3: Listener Non Funziona
Se il listener non si attiva:
1. Verifica che il progetto sia buildato correttamente
2. Controlla gli import dinamici nel bundle
3. Prova a fare un rebuild completo

## Informazioni da Fornire

Quando hai i log, inviami queste informazioni:

1. ✅ Valore di `currentClubId` dal primo log
2. ✅ Presenza/assenza di `✅ Listener setup completed`
3. ✅ Eventuali errori `❌` con messaggio completo
4. ✅ Valore di `count` in `Real-time update`
5. ✅ Valore di `totalSlots` in `Merged config`
6. ✅ Screenshot della Console Browser con i log

Con queste informazioni potrò identificare esattamente il problema! 🎯
