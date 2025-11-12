#!/usr/bin/env pwsh
# Script per configurare la nuova API key SendGrid in Firebase Functions
# Usage: .\configure-sendgrid.ps1

Write-Host "`n🔐 SendGrid API Key Configuration for Firebase Functions`n" -ForegroundColor Cyan

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI detected: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
Write-Host "`n🔍 Checking Firebase authentication..." -ForegroundColor Cyan
try {
    firebase projects:list 2>&1 | Out-Null
    Write-Host "✅ You are logged in to Firebase" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Firebase. Running firebase login..." -ForegroundColor Yellow
    firebase login
}

# Prompt for new API key
Write-Host "`n📝 Please enter your NEW SendGrid API key:" -ForegroundColor Cyan
Write-Host "   (Get it from: https://app.sendgrid.com/settings/api_keys)" -ForegroundColor Gray
Write-Host "   Format: SG.xxxxxxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy" -ForegroundColor Gray
$apiKey = Read-Host -Prompt "API Key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "`n❌ API key cannot be empty!" -ForegroundColor Red
    exit 1
}

if (-not $apiKey.StartsWith("SG.")) {
    Write-Host "`n⚠️  WARNING: API key doesn't start with 'SG.' - are you sure it's correct?" -ForegroundColor Yellow
    $confirm = Read-Host -Prompt "Continue anyway? (y/n)"
    if ($confirm -ne "y") {
        Write-Host "❌ Aborted" -ForegroundColor Red
        exit 1
    }
}

# Set the environment variable in Firebase
Write-Host "`n🚀 Setting SENDGRID_API_KEY in Firebase Functions..." -ForegroundColor Cyan
try {
    firebase functions:config:set sendgrid.api_key="$apiKey"
    Write-Host "✅ API key configured successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set Firebase config: $_" -ForegroundColor Red
    exit 1
}

# Verify the configuration
Write-Host "`n🔍 Verifying configuration..." -ForegroundColor Cyan
try {
    $config = firebase functions:config:get | ConvertFrom-Json
    if ($config.sendgrid.api_key) {
        $maskedKey = $config.sendgrid.api_key.Substring(0, 10) + "...[REDACTED]"
        Write-Host "✅ Configuration verified: $maskedKey" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Config set but verification failed (this may be normal)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not verify config (this may be normal)" -ForegroundColor Yellow
}

# Ask if user wants to deploy
Write-Host "`n📦 Do you want to deploy the functions now to apply the new key?" -ForegroundColor Cyan
Write-Host "   This will redeploy all Firebase Functions" -ForegroundColor Gray
$deploy = Read-Host -Prompt "Deploy now? (y/n)"

if ($deploy -eq "y") {
    Write-Host "`n🚀 Deploying Firebase Functions..." -ForegroundColor Cyan
    firebase deploy --only functions
    Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Remember to deploy later with:" -ForegroundColor Yellow
    Write-Host "   firebase deploy --only functions" -ForegroundColor Yellow
}

# Update local .env file
Write-Host "`n📝 Do you want to update your local .env file as well?" -ForegroundColor Cyan
$updateLocal = Read-Host -Prompt "Update .env? (y/n)"

if ($updateLocal -eq "y") {
    $envFile = ".env"
    
    if (Test-Path $envFile) {
        # Read existing .env
        $envContent = Get-Content $envFile -Raw
        
        # Update or add SENDGRID_API_KEY
        if ($envContent -match "SENDGRID_API_KEY=.*") {
            $envContent = $envContent -replace "SENDGRID_API_KEY=.*", "SENDGRID_API_KEY=$apiKey"
            Write-Host "✅ Updated existing SENDGRID_API_KEY in .env" -ForegroundColor Green
        } else {
            $envContent += "`nSENDGRID_API_KEY=$apiKey`n"
            Write-Host "✅ Added SENDGRID_API_KEY to .env" -ForegroundColor Green
        }
        
        Set-Content -Path $envFile -Value $envContent
    } else {
        # Create new .env file
        "SENDGRID_API_KEY=$apiKey" | Out-File -FilePath $envFile -Encoding UTF8
        Write-Host "✅ Created .env file with SENDGRID_API_KEY" -ForegroundColor Green
    }
    
    Write-Host "⚠️  Remember: .env file should be in .gitignore!" -ForegroundColor Yellow
}

Write-Host "`n✅ All done! Your SendGrid API key is now configured.`n" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test sending an email to verify the key works" -ForegroundColor White
Write-Host "2. Monitor SendGrid dashboard for email activity" -ForegroundColor White
Write-Host "3. Never commit API keys to Git!" -ForegroundColor Yellow
Write-Host ""
