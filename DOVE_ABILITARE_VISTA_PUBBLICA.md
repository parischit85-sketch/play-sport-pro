# 📍 Dove Abilitare la Vista Pubblica

## 🎯 Posizione nel Pannello Admin

La **Vista Pubblica** è ora disponibile nella **Tab "Panoramica"** di ogni torneo.

### 🗺️ Percorso Completo

1. **Login** come admin del club
2. Vai a **Tornei** dal menu
3. Clicca su un **torneo esistente**
4. Assicurati di essere nella tab **"Panoramica"** (prima tab)
5. **Scorri verso il basso** dopo la sezione "Informazioni Torneo"
6. Troverai la sezione **"Vista Pubblica"**

### 📸 Struttura Visuale

```
┌─────────────────────────────────────┐
│  🏆 Nome Torneo                     │
│  ================================   │
│  📊 Progress Bar                    │
│  --------------------------------   │
│  📈 Quick Stats (4 card)           │
│  --------------------------------   │
│  ℹ️ Informazioni Torneo            │
│     - Nome, Formato                │
│     - Date, Descrizione            │
│     - Configurazione               │
│  ================================   │
│                                     │
│  👁️ VISTA PUBBLICA ← QUI!         │
│  ================================   │
│  🎬 Azioni                         │
│     - Apri Iscrizioni              │
│     - Genera Gironi                │
│     - etc.                         │
└─────────────────────────────────────┘
```

---

## ✅ Verifica che Sei Admin

La sezione "Vista Pubblica" è **visibile solo agli admin del club**.

Per verificare:
- Controlla se vedi la sezione "Azioni" nella Panoramica
- Se NON vedi "Azioni" → non sei admin → contatta il proprietario del club

---

## 🚀 Come Abilitare (Step-by-Step)

### Step 1: Trova la Sezione
Scorri nella tab "Panoramica" fino a trovare:

```
┌─────────────────────────────────────┐
│  Vista Pubblica                     │
│  Condividi il torneo su schermi     │
│  pubblici senza autenticazione      │
│                                     │
│  [Abilita] ← Clicca qui            │
└─────────────────────────────────────┘
```

### Step 2: Abilita
1. Clicca sul pulsante **"Abilita"**
2. Il sistema genera automaticamente un **token sicuro**
3. Appariranno due link:
   - 📱 **Vista Smartphone**
   - 📺 **Vista TV**

### Step 3: Condividi
Hai 3 opzioni:

**A. Copia Link Manualmente**
```
┌─────────────────────────────────────┐
│  📱 Vista Smartphone                │
│  [link lungo...] [📋 Copia] [👁️]  │
└─────────────────────────────────────┘
```
- Clicca su **📋 Copia**
- Incolla dove vuoi (WhatsApp, email, etc.)

**B. Apri Preview**
- Clicca sull'icona **👁️** per aprire in nuova finestra
- Testa la vista prima di condividere

**C. Usa QR Code**
- Scorri fino a "Mostra QR Code"
- Clicca per visualizzare
- Scarica l'immagine o mostrala direttamente

---

## ⚙️ Configurazione

### Intervallo Auto-Scroll
Cambia ogni quanto tempo i gironi si alternano:
- **10 secondi** (veloce)
- **15 secondi** (default)
- **20-30 secondi** (medio)
- **60 secondi** (lento)

### QR Code (Vista Smartphone)
Toggle per mostrare/nascondere il QR code in fondo alla pagina mobile.

---

## 🔒 Sicurezza

### Rigenerare Token
Se il link è stato condiviso per errore o vuoi invalidare l'accesso:

1. Scorri fino a "Sicurezza"
2. Clicca **"Rigenera Token"**
3. Conferma l'azione
4. ⚠️ I vecchi link smetteranno di funzionare
5. Condividi i nuovi link generati

---

## 📱 Link Generati

### Vista Smartphone
```
https://tuo-dominio.com/public/tournament/CLUB_ID/TOURNAMENT_ID/TOKEN
```

**Caratteristiche:**
- ✅ Responsive (mobile/tablet)
- ✅ Navigazione touch
- ✅ Auto-scroll tra gironi
- ✅ QR code opzionale in fondo
- ✅ Frecce e indicatori

### Vista TV
```
https://tuo-dominio.com/public/tournament-tv/CLUB_ID/TOURNAMENT_ID/TOKEN
```

**Caratteristiche:**
- ✅ Ottimizzata per schermi grandi
- ✅ Font molto grandi
- ✅ Bordi colorati (fucsia)
- ✅ Pagina QR dedicata nel ciclo
- ✅ Auto-scroll automatico

---

## 🎯 Casi d'Uso

### 🏟️ Torneo al Circolo
1. Abilita vista pubblica
2. Mostra QR code
3. Stampa il QR code
4. Posiziona all'ingresso
5. I giocatori scansionano e seguono live

### 📺 Proiezione su TV
1. Abilita vista pubblica
2. Copia link TV
3. Apri link su PC/tablet connesso alla TV
4. Metti in fullscreen (F11)
5. Lascia girare in automatico

### 📱 Gruppo WhatsApp
1. Abilita vista pubblica
2. Copia link smartphone
3. Invia nel gruppo del torneo
4. Tutti seguono senza fare login

---

## ❓ FAQ

**Q: Non vedo la sezione "Vista Pubblica"**  
A: Verifica di essere admin del club. Solo gli admin possono abilitare la vista pubblica.

**Q: Posso disabilitare la vista dopo averla abilitata?**  
A: Sì! Clicca sul pulsante "Disabilita" nella stessa sezione.

**Q: Il link funziona anche dopo che chiudo il browser?**  
A: Sì, il link rimane attivo finché non disabiliti la vista o rigeneri il token.

**Q: Posso avere più token per lo stesso torneo?**  
A: No, esiste un solo token per torneo. Se lo rigeneri, il precedente smette di funzionare.

**Q: La vista pubblica mostra anche le partite in programma?**  
A: Sì, mostra tutte le partite di girone (completate e in programma).

**Q: Posso personalizzare i colori della vista pubblica?**  
A: Al momento no, i colori sono fissi. Feature in roadmap per versioni future.

---

## 🆘 Problemi Comuni

### "Accesso Negato" quando apro il link
**Causa:** Token non valido o vista disabilitata  
**Soluzione:** 
1. Verifica che la vista sia abilitata (pulsante "Disabilita" visibile)
2. Rigenera il token
3. Usa il nuovo link generato

### La classifica non si aggiorna
**Causa:** Problema di connessione o configurazione Firebase  
**Soluzione:**
1. Ricarica la pagina pubblica (F5)
2. Controlla la connessione internet
3. Verifica che il torneo sia in stato corretto

### L'auto-scroll è troppo veloce/lento
**Causa:** Intervallo non configurato correttamente  
**Soluzione:**
1. Torna alla sezione "Vista Pubblica"
2. Cambia l'intervallo dal menu a tendina
3. La modifica si applica immediatamente

---

## 📞 Supporto

Se hai problemi:
1. Controlla questa guida
2. Verifica di essere admin
3. Prova a disabilitare e riabilitare
4. Contatta il supporto tecnico

---

**Ultimo aggiornamento:** 28 Ottobre 2025  
**Versione:** 1.0.0
