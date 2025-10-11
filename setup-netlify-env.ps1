#!/usr/bin/env pwsh
# Script per configurare le environment variables su Netlify
# Richiede: Netlify CLI installato (npm install -g netlify-cli)

param(
    [string]$FirebaseJsonPath = ""
)

Write-Host "🔧 Setup Netlify Environment Variables per Push Notifications" -ForegroundColor Cyan
Write-Host ""

# Verifica che Netlify CLI sia installato
$netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue
if (-not $netlifyInstalled) {
    Write-Host "❌ Netlify CLI non trovato!" -ForegroundColor Red
    Write-Host "   Installalo con: npm install -g netlify-cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Netlify CLI trovato" -ForegroundColor Green
Write-Host ""

# Verifica che l'utente sia loggato
Write-Host "🔍 Verifico autenticazione Netlify..." -ForegroundColor Cyan
$statusOutput = netlify status 2>&1
if ($statusOutput -match "Not logged in") {
    Write-Host "❌ Non sei loggato su Netlify!" -ForegroundColor Red
    Write-Host "   Esegui: netlify login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Autenticato su Netlify" -ForegroundColor Green
Write-Host ""

# VAPID Keys (già generate)
$vapidPublicKey = "BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM"
$vapidPrivateKey = "I-rY8mHqxKzGnDo5_EqT7jPpVHxGBpfWvLJhMxCqf7I"

Write-Host "📋 VAPID Keys configurate:" -ForegroundColor Cyan
Write-Host "   Public Key: $vapidPublicKey" -ForegroundColor Gray
Write-Host "   Private Key: [HIDDEN]" -ForegroundColor Gray
Write-Host ""

# Richiedi Firebase credentials
Write-Host "🔥 Configurazione Firebase Admin" -ForegroundColor Cyan

if ($FirebaseJsonPath -eq "" -or -not (Test-Path $FirebaseJsonPath)) {
    Write-Host "   Apri Firebase Console → Project Settings → Service Accounts" -ForegroundColor Yellow
    Write-Host "   Genera una nuova chiave privata e scarica il JSON" -ForegroundColor Yellow
    Write-Host ""

    $FirebaseJsonPath = Read-Host "Percorso del file JSON Firebase scaricato"

    if (-not (Test-Path $FirebaseJsonPath)) {
        Write-Host "❌ File non trovato: $FirebaseJsonPath" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ File Firebase trovato" -ForegroundColor Green

# Leggi il JSON
$firebaseJson = Get-Content $FirebaseJsonPath -Raw | ConvertFrom-Json

$firebaseProjectId = $firebaseJson.project_id
$firebaseClientEmail = $firebaseJson.client_email
$firebasePrivateKey = $firebaseJson.private_key

# Escape newlines per Netlify
$firebasePrivateKeyEscaped = $firebasePrivateKey -replace "`n", "\\n"

Write-Host ""
Write-Host "📤 Configurazione variabili su Netlify..." -ForegroundColor Cyan
Write-Host ""

# Funzione per settare una variabile d'ambiente
function Set-NetlifyEnv {
    param(
        [string]$Key,
        [string]$Value,
        [string]$DisplayValue = $null
    )
    
    if (-not $DisplayValue) {
        $DisplayValue = $Value
    }
    
    Write-Host "   Configurando $Key..." -ForegroundColor Gray
    
    # Usa netlify env:set
    $output = netlify env:set $Key $Value 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $Key configurato" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Errore configurando $Key" -ForegroundColor Red
        Write-Host "      Output: $output" -ForegroundColor Yellow
    }
}

# Configura tutte le variabili
Set-NetlifyEnv "VAPID_PUBLIC_KEY" $vapidPublicKey
Set-NetlifyEnv "VAPID_PRIVATE_KEY" $vapidPrivateKey "[HIDDEN]"
Set-NetlifyEnv "FIREBASE_PROJECT_ID" $firebaseProjectId
Set-NetlifyEnv "FIREBASE_CLIENT_EMAIL" $firebaseClientEmail
Set-NetlifyEnv "FIREBASE_PRIVATE_KEY" $firebasePrivateKeyEscaped "[HIDDEN]"

Write-Host ""
Write-Host "✅ Configurazione completata!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Prossimi passi:" -ForegroundColor Cyan
Write-Host "   1. Netlify rifarà automaticamente il deploy" -ForegroundColor Yellow
Write-Host "   2. Aspetta che il deploy sia completo" -ForegroundColor Yellow
Write-Host "   3. Vai su /profile nell'app" -ForegroundColor Yellow
Write-Host "   4. Clicca 'Diagnostica server push' per verificare" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Puoi monitorare il deploy su:" -ForegroundColor Cyan
Write-Host "   https://app.netlify.com" -ForegroundColor Blue
Write-Host ""
