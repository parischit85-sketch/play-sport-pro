#!/usr/bin/env pwsh
# Quick Security Check - Verifica che non ci siano segreti esposti

Write-Host "`n🔍 Security Scan - Play Sport Pro`n" -ForegroundColor Cyan

$issues = @()
$warnings = @()

# Check 1: .env file in .gitignore
Write-Host "📋 Checking .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    if ($gitignore -match "\.env") {
        Write-Host "✅ .env is in .gitignore" -ForegroundColor Green
    } else {
        $issues += "❌ .env NOT in .gitignore - add it now!"
    }
    
    if ($gitignore -match "test-.*\.mjs") {
        Write-Host "✅ test-*.mjs files are in .gitignore" -ForegroundColor Green
    } else {
        $warnings += "⚠️  test-*.mjs not in .gitignore - consider adding it"
    }
} else {
    $issues += "❌ .gitignore file not found!"
}

# Check 2: .env file exists but not committed
Write-Host "`n📋 Checking .env file status..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists locally" -ForegroundColor Green
    
    # Check if it's being tracked by git
    try {
        $gitStatus = git status --porcelain .env 2>&1
        if ($gitStatus -match "\.env") {
            $issues += "❌ .env file is tracked by Git - remove it from version control!"
            Write-Host "   Run: git rm --cached .env" -ForegroundColor Red
        } else {
            Write-Host "✅ .env file is NOT tracked by Git" -ForegroundColor Green
        }
    } catch {
        $warnings += "⚠️  Could not check Git status (is this a Git repo?)"
    }
} else {
    $warnings += "⚠️  .env file not found - you may need to create it"
}

# Check 3: Hardcoded secrets in code
Write-Host "`n📋 Scanning for hardcoded secrets..." -ForegroundColor Yellow
$secretPatterns = @(
    'SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}',  # SendGrid API key
    'AKIA[0-9A-Z]{16}',                           # AWS Access Key
    'AIza[0-9A-Za-z\-_]{35}',                    # Google API key
    'sk-[a-zA-Z0-9]{48}',                        # OpenAI API key
    'password.*:.*[''"][^''"]{8,}[''"]'          # Hardcoded passwords
)

$suspiciousFiles = @()
Get-ChildItem -Path . -Include *.js,*.mjs,*.ts,*.tsx,*.jsx -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules|dist|build|\.git" } | 
    ForEach-Object {
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        foreach ($pattern in $secretPatterns) {
            if ($content -match $pattern) {
                $suspiciousFiles += $_.FullName
                break
            }
        }
    }

if ($suspiciousFiles.Count -eq 0) {
    Write-Host "✅ No obvious hardcoded secrets found" -ForegroundColor Green
} else {
    $issues += "❌ Found potential hardcoded secrets in:"
    foreach ($file in $suspiciousFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
}

# Check 4: Firebase service account keys
Write-Host "`n📋 Checking Firebase service account keys..." -ForegroundColor Yellow
$serviceAccountFiles = Get-ChildItem -Path . -Filter "*serviceAccount*.json" -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "node_modules|dist|build|\.git" }

if ($serviceAccountFiles.Count -eq 0) {
    Write-Host "✅ No service account JSON files found in repo" -ForegroundColor Green
} else {
    foreach ($file in $serviceAccountFiles) {
        try {
            $gitStatus = git status --porcelain $file.FullName 2>&1
            if ($gitStatus) {
                $issues += "❌ Service account file tracked by Git: $($file.FullName)"
                Write-Host "   Run: git rm --cached `"$($file.FullName)`"" -ForegroundColor Red
            } else {
                Write-Host "✅ Service account file exists but not tracked: $($file.Name)" -ForegroundColor Green
            }
        } catch {
            $warnings += "⚠️  Found service account file: $($file.FullName)"
        }
    }
}

# Check 5: GitHub repository visibility (if possible)
Write-Host "`n📋 Checking GitHub repository status..." -ForegroundColor Yellow
try {
    $remote = git remote get-url origin 2>&1
    if ($remote -match "github\.com[:/]([^/]+)/([^/.]+)") {
        $owner = $Matches[1]
        $repo = $Matches[2] -replace "\.git$", ""
        Write-Host "   Repository: $owner/$repo" -ForegroundColor Gray
        Write-Host "   URL: https://github.com/$owner/$repo" -ForegroundColor Gray
        Write-Host "   ⚠️  Manually verify that your repository is PRIVATE" -ForegroundColor Yellow
        Write-Host "   Go to: https://github.com/$owner/$repo/settings" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ℹ️  Could not detect GitHub repository" -ForegroundColor Gray
}

# Summary
Write-Host "`n" + ("="*70) -ForegroundColor Cyan
Write-Host "📊 Security Scan Summary" -ForegroundColor Cyan
Write-Host ("="*70) -ForegroundColor Cyan

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "`n🎉 ALL CHECKS PASSED! Your repository looks secure.`n" -ForegroundColor Green
} else {
    if ($issues.Count -gt 0) {
        Write-Host "`n🚨 CRITICAL ISSUES FOUND:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "   $issue" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n⚠️  WARNINGS:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   $warning" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n📚 Review SECURITY.md for detailed guidance`n" -ForegroundColor Cyan
}

# Exit code
if ($issues.Count -gt 0) {
    exit 1
} else {
    exit 0
}
