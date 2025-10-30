# Portale Amministrativo PlaySport

## Panoramica

Il portale amministrativo di PlaySport è una sezione separata dell'applicazione che consente agli amministratori del servizio di gestire circoli, utenti e configurazioni di sistema.

## Caratteristiche Principali

### 🔐 **Autenticazione Sicura**
- Login separato dal sistema utenti normale
- Accesso limitato agli admin autorizzati
- Controllo ruoli integrato

### 🏢 **Gestione Circoli Completa**
- ✅ Visualizzazione di tutti i circoli registrati
- ✅ Statistiche dettagliate per ogni circolo
- ✅ **Creazione nuovi circoli** con form completo
- ✅ **Modifica circoli esistenti** con tutti i dettagli
- ✅ **Eliminazione sicura** con conferma
- ✅ **Configurazioni avanzate** per ogni circolo

### 👥 **Gestione Utenti Avanzata**
- ✅ Elenco completo degli utenti registrati
- ✅ Visualizzazione affiliazioni per circolo
- ✅ **Modifica profili utenti** (nome, email, telefono, note)
- ✅ **Attivazione/Disattivazione utenti**
- ✅ **Promozione utenti ad amministratori** di circolo
- ✅ Gestione ruoli e permessi completa

### 📊 **Dashboard & Analytics Avanzate**
- ✅ **Statistiche in tempo reale** di sistema
- ✅ **Grafici di crescita** circoli e prenotazioni
- ✅ **Classifica circoli più attivi**
- ✅ **Analytics dettagliate** per utenti e attività
- ✅ **Attività recente** con timestamp
- ✅ **Trend e percentuali** di crescita

### ⚙️ **Configurazioni Avanzate Circoli**
- ✅ **Impostazioni generali**: nome, indirizzo, contatti, sito web
- ✅ **Struttura**: numero campi, orari, durata slot
- ✅ **Prezzi**: tariffe feriali/weekend, sconti soci, caparre
- ✅ **Prenotazioni**: regole anticipo, durate min/max, ospiti
- ✅ **Notifiche**: email/SMS, promemoria personalizzabili
- ✅ **Aspetto**: colori personalizzati, logo
- ✅ **Sicurezza**: approvazioni automatiche, controllo accessi

## Accesso al Portale

### URL di Accesso
- **Login**: `/admin/login`
- **Dashboard**: `/admin/dashboard`
- **Gestione Circoli**: `/admin/clubs`
- **Configurazioni Circolo**: `/admin/clubs/{clubId}/settings`
- **Gestione Utenti**: `/admin/users`

### Credenziali Autorizzate
Gli seguenti email sono autorizzati all'accesso admin:
- `paris.andrea@live.it`
- `admin@playsport.it`

*Per aggiungere nuovi admin, modifica l'array `AUTHORIZED_ADMINS` in:*
- `src/pages/admin/AdminLogin.jsx`
- `src/components/admin/AdminProtectedRoute.jsx`

## Struttura del Codice

```
src/
├── pages/admin/
│   ├── AdminLogin.jsx          # Pagina di login admin
│   ├── AdminDashboard.jsx      # Dashboard con analytics avanzate
│   ├── ClubsManagement.jsx     # Gestione completa circoli
│   ├── ClubSettings.jsx        # Configurazioni avanzate circoli
│   └── UsersManagement.jsx     # Gestione dettagliata utenti
├── components/admin/
│   └── AdminProtectedRoute.jsx # Protezione route admin
└── layouts/
    └── AppLayout.jsx           # Pulsante accesso admin
```

## Funzionalità Disponibili

### ✅ **Implementate e Funzionanti**
- [x] Login admin sicuro con email autorizzate
- [x] Dashboard con statistiche in tempo reale
- [x] **Creazione nuovi circoli** con form completo
- [x] **Modifica circoli esistenti** con tutti i dettagli
- [x] **Eliminazione circoli** con conferma di sicurezza
- [x] **Configurazioni avanzate circoli** (7 sezioni: generale, struttura, prezzi, prenotazioni, notifiche, aspetto, sicurezza)
- [x] **Modifica profili utenti** (nome, email, telefono, note, attivazione)
- [x] **Promozione utenti ad admin** circolo
- [x] **Disattivazione utenti** con conferma
- [x] **Analytics avanzate** con grafici e trend
- [x] **Classifica circoli** più attivi
- [x] **Attività recente** con timestamp
- [x] Routing protetto e sicuro
- [x] Integrazione nel layout principale
- [x] **Statistiche dettagliate** per ogni circolo

### � **Funzionalità Avanzate Attive**
- [x] **Dashboard Analytics**: Grafici di crescita, trend percentuali, top circoli
- [x] **Gestione Circoli Completa**: CRUD completo + configurazioni avanzate
- [x] **Gestione Utenti Avanzata**: Modifica profili, ruoli, attivazione/disattivazione
- [x] **Configurazioni Dettagliate**: 7 sezioni di configurazione per ogni circolo
- [x] **Sistema di Sicurezza**: Controlli avanzati per accesso e modifiche

### 🔄 **Possibili Miglioramenti Futuri**
- [ ] Export dati in Excel/PDF
- [ ] Backup automatico database
- [ ] Notifiche push admin
- [ ] Log dettagliato azioni admin
- [ ] Multi-lingua per interfaccia admin
- [ ] Gestione template email
- [ ] Sistema di reportistica avanzata

## Sicurezza

### Controlli di Accesso
1. **Autenticazione Firebase**: L'utente deve essere autenticato
2. **Lista Autorizzati**: Email deve essere nell'array `AUTHORIZED_ADMINS`
3. **Route Protection**: Tutte le route admin sono protette
4. **Auto-logout**: Utenti non autorizzati vengono disconnessi automaticamente

### Best Practices
- Le credenziali sono verificate sia nel login che nelle route protette
- Logout automatico per utenti non autorizzati
- Separazione completa dal sistema utenti normale
- Monitoraggio accessi (da implementare)

## Come Utilizzare

### 1. Accesso al Portale
1. Vai su **http://localhost:5173/admin/login**
2. Inserisci email e password di un account autorizzato
3. Verrai reindirizzato alla dashboard admin con analytics complete

### 2. **Gestione Circoli Completa**
1. Dalla dashboard, clicca "Gestione Circoli"
2. **Crea Nuovo Circolo**: Clicca "+Nuovo Circolo" e compila il form completo
3. **Modifica Circolo**: Clicca l'icona "Modifica" su qualsiasi circolo
4. **Configurazioni Avanzate**: Clicca l'icona "Configurazioni" per accedere alle 7 sezioni:
   - **Generale**: Nome, indirizzo, contatti, sito web
   - **Struttura**: Campi, orari, durata slot
   - **Prezzi**: Tariffe, sconti, caparre
   - **Prenotazioni**: Regole anticipo, durate, ospiti
   - **Notifiche**: Email/SMS, promemoria
   - **Aspetto**: Colori, logo personalizzati
   - **Sicurezza**: Approvazioni, controllo accessi
5. **Elimina Circolo**: Clicca l'icona "Elimina" con conferma di sicurezza

### 3. **Gestione Utenti Avanzata**
1. Dalla dashboard, clicca "Gestione Utenti"
2. **Modifica Utente**: Clicca l'icona "Modifica" per:
   - Cambiare nome visualizzato, email, telefono
   - Aggiungere note amministrative
   - Attivare/disattivare account
   - Visualizzare tutte le affiliazioni
3. **Gestisci Ruoli**: Clicca l'icona "Gestisci Ruoli" per promuovere ad admin
4. **Disattiva Utente**: Clicca l'icona "Disattiva" con conferma
5. **Filtra per Circolo**: Usa il dropdown per filtrare utenti per circolo

### 4. **Dashboard Analytics**
1. **Statistiche in Tempo Reale**: Visualizza totali con trend percentuali
2. **Grafici di Crescita**: Monitora crescita circoli e prenotazioni mensili
3. **Top Circoli**: Classifica dei circoli più attivi
4. **Attività Recente**: Timeline delle ultime attività con timestamp
5. **Utenti per Circolo**: Distribuzione utenti tra i circoli

### 5. **Configurazioni Avanzate Circolo**
1. Nella gestione circoli, clicca "Configurazioni" su un circolo
2. Naviga tra le 7 sezioni usando il menu laterale
3. **Salva Modifiche**: Le modifiche sono persistenti nel database
4. **Configurazioni Personalizzate**: Ogni circolo può avere configurazioni uniche

## Accesso Rapido

Quando sei loggato come admin autorizzato, apparirà un pulsante "🛡️ Admin" nel header dell'applicazione principale che ti porterà direttamente alla dashboard admin.

## Configurazione Firestore

Il portale utilizza le seguenti collezioni Firestore:
- `clubs/` - Dati dei circoli
- `clubs/{clubId}/profiles/` - Profili utenti per circolo
- `clubs/{clubId}/affiliations/` - Affiliazioni utenti
- `clubs/{clubId}/matches/` - Partite per circolo
- `clubs/{clubId}/bookings/` - Prenotazioni per circolo

## Support e Sviluppo

Per aggiungere nuove funzionalità o modificare il portale:

1. **Nuove Pagine**: Aggiungi in `src/pages/admin/`
2. **Nuove Route**: Modifica `src/router/AppRouter.jsx`
3. **Nuovi Admin**: Aggiorna `AUTHORIZED_ADMINS`
4. **Nuovi Componenti**: Usa `src/components/admin/`

Il portale è progettato per essere facilmente estendibile e mantenere la separazione con il sistema utenti normale.