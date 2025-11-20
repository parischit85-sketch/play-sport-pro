# 🛡️ Super Admin — Platform Management Checklist

Data: 2025-11-17  
Scope: controllo end-to-end della piattaforma PlaySport (utenti, circoli, prenotazioni, tornei, notifiche, sicurezza, compliance, affidabilità)

---

## Ruoli e Accesso (RBAC)

- Super Admin: accesso completo (read/write/delete) a tutte le collezioni e documenti. Bypass per nuove collezioni. Può modificare campi protetti (es. `clubs.isActive`, `clubs.status`, `users.role`).  
  Riferimenti: `RBAC_IMPLEMENTATION_SUMMARY.md`, `firestore.rules`, `firestore.rules.production`
- Club Admin: gestione esclusiva del proprio club (isolation by clubId).  
- Utente: accesso limitato ai propri dati e contenuti pubblici.

Codice/Rotte utili:
- Admin: `/admin/dashboard`, `/admin/clubs`, `/admin/users`, pannelli sotto `src/features/admin/*`
- Attivazione circoli: `/admin/clubs` (pannello approvazione) — `src/pages/admin/ClubsManagement.jsx`

---

## Dominî e responsabilità del Super Admin

Di seguito le aree operative con checklist, criteri di accettazione e fonti dati/UI.

### 1) Governance & Sicurezza

- Gestione ruoli e privilegi
  - [ ] Promuovi/demoti utenti: `user ⇄ club_admin ⇄ super_admin`
  - [ ] Sospendi/riattiva utenti e club
  - Accettazione: modifiche riflesse in UI; regole Firestore coerenti; audit log registrato
  - Dati/UI: `users`, `clubs`, `src/features/admin/UserManagement.jsx`
- Audit log e tracciabilità
  - [ ] Log per: attivazione/disattivazione club, cambio ruoli, override prenotazioni/pagamenti, invii massivi
  - Accettazione: `audit_logs` con `actorUid, action, target, reason, ts`; filtro/ricerca admin
  - Dati/UI: `audit_logs` (admin), `SecurityAuditPanel.jsx`
- Sessioni e sicurezza account
  - [ ] 2FA per super admin, session timeout, revoke session
  - Accettazione: possibilità di forzare logout di un account; evento tracciato
  - Dati/UI: Auth, `SecurityAuditPanel.jsx`
- Backup & Ripristino
  - [ ] Snapshot programmati; test di ripristino; verifica indici
  - Accettazione: runbook + report esito; artefatti backup presenti in `backups/`
  - Dati/Doc: `BACKUP_RECOVERY_SYSTEM.md`, `FIRESTORE_INDEXES_*`
- Compliance (GDPR/Privacy)
  - [ ] Gestione richieste GDPR (export/delete), consensi marketing, registri
  - Accettazione: richiesta → presa in carico → fulfillment con prova
  - Dati/UI: `GDPRRequestsPanel.jsx`, `GDPR_*` docs
- Limiti e quote Firebase
  - [ ] Monitor letture/scritture/Functions/Storage + alert soglie
  - Accettazione: dashboard quote + notifiche
  - Dati/UI: `PerformanceMonitor.jsx`, Firebase console

### 2) Utenti

- Ricerca e gestione profili
  - [ ] Ricerca per email/nome/telefono/club, modifica campi profilo, note admin
  - Accettazione: update idempotenti; regole rispettate; audit entry
  - Dati/UI: `users`, `AdminUsersPage.jsx`, `UsersManagement.jsx`
- Ruoli e affiliazioni
  - [ ] Visualizza affiliazioni per club; promozione a club_admin; revoca
  - Accettazione: coerenza tra `users` e `clubs/{clubId}/profiles`
  - Dati/UI: `clubs/*/profiles`, `ClubUsersPage.jsx`
- Sicurezza account
  - [ ] Reset MFA/password (se consentito), sospensione, verifica email
  - Accettazione: flusso con conferma e audit

- Merge profili duplicati
  - [ ] Identifica duplicati (email/telefono), merge assistito con dry-run
  - Accettazione: strategie di merge definite per bookings/standings/payments; audit
  - Dati/Script: `CLEANUP_*`, `UNKNOWN_USERS_*`, `scripts/`

### 3) Circoli (Clubs)

- Approvazione/visibilità
  - [ ] Vedi pending/attivi/disattivi; attiva/disattiva con motivo
  - Accettazione: `isActive/status` aggiornati; banner informativi; filtri funzionanti
  - Dati/UI: `clubs`, `ClubsManagement.jsx`, `CLUB_ACTIVATION_SYSTEM.md`
- Dati e proprietà
  - [ ] Modifica dati (contatti, indirizzo, logo, brand), transfer ownership
  - Accettazione: protezione campi critici; handshake di trasferimento; audit
- Configurazioni avanzate
  - [ ] Orari/slot, prezzi, regole prenotazione, notifiche, aspetto, sicurezza
  - Accettazione: validazioni temporali, salvataggi atomici, anteprima impatto
  - Dati/UI: `ClubSettings.jsx`, `src/features/admin/AdminClubEditPage.jsx`
- Qualità e integrità dati
  - [ ] Sanity checks: orari invalidi, duplicati campi, profili orfani
  - Accettazione: report + fix guidati
  - Script: `verify-*`, `fix-*`, `cleanup-*`

### 4) Prenotazioni (Bookings & Lezioni)

- Policy globali
  - [ ] Limiti anticipo/cancellazione, no-show, durata slot, caparre, overbooking
  - Accettazione: enforcement coerente lato client + rules; override tracciato
  - Dati/UI: `clubs/*/bookings`, `AdminClubDashboard.jsx`
- Operazioni amministrative
  - [ ] Cancellazioni forzate, riassegnazioni, risoluzione conflitti, blocco slot
  - Accettazione: controlli pre-azione; impatti su pagamenti/notifiche; audit
- Calcolo disponibilità & conflitti
  - [ ] Strumenti diagnosi conflitti timeslot e report giornalieri
  - Accettazione: pagina admin con filtri data/club/campo + fix assistiti
- Analytics prenotazioni
  - [ ] Tasso occupazione, cancellazioni, ricavi stimati per club/periodo
  - Accettazione: grafici + export CSV
  - UI: `BookingAnalyticsDashboard.jsx`

### 5) Tornei, Classifiche, Public View

- Gestione tornei
  - [ ] Crea/modifica/chiudi; rollback partite; annulla; pubblica
  - Accettazione: consistenza standings; snapshot; audit motivato
  - Dati/UI: `clubs/*/tournaments`, `AdminClubDetailPage.jsx`
- Ranking e punti
  - [ ] Allineamenti/ricalcoli; snapshot; fix controllati
  - Accettazione: snapshot prima/dopo; motivazione obbligatoria
- Public View (unified)
  - [ ] Configura tempi pagina (gironi/punti/bracket/QR), update real-time
  - Accettazione: variazione immediata; fallback default; nessun buco visivo
  - UI: `PublicViewSettings.jsx`, `UnifiedPublicView.jsx`

### 6) Notifiche & Comunicazioni

- Broadcast/segmentazione
  - [ ] Invii massivi con filtri (ruolo/club/attività), A/B testing
  - Accettazione: dry-run, stima audience, rate limit, rispetto opt-in/out
  - UI: `AdminPushNotificationsPanel.jsx`, `ExperimentDashboard.jsx`
- Template management
  - [ ] Template email/push versionati, multi-lingua, preview
  - Accettazione: validazione variabili; rollback versione
  - Doc: `EMAIL_*`, `CERTIFICATE_EMAIL_TEMPLATE_SYSTEM.md`
- Tracciamento
  - [ ] Deliveries/open/click/bounce, blacklist, retry
  - Accettazione: dashboard per campagna + export

### 7) Pagamenti & Fatturazione (se abilitati)

- Riconciliazione e report
  - [ ] Riepiloghi per club/periodo, commissioni, refund, chargeback
  - Accettazione: export CSV/PDF, tracciabilità completa
- Impostazioni gateway
  - [ ] Keys, currency, tassazione; gestione anomalie
  - Accettazione: audit config; alert su errori ripetuti
- Sicurezza
  - [ ] Minimizzare PII, PCI compliance, tokenizzazione

### 8) Contenuti, Branding, Messaggi di sistema

- Branding per club
  - [ ] Colori/loghi/microcopy con anteprima e validazioni accessibilità
- Messaggi di sistema
  - [ ] Banner globali/maintenance, news admin, scheduling/scadenze
  - Dati/UI: `AdminAnnouncements.jsx`

### 9) Monitoraggio, Affidabilità e Performance

- Errori e logging
  - [ ] Sentry/console error rate, Functions errors, alert notturni
  - Accettazione: soglie + escalation; trend visibili
- Performance
  - [ ] LCP/TTI (web), responsiveness app, query lente, indici mancanti
  - Accettazione: “Index Health” con suggerimenti
- Job schedulati
  - [ ] Health dei job (pulizia cache, recaps, standings), retry/backoff

### 10) Manutenzione & Strumenti

- Manutenzione DB
  - [ ] Cleanup profili orfani/duplicati/legacy, migrazioni guidate
  - Script: `scripts/`, `CLEANUP_*`, `MIGRATION_*`
- Indicizzazione
  - [ ] Verifica/creazione indici compositi, drift detection
  - Dati: `firestore.indexes.*`
- Impersonation sicuro
  - [ ] "Vedi come" con read-only di default, banner evidente, audit completo

---

## Operatività: routine e runbook

- Daily
  - [ ] Quote Firebase & errori Functions  
  - [ ] Nuove richieste GDPR  
  - [ ] Club pending → approvazioni
- Weekly
  - [ ] Audit log anomalie  
  - [ ] Report booking/occupazione  
  - [ ] Verifica indici/slow query
- Monthly
  - [ ] Test ripristino backup  
  - [ ] Revisione ruoli e accessi  
  - [ ] Revisione template notifiche

Incident Response (alto livello)
- [ ] Identifica impatto → attiva maintenance banner  
- [ ] Isola feature/club problematico  
- [ ] Consulta logs/Sentry/Functions  
- [ ] Rollback/feature flag se necessario  
- [ ] Post-mortem in `audit_logs` + azioni preventive

---

## Dove intervenire nel codice (principali)

- Pagine admin: `src/pages/admin/*`  
- Feature admin: `src/features/admin/*`  
- Vista pubblica tornei: `src/features/tournaments/*`, `src/pages/public/*`  
- Regole: `firestore.rules*`  
- Indici: `firestore.indexes.*`  
- Script manutenzione: `scripts/`, `fix-*.js`, `verify-*.mjs`, `cleanup-*.js`

---

## Quick Wins (immediati)

1) Stabilità Admin Club Dashboard  
- Fix refresh interval leak, memoization, race guard, validazione orari — vedi `ADMIN_DASHBOARD_REVIEW.md` (Sprint 1).  
2) Audit obbligatorio su azioni sensibili  
- Log motivo su attiva/disattiva club, cambio ruoli, override prenotazioni.  
3) Notifiche di processo  
- Email al super admin su nuovo club registrato; email al club-admin su attivazione.  
4) Health & Quotas  
- Schermata quote + errori Functions/Sentry consolidata.  
5) Template Manager  
- Centralizzare e versionare template email/push con preview.

---

## Note

- Flusso “Registrazione → Approvazione Super Admin” e RBAC sono già implementati e documentati.  
- Questa checklist è pensata per governare l’operatività quotidiana e guidare evoluzioni sicure e scalabili.
