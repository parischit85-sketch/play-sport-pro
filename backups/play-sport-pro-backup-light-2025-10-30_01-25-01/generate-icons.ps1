# ========================================
# Generatore Icone PWA - Quick Script
# ========================================

# Questo script PowerShell crea icone PNG dalle SVG per la PWA
# Richiede Inkscape installato: https://inkscape.org/release/

param(
    [string]$InputSVG = ".\public\icons\icon.svg",
    [string]$OutputDir = ".\public\icons"
)

# Dimensioni icone richieste per PWA
$IconSizes = @(72, 96, 128, 144, 152, 192, 384, 512)

Write-Host "🎨 Generando icone PWA per Paris League..." -ForegroundColor Cyan
Write-Host "📂 Input: $InputSVG"
Write-Host "📁 Output: $OutputDir"

# Verifica che Inkscape sia disponibile
$InkscapeCmd = Get-Command inkscape -ErrorAction SilentlyContinue
if (-not $InkscapeCmd) {
    Write-Host "❌ Inkscape non trovato!" -ForegroundColor Red
    Write-Host "   Scarica da: https://inkscape.org/release/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔄 Alternative:"
    Write-Host "   1. Usa servizi online: https://realfavicongenerator.net/"
    Write-Host "   2. Usa tool online: https://www.pwabuilder.com/imageGenerator"
    Write-Host "   3. Installa ImageMagick e modifica questo script"
    exit 1
}

# Verifica che il file SVG esista
if (-not (Test-Path $InputSVG)) {
    Write-Host "❌ File SVG non trovato: $InputSVG" -ForegroundColor Red
    exit 1
}

# Crea directory se non esiste
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host ""
Write-Host "🔄 Generando icone..."

$SuccessCount = 0
$ErrorCount = 0

foreach ($Size in $IconSizes) {
    $OutputFile = Join-Path $OutputDir "icon-$Size.png"
    
    try {
        Write-Host "   📐 $Size x $Size px..." -NoNewline
        
        & inkscape --export-type=png --export-filename="$OutputFile" --export-width=$Size --export-height=$Size "$InputSVG" 2>$null
        
        if (Test-Path $OutputFile) {
            $FileSize = (Get-Item $OutputFile).Length
            $FileSizeKB = [math]::Round($FileSize / 1KB, 1)
            Write-Host " ✅ ($FileSizeKB KB)" -ForegroundColor Green
            $SuccessCount++
        } else {
            Write-Host " ❌ Fallita" -ForegroundColor Red
            $ErrorCount++
        }
    }
    catch {
        Write-Host " ❌ Errore: $($_.Exception.Message)" -ForegroundColor Red
        $ErrorCount++
    }
}

Write-Host ""
Write-Host "📊 Risultati:" -ForegroundColor Cyan
Write-Host "   ✅ Generate: $SuccessCount icone"
Write-Host "   ❌ Errori: $ErrorCount"

if ($SuccessCount -gt 0) {
    Write-Host ""
    Write-Host "🎯 Manifest.json da aggiornare:" -ForegroundColor Yellow
    Write-Host '{'
    Write-Host '  "icons": ['
    
    foreach ($Size in $IconSizes) {
        $Purpose = if ($Size -eq 192 -or $Size -eq 512) { "any maskable" } else { "any" }
        Write-Host "    {"
        Write-Host "      `"src`": `"/icons/icon-$Size.png`","
        Write-Host "      `"sizes`": `"${Size}x${Size}`","
        Write-Host "      `"type`": `"image/png`","  
        Write-Host "      `"purpose`": `"$Purpose`""
        if ($Size -ne $IconSizes[-1]) {
            Write-Host "    },"
        } else {
            Write-Host "    }"
        }
    }
    
    Write-Host '  ]'
    Write-Host '}'
    
    Write-Host ""
    Write-Host "🚀 Prossimi step:"
    Write-Host "   1. Aggiorna manifest.json con le nuove icone"
    Write-Host "   2. Testa con: npm run build && npm run preview"
    Write-Host "   3. Verifica con Chrome DevTools > Application > Manifest"
}

Write-Host ""
Write-Host "✨ Script completato!" -ForegroundColor Green
