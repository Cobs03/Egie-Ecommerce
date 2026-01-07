# PowerShell script to remove ALL console statements from JavaScript/JSX files
# Removes console.log, console.error, console.warn, console.info, console.debug, etc.

$sourceDir = ".\src"
$filesProcessed = 0
$statementsRemoved = 0

Write-Host "Starting ALL console statement removal..." -ForegroundColor Cyan
Write-Host "Target directory: $sourceDir" -ForegroundColor Yellow
Write-Host ""

# Get all JS and JSX files
$files = Get-ChildItem -Path $sourceDir -Include *.js,*.jsx -Recurse -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanged = $false
    $removedCount = 0
    
    # Pattern 1: Remove standalone console.* lines (most common case)
    # Matches: console.log(...); console.error(...); etc.
    $pattern1 = '(?m)^[ \t]*console\.\w+\([^)]*\);?\s*[\r\n]+'
    if ($content -match $pattern1) {
        $matches = [regex]::Matches($content, $pattern1)
        $removedCount += $matches.Count
        $content = $content -replace $pattern1, ''
        $fileChanged = $true
    }
    
    # Pattern 2: Remove multi-line console statements
    # Matches: console.log({ ... })
    $pattern2 = '(?m)^[ \t]*console\.\w+\([^;]*?\);?\s*[\r\n]+'
    if ($content -match $pattern2) {
        $matches = [regex]::Matches($content, $pattern2)
        $additionalRemoved = $matches.Count
        if ($additionalRemoved -gt $removedCount) {
            $removedCount = $additionalRemoved
            $content = $content -replace $pattern2, ''
            $fileChanged = $true
        }
    }
    
    # Pattern 3: Remove commented console statements
    # Matches: // console.log(...) or // console.error(...)
    $pattern3 = '(?m)^[ \t]*//[ \t]*console\.\w+\([^)]*\);?\s*[\r\n]+'
    if ($content -match $pattern3) {
        $matches = [regex]::Matches($content, $pattern3)
        $removedCount += $matches.Count
        $content = $content -replace $pattern3, ''
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
