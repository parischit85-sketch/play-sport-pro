# Script per catturare logcat filtrati per Push Notifications
# Uso: .\capture-push-logs.ps1

Write-Host "🔍 Cattura logcat per Push Notifications..." -ForegroundColor Cyan
Write-Host "📱 Dispositivo: Samsung SM-S928B" -ForegroundColor Green
Write-Host ""
Write-Host "Filtri applicati:" -ForegroundColor Yellow
Write-Host "  - PushNotifications" -ForegroundColor Gray
Write-Host "  - CapacitorPush" -ForegroundColor Gray
Write-Host "  - FCM" -ForegroundColor Gray
Write-Host "  - Firebase" -ForegroundColor Gray
Write-Host "  - MessagingService" -ForegroundColor Gray
Write-Host ""
Write-Host "Premi Ctrl+C per fermare la cattura" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Pulisci i log precedenti
adb logcat -c

# Cattura log filtrati
adb logcat | Select-String -Pattern "PushNotifications|CapacitorPush|FCM|Firebase|MessagingService|chromium|Console" | ForEach-Object {
    $line = $_.Line

    # Colora gli errori in rosso
    if ($line -match "ERROR|Exception|Failed|error") {
        Write-Host $line -ForegroundColor Red
    }
    # Colora i warning in giallo
    elseif ($line -match "WARN|Warning") {
        Write-Host $line -ForegroundColor Yellow
    }
    # Colora i success in verde
    elseif ($line -match "success|Success|✅|saved|registered") {
        Write-Host $line -ForegroundColor Green
    }
    # Resto in bianco
    else {
        Write-Host $line
    }
}

