@echo off
setlocal enableextensions enabledelayedexpansion

rem ==============================================
rem  Play Sport Pro - Test Sistema Backup v3.0
rem  Verifica funzionamento script di backup
rem ==============================================

echo.
echo ================================================================
echo   🧪 PLAY SPORT PRO - TEST SISTEMA BACKUP v3.0 🧪
echo ================================================================
echo.
echo Questo script verifica il corretto funzionamento del sistema di backup
echo.

set "SRC=%~dp0"
set "TEST_PASSED=0"
set "TEST_TOTAL=0"

echo 📋 Test preliminari...
echo.

rem Test 1: Verifica esistenza script principali
set /a TEST_TOTAL+=1
echo Test 1/6: Verifica esistenza script...
if exist "%SRC%backup-system-2025.cmd" (
    if exist "%SRC%backup-enhanced-2025.ps1" (
        if exist "%SRC%backup-quick-2025.cmd" (
            echo    ✅ Tutti gli script sono presenti
            set /a TEST_PASSED+=1
        ) else (
            echo    ❌ backup-quick-2025.cmd mancante
        )
    ) else (
        echo    ❌ backup-enhanced-2025.ps1 mancante
    )
) else (
    echo    ❌ backup-system-2025.cmd mancante
)

rem Test 2: Verifica PowerShell disponibile
set /a TEST_TOTAL+=1
echo.
echo Test 2/6: Verifica PowerShell...
powershell -NoLogo -NoProfile -Command "Write-Host 'PowerShell OK'" >nul 2>&1
if !errorlevel! equ 0 (
    echo    ✅ PowerShell disponibile e funzionante
    set /a TEST_PASSED+=1
) else (
    echo    ❌ PowerShell non disponibile o non funzionante
)

rem Test 3: Verifica robocopy
set /a TEST_TOTAL+=1
echo.
echo Test 3/6: Verifica robocopy...
robocopy /? >nul 2>&1
if !errorlevel! lss 16 (
    echo    ✅ Robocopy disponibile
    set /a TEST_PASSED+=1
) else (
    echo    ❌ Robocopy non disponibile
)

rem Test 4: Verifica struttura progetto
set /a TEST_TOTAL+=1
echo.
echo Test 4/6: Verifica struttura progetto...
if exist "%SRC%src" (
    if exist "%SRC%package.json" (
        if exist "%SRC%public" (
            echo    ✅ Struttura progetto React valida
            set /a TEST_PASSED+=1
        ) else (
            echo    ⚠️ Cartella public/ mancante
        )
    ) else (
        echo    ❌ package.json mancante
    )
) else (
    echo    ❌ Cartella src/ mancante
)

rem Test 5: Verifica cartelle destinazione
set /a TEST_TOTAL+=1
echo.
echo Test 5/6: Verifica accesso cartelle destinazione...
set "TEST_DEST=%USERPROFILE%\Downloads\test-backup-access"
mkdir "%TEST_DEST%" >nul 2>&1
if exist "%TEST_DEST%" (
    echo test > "%TEST_DEST%\test.txt" 2>nul
    if exist "%TEST_DEST%\test.txt" (
        rd /s /q "%TEST_DEST%" >nul 2>&1
        echo    ✅ Accesso scrittura cartelle OK
        set /a TEST_PASSED+=1
    ) else (
        echo    ❌ Impossibile scrivere nelle cartelle destinazione
        rd /s /q "%TEST_DEST%" >nul 2>&1
    )
) else (
    echo    ❌ Impossibile creare cartelle destinazione
)

rem Test 6: Test backup config veloce
set /a TEST_TOTAL+=1
echo.
echo Test 6/6: Test backup config rapido...
echo    🔄 Esecuzione test backup config...

powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "& '%SRC%backup-enhanced-2025.ps1' -Type 'config' -DestinationRoot '%USERPROFILE%\Downloads\test-backup-2025'" >nul 2>&1

set "TEST_BACKUP_DIR="
for /f "delims=" %%d in ('dir "%USERPROFILE%\Downloads\test-backup-2025\play-sport-pro-config-*" /b /ad 2^>nul') do (
    set "TEST_BACKUP_DIR=%%d"
    goto :found_test_backup
)
:found_test_backup

if defined TEST_BACKUP_DIR (
    if exist "%USERPROFILE%\Downloads\test-backup-2025\%TEST_BACKUP_DIR%\package.json" (
        echo    ✅ Test backup config completato con successo
        set /a TEST_PASSED+=1
        
        rem Cleanup test backup
        rd /s /q "%USERPROFILE%\Downloads\test-backup-2025" >nul 2>&1
    ) else (
        echo    ❌ Test backup config fallito - file mancanti
    )
) else (
    echo    ❌ Test backup config fallito - cartella non creata
)

echo.
echo ================================================================
echo   📊 RISULTATI TEST
echo ================================================================
echo.

if %TEST_PASSED% equ %TEST_TOTAL% (
    echo 🎉 TUTTI I TEST SUPERATI! ^(%TEST_PASSED%/%TEST_TOTAL%^)
    echo.
    echo ✅ Il sistema di backup è pronto all'uso
    echo.
    echo 🚀 Per iniziare:
    echo    backup-system-2025.cmd     ^(menu principale^)
    echo    backup-quick-2025.cmd      ^(backup rapido^)
    echo.
    echo 📚 Documentazione completa:
    echo    BACKUP_SYSTEM_README_2025.md
    echo.
) else (
    echo ❌ ALCUNI TEST FALLITI ^(%TEST_PASSED%/%TEST_TOTAL%^)
    echo.
    echo 🔧 Azioni richieste:
    
    if %TEST_PASSED% lss 3 (
        echo    • Verifica installazione PowerShell
        echo    • Verifica comandi di sistema ^(robocopy^)
    )
    
    if not exist "%SRC%src" (
        echo    • Verifica di essere nella cartella progetto corretta
    )
    
    if %TEST_PASSED% lss 5 (
        echo    • Verifica permessi cartelle Documents/Downloads
        echo    • Esegui come Amministratore se necessario
    )
    
    echo.
    echo 📋 Per supporto consulta: BACKUP_SYSTEM_README_2025.md
    echo.
)

echo ================================================================
echo.

rem Mostra info sistema
echo 💻 Informazioni sistema:
echo    Computer: %COMPUTERNAME%
echo    Utente: %USERNAME%
echo    Data: %date% %time%
echo    Cartella progetto: %SRC%
echo.

rem Mostra statistiche progetto se disponibile
if exist "%SRC%package.json" (
    echo 📊 Statistiche progetto:
    for /f %%i in ('dir "%SRC%src" /s /b 2^>nul ^| find /c ":"') do echo    File src/: %%i
    if exist "%SRC%node_modules" (
        echo    node_modules: Presente
    ) else (
        echo    node_modules: Non presente ^(esegui npm install^)
    )
    if exist "%SRC%dist" (
        echo    dist: Presente ^(build disponibile^)
    ) else (
        echo    dist: Non presente ^(esegui npm run build^)
    )
)

echo.
echo 🔚 Test completati. Premi un tasto per chiudere...
pause >nul

endlocal
exit /b 0