# ScanMyCar Infrastructure Global Purge Script
# This script forcefully terminates all node processes and clears caches to resolve environment variable staleness.

Write-Host "--- STANDBY: ScanMyCar Neural Network Purge Initiated ---" -ForegroundColor Cyan

# 1. Kill all Node processes
Write-Host "Step 1: Terminating all Node processes..." -ForegroundColor Yellow
try {
    $processes = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Host "Successfully terminated Node processes." -ForegroundColor Green
    } else {
        Write-Host "No active Node processes found." -ForegroundColor DarkGray
    }
} catch {
    Write-Host "Error terminating Node processes: $_" -ForegroundColor Red
}

# 2. Clear Next.js Caches
Write-Host "Step 2: Purging Next.js cached data..." -ForegroundColor Yellow
$nextDir = Join-Path (Get-Location) "frontend\.next"
if (Test-Path -Path $nextDir) {
    Remove-Item -Path $nextDir -Recurse -Force
    Write-Host "Successfully purged .next folder." -ForegroundColor Green
} else {
    Write-Host ".next folder not found. Skipping." -ForegroundColor DarkGray
}

# 3. Clear node_modules cache
Write-Host "Step 3: Purging node_modules cache..." -ForegroundColor Yellow
$nodeCache = Join-Path (Get-Location) "frontend\node_modules\.cache"
if (Test-Path -Path $nodeCache) {
    Remove-Item -Path $nodeCache -Recurse -Force
    Write-Host "Successfully purged node_modules/.cache." -ForegroundColor Green
} else {
    Write-Host "node_modules/.cache not found. Skipping." -ForegroundColor DarkGray
}

Write-Host "--- PURGE COMPLETE: Neural network is now clean ---" -ForegroundColor Cyan
Write-Host "MANDATORY ACTION: Start your terminal and run 'npm run dev' to initialize fresh." -ForegroundColor Cyan
