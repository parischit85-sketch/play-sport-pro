[CmdletBinding()]
Param(
  [Parameter(Mandatory=$false)]
  [ValidateSet("light", "deploy", "config", "full")]
  [string]$Type = "light",
  
  [Parameter(Mandatory=$false)]
  [string]$Source = $PSScriptRoot,
  
  [Parameter(Mandatory=$false)]
  [string]$DestinationRoot = "$env:USERPROFILE\Downloads\backup-play-sport-pro-2025"
)

# ==============================================
# Play Sport Pro - Enhanced Backup System v3.0
# Aggiornato: 11 Settembre 2025
# Progetto: Sistema unificato prenotazioni campi + lezioni
# ==============================================

function Write-BackupLog {
  param([string]$Message, [string]$Level = "INFO")
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $color = switch($Level) {
    "ERROR" { "Red" }
    "WARN" { "Yellow" }
    "SUCCESS" { "Green" }
    "INFO" { "Cyan" }
    default { "White" }
  }
  Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

function Get-ProjectStats {
  param([string]$Path)
  
  $srcFiles = 0
  $srcSize = 0
  $totalFiles = 0
  $totalSize = 0
  
  if (Test-Path (Join-Path $Path "src")) {
    $srcItems = Get-ChildItem -Path (Join-Path $Path "src") -Recurse -File -ErrorAction SilentlyContinue
    $srcFiles = ($srcItems | Measure-Object).Count
    $srcSize = ($srcItems | Measure-Object Length -Sum).Sum
  }
  
  $allItems = Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue
  $totalFiles = ($allItems | Measure-Object).Count
  $totalSize = ($allItems | Measure-Object Length -Sum).Sum
  
  return @{
    SrcFiles = $srcFiles
    SrcSizeMB = [math]::Round($srcSize/1MB, 2)
    TotalFiles = $totalFiles
    TotalSizeMB = [math]::Round($totalSize/1MB, 2)
  }
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

  Write-BackupLog "════════════════════════════════════════════════════════════" "SUCCESS"
  Write-BackupLog "🎾 PLAY SPORT PRO BACKUP SYSTEM v3.0 🎾" "SUCCESS"
  Write-BackupLog "════════════════════════════════════════════════════════════" "SUCCESS"
  Write-BackupLog ""
  Write-BackupLog "📋 Configurazione backup:"
  Write-BackupLog "   Tipo: $($Type.ToUpper())" "INFO"
  Write-BackupLog "   Sorgente: $srcPath" "INFO"
  Write-BackupLog "   Destinazione: $destPath" "INFO"
  Write-BackupLog ""

  # Get current project stats
  $projectStats = Get-ProjectStats -Path $srcPath
  Write-BackupLog "📊 Statistiche progetto:"
  Write-BackupLog "   File sorgente (src/): $($projectStats.SrcFiles) file ($($projectStats.SrcSizeMB) MB)" "INFO"
  Write-BackupLog "   File totali: $($projectStats.TotalFiles) file ($($projectStats.TotalSizeMB) MB)" "INFO"
  Write-BackupLog ""

  # Define exclusion patterns based on backup type
  $excludeDirs = @()
  $includePatterns = @()

  switch ($Type) {
    "light" {
      Write-BackupLog "🪶 CONFIGURAZIONE BACKUP LIGHT:" "SUCCESS"
      Write-BackupLog "   ✅ Codice sorgente completo (src/)" "INFO"
      Write-BackupLog "   ✅ Configurazioni (package.json, vite.config.js, etc.)" "INFO"
      Write-BackupLog "   ✅ Documentazione (*.md)" "INFO"
      Write-BackupLog "   ✅ Script di utilità (*.ps1, *.cmd)" "INFO"
      Write-BackupLog "   ✅ Configurazioni Firebase/Netlify" "INFO"
      Write-BackupLog "   ✅ Configurazioni Android/PWA" "INFO"
      Write-BackupLog "   ❌ Dipendenze (node_modules)" "WARN"
      Write-BackupLog "   ❌ Build output (dist)" "WARN"
      Write-BackupLog "   ❌ Repository Git (.git)" "WARN"
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
        "*.log",
        ".vscode",
        ".idea"
      )
    }

    "deploy" {
      Write-BackupLog "🚀 CONFIGURAZIONE BACKUP DEPLOY:" "SUCCESS"
      Write-BackupLog "   ✅ Build ottimizzato (dist/)" "INFO"
      Write-BackupLog "   ✅ Configurazioni deployment" "INFO"
      Write-BackupLog "   ✅ PWA assets (public/)" "INFO"
      Write-BackupLog "   ✅ Firebase config" "INFO"
      Write-BackupLog "   ✅ Android config" "INFO"
      Write-BackupLog "   ✅ Netlify config" "INFO"
      Write-BackupLog ""

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
        "android/app/build.gradle",
        "android/build.gradle",
        "*.md",
        "index.html"
      )
    }

    "config" {
      Write-BackupLog "⚙️ CONFIGURAZIONE BACKUP CONFIG:" "SUCCESS"
      Write-BackupLog "   ✅ File di configurazione" "INFO"
      Write-BackupLog "   ✅ Documentazione completa" "INFO"
      Write-BackupLog "   ✅ Script di utilità" "INFO"
      Write-BackupLog "   ✅ Environment files" "INFO"
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
        ".commitlintrc.*",
        ".gitignore",
        ".firebaserc",
        ".huskyrc",
        "tailwind.config.js",
        "vite.config.js",
        "postcss.config.js",
        "tsconfig.json"
      )
    }

    "full" {
      Write-BackupLog "💯 CONFIGURAZIONE BACKUP COMPLETO:" "SUCCESS"
      Write-BackupLog "   ✅ Tutto il progetto incluso" "INFO"
      Write-BackupLog "   ✅ Node modules" "INFO"
      Write-BackupLog "   ✅ Build output" "INFO"
      Write-BackupLog "   ✅ Repository Git" "INFO"
      Write-BackupLog "   ⚠️ ATTENZIONE: Backup molto pesante!" "WARN"
      Write-BackupLog ""

      # No exclusions for full backup
      $excludeDirs = @()
    }
  }

  # Execute backup based on type
  if ($includePatterns.Count -gt 0) {
    # Selective backup for deploy/config
    Write-BackupLog "📁 Copia selettiva di file e cartelle..."
    
    $copiedItems = 0
    foreach ($pattern in $includePatterns) {
      if ($pattern -match "^[^*]+$" -and (Test-Path -Path (Join-Path $srcPath $pattern))) {
        # It's a specific path
        $itemPath = Join-Path $srcPath $pattern
        $itemDest = Join-Path $destPath $pattern
        
        if (Test-Path -Path $itemPath -PathType Container) {
          # It's a directory
          Write-BackupLog "   📂 Cartella: $pattern"
          & robocopy $itemPath $itemDest /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
          if ($LASTEXITCODE -lt 8) { $copiedItems++ }
        } else {
          # It's a file
          Write-BackupLog "   📄 File: $pattern"
          $parentDir = Split-Path $itemDest -Parent
          if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
          }
          Copy-Item -Path $itemPath -Destination $itemDest -Force
          $copiedItems++
        }
      } else {
        # It's a wildcard pattern
        $matchingItems = Get-ChildItem -Path $srcPath -Filter $pattern -Recurse -ErrorAction SilentlyContinue
        if ($matchingItems.Count -gt 0) {
          Write-BackupLog "   🔍 Pattern '$pattern': $($matchingItems.Count) file trovati"
          foreach ($item in $matchingItems) {
            $relativePath = $item.FullName.Substring($srcPath.Length + 1)
            $itemDest = Join-Path $destPath $relativePath
            $parentDir = Split-Path $itemDest -Parent
            
            if (-not (Test-Path $parentDir)) {
              New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
            }
            
            Copy-Item -Path $item.FullName -Destination $itemDest -Force
            $copiedItems++
          }
        }
      }
    }
    Write-BackupLog "   ✅ $copiedItems elementi copiati" "SUCCESS"
  } else {
    # Full backup with exclusions (light backup or full backup)
    Write-BackupLog "📦 Backup completo con esclusioni..."
    
    if ($Type -eq "full") {
      # True full backup - copy everything
      Write-BackupLog "   🚀 Copia completa di tutto il progetto..."
      & robocopy $srcPath $destPath /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
    } else {
      # Light backup with exclusions
      $excludeAbs = @()
      foreach ($excludeDir in $excludeDirs) {
        if ($excludeDir -eq "*.log") {
          continue # Skip log pattern for robocopy
        }
        
        $rootExclude = Join-Path -Path $srcPath -ChildPath $excludeDir
        if (Test-Path -LiteralPath $rootExclude) { 
          $excludeAbs += $rootExclude 
          Write-BackupLog "   ❌ Esclusione: $excludeDir"
        }
        
        # Find nested exclusions (like nested node_modules)
        if ($excludeDir -eq "node_modules" -or $excludeDir -eq "dist") {
          $nestedExcludes = Get-ChildItem -Path $srcPath -Directory -Filter $excludeDir -Recurse -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
          if ($nestedExcludes) { 
            $excludeAbs += $nestedExcludes 
            Write-BackupLog "   ❌ Esclusioni nidificate $excludeDir: $($nestedExcludes.Count)"
          }
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
      Write-BackupLog "   🔄 Esecuzione robocopy con $($excludeAbs.Count) esclusioni..."
      & robocopy $srcPath $destPath @rcArgs | Out-Null
    }
  }

  # Create detailed backup info file
  $backupInfo = @"
════════════════════════════════════════════════════════════
🎾 PLAY SPORT PRO - BACKUP INFORMATION
════════════════════════════════════════════════════════════

📋 DETTAGLI BACKUP
Tipo backup: $($Type.ToUpper())
Data creazione: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Versione progetto: 1.0.1
Sorgente: $srcPath
Destinazione: $destPath

🏗️ ARCHITETTURA PROGETTO
Framework: React 18.3.1 + Vite 7.1.4
UI Framework: Tailwind CSS 3.4.13 + componenti custom
Backend: Firebase (Firestore, Auth, Hosting)
Mobile: Capacitor 7.4.3 (Android)
PWA: Service Worker + offline support
State Management: React Context API + React Query
Routing: React Router DOM 7.8.2
Build Tool: Vite 7.1.4 con Terser ottimizzato

📊 STATISTICHE ORIGINALI
File sorgente (src/): $($projectStats.SrcFiles) file ($($projectStats.SrcSizeMB) MB)
File totali progetto: $($projectStats.TotalFiles) file ($($projectStats.TotalSizeMB) MB)

🚀 SISTEMI IMPLEMENTATI
✅ Sistema prenotazione campi unificato con drag & drop
✅ Sistema prenotazione lezioni multi-maestri
✅ Validazione conflitti booking cross-type (campi vs lezioni)
✅ Hole prevention per slot booking consecutivi
✅ UI responsive + dark mode completo
✅ PWA con notifiche push e offline support
✅ Build Android ottimizzato con Capacitor
✅ Deploy automatico Netlify + Firebase

🔧 FEATURES RECENTI (Settembre 2025)
✅ Fix drag & drop overlap detection migliorato
✅ Risoluzione problema prenotazioni spariscono dopo drag & drop
✅ Timezone handling corretto per slot booking
✅ Enhanced conflict validation per multi-instructor slots
✅ Unified booking service con real-time sync
✅ Performance optimization con React Query

🎯 CONFIGURAZIONI PRINCIPALI
- Firebase: Firestore + Authentication + Hosting
- Netlify: Deploy automatico da GitHub
- ESLint + Prettier: Code quality automation
- Husky: Pre-commit hooks per lint-staged
- Capacitor: Configurazione Android pronta
- PWA: Manifest + Service Worker configurati

🔄 DEPLOYMENT
- Ambiente sviluppo: npm run dev (Vite dev server)
- Build produzione: npm run build (ottimizzato Terser)
- Preview: npm run preview
- Deploy: Automatico via GitHub → Netlify

📱 SUPPORTO MOBILE
- PWA installabile su tutti i dispositivi
- App Android nativa via Capacitor
- Notifiche push configurate
- Offline mode con cache intelligente

════════════════════════════════════════════════════════════
🕐 Backup creato il $(Get-Date -Format 'dd/MM/yyyy alle HH:mm:ss')
🖥️ Sistema: $env:COMPUTERNAME ($env:USERNAME)
════════════════════════════════════════════════════════════
"@

  $backupInfoPath = Join-Path $destPath "BACKUP_INFO_$($timestamp).txt"
  $backupInfo | Out-File -FilePath $backupInfoPath -Encoding UTF8

  # Calculate final statistics
  $finalStats = Get-ProjectStats -Path $destPath
  
  Write-BackupLog ""
  Write-BackupLog "════════════════════════════════════════════════════════════" "SUCCESS"
  Write-BackupLog "🎉 BACKUP COMPLETATO CON SUCCESSO!" "SUCCESS"
  Write-BackupLog "════════════════════════════════════════════════════════════" "SUCCESS"
  Write-BackupLog ""
  Write-BackupLog "📂 Percorso: $destPath" "SUCCESS"
  Write-BackupLog "📊 Statistiche backup:"
  Write-BackupLog "   📄 File copiati: $($finalStats.TotalFiles)" "SUCCESS"
  Write-BackupLog "   💾 Dimensione totale: $($finalStats.TotalSizeMB) MB" "SUCCESS"
  Write-BackupLog "   📋 Info dettagliate: BACKUP_INFO_$($timestamp).txt" "INFO"
  Write-BackupLog ""
  
  # Calculate compression ratio if applicable
  if ($projectStats.TotalSizeMB -gt 0 -and $Type -ne "full") {
    $compressionRatio = [math]::Round((1 - ($finalStats.TotalSizeMB / $projectStats.TotalSizeMB)) * 100, 1)
    Write-BackupLog "📉 Riduzione dimensioni: $compressionRatio%" "INFO"
  }
  
  # Clean up old backups (keep only last 15)
  Write-BackupLog "🧹 Pulizia backup vecchi (mantengo ultimi 15)..."
  $oldBackups = Get-ChildItem -Path $DestinationRoot -Directory | 
                Where-Object { $_.Name -like "play-sport-pro-*" } |
                Sort-Object CreationTime -Descending |
                Select-Object -Skip 15
  
  if ($oldBackups) {
    foreach ($oldBackup in $oldBackups) {
      Remove-Item -Path $oldBackup.FullName -Recurse -Force -ErrorAction SilentlyContinue
      Write-BackupLog "   🗑️ Rimosso: $($oldBackup.Name)" "WARN"
    }
  } else {
    Write-BackupLog "   ✅ Nessun backup obsoleto da rimuovere" "INFO"
  }
  
  Write-BackupLog ""
  Write-BackupLog "🚀 Apertura cartella di destinazione..." "INFO"
  Start-Process -FilePath "explorer.exe" -ArgumentList $destPath

  Write-BackupLog ""
  Write-BackupLog "✨ Backup system Play Sport Pro v3.0 - Operazione completata!" "SUCCESS"
  Write-BackupLog "════════════════════════════════════════════════════════════" "SUCCESS"

} catch {
  Write-BackupLog ""
  Write-BackupLog "❌ ERRORE DURANTE IL BACKUP" "ERROR"
  Write-BackupLog "Dettagli: $($_.Exception.Message)" "ERROR"
  Write-BackupLog "Stack trace: $($_.ScriptStackTrace)" "ERROR"
  Write-BackupLog ""
  exit 1
}