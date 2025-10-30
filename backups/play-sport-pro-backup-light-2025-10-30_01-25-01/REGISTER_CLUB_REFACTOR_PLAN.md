// WORK IN PROGRESS - NUOVO FORM REGISTRAZIONE CIRCOLO
// File di riferimento per implementare i 3 step richiesti

## STRUTTURA STEP RICHIESTA

### Step 1: Dati Circolo Base ✅ IMPLEMENTATO
- Nome del circolo
- Email del circolo (usata per login)
- Telefono del circolo
- Password
- Conferma password

### Step 2: Logo e Dettagli ⏳ DA IMPLEMENTARE
- Logo (upload con preview)
- Descrizione del circolo
- Indirizzo (con ricerca/autocomplete georeferenziato)
  - Campo di ricerca con autocomplete Google Places
  - Compilazione automatica: via, città, provincia, CAP
  - Coordinate lat/lng salvate automaticamente
- Link Google Maps (opzionale)
  - Pulsante info con istruzioni per ottenere il link

### Step 3: Dati Operatore ⏳ DA IMPLEMENTARE
- Nome dell'operatore
- Cognome dell'operatore
- Email personale operatore (salvata nel profilo utente)
- Telefono personale operatore (salvato nel profilo utente)

## TODO

1. Implementare Step 2 con:
   - Input file per logo con preview
   - Campo ricerca indirizzo con Google Places Autocomplete
   - Estrazione automatica coordinate
   - Campo link Google Maps con modale istruzioni

2. Implementare Step 3 con:
   - Form dati operatore
   - Salvare questi dati nel profilo utente (users collection)

3. Aggiornare handleSubmit per:
   - Usare clubEmail per login (non adminEmail)
   - Salvare adminEmail e adminPhone nel profilo utente
   - Salvare coordinate indirizzo nel club

4. Aggiungere Google Places API:
   - Script nella pagina
   - Autocomplete component
   - Geocoding per coordinate

## PROSSIMI PASSI

1. Continuare l'implementazione dello Step 2
2. Implementare lo Step 3
3. Testare il flusso completo
4. Aggiungere validazioni
