@echo off
setlocal enableextensions enabledelayedexpansion

rem ==============================================
rem  Play Sport Pro - Sistema di Backup v3.0
rem  Aggiornato: 11 Settembre 2025
rem  Progetto: Sistema unificato prenotazioni
rem ==============================================

rem Directory sorgente = cartella di questo script
set "SRC=%~dp0"
set "DEST_ROOT=%USERPROFILE%\Downloads\backup-play-sport-pro-2025"

for /f "usebackq delims=" %%i in (`powershell -NoLogo -NoProfile -Command "[DateTime]::Now.ToString('yyyyMMdd_HHmmss')"`) do set "TS=%%i"

echo.
echo ================================================================
echo.
echo   🎾 PLAY SPORT PRO - BACKUP SYSTEM v3.0 🎾
echo.
echo ================================================================
echo.
echo 📋 Informazioni progetto:
echo    Versione: 1.0.1 (React 18.3.1 + Vite 7.1.4 + Firebase)
echo    Sistema: Prenotazioni unificate campi + lezioni
echo    Features: Drag^&Drop, PWA, Android, Real-time sync
echo.
echo 🔧 Architettura:
echo    Frontend: React + Tailwind CSS + React Query
echo    Backend: Firebase (Firestore + Auth + Hosting)
echo    Mobile: Capacitor 7.4.3 (Android ready)
echo    Deploy: Netlify + Firebase automatico
echo.
echo ================================================================
echo.
echo 📦 OPZIONI DI BACKUP DISPONIBILI:
echo.
echo   1^) 🪶 BACKUP LIGHT      (codice + config, no dipendenze)
echo      Ideale per: backup quotidiani, condivisione codice
echo      Include: src/, config files, documentazione
echo      Esclude: node_modules, dist, .git
echo      Dimensioni: ~1-2 MB
echo.
echo   2^) 🚀 BACKUP DEPLOY     (solo file per deployment)
echo      Ideale per: backup pre-deploy, emergency restore
echo      Include: dist/, config deploy, PWA assets
echo      Dimensioni: ~5-10 MB
echo.
echo   3^) ⚙️ BACKUP CONFIG     (solo configurazioni ^+ docs)
echo      Ideale per: backup configurazioni, setup reference
echo      Include: *.json, *.js config, *.md docs
echo      Dimensioni: ~500 KB
echo.
echo   4^) 💯 BACKUP COMPLETO   (tutto incluso - PESANTE!)
echo      Ideale per: backup completo sistema, migrazione
echo      Include: TUTTO (node_modules, .git, dist)
echo      Dimensioni: ~200-500 MB
echo.
echo   5^) ❓ INFO SISTEMA      (mostra info progetto)
echo.
echo   0^) 🚪 ESCI
echo.
echo ================================================================
echo.
set /p CHOICE=Seleziona opzione [0-5] (default 1): 
if "%CHOICE%"=="" set CHOICE=1

if "%CHOICE%"=="0" goto EXIT
if "%CHOICE%"=="1" goto LIGHT
if "%CHOICE%"=="2" goto DEPLOY
if "%CHOICE%"=="3" goto CONFIG
if "%CHOICE%"=="4" goto FULL
if "%CHOICE%"=="5" goto INFO

echo ❌ Opzione non valida. Riprova.
pause
goto :eof

:LIGHT
echo.
echo ================================================================
echo   🪶 BACKUP LIGHT - CODICE SORGENTE + CONFIGURAZIONI
echo ================================================================
echo.
echo 📂 Cosa verrà incluso:
echo    ✅ Cartella src/ completa (codice React)
echo    ✅ File configurazione (package.json, vite.config.js, etc.)
echo    ✅ Documentazione completa (*.md)
echo    ✅ Script di utilità (*.ps1, *.cmd)
echo    ✅ Configurazioni Firebase/Netlify
echo    ✅ Setup Android/PWA
echo.
echo 🚫 Cosa verrà escluso:
echo    ❌ node_modules (dipendenze npm)
echo    ❌ dist (build output)
echo    ❌ .git (repository)
echo    ❌ cache e file temporanei
echo.
if not exist "%DEST_ROOT%" mkdir "%DEST_ROOT%" >nul 2>&1
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup-enhanced-2025.ps1" -Type "light" -DestinationRoot "%DEST_ROOT%"
goto END

:DEPLOY
echo.
echo ================================================================
echo   🚀 BACKUP DEPLOY - FILE PER DEPLOYMENT
echo ================================================================
echo.
echo 📂 Cosa verrà incluso:
echo    ✅ Cartella dist/ (build ottimizzato)
echo    ✅ Configurazioni deployment
echo    ✅ PWA assets (public/, manifest, etc.)
echo    ✅ Firebase configuration
echo    ✅ Android configuration
echo    ✅ Netlify configuration
echo.
if not exist "%DEST_ROOT%" mkdir "%DEST_ROOT%" >nul 2>&1
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup-enhanced-2025.ps1" -Type "deploy" -DestinationRoot "%DEST_ROOT%"
goto END

:CONFIG
echo.
echo ================================================================
echo   ⚙️ BACKUP CONFIG - SOLO CONFIGURAZIONI
echo ================================================================
echo.
echo 📂 Cosa verrà incluso:
echo    ✅ File configurazione (*.json, *.js, *.ts)
echo    ✅ Documentazione (*.md)
echo    ✅ Script di utilità (*.ps1, *.cmd)
echo    ✅ Environment files (.env.*)
echo    ✅ Linting configs (.eslintrc, .prettierrc)
echo.
if not exist "%DEST_ROOT%" mkdir "%DEST_ROOT%" >nul 2>&1
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup-enhanced-2025.ps1" -Type "config" -DestinationRoot "%DEST_ROOT%"
goto END

:FULL
echo.
echo ================================================================
echo   💯 BACKUP COMPLETO - TUTTO INCLUSO
echo ================================================================
echo.
echo ⚠️  ATTENZIONE: Questo backup includerà TUTTO il progetto!
echo     - node_modules (~200-400 MB)
echo     - .git repository history
echo     - dist/ build output
echo     - cache e file temporanei
echo.
echo 📊 Dimensioni stimate: 200-500 MB
echo ⏱️  Tempo stimato: 2-5 minuti
echo.
set /p CONFIRM=🤔 Sei sicuro di voler procedere? [y/N]: 
if /i not "%CONFIRM%"=="y" (
    echo ❌ Operazione annullata.
    goto END
)
echo.
echo 🚀 Avvio backup completo...
if not exist "%DEST_ROOT%" mkdir "%DEST_ROOT%" >nul 2>&1
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup-enhanced-2025.ps1" -Type "full" -DestinationRoot "%DEST_ROOT%"
goto END

:INFO
echo.
echo ================================================================
echo   📊 INFORMAZIONI SISTEMA PLAY SPORT PRO
echo ================================================================
echo.
echo 🎯 PROGETTO:
echo    Nome: Play Sport Pro
echo    Versione: 1.0.1
echo    Tipo: Progressive Web App (PWA)
echo    Linguaggio: JavaScript (React 18.3.1)
echo.
echo 🏗️ ARCHITETTURA:
echo    Frontend: React + Vite + Tailwind CSS
echo    State: React Context + React Query
echo    Routing: React Router DOM 7.8.2
echo    Backend: Firebase (Firestore + Auth)
echo    Mobile: Capacitor 7.4.3 (Android)
echo.
echo 🚀 FEATURES PRINCIPALI:
echo    ✅ Sistema prenotazione campi con drag^&drop
echo    ✅ Sistema prenotazione lezioni multi-maestri
echo    ✅ Validazione conflitti cross-type
echo    ✅ PWA con offline support
echo    ✅ Notifiche push
echo    ✅ App Android nativa
echo    ✅ Deploy automatico Netlify
echo.
echo 📂 STRUTTURA CARTELLE:
if exist "%SRC%src" (
    for /f %%i in ('dir "%SRC%src" /s /b 2^>nul ^| find /c ":"') do echo    src/: %%i file
) else (
    echo    src/: Cartella non trovata
)
if exist "%SRC%public" (
    for /f %%i in ('dir "%SRC%public" /s /b 2^>nul ^| find /c ":"') do echo    public/: %%i file
) else (
    echo    public/: Cartella non trovata
)
if exist "%SRC%dist" (
    for /f %%i in ('dir "%SRC%dist" /s /b 2^>nul ^| find /c ":"') do echo    dist/: %%i file (build)
) else (
    echo    dist/: Non presente (esegui npm run build)
)
if exist "%SRC%node_modules" (
    echo    node_modules/: Presente (dipendenze installate)
) else (
    echo    node_modules/: Non presente (esegui npm install)
)
echo.
echo 🔧 SCRIPT DISPONIBILI:
echo    npm run dev      - Server sviluppo
echo    npm run build    - Build produzione
echo    npm run preview  - Anteprima build
echo    npm run lint     - Controllo codice
echo.
echo 📍 PERCORSO PROGETTO:
echo    %SRC%
echo.
echo 📦 PERCORSO BACKUP:
echo    %DEST_ROOT%
echo.
pause
goto :eof

:END
echo.
echo ================================================================
echo   ✅ OPERAZIONE COMPLETATA
echo ================================================================
echo.
echo 📂 Cartella backup: %DEST_ROOT%
echo 📋 I backup vengono automaticamente limitati agli ultimi 15
echo 🔄 Per backup frequenti usa: backup-quick-2025.cmd
echo.
echo ❓ Per informazioni dettagliate leggi: BACKUP_INFO_*.txt
echo.
pause
goto EXIT

:EXIT
echo.
echo 👋 Grazie per aver usato Play Sport Pro Backup System v3.0!
echo.
endlocal
exit /b 0