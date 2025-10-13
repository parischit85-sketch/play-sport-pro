# 🔧 Push Notifications - Troubleshooting

## ❌ Errore: "Servizio Push non configurato (VAPID mancante)"

### Problema
```
Errore: Giacomo Paris: Servizio Push non configurato (VAPID mancante) 
[push-service-unconfigured]
```

### Causa
Le chiavi VAPID non sono configurate correttamente nell'ambiente di sviluppo locale.

### ✅ Soluzione

#### 1. Verifica `.env.local`
Il file deve contenere:
```bash
# VAPID Keys corrette (aggiornate 2025-10-13)
VITE_VAPID_PUBLIC_KEY=BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM
VAPID_PUBLIC_KEY=BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM
VAPID_PRIVATE_KEY=I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I
```

#### 2. Riavvia il Dev Server
```bash
# Ferma il server corrente (Ctrl+C)
# Poi riavvia:
npm run dev
```

#### 3. Hard Refresh del Browser
- **Chrome/Edge**: `Ctrl + F5` o `Ctrl + Shift + R`
- **Firefox**: `Ctrl + F5` o `Ctrl + Shift + R`
- Oppure: DevTools → Application → Clear Storage → Clear site data

#### 4. Verifica Service Worker
1. Apri DevTools (F12)
2. Vai su **Application** → **Service Workers**
3. Verifica che il Service Worker sia:
   - ✅ Activated and running
   - ✅ URL: `/sw.js`
4. Se necessario, clicca "Unregister" e ricarica la pagina

---

## 🔍 Diagnostica Completa

### Verifica Variabili d'Ambiente

**Locale (Development)**:
```bash
# Nel file .env.local
VITE_VAPID_PUBLIC_KEY=BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM
```

**Netlify (Production)**:
```bash
# Configurato via Netlify UI o CLI
VAPID_PUBLIC_KEY=BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM
VAPID_PRIVATE_KEY=I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I
```

### Verifica Code in `src/utils/push.js`

La chiave VAPID dovrebbe essere:
```javascript
const VAPID_PUBLIC_KEY =
  'BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM';
```

### Test Manuale Console

Apri la Console del browser e esegui:
```javascript
// Verifica Service Worker
navigator.serviceWorker.ready.then(reg => {
  console.log('SW ready:', reg);
});

// Verifica permessi notifiche
console.log('Notification permission:', Notification.permission);

// Test sottoscrizione push
import('/src/utils/push.js').then(push => {
  push.subscribeToPush().then(result => {
    console.log('Subscription result:', result);
  });
});
```

---

## 🐛 Altri Errori Comuni

### Errore: "Push manager not available"
**Causa**: Browser non supporta Push API o non in HTTPS  
**Soluzione**: 
- Usa Chrome/Edge/Firefox moderno
- Localhost è sempre permesso
- In produzione deve essere HTTPS

### Errore: "Notification permission denied"
**Causa**: Utente ha bloccato le notifiche  
**Soluzione**:
1. Click sull'icona lucchetto nella barra indirizzi
2. Notifiche → Consenti
3. Ricarica la pagina

### Errore: "Service Worker registration failed"
**Causa**: Errore nel file `/sw.js`  
**Soluzione**:
1. Verifica che `/public/sw.js` esista
2. Controlla errori nella console
3. Verifica che non ci siano errori di sintassi

### Errore: "Failed to subscribe the user: 403"
**Causa**: Chiave VAPID non valida o scaduta  
**Soluzione**:
1. Rigenera le chiavi VAPID
2. Aggiorna `.env.local` e Netlify env vars
3. Riavvia dev server e deployment

---

## 📊 Checklist Debugging

- [ ] `.env.local` contiene le chiavi VAPID corrette
- [ ] Dev server riavviato dopo modifiche `.env.local`
- [ ] Browser ricaricato con hard refresh (Ctrl+F5)
- [ ] Service Worker attivo in DevTools → Application
- [ ] Permessi notifiche concessi nel browser
- [ ] Nessun errore nella Console del browser
- [ ] `push.js` ha la chiave VAPID corretta hardcoded
- [ ] In produzione: Netlify env vars configurate
- [ ] Firebase credentials presenti (per salvare subscription)

---

## 🔐 Sicurezza

### Chiavi VAPID Corrette (Produzione)
```bash
Public:  BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM
Private: I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I
```

⚠️ **NOTA**: La chiave privata deve rimanere **SOLO** nel server (Netlify Functions), mai nel client!

---

## 🎯 Test Rapido

Dopo aver applicato la soluzione, testa:

1. **Apri la pagina Profile** → Sezione "🔔 Push Notifications"
2. **Click su "Abilita Notifiche"**
3. **Controlla messaggi**:
   - ✅ "Subscription salvata con successo"
   - ✅ Endpoint e keys visibili
4. **Click su "Invia Test"**
5. **Verifica notifica** ricevuta nel browser

Se tutto funziona, dovresti vedere:
```
✅ Subscription salvata con successo
✅ Notifica di test ricevuta
```

---

## 📞 Supporto

Se il problema persiste:
1. Controlla i logs di Netlify Functions
2. Verifica Firebase Console per errori
3. Controlla Network tab in DevTools
4. Verifica che le Functions siano deployate

**Link Utili**:
- Netlify Site: https://play-sport-pro-v2-2025.netlify.app
- Diagnostics: https://play-sport-pro-v2-2025.netlify.app/.netlify/functions/test-env
- Firebase Console: https://console.firebase.google.com
