@echo off
setlocal enableextensions enabledelayedexpansion

rem ==============================================
rem  Play Sport Pro - Backup Rapido v3.0
rem  Per backup frequenti durante lo sviluppo
rem  Aggiornato: 11 Settembre 2025
rem ==============================================

set "SRC=%~dp0"
set "QUICK_BACKUP=%USERPROFILE%\Documents\PlaySport-QuickBackups-2025"

for /f "usebackq delims=" %%i in (`powershell -NoLogo -NoProfile -Command "[DateTime]::Now.ToString('yyyyMMdd_HHmm')"`) do set "TS=%%i"

echo.
echo ================================================================
echo   ⚡ PLAY SPORT PRO - BACKUP RAPIDO v3.0 ⚡
echo ================================================================
echo.
echo 🎯 Backup ottimizzato per sviluppatori
echo 📂 Solo codice sorgente essenziale (src/ + config)
echo ⏱️  Veloce: ~30 secondi
echo 💾 Leggero: ~1-2 MB
echo 🔄 Auto-cleanup: mantiene solo ultimi 20 backup
echo.
echo 📋 Cosa viene incluso:
echo    ✅ src/ (tutto il codice React)
echo    ✅ public/ (assets PWA)
echo    ✅ Configurazioni principali
echo    ✅ Documentazione essenziale
echo.
echo 🚫 Cosa viene escluso:
echo    ❌ node_modules (dipendenze)
echo    ❌ dist (build output)
echo    ❌ .git (repository)
echo    ❌ logs e cache
echo.
echo ================================================================
echo.

if not exist "%QUICK_BACKUP%" (
    echo 📁 Creazione cartella backup rapidi...
    mkdir "%QUICK_BACKUP%" >nul 2>&1
)

set "DEST=%QUICK_BACKUP%\playsport-quick-%TS%"
echo 🚀 Creazione backup rapido: playsport-quick-%TS%
echo.

mkdir "%DEST%" >nul 2>&1

rem Copia cartelle essenziali con robocopy per velocità
echo 📂 Copiando src/ ...
if exist "%SRC%src" (
    robocopy "%SRC%src" "%DEST%\src" /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP >nul
    if !errorlevel! lss 8 (
        echo    ✅ src/ copiata con successo
    ) else (
        echo    ⚠️ src/ copiata con alcuni avvisi
    )
) else (
    echo    ❌ Cartella src/ non trovata!
)

echo 📂 Copiando public/ ...
if exist "%SRC%public" (
    robocopy "%SRC%public" "%DEST%\public" /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP >nul
    if !errorlevel! lss 8 (
        echo    ✅ public/ copiata con successo
    ) else (
        echo    ⚠️ public/ copiata con alcuni avvisi
    )
) else (
    echo    ❌ Cartella public/ non trovata!
)

rem Copia file di configurazione principali
echo 📄 Copiando configurazioni...
set "CONFIG_FILES=package.json vite.config.js tailwind.config.js firebase.json firestore.rules index.html README.md .env.example .firebaserc netlify.toml capacitor.config.ts tsconfig.json postcss.config.js"

set CONFIG_COUNT=0
for %%f in (%CONFIG_FILES%) do (
    if exist "%SRC%%%f" (
        copy "%SRC%%%f" "%DEST%\" >nul 2>&1
        if !errorlevel! equ 0 (
            set /a CONFIG_COUNT+=1
        )
    )
)
echo    ✅ %CONFIG_COUNT% file di configurazione copiati

rem Copia documentazione importante
echo 📚 Copiando documentazione...
set DOC_COUNT=0
for %%f in ("%SRC%*.md") do (
    if exist "%%f" (
        copy "%%f" "%DEST%\" >nul 2>&1
        if !errorlevel! equ 0 (
            set /a DOC_COUNT+=1
        )
    )
)
echo    ✅ %DOC_COUNT% file di documentazione copiati

rem Copia script di utilità
echo 🔧 Copiando script di utilità...
set SCRIPT_COUNT=0
for %%f in ("%SRC%*.ps1" "%SRC%*.cmd") do (
    if exist "%%f" (
        copy "%%f" "%DEST%\" >nul 2>&1
        if !errorlevel! equ 0 (
            set /a SCRIPT_COUNT+=1
        )
    )
)
echo    ✅ %SCRIPT_COUNT% script copiati

rem Crea file di info backup
echo 📋 Creazione file info backup...
(
echo ================================================================
echo PLAY SPORT PRO - BACKUP RAPIDO
echo ================================================================
echo.
echo Data backup: %date% %time%
echo Tipo: Quick backup (sviluppo)
echo Versione: 1.0.1
echo Sistema: %COMPUTERNAME% (%USERNAME%^)
echo.
echo CONTENUTO:
echo - Codice sorgente completo (src/^)
echo - Assets PWA (public/^)
echo - Configurazioni principali
echo - Documentazione essenziale
echo - Script di utilità
echo.
echo UTILIZZO:
echo 1. Estrai il backup in una nuova cartella
echo 2. Esegui: npm install
echo 3. Esegui: npm run dev
echo.
echo Per backup completi usa: backup-system-2025.cmd
echo ================================================================
) > "%DEST%\QUICK_BACKUP_INFO.txt"

rem Calcola statistiche
set TOTAL_FILES=0
for /f %%i in ('dir "%DEST%" /s /b 2^>nul ^| find /c ":"') do set TOTAL_FILES=%%i

rem Calcola dimensione (approssimata)
set TOTAL_SIZE=0
for /f "tokens=3" %%i in ('dir "%DEST%" /s /-c 2^>nul ^| findstr /C:"bytes"') do set TOTAL_SIZE=%%i

rem Pulizia backup vecchi (mantieni solo ultimi 20)
echo 🧹 Pulizia backup vecchi...
set DELETE_COUNT=0
for /f "skip=20 delims=" %%d in ('dir "%QUICK_BACKUP%\playsport-quick-*" /b /ad /o-d 2^>nul') do (
    if exist "%QUICK_BACKUP%\%%d" (
        rd /s /q "%QUICK_BACKUP%\%%d" >nul 2>&1
        if !errorlevel! equ 0 (
            set /a DELETE_COUNT+=1
        )
    )
)
if %DELETE_COUNT% gtr 0 (
    echo    🗑️ Rimossi %DELETE_COUNT% backup obsoleti
) else (
    echo    ✅ Nessun backup obsoleto da rimuovere
)

echo.
echo ================================================================
echo   🎉 BACKUP RAPIDO COMPLETATO! 🎉
echo ================================================================
echo.
echo 📊 Statistiche:
echo    📄 File totali: %TOTAL_FILES%
echo    📂 Percorso: %DEST%
echo    ⏱️ Tempo: ~30 secondi
echo.
echo 🔄 Backup automatici disponibili:
echo    📁 Quick backups: %QUICK_BACKUP%
echo    📁 Backup completi: %USERPROFILE%\Downloads\backup-play-sport-pro-2025
echo.
echo 💡 Suggerimenti:
echo    - Usa questo script per backup frequenti durante sviluppo
echo    - Per backup completi prima di deploy usa: backup-system-2025.cmd
echo    - I backup rapidi sono perfetti per esperimenti e test
echo.
echo 🚀 Apertura cartella backup...
start "" "%QUICK_BACKUP%"

echo.
echo ✨ Backup rapido Play Sport Pro v3.0 completato con successo!
echo.
pause
endlocal
exit /b 0