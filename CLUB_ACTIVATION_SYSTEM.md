# Sistema di Attivazione Circoli - Super Admin

## Panoramica

Implementato sistema completo per la gestione dell'attivazione/disattivazione dei circoli da parte del super-admin. I circoli appena registrati rimangono invisibili agli utenti finali fino a quando non vengono attivati dal super-admin.

## Workflow

### 1. Registrazione Circolo
- Il circolo si registra tramite `/register-club`
- Viene creato automaticamente:
  - Account Firebase Auth
  - Documento club con `status: 'pending'` e `isActive: false`
  - Profilo utente con `role: 'club-admin'`
  - Profilo admin del circolo
- Il club-admin può accedere immediatamente alla dashboard `/clubs/{clubId}`
- Il circolo NON è visibile agli utenti pubblici

### 2. Approvazione Super Admin
- Il super-admin accede a `/admin/clubs`
- Visualizza tutti i circoli con badge di stato:
  - 🟡 **In Attesa** - Circolo appena registrato (isActive: false, status: pending)
  - 🟢 **Attivo** - Circolo approvato e visibile (isActive: true, status: approved)
  - 🔴 **Disattivato** - Circolo disattivato manualmente (isActive: false, status: pending)

### 3. Azioni Super Admin
- **Attiva Circolo**: Cambia `isActive: true` e `status: 'approved'` → visibile agli utenti
- **Disattiva Circolo**: Cambia `isActive: false` e `status: 'pending'` → non visibile agli utenti
- **Conferma richiesta**: Dialog di conferma con nome del circolo

## Componenti Modificati

### `src/pages/admin/ClubsManagement.jsx`

#### Nuovi Stati
```javascript
const [statusFilter, setStatusFilter] = useState('all'); // all, pending, active, inactive
```

#### Nuova Funzione: `handleToggleActive`
```javascript
const handleToggleActive = async (clubId, clubName, currentStatus) => {
  const newStatus = !currentStatus;
  const action = newStatus ? 'attivare' : 'disattivare';
  
  if (!window.confirm(`Confermi di voler ${action} il circolo "${clubName}"?`)) {
    return;
  }

  await updateDoc(doc(db, 'clubs', clubId), {
    isActive: newStatus,
    status: newStatus ? 'approved' : 'pending',
    updatedAt: serverTimestamp(),
  });

  await loadClubs();
  alert(`Circolo ${newStatus ? 'attivato' : 'disattivato'} con successo!`);
};
```

#### Filtri Avanzati
```javascript
const filteredClubs = clubs
  .filter((club) => {
    // Filtro per testo di ricerca
    const matchesSearch = club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.city?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro per stato
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending') return matchesSearch && (!club.isActive || club.status === 'pending');
    if (statusFilter === 'active') return matchesSearch && club.isActive === true;
    if (statusFilter === 'inactive') return matchesSearch && club.isActive === false && club.status !== 'pending';
    
    return matchesSearch;
  });
```

#### UI Aggiornata

**Badge di Stato nel ClubCard:**
```jsx
const getStatusBadge = () => {
  if (isPending) {
    return <span className="...bg-yellow-100 text-yellow-800">In Attesa</span>;
  }
  if (isActive) {
    return <span className="...bg-green-100 text-green-800">Attivo</span>;
  }
  if (isInactive) {
    return <span className="...bg-red-100 text-red-800">Disattivato</span>;
  }
};
```

**Pulsante Toggle:**
```jsx
<button
  onClick={() => handleToggleActive(club.id, club.name, club.isActive)}
  className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
    club.isActive
      ? 'bg-red-50 text-red-700 hover:bg-red-100'
      : 'bg-green-50 text-green-700 hover:bg-green-100'
  }`}
>
  {club.isActive ? 'Disattiva Circolo' : 'Attiva Circolo'}
</button>
```

**Filtri per Stato:**
```jsx
<div className="flex gap-2">
  <button onClick={() => setStatusFilter('all')}>Tutti</button>
  <button onClick={() => setStatusFilter('pending')}>In Attesa</button>
  <button onClick={() => setStatusFilter('active')}>Attivi</button>
  <button onClick={() => setStatusFilter('inactive')}>Disattivati</button>
</div>
```

**Riepilogo Statistiche:**
```jsx
<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
  <div>
    <p className="text-2xl font-bold text-blue-600">{clubs.length}</p>
    <p className="text-sm text-gray-600">Totali</p>
  </div>
  <div>
    <p className="text-2xl font-bold text-yellow-600">
      {clubs.filter(c => !c.isActive || c.status === 'pending').length}
    </p>
    <p className="text-sm text-gray-600">In Attesa</p>
  </div>
  <div>
    <p className="text-2xl font-bold text-green-600">
      {clubs.filter(c => c.isActive === true).length}
    </p>
    <p className="text-sm text-gray-600">Attivi</p>
  </div>
  <div>
    <p className="text-2xl font-bold text-red-600">
      {clubs.filter(c => c.isActive === false && c.status !== 'pending').length}
    </p>
    <p className="text-sm text-gray-600">Disattivati</p>
  </div>
  <div>
    <p className="text-2xl font-bold text-purple-600">
      {clubs.reduce((sum, club) => sum + (club.stats?.members || 0), 0)}
    </p>
    <p className="text-sm text-gray-600">Membri</p>
  </div>
</div>
```

## Struttura Dati Firestore

### Collezione `clubs`
```javascript
{
  id: string,
  name: string,
  address: string,
  city: string,
  phone: string,
  email: string,
  status: 'pending' | 'approved',  // Cambiato da super-admin
  isActive: boolean,                // Controlla visibilità pubblica
  ownerId: string,                  // UID del club-admin
  ownerEmail: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,             // Aggiornato ad ogni cambio stato
  // ... altri campi
}
```

## Regole di Visibilità

### Per Utenti Pubblici
- Possono vedere SOLO circoli con `isActive: true`
- Circoli in attesa o disattivati NON appaiono in ricerche/liste

### Per Club Admin (Owner)
- Può accedere SEMPRE al proprio circolo tramite `/clubs/{clubId}`
- Anche se `isActive: false`, il proprietario può configurare il circolo
- Riceve notifica che il circolo è in attesa di approvazione

### Per Super Admin
- Vede TUTTI i circoli indipendentemente dallo stato
- Può attivare/disattivare qualsiasi circolo
- Vede statistiche aggregate per stato

## Firestore Rules Richieste

```javascript
// TODO: Aggiornare firestore.rules
match /clubs/{clubId} {
  // Lettura pubblica solo se attivo
  allow read: if resource.data.isActive == true;
  
  // Owner può sempre leggere il proprio circolo
  allow read: if request.auth.uid == resource.data.ownerId;
  
  // Super-admin può tutto
  allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super-admin';
  
  // Owner può aggiornare (ma non isActive o status)
  allow update: if request.auth.uid == resource.data.ownerId 
                && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['isActive', 'status']);
}
```

## UX Flow

### Registrazione Circolo
1. Utente clicca "Registrati" → Modal scelta tipo
2. Seleziona "Registra il tuo Circolo"
3. Compila 4 step: Account → Info → Contatti → Logo
4. Sottomette form → Account creato
5. Redirect automatico a `/clubs/{clubId}`
6. Vede messaggio: "Circolo in attesa di approvazione"

### Approvazione Super Admin
1. Super-admin accede `/admin/clubs`
2. Vede card con badge "In Attesa" (giallo)
3. Clicca "Attiva Circolo" (verde)
4. Conferma nel dialog
5. Badge diventa "Attivo" (verde)
6. Circolo ora visibile a tutti

### Disattivazione
1. Super-admin vede card con badge "Attivo" (verde)
2. Clicca "Disattiva Circolo" (rosso)
3. Conferma nel dialog
4. Badge diventa "Disattivato" (rosso)
5. Circolo sparisce dalla vista pubblica

## Miglioramenti Futuri

### Notifiche
- [ ] Email al club-admin quando circolo viene attivato
- [ ] Email al super-admin quando nuovo circolo si registra
- [ ] Notifica in-app per cambio stato

### Audit Log
- [ ] Tracciare chi ha attivato/disattivato il circolo
- [ ] Timestamp di ogni cambio stato
- [ ] Motivo della disattivazione (campo note)

### Dashboard Club Admin
- [ ] Banner di avviso se circolo non attivo
- [ ] Checklist per completare profilo prima dell'attivazione
- [ ] Preview di come appare il circolo agli utenti

### Statistiche Avanzate
- [ ] Grafico temporale delle attivazioni
- [ ] Tempo medio di approvazione
- [ ] Tasso di rifiuto/disattivazione

## Testing

### Test Manuale
1. ✅ Registrare nuovo circolo → Verificare isActive: false
2. ✅ Accedere come club-admin → Dashboard accessibile
3. ✅ Cercare circolo come utente pubblico → Non visibile
4. ✅ Super-admin attiva circolo → isActive: true, status: approved
5. ✅ Cercare circolo come utente pubblico → Ora visibile
6. ✅ Super-admin disattiva circolo → isActive: false
7. ✅ Verificare filtri (Tutti/In Attesa/Attivi/Disattivati)

### Edge Cases
- [ ] Cosa succede se club-admin elimina account?
- [ ] Gestire circoli senza owner (orfani)
- [ ] Prevenire auto-attivazione da parte del club-admin

## Note Implementazione

- **Data di Implementazione**: 2025-10-07
- **Versione**: 1.0.0
- **Dipendenze**: Firebase Auth, Firestore, React Router
- **Breaking Changes**: Nessuno (retrocompatibile)

## Modifiche Implementate

### ✅ Completato

1. **ClubsManagement.jsx** - Sistema completo di attivazione/disattivazione
   - Filtri per stato (Tutti/In Attesa/Attivi/Disattivati)
   - Badge di stato nei circoli
   - Toggle button per attivare/disattivare
   - Statistiche aggregate per stato
   - Dialog di conferma per ogni azione

2. **ClubActivationBanner.jsx** - Componente banner informativo
   - Banner completo con istruzioni per circoli in attesa
   - Banner di avviso per circoli disattivati
   - Badge compatto per header (ClubActivationStatusBadge)
   - Icone Lucide React (Clock, CheckCircle, XCircle)

3. **ClubDashboard.jsx** - Integrazione banner nella dashboard
   - Banner visibile solo ai club-admin del circolo
   - Posizionato in alto, prima del contenuto principale
   - Condizionato a: `userProfile?.role === 'club-admin' && userProfile?.clubId === clubId`

4. **ClubSettings.jsx** - Integrazione banner nelle impostazioni
   - Banner visibile in tutte le pagine di configurazione
   - Posizionato prima delle tab di impostazioni
   - Sempre visibile al club-admin durante la configurazione

5. **firestore.rules.production** - Regole di sicurezza complete
   - Visibilità pubblica solo per circoli attivi (`isActive: true`)
   - Owner può sempre accedere al proprio circolo
   - Super-admin ha accesso completo
   - Protezione dei campi `isActive` e `status` da modifiche non autorizzate
   - Regole per tutte le collezioni (users, clubs, bookings, matches, etc.)

### 📋 Prossimi Passi Manuali

1. **Deploy Firestore Rules**:
   ```bash
   # Copia firestore.rules.production a firestore.rules
   cp firestore.rules.production firestore.rules
   
   # Deploy su Firebase
   firebase deploy --only firestore:rules
   ```

2. **Testare in Sviluppo**:
   - Registrare nuovo circolo e verificare `isActive: false`
   - Accedere come club-admin e vedere banner giallo
   - Accedere come super-admin e attivare circolo
   - Verificare che circolo diventi visibile agli utenti

3. **Configurare Notifiche Email** (opzionale):
   - Cloud Function per email quando circolo attivato
   - Template email di benvenuto
   - Notifica a super-admin per nuove registrazioni

## File Correlati

- ✅ `src/pages/admin/ClubsManagement.jsx` - Pannello super-admin
- ✅ `src/pages/RegisterClubPage.jsx` - Registrazione circoli  
- ✅ `src/components/ui/ClubActivationBanner.jsx` - Banner informativo
- ✅ `src/features/clubs/ClubDashboard.jsx` - Dashboard club con banner
- ✅ `src/pages/admin/ClubSettings.jsx` - Impostazioni club con banner
- ✅ `firestore.rules.production` - Regole di sicurezza complete
- 📄 `CLUB_REGISTRATION_FLOW_V2.md` - Documentazione flusso registrazione
- ⚠️ `firestore.rules` - Da aggiornare con regole production prima del deploy
