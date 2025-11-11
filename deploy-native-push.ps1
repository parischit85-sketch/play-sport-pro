# Deploy Native Push - Complete Deployment Script
# Verifica configurazione, builda frontend, deploya Cloud Functions e prepara Android

Write-Host "🚀 Native Push Deployment Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Android configuration
Write-Host "📋 Step 1/5: Checking Android configuration..." -ForegroundColor Yellow
node check-android-config.cjs
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Android configuration check failed." -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  REQUIRED ACTIONS:" -ForegroundColor Yellow
    Write-Host "   1. Review ANDROID_CONFIG_REQUIRED.md for detailed instructions" -ForegroundColor White
    Write-Host "   2. Download google-services.json from Firebase Console" -ForegroundColor White
    Write-Host "   3. Update AndroidManifest.xml with push permissions" -ForegroundColor White
    Write-Host "   4. Re-run this script after configuration complete" -ForegroundColor White
    Write-Host ""
    exit 1
}
Write-Host ""

# Step 2: Build frontend
Write-Host "🔨 Step 2/5: Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Check errors above." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy Cloud Functions
Write-Host "☁️  Step 3/5: Deploying Cloud Functions..." -ForegroundColor Yellow
Write-Host "Deploying sendBulkCertificateNotifications with FCM/APNs support..." -ForegroundColor Gray
Set-Location functions
firebase deploy --only functions:sendBulkCertificateNotifications
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cloud Functions deployment failed." -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ Cloud Functions deployed" -ForegroundColor Green
Write-Host ""

# Step 4: Sync Capacitor Android
Write-Host "📱 Step 4/5: Syncing Capacitor Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Android project synced" -ForegroundColor Green
Write-Host ""

# Step 5: Final instructions
Write-Host "📦 Step 5/5: Ready for Android Studio" -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next manual steps:" -ForegroundColor Yellow
Write-Host "  1. Open Android Studio: npx cap open android" -ForegroundColor White
Write-Host "  2. Build > Build Bundle(s) / APK(s) > Build APK(s)" -ForegroundColor White
Write-Host "  3. Install APK on physical device" -ForegroundColor White
Write-Host "  4. Follow testing checklist in TESTING_CHECKLIST_NATIVE_PUSH.md" -ForegroundColor White
Write-Host ""
Write-Host "Test Panel access:" -ForegroundColor Yellow
Write-Host "  Import NativePushTestPanel in your admin page to test notifications" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - QUICK_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "  - TESTING_CHECKLIST_NATIVE_PUSH.md" -ForegroundColor White
Write-Host "  - FASE_1_NATIVE_PUSH_COMPLETATA.md" -ForegroundColor White
Write-Host ""
