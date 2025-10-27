# Script per convertire la chiave Firebase nel formato corretto per Netlify
# Usage: .\convert-firebase-key.ps1 path\to\your-firebase-service-account.json

param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceAccountPath
)

Write-Host "🔑 Converting Firebase Service Account Key..." -ForegroundColor Cyan

if (-not (Test-Path $ServiceAccountPath)) {
    Write-Host "❌ File not found: $ServiceAccountPath" -ForegroundColor Red
    exit 1
}

try {
    # Leggi il file JSON
    $json = Get-Content $ServiceAccountPath -Raw | ConvertFrom-Json
    
    # Estrai i valori
    $projectId = $json.project_id
    $clientEmail = $json.client_email
    $privateKey = $json.private_key
    
    Write-Host "`n✅ Chiave convertita con successo!`n" -ForegroundColor Green
    
    Write-Host "📋 Copia e incolla questi valori in Netlify Environment Variables:`n" -ForegroundColor Yellow
    
    Write-Host "FIREBASE_PROJECT_ID" -ForegroundColor White
    Write-Host $projectId -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "FIREBASE_CLIENT_EMAIL" -ForegroundColor White
    Write-Host $clientEmail -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "FIREBASE_PRIVATE_KEY" -ForegroundColor White
    Write-Host $privateKey -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "⚠️  IMPORTANTE: La FIREBASE_PRIVATE_KEY contiene \n letterali!" -ForegroundColor Yellow
    Write-Host "   Copia TUTTO il testo sopra (inclusi i \n) in una SOLA riga." -ForegroundColor Yellow
    
    # Salva in un file di testo per facilitare il copia-incolla
    $outputFile = "firebase-env-vars.txt"
    @"
FIREBASE_PROJECT_ID
$projectId

FIREBASE_CLIENT_EMAIL
$clientEmail

FIREBASE_PRIVATE_KEY
$privateKey
"@ | Out-File -FilePath $outputFile -Encoding UTF8
    
    Write-Host "`n💾 Valori salvati anche in: $outputFile" -ForegroundColor Green
    Write-Host "   Puoi aprirlo e copiare da lì se preferisci.`n" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Errore nella conversione: $_" -ForegroundColor Red
    exit 1
}
