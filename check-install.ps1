# Script to check if npm install is complete and start server
Write-Host "Checking npm installation..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "✗ node_modules not found - npm install needed" -ForegroundColor Red
    exit 1
}

if (Test-Path "package-lock.json") {
    Write-Host "✓ package-lock.json exists" -ForegroundColor Green
} else {
    Write-Host "✗ package-lock.json not found - npm install still running" -ForegroundColor Yellow
    exit 2
}

# Try to run next --version to verify installation
try {
    $nextVersion = npx next --version 2>&1
    Write-Host "✓ Next.js is installed: $nextVersion" -ForegroundColor Green
    
    Write-Host "`nStarting development server on port 8009..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow
    
    npm run dev:8009
} catch {
    Write-Host "✗ Next.js not found in node_modules" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 3
}