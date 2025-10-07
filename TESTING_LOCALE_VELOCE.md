# 🚀 Testing Notifiche Push in Locale - Guida Rapida

## Prerequisiti
- ✅ `.env.local` già configurato con tutte le chiavi
- ✅ Netlify CLI già installato

## Avvio Rapido

### 1. Avvia il Server Locale

```powershell
netlify dev
```

Aspetta che compaia:
```
╭──────────── ⬥  ─────────────╮
│                             │
│   Local dev server ready:   │
│    http://localhost:8888    │
│                             │
╰─────────────────────────────╯
```

### 2. Apri il Browser

Vai su: **http://localhost:8888**

⚠️ **Nota**: Se vedi errori sulla console di Netlify Dev, **IGNORA**. Finché vedi "Local dev server ready", funziona.

### 3. Testa le Notifiche

1. **Login** nell'app
2. Vai su **Profilo**
3. Scorri fino a **"Notifiche Push"**
4. Clicca **"Attiva Notifiche"** → Accetta permesso
5. Clicca **"Invia Notifica di Test"**
6. Riceverai la notifica! 🎉

### 4. Vedi i Log

**Nel terminale di Netlify Dev** vedrai:
```
[save-push-subscription] Saving subscription...
[send-push] Sending notification...
```

**Nella Console del Browser (F12)**:
```
[saveSubscription] Response status: 200
✅ Sottoscrizione push salvata con successo
```

## 🔄 Modificare e Testare

### Modifica Frontend (hot reload)
1. Modifica `src/components/debug/PushNotificationPanel.jsx`
2. Salva → ricarica automaticamente
3. Testa subito

### Modifica Functions (richiede restart)
1. Modifica `netlify/functions/send-push.js`
2. **Ferma** Netlify Dev: `Ctrl+C`
3. **Riavvia**: `netlify dev`
4. Testa la notifica

## ⚠️ Note Importanti

- **Le sottoscrizioni vengono salvate nel vero Firestore** (non in locale)
- I log delle Functions appaiono nel terminale dove hai eseguito `netlify dev`
- Se cambi le Functions, **DEVI riavviare** `netlify dev`

## 🐛 Troubleshooting

### Errore "Port 5173 already in use"
```powershell
# Ferma tutti i processi Node
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Riavvia
netlify dev
```

### Functions non funzionano
1. Verifica che `.env.local` esista
2. Riavvia `netlify dev`
3. Controlla i log nel terminale

### Certificato HTTPS
Se usi HTTPS locale (`https://localhost:8888`):
- Accetta il certificato autofirmato quando richiesto

## ✅ Quick Checklist

Prima di testare:
- [ ] `netlify dev` in esecuzione senza errori bloccanti
- [ ] Browser su `http://localhost:8888`
- [ ] Login effettuato
- [ ] Console browser aperta (F12)

---

**Documenti Completi**:
- Setup dettagliato: `LOCAL_PUSH_TESTING.md`
- Implementazione: `WEB_PUSH_IMPLEMENTATION.md`
- Setup VAPID: `NETLIFY_VAPID_SETUP.md`
