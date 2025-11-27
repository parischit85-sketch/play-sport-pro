# Script per catturare log Android filtrati per Push e Errori
# Esegui questo script in PowerShell mentre il telefono è collegato

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "android-logs-$timestamp.txt"

Write-Host "📱 In attesa del dispositivo..."
adb wait-for-device

Write-Host "🧹 Pulizia log precedenti..."
adb logcat -c

Write-Host "🔴 Avvio cattura log su file: $logFile"
Write-Host "👉 1. Apri l'app sul telefono"
Write-Host "👉 2. Apri il pannello notifiche (per vedere se l'errore è sparito)"
Write-Host "👉 3. Invia una notifica push (se puoi)"
Write-Host "👉 4. Premi INVIO in questa finestra per terminare la cattura"

# Avvia logcat in background e redirigi su file
$job = Start-Job -ScriptBlock { 
    param($file) 
    adb logcat -v time *:V | Select-String "PushNotifications|Capacitor|Console|Firebase|fcm|userNotifications|error|exception|fail|chromium" > $file 
} -ArgumentList $logFile

# Attendi input utente
Read-Host "Premi INVIO per fermare la registrazione..."

# Ferma il job
Stop-Job $job
Remove-Job $job

Write-Host "✅ Log salvati in $logFile"
Write-Host "Analizzo il file..."
Get-Content $logFile -Tail 20

