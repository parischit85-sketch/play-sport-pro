# Multi-Club Migration Plan

Data: 2025-09-18
Versione Schema Target: 2 (multi-club)

## Obiettivo
Convertire il modello corrente (League singola con stato aggregato) in modello multi-club Firestore:
- `clubs/{clubId}` e relative subcollection
- `affiliations/{affiliationId}` normalizzate
- Tutte le prenotazioni, players, matches, courts migrati sotto un club iniziale `default-club`
- Centralizzare configurazioni (booking / lessons) nel documento `clubs/{clubId}/settings/config`

## Fasi Migrazione
1. **Freeze Scritture** (manutenzione) – blocco UI booking/lesson (flag `system/maintenance`)
2. **Creazione Club Iniziale**: documento `clubs/default-club`
3. **Creazione Settings Doc**: inizializza `clubs/default-club/settings/config` (se non esiste sarà creato lazy dal servizio)
4. **Migrazione Courts**: array legacy → `clubs/default-club/courts`
5. **Migrazione Bookings**: array legacy / collezione bookings root → `clubs/default-club/bookings`
6. **Migrazione Players**: array legacy → `clubs/default-club/players`
7. **Migrazione Matches**: array legacy → `clubs/default-club/matches`
8. **Affiliazioni**: per ogni user attivo creare doc `affiliations/{userId_default-club}` (solo collezione normalizzata)
9. **Aggiornamento Regole Firestore**
10. **Deploy App + toggle multi-club**
11. **Verifica & Unfreeze**

## Dettaglio Campi
| Entità | Campo | Azione |
|--------|-------|--------|
| Booking | clubId | Aggiungere se assente (default-club) |
| Player | clubId | Aggiungere |
| Match | clubId | Aggiungere |
| Court | clubId | Aggiungere |
| Settings (doc) | bookingConfig / lessonConfig | Popolare con defaults se non esiste |

## Script Migrazione (Bozza Node.js Admin SDK)
```js
// migrate-multi-club.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

// TODO: sostituire con credenziali service account
initializeApp({
  credential: cert('./serviceAccount.json')
});

const db = getFirestore();
const CLUB_ID = 'default-club';

async function ensureClub() {
  const ref = db.collection('clubs').doc(CLUB_ID);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      name: 'Club Principale',
      slug: 'default-club',
      timezone: 'Europe/Rome',
      visibility: 'private',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      owners: [],
      staff: [],
      instructors: [],
      status: 'active',
      meta: { courtsCount:0, playersCount:0, matchesCount:0, activeSeasons:[] }
    });
    console.log('✅ Creato club base');
  }
  // Inizializza documento settings (nuovo schema: subcollection dedicata)
  const settingsRef = ref.collection('settings').doc('config');
  const settingsSnap = await settingsRef.get();
  if (!settingsSnap.exists) {
    await settingsRef.set({
      bookingConfig: { slotMinutes:30, dayStartHour:8, dayEndHour:23, defaultDurations:[60,90,120], holePrevention:true, maxAdvanceDays:14 },
      lessonConfig: { enable:true, defaultDurations:[60], instructorAllocation:'manual' },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: 'migration'
    });
    console.log('✅ Inizializzato settings/config');
  }
}

async function migrateArrayToSubcollection(arrayData, subPath, extraMapper = (x)=>x) {
  if (!Array.isArray(arrayData) || !arrayData.length) return 0;
  const batch = db.batch();
  const colRef = db.doc(`clubs/${CLUB_ID}`).collection(subPath);
  let count = 0;
  for (const item of arrayData) {
    const id = item.id || colRef.doc().id;
    const docRef = colRef.doc(id);
    batch.set(docRef, { ...item, clubId: CLUB_ID, migratedAt: FieldValue.serverTimestamp(), ...extraMapper(item) });
    count++;
    if (count % 400 === 0) { // evitare limiti batch
      await batch.commit();
      console.log(`Committed partial batch for ${subPath}`);
    }
  }
  await batch.commit();
  return arrayData.length;
}

async function migrateAffiliations(users) {
  const col = db.collection('affiliations');
  let count = 0;
  for (const u of users) {
    const affId = `${u.id}_${CLUB_ID}`;
    const ref = col.doc(affId);
    await ref.set({
      userId: u.id,
      clubId: CLUB_ID,
      role: 'member',
      status: 'approved',
      requestedAt: FieldValue.serverTimestamp(),
      decidedAt: FieldValue.serverTimestamp(),
      decidedBy: 'migration'
    }, { merge: true });
    count++;
  }
  return count;
}

async function run() {
  await ensureClub();

  // Carica dump locale stato legacy (export JSON prima della migrazione)
  const legacy = JSON.parse(fs.readFileSync('./legacy-league.json','utf8'));

  const courtsMigrated = await migrateArrayToSubcollection(legacy.courts, 'courts');
  console.log('Courts migrati:', courtsMigrated);

  const bookingsMigrated = await migrateArrayToSubcollection(legacy.bookings, 'bookings', b => ({
    date: b.date || (b.start ? b.start.split('T')[0] : null),
    time: b.time || (b.start ? b.start.split('T')[1]?.substring(0,5) : null),
    status: b.status || 'confirmed'
  }));
  console.log('Bookings migrati:', bookingsMigrated);

  const playersMigrated = await migrateArrayToSubcollection(legacy.players, 'players');
  console.log('Players migrati:', playersMigrated);

  const matchesMigrated = await migrateArrayToSubcollection(legacy.matches, 'matches');
  console.log('Matches migrati:', matchesMigrated);

  // Migra affiliazioni basandosi sui players (oppure utenti reali se separati)
  const uniqueUsers = Array.from(new Set(legacy.players.map(p => p.userId).filter(Boolean)))
    .map(uid => ({ id: uid }));
  const affiliationsMigrated = await migrateAffiliations(uniqueUsers);
  console.log('Affiliazioni create:', affiliationsMigrated);

  console.log('✅ Migrazione completata.');
}

run().catch(e => { console.error(e); process.exit(1); });
```

## Validazione Post-Migrazione
Checklist:
- [ ] `/clubs/default-club/courts` count = legacy.courts.length
- [ ] `/clubs/default-club/bookings` count = legacy.bookings.length
- [ ] `affiliations` count ≈ unique player userIds
- [ ] `/clubs/default-club/settings/config` esiste con bookingConfig + lessonConfig
- [ ] Indice (clubId, date, time) creato per bookings
- [ ] UI carica bookings filtrando club
- [ ] Classifica mostra solo players/matches del club selezionato
- [ ] Switch club aggiorna ranking senza reload completo pagina
- [ ] Regole Firestore deployate (versione multi-club)

## Aggiornamento Regole Firestore
Le nuove regole (file `firestore.rules`) introducono:
- Funzioni helper: `isAffiliated`, `isClubStaff`, `isClubAdmin`
- Subcollection per club: `courts`, `bookings`, `players`, `matches`, `tournaments`, `statsCache`, `lessons`
- Lettura bookings/matches limitata ad affiliati (rimuovere `isDevAdmin` prima del go-live)
- Creazione booking: richiede `clubId` coerente con path ed autore = `createdBy`

Nuova collezione di supporto ruoli (`userClubRoles`):
```
match /userClubRoles/{docId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && isClubAdmin(request.resource.data.clubId);
  allow update, delete: if request.auth != null && isClubAdmin(resource.data.clubId);
}
```
Se i ruoli non sono ancora operativi in produzione si può mantenere la sola lettura limitata oppure ritardare il deploy della collezione.

DA FARE prima del go-live production:
1. Disabilitare `isDevAdmin` oppure limitarlo a email whitelist admin
2. Valutare se rendere pubblica la lettura dei `courts` (attualmente è pubblica) oppure solo per affiliati
3. Aggiungere indici Firestore necessari (vedi sezione Indici)

## Ranking per Club
Implementato wrapper `computeClubRanking` (`src/lib/ranking-club.js`) che:
- Filtra players/matches per `clubId`
- Mantiene fallback legacy se `clubId` assente (modalità transizione)
- Usato in `ClassificaPage.jsx` con lazy load tramite `ClubContext`

Verifiche manuali suggerite:
1. Selezionare Club A → Annotare top 3
2. Selezionare Club B → Lista cambia e non mostra giocatori Club A
3. Creare nuovo match nel Club A → Ranking aggiorna punteggio relativo
4. Cambiare club dopo nuovo match → Nessuna modifica a ranking Club B

## Indici Consigliati
Creare in Firestore console (o firestore.indexes.json) i seguenti indici compositi:
1. `clubs/{clubId}/bookings`: (date ASC, time ASC)
2. `clubs/{clubId}/matches`: (playedAt DESC)
3. `clubs/{clubId}/lessons`: (date ASC, startTime ASC)
4. `affiliations`: (clubId ASC, status ASC)

## Roadmap Pulizia Finale
1. (COMPLETATO) Rimosso `LeagueContext`
2. Eliminare vecchie collezioni root (`bookings`, `matches`, ecc.) dopo verifica migrazione
3. Aggiungere script di purge bookings > 90 giorni (cron / cloud function futura)
4. Documentare naming convenzioni per nuovi club (slug univoco, lowercase, dash)
5. Introdurre validazione schema settings (runtime) / tests

## Rollback Strategy
1. Tenere export JSON originale (`legacy-league.json`)
2. Prefix temporaneo `clubs/default-club-backup-*` se si ripete migrazione
3. In caso di bug: disattiva nuove scritture e ripristina UI legacy

## Note
- Non fare caching locale dei bookings (decisione approvata)
- Aggiungere successivamente meccanismo di purge bookings cancellati > 90 giorni
- Il documento settings viene creato lazy dal client se assente (idempotente)

---
Aggiorna questo file una volta eseguita la migrazione reale.
