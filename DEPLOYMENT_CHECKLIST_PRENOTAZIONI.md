# 🚀 DEPLOYMENT CHECKLIST - SISTEMA PRENOTAZIONI

**Data**: 13 Novembre 2025  
**Version**: 1.0 - Backup 30-10-2025  
**Target**: Production Deployment

---

## 📋 PRE-DEPLOYMENT VERIFICATION

### ✅ Code Review
- [ ] Cloud-bookings.js - Verificare funzioni cloud
- [ ] Unified-booking-service.js - Verificare logica principale
- [ ] Firestore.rules - Verificare security rules
- [ ] Nessun console.error() senza handler
- [ ] Nessun TODO in codice critico

### ✅ Firestore Configuration
- [ ] Composite index creato: (createdBy, createdAt) DESC
- [ ] Firestore.rules aggiornate e valide
- [ ] Database backup fatto
- [ ] Collection bookings accessibile

### ✅ Environment Variables
- [ ] Firebase project ID corretto
- [ ] Firestore emulator disabilitato in prod
- [ ] VITE_* variables corrette
- [ ] No hardcoded secrets

### ✅ Testing
- [ ] Unit tests passati
- [ ] Integration tests passati
- [ ] E2E tests passati
- [ ] Manual testing completato

---

## 🔧 FASE 1: DEPLOY FIRESTORE CONFIGURATION

### Passo 1.1: Backup Database
```bash
# Fare backup di Firestore
gcloud firestore export gs://backup-bucket/$(date +%s)
```

### Passo 1.2: Deploy Firestore Rules
```bash
# Verifica locale
firebase emulators:start --only firestore &
# Esegui test...
firebase emulators:stop

# Deploy a production
firebase deploy --only firestore:rules
```

**Atteso**:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/...
```

### Passo 1.3: Create Composite Index
**Option A: Via Firebase Console**
1. Apri Firebase Console
2. Vai a Firestore Database → Indexes
3. Click "Create index"
4. Collection: `bookings`
5. Field 1: `createdBy` (Ascending)
6. Field 2: `createdAt` (Descending)
7. Click "Create"

**Option B: Via CLI**
```bash
# Crea firestore.indexes.json se non esiste
cat > firestore.indexes.json << 'EOF'
{
  "indexes": [
    {
      "collection": "bookings",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
EOF

# Deploy index
firebase deploy --only firestore:indexes
```

**Atteso**:
```
✔ firestore:indexes: Indexes deployed successfully
```

### Passo 1.4: Verify Index Status
```bash
firebase firestore:indexes
```

Aspetta che stato diventi `ENABLED` (potrebbe prendere 5-15 minuti).

---

## 📱 FASE 2: DEPLOY APPLICATION CODE

### Passo 2.1: Build Application
```bash
npm run build
```

**Verifica**:
```
✓ xxx files built successfully
✓ no errors
```

### Passo 2.2: Deploy to Hosting (se usato)
```bash
firebase deploy --only hosting
```

### Passo 2.3: Verify Build
```bash
npm run preview
# Verifica http://localhost:4173
# Test: Crea prenotazione, verifica Firestore
```

---

## 🧪 FASE 3: POST-DEPLOYMENT TESTING

### Test 1: Firestore Connectivity
```bash
# In browser console di prod app
window.firebase.firestore().collection('bookings').limit(1).get()
  .then(snap => console.log('✅ Connected:', snap.size))
  .catch(err => console.error('❌ Error:', err));
```

**Atteso**: ✅ Connected

### Test 2: Create Booking
**Steps**:
1. Login come utente test
2. Vai a pagina prenotazioni
3. Seleziona: Court, Data, Time, Duration
4. Click "Prenota"
5. Attendi risposta

**Verify**:
- ✅ Prenotazione creata in Firestore
- ✅ Appare in "Le mie prenotazioni"
- ✅ Appare in booking pubblici
- ✅ Real-time update visibile

**Firestore Check**:
```bash
firebase firestore:dataviewer

# O via console:
db.collection('bookings').where('createdBy', '==', 'test-uid').get()
```

### Test 3: Update Booking
**Steps**:
1. Seleziona prenotazione da "Le mie prenotazioni"
2. Modifica note
3. Click "Salva"

**Verify**:
- ✅ Aggiornamento in Firestore
- ✅ Cache invalidato
- ✅ UI aggiornato real-time

### Test 4: Cancel Booking
**Steps**:
1. Seleziona prenotazione
2. Click "Cancella"
3. Conferma

**Verify**:
- ✅ Status changed to "cancelled" in Firestore
- ✅ Scompare da "Le mie prenotazioni"
- ✅ Rimane in Firestore (soft delete)

### Test 5: Cross-Club Visibility
**Steps**:
1. User A in Club A: prenota per Giocatore X
2. Login come Giocatore X (di Club B)
3. Vai a prenotazioni

**Verify**:
- ✅ Prenotazione visibile (bookedForUserId)

### Test 6: Certificate Validation
**Steps**:
1. Scadenza certificato medico di utente
2. Tenta prenotazione

**Verify**:
- ✅ Mostra error message
- ✅ Prenotazione NON creata

### Test 7: Hole Prevention
**Steps**:
1. Crea booking: 10:00-11:00
2. Crea booking: 11:45-12:45 (gap 45 min)
3. Tenta booking: 11:00-11:30 (creerebbe gap 30 min)

**Verify**:
- ✅ Terzo booking rifiutato
- ✅ Mostra error message

### Test 8: Real-time Sync
**Steps**:
1. Apri app in 2 tab
2. In tab 1: Crea prenotazione
3. Guarda tab 2

**Verify**:
- ✅ Prenotazione appare automaticamente in tab 2
- ✅ No page reload richiesto

### Test 9: Offline → Online
**Steps**:
1. Apri app
2. Metti device offline (DevTools Network → Offline)
3. Tenta creare prenotazione

**Verify**:
- ✅ Salva in localStorage
- ✅ Mostra "Pending sync" indicator
- ✅ Quando online: sincronizza a Firestore

### Test 10: Performance
**Steps**:
1. Crea 50+ prenotazioni
2. Carica pagina prenotazioni
3. Misura load time

**Target**:
- < 2 secondi per first paint
- < 500ms per cache hit
- < 1 secondo per Firestore query

---

## 📊 MONITORING POST-DEPLOYMENT

### Metriche da Monitorare
```javascript
// In analytics.js o monitoring.js
const metrics = {
  'bookings.create.latency_ms': latency,
  'bookings.create.success': success,
  'bookings.query.cache_hit': cacheHit,
  'bookings.sync.error': syncError,
  'bookings.certificate.expired': certExpired,
  'firestore.write_quota': writeQuota,
  'firestore.read_quota': readQuota,
};
```

### Firebase Console Checks
1. **Firestore Metrics**:
   - Document reads/writes
   - Query latency
   - Storage usage
   - Active subscriptions

2. **Error Tracking**:
   - Crashlytics
   - Performance monitoring
   - Network errors

3. **Quotas**:
   - Daily write operations
   - Daily read operations
   - Storage GB

---

## 🚨 ROLLBACK PROCEDURE

Se qualcosa va male:

### Opzione 1: Revert Firestore Rules
```bash
# Ripristina backup rules (salvo prima di fare deploy!)
firebase deploy --only firestore:rules

# Oppure disabilita booking temporarily
# Aggiungi alla rule:
# allow read, write: if false;
```

### Opzione 2: Revert App Deployment
```bash
# Se su Hosting:
firebase deploy --only hosting --version <previous-version-id>

# Oppure redeploy versione precedente:
git checkout <previous-commit>
npm run build
firebase deploy --only hosting
```

### Opzione 3: Database Restore
```bash
# Restore da backup Firestore
gcloud firestore restore <backup-path>
```

---

## 🎯 SUCCESS CRITERIA

### Deploy è Successful se:
- ✅ Firestore rules deployate
- ✅ Composite index creato e ENABLED
- ✅ App builds senza errori
- ✅ Tutti 10 test passati
- ✅ No Firestore permission errors
- ✅ No console errors/warnings critici
- ✅ Load time < 2 secondi
- ✅ Real-time sync funzionante
- ✅ Certificate validation funzionante
- ✅ No users reporting issues dopo 1 ora

### Deploy è Failed se:
- ❌ Firestore rules deployment fallito
- ❌ Index creation fallito
- ❌ Build errore
- ❌ Booking creation fallisce
- ❌ Permission denied errors
- ❌ Load time > 5 secondi
- ❌ Real-time sync non funziona
- ❌ Errori critici in console

---

## 📞 SUPPORT CONTACTS

### Se Errori During Deploy:
1. **Firestore Rules Error**: Vai a [Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
2. **Index Error**: Vai a [Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/index-overview)
3. **Build Error**: Check Node version, run `npm ci`, clear cache
4. **Permission Error**: Check `.firebaserc` project ID

### Emergency Contacts:
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: tag `firebase`
- GitHub Issues: Official Firebase repos

---

## 📝 DEPLOYMENT LOG TEMPLATE

```markdown
# Deployment Log - 2025-11-13

## Pre-Deployment
- [x] Code review passed
- [x] Tests passed
- [x] Backup done

## Deployment Steps
- [ ] Step 1.1: Backup database - TIME: __, STATUS: __
- [ ] Step 1.2: Deploy rules - TIME: __, STATUS: __
- [ ] Step 1.3: Create index - TIME: __, STATUS: __
- [ ] Step 1.4: Verify index - TIME: __, STATUS: __
- [ ] Step 2.1: Build app - TIME: __, STATUS: __
- [ ] Step 2.2: Deploy hosting - TIME: __, STATUS: __
- [ ] Step 2.3: Verify build - TIME: __, STATUS: __

## Post-Deployment Testing
- [ ] Test 1: Connectivity - RESULT: __
- [ ] Test 2: Create booking - RESULT: __
- [ ] Test 3: Update booking - RESULT: __
- [ ] Test 4: Cancel booking - RESULT: __
- [ ] Test 5: Cross-club visibility - RESULT: __
- [ ] Test 6: Certificate validation - RESULT: __
- [ ] Test 7: Hole prevention - RESULT: __
- [ ] Test 8: Real-time sync - RESULT: __
- [ ] Test 9: Offline → Online - RESULT: __
- [ ] Test 10: Performance - RESULT: __

## Issues Found
- Issue 1: __, Resolution: __, Time: __
- Issue 2: __, Resolution: __, Time: __

## Final Status
- [x] SUCCESSFUL / [ ] FAILED
- Issues resolved: __
- Rollback needed: YES / NO
- Go-live ready: YES / NO
- Deployment date: 2025-11-13
- Deployed by: __
- Reviewed by: __
```

---

## ✅ FINAL CHECKLIST

- [ ] Ho letto tutta questa checklist
- [ ] Ho fatto backup Firestore
- [ ] Ho testato localmente
- [ ] Ho fatto code review
- [ ] Ho fatto peer review
- [ ] Ho documentato deployment
- [ ] Ho avvisato il team
- [ ] Sono pronto a rollback se necessario
- [ ] Ho contatti supporto a portata di mano
- [ ] Pronto per GO-LIVE ✅

---

**Prepared by**: Senior Developer  
**Date**: 13 November 2025  
**Version**: 1.0 - Production Ready  
**Status**: ✅ READY FOR DEPLOYMENT
