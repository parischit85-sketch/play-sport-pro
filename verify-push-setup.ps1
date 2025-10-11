#!/usr/bin/env pwsh
# Script di verifica pre-deploy per Push Notifications

Write-Host ""
Write-Host "🔍 VERIFICA PRE-DEPLOY PUSH NOTIFICATIONS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. Verifica file esistenti
Write-Host "📁 Verifica file necessari..." -ForegroundColor Yellow

$requiredFiles = @(
    "public/sw.js",
    "netlify/functions/save-push-subscription.js",
    "netlify/functions/remove-push-subscription.js",
    "netlify/functions/send-push.js",
    "netlify/functions/test-env.js",
    "src/utils/push.js",
    "src/components/debug/PushNotificationPanel.jsx",
    ".env.push-example",
    "PUSH_NOTIFICATIONS_SETUP.md",
    "setup-netlify-env.ps1"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file MANCANTE!" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# 2. Verifica VAPID public key nel codice client
Write-Host "🔑 Verifica VAPID public key..." -ForegroundColor Yellow

$pushJsContent = Get-Content "src/utils/push.js" -Raw
if ($pushJsContent -match "BLgzoWZyeroUOSQ_qCFGfD-Y1PTkM809QTxc85X9oiHFKLovhxCpTgpAQV8zX6iJwLKy_wmMEQx7HHZUKrXusdM") {
    Write-Host "   ✅ VAPID public key configurata in push.js" -ForegroundColor Green
} else {
    Write-Host "   ❌ VAPID public key NON trovata in push.js!" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# 3. Verifica Service Worker
Write-Host "🔧 Verifica Service Worker..." -ForegroundColor Yellow

$swContent = Get-Content "public/sw.js" -Raw
if ($swContent -match "self.addEventListener\('push'") {
    Write-Host "   ✅ Push event listener presente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Push event listener MANCANTE!" -ForegroundColor Red
    $allGood = $false
}

if ($swContent -match "self.addEventListener\('notificationclick'") {
    Write-Host "   ✅ Notification click listener presente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Notification click listener MANCANTE!" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# 4. Verifica Netlify Functions
Write-Host "⚡ Verifica Netlify Functions..." -ForegroundColor Yellow

$functions = @(
    @{Name="save-push-subscription"; File="netlify/functions/save-push-subscription.js"; Pattern="exports.handler"},
    @{Name="remove-push-subscription"; File="netlify/functions/remove-push-subscription.js"; Pattern="exports.handler"},
    @{Name="send-push"; File="netlify/functions/send-push.js"; Pattern="webpush.sendNotification"},
    @{Name="test-env"; File="netlify/functions/test-env.js"; Pattern="VAPID_PUBLIC_KEY"}
)

foreach ($func in $functions) {
    if (Test-Path $func.File) {
        $content = Get-Content $func.File -Raw
        if ($content -match $func.Pattern) {
            Write-Host "   ✅ $($func.Name): OK" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $($func.Name): presente ma potrebbe avere problemi" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ $($func.Name): MANCANTE!" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# 5. Verifica UI Panel
Write-Host "🎨 Verifica UI Panel..." -ForegroundColor Yellow

$panelContent = Get-Content "src/components/debug/PushNotificationPanel.jsx" -Raw
if ($panelContent -match "checkPushServerConfig") {
    Write-Host "   ✅ Diagnostica server presente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Diagnostica server MANCANTE!" -ForegroundColor Red
    $allGood = $false
}

if ($panelContent -match "requestNotificationPermission|subscribeToPush") {
    Write-Host "   ✅ Richiesta permessi presente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Richiesta permessi MANCANTE!" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# 6. Verifica Build
Write-Host "🏗️  Verifica Build..." -ForegroundColor Yellow

if (Test-Path "dist/index.html") {
    Write-Host "   ✅ Build esistente trovata" -ForegroundColor Green
    
    # Controlla se service worker è nella dist
    if (Test-Path "dist/sw.js") {
        Write-Host "   ✅ Service Worker in dist/" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Service Worker non in dist/ (potrebbe essere in public/)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Nessuna build trovata (esegui 'npm run build')" -ForegroundColor Yellow
}

Write-Host ""

# 7. Verifica package.json dependencies
Write-Host "📦 Verifica dipendenze..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$devDeps = $packageJson.devDependencies
$deps = $packageJson.dependencies

if ($devDeps."web-push" -or $deps."web-push") {
    Write-Host "   ✅ web-push installato" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  web-push potrebbe non essere installato" -ForegroundColor Yellow
    Write-Host "      (Verrà installato su Netlify da netlify/functions/package.json)" -ForegroundColor Gray
}

Write-Host ""

# 8. Riepilogo finale
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "✅ VERIFICA COMPLETATA CON SUCCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Prossimi passi:" -ForegroundColor Cyan
    Write-Host "   1. Configura le variabili d'ambiente su Netlify" -ForegroundColor Yellow
    Write-Host "      - Usa lo script: .\setup-netlify-env.ps1" -ForegroundColor Yellow
    Write-Host "      - Oppure manualmente: vedi PUSH_NOTIFICATIONS_SETUP.md" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   2. Attendi il deploy automatico di Netlify" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   3. Testa l'app:" -ForegroundColor Yellow
    Write-Host "      - Vai su /profile" -ForegroundColor Yellow
    Write-Host "      - Clicca 'Diagnostica server push'" -ForegroundColor Yellow
    Write-Host "      - Verifica che tutti i check siano verdi" -ForegroundColor Yellow
    Write-Host "      - Iscriviti alle notifiche" -ForegroundColor Yellow
    Write-Host "      - Invia una notifica di test" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "❌ VERIFICA FALLITA!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alcuni file o configurazioni mancano." -ForegroundColor Red
    Write-Host "Controlla gli errori sopra e correggi prima di procedere." -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
Write-Host "📚 Documentazione:" -ForegroundColor Cyan
Write-Host "   - PUSH_NOTIFICATIONS_SETUP.md - Guida completa" -ForegroundColor Gray
Write-Host "   - .env.push-example - Template variabili" -ForegroundColor Gray
Write-Host "   - SESSION_SUMMARY_2025-10-11.md - Riepilogo modifiche" -ForegroundColor Gray
Write-Host ""
