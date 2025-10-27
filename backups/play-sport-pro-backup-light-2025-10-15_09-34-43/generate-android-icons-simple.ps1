# =============================================
# SCRIPT: generate-android-icons.ps1
# Genera tutte le icone Android necessarie dal logo Play Sport Pro
# =============================================

Write-Host "Generating Android Icons for Play Sport Pro..." -ForegroundColor Cyan

# Verifica se esiste il logo principale
$logoPath = "public\icons\icon.svg"
if (-not (Test-Path $logoPath)) {
    Write-Host "Logo SVG not found at: $logoPath" -ForegroundColor Red
    exit 1
}

# Directory di destinazione per le icone Android
$androidIconsDir = "android\app\src\main\res"

# Crea le directory se non esistono
$directories = @(
    "mipmap-hdpi", "mipmap-mdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi",
    "drawable", "drawable-hdpi", "drawable-mdpi", "drawable-xhdpi", "drawable-xxhdpi", "drawable-xxxhdpi",
    "values"
)

foreach ($dir in $directories) {
    $fullPath = "$androidIconsDir\$dir"
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Green
    }
}

Write-Host "Installing sharp-cli for SVG conversion..." -ForegroundColor Yellow

# Installa sharp-cli globalmente
try {
    npm install -g sharp-cli
    Write-Host "Sharp-cli installed successfully" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not install sharp-cli. Manual conversion needed." -ForegroundColor Yellow
}

Write-Host "Copying logo to Android mipmap directories..." -ForegroundColor Green

# Per ora copiamo il file SVG nelle directory Android
# In produzione useresti uno strumento per convertire SVG in PNG
$svgContent = Get-Content $logoPath -Raw

# Crea le icone launcher copiando il file SVG (placeholder)
$launcherDirs = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")

foreach ($dir in $launcherDirs) {
    $svgContent | Out-File "$androidIconsDir\$dir\ic_launcher.svg" -Encoding UTF8
    $svgContent | Out-File "$androidIconsDir\$dir\ic_launcher_round.svg" -Encoding UTF8
    Write-Host "Created launcher icons in: $dir" -ForegroundColor Green
}

Write-Host "Creating notification icon..." -ForegroundColor Green

# Crea icona notifica semplificata
$notificationIconSvg = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <g fill="#ffffff">
    <rect x="4" y="8" width="16" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="1"/>
    <circle cx="18" cy="6" r="2" fill="currentColor"/>
  </g>
</svg>
'@

# Salva icona notifica in tutte le directory drawable
$drawableDirs = @("drawable-mdpi", "drawable-hdpi", "drawable-xhdpi", "drawable-xxhdpi", "drawable-xxxhdpi")

foreach ($dir in $drawableDirs) {
    $notificationIconSvg | Out-File "$androidIconsDir\$dir\ic_stat_icon_config_sample.svg" -Encoding UTF8
    Write-Host "Created notification icon in: $dir" -ForegroundColor Green
}

Write-Host "Creating splash screen resources..." -ForegroundColor Green

# Crea splash screen drawable
$splashXml = @'
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/blue_primary"/>
    <item android:gravity="center">
        <bitmap android:src="@mipmap/ic_launcher"
                android:gravity="center" />
    </item>
</layer-list>
'@

$splashXml | Out-File "$androidIconsDir\drawable\splash.xml" -Encoding UTF8
Write-Host "Created splash screen drawable" -ForegroundColor Green

# Crea colors.xml
$colorsXml = @'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="blue_primary">#2563eb</color>
    <color name="blue_dark">#1e40af</color>
    <color name="green_accent">#10b981</color>
    <color name="notification_color">#2563eb</color>
</resources>
'@

$colorsXml | Out-File "$androidIconsDir\values\colors.xml" -Encoding UTF8
Write-Host "Created colors.xml" -ForegroundColor Green

# Aggiorna strings.xml
$stringsXml = @'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Play Sport Pro</string>
    <string name="title_activity_main">Play Sport Pro - Gestione Campi</string>
    <string name="package_name">com.playsportpro.app</string>
    <string name="custom_url_scheme">playsportpro</string>
</resources>
'@

$stringsXml | Out-File "$androidIconsDir\values\strings.xml" -Encoding UTF8
Write-Host "Updated strings.xml" -ForegroundColor Green

Write-Host ""
Write-Host "Android icons generation completed!" -ForegroundColor Green
Write-Host "Generated:"
Write-Host "- Launcher icons (SVG format for now)" -ForegroundColor White
Write-Host "- Notification icons (SVG format for now)" -ForegroundColor White  
Write-Host "- Splash screen drawable" -ForegroundColor White
Write-Host "- Colors and strings resources" -ForegroundColor White

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Convert SVG icons to PNG using Android Studio or online tools"
Write-Host "2. Run: npm run build"
Write-Host "3. Run: npx cap sync android"
Write-Host "4. Run: npx cap open android" 
Write-Host "5. Build APK in Android Studio"

Write-Host ""
Write-Host "Ready to build your Play Sport Pro APK!" -ForegroundColor Green
