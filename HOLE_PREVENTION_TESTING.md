# 🧪 Test della Regola Prevenzione Buchi 30 Minuti

## Come Testare

1. **Apri il browser su** `http://localhost:5173`

2. **Vai alla pagina "Prenota"** (tab Prenota campo)

3. **Apri la Console del Browser** (F12 → Console)

4. **Cerca questi log nella console:**
   - `🚀 [BOOKING FIELD] Component loaded` - Conferma che il componente è caricato
   - `📊 [BOOKING FIELD] Court bookings updated` - Mostra le prenotazioni caricate
   - `🎯 [BOOKING FIELD] Hole prevention rules are ACTIVE` - Conferma che le regole sono attive

## Scenari di Test

### Test 1: Prenotazione di Base
1. **Seleziona un campo**
2. **Seleziona data di oggi**
3. **Prova a selezionare orario 15:00** (dopo la prenotazione test alle 14:00-15:00)
4. **Aspettati:** Slot dovrebbe essere disponibile

### Test 2: Creazione Buco da 30min
1. **Seleziona campo**
2. **Seleziona data di oggi** 
3. **Prova orario 15:30** (creerebbe buco 15:00-15:30)
4. **Aspettati:** 
   - Log `❌ [HOLE BLOCKED] Would create 30min hole AFTER booking`
   - Slot dovrebbe essere disabilitato

### Test 3: Test Durate
1. **Seleziona campo + data + orario valido**
2. **Guarda le opzioni di durata** (60, 90, 120 min)
3. **Cerca log:** `🕐 [DURATION CHECK] Checking duration XXXmin`
4. **Aspettati:** Durate che creano buchi dovrebbero essere disabilitate

## Log da Cercare

### ✅ Log Positivi (tutto funziona)
- `✅ [HOLE CHECK] No problematic holes detected`
- `✅ [BOOKING FIELD] Duration XXXmin is available`
- `✅ [DURATION BOOKABLE] Duration XXXmin is bookable`

### ❌ Log di Blocco (regola funziona)
- `❌ [HOLE BLOCKED] Would create XXXmin hole AFTER/BEFORE booking`
- `❌ [BOOKING FIELD] Blocked due to hole prevention rule`
- `❌ [DURATION CHECK] Duration XXXmin → BLOCKED`

### 🎯 Log di Deroga (casi speciali)
- `🎯 [EXEMPTION APPLIED] Exactly 120min trapped slot allows XXXmin hole`

## Problemi Possibili

Se non vedi i log:
1. **Verifica che il servizio di sviluppo sia attivo** (`npm run dev`)
2. **Ricarica la pagina** per vedere i log di inizializzazione
3. **Controlla che sei nella tab "Prenota campo"** e non in admin
4. **Assicurati di essere loggato** per vedere tutte le validazioni

## Dati di Test Aggiunti
- **Prenotazione test:** Campo 1, oggi alle 14:00-15:00
- **Questo crea scenario perfetto** per testare buchi da 30 minuti
