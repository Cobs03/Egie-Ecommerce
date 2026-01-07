# Better script to remove console statements without breaking syntax
Write-Host "Starting careful console cleanup..." -ForegroundColor Cyan

$srcPath = ".\src"
$filesModified = 0

# Get all JS/JSX files
$files = Get-ChildItem -Path $srcPath -Include @("*.js", "*.jsx") -Recurse -File

foreach ($file in $files) {
    $modified = $false
    $lines = Get-Content $file.FullName
    $newLines = @()
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Skip lines that are pure console statements
        if ($line -match '^\s*console\.(log|error|warn|debug|info)\([^;]*\);?\s*$') {
            $modified = $true
            continue
        }
        
        $newLines += $line
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $newLines
        $filesModified++
        Write-Host "Cleaned: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "Cleanup Complete!"
Write-Host "Files Modified: $filesModified"
Write-Host "========================================"
