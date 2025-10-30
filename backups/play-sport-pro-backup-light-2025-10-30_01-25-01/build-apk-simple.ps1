# =============================================
# SCRIPT: build-apk-simple.ps1  
# Build APK Play Sport Pro - Versione Semplificata
# =============================================

Write-Host "Building Play Sport Pro APK..." -ForegroundColor Green

# Step 1: Build React App
Write-Host "Building React application..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "React build failed" -ForegroundColor Red
    exit 1
}
Write-Host "React build completed" -ForegroundColor Green

# Step 2: Sync with Capacitor  
Write-Host "Syncing with Capacitor Android..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Capacitor sync failed" -ForegroundColor Red
    exit 1
}
Write-Host "Capacitor sync completed" -ForegroundColor Green

# Step 3: Build APK
Write-Host "Building APK with Gradle..." -ForegroundColor Cyan
Push-Location "android"

.\gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        Copy-Item $apkPath "..\PlaySportPro-debug.apk" -Force
        Write-Host "APK built successfully!" -ForegroundColor Green
        Write-Host "Location: PlaySportPro-debug.apk" -ForegroundColor White
    } else {
        Write-Host "APK file not found" -ForegroundColor Red
    }
} else {
    Write-Host "Gradle build failed" -ForegroundColor Red
}

Pop-Location

Write-Host "Build process completed!" -ForegroundColor Green
