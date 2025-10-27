#!/usr/bin/env pwsh
# Istruzioni per scaricare le credenziali Firebase

Write-Host ""
Write-Host "🔥 COME SCARICARE LE CREDENZIALI FIREBASE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Apri il browser e vai su:" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com" -ForegroundColor Blue
Write-Host ""

Write-Host "2. Seleziona il progetto PlaySport" -ForegroundColor Yellow
Write-Host ""

Write-Host "3. Clicca sull'icona dell'ingranaggio ⚙️ in alto a sinistra" -ForegroundColor Yellow
Write-Host "   e seleziona 'Project Settings'" -ForegroundColor Yellow
Write-Host ""

Write-Host "4. Vai sulla tab 'Service Accounts'" -ForegroundColor Yellow
Write-Host ""

Write-Host "5. Scorri in basso e clicca il pulsante:" -ForegroundColor Yellow
Write-Host "   'Generate new private key'" -ForegroundColor Green
Write-Host ""

Write-Host "6. Conferma cliccando 'Generate key'" -ForegroundColor Yellow
Write-Host ""

Write-Host "7. Verrà scaricato un file JSON" -ForegroundColor Yellow
Write-Host "   Salvalo in questa cartella con un nome tipo:" -ForegroundColor Yellow
Write-Host "   'firebase-admin-key.json'" -ForegroundColor Green
Write-Host ""

Write-Host "8. Torna qui e premi INVIO quando hai salvato il file" -ForegroundColor Yellow
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Attendi che l'utente scarichi il file
$null = Read-Host "Premi INVIO quando hai scaricato e salvato il file JSON"

Write-Host ""
Write-Host "✅ Ottimo! Ora cerco il file JSON..." -ForegroundColor Green
Write-Host ""

# Cerca file JSON nella cartella corrente
$jsonFiles = Get-ChildItem -Path . -Filter "*.json" | Where-Object { 
    $_.Name -like "*firebase*" -or 
    $_.Name -like "*admin*" -or 
    $_.Name -like "*service*" -or
    $_.Name -like "*key*"
}

if ($jsonFiles.Count -eq 0) {
    Write-Host "❌ Nessun file JSON trovato!" -ForegroundColor Red
    Write-Host "   Assicurati di aver salvato il file in questa cartella:" -ForegroundColor Yellow
    Write-Host "   $PWD" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Poi riesegui questo script." -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 File JSON trovati:" -ForegroundColor Cyan
$jsonFiles | ForEach-Object { Write-Host "   - $($_.Name)" -ForegroundColor Gray }
Write-Host ""

if ($jsonFiles.Count -eq 1) {
    $selectedFile = $jsonFiles[0].FullName
    Write-Host "✅ Userò: $($jsonFiles[0].Name)" -ForegroundColor Green
} else {
    Write-Host "Quale file vuoi usare?" -ForegroundColor Yellow
    for ($i = 0; $i -lt $jsonFiles.Count; $i++) {
        Write-Host "   $($i + 1)) $($jsonFiles[$i].Name)" -ForegroundColor Gray
    }
    Write-Host ""
    
    $choice = Read-Host "Seleziona il numero"
    $selectedFile = $jsonFiles[[int]$choice - 1].FullName
    Write-Host "✅ Userò: $($jsonFiles[[int]$choice - 1].Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Ora configurerò automaticamente Netlify..." -ForegroundColor Cyan
Write-Host ""

# Esegui lo script di setup passando il file
& "$PSScriptRoot\setup-netlify-env.ps1" -FirebaseJsonPath $selectedFile
