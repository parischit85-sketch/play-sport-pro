# 🚀 FASE 1: FOUNDATION & USERS
## Migrazione Database - Step by Step

---

## 📊 DATI ATTUALI IDENTIFICATI

**Dal ClubContext log sappiamo:**
- ✅ 33 affiliazioni per sporting-cat (approved)
- ✅ 32 profili giocatori caricati correttamente
- ✅ 43 bookings totali per sporting-cat
- ✅ 3 partite identificate (con players array)

---

## 🎯 OBIETTIVO FASE 1

**Creare collezione `users` unificata che sostituisca `profiles`:**

```javascript
// VECCHIO SCHEMA (attuale)
profiles/{userId} {
  firstName, lastName, displayName,
  email, phone, 
  // altri campi specifici profilo
}

// NUOVO SCHEMA (target)
users/{userId} {
  // Campi base utente
  email: string,
  displayName: string, 
  firstName: string,
  lastName: string,
  phone?: string,
  
  // Metadata sistema
  globalRole: "user" | "super_admin",
  isActive: boolean,
  registeredAt: timestamp,
  lastLoginAt: timestamp,
  
  // Profile data
  avatar?: string,
  bio?: string,
  dateOfBirth?: date,
  
  // Sistema
  version: 1
}
```

---

## ⚡ IMPLEMENTAZIONE STEP-BY-STEP

### STEP 1.1: Creare Service Users
Creiamo un nuovo servizio per gestire la collezione `users` unificata.

### STEP 1.2: Aggiornare AuthContext  
Modificare AuthContext per leggere da `users` invece di `profiles`.

### STEP 1.3: Migration Script
Script per copiare dati da `profiles` esistenti a `users`.

### STEP 1.4: Update Components
Aggiornare tutti i componenti che usano dati profilo.

### STEP 1.5: Testing
Verificare che login/registrazione funzionino con nuova struttura.

---

## 🔧 VANTAGGI NUOVO SCHEMA USERS

1. **Separazione netta**: `users` = dati globali, `affiliations` = relazioni club
2. **Scalabilità**: Facile aggiungere campi globali
3. **Performance**: Query più efficienti
4. **Sicurezza**: Permessi più granulari
5. **Manutenibilità**: Codice più pulito

---

## ✅ SUCCESS CRITERIA FASE 1

- [ ] AuthContext legge da `users` invece di `profiles`
- [ ] Registrazione crea utente in `users`
- [ ] Login carica dati da `users`
- [ ] Componenti mostrano displayName da `users`
- [ ] Nessun errore console per paths inesistenti

**Procediamo con STEP 1.1?** 🚀