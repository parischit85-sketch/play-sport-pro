Param(
  [string]$Source = $PSScriptRoot,
  [string]$DestinationRoot = "$env:USERPROFILE\Downloads\backup Playsport"
)

try {
  # Normalize inputs to avoid inherited quotes/spaces from callers
  if ($Source) { $Source = $Source.Trim().Trim('"') }
  if ($DestinationRoot) { $DestinationRoot = $DestinationRoot.Trim().Trim('"') }

  # Fallback to script root if provided source is invalid
  if (-not $Source -or -not (Test-Path -LiteralPath $Source)) {
    $Source = $PSScriptRoot
  }

  $ts = Get-Date -Format 'yyyyMMdd_HHmmss'
  $src = (Resolve-Path -LiteralPath $Source).Path
  if (-not (Test-Path -LiteralPath $DestinationRoot)) {
    New-Item -ItemType Directory -Path $DestinationRoot -Force | Out-Null
  }
  $dest = Join-Path -Path $DestinationRoot -ChildPath ("play-sport-pro_backup_light_{0}" -f $ts)

  New-Item -ItemType Directory -Path $dest -Force | Out-Null

  # Exclude only installable elements: node_modules (any depth)
  $excludeAbs = @()
  $rootNodeModules = Join-Path -Path $src -ChildPath 'node_modules'
  if (Test-Path -LiteralPath $rootNodeModules) { $excludeAbs += $rootNodeModules }
  $nestedNodeModules = Get-ChildItem -Path $src -Directory -Filter 'node_modules' -Recurse -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
  if ($nestedNodeModules) { $excludeAbs += $nestedNodeModules }
  $excludeAbs = $excludeAbs | Select-Object -Unique

  # Construct robocopy args
  $rcArgs = @('/E','/R:1','/W:1','/NFL','/NDL','/NJH','/NJS','/NP')
  if ($excludeAbs.Count -gt 0) { $rcArgs += '/XD'; $rcArgs += $excludeAbs }

  # Execute robocopy
  & robocopy $src $dest @rcArgs | Out-Null

  # Summary
  $filesCount = (Get-ChildItem -Path $dest -Recurse -File -Force | Measure-Object).Count
  $sizeSum = (Get-ChildItem -Path $dest -Recurse -File -Force | Measure-Object Length -Sum).Sum
  $mb = [math]::Round($sizeSum/1MB,2)

  Write-Output ("Backup light creato in: {0}" -f $dest)
  Write-Output ("File: {0}, Dimensione: {1} MB" -f $filesCount, $mb)
}
catch {
  Write-Error $_
  exit 1
}