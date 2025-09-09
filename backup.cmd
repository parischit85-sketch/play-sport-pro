@echo off
setlocal enableextensions enabledelayedexpansion

rem Directory sorgente = cartella di questo script
set "SRC=%~dp0"
set "DL=%USERPROFILE%\Downloads\backup Playsport"

for /f "usebackq delims=" %%i in (`powershell -NoLogo -NoProfile -Command "[DateTime]::Now.ToString('yyyyMMdd_HHmmss')"`) do set "TS=%%i"

echo ==============================================
echo  Backup Play Sport Pro
echo ==============================================
echo.
echo 1^) Backup LIGHT  (senza dipendenze e build)
echo 2^) Backup FULL   (copia completa)
echo.
set /p CHOICE=Seleziona [1/2] (default 1): 
if "%CHOICE%"=="" set CHOICE=1

if "%CHOICE%"=="1" goto LIGHT
if "%CHOICE%"=="2" goto FULL

:LIGHT
echo.
echo Creazione backup LIGHT...
if not exist "%DL%" mkdir "%DL%" >nul 2>&1
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup-light.ps1" -DestinationRoot "%DL%"
echo.
goto END

:FULL
echo.
echo Creazione backup FULL...
if not exist "%DL%" mkdir "%DL%" >nul 2>&1
set "DEST=%DL%\Play-Sport-Pro-BACKUP-FOLDER-%TS%"
if not exist "%DEST%" mkdir "%DEST%" >nul 2>&1
robocopy "%SRC%" "%DEST%" /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP >nul
echo Backup completo creato in: %DEST%
echo.
goto END

:END
echo Operazione terminata.
pause
endlocal