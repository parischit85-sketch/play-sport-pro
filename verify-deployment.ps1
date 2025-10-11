#!/usr/bin/env pwsh
# Script di verifica post-deploy

Write-Host ""
Write-Host "🔍 VERIFICA POST-DEPLOY PUSH NOTIFICATIONS" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

$siteUrl = "https://play-sport-pro-v2-2025.netlify.app"
$testEndpoint = "$siteUrl/.netlify/functions/test-env"

Write-Host "🌐 Sito: $siteUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: Verifica che il sito sia raggiungibile
Write-Host "1️⃣  Verifica connettività sito..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $siteUrl -Method Head -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Sito online e raggiungibile" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Sito non raggiungibile!" -ForegroundColor Red
    Write-Host "      Errore: $($_.Exception.Message)" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Test 2: Verifica endpoint diagnostica
Write-Host "2️⃣  Verifica endpoint diagnostica..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $testEndpoint -Method Get -TimeoutSec 10
    
    if ($response.allConfigured -eq $true) {
        Write-Host "   ✅ Endpoint diagnostica funzionante" -ForegroundColor Green
        Write-Host "   ✅ Tutte le variabili configurate!" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Dettagli configurazione:" -ForegroundColor Cyan
        Write-Host "   - VAPID public key: $($response.checks.VAPID_PUBLIC_KEY ? '✅' : '❌')" -ForegroundColor Gray
        Write-Host "   - VAPID private key: $($response.checks.VAPID_PRIVATE_KEY ? '✅' : '❌')" -ForegroundColor Gray
        Write-Host "   - Firebase project ID: $($response.checks.FIREBASE_PROJECT_ID ? '✅' : '❌')" -ForegroundColor Gray
        Write-Host "   - Firebase client email: $($response.checks.FIREBASE_CLIENT_EMAIL ? '✅' : '❌')" -ForegroundColor Gray
        Write-Host "   - Firebase private key: $($response.checks.FIREBASE_PRIVATE_KEY ? '✅' : '❌')" -ForegroundColor Gray
        Write-Host "   - Firebase Admin: $($response.firebaseAdmin)" -ForegroundColor $(if ($response.firebaseAdmin -eq 'success') { 'Green' } else { 'Red' })
    } else {
        Write-Host "   ⚠️  Endpoint raggiunto ma configurazione incompleta" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Variabili mancanti:" -ForegroundColor Red
        if (-not $response.checks.VAPID_PUBLIC_KEY) { Write-Host "   - VAPID_PUBLIC_KEY" -ForegroundColor Red }
        if (-not $response.checks.VAPID_PRIVATE_KEY) { Write-Host "   - VAPID_PRIVATE_KEY" -ForegroundColor Red }
        if (-not $response.checks.FIREBASE_PROJECT_ID) { Write-Host "   - FIREBASE_PROJECT_ID" -ForegroundColor Red }
        if (-not $response.checks.FIREBASE_CLIENT_EMAIL) { Write-Host "   - FIREBASE_CLIENT_EMAIL" -ForegroundColor Red }
        if (-not $response.checks.FIREBASE_PRIVATE_KEY) { Write-Host "   - FIREBASE_PRIVATE_KEY" -ForegroundColor Red }
    }
} catch {
    Write-Host "   ❌ Errore chiamando l'endpoint!" -ForegroundColor Red
    Write-Host "      $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Possibili cause:" -ForegroundColor Yellow
    Write-Host "   - Il deploy non è ancora completato" -ForegroundColor Gray
    Write-Host "   - Le Netlify Functions non sono state deployate" -ForegroundColor Gray
    Write-Host "   - Errore di configurazione" -ForegroundColor Gray
}

Write-Host ""

# Test 3: Verifica Service Worker
Write-Host "3️⃣  Verifica Service Worker..." -ForegroundColor Yellow
try {
    $swUrl = "$siteUrl/sw.js"
    $response = Invoke-WebRequest -Uri $swUrl -Method Get -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200 -and $response.Content -match "self.addEventListener\('push'") {
        Write-Host "   ✅ Service Worker presente e corretto" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Service Worker trovato ma potrebbe avere problemi" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Service Worker non trovato!" -ForegroundColor Red
    Write-Host "      Assicurati che public/sw.js sia nel build" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Riepilogo finale
Write-Host "📊 RIEPILOGO" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Prossimi passi:" -ForegroundColor Green
Write-Host "   1. Vai su: $siteUrl/profile" -ForegroundColor Yellow
Write-Host "   2. Fai login se necessario" -ForegroundColor Yellow
Write-Host "   3. Clicca 'Diagnostica server push'" -ForegroundColor Yellow
Write-Host "   4. Iscriviti alle notifiche" -ForegroundColor Yellow
Write-Host "   5. Invia una notifica di test" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔗 Link utili:" -ForegroundColor Cyan
Write-Host "   - Sito: $siteUrl" -ForegroundColor Blue
Write-Host "   - Admin: https://app.netlify.com/sites/play-sport-pro-v2-2025" -ForegroundColor Blue
Write-Host "   - Logs: https://app.netlify.com/sites/play-sport-pro-v2-2025/logs" -ForegroundColor Blue
Write-Host ""
