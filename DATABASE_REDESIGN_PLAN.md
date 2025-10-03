# 🗄️ RIPROGETTAZIONE DATABASE PLAYSPORT PRO
## Approccio Incrementale

---

## 🎯 OBIETTIVO FINALE

**Logica Utenti PlaySport:**
1. **Utenti Semplici** → Registrazione → Affiliazione circoli → Prenotazioni/Lezioni/Campionati
2. **Istruttori** → Utenti + funzionalità extra nei circoli dove sono nominati
3. **Club Admin** → Redirect automatico → Dashboard amministrativa completa

---

## 📊 SCHEMA DATABASE RIPROGETTATO

### 🔑 COLLEZIONI PRINCIPALI

```
users/{uid}                    # Profilo utente globale
├── email, displayName, phone
├── registeredAt, lastLoginAt
├── globalRole: "user" | "super_admin" 
└── isActive: boolean

clubs/{clubId}                 # Dati circolo
├── name, address, phone, email
├── isActive, settings
├── createdAt, updatedAt
└── adminUserId                # Chi è l'admin principale

affiliations/{affiliationId}   # Collegamento User ↔ Club
├── userId, clubId
├── role: "member" | "instructor" | "admin"
├── status: "pending" | "approved" | "rejected"
├── requestedAt, approvedAt
├── approvedBy
└── permissions: {}            # Permessi specifici

bookings/{bookingId}           # Prenotazioni unificate
├── clubId, userId, courtId
├── date, startTime, endTime
├── type: "court" | "lesson"
├── status: "confirmed" | "cancelled"
├── participants: [userId]     # Array partecipanti
└── metadata: {}               # Dati specifici (istruttore per lezioni, etc)

matches/{matchId}              # Partite disputate
├── clubId, bookingId
├── teamA: [userId1, userId2]
├── teamB: [userId3, userId4]
├── sets: [{scoreA, scoreB}]
├── winner: "A" | "B"
├── playedAt
└── createdBy                  # Chi ha inserito il risultato

courts/{courtId}               # Campi (globali con clubId)
├── clubId, name
├── isActive, type
├── pricing: {}
└── availability: {}

tournaments/{tournamentId}     # Tornei per club
├── clubId, name, type
├── participants: [userId]
├── status, startDate, endDate
└── matches: [matchId]
```

---

## 🚀 PIANO MIGRAZIONE INCREMENTALE

### FASE 1: Foundation & Users ✅
- [ ] Creare collezione `users` unificata
- [ ] Migrare dati da `profiles` esistenti
- [ ] Aggiornare AuthContext per nuova struttura
- [ ] Test: registrazione/login funzionano

### FASE 2: Affiliations & Roles
- [ ] Ristrutturare `affiliations` con nuovo schema
- [ ] Implementare logica ruoli (member/instructor/admin)
- [ ] Aggiornare logica redirect automatico club admin
- [ ] Test: ogni tipo utente vede interfaccia corretta

### FASE 3: Bookings Unification
- [ ] Unificare `bookings` (court + lesson in una collezione)
- [ ] Migrare bookings esistenti nel nuovo formato
- [ ] Aggiornare componenti prenotazione
- [ ] Test: prenotazioni funzionano per tutti i tipi

### FASE 4: Matches & Stats
- [ ] Separare `matches` da `bookings`
- [ ] Ristrutturare matches con teamA/teamB corretto
- [ ] Aggiornare statistiche per nuovo formato
- [ ] Test: classifiche e statistiche funzionano

### FASE 5: Security & Production
- [ ] Implementare Firestore rules per nuova struttura
- [ ] Validazione permessi per ruolo
- [ ] Clean up codice legacy
- [ ] Test completo tutti i flussi

---

## 🔧 VANTAGGI NUOVO SCHEMA

**Separazione chiara:**
- `users` = dati utente (globali)
- `affiliations` = relazione user ↔ club con ruoli
- `bookings` = prenotazioni (court/lesson unificate)
- `matches` = solo partite disputate con risultati

**Permessi granulari:**
- Club admin vede solo il suo club
- Istruttori hanno accesso limitato dove sono nominati
- Utenti vedono solo dove sono affiliati

**Scalabilità:**
- Ogni club indipendente
- Aggiunta nuovi club semplice
- Performance ottimizzate (query per clubId)

---

## ⚡ PROSSIMO STEP

**Iniziamo con FASE 1 - Foundation & Users:**
1. Analizzare dati esistenti in `profiles`
2. Progettare migrazione a `users` unificata
3. Aggiornare AuthContext per leggere da `users`

**Procediamo con la FASE 1?** 🚀