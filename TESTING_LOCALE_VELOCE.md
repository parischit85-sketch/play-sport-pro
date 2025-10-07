# 🚀 Testing Notifiche Push in Locale - Guida Rapida

## ⚠️ NOTA IMPORTANTE
Per semplicità, testiamo il **frontend in locale** (Vite) ma usiamo le **Netlify Functions in produzione**.
Questo evita problemi con `netlify dev` e funziona perfettamente per testare modifiche al frontend.

## Prerequisiti
- ✅ `.env.local` già configurato
- ✅ Functions deployate in produzione su Netlify

## Avvio Rapido

### 1. Avvia Solo Vite (frontend locale)

```powershell
npm run dev
```

Aspetta che compaia:
```
VITE v7.1.9  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.X.X:5173/
```

### 2. Apri il Browser

Vai su: **http://localhost:5173**

### 3. Testa le Notifiche

1. **Login** nell'app
2. Vai su **Profilo**
3. Scorri fino a **"Notifiche Push"**
4. Clicca **"Attiva Notifiche"** → Accetta permesso
5. Clicca **"Invia Notifica di Test"**
6. Riceverai la notifica! 🎉

### 4. Vedi i Log

**Nella Console del Browser (F12)**:
```
[saveSubscription] Saving subscription for userId: ...
[saveSubscription] Response status: 200
✅ Sottoscrizione push salvata con successo
```

**Log delle Functions** (produzione):
- Vai su Netlify Dashboard → Functions → Logs
- Oppure usa: `netlify functions:log send-push --stream`

## 🔄 Modificare e Testare

### Modifica Frontend (hot reload ⚡)
1. Modifica `src/components/debug/PushNotificationPanel.jsx`
2. Modifica `src/utils/push.js`
3. Salva → **ricarica automaticamente**
4. Testa subito nel browser

### Modifica Functions (richiede deploy)
1. Modifica `netlify/functions/send-push.js`
2. Commit e push su GitHub
3. Aspetta deploy Netlify (2-3 min)
4. Testa la notifica

## ⚠️ Note Importanti

- **Frontend in locale** (http://localhost:5173) - hot reload velocissimo ⚡
- **Functions in produzione** (play-sport-pro-v2-2025.netlify.app) - già deployate
- **Firestore in produzione** - le sottoscrizioni vengono salvate nel vero database
- **Modifiche frontend**: immediate con hot reload
- **Modifiche functions**: richiedono commit + push + deploy

## 💡 Perché Questo Approccio?

✅ **Hot reload veloce** per il frontend
✅ **Nessun problema con Netlify Dev**
✅ **Functions sempre aggiornate** (usi quelle già deployate)
✅ **Workflow semplice**: modifica → salva → testa
❌ Non vedi i log delle Functions in locale (usa Netlify Dashboard)

## 🐛 Troubleshooting

### Errore "Port 5173 already in use"
```powershell
# Ferma tutti i processi Node
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Riavvia
npm run dev
```

### Functions non funzionano
1. Verifica che siano deployate: vai su Netlify Dashboard → Functions
2. Controlla i log: Netlify Dashboard → Functions → click sulla function → Logs
3. Se hai modificato le Functions, **devi** fare commit + push

### CORS errors
Se vedi errori CORS:
- Le Functions Netlify hanno già CORS abilitato
- Verifica che il sito locale usi `http://localhost:5173` (non HTTPS)

## ✅ Quick Checklist

Prima di testare:
- [ ] `npm run dev` in esecuzione senza errori
- [ ] Browser su `http://localhost:5173`
- [ ] Login effettuato
- [ ] Console browser aperta (F12)
- [ ] Functions deployate su Netlify (controlla Dashboard)

## 🚀 Workflow Completo

```
1. Modifica codice frontend (es. PushNotificationPanel.jsx)
2. Salva → hot reload automatico
3. Testa nel browser (localhost:5173)
4. Se funziona → commit + push
5. Deploy automatico su Netlify
```

---

**Documenti Completi**:
- Setup dettagliato con Netlify Dev: `LOCAL_PUSH_TESTING.md`
- Implementazione completa: `WEB_PUSH_IMPLEMENTATION.md`
- Setup VAPID: `NETLIFY_VAPID_SETUP.md`
