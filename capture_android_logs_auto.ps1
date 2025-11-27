# Script automatico per catturare log Android (durata 45s)
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "android-logs-$timestamp.txt"
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

Write-Host "📱 In attesa del dispositivo..."
& $adb wait-for-device

Write-Host "🧹 Pulizia log precedenti..."
& $adb logcat -c

Write-Host "🔴 Avvio cattura log su file: $logFile"
Write-Host "⏳ Registrazione per 45 secondi..."
Write-Host "👉 1. Apri l'app sul telefono ORA"
Write-Host "👉 2. Apri il pannello notifiche"
Write-Host "👉 3. Invia una notifica push (se puoi)"

# Avvia logcat in background
$job = Start-Job -ScriptBlock { 
    param($file, $adbPath) 
    & $adbPath logcat -v time *:V | Select-String "PushNotifications|Capacitor|Console|Firebase|fcm|userNotifications|error|exception|fail|chromium" > $file 
} -ArgumentList $logFile, $adb

# Attendi 45 secondi
Start-Sleep -Seconds 45

# Ferma il job
Stop-Job $job
Remove-Job $job

Write-Host "✅ Log salvati in $logFile"
if (Test-Path $logFile) {
    Get-Content $logFile -Tail 20
} else {
    Write-Host "⚠️ Il file di log non è stato creato. Verifica che il dispositivo sia connesso."
}
