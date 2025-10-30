# =============================================
# Script: Setup Firebase Cloud Functions Secrets
# Descrizione: Configura automaticamente le chiavi VAPID su Firebase
# =============================================

Write-Host "`n🔥 Firebase Cloud Functions - VAPID Setup" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Chiavi VAPID (le stesse configurate su Netlify)
$VAPID_PUBLIC = "BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM"
$VAPID_PRIVATE = "I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I"

# =============================================
# 1. Verifica Firebase CLI
# =============================================
Write-Host "📦 Verifico Firebase CLI..." -ForegroundColor Yellow

try {
    $firebaseVersion = firebase --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Firebase CLI non trovato"
    }
    Write-Host "✅ Firebase CLI installato: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Firebase CLI non installato!" -ForegroundColor Red
    Write-Host "`n📥 Installa con:" -ForegroundColor Yellow
    Write-Host "   npm install -g firebase-tools" -ForegroundColor White
    Write-Host "`nPoi rilancia questo script.`n" -ForegroundColor Yellow
    exit 1
}

# =============================================
# 2. Verifica Login
# =============================================
Write-Host "`n🔐 Verifico autenticazione Firebase..." -ForegroundColor Yellow

$loginCheck = firebase projects:list 2>&1
if ($loginCheck -match "not logged in" -or $loginCheck -match "Error:") {
    Write-Host "❌ Non sei autenticato su Firebase" -ForegroundColor Red
    Write-Host "`n🔑 Effettuo login..." -ForegroundColor Yellow
    
    firebase login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Login fallito!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Autenticato su Firebase" -ForegroundColor Green

# =============================================
# 3. Verifica Progetto
# =============================================
Write-Host "`n📂 Verifico progetto Firebase..." -ForegroundColor Yellow

$projects = firebase projects:list 2>&1
if ($projects -match "m-padelweb") {
    Write-Host "✅ Progetto m-padelweb trovato" -ForegroundColor Green
} else {
    Write-Host "⚠️ Progetto m-padelweb non trovato nella lista" -ForegroundColor Red
    Write-Host "`nProgetti disponibili:" -ForegroundColor Yellow
    Write-Host $projects
    
    $continue = Read-Host "`nVuoi continuare comunque? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# =============================================
# 4. Configura Secrets
# =============================================
Write-Host "`n🔑 Configurazione Secrets VAPID..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# VAPID_PUBLIC_KEY
Write-Host "📝 Configurazione VAPID_PUBLIC_KEY..." -ForegroundColor Yellow
Write-Host "   Valore: $($VAPID_PUBLIC.Substring(0, 30))..." -ForegroundColor Gray

$VAPID_PUBLIC | firebase functions:secrets:set VAPID_PUBLIC_KEY

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ VAPID_PUBLIC_KEY configurato" -ForegroundColor Green
} else {
    Write-Host "❌ Errore configurazione VAPID_PUBLIC_KEY" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# VAPID_PRIVATE_KEY
Write-Host "`n📝 Configurazione VAPID_PRIVATE_KEY..." -ForegroundColor Yellow
Write-Host "   Valore: $($VAPID_PRIVATE.Substring(0, 20))..." -ForegroundColor Gray

$VAPID_PRIVATE | firebase functions:secrets:set VAPID_PRIVATE_KEY

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ VAPID_PRIVATE_KEY configurato" -ForegroundColor Green
} else {
    Write-Host "❌ Errore configurazione VAPID_PRIVATE_KEY" -ForegroundColor Red
    exit 1
}

# =============================================
# 5. Verifica Configurazione
# =============================================
Write-Host "`n🔍 Verifica configurazione..." -ForegroundColor Yellow

Write-Host "`n📋 Secrets configurati:" -ForegroundColor Cyan
firebase functions:secrets:list

# =============================================
# 6. Deploy Functions
# =============================================
Write-Host "`n🚀 Deploy Cloud Functions..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$deploy = Read-Host "Vuoi fare il deploy delle Cloud Functions ora? (y/n)"

if ($deploy -eq "y") {
    Write-Host "`n📤 Deploy in corso..." -ForegroundColor Yellow
    
    firebase deploy --only functions:sendBulkCertificateNotifications
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Deploy completato con successo!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Deploy fallito. Controlla gli errori sopra." -ForegroundColor Red
    }
} else {
    Write-Host "`n⏭️ Deploy saltato. Ricorda di eseguirlo manualmente:" -ForegroundColor Yellow
    Write-Host "   firebase deploy --only functions" -ForegroundColor White
}

# =============================================
# 7. Riepilogo Finale
# =============================================
Write-Host "`n✅ Setup Completato!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "📊 Riepilogo:" -ForegroundColor Cyan
Write-Host "  ✅ Firebase CLI: Installato e autenticato" -ForegroundColor Gray
Write-Host "  ✅ VAPID_PUBLIC_KEY: Configurato" -ForegroundColor Gray
Write-Host "  ✅ VAPID_PRIVATE_KEY: Configurato" -ForegroundColor Gray

if ($deploy -eq "y") {
    Write-Host "  ✅ Cloud Functions: Deployate" -ForegroundColor Gray
} else {
    Write-Host "  ⏸️ Cloud Functions: Deploy da fare" -ForegroundColor Yellow
}

Write-Host "`n🎯 Prossimi Passi:" -ForegroundColor Cyan
Write-Host "  1. Riavvia il dev server locale (npm run dev)" -ForegroundColor White
Write-Host "  2. Vai alla dashboard admin" -ForegroundColor White
Write-Host "  3. Testa l'invio di una notifica push" -ForegroundColor White
Write-Host "  4. Verifica i logs: firebase functions:log`n" -ForegroundColor White

Write-Host "📖 Documentazione completa: FIREBASE_CLOUD_FUNCTIONS_ENV_SETUP.md`n" -ForegroundColor Gray

# =============================================
# 8. Test Opzionale
# =============================================
$test = Read-Host "Vuoi visualizzare i logs delle Functions? (y/n)"

if ($test -eq "y") {
    Write-Host "`n📜 Ultimi logs (Ctrl+C per uscire):`n" -ForegroundColor Yellow
    firebase functions:log --only sendBulkCertificateNotifications --lines 30
}

Write-Host "`n✨ Setup completato con successo!`n" -ForegroundColor Green
