# Play Sport Pro - Development Helper Script
# Questo script risolve i problemi comuni di sviluppo

Write-Host "🏃‍♂️ Play Sport Pro - Development Helper" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Verifica se le dipendenze sono aggiornate
Write-Host "`n🔍 Checking dependencies..." -ForegroundColor Yellow

# Pulisce la cache di Vite se necessario
if (Test-Path "node_modules\.vite") {
    Write-Host "🧹 Cleaning Vite cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules\.vite"
}

# Pulisce la cache del browser (suggerimento)
Write-Host "`n💡 Quick fixes for development issues:" -ForegroundColor Cyan
Write-Host "   • For WebSocket errors: Clear browser cache (Ctrl+Shift+Del)" -ForegroundColor White
Write-Host "   • For HMR issues: Hard refresh (Ctrl+F5)" -ForegroundColor White
Write-Host "   • Install React DevTools: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi" -ForegroundColor White

# Avvia il server di sviluppo con configurazione ottimizzata
Write-Host "`n🚀 Starting development server..." -ForegroundColor Green
Write-Host "   Local:  http://localhost:5173/" -ForegroundColor White
Write-Host "   Network: Available with --host flag" -ForegroundColor White

# Avvia Vite con configurazione ottimizzata
npm run dev