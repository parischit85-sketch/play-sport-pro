# Clean Vite Cache and Restart Dev Server
# Fixes React duplicate instances and HMR issues

Write-Host "🧹 Cleaning Vite cache..." -ForegroundColor Yellow

# Stop any running Vite dev server
Write-Host "Stopping Vite dev server..." -ForegroundColor Gray
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*vite*"} | Stop-Process -Force

# Clean Vite cache
if (Test-Path "node_modules\.vite") {
    Write-Host "Removing node_modules\.vite..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "✅ Vite cache removed" -ForegroundColor Green
} else {
    Write-Host "⚪ No Vite cache found" -ForegroundColor Gray
}

# Clean dist folder
if (Test-Path "dist") {
    Write-Host "Removing dist..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Dist folder removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Cache cleaned successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start dev server: npm run dev" -ForegroundColor White
Write-Host "  2. Wait for Vite to pre-optimize dependencies" -ForegroundColor White
Write-Host "  3. Check browser console for errors" -ForegroundColor White
Write-Host ""
