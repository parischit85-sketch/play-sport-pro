# 🧪 TESTING CHECKLIST - Fix Sistema Punteggi & Ranking

**Data Testing**: 27 Ottobre 2025  
**Tester**: _________________  
**Ambiente**: □ Locale  □ Staging  □ Produzione

---

## 📋 OVERVIEW FIX DA TESTARE

| Fix | Descrizione | Priorità | File Modificati |
|-----|-------------|----------|-----------------|
| #1 | Date Match Tornei Preservate | 🔴 CRITICA | championshipApplyService.js |
| #3 | Warning Configurazioni Post-Applicazione | 🟡 MEDIA | TournamentEditModal.jsx |
| #4 | Validazione Ordine Temporale | 🟡 MEDIA | championshipApplyService.js, TournamentPoints.jsx |
| #6 | Lock Hard Configurazioni | 🟡 MEDIA | TournamentEditModal.jsx |
| #7 | Unificazione Average Ranking | 🟢 BASSA | teamRanking.js, TournamentStandings.jsx |

---

## ✅ TEST #1: DATE MATCH TORNEI PRESERVATE (FIX #1 - CRITICO)

### Obiettivo
Verificare che le date originali dei match del torneo vengano preservate quando si applicano i punti campionato.

### Setup Prerequisiti
- [ ] Avere un torneo completato con almeno 5 match
- [ ] I match devono avere date diverse (es: match giocati in giorni diversi)
- [ ] Annotare le date originali dei match prima del test

### Procedura Test

#### Step 1: Preparazione
```
1. Accedere al portale admin
2. Navigare a: Tornei → [Seleziona un torneo completato]
3. Andare alla tab "Match"
4. ANNOTARE le date dei primi 3 match:
   Match 1: ____________________
   Match 2: ____________________
   Match 3: ____________________
```

**Checkpoint**: □ Date annotate correttamente

#### Step 2: Applicare Punti Campionato
```
5. Andare alla tab "Punti Campionato"
6. Cliccare "Applica al Campionato"
7. Nella modal, selezionare una data qualsiasi (es: oggi)
8. Confermare l'applicazione
9. Attendere il completamento
```

**Checkpoint**: □ Applicazione completata con successo

#### Step 3: Verificare Date Preservate
```
10. Aprire Console Browser (F12)
11. Eseguire query Firestore per vedere i matchDetails:
    
    // In console Firebase/Firestore UI:
    clubs/{clubId}/leaderboard/{playerId}/matchDetails
    
12. Filtrare per match del torneo appena applicato
13. Controllare il campo "date" di ogni match
```

**Verifica Date**:
- [ ] Match 1: Data = _____________ (deve essere uguale a quella annotata)
- [ ] Match 2: Data = _____________ (deve essere uguale a quella annotata)
- [ ] Match 3: Data = _____________ (deve essere uguale a quella annotata)

#### Step 4: Verificare Grafico Evoluzione Rating
```
14. Navigare a: Giocatori → [Seleziona un giocatore del torneo]
15. Andare alla sezione "Evoluzione Rating"
16. Verificare che i punti del grafico siano posizionati
    nelle date corrette dei match (non tutti nella stessa data)
```

**Checkpoint**: □ Grafico mostra date corrette e distribuite

### Risultato Test #1

**Status**: □ ✅ PASS  □ ❌ FAIL  □ ⚠️ PARTIAL

**Note/Issue trovati**:
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

**Screenshot**: □ Allegato

---

## ✅ TEST #2: WARNING CONFIGURAZIONI (FIX #3 - MEDIO)

### Obiettivo
Verificare che appaia un warning giallo quando si modifica la configurazione di un torneo già applicato.

### Setup Prerequisiti
- [ ] Avere un torneo completato con punti campionato GIÀ APPLICATI

### Procedura Test

#### Step 1: Verificare Torneo NON Applicato (Baseline)
```
1. Creare un nuovo torneo o selezionarne uno NON ancora applicato
2. Cliccare "Modifica Torneo"
3. Scorrere fino alla sezione "Punti Campionato (bozza)"
```

**Verifica Baseline**:
- [ ] NON c'è nessun banner rosso/giallo visibile
- [ ] Tutti i campi sono modificabili (non grigi)
- [ ] Input "Moltiplicatore RPA" è abilitato

**Checkpoint**: □ Comportamento baseline corretto

#### Step 2: Applicare il Torneo
```
4. Chiudere la modal "Modifica Torneo"
5. Completare il torneo se non già fatto
6. Andare alla tab "Punti Campionato"
7. Cliccare "Applica al Campionato"
8. Confermare l'applicazione
```

**Checkpoint**: □ Punti applicati con successo

#### Step 3: Verificare Warning
```
9. Cliccare nuovamente "Modifica Torneo"
10. Scorrere fino alla sezione "Punti Campionato (bozza)"
```

**Verifica Warning**:
- [ ] Banner rosso visibile in cima alla sezione
- [ ] Icona 🔒 o AlertTriangle presente
- [ ] Testo dice "Configurazione Bloccata - Punti Già Applicati"
- [ ] Messaggio spiega che i campi sono disabilitati

**Checkpoint**: □ Warning visibile e chiaro

### Risultato Test #2

**Status**: □ ✅ PASS  □ ❌ FAIL  □ ⚠️ PARTIAL

**Note/Issue trovati**:
```
_________________________________________________________________
_________________________________________________________________
```

---

## ✅ TEST #3: LOCK HARD CONFIGURAZIONI (FIX #6 - MEDIO)

### Obiettivo
Verificare che TUTTI i campi di configurazione punti campionato siano effettivamente bloccati (disabled) quando il torneo è applicato.

### Setup Prerequisiti
- [ ] Stesso torneo del Test #2 (già applicato)
- [ ] Modal "Modifica Torneo" aperta sulla sezione "Punti Campionato"

### Procedura Test

#### Step 1: Verificare Blocco Input - Moltiplicatore RPA
```
1. Individuare il campo "Moltiplicatore RPA"
2. Provare a cliccare dentro il campo
3. Provare a digitare un numero
4. Fare hover sul campo
```

**Verifica**:
- [ ] Campo è grigio/opaco (opacity ridotta)
- [ ] Impossibile ottenere focus sul campo
- [ ] Impossibile digitare valori
- [ ] Cursore mostra "not-allowed" (🚫) su hover
- [ ] Attributo `disabled` presente nell'HTML

**Checkpoint**: □ Moltiplicatore RPA completamente bloccato

#### Step 2: Verificare Blocco Input - Piazzamenti Girone (4 campi)
```
5. Individuare i 4 campi "Piazzamento Girone" (1°, 2°, 3°, 4°)
6. Provare a modificare ciascuno dei 4 campi
```

**Verifica per ogni campo**:
- [ ] 1° posto: bloccato (grigio, disabled, cursor not-allowed)
- [ ] 2° posto: bloccato (grigio, disabled, cursor not-allowed)
- [ ] 3° posto: bloccato (grigio, disabled, cursor not-allowed)
- [ ] 4° posto: bloccato (grigio, disabled, cursor not-allowed)

**Checkpoint**: □ Tutti e 4 i campi piazzamento bloccati

#### Step 3: Verificare Blocco Input - Eliminazione Diretta (5 campi)
```
7. Scorrere fino ai campi "Eliminazione Diretta"
8. Provare a modificare ciascuno dei 5 campi
```

**Verifica per ogni campo**:
- [ ] Ottavi: bloccato
- [ ] Quarti: bloccato
- [ ] Semifinali: bloccato
- [ ] Finale: bloccato
- [ ] 3°/4° posto: bloccato

**Checkpoint**: □ Tutti e 5 i campi knockout bloccati

#### Step 4: Verificare Altre Sezioni Modificabili
```
9. Scorrere alle altre sezioni della modal (Nome, Date, Settings)
10. Provare a modificare il nome del torneo
11. Provare a modificare altri campi NON relativi a punti campionato
```

**Verifica**:
- [ ] Campo "Nome Torneo" è modificabile ✅
- [ ] Altri campi generali sono modificabili ✅
- [ ] Solo i campi punti campionato sono bloccati

**Checkpoint**: □ Blocco selettivo corretto

#### Step 5: Test Workflow Completo (Annulla → Modifica → Riapplica)
```
12. Chiudere modal "Modifica Torneo"
13. Andare alla tab "Punti Campionato"
14. Cliccare "Annulla Applicazione"
15. Confermare l'annullamento
16. Attendere il completamento
17. Aprire nuovamente "Modifica Torneo"
18. Andare alla sezione "Punti Campionato"
```

**Verifica dopo Annullamento**:
- [ ] Banner rosso NON più visibile
- [ ] Tutti i campi punti campionato sono ora abilitati
- [ ] Possibile modificare "Moltiplicatore RPA"
- [ ] Possibile modificare piazzamenti girone
- [ ] Possibile modificare punti knockout

**Checkpoint**: □ Campi sbloccati dopo annullamento

```
19. Modificare "Moltiplicatore RPA" da 1.0 a 1.5
20. Salvare le modifiche
21. Tornare a "Punti Campionato"
22. Cliccare "Applica al Campionato"
23. Verificare che i punti siano calcolati con il NUOVO moltiplicatore
```

**Verifica Riapplicazione**:
- [ ] Nuova configurazione salvata correttamente
- [ ] Punti ricalcolati con moltiplicatore 1.5
- [ ] Leaderboard aggiornata con nuovi valori

**Checkpoint**: □ Workflow Annulla-Modifica-Riapplica funziona

### Risultato Test #3

**Status**: □ ✅ PASS  □ ❌ FAIL  □ ⚠️ PARTIAL

**Note/Issue trovati**:
```
_________________________________________________________________
_________________________________________________________________
```

---

## ✅ TEST #4: VALIDAZIONE ORDINE TEMPORALE (FIX #4 - MEDIO)

### Obiettivo
Verificare che il sistema impedisca di applicare tornei con date precedenti all'ultimo torneo già applicato.

### Setup Prerequisiti
- [ ] Avere almeno 2 tornei completati
- [ ] Torneo A con data: 15 Ottobre 2025
- [ ] Torneo B con data: 10 Ottobre 2025 (più vecchio)

### Procedura Test

#### Step 1: Applicare Primo Torneo (Data Recente)
```
1. Selezionare Torneo A (data: 15 Ottobre)
2. Andare a "Punti Campionato"
3. Cliccare "Applica al Campionato"
4. Selezionare data: 15 Ottobre 2025
5. Confermare
```

**Checkpoint**: □ Torneo A applicato con successo

#### Step 2: Tentare di Applicare Torneo con Data Precedente
```
6. Selezionare Torneo B (data: 10 Ottobre - più vecchio)
7. Andare a "Punti Campionato"
8. Cliccare "Applica al Campionato"
9. Selezionare data: 10 Ottobre 2025
10. Confermare
```

**Verifica Blocco**:
- [ ] Applicazione viene BLOCCATA (non procede)
- [ ] Appare un messaggio di errore
- [ ] Messaggio contiene:
  - [ ] Testo: "Validazione temporale fallita" o simile
  - [ ] Data dell'ultimo torneo applicato (15 Ottobre)
  - [ ] Nome dell'ultimo torneo applicato (Torneo A)
  - [ ] Data del torneo che si sta tentando (10 Ottobre)
- [ ] Il messaggio è in italiano
- [ ] Punti NON vengono applicati

**Checkpoint**: □ Blocco temporale funziona

#### Step 3: Verificare Applicazione in Ordine Corretto
```
11. Annullare l'applicazione del Torneo A
12. Applicare prima Torneo B (10 Ottobre)
13. Poi applicare Torneo A (15 Ottobre)
```

**Verifica Ordine Corretto**:
- [ ] Torneo B applicato con successo (data più vecchia applicata per prima)
- [ ] Torneo A applicato con successo (data più recente dopo)
- [ ] Nessun errore di validazione temporale

**Checkpoint**: □ Ordine cronologico corretto accettato

#### Step 4: Verificare Timeline Leaderboard
```
14. Navigare a un giocatore che ha partecipato a entrambi i tornei
15. Controllare la sezione "Match Details" o "Evoluzione Rating"
```

**Verifica Timeline**:
- [ ] Match di Torneo B (10 Ott) appaiono PRIMA di Torneo A (15 Ott)
- [ ] Timeline cronologica rispettata
- [ ] Grafico evoluzione rating in ordine corretto

**Checkpoint**: □ Timeline rispetta ordine temporale

### Risultato Test #4

**Status**: □ ✅ PASS  □ ❌ FAIL  □ ⚠️ PARTIAL

**Note/Issue trovati**:
```
_________________________________________________________________
_________________________________________________________________
```

---

## ✅ TEST #5: UNIFICAZIONE AVERAGE RANKING (FIX #7 - BASSO)

### Obiettivo
Verificare che il calcolo del ranking medio delle squadre sia corretto e consistente.

### Setup Prerequisiti
- [ ] Avere un torneo con fase a gironi
- [ ] Squadre con ranking noti dei giocatori

### Procedura Test

#### Step 1: Preparare Dati Test
```
1. Identificare una squadra nel torneo
2. Annotare i ranking dei giocatori:
   Giocatore 1: Ranking = _________
   Giocatore 2: Ranking = _________
   Media attesa = (Rank1 + Rank2) / 2 = _________
```

**Checkpoint**: □ Dati annotati

#### Step 2: Verificare Classifica Girone
```
3. Andare alla tab "Classifiche" del torneo
4. Individuare la squadra annotata
5. Controllare la colonna "Ranking Medio" (se visibile)
   o controllare l'ordinamento a parità di punti
```

**Verifica Calcolo**:
- [ ] Ranking medio visualizzato = _________ (deve corrispondere alla media attesa)
- [ ] Se due squadre hanno stessi punti e stessa differenza game:
  - [ ] Squadra con ranking medio più alto è posizionata prima
  - [ ] Ordinamento per ranking funziona correttamente

**Checkpoint**: □ Ranking medio calcolato correttamente

#### Step 3: Test Edge Cases

**Test 3a: Squadra con solo 1 giocatore**
```
6. Identificare/creare una squadra con 1 solo giocatore
   Giocatore unico: Ranking = _________
```
- [ ] Sistema usa ranking del giocatore singolo (non fallisce)
- [ ] Oppure usa fallback rating (1500) per secondo giocatore

**Test 3b: Squadra senza ranking**
```
7. Identificare una squadra con giocatori senza ranking assegnato
```
- [ ] Sistema usa fallback rating (1500)
- [ ] Non causa errori o crash
- [ ] Classifica viene comunque visualizzata

**Checkpoint**: □ Edge cases gestiti correttamente

#### Step 4: Verificare Consistenza
```
8. Aprire Console Browser (F12)
9. Cercare eventuali errori nella console
10. Verificare che non ci siano warning su calcoli ranking
```

**Verifica Console**:
- [ ] Nessun errore JavaScript
- [ ] Nessun warning su calcoli ranking
- [ ] Nessun log di debug indesiderato in produzione

**Checkpoint**: □ Nessun errore console

### Risultato Test #5

**Status**: □ ✅ PASS  □ ❌ FAIL  □ ⚠️ PARTIAL

**Note/Issue trovati**:
```
_________________________________________________________________
_________________________________________________________________
```

---

## 🔍 TEST INTEGRAZIONE E REGRESSIONE

### Obiettivo
Verificare che i fix non abbiano introdotto regressioni in altre funzionalità.

### Test Regressione

#### R1: Creazione Nuovo Torneo
```
1. Creare un nuovo torneo da zero
2. Configurare tutte le opzioni
3. Salvare
```
- [ ] Creazione funziona normalmente
- [ ] Nessun errore
**Status**: □ PASS  □ FAIL

#### R2: Modifica Torneo Mai Applicato
```
4. Modificare un torneo che non ha mai avuto punti applicati
5. Cambiare configurazione punti campionato
6. Salvare
```
- [ ] Modifica funziona normalmente
- [ ] Nessun warning inappropriato
- [ ] Campi non bloccati
**Status**: □ PASS  □ FAIL

#### R3: Eliminazione Match
```
7. Eliminare un match da un torneo
8. Verificare che le classifiche si aggiornino
```
- [ ] Eliminazione funziona
- [ ] Classifiche aggiornate correttamente
**Status**: □ PASS  □ FAIL

#### R4: RPA Calculations (Non Tournament)
```
9. Giocare un match normale (non torneo)
10. Verificare calcolo RPA
```
- [ ] RPA calcolato correttamente
- [ ] Nessuna interferenza con fix tornei
**Status**: □ PASS  □ FAIL

#### R5: Leaderboard Display
```
11. Aprire la leaderboard campionato
12. Verificare visualizzazione
```
- [ ] Leaderboard carica correttamente
- [ ] Tutti i dati visibili
- [ ] Ordinamento corretto
**Status**: □ PASS  □ FAIL

---

## 📊 RIEPILOGO FINALE TESTING

### Risultati per Fix

| Fix | Test # | Status | Note |
|-----|--------|--------|------|
| #1 - Date Match | Test #1 | □ PASS □ FAIL | _________________ |
| #3 - Warning | Test #2 | □ PASS □ FAIL | _________________ |
| #6 - Lock Hard | Test #3 | □ PASS □ FAIL | _________________ |
| #4 - Validazione Temporale | Test #4 | □ PASS □ FAIL | _________________ |
| #7 - Average Ranking | Test #5 | □ PASS □ FAIL | _________________ |

### Test Regressione

| Test | Status | Blocca Deploy? |
|------|--------|----------------|
| R1 - Creazione Torneo | □ PASS □ FAIL | □ Sì □ No |
| R2 - Modifica Torneo | □ PASS □ FAIL | □ Sì □ No |
| R3 - Eliminazione Match | □ PASS □ FAIL | □ Sì □ No |
| R4 - RPA Non-Tournament | □ PASS □ FAIL | □ Sì □ No |
| R5 - Leaderboard Display | □ PASS □ FAIL | □ Sì □ No |

### Issue Critici Trovati

**Issue #1**:
```
Severità: □ Blocker  □ Critical  □ Major  □ Minor
Descrizione:
_________________________________________________________________
_________________________________________________________________

Workaround disponibile: □ Sì □ No
Fix richiesto prima deploy: □ Sì □ No
```

**Issue #2**:
```
Severità: □ Blocker  □ Critical  □ Major  □ Minor
Descrizione:
_________________________________________________________________
_________________________________________________________________

Workaround disponibile: □ Sì □ No
Fix richiesto prima deploy: □ Sì □ No
```

### Decisione Deploy

**Raccomandazione**:
- [ ] ✅ **APPROVE** - Deploy in produzione
- [ ] ⚠️ **APPROVE con RISERVE** - Deploy con monitoraggio stretto
- [ ] ❌ **REJECT** - Fix richiesti prima del deploy

**Motivazione**:
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

**Firmato**: ____________________  **Data**: ____/____/________

---

## 📝 NOTE AGGIUNTIVE

### Osservazioni Generali
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

### Suggerimenti per Miglioramenti Futuri
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

### Test da Aggiungere in Futuro
```
_________________________________________________________________
_________________________________________________________________
```

---

**Fine Checklist Testing**  
*Documento generato: 27 Ottobre 2025*
