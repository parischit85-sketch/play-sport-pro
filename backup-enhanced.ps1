[CmdletBinding()]
Param(
  [Parameter(Mandatory=$false)]
  [ValidateSet("light", "deploy", "config")]
  [string]$Type = "light",
  
  [Parameter(Mandatory=$false)]
  [string]$Source = $PSScriptRoot,
  
  [Parameter(Mandatory=$false)]
  [string]$DestinationRoot = "$env:USERPROFILE\Downloads\backup-playsport-pro"
)

# ==============================================
# Play Sport Pro - Enhanced Backup Script v2.0
# Aggiornato: 11 Settembre 2025
# ==============================================

function Write-BackupLog {
  param([string]$Message, [string]$Level = "INFO")
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $color = switch($Level) {
    "ERROR" { "Red" }
    "WARN" { "Yellow" }
    "SUCCESS" { "Green" }
    default { "White" }
  }
  Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

try {
  # Normalize paths
  if ($Source) { $Source = $Source.Trim().Trim('"') }
  if ($DestinationRoot) { $DestinationRoot = $DestinationRoot.Trim().Trim('"') }

  if (-not $Source -or -not (Test-Path -LiteralPath $Source)) {
    $Source = $PSScriptRoot
  }

  $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
  $srcPath = (Resolve-Path -LiteralPath $Source).Path
  
  if (-not (Test-Path -LiteralPath $DestinationRoot)) {
    New-Item -ItemType Directory -Path $DestinationRoot -Force | Out-Null
  }

  # Create destination based on backup type
  $destName = "play-sport-pro-$Type-$timestamp"
  $destPath = Join-Path -Path $DestinationRoot -ChildPath $destName
  New-Item -ItemType Directory -Path $destPath -Force | Out-Null

  Write-BackupLog "=== PLAY SPORT PRO BACKUP SYSTEM v2.0 ===" "SUCCESS"
  Write-BackupLog "Tipo backup: $($Type.ToUpper())"
  Write-BackupLog "Sorgente: $srcPath"
  Write-BackupLog "Destinazione: $destPath"
  Write-BackupLog ""

  # Define exclusion patterns based on backup type
  $excludeDirs = @()
  $includePatterns = @()

  switch ($Type) {
    "light" {
      Write-BackupLog "Configurazione BACKUP LIGHT:"
      Write-BackupLog "- Codice sorgente completo (src/)"
      Write-BackupLog "- Configurazioni (package.json, vite.config.js, etc.)"
      Write-BackupLog "- Documentazione (*.md)"
      Write-BackupLog "- Script di utilità"
      Write-BackupLog "- Configurazioni Android/PWA"
      Write-BackupLog ""

      $excludeDirs = @(
        "node_modules",
        "dist",
        ".git",
        ".next",
        ".nuxt",
        "coverage",
        ".nyc_output",
        "logs",
        "*.log"
      )
    }

    "deploy" {
      Write-BackupLog "Configurazione BACKUP DEPLOY:"
      Write-BackupLog "- Build ottimizzato (dist/)"
      Write-BackupLog "- Configurazioni deployment"
      Write-BackupLog "- PWA assets"
      Write-BackupLog "- Firebase config"
      Write-BackupLog ""

      # For deploy, we copy specific folders/files
      $includePatterns = @(
        "dist",
        "public",
        "firebase.json",
        "firestore.*",
        ".firebaserc",
        "netlify.toml",
        "package.json",
        "capacitor.config.ts",
        "android/app/src/main",
        "*.md"
      )
    }

    "config" {
      Write-BackupLog "Configurazione BACKUP CONFIG:"
      Write-BackupLog "- File di configurazione"
      Write-BackupLog "- Documentazione"
      Write-BackupLog "- Script di utilità"
      Write-BackupLog ""

      $includePatterns = @(
        "*.json",
        "*.js",
        "*.ts",
        "*.md",
        "*.cmd",
        "*.ps1",
        "*.toml",
        "*.rules",
        "*.config.*",
        ".env.*",
        ".eslintrc.*",
        ".prettierrc.*",
        ".gitignore",
        ".firebaserc"
      )
    }
  }

  # Execute backup based on type
  if ($includePatterns.Count -gt 0) {
    # Selective backup for deploy/config
    Write-BackupLog "Copying selected files and folders..."
    
    foreach ($pattern in $includePatterns) {
      if ($pattern -match "^[^*]+$" -and (Test-Path -Path (Join-Path $srcPath $pattern))) {
        # It's a specific path
        $itemPath = Join-Path $srcPath $pattern
        $itemDest = Join-Path $destPath $pattern
        
        if (Test-Path -Path $itemPath -PathType Container) {
          # It's a directory
          Write-BackupLog "Copying directory: $pattern"
          & robocopy $itemPath $itemDest /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
        } else {
          # It's a file
          Write-BackupLog "Copying file: $pattern"
          $parentDir = Split-Path $itemDest -Parent
          if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
          }
          Copy-Item -Path $itemPath -Destination $itemDest -Force
        }
      } else {
        # It's a wildcard pattern
        Write-BackupLog "Copying files matching: $pattern"
        $matchingItems = Get-ChildItem -Path $srcPath -Filter $pattern -Recurse -ErrorAction SilentlyContinue
        foreach ($item in $matchingItems) {
          $relativePath = $item.FullName.Substring($srcPath.Length + 1)
          $itemDest = Join-Path $destPath $relativePath
          $parentDir = Split-Path $itemDest -Parent
          
          if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
          }
          
          Copy-Item -Path $item.FullName -Destination $itemDest -Force
        }
      }
    }
  } else {
    # Full backup with exclusions (light backup)
    Write-BackupLog "Executing full backup with exclusions..."
    
    # Find all node_modules directories
    $excludeAbs = @()
    foreach ($excludeDir in $excludeDirs) {
      if ($excludeDir -eq "*.log") {
        continue # Skip log pattern for robocopy
      }
      
      $rootExclude = Join-Path -Path $srcPath -ChildPath $excludeDir
      if (Test-Path -LiteralPath $rootExclude) { 
        $excludeAbs += $rootExclude 
      }
      
      if ($excludeDir -eq "node_modules") {
        $nestedExcludes = Get-ChildItem -Path $srcPath -Directory -Filter $excludeDir -Recurse -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
        if ($nestedExcludes) { $excludeAbs += $nestedExcludes }
      }
    }
    
    $excludeAbs = $excludeAbs | Select-Object -Unique

    # Robocopy arguments
    $rcArgs = @('/E', '/R:1', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS', '/NP')
    if ($excludeAbs.Count -gt 0) { 
      $rcArgs += '/XD'
      $rcArgs += $excludeAbs 
    }
    
    # Exclude log files
    $rcArgs += '/XF'
    $rcArgs += '*.log'

    # Execute robocopy
    Write-BackupLog "Running robocopy with exclusions..."
    & robocopy $srcPath $destPath @rcArgs | Out-Null
  }

  # Create backup info file
  $backupInfo = @"
==============================================
PLAY SPORT PRO - BACKUP INFO
==============================================
Tipo backup: $($Type.ToUpper())
Data creazione: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Versione progetto: 1.0.1
Sorgente: $srcPath
Destinazione: $destPath

CARATTERISTICHE PROGETTO:
- Framework: React 18.3.1 + Vite 7.1.5
- UI: Tailwind CSS + componenti custom
- Backend: Firebase (Firestore, Auth, Hosting)
- Mobile: Capacitor 7.4.3 (Android)
- PWA: Service Worker + offline support
- State Management: React Context API
- Booking System: Sistema unificato campi + lezioni

SISTEMI IMPLEMENTATI:
✅ Sistema prenotazione campi unificato
✅ Sistema prenotazione lezioni multi-maestri
✅ Validazione conflitti booking cross-type
✅ Hole prevention per slot booking
✅ UI responsive + dark mode
✅ PWA con notifiche push
✅ Build Android ottimizzato

ULTIMO AGGIORNAMENTO:
- Fix booking conflicts campi vs lezioni
- Unified availability validation
- Enhanced debug logging
- Multi-instructor slot management
==============================================
"@

  $backupInfoPath = Join-Path $destPath "BACKUP_INFO.txt"
  $backupInfo | Out-File -FilePath $backupInfoPath -Encoding UTF8

  # Calculate statistics
  $filesCount = (Get-ChildItem -Path $destPath -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object).Count
  $sizeSum = (Get-ChildItem -Path $destPath -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
  $sizeMB = [math]::Round($sizeSum/1MB, 2)

  Write-BackupLog ""
  Write-BackupLog "=== BACKUP COMPLETATO ===" "SUCCESS"
  Write-BackupLog "Percorso: $destPath" "SUCCESS"
  Write-BackupLog "File copiati: $filesCount" "SUCCESS"
  Write-BackupLog "Dimensione totale: $sizeMB MB" "SUCCESS"
  Write-BackupLog ""
  
  # Open destination folder
  Write-BackupLog "Apertura cartella di destinazione..."
  Start-Process -FilePath "explorer.exe" -ArgumentList $destPath

} catch {
  Write-BackupLog "ERRORE durante il backup: $($_.Exception.Message)" "ERROR"
  Write-BackupLog "Stack trace: $($_.ScriptStackTrace)" "ERROR"
  exit 1
}
