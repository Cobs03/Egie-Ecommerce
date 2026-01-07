# Script to remove console.log, console.error, console.warn, console.debug statements
# from all JavaScript/JSX files in the Egie-Ecommerce project

Write-Host "Starting to clean console statements from Egie-Ecommerce..." -ForegroundColor Cyan

$srcPath = ".\src"
$fileTypes = @("*.js", "*.jsx", "*.ts", "*.tsx")
$removedCount = 0
$filesModified = 0

# Get all JS/JSX/TS/TSX files
$files = Get-ChildItem -Path $srcPath -Include $fileTypes -Recurse -File

foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)" -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove console.log statements (single and multi-line)
    $content = $content -replace "console\.log\([^)]*\);?\s*\n?", ""
    
    # Remove console.error statements
    $content = $content -replace "console\.error\([^)]*\);?\s*\n?", ""
    
    # Remove console.warn statements
    $content = $content -replace "console\.warn\([^)]*\);?\s*\n?", ""
    
    # Remove console.debug statements
    $content = $content -replace "console\.debug\([^)]*\);?\s*\n?", ""
    
    # Remove console.info statements
    $content = $content -replace "console\.info\([^)]*\);?\s*\n?", ""
    
    # Clean up multiple empty lines (more than 2 consecutive)
    $content = $content -replace "(\r?\n){3,}", "`n`n"
    
    # Only save if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesModified++
        Write-Host "Cleaned: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "Cleanup Complete!"
Write-Host "Files Modified: $filesModified"
Write-Host "========================================"
Write-Host ""
