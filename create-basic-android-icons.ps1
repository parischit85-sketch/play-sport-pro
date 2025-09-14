# =============================================
# SCRIPT: create-basic-android-icons.ps1
# Crea icone Android di base usando le icone esistenti di Capacitor
# =============================================

Write-Host "Creating basic Android icons..." -ForegroundColor Green

# Verifica se esiste la directory android
if (-not (Test-Path "android\app\src\main\res")) {
    Write-Host "Android project not found" -ForegroundColor Red
    exit 1
}

# Copia le icone di default da Capacitor se esistono
$defaultIconsPath = "node_modules\@capacitor\android\capacitor\src\main\res"

if (Test-Path $defaultIconsPath) {
    Write-Host "Copying default Capacitor icons..." -ForegroundColor Cyan
    
    # Copia le icone mipmap
    Get-ChildItem "$defaultIconsPath\mipmap-*" -Directory | ForEach-Object {
        $destDir = "android\app\src\main\res\$($_.Name)"
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item "$($_.FullName)\*" "$destDir\" -Force
        Write-Host "Copied icons to $($_.Name)" -ForegroundColor Green
    }
    
    # Copia le icone drawable se esistono
    Get-ChildItem "$defaultIconsPath\drawable-*" -Directory | ForEach-Object {
        $destDir = "android\app\src\main\res\$($_.Name)"
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item "$($_.FullName)\*" "$destDir\" -Force -ErrorAction SilentlyContinue
        Write-Host "Copied drawable icons to $($_.Name)" -ForegroundColor Green
    }
    
} else {
    Write-Host "Default Capacitor icons not found, creating minimal icons..." -ForegroundColor Yellow
    
    # Crea icone minime usando il colore del tema
    $iconDirectories = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
    
    foreach ($dir in $iconDirectories) {
        $fullPath = "android\app\src\main\res\$dir"
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        }
        
        # Crea un drawable XML semplice come placeholder
        $xmlIcon = @'
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:pathData="M0,0h108v108h-108z"
        android:fillColor="#2563eb"/>
    <path
        android:pathData="M20,30h68v48h-68z"
        android:fillColor="#ffffff"
        android:strokeWidth="2"
        android:strokeColor="#2563eb"/>
    <path
        android:pathData="M54,30v48"
        android:strokeWidth="2"
        android:strokeColor="#2563eb"/>
    <circle
        android:cx="75"
        android:cy="25"
        android:radius="8"
        android:fillColor="#10b981"/>
</vector>
'@
        
        # Salva come ic_launcher.xml invece di .png
        $xmlIcon | Out-File "$fullPath\ic_launcher.xml" -Encoding UTF8
        $xmlIcon | Out-File "$fullPath\ic_launcher_round.xml" -Encoding UTF8
    }
    
    Write-Host "Created minimal XML icons" -ForegroundColor Green
}

# Crea notification icon come drawable XML
$notificationDrawablePath = "android\app\src\main\res\drawable"
if (-not (Test-Path $notificationDrawablePath)) {
    New-Item -ItemType Directory -Path $notificationDrawablePath -Force | Out-Null
}

$notificationIcon = @'
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24"
    android:tint="#FFFFFF">
    <path
        android:pathData="M4,8h16v8h-16z"
        android:fillColor="#00000000"
        android:strokeWidth="1.5"
        android:strokeColor="#FFFFFF"/>
    <path
        android:pathData="M12,8v8"
        android:strokeWidth="1"
        android:strokeColor="#FFFFFF"/>
    <circle
        android:cx="18"
        android:cy="6"
        android:radius="2"
        android:fillColor="#FFFFFF"/>
</vector>
'@

$notificationIcon | Out-File "$notificationDrawablePath\ic_stat_icon_config_sample.xml" -Encoding UTF8

Write-Host "Created notification icon drawable" -ForegroundColor Green

Write-Host "Basic Android icons created successfully!" -ForegroundColor Green
Write-Host "Ready to build APK" -ForegroundColor Cyan
