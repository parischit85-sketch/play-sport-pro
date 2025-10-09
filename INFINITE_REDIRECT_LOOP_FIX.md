# Fix: Loop Infinito di Redirect per Club Admin

## 🚨 Problema Rilevato

**Data**: 8 Ottobre 2025  
**Gravità**: CRITICA - Loop infinito causava freeze dell'applicazione

### Sintomi

L'applicazione entrava in un **loop infinito** di navigazione tra due route:

1. `/dashboard` → viene renderizzato
2. Reindirizza a `/club/sporting-cat/admin/dashboard`
3. `/club/sporting-cat/admin/dashboard` → viene renderizzato
4. Ritorna a `/dashboard`
5. **Si ripete infinitamente** (circa ogni 200ms)

Console log mostrava:
```
🛡️ [ProtectedRoute] Rendering: /dashboard
📍 [AppLayout] Route changed: /dashboard
🛡️ [ProtectedRoute] Rendering: /club/sporting-cat/admin/dashboard
📍 [AppLayout] Route changed: /club/sporting-cat/admin/dashboard
🛡️ [ProtectedRoute] Rendering: /dashboard
... (infinito)
```

## 🔍 Causa Root

### Problema 1: Fallback Forzato a Sporting Cat

**File**: `src/hooks/useClubAdminRedirect.js` (righe 71-75 - versione precedente)

```javascript
// ❌ VECCHIO CODICE
if (clubAdminRoles.length === 0) {
  if (userRole === 'super_admin' || userRole === 'club_admin') {
    clubAdminRoles = [['sporting-cat', 'CLUB_ADMIN']]; // ← LOOP!
  }
}
```

**Problema**: 
- Questo codice forzava **SEMPRE** il redirect a `sporting-cat` per qualsiasi utente con role `club_admin`
- Anche se l'utente NON era admin di sporting-cat
- Causava loop perché l'app tentava di caricare sporting-cat, falliva, tornava a /dashboard, e ripartiva

### Problema 2: setTimeout nel Navigate

**File**: `src/hooks/useClubAdminRedirect.js` (righe 85-87 - versione precedente)

```javascript
// ❌ VECCHIO CODICE  
setTimeout(() => {
  navigate(adminDashboardPath, { replace: true });
}, 100);
```

**Problema**:
- Il timeout di 100ms creava race conditions
- Durante l'attesa, il `location.pathname` poteva cambiare
- Causava navigazioni multiple e loop

### Problema 3: Controllo Duplicato Location

**File**: `src/hooks/useClubAdminRedirect.js` (righe 28-36 - versione precedente)

```javascript
// ❌ VECCHIO CODICE
if (location.pathname !== '/dashboard') {
  return;
}

// Controllo ridondante che non funzionava
if (location.pathname.includes('/club/') && location.pathname.includes('/admin/dashboard')) {
  return;
}
```

**Problema**:
- Il secondo controllo era ridondante e non impediva il loop
- Non proteggeva dalle navigazioni causate dal setTimeout

## ✅ Soluzione Implementata

### Fix 1: Rimosso Fallback Forzato

```javascript
// ✅ NUOVO CODICE
// METODO 2: Se userClubRoles è vuoto ma userRole è club_admin, usa currentClub
if (!targetClubId && userRole === 'club_admin') {
  // currentClub è direttamente il clubId (stringa), non un oggetto
  if (currentClub) {
    targetClubId = currentClub;
  }
  // Fallback: localStorage
  else {
    try {
      const storedClubId = localStorage.getItem('currentClub');
      if (storedClubId && storedClubId !== 'null' && storedClubId !== 'undefined') {
        targetClubId = storedClubId;
      }
    } catch (error) {
      console.error('[useClubAdminRedirect] Error reading localStorage:', error);
    }
  }
}
// NON più fallback forzato a sporting-cat
```

**Benefici**:
- ✅ Supporta **multi-club**: ogni admin viene reindirizzato al SUO club
- ✅ Usa `currentClub` da AuthContext (impostato automaticamente)
- ✅ Fallback a localStorage solo se necessario
- ✅ **NO redirect** se l'utente non è admin di alcun club

### Fix 2: Rimosso setTimeout

```javascript
// ✅ NUOVO CODICE
// Naviga immediatamente senza timeout per evitare loop
navigate(adminDashboardPath, { replace: true });
```

**Benefici**:
- ✅ Navigazione **sincrona e immediata**
- ✅ Nessuna race condition
- ✅ `replace: true` previene navigazioni multiple nello stack

### Fix 3: Semplificato Controllo Location

```javascript
// ✅ NUOVO CODICE
// Solo reindirizza se siamo esattamente sulla dashboard principale
// Se siamo già su qualsiasi altra route, non fare nulla
if (location.pathname !== '/dashboard') {
  return;
}
```

**Benefici**:
- ✅ Un solo controllo chiaro e semplice
- ✅ Evita controlli ridondanti
- ✅ Facile da capire e mantenere

## 🎯 Architettura Multi-Club

### Come Funziona Ora

1. **Login Utente** → AuthContext carica le membership
2. **getUserClubMemberships()** → cerca in tutti i club l'utente
3. **Se club_admin di 1 solo club** → `currentClub` viene impostato automaticamente
4. **useClubAdminRedirect** → legge `currentClub` e reindirizza

### Flusso per Utente Club Admin

```
┌─────────────────────┐
│  User Login         │
│  padel2@gmail.com   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  AuthContext.loadUserAffiliations   │
│  • Chiama getUserClubMemberships()  │
│  • Trova: UIklVCfK9lyVYDNFBx94     │
│    (Padel2)                         │
│  • Role: club_admin                 │
└──────────┬──────────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  setCurrentClub(clubId)          │
│  currentClub = "UIklVCfK9..."    │
│  localStorage.setItem(...)       │
└──────────┬───────────────────────┘
           │
           ▼
┌───────────────────────────────────────┐
│  useClubAdminRedirect                 │
│  • Legge currentClub                  │
│  • targetClubId = currentClub         │
│  • navigate('/club/UIklVCfK.../...') │
└───────────────────────────────────────┘
```

## 📊 Dati del Problema

### Utente Affetto

- **User ID**: `GGZeE3zn1GcsqxhCMDu1lEE2pwB2`
- **Email**: `padel2@gmail.com`
- **Role**: `club_admin`
- **Club ID**: `UIklVCfK9lyVYDNFBx94` (Padel2)
- **Problema**: `getUserClubMemberships` ritornava **0 risultati** → mancavano documenti in:
  - `clubs/{clubId}/profiles/{userId}` (membership)
  - `affiliations/{userId_clubId}` (affiliation)

### Fix Dati Richiesto

Per utenti club_admin che hanno il loop, verificare che esistano:

1. **Documento User**:
   ```
   users/GGZeE3zn1GcsqxhCMDu1lEE2pwB2
   {
     role: "club_admin",
     clubId: "UIklVCfK9lyVYDNFBx94"  // ← importante
   }
   ```

2. **Documento Profile nel Club**:
   ```
   clubs/UIklVCfK9lyVYDNFBx94/profiles/GGZeE3zn1GcsqxhCMDu1lEE2pwB2
   {
     role: "club_admin",
     status: "active"
   }
   ```

3. **Documento Affiliation** (opzionale ma raccomandato):
   ```
   affiliations/GGZeE3zn1GcsqxhCMDu1lEE2pwB2_UIklVCfK9lyVYDNFBx94
   {
     userId: "GGZeE3zn1GcsqxhCMDu1lEE2pwB2",
     clubId: "UIklVCfK9lyVYDNFBx94",
     role: "club_admin",
     status: "approved"
   }
   ```

## 🧪 Test

### Test Case 1: Club Admin con Membership Valida
- ✅ Login → redirect automatico a `/club/{clubId}/admin/dashboard`
- ✅ NO loop
- ✅ Dashboard admin carica correttamente

### Test Case 2: Club Admin Senza Membership
- ✅ Login → rimane su `/dashboard`
- ✅ Console warning con dettagli debug
- ✅ NO crash, NO loop

### Test Case 3: User Normale (non admin)
- ✅ Login → rimane su `/dashboard`
- ✅ NO redirect
- ✅ Può navigare liberamente

### Test Case 4: Admin di Multiple Clubs (futuro)
- ⏳ Login → rimane su `/dashboard`
- ⏳ Mostra club selector
- ⏳ User sceglie club → naviga manualmente

## 📝 File Modificati

### 1. `src/hooks/useClubAdminRedirect.js`
- ✅ Rimosso fallback forzato a sporting-cat
- ✅ Usa `currentClub` da AuthContext
- ✅ Rimosso setTimeout
- ✅ Semplificato controllo location
- ✅ Aggiunti log di debug

### 2. `src/pages/admin/UsersManagement.jsx`
- ✅ Fix affiliation updateDoc → setDoc con merge:true (righe 255, 181)

### 3. `src/services/affiliations.js`
- ✅ Fix affiliation updateDoc → setDoc con merge:true (righe 178, 287)

## 🔄 Related Fixes

Questo fix fa parte di una serie di miglioramenti:

1. ✅ **INFINITE_LOOP_FIX.md** - Fix duplicate useClubAdminRedirect in DashboardPage
2. ✅ **AFFILIATIONS_COLLECTION_FIX.md** - Fix updateDoc → setDoc per affiliations
3. ✅ **INFINITE_REDIRECT_LOOP_FIX.md** - Questo documento (loop redirect)

## 📚 Lessons Learned

1. **Never hardcode club IDs** - usa sempre dati dinamici
2. **Avoid setTimeout in navigation** - causa race conditions
3. **Single source of truth** - usa AuthContext per currentClub
4. **Test with real multi-club data** - non solo sporting-cat
5. **Document data requirements** - membership, profiles, affiliations devono essere sincronizzati
6. **Add defensive logging** - aiuta debugging di problemi simili

## ⚠️ Action Items

- [ ] Verificare membership di tutti i club_admin esistenti
- [ ] Creare script di migrazione per fix bulk data
- [ ] Aggiungere unit test per multi-club redirect
- [ ] Documentare processo onboarding nuovo club admin
- [ ] Monitorare console warning `User is club_admin but no club found`

## 🎉 Risultato

✅ **Loop infinito eliminato**  
✅ **Multi-club funzionante**  
✅ **Redirect automatico corretto**  
✅ **Performance migliorata** (no più timeout)  
✅ **Codice più pulito e manutenibile**
