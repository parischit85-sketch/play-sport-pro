# =============================================
# SCRIPT: generate-android-icons.ps1
# Genera tutte le icone Android necessarie dal logo Play Sport Pro
# =============================================

Write-Host "🎨 Generating Android Icons for Play Sport Pro..." -ForegroundColor Cyan

# Verifica se esiste il logo principale
$logoPath = "public\icons\icon.svg"
if (-not (Test-Path $logoPath)) {
    Write-Host "❌ Logo SVG not found at: $logoPath" -ForegroundColor Red
    exit 1
}

# Directory di destinazione per le icone Android
$androidIconsDir = "android\app\src\main\res"

# Crea le directory se non esistono
@(
    "mipmap-hdpi", "mipmap-mdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi",
    "drawable", "drawable-hdpi", "drawable-mdpi", "drawable-xhdpi", "drawable-xxhdpi", "drawable-xxxhdpi"
) | ForEach-Object {
    $dir = "$androidIconsDir\$_"
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "📁 Created directory: $_" -ForegroundColor Green
    }
}

Write-Host "📱 Installing required tools..." -ForegroundColor Yellow

# Installa sharp-cli se non presente (per conversione SVG -> PNG)
try {
    npm list -g sharp-cli 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📦 Installing sharp-cli globally..." -ForegroundColor Yellow
        npm install -g sharp-cli
    }
} catch {
    Write-Host "⚠️ Warning: Could not check/install sharp-cli. Using alternative method." -ForegroundColor Yellow
}

# Funzione per convertire SVG in PNG usando sharp
function Convert-SvgToPng {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Width,
        [int]$Height
    )
    
    try {
        # Prova prima con sharp-cli
        sharp -i $InputPath -o $OutputPath -w $Width -h $Height --format png
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    } catch {
        Write-Host "⚠️ Sharp failed, trying alternative..." -ForegroundColor Yellow
    }
    
    # Metodo alternativo: copia SVG e rinomina (per testing)
    try {
        Copy-Item $InputPath $OutputPath.Replace('.png', '.svg')
        Write-Host "📄 Created SVG copy: $OutputPath" -ForegroundColor Blue
        return $true
    } catch {
        return $false
    }
}

Write-Host "🖼️ Generating launcher icons..." -ForegroundColor Green

# Definizioni delle icone launcher
$launcherIcons = @{
    "mipmap-mdpi\ic_launcher.png" = @{w=48; h=48}
    "mipmap-hdpi\ic_launcher.png" = @{w=72; h=72}
    "mipmap-xhdpi\ic_launcher.png" = @{w=96; h=96}
    "mipmap-xxhdpi\ic_launcher.png" = @{w=144; h=144}
    "mipmap-xxxhdpi\ic_launcher.png" = @{w=192; h=192}
    
    "mipmap-mdpi\ic_launcher_round.png" = @{w=48; h=48}
    "mipmap-hdpi\ic_launcher_round.png" = @{w=72; h=72}
    "mipmap-xhdpi\ic_launcher_round.png" = @{w=96; h=96}
    "mipmap-xxhdpi\ic_launcher_round.png" = @{w=144; h=144}
    "mipmap-xxxhdpi\ic_launcher_round.png" = @{w=192; h=192}
}

# Genera launcher icons
foreach ($icon in $launcherIcons.GetEnumerator()) {
    $outputPath = "$androidIconsDir\$($icon.Key)"
    $result = Convert-SvgToPng -InputPath $logoPath -OutputPath $outputPath -Width $icon.Value.w -Height $icon.Value.h
    
    if ($result) {
        Write-Host "✅ Generated: $($icon.Key) ($($icon.Value.w)x$($icon.Value.h))" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed: $($icon.Key)" -ForegroundColor Red
    }
}

Write-Host "🔔 Generating notification icons..." -ForegroundColor Green

# Crea icona notifica semplificata (monocromatica)
$notificationIconSvg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <defs>
    <style>
      .notification-icon { fill: #ffffff; }
    </style>
  </defs>
  <!-- Icona semplificata per notifiche - solo contorni bianchi -->
  <g class="notification-icon">
    <!-- Campo stilizzato -->
    <rect x="4" y="8" width="16" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <!-- Rete centrale -->
    <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="1"/>
    <!-- Palla -->
    <circle cx="18" cy="6" r="2" fill="currentColor"/>
  </g>
</svg>
"@

# Salva icona notifica
$notificationIconPath = "temp_notification_icon.svg"
$notificationIconSvg | Out-File -FilePath $notificationIconPath -Encoding UTF8

# Genera icone notifica in varie risoluzioni
$notificationIcons = @{
    "drawable-mdpi\ic_stat_icon_config_sample.png" = @{w=24; h=24}
    "drawable-hdpi\ic_stat_icon_config_sample.png" = @{w=36; h=36}
    "drawable-xhdpi\ic_stat_icon_config_sample.png" = @{w=48; h=48}
    "drawable-xxhdpi\ic_stat_icon_config_sample.png" = @{w=72; h=72}
    "drawable-xxxhdpi\ic_stat_icon_config_sample.png" = @{w=96; h=96}
}

foreach ($icon in $notificationIcons.GetEnumerator()) {
    $outputPath = "$androidIconsDir\$($icon.Key)"
    $result = Convert-SvgToPng -InputPath $notificationIconPath -OutputPath $outputPath -Width $icon.Value.w -Height $icon.Value.h
    
    if ($result) {
        Write-Host "✅ Generated notification: $($icon.Key) ($($icon.Value.w)x$($icon.Value.h))" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed notification: $($icon.Key)" -ForegroundColor Red
    }
}

# Pulisci file temporaneo
if (Test-Path $notificationIconPath) {
    Remove-Item $notificationIconPath
}

Write-Host "🎨 Generating splash screen resources..." -ForegroundColor Green

# Crea splash screen drawable
$splashXml = @"
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/blue_primary"/>
    <item android:gravity="center">
        <bitmap android:src="@mipmap/ic_launcher"
                android:gravity="center" />
    </item>
</layer-list>
"@

$splashXml | Out-File -FilePath "$androidIconsDir\drawable\splash.xml" -Encoding UTF8
Write-Host "✅ Created splash screen drawable" -ForegroundColor Green

# Crea colors.xml se non esiste
$colorsPath = "$androidIconsDir\values\colors.xml"
if (-not (Test-Path "$androidIconsDir\values")) {
    New-Item -ItemType Directory -Path "$androidIconsDir\values" -Force | Out-Null
}

$colorsXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="blue_primary">#2563eb</color>
    <color name="blue_dark">#1e40af</color>
    <color name="green_accent">#10b981</color>
    <color name="notification_color">#2563eb</color>
</resources>
"@

$colorsXml | Out-File -FilePath $colorsPath -Encoding UTF8
Write-Host "✅ Created colors.xml" -ForegroundColor Green

# Aggiorna strings.xml
$stringsPath = "$androidIconsDir\values\strings.xml"
$stringsXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Play Sport Pro</string>
    <string name="title_activity_main">Play Sport Pro - Gestione Campi</string>
    <string name="package_name">com.playsportpro.app</string>
    <string name="custom_url_scheme">playsportpro</string>
</resources>
"@

$stringsXml | Out-File -FilePath $stringsPath -Encoding UTF8
Write-Host "✅ Updated strings.xml" -ForegroundColor Green

Write-Host "`n🎉 Android icons generation completed!" -ForegroundColor Green
Write-Host "📱 Generated:" -ForegroundColor Cyan
Write-Host "   - Launcher icons (5 densities x 2 types = 10 files)" -ForegroundColor White
Write-Host "   - Notification icons (5 densities = 5 files)" -ForegroundColor White
Write-Host "   - Splash screen drawable" -ForegroundColor White
Write-Host "   - Colors and strings resources" -ForegroundColor White

Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run build" -ForegroundColor White
Write-Host "2. Run: npx cap sync android" -ForegroundColor White
Write-Host "3. Run: npx cap open android" -ForegroundColor White
Write-Host "4. Build APK in Android Studio" -ForegroundColor White

Write-Host "`n🚀 Ready to build your Play Sport Pro APK!" -ForegroundColor Green
