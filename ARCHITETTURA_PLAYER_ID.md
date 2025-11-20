# 🏗️ Architettura Player ID - Play Sport Pro ✅ VERIFICATA

## 📋 Problema Risolto

Il sistema confondeva due concetti diversi quando si collegava un profilo orfano a Firebase Auth:
- Cambiare `userId` causava la perdita di matches e statistiche
- **ROOT CAUSE**: I matches usano `userId`, NON `id`

## ✅ Architettura Corretta (CONFERMATA)

### Struttura Profilo Giocatore

```javascript
// Path: clubs/{clubId}/users/{docId}
{
  id: "93OJwY9VL7FhZdd92Zoe",           // Document ID (legacy, opzionale)
  userId: "Y3o7UxPqUPRZSlLM3DA9sKr2SEB2", // ✅ IMMUTABILE - Usato in matches/stats
  firebaseUid: "mwLUarfeMkQqKMmDZ1qPPMyN7mZ2", // ✅ OPZIONALE - Solo per auth/push
  name: "Andrea Paris",
  email: "parischit85@gmail.com",
  isLinked: true,
  linkedAt: "2025-11-18T10:00:00Z"
}
```

### Utilizzo dei Campi (VERIFICATO SUL DATABASE)

| Contesto | Campo Usato | Esempio | Verificato |
|----------|-------------|---------|-----------|
| **Matches** (`teamA`, `teamB`) | `userId` | `teamA: ["Y3o7Ux...", "def456"]` | ✅ CONFERMATO |
| **Bookings** | `userId` | `userId: "Y3o7Ux..."` | ✅ |
| **Statistiche/Ranking** | `userId` | Calcolate da matches usando `userId` | ✅ CONFERMATO |
| **Push Notifications** | `firebaseUid` | `pushSubscriptions/{firebaseUid}_{deviceId}` | ✅ |
| **Login App** | `firebaseUid` | Firebase Authentication | ✅ |
| **Profile Display** | `userId` | ID principale del giocatore | ✅ |
| **Document ID** | `id` | Legacy/opzionale | - |

## 🔄 Flusso Collegamento Account (CORRETTO)

### Prima del Collegamento (Profilo Orfano)
```javascript
{
  id: "93OJwY9VL7FhZdd92Zoe",              // Document ID (legacy)
  userId: "Y3o7UxPqUPRZSlLM3DA9sKr2SEB2",  // ID originale giocatore
  name: "Andrea Paris",
  // ... matches usano "Y3o7UxPq..." in teamA/teamB ✅
}
```

### Dopo il Collegamento ✅ CORRETTO
```javascript
{
  id: "93OJwY9VL7FhZdd92Zoe",              // ✅ INVARIATO
  userId: "Y3o7UxPqUPRZSlLM3DA9sKr2SEB2",  // ✅ INVARIATO (preserva matches!)
  firebaseUid: "mwLUarfeMkQqKMmDZ1qPPMyN7mZ2", // ✅ NUOVO (per auth/push)
  isLinked: true,
  linkedAt: "2025-11-18T10:00:00Z",
  name: "Andrea Paris",
  // ... matches CONTINUANO a usare "Y3o7UxPq..." ✅
}
```

### ❌ ERRORE DA EVITARE (Vecchia Implementazione)
```javascript
{
  id: "93OJwY9VL7FhZdd92Zoe",
  userId: "mwLUarfeMkQqKMmDZ1qPPMyN7mZ2",  // ❌ SBAGLIATO - cambiato!
  previousUserId: "Y3o7UxPqUPRZSlLM3DA9sKr2SEB2",
  // ... matches usano ancora "Y3o7UxPq..." ma userId è diverso
  // RISULTATO: statistiche/matches spariscono ❌
}
```
  linkedAt: "2025-11-18...",
  previousUserId: "player_123",  // Storico
  // ... matches continuano a usare "player_123" in teamA/teamB
}
```

## 🎯 Vantaggi

1. **Matches invariati**: Non serve aggiornare i matches quando colleghi un account
2. **Statistiche preservate**: Il ranking/statistiche rimangono collegati al giocatore
3. **Multi-club**: Lo stesso utente Firebase può avere profili diversi in club diversi
4. **Push notifications**: Funzionano perché `userId` punta a Firebase Auth
5. **Separazione responsabilità**: 
   - `id` = identità nel circolo
   - `userId` = identità globale Play Sport

## ⚠️ Cosa NON fare

❌ **NON cambiare mai il campo `id` di un giocatore esistente**
- Romperebbe tutti i riferimenti in matches/bookings
- Statistiche e ranking andrebbero persi

❌ **NON usare `userId` nei nuovi matches**
- Usa sempre `id` (ID documento) per consistenza

## 🔧 Migrazione Necessaria

Se hai già cambiato il campo `id` durante il collegamento:

1. Trova il vecchio `id` (salvato in `previousUserId`)
2. Ripristina `id` al valore originale
3. Mantieni `userId` con il Firebase UID

```javascript
// Script di ripristino
{
  id: previousUserId,           // Ripristina ID originale
  userId: "firebase_uid_xyz",   // Mantieni Firebase UID
  previousUserId: undefined,    // Rimuovi campo temporaneo
}
```

## 📝 Checklist Implementazione

- [x] Schema profilo giocatore definito
- [ ] Funzione `linkOrphanProfile` aggiornata (NON modificare `id`)
- [ ] Query matches/bookings verificate (usano `id`)
- [ ] Query statistiche verificate (usano `id`)
- [ ] Push notifications verificate (usano `userId`)
- [ ] Test end-to-end completati

## 🚀 Prossimi Passi

1. Verificare Andrea Paris:
   - Controllare se `id` è stato modificato
   - Se sì, ripristinare `id` originale
   - Verificare che matches usino l'`id` corretto

2. Aggiornare `linkOrphanProfile`:
   - Modificare solo `userId`
   - Non toccare `id`
   - Non serve aggiornare references

3. Testare flusso completo:
   - Creare profilo orfano
   - Collegare a Firebase user
   - Verificare matches/statistiche
   - Testare push notifications
