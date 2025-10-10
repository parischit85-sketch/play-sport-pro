# =====================================================
# Script PowerShell per Configurazione Email Secrets
# =====================================================

Write-Host "`n🔐 Play-Sport Email Configuration Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Funzione per chiedere input sicuro
function Get-SecretInput {
    param (
        [string]$Prompt,
        [bool]$IsPassword = $false
    )
    
    if ($IsPassword) {
        $secureString = Read-Host -Prompt $Prompt -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
        return [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    } else {
        return Read-Host -Prompt $Prompt
    }
}

# Menu scelta servizio
Write-Host "Quale servizio email vuoi configurare?`n" -ForegroundColor Yellow
Write-Host "1) SendGrid (Produzione - Consigliato)" -ForegroundColor Green
Write-Host "2) Gmail/Nodemailer (Test/Sviluppo)" -ForegroundColor Green
Write-Host "3) Entrambi (Massima Affidabilità)" -ForegroundColor Green
Write-Host "4) Annulla`n" -ForegroundColor Red

$choice = Read-Host "Scelta"

switch ($choice) {
    "1" {
        Write-Host "`n📧 Configurazione SendGrid" -ForegroundColor Cyan
        Write-Host "===========================`n" -ForegroundColor Cyan
        
        Write-Host "📌 PRIMA DI CONTINUARE:" -ForegroundColor Yellow
        Write-Host "1. Crea account su https://sendgrid.com" -ForegroundColor White
        Write-Host "2. Vai su Settings > API Keys" -ForegroundColor White
        Write-Host "3. Crea nuova API Key con permessi 'Full Access'" -ForegroundColor White
        Write-Host "4. COPIA la API Key (mostra solo 1 volta!)`n" -ForegroundColor White
        
        $confirm = Read-Host "Hai l'API Key? (s/n)"
        
        if ($confirm -eq "s" -or $confirm -eq "S") {
            $apiKey = Get-SecretInput -Prompt "Incolla API Key SendGrid" -IsPassword $true
            
            Write-Host "`n🔄 Configurando SENDGRID_API_KEY..." -ForegroundColor Yellow
            $apiKey | firebase functions:secrets:set SENDGRID_API_KEY
            
            $fromEmail = Read-Host "`nEmail mittente (es. noreply@playsport.pro)"
            Write-Host "🔄 Configurando FROM_EMAIL..." -ForegroundColor Yellow
            $fromEmail | firebase functions:secrets:set FROM_EMAIL
            
            Write-Host "`n✅ SendGrid configurato con successo!" -ForegroundColor Green
            Write-Host "⚠️  IMPORTANTE: Verifica Single Sender o dominio su SendGrid!" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Configurazione annullata. Ottieni prima l'API Key." -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host "`n📧 Configurazione Gmail/Nodemailer" -ForegroundColor Cyan
        Write-Host "===================================`n" -ForegroundColor Cyan
        
        Write-Host "📌 PRIMA DI CONTINUARE:" -ForegroundColor Yellow
        Write-Host "1. Vai su https://myaccount.google.com/apppasswords" -ForegroundColor White
        Write-Host "2. Abilita Verifica in 2 passaggi (se richiesto)" -ForegroundColor White
        Write-Host "3. Genera App Password per 'Mail'" -ForegroundColor White
        Write-Host "4. COPIA la password (16 caratteri senza spazi)`n" -ForegroundColor White
        
        $confirm = Read-Host "Hai l'App Password? (s/n)"
        
        if ($confirm -eq "s" -or $confirm -eq "S") {
            $emailUser = Read-Host "`nEmail Gmail (es. tuaemail@gmail.com)"
            Write-Host "🔄 Configurando EMAIL_USER..." -ForegroundColor Yellow
            $emailUser | firebase functions:secrets:set EMAIL_USER
            
            $emailPassword = Get-SecretInput -Prompt "App Password Google (16 caratteri)" -IsPassword $true
            Write-Host "🔄 Configurando EMAIL_PASSWORD..." -ForegroundColor Yellow
            $emailPassword | firebase functions:secrets:set EMAIL_PASSWORD
            
            Write-Host "`n✅ Gmail/Nodemailer configurato con successo!" -ForegroundColor Green
            Write-Host "ℹ️  Le email verranno inviate da: $emailUser" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Configurazione annullata. Genera prima l'App Password." -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host "`n📧 Configurazione Completa (SendGrid + Gmail)" -ForegroundColor Cyan
        Write-Host "============================================`n" -ForegroundColor Cyan
        
        # SendGrid
        Write-Host "--- SENDGRID ---" -ForegroundColor Yellow
        $apiKey = Get-SecretInput -Prompt "API Key SendGrid" -IsPassword $true
        Write-Host "🔄 Configurando SENDGRID_API_KEY..." -ForegroundColor Yellow
        $apiKey | firebase functions:secrets:set SENDGRID_API_KEY
        
        # Gmail
        Write-Host "`n--- GMAIL (Fallback) ---" -ForegroundColor Yellow
        $emailUser = Read-Host "Email Gmail"
        Write-Host "🔄 Configurando EMAIL_USER..." -ForegroundColor Yellow
        $emailUser | firebase functions:secrets:set EMAIL_USER
        
        $emailPassword = Get-SecretInput -Prompt "App Password Google" -IsPassword $true
        Write-Host "🔄 Configurando EMAIL_PASSWORD..." -ForegroundColor Yellow
        $emailPassword | firebase functions:secrets:set EMAIL_PASSWORD
        
        # From Email
        $fromEmail = Read-Host "`nEmail mittente (es. noreply@playsport.pro)"
        Write-Host "🔄 Configurando FROM_EMAIL..." -ForegroundColor Yellow
        $fromEmail | firebase functions:secrets:set FROM_EMAIL
        
        Write-Host "`n✅ Configurazione completa!" -ForegroundColor Green
        Write-Host "📊 Strategia: SendGrid (priorità) → Gmail (fallback)" -ForegroundColor Cyan
    }
    
    "4" {
        Write-Host "`n❌ Configurazione annullata." -ForegroundColor Red
        exit
    }
    
    default {
        Write-Host "`n❌ Scelta non valida." -ForegroundColor Red
        exit
    }
}

# Verifica configurazione
Write-Host "`n🔍 Verifico secrets configurati..." -ForegroundColor Cyan

$secrets = @()
try {
    $sendgrid = firebase functions:secrets:access SENDGRID_API_KEY 2>&1
    if ($LASTEXITCODE -eq 0) { $secrets += "✅ SENDGRID_API_KEY" }
} catch {}

try {
    $emailUser = firebase functions:secrets:access EMAIL_USER 2>&1
    if ($LASTEXITCODE -eq 0) { $secrets += "✅ EMAIL_USER" }
} catch {}

try {
    $emailPass = firebase functions:secrets:access EMAIL_PASSWORD 2>&1
    if ($LASTEXITCODE -eq 0) { $secrets += "✅ EMAIL_PASSWORD" }
} catch {}

try {
    $fromEmail = firebase functions:secrets:access FROM_EMAIL 2>&1
    if ($LASTEXITCODE -eq 0) { $secrets += "✅ FROM_EMAIL" }
} catch {}

Write-Host "`n📋 Secrets configurati:" -ForegroundColor Yellow
foreach ($secret in $secrets) {
    Write-Host $secret -ForegroundColor Green
}

# Prossimi step
Write-Host "`n📝 PROSSIMI STEP:" -ForegroundColor Cyan
Write-Host "================`n" -ForegroundColor Cyan
Write-Host "1. Deploy function:" -ForegroundColor White
Write-Host "   firebase deploy --only functions:dailyCertificateCheck`n" -ForegroundColor Gray
Write-Host "2. Monitora logs:" -ForegroundColor White
Write-Host "   firebase functions:log --only dailyCertificateCheck`n" -ForegroundColor Gray
Write-Host "3. Test manuale (console Firebase):" -ForegroundColor White
Write-Host "   Functions > dailyCertificateCheck > Test function`n" -ForegroundColor Gray

$deploy = Read-Host "`nVuoi deployare la function ora? (s/n)"

if ($deploy -eq "s" -or $deploy -eq "S") {
    Write-Host "`n🚀 Deploying Cloud Function..." -ForegroundColor Yellow
    firebase deploy --only functions:dailyCertificateCheck
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Deploy completato con successo!" -ForegroundColor Green
        Write-Host "📅 La function si attiverà automaticamente ogni giorno alle 09:00" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Deploy fallito. Controlla gli errori sopra." -ForegroundColor Red
    }
} else {
    Write-Host "`nℹ️  Ricordati di deployare quando sei pronto!" -ForegroundColor Yellow
}

Write-Host "`n👋 Setup completato!`n" -ForegroundColor Green
