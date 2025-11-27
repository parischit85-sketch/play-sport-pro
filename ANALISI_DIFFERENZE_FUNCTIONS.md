# Analisi Comparativa Cloud Functions

## 1. Funzioni Mancanti (Presenti nel Backup, Assenti nel Workspace Attuale)

Le seguenti funzioni sono presenti nel backup (`play-sport-pro-ripristino-11-nov`) ma mancano nel workspace attuale:

### File Mancanti
*   `cleanOldPushSubscriptions.js`
*   `cleanupPushSubscriptions.js`
*   `pushNotificationsHttp.js`
*   `recordFinalResultPublic.js`
*   `sendBulkPushNotification.js`
*   `sendClubEmail.js`
*   `sendClubEmail_temp.js`
*   `setUserRole.js`
*   `submitProvisionalMatchResult.js`
*   `test-call-sendClubEmail.mjs`
*   `test-smtp.js`
*   `updateLiveScorePublic.js`

### Export Mancanti in `index.js`
*   `cleanOldPushSubscriptions` (da `cleanOldPushSubscriptions.js`)
*   `sendBulkPushNotification` (da `sendBulkPushNotification.js`)
*   `getPushStatusForPlayers`, `sendTestPush` (da `sendBulkNotifications.clean.js`)
*   `savePushSubscription`, `sendPushNotification`, `removePushSubscription` (da `sendBulkNotifications.clean.js`)
*   `savePushSubscriptionHttp`, `sendPushNotificationHttp`, `removePushSubscriptionHttp` (da `pushNotificationsHttp.js`)
*   `sendClubEmail` (da `sendClubEmail.js`)
*   `submitProvisionalMatchResult` (da `submitProvisionalMatchResult.js`)
*   `updateLiveScorePublic` (da `updateLiveScorePublic.js`)
*   `recordFinalResultPublic` (da `recordFinalResultPublic.js`)

## 2. Funzioni Presenti ma Modificate

### `index.js`
*   **Backup:** Esporta molte funzioni relative alla gestione diretta delle push subscription (`savePushSubscription`, `removePushSubscription`, etc.) e funzioni pubbliche per i risultati (`submitProvisionalMatchResult`, `updateLiveScorePublic`).
*   **Attuale:** Ha introdotto nuove funzioni V2 per le push (`sendPushToUser`, `sendBulkPush`) e ha rimosso le vecchie funzioni di gestione subscription e risultati pubblici.

### `linkOrphanProfiles.js`
*   **Backup:** Esporta `searchFirebaseUsers`, `linkOrphanProfile`, `getOrphanProfiles`.
*   **Attuale:** Esporta le stesse funzioni più `restorePlayerProfile`. Abbiamo appena aggiornato queste funzioni alla Gen 2 con CORS abilitato.

### `sendBulkNotifications.clean.js`
*   **Backup:** Contiene logica mista per notifiche e gestione subscription.
*   **Attuale:** Sembra essere stato ripulito per mantenere solo `sendBulkCertificateNotifications`.

## 3. Analisi Critica

### Funzionalità Perse Potenzialmente Importanti
1.  **Gestione Risultati Pubblici:** Le funzioni `submitProvisionalMatchResult`, `updateLiveScorePublic`, `recordFinalResultPublic` sono state rimosse. Se l'app usa ancora queste feature per i tornei o i match live, smetteranno di funzionare.
2.  **Invio Email Club:** La funzione `sendClubEmail` è assente. Se c'è una funzionalità per inviare email massive o comunicazioni dal club, è persa.
3.  **Gestione Push HTTP:** Le funzioni `pushNotificationsHttp.js` (endpoint HTTP per salvare token push) sono state rimosse. Se il frontend usa endpoint HTTP diretti invece di Callable functions per registrare i token, la registrazione push fallirà.

### Funzionalità Sostituite/Migliorate
1.  **Push Notifications:** Il sistema attuale sembra aver migrato verso un approccio V2 più pulito (`sendPushToUser`, `sendBulkPush`), abbandonando la vecchia gestione frammentata.
2.  **Orphan Profiles:** La versione attuale è più evoluta (`restorePlayerProfile` aggiunto) e ora corretta con Gen 2 + CORS.

## 4. Piano d'Azione Consigliato

1.  **Ripristinare Funzioni Pubbliche (Priorità Alta se usate):** Se l'app permette l'inserimento risultati da utenti non loggati o tramite link pubblico, dobbiamo ripristinare `submitProvisionalMatchResult.js`, `updateLiveScorePublic.js`, `recordFinalResultPublic.js`.
2.  **Ripristinare Email Club (Priorità Media):** Ripristinare `sendClubEmail.js` se gli admin usano l'invio email manuale.
3.  **Verificare Registrazione Push:** Controllare nel frontend se la registrazione del token push chiama `savePushSubscription` (vecchia) o usa un nuovo metodo. Se usa il vecchio, dobbiamo ripristinare `pushNotificationsHttp.js` o aggiornare il frontend.
4.  **Mantenere Pulizia:** Non ripristinare `cleanOldPushSubscriptions.js` e simili se sono stati sostituiti da `pruneSubscriptions.js` (che è presente nel workspace attuale).

Attendo tue istruzioni su quali di questi file "persi" vuoi recuperare.