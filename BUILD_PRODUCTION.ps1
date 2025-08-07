# KPOP Ranker Production Build Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KPOP Ranker - Production Build" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\project\ai07\kpop-frontend-v2"

# Clean old builds
Write-Host "[1/4] Cleaning old builds..." -ForegroundColor Yellow
if (Test-Path "out") { Remove-Item -Path "out" -Recurse -Force }
if (Test-Path ".next") { Remove-Item -Path ".next" -Recurse -Force }

# Set environment
Write-Host ""
Write-Host "[2/4] Setting production environment..." -ForegroundColor Yellow
$env:NODE_ENV = "production"

# Build
Write-Host ""
Write-Host "[3/4] Building Next.js application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Export
Write-Host ""
Write-Host "[4/4] Exporting static files..." -ForegroundColor Yellow
npx next export

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Export failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "BUILD SUCCESS!" -ForegroundColor Green
Write-Host "Static files: C:\project\ai07\kpop-frontend-v2\out" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Show output directory
Get-ChildItem -Path "out" | Select-Object Name, Length, LastWriteTime

Write-Host ""
Read-Host "Press Enter to continue"
