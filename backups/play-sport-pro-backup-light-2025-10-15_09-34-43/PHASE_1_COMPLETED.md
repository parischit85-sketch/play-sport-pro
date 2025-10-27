# ✅ FASE 1 COMPLETATA: Foundation & Users

## 🎯 COSA ABBIAMO FATTO

### ✅ Step 1.1: Creato nuovo servizio `users.js`
- **File**: `src/services/users.js`
- **Funzioni**: `getUser`, `createUser`, `updateUser`, `createUserIfNeeded`
- **Schema nuovo**: 
  ```javascript
  users/{uid} {
    email, displayName, firstName, lastName,
    globalRole, status, isActive,
    registeredAt, lastLoginAt,
    phone, avatar, bio, dateOfBirth,
    version, createdAt, updatedAt
  }
  ```

### ✅ Step 1.2: Aggiornato AuthContext
- **File**: `src/services/auth.jsx`
- **Modifiche**: 
  - `getUserProfile` → usa `getUser` da `users.js`
  - `createUserProfileIfNeeded` → usa `createUserIfNeeded`
  - `saveUserProfile` → usa `updateUser`
- **Cache aggiornata**: da `_profileCache` a `_userCache`

### ✅ Step 1.3: Script migrazione pronto
- **File**: `migrate-profiles-to-users.cjs`
- **Funzione**: Copia dati da `profiles` → `users`
- **Status**: Pronto per esecuzione quando database accessibile

## 🧪 TESTING FASE 1

**Cosa testare ora:**

1. **Login/Registrazione** → Dovrebbe creare utente in `users` collection
2. **Profilo utente** → Dovrebbe leggere da `users/{uid}`
3. **AuthContext** → Dovrebbe funzionare senza errori
4. **Console logs** → Verificare che non cerchi più `profiles`

**Se tutto funziona:**
- ✅ FASE 1 completata
- 🚀 Pronto per FASE 2

---

# 🚀 FASE 2: Affiliations & Roles

## 🎯 OBIETTIVO FASE 2

**Ristrutturare sistema affiliazioni e ruoli:**

### Problema attuale:
- Affiliazioni: struttura confusa tra collezioni diverse
- Ruoli: mixed tra profili e custom claims
- Club admin: non redirect automatico consistente

### Schema target:
```javascript
affiliations/{affiliationId} {
  userId: string,
  clubId: string,
  role: "member" | "instructor" | "admin", 
  status: "pending" | "approved" | "rejected",
  requestedAt: timestamp,
  approvedAt: timestamp,
  approvedBy: userId,
  permissions: {}  // Permessi specifici
}
```

## 📋 PLAN FASE 2

### Step 2.1: Nuovo servizio `affiliations.js`
- Gestione affiliazioni unificate
- Funzioni per ruoli e permessi
- Query ottimizzate per club

### Step 2.2: Aggiornare AuthContext
- Logica ruoli basata su affiliazioni
- Redirect automatico club admin
- Gestione permessi granulari

### Step 2.3: Script migrazione affiliazioni
- Consolidare affiliazioni esistenti
- Normalizzare ruoli
- Pulire duplicati

### Step 2.4: Aggiornare UI components
- Navigation basata su ruoli
- Interfacce specifiche per tipo utente
- Gestione stato affiliazioni

## ✅ SUCCESS CRITERIA FASE 2

- [ ] Utenti semplici: possono affiliarsi ai club
- [ ] Istruttori: vedono funzioni extra nei loro club
- [ ] Club admin: redirect automatico al loro club  
- [ ] Interfacce diverse per ogni ruolo
- [ ] Permessi granulari funzionanti

---

## 🤔 PROSSIMA DECISIONE

**Vuoi procedere con FASE 2 o verificare prima che FASE 1 funzioni correttamente?**

### Opzione A: Test FASE 1
- Verificare che login crei utente in `users`
- Controllare che profilo si carichi da `users`
- Debug eventuali problemi

### Opzione B: Proseguire FASE 2  
- Iniziare subito con `affiliations.js`
- Parallelizzare sviluppo e test

**Cosa preferisci?** 🚀