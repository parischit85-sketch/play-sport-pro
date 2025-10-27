# =============================================
# SCRIPT: build-apk.ps1
# Build completo APK Play Sport Pro
# =============================================

param(
    [switch]$SkipBuild,
    [switch]$SkipSync,
    [string]$BuildType = "debug"
)

Write-Host ""
Write-Host "🚀 Building Play Sport Pro APK" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Verifica prerequisiti
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan

# Verifica Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

# Verifica npm dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Step 1: Build React App
if (-not $SkipBuild) {
    Write-Host "🔨 Building React application..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ React build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ React build completed" -ForegroundColor Green
} else {
    Write-Host "⏭️ Skipping React build" -ForegroundColor Yellow
}

# Step 2: Sync with Capacitor
if (-not $SkipSync) {
    Write-Host "📱 Syncing with Capacitor Android..." -ForegroundColor Cyan
    npx cap sync android
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Capacitor sync failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Capacitor sync completed" -ForegroundColor Green
} else {
    Write-Host "⏭️ Skipping Capacitor sync" -ForegroundColor Yellow
}

# Step 3: Check Android project
Write-Host "🤖 Checking Android project..." -ForegroundColor Cyan
if (-not (Test-Path "android\gradlew.bat")) {
    Write-Host "❌ Android project not found. Run 'npx cap add android' first" -ForegroundColor Red
    exit 1
}

# Step 4: Build APK using Gradle
Write-Host "⚙️ Building APK with Gradle..." -ForegroundColor Cyan
Write-Host "Build Type: $BuildType" -ForegroundColor White

Push-Location "android"

try {
    if ($BuildType -eq "release") {
        Write-Host "🏭 Building RELEASE APK..." -ForegroundColor Yellow
        .\gradlew.bat assembleRelease
        $apkPath = "app\build\outputs\apk\release\app-release-unsigned.apk"
        $finalApkName = "..\PlaySportPro-release.apk"
    } else {
        Write-Host "🐛 Building DEBUG APK..." -ForegroundColor Yellow
        .\gradlew.bat assembleDebug  
        $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
        $finalApkName = "..\PlaySportPro-debug.apk"
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Gradle build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    # Copy APK to root directory
    if (Test-Path $apkPath) {
        Copy-Item $apkPath $finalApkName -Force
        $apkSize = [math]::Round((Get-Item $finalApkName).Length / 1MB, 2)
        Write-Host "✅ APK built successfully!" -ForegroundColor Green
        Write-Host "📁 Location: $finalApkName" -ForegroundColor White
        Write-Host "📊 Size: $apkSize MB" -ForegroundColor White
    } else {
        Write-Host "❌ APK file not found at expected location" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
} catch {
    Write-Host "❌ Error building APK: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

Write-Host ""
Write-Host "🎉 Play Sport Pro APK Build Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Show APK info
$apkFile = Get-Item "PlaySportPro-$BuildType.apk"
Write-Host "📱 APK Details:" -ForegroundColor Cyan
Write-Host "   Name: $($apkFile.Name)" -ForegroundColor White
Write-Host "   Size: $([math]::Round($apkFile.Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host "   Created: $($apkFile.CreationTime)" -ForegroundColor White
Write-Host "   Path: $($apkFile.FullName)" -ForegroundColor White

Write-Host ""
Write-Host "📲 Installation Instructions:" -ForegroundColor Yellow
Write-Host "1. Enable 'Unknown Sources' on your Android device"
Write-Host "2. Transfer the APK to your device"
Write-Host "3. Tap to install"
Write-Host "4. Grant notification permissions when prompted"

Write-Host ""
Write-Host "🔧 Testing Features:" -ForegroundColor Yellow
Write-Host "✅ Court booking system"
Write-Host "✅ Player management" 
Write-Host "✅ Tournament system"
Write-Host "✅ Statistics dashboard"
Write-Host "✅ Push notifications"
Write-Host "✅ PWA capabilities"
Write-Host "✅ Offline support"

Write-Host ""
Write-Host "🚀 Your Play Sport Pro app is ready!" -ForegroundColor Green

# Open file explorer to APK location
try {
    explorer.exe /select,"$((Get-Item "PlaySportPro-$BuildType.apk").FullName)"
} catch {
    Write-Host "💡 APK location: $((Get-Item "PlaySportPro-$BuildType.apk").FullName)" -ForegroundColor Cyan
}
