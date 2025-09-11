@echo off
setlocal enableextensions enabledelayedexpansion

rem ==============================================
rem  Play Sport Pro - Sistema di Backup v2.0
rem  Aggiornato: 11 Settembre 2025
rem ==============================================

rem Directory sorgente = cartella di questo script
set "SRC=%~dp0"
set "DL=%USERPROFILE%\Downloads\backup-playsport-pro"

for /f "usebackq delims=" %%i in (`powershell -NoLogo -NoProfile -Command "[DateTime]::Now.ToString('yyyyMMdd_HHmmss')"`) do set "TS=%%i"

echo ==============================================
echo  PLAY SPORT PRO - BACKUP SYSTEM v2.0
echo ==============================================
echo.
echo Versione corrente: 1.0.1 (React + Vite + Firebase)
echo Progetto: Sistema unificato di prenotazioni
echo.
echo Opzioni disponibili:
echo.
echo 1^) BACKUP LIGHT     (codice sorgente + config, senza dipendenze)
echo 2^) BACKUP COMPLETO  (tutto incluso - node_modules, dist, .git)
echo 3^) BACKUP DEPLOY    (solo file per deployment)
echo 4^) BACKUP CONFIG    (solo configurazioni e documentazione)
echo.
set /p CHOICE=Seleziona [1-4] (default 1): 
if "%CHOICE%"=="" set CHOICE=1

if "%CHOICE%"=="1" goto LIGHT
if "%CHOICE%"=="2" goto COMPLETO
if "%CHOICE%"=="3" goto DEPLOY
if "%CHOICE%"=="4" goto CONFIG

:LIGHT
echo.
echo === BACKUP LIGHT ===
echo Inclusi: codice sorgente, configurazioni, documentazione
echo Esclusi: node_modules, dist, .git, cache
echo.
if not exist "%DL%" mkdir "%DL%" >nul 2>&1
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup-enhanced.ps1" -Type "light" -DestinationRoot "%DL%"
goto END

:COMPLETO
echo.
echo === BACKUP COMPLETO ===
echo Inclusi: tutto il progetto (incluso node_modules, .git, dist)
echo ATTENZIONE: Backup molto pesante!
echo.
set /p CONFIRM=Confermi? [y/N]: 
if /i not "%CONFIRM%"=="y" goto END
if not exist "%DL%" mkdir "%DL%" >nul 2>&1
set "DEST=%DL%\play-sport-pro-COMPLETO-%TS%"
echo Creazione backup completo...
robocopy "%SRC%" "%DEST%" /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP >nul
echo Backup completo creato in: %DEST%
goto END

:DEPLOY
echo.
echo === BACKUP DEPLOY ===
echo Inclusi: build ottimizzato, configurazioni deployment, PWA
echo.
if not exist "%DL%" mkdir "%DL%" >nul 2>&1
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup-enhanced.ps1" -Type "deploy" -DestinationRoot "%DL%"
goto END

:CONFIG
echo.
echo === BACKUP CONFIG ===
echo Inclusi: solo configurazioni, documentazione e script
echo.
if not exist "%DL%" mkdir "%DL%" >nul 2>&1
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup-enhanced.ps1" -Type "config" -DestinationRoot "%DL%"
goto END

:END
echo.
echo ==============================================
echo  Operazione terminata.
echo  Cartella backup: %DL%
echo ==============================================
pause
endlocal
