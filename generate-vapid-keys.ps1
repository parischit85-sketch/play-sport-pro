# Script per generare le VAPID keys per Web Push Notifications

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔑 VAPID Keys Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Generazione delle VAPID keys in corso..." -ForegroundColor Yellow
Write-Host ""

# Esegui il comando per generare le chiavi
npx web-push generate-vapid-keys

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📝 PROSSIMI PASSI:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Copia la PUBLIC KEY e aggiornala in:" -ForegroundColor White
Write-Host "   src/utils/push.js" -ForegroundColor Yellow
Write-Host "   const VAPID_PUBLIC_KEY = 'TUA_PUBLIC_KEY_QUI'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Aggiungi le variabili d'ambiente su Netlify:" -ForegroundColor White
Write-Host "   VAPID_PUBLIC_KEY=..." -ForegroundColor Yellow
Write-Host "   VAPID_PRIVATE_KEY=..." -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Aggiorna l'email in netlify/functions/send-push.js:" -ForegroundColor White
Write-Host "   mailto:your-email@example.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Fai il deploy su Netlify" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  ATTENZIONE: Non committare mai la PRIVATE KEY!" -ForegroundColor Red
Write-Host "   Va inserita SOLO come variabile d'ambiente su Netlify" -ForegroundColor Red
Write-Host ""
Write-Host "Per maggiori dettagli, leggi: WEB_PUSH_IMPLEMENTATION.md" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
