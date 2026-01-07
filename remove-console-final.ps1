# PowerShell script to remove console.log statements from JavaScript/JSX files
# This version is more careful to preserve code integrity

$sourceDir = ".\src"
$filesProcessed = 0
$statementsRemoved = 0

Write-Host "Starting console.log removal..." -ForegroundColor Cyan
Write-Host "Target directory: $sourceDir" -ForegroundColor Yellow
Write-Host ""

# Get all JS and JSX files
$files = Get-ChildItem -Path $sourceDir -Include *.js,*.jsx -Recurse -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanged = $false
    $removedCount = 0
    
    # Pattern 1: Remove standalone console.log lines (most common case)
    # Matches: console.log(...); or just console.log(...) on its own line
    $pattern1 = '(?m)^[ \t]*console\.log\([^)]*\);?\s*[\r\n]+'
    if ($content -match $pattern1) {
        $matches = [regex]::Matches($content, $pattern1)
        $removedCount += $matches.Count
        $content = $content -replace $pattern1, ''
        $fileChanged = $true
    }
    
    # Pattern 2: Remove commented console.log lines  
    # Matches: // console.log(...)
    $pattern2 = '(?m)^[ \t]*//[ \t]*console\.log\([^)]*\);?\s*[\r\n]+'
    if ($content -match $pattern2) {
        $matches = [regex]::Matches($content, $pattern2)
        $removedCount += $matches.Count
        $content = $content -replace $pattern2, ''
        $fileChanged = $true
    }
    
    if ($fileChanged) {
        # Write the modified content back
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesProcessed++
        $statementsRemoved += $removedCount
        
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
        Write-Host "[OK] $relativePath - Removed $removedCount statement(s)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "Files Modified: $filesProcessed" -ForegroundColor Yellow
Write-Host "Statements Removed: $statementsRemoved" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
