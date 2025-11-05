# Script per applicare CORS a Firebase Storage
# Richiede Google Cloud SDK installato

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Applicazione CORS a Firebase Storage" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se gsutil è installato
if (!(Get-Command gsutil -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERRORE: Google Cloud SDK (gsutil) non trovato!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Per installarlo:" -ForegroundColor Yellow
    Write-Host "1. Vai a: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host "2. Scarica e installa Google Cloud SDK" -ForegroundColor Yellow
    Write-Host "3. Riavvia il terminale" -ForegroundColor Yellow
    Write-Host "4. Esegui: gcloud auth login" -ForegroundColor Yellow
    Write-Host "5. Ri-esegui questo script" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ALTERNATIVA VELOCE:" -ForegroundColor Cyan
    Write-Host "Usa Firebase Console (vedi CORS_SETUP_INSTRUCTIONS.md)" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ gsutil trovato!" -ForegroundColor Green
Write-Host ""

# Verifica se cors.json esiste
if (!(Test-Path "cors.json")) {
    Write-Host "❌ ERRORE: File cors.json non trovato!" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Contenuto cors.json:" -ForegroundColor Cyan
Get-Content cors.json | Write-Host
Write-Host ""

# Conferma
$confirmation = Read-Host "Applicare questa configurazione CORS al bucket Firebase Storage? (s/n)"
if ($confirmation -ne 's') {
    Write-Host "Operazione annullata." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Applicazione CORS in corso..." -ForegroundColor Cyan

try {
    gsutil cors set cors.json gs://m-padelweb.firebasestorage.app
    
    Write-Host ""
    Write-Host "✅ CORS applicato con successo!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prossimi passi:" -ForegroundColor Cyan
    Write-Host "1. Ricarica la pagina del browser (Ctrl+Shift+R)" -ForegroundColor White
    Write-Host "2. Prova a caricare un logo del torneo" -ForegroundColor White
    Write-Host "3. Gli errori CORS dovrebbero scomparire" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "❌ ERRORE durante l'applicazione del CORS:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Prova a:" -ForegroundColor Yellow
    Write-Host "1. Verificare di essere autenticato: gcloud auth login" -ForegroundColor White
    Write-Host "2. Impostare il progetto: gcloud config set project m-padelweb" -ForegroundColor White
    Write-Host "3. Oppure usa Firebase Console (vedi CORS_SETUP_INSTRUCTIONS.md)" -ForegroundColor White
    exit 1
}
