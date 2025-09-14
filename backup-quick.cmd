@echo off
rem ==============================================
rem  Play Sport Pro - Backup Rapido
rem  Per backup frequenti durante lo sviluppo
rem ==============================================

set "SRC=%~dp0"
set "QUICK_BACKUP=%USERPROFILE%\Documents\PlaySport-QuickBackups"

for /f "usebackq delims=" %%i in (`powershell -NoLogo -NoProfile -Command "[DateTime]::Now.ToString('yyyyMMdd_HHmm')"`) do set "TS=%%i"

echo ==============================================
echo  PLAY SPORT PRO - BACKUP RAPIDO
echo ==============================================
echo.
echo Creazione backup rapido (solo codice sorgente)...
echo.

if not exist "%QUICK_BACKUP%" mkdir "%QUICK_BACKUP%" >nul 2>&1

set "DEST=%QUICK_BACKUP%\playsport-quick-%TS%"
mkdir "%DEST%" >nul 2>&1

rem Copia solo le cartelle essenziali
echo Copiando src/...
robocopy "%SRC%src" "%DEST%\src" /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP >nul

echo Copiando public/...
robocopy "%SRC%public" "%DEST%\public" /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP >nul

rem Copia file di configurazione principali
echo Copiando configurazioni...
copy "%SRC%package.json" "%DEST%\" >nul 2>&1
copy "%SRC%vite.config.js" "%DEST%\" >nul 2>&1
copy "%SRC%tailwind.config.js" "%DEST%\" >nul 2>&1
copy "%SRC%firebase.json" "%DEST%\" >nul 2>&1
copy "%SRC%firestore.rules" "%DEST%\" >nul 2>&1
copy "%SRC%index.html" "%DEST%\" >nul 2>&1
copy "%SRC%README.md" "%DEST%\" >nul 2>&1

rem Mantieni solo gli ultimi 10 backup rapidi
powershell -NoLogo -NoProfile -Command "Get-ChildItem '%QUICK_BACKUP%' -Directory | Sort-Object CreationTime -Descending | Select-Object -Skip 10 | Remove-Item -Recurse -Force" 2>nul

echo.
echo Backup rapido creato: %DEST%
echo Conservati solo gli ultimi 10 backup rapidi
echo.
pause
