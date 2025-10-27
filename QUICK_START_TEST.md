# 🚀 QUICK START - Test Form Registrazione

## ⚡ ACCESSO IMMEDIATO

```
Local:   http://localhost:5173/register-club
Mobile:  http://192.168.1.72:5173/register-club
```

---

## ✅ TEST RAPIDO (5 minuti)

### **Step 1: Dati Circolo**
```
Nome Circolo:     Tennis Club Milano
Email:            test@tennisclub.it
Telefono:         +39 02 1234567
Password:         Tennis2024!
Conferma Password: Tennis2024!
```
✅ Verifica: Messaggio verde "Password valida"
✅ Click: **Continua →**

---

### **Step 2: Dettagli & Indirizzo**

#### **Logo (opzionale)**
- Salta o carica un'immagine PNG/JPG

#### **Descrizione (opzionale)**
```
Circolo sportivo nel cuore di Milano con 6 campi da tennis
```

#### **Google Maps (testa auto-fill)** 🔥
```
https://www.google.com/maps/place/Duomo+di+Milano/@45.4641,9.1899,17z
```
🔄 **Attendi 2-3 secondi** → campi auto-compilati!

#### **Indirizzo (verifica auto-compilazione)**
```
Via:       [AUTO] Piazza del Duomo
Città:     [AUTO] Milano
CAP:       [AUTO] 20122
Provincia: [AUTO] MI
```

✅ Click: **Completa Registrazione**

---

## 🎯 COSA VERIFICARE

### ✅ **Password Validation**
- [ ] Password < 8 caratteri → pulsante disabilitato
- [ ] Password senza speciale → messaggio errore rosso
- [ ] Password valida → messaggio verde ✅

### ✅ **Auto-fill Google Maps**
- [ ] Incolla link → spinner appare
- [ ] Attendi → campi compilati automaticamente
- [ ] Link sbagliato → nessun errore, compila manuale

### ✅ **Submit**
- [ ] Campi obbligatori vuoti → pulsante disabilitato
- [ ] Tutti compilati → pulsante verde abilitato
- [ ] Click → alert conferma
- [ ] Redirect → homepage

---

## 🐛 SE QUALCOSA NON FUNZIONA

### **Password non accettata**
```
✅ Minimo 8 caratteri
✅ Almeno 1 speciale: !@#$%^&*(),.?":{}|<>
✅ Esempio valido: Tennis2024!
```

### **Auto-fill non funziona**
```
⚠️ Usa il link COMPLETO da Google Maps
⚠️ Deve contenere coordinate: @45.4641,9.1899
⚠️ Se non funziona, compila manualmente (è opzionale)
```

### **CAP non accettato**
```
✅ Deve essere esattamente 5 cifre
✅ Solo numeri: 20100
❌ Non valido: 201, 2010, 20100A
```

---

## 📸 SCREENSHOTS ATTESI

### **Step 1 - Password Valida**
```
[Input Password]
✅ Password valida (testo verde)
ℹ️ Deve contenere almeno 8 caratteri e un carattere speciale
```

### **Step 2 - Google Maps**
```
[Box blu con bordo]
🌍 Link Google Maps (opzionale ma consigliato)
ℹ️ Incolla il link completo da Google Maps per auto-compilare l'indirizzo
[Input field]
🔄 Estrazione indirizzo in corso... (quando attivo)
```

### **Step 2 - Indirizzo Auto-compilato**
```
📍 Indirizzo Completo *
Via: Piazza del Duomo [grigio chiaro, pre-compilato]
Città: Milano [grigio chiaro, pre-compilato]
CAP: 20122 [grigio chiaro, pre-compilato]
Provincia: MI [grigio chiaro, pre-compilato]
```

---

## 🎨 DARK MODE TEST

1. Attiva dark mode (se disponibile)
2. Naviga form
3. Verifica:
   - [ ] Testi leggibili (bianco su scuro)
   - [ ] Bordi visibili
   - [ ] Input fields con bg scuro
   - [ ] Pulsanti con contrasto
   - [ ] Messaggi errore/successo leggibili

---

## 📱 MOBILE TEST

**Device consigliati:**
- iPhone 12 (390x844)
- Samsung Galaxy S21 (360x800)
- iPad (768x1024)

**Apri su mobile:**
```
http://192.168.1.72:5173/register-club
```

**Verifica:**
- [ ] Form a tutta larghezza
- [ ] Campi impilati verticalmente
- [ ] Pulsanti touch-friendly
- [ ] Progress bar visibile
- [ ] Google Maps box non overflow
- [ ] Logo preview dimensione ok

---

## ⏱️ PERFORMANCE

**Tempi attesi:**
```
Page load:         < 2s
Password feedback: Istantaneo
Auto-fill Maps:    2-4s
Logo upload:       3-8s (dipende da dimensione)
Submit:            2-5s
```

---

## 🎯 SUCCESS CRITERIA

### ✅ **Minimo Required**
- [ ] Form si apre senza errori
- [ ] Step 1 completabile
- [ ] Step 2 completabile
- [ ] Submit crea account
- [ ] Redirect funziona

### 🌟 **Full Success**
- [ ] Password validation con feedback
- [ ] Google Maps auto-fill funziona
- [ ] Tutti i campi validati
- [ ] Dark mode ok
- [ ] Mobile responsive
- [ ] No console errors

---

## 🆘 TROUBLESHOOTING

### **Errore Console**
```javascript
// Apri DevTools (F12)
// Tab Console
// Cerca errori rossi
// Screenshot e report
```

### **Form non carica**
```bash
# Verifica server
npm run dev

# Verifica porta
http://localhost:5173

# Cancella cache
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### **Submit non funziona**
```
1. Apri DevTools → Network
2. Tenta submit
3. Verifica richieste Firebase
4. Screenshot errori
```

---

## 📊 REPORT TEMPLATE

```markdown
### Test Report

**Data**: [data test]
**Browser**: [Chrome/Firefox/Safari]
**OS**: [Windows/Mac/Linux]

#### ✅ Passed
- [ ] Password validation
- [ ] Google Maps auto-fill
- [ ] Form submit
- [ ] Redirect

#### ❌ Failed
- [ ] [Descrivi issue]
- [ ] [Descrivi issue]

#### 📸 Screenshots
[Allega screenshots]

#### 💬 Notes
[Note aggiuntive]
```

---

## 🎉 READY TO TEST!

Il form è **pronto per essere testato**.

**Server in esecuzione**: ✅  
**URL**: http://localhost:5173/register-club  
**Documentazione**: ✅  
**Test guide**: ✅  

**Buon test! 🚀**
