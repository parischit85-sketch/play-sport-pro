# Test Plan Multi-Club

Data: 2025-09-18
Versione Architettura: v2 multi-club
Obiettivo: Validare che la transizione single-league → multi-club garantisca isolamento dati, corretto routing, ranking per club e sicurezza Firestore coerente.

## 1. Scope
Copre flow utente autenticato affiliato a ≥1 club, creazione prenotazioni, lezioni, partite, ranking, cambio club, restrizioni accesso ad un club non affiliato.

## 2. Ambienti
- Dev locale (Vite dev server)
- Firestore progetto di test con regole multi-club deployate

## 3. Prerequisiti
- Utente A affiliato a Club1 e Club2 (ruolo: member)
- Utente B affiliato solo a Club1 (ruolo: member)
- Utente StaffC affiliato a Club1 con ruolo staff
- Club1 e Club2 esistenti con courts
- Indici Firestore creati (bookings date+time, matches playedAt)

## 4. Dati Seed Suggeriti
- 2 campi per club (Court 1, Court 2)
- 3 giocatori per club
- 2 matches storici per club

## 5. Matrice Casi Principali
| Area | Caso | Utente | Club | Expected |
|------|------|--------|------|----------|
| Routing | Accesso /club/club1/booking | A | Club1 | Pagina booking mostra courts Club1 |
| Routing | Switch club da selettore | A | 1→2 | UI aggiorna courts e ranking |
| Booking | Crea prenotazione valida | A | Club1 | Booking appare in lista Club1, non in Club2 |
| Booking | Cancella prenotazione propria | A | Club1 | Stato booking → cancelled |
| Booking | Cancella booking altrui (no staff) | B | Club1 | PERMISSION_DENIED |
| Booking | Staff cancella booking altrui | StaffC | Club1 | Successo |
| Booking | Accesso bookings Club2 non affiliato | B | Club2 | Lista vuota / PERMISSION_DENIED |
| Matches | Aggiungi match | A | Club1 | Ranking Club1 cambia, Club2 invariato |
| Settings | Lazy init settings/config | A | Club1 | Doc creato con defaults se assente |
| Settings | Update bookingConfig (slotMinutes) | StaffC | Club1 | Valore aggiornato realtime UI |
| Settings | Update lessonConfig (enable=false) | StaffC | Club1 | UI lezioni disabilitata |
| Ranking | Visualizza ranking Club1 | A | Club1 | Solo giocatori Club1 |
| Ranking | Visualizza ranking Club2 | A | Club2 | Solo giocatori Club2 |
| Lessons | Crea lezione | A | Club1 | Lezione visibile solo in Club1 |
| Sicurezza | Lettura bookings senza auth | - | Club1 | PERMISSION_DENIED |
| Sicurezza | Booking create con clubId diverso dal path | A | Club1 | PERMISSION_DENIED |
| LocalStorage | Verifica chiavi | A | - | Prefisso psp:v1:... presente |

## 6. Scenari Dettagliati
### 6.1 Creazione Prenotazione Isolata
1. Login come Utente A
2. Vai a /club/club1/booking
3. Crea booking (Court1, oggi +2h)
4. Passa a /club/club2/booking → booking NON visibile
5. Torna a /club/club1/booking → booking visibile

### 6.2 Cambio Club e Ranking
1. Apri /club/club1/classifica (annota top 3)
2. Switch a Club2 → top 3 differenti
3. Registra match in Club1 (due giocatori top)
4. Torna a classifica Club1 → punteggio aggiornato
5. Classifica Club2 invariata

### 6.3 Restrizioni Accesso
1. Login come Utente B (solo Club1)
2. Tenta GET bookings Club2 (naviga /club/club2/booking) → lista vuota / errore permessi gestito UI
3. DevTools: forza chiamata Firestore su `clubs/club2/bookings` → PERMISSION_DENIED

### 6.4 Permessi Staff
1. StaffC cancella booking creato da Utente A in Club1 → success
2. Utente B tenta la stessa azione → PERMISSION_DENIED

### 6.5 LocalStorage Namespace
### 6.6 Settings Realtime
1. Login come StaffC (ruolo staff)
2. Apri pagina booking (Club1) e annota slotMinutes attuali
3. Aggiorna slotMinutes (es. 30 -> 45) via pannello configurazione (o chiamata manuale servizio)
4. Verificare UI aggiorna griglia slot senza refresh pagina
5. Disabilita lezioni (lessonConfig.enable = false) → UI lezioni nasconde form creazione
6. Re-enabla lezioni → UI ripristinata

1. Apri Application Storage
2. Verifica chiavi con prefisso `psp:v1:`
3. Assenza di vecchie chiavi non namespaced (eccetto se migrazione ancora in corso)

## 7. Regressioni da Monitorare
- UI che mostra dati incrociati (prenotazioni o giocatori di altro club)
- Ranking che non cambia dopo switch club
- Errori console Firestore PERMISSION_DENIED non gestiti
- Loop rendering dopo cambio club (verificare performance)

## 8. Logging Manuale Consigliato
Annotare su un foglio:
- Timestamp
- Azione
- Risultato atteso
- Risultato reale
- Esito (OK/FAIL)

## 9. Criteri di Uscita
- 100% casi principali PASS (inclusi settings)
- Nessuna perdita di isolamento dati
- Nessun errore non gestito in console durante i flussi principali
- Reattività realtime settings verificata (entro 1-2s update)

## 10. Follow-up se Fallimenti
| Tipo Fallimento | Azione |
|-----------------|--------|
| Permesso Firestore | Rivedere regola; aggiungere log debug in regola; test simulato in Emulator |
| Dati incrociati | Verificare filtri clubId nei servizi / hooks |
| Ranking errato | Controllare `computeClubRanking` input players/matches |
| LocalStorage legacy | Rieseguire `runLocalStorageMigration` / pulire manualmente |

## 11. Extra (Opzionali)
- Test stress: creare 50 bookings per club e misurare tempi UI
- Snapshot Lighthouse per ciascun club
- Test offline: caching PWA isolato

---
Aggiornare questo file barrando i casi completati o aggiungendo edge cases ulteriori.
