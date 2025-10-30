@echo off
REM =============================================
REM BACKUP PLAY SPORT PRO - Desktop Launcher
REM Script batch per avviare il backup interattivo
REM Versione: 2.0.0
REM =============================================

title Backup Play Sport Pro - Desktop Edition

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    BACKUP PLAY SPORT PRO                     ║
echo ║                     Desktop Edition                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔧 Avvio script backup interattivo...
echo.

REM Verifica che PowerShell sia disponibile
powershell -Command "Write-Host '✅ PowerShell disponibile'" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRORE: PowerShell non disponibile su questo sistema
    echo.
    echo 💡 Assicurati di avere Windows PowerShell installato
    pause
    exit /b 1
)

REM Esegui script PowerShell
powershell -ExecutionPolicy Bypass -File "%~dp0Backup-PlaySport-Interactive.ps1"

echo.
echo 👋 Arrivederci!
timeout /t 3 >nul