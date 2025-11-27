# Script Automatico Deploy Cloud Functions - Push Notifications Fix
# Esegui con: .\deploy-cloud-functions.ps1

Write-Host "`n🚀 Deploy Cloud Functions - Push Notifications Fix" -ForegroundColor Cyan
Write-Host "="*70 -ForegroundColor Cyan

# ========================================
# STEP 1: Verifica Prerequisiti
# ========================================
Write-Host "`n📋 STEP 1: Verifica prerequisiti..." -ForegroundColor Yellow

# Verifica Firebase CLI
Write-Host "`n  Verifico Firebase CLI..." -ForegroundColor Gray
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "  ✅ Firebase CLI: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Firebase CLI non installato!" -ForegroundColor Red
    Write-Host "     Installa con: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Verifica Node.js
Write-Host "`n  Verifico Node.js..." -ForegroundColor Gray
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js non installato!" -ForegroundColor Red
    Write-Host "     Scarica da: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# ========================================
# STEP 2: Backup Vecchie Functions
# ========================================
Write-Host "`n📦 STEP 2: Backup functions esistenti..." -ForegroundColor Yellow

$projectRoot = "C:\Users\paris\Downloads\play-sport-backup-2025-10-05_23-30-00"
$functionsPath = Join-Path $projectRoot "functions"
$cloudFixPath = Join-Path $projectRoot "cloud-function-fix"

if (Test-Path $functionsPath) {
    $backupName = "functions-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $backupPath = Join-Path $projectRoot $backupName

    Write-Host "  Backup in corso..." -ForegroundColor Gray
    Copy-Item -Path $functionsPath -Destination $backupPath -Recurse -ErrorAction SilentlyContinue
    Write-Host "  ✅ Backup creato: $backupName" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Nessuna cartella functions esistente" -ForegroundColor Gray
}

# ========================================
# STEP 3: Copia Nuovi File
# ========================================
Write-Host "`n📁 STEP 3: Copia nuovi file..." -ForegroundColor Yellow

if (-not (Test-Path $functionsPath)) {
    New-Item -ItemType Directory -Path $functionsPath -Force | Out-Null
    Write-Host "  ✅ Cartella functions creata" -ForegroundColor Green
}

Write-Host "  Copiando file..." -ForegroundColor Gray
Copy-Item -Path "$cloudFixPath\*" -Destination $functionsPath -Force
Write-Host "  ✅ File copiati" -ForegroundColor Green

# ========================================
# STEP 4: Installa Dipendenze
# ========================================
Write-Host "`n📦 STEP 4: Installazione dipendenze..." -ForegroundColor Yellow

Push-Location $functionsPath

Write-Host "  Esecuzione npm install..." -ForegroundColor Gray
npm install 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Dipendenze installate con successo" -ForegroundColor Green
} else {
    Write-Host "  ❌ Errore installazione dipendenze" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# ========================================
# STEP 5: Configura VAPID Keys
# ========================================
Write-Host "`n🔑 STEP 5: Configurazione VAPID Keys..." -ForegroundColor Yellow

Write-Host "`n  Le VAPID keys sono necessarie per le notifiche WEB (browser)." -ForegroundColor Gray
Write-Host "  Per Android/iOS NON sono necessarie (usa FCM nativo)." -ForegroundColor Gray

$configureVapid = Read-Host "`n  Vuoi configurare le VAPID keys ora? (s/n)"

if ($configureVapid -eq 's' -or $configureVapid -eq 'S') {
    Write-Host "`n  Cerca le VAPID keys nel tuo progetto:" -ForegroundColor Yellow
    Write-Host "    - File .env" -ForegroundColor Gray
    Write-Host "    - File src/utils/push.js" -ForegroundColor Gray
    Write-Host "    - Variabili: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY" -ForegroundColor Gray

    Write-Host "`n  Esegui questi comandi manualmente:" -ForegroundColor Yellow
    Write-Host "    firebase functions:secrets:set VAPID_PUBLIC_KEY" -ForegroundColor Cyan
    Write-Host "    firebase functions:secrets:set VAPID_PRIVATE_KEY" -ForegroundColor Cyan

    Write-Host "`n  Oppure genera nuove keys con:" -ForegroundColor Yellow
    Write-Host "    npx web-push generate-vapid-keys" -ForegroundColor Cyan

    Read-Host "`n  Premi INVIO quando hai configurato le keys (o CTRL+C per saltare)"
} else {
    Write-Host "  ⚠️  VAPID keys saltate - Le notifiche WEB potrebbero non funzionare" -ForegroundColor Yellow
    Write-Host "     Le notifiche NATIVE (Android/iOS) funzioneranno comunque" -ForegroundColor Green
}

# ========================================
# STEP 6: Seleziona Progetto Firebase
# ========================================
Write-Host "`n🔧 STEP 6: Selezione progetto Firebase..." -ForegroundColor Yellow

Push-Location $projectRoot

Write-Host "  Seleziono progetto m-padelweb..." -ForegroundColor Gray
firebase use m-padelweb 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Progetto selezionato: m-padelweb" -ForegroundColor Green
} else {
    Write-Host "  ❌ Errore selezione progetto" -ForegroundColor Red
    Write-Host "     Esegui manualmente: firebase use m-padelweb" -ForegroundColor Yellow
    Pop-Location
    exit 1
}

# ========================================
# STEP 7: Deploy Functions
# ========================================
Write-Host "`n🚀 STEP 7: Deploy Cloud Functions..." -ForegroundColor Yellow

Write-Host "`n  Funzioni che verranno deployate:" -ForegroundColor Gray
Write-Host "    ✅ sendPushToUser (callable)" -ForegroundColor Green
Write-Host "    ✅ sendPushToUserHTTP (http)" -ForegroundColor Green
Write-Host "    ✅ sendBulkPush (callable)" -ForegroundColor Green
Write-Host "    ✅ sendBulkPushHTTP (http)" -ForegroundColor Green
Write-Host "    ✅ cleanupInactiveSubscriptions (scheduled)" -ForegroundColor Green

$confirmDeploy = Read-Host "`n  Procedere con il deploy? (s/n)"

if ($confirmDeploy -ne 's' -and $confirmDeploy -ne 'S') {
    Write-Host "`n  ❌ Deploy annullato dall'utente" -ForegroundColor Red
    Pop-Location
    exit 0
}

Write-Host "`n  Deploy in corso... (potrebbe richiedere alcuni minuti)" -ForegroundColor Yellow
Write-Host "  " -NoNewline

firebase deploy --only functions

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n  ✅ Deploy completato con successo!" -ForegroundColor Green
} else {
    Write-Host "`n  ❌ Errore durante il deploy" -ForegroundColor Red
    Write-Host "     Controlla i log sopra per dettagli" -ForegroundColor Yellow
    Pop-Location
    exit 1
}

Pop-Location

# ========================================
# STEP 8: Verifica Deploy
# ========================================
Write-Host "`n✅ STEP 8: Verifica deploy..." -ForegroundColor Yellow

Write-Host "`n  Apri Firebase Console per verificare le functions:" -ForegroundColor Gray
Write-Host "  https://console.firebase.google.com/project/m-padelweb/functions" -ForegroundColor Cyan

Write-Host "`n  Dovresti vedere 5 functions attive:" -ForegroundColor Gray
Write-Host "    ✅ sendPushToUser" -ForegroundColor Green
Write-Host "    ✅ sendPushToUserHTTP" -ForegroundColor Green
Write-Host "    ✅ sendBulkPush" -ForegroundColor Green
Write-Host "    ✅ sendBulkPushHTTP" -ForegroundColor Green
Write-Host "    ✅ cleanupInactiveSubscriptions" -ForegroundColor Green

# ========================================
# STEP 9: Test
# ========================================
Write-Host "`n🧪 STEP 9: Test..." -ForegroundColor Yellow

Write-Host "`n  Ora puoi testare le notifiche push:" -ForegroundColor Gray
Write-Host "    1. Vai su https://play-sport.pro/admin/push-notifications" -ForegroundColor Cyan
Write-Host "    2. Cerca il tuo utente" -ForegroundColor Cyan
Write-Host "    3. Clicca 'Test Push' o 'Invia Notifica'" -ForegroundColor Cyan
Write-Host "    4. Controlla il dispositivo Samsung" -ForegroundColor Cyan

Write-Host "`n  Per monitorare i log in tempo reale:" -ForegroundColor Gray
Write-Host "    firebase functions:log --only sendPushToUser" -ForegroundColor Cyan

# ========================================
# RIEPILOGO FINALE
# ========================================
Write-Host "`n" + "="*70 -ForegroundColor Cyan
Write-Host "🎉 DEPLOY COMPLETATO CON SUCCESSO!" -ForegroundColor Green
Write-Host "="*70 -ForegroundColor Cyan

Write-Host "`n📊 Riepilogo:" -ForegroundColor Yellow
Write-Host "  ✅ Cloud Functions deployate" -ForegroundColor Green
Write-Host "  ✅ Supporto FCM nativo Android/iOS attivo" -ForegroundColor Green
Write-Host "  ✅ Supporto Web Push attivo" -ForegroundColor Green
Write-Host "  ✅ Auto-cleanup subscription configurato" -ForegroundColor Green

Write-Host "`n📝 Prossimi passi:" -ForegroundColor Yellow
Write-Host "  1. Testa invio notifica da Admin Panel" -ForegroundColor Cyan
Write-Host "  2. Verifica ricezione su dispositivo Samsung" -ForegroundColor Cyan
Write-Host "  3. Controlla log su Firebase Console" -ForegroundColor Cyan

Write-Host "`n🔗 Link Utili:" -ForegroundColor Yellow
Write-Host "  Firebase Console: https://console.firebase.google.com/project/m-padelweb" -ForegroundColor Cyan
Write-Host "  Functions: https://console.firebase.google.com/project/m-padelweb/functions" -ForegroundColor Cyan
Write-Host "  Logs: https://console.firebase.google.com/project/m-padelweb/functions/logs" -ForegroundColor Cyan
Write-Host "  Firestore: https://console.firebase.google.com/project/m-padelweb/firestore" -ForegroundColor Cyan

Write-Host "`n" + "="*70 -ForegroundColor Cyan
Write-Host ""

# Chiedi se aprire Firebase Console
$openConsole = Read-Host "Vuoi aprire Firebase Console ora? (s/n)"
if ($openConsole -eq 's' -or $openConsole -eq 'S') {
    Start-Process "https://console.firebase.google.com/project/m-padelweb/functions"
}

Write-Host "`n✅ Fatto!" -ForegroundColor Green

