# ✅ Checklist Setup Web Push Notifications

## 📦 Installazione completata
- [x] Installato `web-push` npm package
- [x] Creati file sorgente client (`src/utils/push.js`)
- [x] Creato componente UI (`PushNotificationPanel.jsx`)
- [x] Create Netlify Functions (send, save, remove)
- [x] Aggiunto pannello al profilo utente
- [x] Build verificata con successo

## 🔧 Configurazione Richiesta (DA FARE)

### 1. Genera VAPID Keys
```powershell
# Opzione A: Manuale
npx web-push generate-vapid-keys

# Opzione B: Con script
.\generate-vapid-keys.ps1
```

### 2. Aggiorna il codice con la Public Key
- [ ] Apri `src/utils/push.js`
- [ ] Sostituisci il valore di `VAPID_PUBLIC_KEY` con la chiave pubblica generata
- [ ] Salva il file

### 3. Configura Netlify Environment Variables
Vai su: Netlify Dashboard → Your Site → Site configuration → Environment variables

Aggiungi:
- [ ] `VAPID_PUBLIC_KEY` = [la tua public key]
- [ ] `VAPID_PRIVATE_KEY` = [la tua private key]

Verifica che esistano già:
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY`

### 4. Aggiorna email di contatto
- [ ] Apri `netlify/functions/send-push.js`
- [ ] Cerca `mailto:your-email@example.com`
- [ ] Sostituisci con la tua email reale
- [ ] Salva il file

### 5. Deploy
```powershell
git add .
git commit -m "feat: add Web Push notification system"
git push origin main
```

### 6. Test in Produzione
- [ ] Vai sul tuo profilo nell'app deployata
- [ ] Scorri fino al pannello "Notifiche Push"
- [ ] Clicca "Attiva Notifiche"
- [ ] Concedi il permesso nel browser
- [ ] Clicca "Invia Notifica di Test"
- [ ] Verifica che la notifica arrivi nel pannello del sistema
- [ ] Clicca sulla notifica per verificare che apra l'app

## 🎯 Integrazione con Booking System

Per inviare notifiche quando un utente viene aggiunto a una prenotazione:

```javascript
import { sendBookingAdditionPush } from '@/utils/notify';

// Nel tuo codice di gestione prenotazioni
await sendBookingAdditionPush({
  userId: 'user-id-qui',
  court: 'Campo 1',
  time: '18:00',
  club: 'Nome Club',
  date: '2025-10-07',
  bookingId: 'booking-id-qui'
});
```

## ⚠️ Note Importanti

1. **HTTPS obbligatorio**: Le push notifications funzionano SOLO su HTTPS (ok su localhost)
2. **Private key**: NON committare mai la private key! Solo su Netlify env vars
3. **Browser support**: Chrome, Firefox, Edge, Safari (limitato iOS)
4. **Permessi**: L'utente deve concedere esplicitamente il permesso
5. **Service Worker**: Deve essere accessibile su `/sw.js` (già presente)

## 📖 Documentazione Completa

Per dettagli approfonditi, consulta: `WEB_PUSH_IMPLEMENTATION.md`

## 🆘 Troubleshooting

**Problema**: Le notifiche non arrivano
- Verifica VAPID keys su Netlify
- Controlla console browser per errori
- Verifica che HTTPS sia attivo
- Controlla Application → Service Workers in DevTools

**Problema**: Service Worker non si registra
- Verifica che `/sw.js` sia accessibile
- Controlla errori di sintassi
- Prova unregister/register manualmente

**Problema**: Notifica non apre l'app
- Verifica `data.url` nel payload
- Controlla evento `notificationclick` in `sw.js`
- Verifica permessi popup del browser

---

📅 Implementato: 7 Ottobre 2025
🔄 Stato: Codice completo, richiede configurazione VAPID
