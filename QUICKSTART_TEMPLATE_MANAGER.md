# 🚀 Quick Start - Template Notifiche Multicanale

**Per admin club che vogliono personalizzare le notifiche dei certificati medici**

---

## ✅ Cosa puoi fare

Personalizza i messaggi inviati ai giocatori per certificati:
- **Scaduti** ⚠️
- **In scadenza** 🔔
- **Mancanti** ❌

Su **3 canali**:
- 📧 **Email**
- 💬 **WhatsApp** (template pronti, invio in arrivo)
- 🔔 **Push Notification**

---

## 🎯 Come Usare (3 passi)

### 1. Apri Gestione Template

```
Dashboard Admin → Giocatori → Certificati Medici → ⚙️ Gestione Template
```

### 2. Personalizza i Template

1. Scegli il **canale** (Email, WhatsApp o Push)
2. Scegli lo **stato** (Scaduto, In Scadenza, Mancante)
3. Modifica il testo usando le **variabili**:
   - `{{nome}}` → Nome giocatore
   - `{{dataScadenza}}` → Data scadenza (es. "15/12/2025")
   - `{{giorniRimanenti}}` → Giorni mancanti (es. "10")
   - `{{nomeClub}}` → Nome del tuo club

### 3. Salva

Clicca **💾 Salva Template**. I template personalizzati verranno usati automaticamente per le prossime notifiche.

---

## 📝 Esempi Variabili

**Prima:**
```
Ciao {{nome}}, il tuo certificato scade il {{dataScadenza}}
```

**Dopo (con dati reali):**
```
Ciao Mario Rossi, il tuo certificato scade il 15/12/2025
```

---

## 🎨 Anteprime

Ogni template mostra un'**anteprima live** con dati di esempio per vedere il risultato finale.

### Email
Anteprima con oggetto e corpo formattato.

### WhatsApp
Anteprima stile chat con formattazione markdown:
- `*testo*` → **grassetto**
- `_testo_` → _corsivo_

### Push
Anteprima stile notifica mobile (iOS/Android).

---

## 💡 Suggerimenti

### Email
- Usa oggetto chiaro e diretto
- Corpo può essere lungo (multilinea)
- Usa tono formale

### WhatsApp
- **Breve** (max 200 caratteri)
- Usa emoji per visibilità
- Usa `*grassetto*` per info importanti

### Push
- **Titolo:** Max 50 caratteri
- **Testo:** Max 200 caratteri (consigliato: 120)
- Mantieni conciso (notifiche mobile hanno poco spazio!)

---

## 🔄 Ripristino Default

Se vuoi tornare ai template predefiniti:
1. Clicca **↺ Ripristina Predefiniti**
2. Conferma (le modifiche andranno perse)
3. Salva

---

## ❓ Domande Frequenti

**Q: Posso usare HTML nelle email?**  
A: Per ora solo testo semplice. HTML rich in arrivo.

**Q: WhatsApp funziona già?**  
A: Solo template pronti. Invio WhatsApp in arrivo in prossimo aggiornamento.

**Q: I template sono condivisi tra admin dello stesso club?**  
A: Sì! Ogni club ha i propri template condivisi tra tutti gli admin.

**Q: Posso usare variabili diverse?**  
A: Per ora solo le 4 variabili elencate. Altre in arrivo.

---

## 🆘 Problemi?

1. **Template non salvati:** Controlla di essere admin del club
2. **Anteprima non funziona:** Ricarica la pagina
3. **Variabili non sostituite:** Controlla di aver scritto `{{nome}}` esattamente così

**Supporto:** Controlla console browser (F12) per errori.

---

**Versione:** 1.0.0  
**Data:** 20 Novembre 2025
