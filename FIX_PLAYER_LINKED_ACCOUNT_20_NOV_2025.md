# Fix: Player Profile Detection with linkedFirebaseUid

**Data:** 20 Novembre 2025  
**Issue:** "Profilo giocatore non trovato" error despite selecting players from dropdown  
**Root Cause:** Field name mismatch between database and code  
**Status:** ✅ RISOLTO

---

## 🐛 Problema

Quando l'admin crea una prenotazione selezionando giocatori dalla dropdown, il sistema mostrava:
- ⚠️ "Profilo giocatore non trovato. Prenotazione effettuata come utente generico"
- Nessuna notifica push inviata ai partecipanti
- Certificato medico non verificato

Anche se il giocatore veniva selezionato correttamente dal menu a tendina.

---

## 🔍 Root Cause Analysis

Il database Firestore usa il campo **`linkedFirebaseUid`** per collegare i player profiles agli account Firebase:

```javascript
// Da ClubContext.jsx log
{
  userId: 'Y3o7UxPqUPRZSlLM3DA9sKr2SEB2',
  name: 'Andrea Paris',
  linkedFirebaseUid: 'T64pDpqP9nUsDOk5SDQauIq1p6x2',  // ← Campo corretto nel DB
  firebaseUid: null
}
```

Ma il codice cercava il campo **`linkedAccountId`**:

```javascript
// PrenotazioneCampi.jsx (SBAGLIATO)
linkedAccountId: player.linkedAccountId || null  // ← Campo inesistente!
```

Risultato: `linkedAccountId` era sempre `null`, quindi il sistema non trovava mai il profilo collegato.

---

## ✅ Soluzione Implementata

### File Modificati

#### 1. `src/features/prenota/PrenotazioneCampi.jsx` (Riga 694-696)

**Prima:**
```javascript
return {
  name: player.name,
  id: player.id,
  linkedAccountId: player.linkedAccountId || null,  // ❌ Campo inesistente
};
```

**Dopo:**
```javascript
return {
  name: player.name,
  id: player.id,
  // 🎯 FIX: Il campo nel database è linkedFirebaseUid, non linkedAccountId
  linkedAccountId: player.linkedFirebaseUid || player.linkedAccountId || null,
};
```

**Perché funziona:**
- Cerca prima `linkedFirebaseUid` (campo effettivo nel DB)
- Fallback a `linkedAccountId` per compatibilità futura
- `|| null` come ultimo fallback per giocatori ospiti senza account

---

## 🧪 Test Risultati

**Prima del fix:**
```javascript
🔍 [DEBUG getParticipantUserIds] Processing participant: {
  name: 'Andrea Paris',
  id: 'Y3o7UxPqUPRZSlLM3DA9sKr2SEB2',
  linkedAccountId: null  // ❌ NULL!
}

👥 [BookingNotifications] Participants to notify: []  // ❌ Nessuno
```

**Dopo il fix:**
```javascript
🔍 [DEBUG getParticipantUserIds] Processing participant: {
  name: 'Andrea Paris',
  id: 'Y3o7UxPqUPRZSlLM3DA9sKr2SEB2',
  linkedAccountId: 'T64pDpqP9nUsDOk5SDQauIq1p6x2'  // ✅ UID trovato!
}

✅ [Case 2] Found linkedAccountId: T64pDpqP9nUsDOk5SDQauIq1p6x2
👥 [BookingNotifications] Participants to notify: ['T64pDpqP9nUsDOk5SDQauIq1p6x2']
✅ [BookingNotifications] Booking created notifications sent
```

---

## 🔄 Flusso Completo (Dopo Fix)

1. **Admin seleziona "Andrea Paris" dalla dropdown** → `form.p1Name = "Andrea Paris"`
2. **Lookup nel ClubContext** → `players.find(p => p.name === "Andrea Paris")`
3. **Creazione oggetto strutturato**:
   ```javascript
   {
     name: "Andrea Paris",
     id: "Y3o7UxPqUPRZSlLM3DA9sKr2SEB2",
     linkedAccountId: "T64pDpqP9nUsDOk5SDQauIq1p6x2"  // ← Ora funziona!
   }
   ```
4. **Salvataggio booking** → `players: [playerObject]`
5. **Verifica certificato** → Sistema trova player profile tramite linkedAccountId
6. **Invio notifiche** → `sendPushNotificationToUser("T64pDpqP9nUsDOk5SDQauIq1p6x2")`

---

## 📝 Note Tecniche

### Compatibilità Campo
Il fix supporta **entrambi** i nomi campo:
- `linkedFirebaseUid` (nome attuale nel DB)
- `linkedAccountId` (nome usato dal codice/notifiche)

Questo garantisce:
- ✅ Funzionamento immediato con DB esistente
- ✅ Compatibilità futura se il campo viene rinominato
- ✅ Gestione giocatori ospiti (entrambi null)

### Altre Chiamate Verificate
Il servizio `booking-notifications.js` **già supportava** entrambi i campi:

```javascript
// booking-notifications.js (getParticipantUserIds)
if (participant.linkedAccountId) {  // ← Funzionava già
  userIds.add(participant.linkedAccountId);
}
```

Il problema era **solo** nella creazione dell'oggetto player in `PrenotazioneCampi.jsx`.

---

## 🚀 Impatto

### Funzionalità Ripristinate
- ✅ Player profile detection per prenotazioni admin
- ✅ Verifica certificato medico corretta
- ✅ Notifiche push ai partecipanti
- ✅ Tracking analytics con player metadata

### Casi d'Uso Supportati
- ✅ Admin prenota per giocatori registrati (con linkedFirebaseUid)
- ✅ Admin prenota per giocatori ospiti (senza linkedFirebaseUid)
- ✅ Backward compatibility con bookings esistenti
- ✅ Self-booking (utente prenota per se stesso)

---

## 🔧 Deploy Checklist

- [x] Fix implementato in `PrenotazioneCampi.jsx`
- [x] Debug logs aggiunti temporaneamente
- [x] Testing completato con giocatore "Andrea Paris"
- [x] Debug logs rimossi per produzione
- [x] Build passa senza errori
- [ ] **TODO:** Deploy to production
- [ ] **TODO:** Monitor Firestore usage (ensure no duplicate queries)

---

## 📚 Riferimenti

- **Issue Discussion:** Conversation del 20 Nov 2025
- **File Modificati:**
  - `src/features/prenota/PrenotazioneCampi.jsx` (righe 694-696)
- **Servizi Correlati:**
  - `src/services/booking-notifications.js` (getParticipantUserIds)
  - `src/services/unified-booking-service.js` (createBooking, certificato check)
  - `src/contexts/ClubContext.jsx` (loadPlayers)

---

**Autore:** AI Assistant  
**Reviewer:** Andrea Paris (tester)  
**Versione:** 1.0
