# 🧪 GUIDA TEST FORM REGISTRAZIONE CIRCOLI

## 🎯 SCENARI DI TEST

### **TEST 1: Registrazione Completa (Happy Path)** ✅

**Step 1: Dati Circolo**
```
Nome Circolo: Tennis Club Milano
Email: info@tennisclubmi.it
Telefono: +39 02 1234567
Password: Milano2024!
Conferma Password: Milano2024!
```
✅ Password valida (8 char + speciale)
✅ Click "Continua →"

**Step 2: Dettagli & Indirizzo**

*Opzionali:*
```
Logo: [Carica immagine PNG/JPG]
Descrizione: "Circolo sportivo nel cuore di Milano con 6 campi da tennis"
```

*Google Maps (per auto-fill):*
```
https://www.google.com/maps/place/Milano+MI/@45.4642,9.1900,17z
```
🔄 Attendi auto-compilazione...

*Indirizzo (auto-compilato o manuale):*
```
Via: Via Palestro, 16
Città: Milano
CAP: 20121
Provincia: MI
```

✅ Click "Completa Registrazione"

**Risultato Atteso:**
- ✅ Account Firebase creato
- ✅ Richiesta salvata in `clubRegistrationRequests`
- ✅ Profilo utente creato
- ✅ Alert di conferma
- ✅ Redirect a homepage

---

### **TEST 2: Validazione Password** ❌

**Test 2.1: Password troppo corta**
```
Password: Pass123!
```
❌ Errore: "Password non valida (serve 8 caratteri + 1 speciale)"
❌ Pulsante "Continua" disabilitato

**Test 2.2: Password senza carattere speciale**
```
Password: Password123
```
❌ Errore: "Password non valida (serve 8 caratteri + 1 speciale)"
❌ Pulsante "Continua" disabilitato

**Test 2.3: Password valida**
```
Password: Milano2024!
```
✅ Messaggio verde: "Password valida"
✅ Pulsante "Continua" abilitato

---

### **TEST 3: Auto-fill Google Maps** 🗺️

**Test 3.1: Link corretto**
```
https://www.google.com/maps/place/Piazza+del+Duomo/@45.4641,9.1900,17z
```
✅ Spinner appare
✅ Messaggio: "Estrazione indirizzo in corso..."
✅ Campi auto-compilati:
   - Via: Piazza del Duomo, 1
   - Città: Milano
   - CAP: 20121
   - Provincia: MI

**Test 3.2: Link senza coordinate**
```
https://www.google.com/maps
```
❌ Nessuna auto-compilazione
⚠️ Console: "Coordinate non trovate nel link"
✅ Utente può compilare manualmente

**Test 3.3: Link non Google Maps**
```
https://www.openstreetmap.org
```
❌ Nessuna auto-compilazione
✅ Nessun errore mostrato
✅ Utente può compilare manualmente

---

### **TEST 4: Validazione Campi Obbligatori** ❌

**Test 4.1: CAP non valido**
```
CAP: 123
```
❌ Errore HTML5 validation: "Please match the format requested"
❌ Pattern richiesto: [0-9]{5}

**Test 4.2: Provincia mancante**
```
Provincia: (vuoto)
```
❌ Pulsante "Completa Registrazione" disabilitato

**Test 4.3: Città mancante**
```
Città: (vuoto)
```
❌ Pulsante "Completa Registrazione" disabilitato

**Test 4.4: Tutti i campi compilati**
```
Via: Via Roma, 1
Città: Milano
CAP: 20100
Provincia: MI
```
✅ Pulsante "Completa Registrazione" abilitato

---

### **TEST 5: Logo Upload** 🖼️

**Test 5.1: Upload PNG valido**
```
File: logo.png (2 MB)
```
✅ Preview mostrato
✅ Pulsante X per rimuovere
✅ Upload su Cloudinary in background

**Test 5.2: File troppo grande**
```
File: logo.jpg (8 MB)
```
❌ Alert: "Il file è troppo grande. Dimensione massima: 5MB"
❌ Logo non caricato

**Test 5.3: File non immagine**
```
File: documento.pdf
```
❌ Alert: "Formato file non valido. Usa PNG, JPG o GIF"
❌ Logo non caricato

**Test 5.4: Rimozione logo**
```
1. Carica logo.png
2. Click pulsante X
```
✅ Logo rimosso
✅ Preview nascosto
✅ Può caricare nuovo logo

---

### **TEST 6: Email Duplicata** ❌

**Scenario:**
1. Registra circolo con email: `test@example.com`
2. Prova a registrare altro circolo con stessa email

**Risultato Atteso:**
❌ Errore Firebase: `auth/email-already-in-use`
❌ Messaggio: "Questa email è già registrata. Usa un'altra email o accedi."

---

### **TEST 7: Password Non Corrispondente** ❌

```
Password: Milano2024!
Conferma Password: Milano2025!
```
❌ Errore: "Le password non corrispondono"
❌ Pulsante "Continua" disabilitato

---

### **TEST 8: Navigazione Step** ↔️

**Test 8.1: Avanti e Indietro**
```
1. Compila Step 1 → Click "Continua"
2. Arrivi a Step 2
3. Click "← Indietro"
4. Torni a Step 1
5. Dati Step 1 ancora presenti
```
✅ Dati persistono durante navigazione

**Test 8.2: Progress Indicator**
```
Step 1: Numero "1" evidenziato in blu
Step 2: Numero "2" evidenziato in blu
Step 1 completato: Icona Check ✓ verde
```
✅ Indicatori aggiornati correttamente

---

### **TEST 9: Dark Mode** 🌙

**Azioni:**
1. Attiva dark mode
2. Naviga form registrazione

**Verifica:**
- ✅ Testi leggibili (bianco su sfondo scuro)
- ✅ Bordi visibili
- ✅ Input fields con sfondo scuro
- ✅ Icone visibili
- ✅ Pulsanti con contrasto adeguato
- ✅ Alert e messaggi errore leggibili

---

### **TEST 10: Mobile Responsive** 📱

**Device:** iPhone 12 (390x844)

**Verifica:**
- ✅ Form occupa tutta la larghezza
- ✅ Campi impilati verticalmente
- ✅ Pulsanti touch-friendly (min 44x44px)
- ✅ Testi leggibili (font-size adeguato)
- ✅ Progress bar visibile
- ✅ Google Maps box non overflow
- ✅ Logo preview dimensione corretta

---

## 🔧 DATI DI TEST

### **Circolo 1: Tennis Club**
```
Nome: Tennis Club Milano
Email: tennis@example.com
Telefono: +39 02 1234567
Password: TennisClub2024!
Via: Via Palestro, 16
Città: Milano
CAP: 20121
Provincia: MI
Google Maps: https://www.google.com/maps/place/Milano+MI/@45.4642,9.1900,17z
```

### **Circolo 2: Padel Center**
```
Nome: Padel Center Roma
Email: padel@example.com
Telefono: +39 06 7654321
Password: PadelRoma2024!
Via: Via Nazionale, 45
Città: Roma
CAP: 00184
Provincia: RM
Google Maps: https://www.google.com/maps/place/Roma+RM/@41.9028,12.4964,17z
```

### **Circolo 3: Sporting Club**
```
Nome: Sporting Club Torino
Email: sporting@example.com
Telefono: +39 011 9876543
Password: Sporting2024!
Via: Corso Vittorio Emanuele II, 78
Città: Torino
CAP: 10121
Provincia: TO
Google Maps: https://www.google.com/maps/place/Torino+TO/@45.0703,7.6869,17z
```

---

## 📊 CHECKLIST TEST

### **Funzionalità**
- [ ] Validazione password 8 char + speciale
- [ ] Feedback visivo password (❌/✅)
- [ ] Auto-fill da Google Maps
- [ ] Upload logo con preview
- [ ] Rimozione logo
- [ ] Validazione CAP (5 cifre)
- [ ] Provincia uppercase (2 lettere)
- [ ] Campi obbligatori enforced
- [ ] Progress bar 2 step
- [ ] Navigazione avanti/indietro
- [ ] Submit form completo
- [ ] Alert conferma
- [ ] Redirect dopo successo

### **Validazioni**
- [ ] Email già registrata → errore
- [ ] Password non corrisponde → errore
- [ ] CAP invalido → errore HTML5
- [ ] Campi obbligatori vuoti → pulsante disabilitato
- [ ] Password < 8 char → errore
- [ ] Password senza speciale → errore

### **Edge Cases**
- [ ] Google Maps link invalido → gestito
- [ ] Logo > 5MB → alert errore
- [ ] Logo non immagine → alert errore
- [ ] Descrizione vuota → permesso (opzionale)
- [ ] Google Maps vuoto → permesso (opzionale)
- [ ] Network error → gestito

### **UI/UX**
- [ ] Dark mode funzionante
- [ ] Mobile responsive
- [ ] Loading states visibili
- [ ] Error messages chiari
- [ ] Success feedback presente
- [ ] Icone renderizzate
- [ ] Layout non rotto

---

## 🐛 BUG REPORT TEMPLATE

```markdown
### Bug: [Titolo breve]

**Severità:** 🔴 Alta / 🟡 Media / 🟢 Bassa

**Passi per riprodurre:**
1. Vai su /register-club
2. Compila Step 1 con...
3. Click su...
4. Osserva...

**Risultato Atteso:**
[Cosa dovrebbe succedere]

**Risultato Ottenuto:**
[Cosa succede invece]

**Screenshot:**
[Allega screenshot]

**Browser/Device:**
- Browser: Chrome 120
- OS: Windows 11
- Viewport: 1920x1080

**Console Errors:**
```
[Errori dalla console]
```

**Priorità:** P0 / P1 / P2 / P3
```

---

## ✅ CRITERI DI ACCETTAZIONE

### **Funzionali**
1. ✅ Form a 2 step funzionante
2. ✅ Password 8 char + speciale validata
3. ✅ Google Maps auto-fill funzionante (quando possibile)
4. ✅ Tutti i campi obbligatori enforced
5. ✅ Logo upload opzionale con preview
6. ✅ Submit crea account + richiesta
7. ✅ Redirect dopo successo

### **Non-Funzionali**
1. ✅ Responsive su mobile
2. ✅ Dark mode supportato
3. ✅ Loading states visibili
4. ✅ Error handling robusto
5. ✅ Accessibilità (labels, focus, etc.)
6. ✅ Performance accettabile (<3s load)

---

**Test Suite Preparata**: ✅  
**Pronto per Testing Manuale**: ✅  
**Data**: 20 Ottobre 2025
