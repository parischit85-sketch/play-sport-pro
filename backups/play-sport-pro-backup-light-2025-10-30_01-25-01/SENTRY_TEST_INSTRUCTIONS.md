# 🧪 Sentry Test Instructions - Quick Guide

**Data**: 16 Ottobre 2025  
**Sistema**: Push Notifications v2.0  
**Sentry Project**: play-sportpro

---

## ✅ Test #1: Error Tracking Base

### Istruzioni:
1. **Apri il sito**: https://m-padelweb.web.app
2. **Apri DevTools**: Premi `F12` o `Ctrl+Shift+I`
3. **Vai alla tab Console**
4. **Esegui questo comando**:
   ```javascript
   throw new Error('🎉 Sentry Test - Push Notifications v2.0 deployed successfully!');
   ```
5. **Vai su Sentry**: https://play-sportpro.sentry.io/issues/
6. **Verifica**: L'errore dovrebbe apparire entro 10-30 secondi

### Risultato Atteso:
- ✅ Errore visibile su Sentry Dashboard
- ✅ Stack trace completo
- ✅ Browser info (Chrome/Firefox/etc)
- ✅ URL: https://m-padelweb.web.app
- ✅ Timestamp corretto

---

## ✅ Test #2: Performance Monitoring

### Istruzioni:
1. **Nella console del browser**, esegui:
   ```javascript
   // Simula una operazione lenta
   console.time('slow-operation');
   for(let i = 0; i < 1000000; i++) { Math.sqrt(i); }
   console.timeEnd('slow-operation');
   
   // Traccia su Sentry
   if (window.Sentry) {
     console.log('✅ Sentry è attivo!');
   } else {
     console.log('❌ Sentry NON è attivo');
   }
   ```

2. **Vai su Sentry**: Settings → Performance
3. **Verifica**: Dovresti vedere metriche di performance

### Risultato Atteso:
- ✅ Console mostra "✅ Sentry è attivo!"
- ✅ Performance metrics visibili su Sentry

---

## ✅ Test #3: User Context

### Istruzioni:
1. **Effettua login** sul sito (usa un account test)
2. **Nella console**, esegui:
   ```javascript
   throw new Error('Test con utente autenticato');
   ```
3. **Vai su Sentry** → Controlla l'issue
4. **Verifica**: Dovrebbero esserci info sull'utente

### Risultato Atteso:
- ✅ User ID presente
- ✅ User email presente (se disponibile)
- ✅ User context completo

---

## ✅ Test #4: Push Notification Error Simulation

### Istruzioni:
1. **Nella console**, esegui:
   ```javascript
   // Simula errore push notification
   const error = new Error('Circuit Breaker OPEN - Too many failures');
   error.name = 'PushNotificationError';
   error.extra = {
     service: 'push-notifications-v2',
     circuit_breaker_state: 'OPEN',
     failure_count: 15,
     threshold: 10
   };
   throw error;
   ```

2. **Vai su Sentry** → Controlla l'issue
3. **Verifica**: Dovrebbe attivare un alert (se configurato)

### Risultato Atteso:
- ✅ Errore classificato come PushNotificationError
- ✅ Context aggiuntivo visibile
- ✅ Alert email ricevuta (se configurata)

---

## 🔧 Configurazione Alert Rules

### Alert Rule #1: High Error Rate (CRITICO)

**Setup**:
1. Vai su: https://play-sportpro.sentry.io/alerts/rules/
2. Click: **Create Alert Rule**
3. Configura:
   - **Name**: High Error Rate - Push Notifications
   - **Trigger**: Issue count > 50 in 5 minutes
   - **Filter**: `message contains "notification" OR message contains "push"`
   - **Action**: Send email to your-email@example.com
   - **Priority**: Critical
4. Save

**Test**:
```javascript
// Esegui nella console (genera 10 errori)
for(let i = 0; i < 10; i++) {
  setTimeout(() => {
    throw new Error(`Push notification test error ${i+1}`);
  }, i * 100);
}
```

---

### Alert Rule #2: Circuit Breaker Open (P1)

**Setup**:
1. Vai su: https://play-sportpro.sentry.io/alerts/rules/
2. Click: **Create Alert Rule**
3. Configura:
   - **Name**: Circuit Breaker OPEN
   - **Trigger**: Event seen
   - **Filter**: `message contains "Circuit Breaker OPEN"`
   - **Action**: Send email immediately
   - **Priority**: High
4. Save

**Test**:
```javascript
throw new Error('Circuit Breaker OPEN - System protection activated');
```

---

## 📊 Metriche da Monitorare

### Dashboard Sentry - Cosa Controllare:

**1. Error Rate**
- Target: <1% 
- Warning: >1%
- Critical: >5%

**2. Issues by Type**
- Network errors
- Push notification errors
- Circuit breaker events
- Permission errors

**3. Performance**
- P95 latency: <5 secondi
- P99 latency: <10 secondi
- Throughput: stabile

**4. User Impact**
- Affected users: <5%
- Sessions with errors: <10%

---

## 🚨 Troubleshooting

### Sentry non riceve errori

**Controlla**:
1. `.env` ha il DSN corretto?
   ```bash
   cat .env | grep SENTRY
   ```
   
2. Build recente?
   ```bash
   ls -lt dist/index.html
   ```

3. Cache del browser?
   - Hard refresh: `Ctrl+Shift+R`
   - Clear cache and reload

4. Console errors?
   - F12 → Console → Cerca errori Sentry

**Soluzioni**:
```bash
# Re-build
npm run build

# Re-deploy
firebase deploy --only hosting --project m-padelweb

# Verifica .env
cat .env | grep VITE_SENTRY_DSN
```

---

### Errori non appaiono su dashboard

**Possibili cause**:
1. **DSN sbagliato**: Verifica su Sentry → Settings → Projects → Client Keys
2. **Filtri attivi**: Rimuovi filtri su dashboard Sentry
3. **Progetto sbagliato**: Verifica di essere sul progetto giusto
4. **Rate limiting**: Sentry free tier ha limiti (10K events/mese)

**Verifica connessione**:
```javascript
// Console del browser
console.log('Sentry DSN:', import.meta.env.VITE_SENTRY_DSN);
console.log('Sentry active:', !!window.Sentry);
```

---

### Alert non funzionano

**Setup richiesto**:
1. **Email verificata**: Controlla inbox per email di verifica Sentry
2. **Alert rules create**: Settings → Alerts → Verify rules exist
3. **Integrations attive**: Settings → Integrations → Email enabled
4. **Test alert**: Use "Send test notification" button

---

## 🎯 Checklist Completamento Test

### Test Base (OBBLIGATORI)
- [ ] Test #1: Error tracking funziona
- [ ] Test #2: Sentry è attivo nel browser
- [ ] Errore visibile su dashboard entro 30 secondi
- [ ] Stack trace completo e leggibile
- [ ] Browser info presente

### Test Avanzati (OPZIONALI)
- [ ] Test #3: User context funziona
- [ ] Test #4: Push notification error simulation
- [ ] Performance monitoring attivo
- [ ] Session replay funziona

### Configurazione Alert (CRITICI)
- [ ] Alert Rule #1: High Error Rate configurata
- [ ] Alert Rule #2: Circuit Breaker configurata
- [ ] Email di test ricevuta
- [ ] Alert funzionano correttamente

### Documentazione
- [ ] Screenshot di Sentry dashboard salvati
- [ ] Test results documentati
- [ ] Team informato di come accedere a Sentry
- [ ] Runbook aggiornato con procedure Sentry

---

## 📝 Report Template

Dopo i test, compila questo report:

```markdown
# Sentry Test Report - Push Notifications v2.0

**Data**: 16 Ottobre 2025
**Tester**: [Il tuo nome]
**Ambiente**: Production (https://m-padelweb.web.app)

## Test Results

### ✅ Test #1: Error Tracking
- Status: PASS / FAIL
- Tempo di apparizione su Sentry: XX secondi
- Issue URL: [link]
- Note: 

### ✅ Test #2: Performance Monitoring
- Status: PASS / FAIL
- Sentry attivo: YES / NO
- Note:

### ✅ Test #3: User Context
- Status: PASS / FAIL
- User info presente: YES / NO
- Note:

### ✅ Test #4: Push Notification Error
- Status: PASS / FAIL
- Context extra presente: YES / NO
- Note:

## Alert Configuration

### Alert #1: High Error Rate
- Configurata: YES / NO
- Testata: YES / NO
- Email ricevuta: YES / NO

### Alert #2: Circuit Breaker
- Configurata: YES / NO
- Testata: YES / NO
- Email ricevuta: YES / NO

## Issues Trovati

1. [Descrivi eventuali problemi]
2. [...]

## Raccomandazioni

1. [Suggerimenti per miglioramenti]
2. [...]

## Decisione

- [ ] ✅ APPROVED - Procedi con 10% rollout
- [ ] ⚠️ APPROVED WITH RESERVATIONS - Procedi ma monitora attentamente
- [ ] ❌ REJECTED - Risolvi issues prima del rollout

**Firma**: _______________
**Data**: _______________
```

---

## 🚀 Prossimi Passi (Dopo Test OK)

1. **Abilita 10% Rollout**
   - Firebase Console → Remote Config
   - Add: `push_notifications_v2_enabled = 0.1`
   - Publish changes

2. **Monitora 48 ore**
   - Check Sentry ogni 4 ore
   - Verifica delivery rate >90%
   - Zero P0/P1 incidents

3. **Team Training**
   - Schedule 4.5h training
   - DevOps: 2h
   - Support: 1.5h
   - Product: 1h

4. **Go/No-Go Meeting (Day 3)**
   - Review metrics
   - Decide on 50% rollout
   - Document lessons learned

---

## 📞 Support

**Sentry Dashboard**: https://play-sportpro.sentry.io  
**Production Site**: https://m-padelweb.web.app  
**Firebase Console**: https://console.firebase.google.com/project/m-padelweb  

**Documentazione**:
- `SENTRY_SETUP_GUIDE.md` - Setup completo
- `QUICK_START_FINAL_SETUP.md` - Quick start
- `TEAM_TRAINING_GUIDE.md` - Training materiale

**Emergency Contacts**:
- Slack: #push-notifications-alerts
- Email: devops@play-sport-pro.com

---

**Last Updated**: 16 Ottobre 2025  
**Version**: 1.0  
**Status**: ✅ READY FOR TESTING
