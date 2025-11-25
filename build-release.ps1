# =============================================
# BUILD RELEASE PLAY SPORT PRO
# Script automatico per generare AAB firmato
# =============================================

param(
    [string]$BuildType = "aab"  # aab o apk
)

Write-Host "`n🚀 PLAY SPORT PRO - BUILD RELEASE SCRIPT`n" -ForegroundColor Cyan

# Step 1: Verifica prerequisiti
Write-Host "📋 Step 1/5: Verifica prerequisiti..." -ForegroundColor Yellow
if (-not (Test-Path "android/app/play-sport-pro.keystore")) {
    Write-Host "❌ Keystore non trovato! Genera prima il keystore." -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "android/key.properties")) {
    Write-Host "❌ key.properties non trovato! Configura prima le credenziali." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prerequisiti OK`n" -ForegroundColor Green

# Step 2: Build web app
Write-Host "📋 Step 2/5: Build web app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build web fallito" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build web completato`n" -ForegroundColor Green

# Step 3: Sync Capacitor
Write-Host "📋 Step 3/5: Sync con Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Sync Capacitor fallito" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Sync completato`n" -ForegroundColor Green

# Step 4: Build AAB/APK
Write-Host "📋 Step 4/5: Generazione $BuildType firmato..." -ForegroundColor Yellow

# Leggi versione da package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$version = $packageJson.version

Push-Location "android"

if ($BuildType -eq "aab") {
    .\gradlew.bat bundleRelease --warning-mode none
    $outputPath = "app/build/outputs/bundle/release/app-release.aab"
    $outputName = "PlaySportPro-v$version-release.aab"
} else {
    .\gradlew.bat assembleRelease --warning-mode none
    $outputPath = "app/build/outputs/apk/release/app-release.apk"
    $outputName = "PlaySportPro-v$version-release.apk"
}

Pop-Location

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build $BuildType fallito" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build $BuildType completato`n" -ForegroundColor Green

# Step 5: Copia file nella root
Write-Host "📋 Step 5/5: Finalizzazione..." -ForegroundColor Yellow
$fullOutputPath = "android/$outputPath"
if (Test-Path $fullOutputPath) {
    Copy-Item $fullOutputPath $outputName -Force
    $size = (Get-Item $fullOutputPath).Length
    $sizeMB = [math]::Round($size / 1MB, 2)
    
    Write-Host "`n✅ BUILD COMPLETATO CON SUCCESSO!`n" -ForegroundColor Green
    Write-Host "📦 File generato:" -ForegroundColor Cyan
    Write-Host "   Nome: $outputName" -ForegroundColor White
    Write-Host "   Dimensione: $sizeMB MB" -ForegroundColor White
    Write-Host "   Percorso: $(Get-Location)\$outputName`n" -ForegroundColor White
    
    Write-Host "🎯 PROSSIMI STEP:" -ForegroundColor Yellow
    if ($BuildType -eq "aab") {
        Write-Host "   1. Vai su https://play.google.com/console" -ForegroundColor White
        Write-Host "   2. Produzione → Crea nuova release" -ForegroundColor White
        Write-Host "   3. Carica il file: $outputName`n" -ForegroundColor White
    } else {
        Write-Host "   1. Trasferisci $outputName sul telefono" -ForegroundColor White
        Write-Host "   2. Installa l'APK" -ForegroundColor White
        Write-Host "   3. Testa l'app`n" -ForegroundColor White
    }
} else {
    Write-Host "❌ File $BuildType non trovato in: $fullOutputPath" -ForegroundColor Red
    exit 1
}

Write-Host "✨ Script completato!" -ForegroundColor Green
