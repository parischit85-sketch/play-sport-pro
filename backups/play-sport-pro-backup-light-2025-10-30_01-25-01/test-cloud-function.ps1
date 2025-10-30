# =====================================================
# Script PowerShell - Test Cloud Function Manualmente
# =====================================================

Write-Host "`n🧪 TEST CLOUD FUNCTION - dailyCertificateCheck" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Apri console Firebase
Write-Host "📱 Apertura Console Firebase..." -ForegroundColor Yellow
Start-Process "https://console.firebase.google.com/project/m-padelweb/functions"
Start-Sleep -Seconds 2

Write-Host "`n✅ Console Firebase aperta!`n" -ForegroundColor Green

Write-Host "📋 PASSI PER TESTARE LA FUNCTION:`n" -ForegroundColor Cyan

Write-Host "1️⃣  Trova 'dailyCertificateCheck' nella lista Functions" -ForegroundColor White
Write-Host "2️⃣  Clicca sui 3 puntini (•••) a destra della function" -ForegroundColor White
Write-Host "3️⃣  Seleziona 'Test function' dal menu" -ForegroundColor White
Write-Host "4️⃣  Clicca il pulsante 'Run test' (non servono parametri)" -ForegroundColor White
Write-Host "5️⃣  Attendi 10-30 secondi per l'esecuzione`n" -ForegroundColor White

Write-Host "📊 LOGS DA VERIFICARE:`n" -ForegroundColor Cyan

Write-Host "  ✅ SUCCESS - Function eseguita correttamente:" -ForegroundColor Green
Write-Host "     • '🏥 [Certificate Check] Starting...'" -ForegroundColor Gray
Write-Host "     • '✅ [Certificate Check] Completed successfully'" -ForegroundColor Gray
Write-Host "     • '📊 [Stats] Clubs: X, Players: Y, Emails: Z'`n" -ForegroundColor Gray

Write-Host "  📧 EMAIL - Se ci sono certificati in scadenza:" -ForegroundColor Yellow
Write-Host "     • '✅ [Nodemailer] Email sent to: player@example.com'" -ForegroundColor Gray
Write-Host "     • '📧 [Email Preview] To: ...' (se in test)`n" -ForegroundColor Gray

Write-Host "  ℹ️  INFO - Situazioni normali:" -ForegroundColor Cyan
Write-Host "     • 'No players to notify' - Nessun certificato da rinnovare" -ForegroundColor Gray
Write-Host "     • 'emailsSent: 0' - Nessuna email inviata (normale)`n" -ForegroundColor Gray

Write-Host "  ⚠️  WARNING - Da controllare:" -ForegroundColor Yellow
Write-Host "     • '⚠️ [Email] No email service configured' - Secrets non trovati" -ForegroundColor Gray
Write-Host "     • 'Secret ... not found' - Secret mancante`n" -ForegroundColor Gray

Write-Host "  ❌ ERROR - Problemi:" -ForegroundColor Red
Write-Host "     • '❌ [Certificate Check] Fatal error' - Errore critico" -ForegroundColor Gray
Write-Host "     • '❌ [Nodemailer] Error: ...' - Problema invio email`n" -ForegroundColor Gray

Write-Host "`n🔍 VERIFICA SECRETS (se ci sono errori):`n" -ForegroundColor Cyan
Write-Host "Se vedi errori sui secrets, verifica che siano configurati:" -ForegroundColor White
Write-Host "  firebase functions:secrets:access EMAIL_USER" -ForegroundColor Gray
Write-Host "  firebase functions:secrets:access EMAIL_PASSWORD" -ForegroundColor Gray
Write-Host "  firebase functions:secrets:access FROM_EMAIL`n" -ForegroundColor Gray

Write-Host "📧 VERIFICA EMAIL (se inviate):`n" -ForegroundColor Cyan
Write-Host "Controlla la inbox dei giocatori per email da:" -ForegroundColor White
Write-Host "  FROM: noreplay@play-sport.pro" -ForegroundColor Gray
Write-Host "  SUBJECT: [URGENTE] Certificato Medico in Scadenza`n" -ForegroundColor Gray

Write-Host "💡 TROUBLESHOOTING:`n" -ForegroundColor Yellow

Write-Host "Problema: 'No email service configured'" -ForegroundColor White
Write-Host "Soluzione: Ri-configura secrets:" -ForegroundColor Gray
Write-Host "  firebase functions:secrets:set EMAIL_USER" -ForegroundColor DarkGray
Write-Host "  firebase functions:secrets:set EMAIL_PASSWORD" -ForegroundColor DarkGray
Write-Host "  firebase deploy --only functions:dailyCertificateCheck`n" -ForegroundColor DarkGray

Write-Host "Problema: Email finite in spam" -ForegroundColor White
Write-Host "Soluzione:" -ForegroundColor Gray
Write-Host "  • Aggiungi 'noreplay@play-sport.pro' a whitelist" -ForegroundColor DarkGray
Write-Host "  • Marca email come 'Non spam'" -ForegroundColor DarkGray
Write-Host "  • Per produzione, configura SendGrid con dominio verificato`n" -ForegroundColor DarkGray

Write-Host "Problema: Function timeout" -ForegroundColor White
Write-Host "Soluzione: Normale se ci sono molti giocatori (max 540s)" -ForegroundColor Gray
Write-Host "  • Controlla logs per vedere dove si blocca" -ForegroundColor DarkGray
Write-Host "  • Considera di aumentare memoria se necessario`n" -ForegroundColor DarkGray

Write-Host "`n📚 DOCUMENTAZIONE:`n" -ForegroundColor Cyan
Write-Host "  • Setup Gmail: GMAIL_SETUP_INSTRUCTIONS.md" -ForegroundColor White
Write-Host "  • Deploy Guide: CLOUD_FUNCTIONS_EMAIL_SETUP.md" -ForegroundColor White
Write-Host "  • Email Config: EMAIL_SERVICE_CONFIGURATION.md" -ForegroundColor White
Write-Host "  • Sprint Summary: SPRINT_3_EMAIL_INTEGRATION.md`n" -ForegroundColor White

Write-Host "🎯 PROSSIMI STEP DOPO IL TEST:`n" -ForegroundColor Green

Write-Host "1. Se test OK:" -ForegroundColor White
Write-Host "   ✅ La function è operativa" -ForegroundColor Gray
Write-Host "   ✅ Si attiverà automaticamente ogni giorno alle 09:00" -ForegroundColor Gray
Write-Host "   ✅ Monitora logs nei prossimi giorni`n" -ForegroundColor Gray

Write-Host "2. Se test FAIL:" -ForegroundColor White
Write-Host "   ⚠️  Controlla errori nei logs" -ForegroundColor Gray
Write-Host "   ⚠️  Verifica secrets configurati" -ForegroundColor Gray
Write-Host "   ⚠️  Re-deploy se necessario`n" -ForegroundColor Gray

Write-Host "3. Per produzione:" -ForegroundColor White
Write-Host "   📧 Configura SendGrid (100 email/giorno gratis)" -ForegroundColor Gray
Write-Host "   🌐 Verifica dominio per evitare spam" -ForegroundColor Gray
Write-Host "   📊 Monitora analytics SendGrid`n" -ForegroundColor Gray

Write-Host "`n✨ Buon test! ✨`n" -ForegroundColor Magenta

$response = Read-Host "Hai eseguito il test? (s/n)"

if ($response -eq "s" -or $response -eq "S") {
    Write-Host "`n📊 Vuoi vedere le statistiche della function?" -ForegroundColor Cyan
    $stats = Read-Host "Apri statistiche Firebase? (s/n)"
    
    if ($stats -eq "s" -or $stats -eq "S") {
        Start-Process "https://console.firebase.google.com/project/m-padelweb/functions/logs?search=dailyCertificateCheck&severity=DEBUG"
        Write-Host "`n✅ Logs aperti nel browser!" -ForegroundColor Green
    }
    
    Write-Host "`n✅ Test completato!" -ForegroundColor Green
    Write-Host "`n🎉 SPRINT 3 COMPLETATO CON SUCCESSO! 🎉`n" -ForegroundColor Magenta
} else {
    Write-Host "`nℹ️  Puoi testare in qualsiasi momento dalla Console Firebase" -ForegroundColor Cyan
    Write-Host "   https://console.firebase.google.com/project/m-padelweb/functions`n" -ForegroundColor Blue
}

Write-Host "Premi INVIO per uscire..." -ForegroundColor Gray
Read-Host
