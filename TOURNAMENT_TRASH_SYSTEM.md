# 🗑️ Sistema Cestino Tornei

## Panoramica

Il sistema di cestino per i tornei implementa un meccanismo di **soft delete** che permette agli amministratori di:

1. Spostare i tornei nel cestino invece di eliminarli definitivamente
2. Ripristinare tornei dal cestino
3. Eliminare definitivamente i tornei dal cestino

## Funzionalità Implementate

### 1. Soft Delete (Spostamento nel Cestino)

- **Funzione**: `moveTournamentToTrash(clubId, tournamentId)`
- **Comportamento**:
  - Aggiunge `deleted: true` al torneo
  - Registra `deletedAt: Timestamp.now()`
  - Il torneo non viene eliminato dal database
  - Il torneo non appare più nella lista principale

### 2. Ripristino dal Cestino

- **Funzione**: `restoreTournamentFromTrash(clubId, tournamentId)`
- **Comportamento**:
  - Rimuove il flag `deleted`
  - Azzera `deletedAt`
  - Il torneo riappare nella lista principale

### 3. Eliminazione Definitiva

- **Funzione**: `deleteTournamentPermanently(clubId, tournamentId)`
- **Comportamento**:
  - Elimina **definitivamente** il torneo e tutte le sue subcollections
  - Cancella matches, teams, standings
  - Reverte i punti campionato se applicati
  - **Operazione NON REVERSIBILE**

### 4. Visualizzazione Cestino

- **Componente**: `TournamentTrash.jsx`
- **Funzionalità**:
  - Mostra tutti i tornei eliminati
  - Pulsante "Ripristina" per ogni torneo
  - Pulsante "Elimina" per eliminazione definitiva
  - Doppia conferma per eliminazione permanente

## Modifiche al Codice

### 1. tournamentService.js

```javascript
// Nuove funzioni aggiunte:
- moveTournamentToTrash(clubId, tournamentId)
- restoreTournamentFromTrash(clubId, tournamentId)
- deleteTournamentPermanently(clubId, tournamentId)
- getDeletedTournaments(clubId, options)

// Funzione modificata:
- getTournaments() - ora filtra automaticamente i tornei eliminati
  - Opzione: includeDeleted: true per vedere tutti i tornei
- deleteTournament() - ora usa moveTournamentToTrash() per compatibilità
```

### 2. TournamentOverview.jsx

```javascript
// handleDelete modificato
- Ora usa moveTournamentToTrash invece di deleteTournament
- Messaggio aggiornato: "sposta nel cestino" invece di "elimina"
```

### 3. TournamentsPage.jsx

```javascript
// Aggiunti:
- Pulsante "Cestino" nell'header
- Stato showTrash per gestire modal
- Import TournamentTrash component
```

### 4. TournamentTrash.jsx

```javascript
// Nuovo componente modal:
- Lista tornei eliminati
- Pulsanti Ripristina/Elimina per ogni torneo
- Warning banner per eliminazione permanente
- Doppia conferma per eliminazione definitiva
```

## Schema Database

### Campi Aggiunti ai Tornei

```javascript
{
  // ... campi esistenti ...
  deleted: boolean,        // true se nel cestino, false altrimenti
  deletedAt: Timestamp,    // quando è stato spostato nel cestino
}
```

## Migrazione Database

### Script di Migrazione

Il file `add-deleted-field-to-tournaments.js` aggiunge i campi necessari ai tornei esistenti:

```bash
# Eseguire una sola volta per migrare i tornei esistenti
node add-deleted-field-to-tournaments.js
```

Lo script:

- Aggiunge `deleted: false` a tutti i tornei esistenti
- Aggiunge `deletedAt: null` a tutti i tornei esistenti
- Skippa i tornei che hanno già questi campi
- Mostra un report dettagliato dell'operazione

## Flusso Utente

### Admin - Eliminazione Torneo

1. Click su "Elimina" in TournamentOverview
2. Conferma: "Spostare nel cestino?"
3. Torneo scompare dalla lista principale
4. Torneo appare nel cestino

### Admin - Visualizzazione Cestino

1. Click su "Cestino" nella pagina tornei
2. Modal con lista tornei eliminati
3. Per ogni torneo: data eliminazione, info, pulsanti azione

### Admin - Ripristino

1. Nel cestino, click "Ripristina" su un torneo
2. Conferma: "Ripristinare il torneo?"
3. Torneo ritorna nella lista principale
4. Cestino si aggiorna

### Admin - Eliminazione Definitiva

1. Nel cestino, click "Elimina" su un torneo
2. Prima conferma: Messaggio di warning
3. Seconda conferma: "Sei assolutamente sicuro?"
4. Torneo eliminato permanentemente
5. Cestino si aggiorna

## Query Firestore

### Tornei Attivi (default)

```javascript
// Filtra automaticamente i tornei eliminati
where('deleted', '!=', true);
```

### Tornei nel Cestino

```javascript
where('deleted', '==', true);
orderBy('deletedAt', 'desc');
```

### Tutti i Tornei (inclusi eliminati)

```javascript
getTournaments(clubId, { includeDeleted: true });
```

## Indici Firestore Necessari

Per ottimizzare le query, potrebbero essere necessari i seguenti indici compositi:

```
Collection: tournaments
- deleted (ASC) + createdAt (DESC)
- deleted (ASC) + status (ASC) + createdAt (DESC)
```

Firebase creerà automaticamente questi indici quando necessario.

## Testing

### Test Manuali da Eseguire

1. ✅ Eliminare un torneo → appare nel cestino
2. ✅ Ripristinare un torneo → torna nella lista
3. ✅ Eliminare definitivamente → scompare completamente
4. ✅ Tornei eliminati non appaiono nella lista principale
5. ✅ Cestino vuoto mostra messaggio appropriato
6. ✅ Doppia conferma per eliminazione permanente

### Edge Cases

- ✅ Torneo con punti campionato applicati → reverte correttamente
- ✅ Torneo con molte partite/team → elimina tutte le subcollections
- ✅ Ripristino di torneo completato → mantiene lo stato COMPLETED
- ✅ Eliminazione durante fase attiva → mantiene integrità dati

## Sicurezza

### Permessi Firestore

Assicurarsi che le regole di sicurezza permettano:

- Lettura tornei eliminati solo agli admin del club
- Modifica campo 'deleted' solo agli admin del club
- Eliminazione permanente solo agli admin del club

```javascript
// Esempio regole Firestore
match /clubs/{clubId}/tournaments/{tournamentId} {
  allow read: if isClubMember(clubId);
  allow update: if isClubAdmin(clubId) &&
                request.resource.data.diff(resource.data).affectedKeys()
                .hasOnly(['deleted', 'deletedAt', 'updatedAt']);
  allow delete: if isClubAdmin(clubId);
}
```

## Benefici

1. **Sicurezza**: Previene eliminazioni accidentali
2. **Recuperabilità**: Possibilità di ripristinare tornei eliminati per errore
3. **Audit Trail**: Traccia quando i tornei sono stati eliminati
4. **UX Migliorata**: Gli admin hanno più controllo
5. **Conformità**: Mantiene storico anche dopo "eliminazione"

## Limitazioni Conosciute

1. I tornei eliminati occupano spazio nel database
2. Le query potrebbero essere più lente con molti tornei eliminati
3. Necessario processo di pulizia periodica del cestino (future enhancement)

## Future Enhancements

- [ ] Auto-eliminazione tornei nel cestino dopo X giorni
- [ ] Notifica prima dell'auto-eliminazione
- [ ] Statistiche cestino (spazio occupato, numero tornei)
- [ ] Svuota tutto il cestino con un click
- [ ] Export tornei eliminati prima dell'eliminazione definitiva
- [ ] Log delle operazioni di ripristino/eliminazione

## Changelog

### v1.0.0 (2025-11-01)

- ✅ Implementato soft delete con moveTournamentToTrash
- ✅ Implementato ripristino con restoreTournamentFromTrash
- ✅ Implementato hard delete con deleteTournamentPermanently
- ✅ Creato componente TournamentTrash.jsx
- ✅ Aggiunto pulsante Cestino in TournamentsPage
- ✅ Modificato handleDelete in TournamentOverview
- ✅ Aggiornato getTournaments per filtrare eliminati
- ✅ Creato script di migrazione database

---

**Autore**: GitHub Copilot  
**Data**: 1 Novembre 2025  
**Versione**: 1.0.0
