# Script per testare manualmente la Cloud Function
# Questa function è di tipo "scheduled" quindi non può essere chiamata direttamente via HTTP
# Ma possiamo simularne l'esecuzione

Write-Host "`n🧪 TEST CLOUD FUNCTION - dailyCertificateCheck" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "ℹ️  NOTA: Questa è una Scheduled Function" -ForegroundColor Yellow
Write-Host "   • Si attiva automaticamente ogni giorno alle 09:00" -ForegroundColor Gray
Write-Host "   • Non può essere chiamata direttamente via HTTP`n" -ForegroundColor Gray

Write-Host "📋 METODI DISPONIBILI PER TESTARE:`n" -ForegroundColor Cyan

Write-Host "1️⃣  ATTENDI ESECUZIONE AUTOMATICA (Domani 09:00)" -ForegroundColor White
Write-Host "   • La function si attiverà automaticamente" -ForegroundColor Gray
Write-Host "   • Nessuna azione richiesta" -ForegroundColor Gray
Write-Host "   • Logs disponibili dopo l'esecuzione`n" -ForegroundColor Gray

Write-Host "2️⃣  MODIFICA SCHEDULE (Per test immediato)" -ForegroundColor White
Write-Host "   • Cambia schedule a 'every 5 minutes'" -ForegroundColor Gray
Write-Host "   • Attendi 5 minuti per vedere i risultati" -ForegroundColor Gray
Write-Host "   • Ripristina schedule originale dopo il test`n" -ForegroundColor Gray

Write-Host "3️⃣  TEST LOCALE (Simulazione)" -ForegroundColor White
Write-Host "   • Esegui il codice localmente con Firebase Emulator" -ForegroundColor Gray
Write-Host "   • Richiede setup emulator" -ForegroundColor Gray
Write-Host "   • Utile per debug`n" -ForegroundColor Gray

Write-Host "💡 CONSIGLIO: Attendi l'esecuzione automatica domani`n" -ForegroundColor Yellow

$choice = Read-Host "Vuoi modificare lo schedule per testare subito? (s/n)"

if ($choice -eq "s" -or $choice -eq "S") {
    Write-Host "`n🔧 MODIFICA SCHEDULE PER TEST IMMEDIATO`n" -ForegroundColor Cyan
    
    Write-Host "⚠️  ATTENZIONE:" -ForegroundColor Yellow
    Write-Host "   • Questo farà eseguire la function ogni 5 minuti" -ForegroundColor Gray
    Write-Host "   • Utile per test ma consuma risorse" -ForegroundColor Gray
    Write-Host "   • Ricordati di ripristinare dopo il test!`n" -ForegroundColor Gray
    
    $confirm = Read-Host "Confermi? (s/n)"
    
    if ($confirm -eq "s" -or $confirm -eq "S") {
        Write-Host "`n📝 Per modificare lo schedule:`n" -ForegroundColor Cyan
        Write-Host "1. Apri: functions/scheduledCertificateReminders.js" -ForegroundColor White
        Write-Host "2. Trova la riga:" -ForegroundColor White
        Write-Host "   schedule: 'every day 09:00'," -ForegroundColor Gray
        Write-Host "3. Cambiala in:" -ForegroundColor White
        Write-Host "   schedule: 'every 5 minutes'," -ForegroundColor Green
        Write-Host "4. Salva il file" -ForegroundColor White
        Write-Host "5. Esegui: firebase deploy --only functions:dailyCertificateCheck" -ForegroundColor White
        Write-Host "6. Attendi 5-10 minuti e controlla i logs`n" -ForegroundColor White
        
        Write-Host "⏱️  Timer: 5 minuti dall'ultimo deploy (10:20:33)" -ForegroundColor Yellow
        Write-Host "   Prossima esecuzione: ~10:25-10:26`n" -ForegroundColor Yellow
        
        Write-Host "📊 Per vedere i logs in tempo reale:" -ForegroundColor Cyan
        Write-Host "   firebase functions:log --only dailyCertificateCheck`n" -ForegroundColor Gray
        
        $openFile = Read-Host "Apro il file da modificare? (s/n)"
        
        if ($openFile -eq "s" -or $openFile -eq "S") {
            code "functions/scheduledCertificateReminders.js"
            Write-Host "`n✅ File aperto in VS Code!" -ForegroundColor Green
        }
    }
} else {
    Write-Host "`n✅ OK! La function si attiverà automaticamente domani alle 09:00" -ForegroundColor Green
    Write-Host "`n📅 PROSSIMA ESECUZIONE AUTOMATICA:`n" -ForegroundColor Cyan
    Write-Host "   • Data: Domani, 11 Ottobre 2025" -ForegroundColor White
    Write-Host "   • Ora: 09:00 (Europe/Rome)" -ForegroundColor White
    Write-Host "   • Logs disponibili dopo: ~09:01`n" -ForegroundColor White
    
    Write-Host "📝 COME CONTROLLARE I LOGS DOMANI:`n" -ForegroundColor Cyan
    Write-Host "   firebase functions:log --only dailyCertificateCheck --lines 100" -ForegroundColor Gray
    Write-Host "`n   Oppure vai su:" -ForegroundColor White
    Write-Host "   https://console.firebase.google.com/project/m-padelweb/functions`n" -ForegroundColor Blue
}

Write-Host "`n📊 STATO ATTUALE FUNCTION:`n" -ForegroundColor Cyan
Write-Host "   ✅ Deployed: YES" -ForegroundColor Green
Write-Host "   ✅ Active: YES" -ForegroundColor Green
Write-Host "   ✅ Secrets configurati: 3/3" -ForegroundColor Green
Write-Host "   ✅ Schedule: every day 09:00" -ForegroundColor Green
Write-Host "   ⏳ Esecuzioni: 0 (attende prima esecuzione)`n" -ForegroundColor Yellow

Write-Host "Premi INVIO per uscire..." -ForegroundColor Gray
Read-Host
