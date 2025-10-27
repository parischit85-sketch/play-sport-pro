# ✅ DEPLOYMENT CHECKLIST - PlaySport Pro
**Versione**: 1.0.4  
**Data Ultima Revisione**: 15 Ottobre 2025  
**Ambiente**: Production Ready  

---

## 📋 Pre-Deployment Checklist

### Fase 1: Configurazione Ambiente ⚙️

#### 1.1 File Environment Variables
- [ ] File `.env` creato da `.env.production.example`
- [ ] `VITE_FIREBASE_API_KEY` configurato
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` configurato
- [ ] `VITE_FIREBASE_PROJECT_ID` configurato
- [ ] `VITE_FIREBASE_APP_ID` configurato
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` configurato
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` configurato
- [ ] `VITE_GA_MEASUREMENT_ID` configurato (formato G-XXXXXXXXXX)
- [ ] Nessun placeholder "your_*" rimasto
- [ ] File `.env` NON committato in Git

**Come Verificare**:
```bash
# Controlla che .env non sia tracciato
git status | grep .env
# Output atteso: nessun risultato

# Verifica variabili caricate
npm run dev
# Controlla console: nessun errore "Missing Firebase configuration"
```

#### 1.2 Firebase Project Setup
- [ ] Progetto Firebase creato
- [ ] Blaze plan attivato (pay-as-you-go)
- [ ] Budget alert configurato (€10-20/mese)
- [ ] Web app aggiunta al progetto
- [ ] Credenziali copiate in `.env`

**Link**: [Firebase Console](https://console.firebase.google.com/)

#### 1.3 Firebase Authentication
- [ ] Email/Password provider abilitato
- [ ] Google provider abilitato (se usato)
- [ ] Domini autorizzati configurati:
  - [ ] `localhost` (development)
  - [ ] `tuodominio.com` (production)
  - [ ] `*.netlify.app` (se usi Netlify)
- [ ] Email verification abilitato
- [ ] Password reset configurato

**Percorso**: Firebase Console → Authentication → Sign-in methods

#### 1.4 Firestore Database
- [ ] Database creato in production mode
- [ ] Location: `europe-west1` (o tua preferenza)
- [ ] Security Rules deployate
- [ ] Indici creati (se necessari)
- [ ] Dati iniziali importati (se necessari)

**Deploy Rules**:
```bash
firebase deploy --only firestore:rules
```

#### 1.5 Firebase Storage
- [ ] Storage inizializzato
- [ ] Location: stessa del Firestore
- [ ] Security Rules deployate
- [ ] CORS configurato (se necessario)

**Deploy Rules**:
```bash
firebase deploy --only storage:rules
```

#### 1.6 Google Analytics GA4
- [ ] Proprietà GA4 creata
- [ ] Data Stream web configurato
- [ ] Measurement ID copiato in `.env`
- [ ] Enhanced Measurement abilitato
- [ ] Data retention: 14 mesi (GDPR)
- [ ] IP anonymization attivo
- [ ] Google Signals disabilitato (GDPR)

**Link**: [Google Analytics](https://analytics.google.com/)

---

### Fase 2: Code Quality & Testing 🧪

#### 2.1 Test Suite
- [ ] Tutti i test passano: `npm test`
- [ ] Coverage report generato: `npm run test:coverage`
- [ ] Nessun test failing critico
- [ ] Test skipped documentati

**Comandi**:
```bash
npm test
npm run test:coverage
```

**Output Atteso**: 42/42 passing, 45 skipped

#### 2.2 Build Production
- [ ] Build completa senza errori: `npm run build`
- [ ] Tempo build < 60 secondi
- [ ] Nessun errore critico
- [ ] Warning chunk size accettabili
- [ ] Preview funziona: `npm run preview`

**Comandi**:
```bash
npm run build
npm run preview
```

**Tempo Atteso**: ~25-30 secondi

#### 2.3 Code Linting
- [ ] Nessun errore ESLint critico
- [ ] Warning ESLint gestiti o ignorati
- [ ] Code formatting consistente

**Comando**:
```bash
npm run lint
```

#### 2.4 Security Audit
- [ ] `npm audit` eseguito
- [ ] Vulnerabilità critiche risolte
- [ ] Vulnerabilità moderate documentate

**Comando**:
```bash
npm audit
# Se vulnerabilità: npm audit fix
```

---

### Fase 3: QA Manuale 📝

#### 3.1 Testing Funzionale
**Usa**: `CHECKLIST_QA_MANUALE.md`

- [ ] Autenticazione (login, signup, logout, password reset)
- [ ] Dashboard navigazione
- [ ] Prenotazioni (creazione, modifica, cancellazione)
- [ ] Pagamenti (se implementati)
- [ ] Admin panel (se hai accesso)
- [ ] Notifiche (se implementate)
- [ ] Gestione profilo utente

#### 3.2 Testing Browser
- [ ] Chrome (ultima versione)
- [ ] Firefox (ultima versione)
- [ ] Safari (ultima versione)
- [ ] Edge (ultima versione)
- [ ] Mobile Chrome (iOS/Android)
- [ ] Mobile Safari (iOS)

#### 3.3 Testing Performance
- [ ] Lighthouse score > 90 (Performance)
- [ ] Lighthouse score > 95 (Accessibility)
- [ ] Lighthouse score > 90 (Best Practices)
- [ ] Lighthouse score > 90 (SEO)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

**Comando**:
```bash
npx lighthouse http://localhost:5173 --view
```

#### 3.4 Testing Sicurezza
- [ ] HTTPS attivo (in production)
- [ ] Security headers presenti
- [ ] CSP (Content Security Policy) configurato
- [ ] XSS protection attivo
- [ ] Firebase Security Rules testate
- [ ] Nessuna chiave API esposta nel codice

---

### Fase 4: Deployment Setup 🚀

#### 4.1 Git Repository
- [ ] Repository GitHub creato
- [ ] `.gitignore` configurato correttamente
- [ ] File sensibili NON committati (.env, serviceAccount.json)
- [ ] Branch `main` protetto
- [ ] Branch `staging` creato (opzionale)
- [ ] README.md aggiornato

**Verifica**:
```bash
git status
git log --oneline -5
```

#### 4.2 Netlify Setup (se usi Netlify)
- [ ] Account Netlify creato
- [ ] Repository connesso
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Node version: 20
- [ ] Environment variables configurate
- [ ] Custom domain configurato (opzionale)
- [ ] SSL automatico attivo

**Environment Variables su Netlify**:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_GA_MEASUREMENT_ID
```

#### 4.3 Domain & DNS (se custom domain)
- [ ] Dominio acquistato
- [ ] DNS configurato
- [ ] Record A/CNAME impostati
- [ ] SSL certificato attivo
- [ ] Propagazione DNS verificata (24-48h)

**Verifica DNS**:
```bash
nslookup tuodominio.com
```

---

### Fase 5: Monitoring & Analytics 📊

#### 5.1 Error Tracking (opzionale)
- [ ] Sentry/LogRocket configurato
- [ ] DSN configurato
- [ ] Source maps uploaded
- [ ] Error tracking attivo

#### 5.2 Performance Monitoring
- [ ] Firebase Performance configurato
- [ ] Custom traces implementati
- [ ] Network monitoring attivo

#### 5.3 Analytics Verification
- [ ] GA4 DebugView funzionante
- [ ] Eventi custom tracciati
- [ ] Conversioni configurate
- [ ] Real-time reports attivi

**Test GA4**:
1. Apri app in Chrome
2. Installa [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
3. Attiva extension
4. Vai in GA4 → DebugView
5. Verifica eventi in tempo reale

---

### Fase 6: Documentation 📚

#### 6.1 User Documentation
- [ ] README.md completo
- [ ] Guida installazione
- [ ] Guida configurazione
- [ ] Troubleshooting section

#### 6.2 Technical Documentation
- [ ] Architecture overview
- [ ] API documentation (se applicabile)
- [ ] Deployment guide
- [ ] Security policies
- [ ] GDPR compliance notes

#### 6.3 Deployment Guides (già create ✅)
- [x] CHECKLIST_QA_MANUALE.md
- [x] GUIDA_VERIFICA_FIREBASE.md
- [x] REPORT_VERIFICA_FIREBASE.md
- [x] REPORT_VERIFICA_GA4.md
- [x] GUIDA_DEPLOY_STAGING.md
- [x] RIEPILOGO_TEST_PRODUZIONE.md
- [x] RIEPILOGO_COMPLETO_PREPARAZIONE_PRODUZIONE.md

---

### Fase 7: Backup & Rollback Plan 🔄

#### 7.1 Backup Strategy
- [ ] Database backup plan definito
- [ ] Backup automatici configurati (Firebase)
- [ ] Procedura restore documentata
- [ ] Backup testato (dry run)

#### 7.2 Rollback Plan
- [ ] Strategia rollback definita
- [ ] Versioni precedenti taggate in Git
- [ ] Procedura rollback Netlify nota
- [ ] Procedura rollback Firebase Security Rules nota
- [ ] Team informato sulla procedura

**Rollback Netlify**:
```
Dashboard → Deploys → [Previous deploy] → Publish deploy
```

**Rollback Git**:
```bash
git revert HEAD
git push origin main
```

---

### Fase 8: Final Checks ✅

#### 8.1 Pre-Deploy Final
- [ ] Tutti i checkpoint sopra completati
- [ ] Team informato del deploy
- [ ] Deploy window comunicato (es: ore non di picco)
- [ ] Rollback plan pronto
- [ ] Monitoring attivo

#### 8.2 Deploy Execution
- [ ] Build locale finale: `npm run build`
- [ ] Commit finale: `git commit -am "Release v1.0.4"`
- [ ] Tag versione: `git tag v1.0.4`
- [ ] Push: `git push origin main --tags`
- [ ] Deploy triggato automaticamente (Netlify)
- [ ] Build log verificato (no errori)
- [ ] Deploy completato

#### 8.3 Post-Deploy Verification
- [ ] Site URL accessibile
- [ ] Homepage carica correttamente
- [ ] Login funziona
- [ ] Firebase connesso (no errori console)
- [ ] GA4 traccia eventi (DebugView)
- [ ] Performance OK (Lighthouse)
- [ ] SSL attivo (HTTPS)
- [ ] Security headers presenti

**Verifica Headers**:
```bash
curl -I https://tuodominio.com
```

#### 8.4 Smoke Tests Production
- [ ] User flow critico testato (signup → login → booking)
- [ ] Cross-browser check veloce
- [ ] Mobile check veloce
- [ ] Nessun errore console critico
- [ ] Nessun errore Sentry (se configurato)

---

### Fase 9: Post-Deploy Monitoring 👀

#### 9.1 Primo Giorno
- [ ] Monitoring errori attivo (ogni ora)
- [ ] GA4 real-time verificato
- [ ] Performance verificata
- [ ] User feedback raccolto
- [ ] Nessun errore critico segnalato

#### 9.2 Prima Settimana
- [ ] Monitoring giornaliero
- [ ] Analytics review
- [ ] Performance trends
- [ ] Error rate < 1%
- [ ] User satisfaction OK

#### 9.3 Report Post-Deploy
- [ ] Deployment report creato
- [ ] Metriche chiave documentate
- [ ] Issues log creato
- [ ] Lessons learned documentate
- [ ] Next steps pianificati

---

## 🚨 Troubleshooting Rapido

### Build Fallisce
```bash
# Pulisci cache
rm -rf node_modules dist .vite
npm ci
npm run build
```

### Firebase Non Connette
1. Verifica `.env` variabili
2. Controlla domini autorizzati in Firebase Console
3. Verifica API key valida
4. Controlla console browser per errori

### GA4 Non Traccia
1. Verifica Measurement ID in `.env`
2. Controlla DebugView in GA4
3. Verifica blocco AdBlocker
4. Controlla console errori

### Deploy Netlify Fallito
1. Verifica build log
2. Controlla environment variables su Netlify
3. Verifica Node version (20)
4. Controlla `netlify.toml` configurazione

---

## ✅ Sign-Off

### Pre-Deploy Approval

**Deployment Approved By**:
- [ ] Tech Lead: _________________ Data: _______
- [ ] QA Lead: __________________ Data: _______
- [ ] Product Owner: ____________ Data: _______

### Post-Deploy Verification

**Production Verified By**:
- [ ] Tech Lead: _________________ Data: _______
- [ ] QA: _______________________ Data: _______

**Status**: 
- [ ] ✅ Deployment Successful
- [ ] ⚠️ Deployment with Issues (document below)
- [ ] ❌ Rollback Required

**Notes**:
```
_________________________________________________________
_________________________________________________________
_________________________________________________________
```

---

## 📞 Emergency Contacts

**In caso di problemi critici**:
- Tech Lead: ___________________
- DevOps: _____________________
- Firebase Support: https://firebase.google.com/support
- Netlify Support: https://www.netlify.com/support/

---

**Checklist Version**: 1.0  
**Last Updated**: 15 Ottobre 2025  
**Next Review**: Pre ogni major release  

---

## 🎯 Post-Launch Roadmap

### Short Term (1-2 settimane)
- [ ] Implementare cookie consent banner
- [ ] Ottimizzare bundle size (code splitting)
- [ ] Implementare PWA features
- [ ] Setup staging environment

### Medium Term (1-2 mesi)
- [ ] Implementare rate limiting
- [ ] Implementare CSRF protection
- [ ] Migliorare test coverage (target 80%)
- [ ] Implementare E2E tests (Playwright/Cypress)

### Long Term (3-6 mesi)
- [ ] Migrazione a TypeScript
- [ ] Implementare micro-frontends
- [ ] Setup CI/CD avanzato
- [ ] Internazionalizzazione (i18n)

---

**Buon Deploy! 🚀**
