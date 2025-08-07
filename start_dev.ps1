# KPOP Ranker Quick Start Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KPOP Ranker - Quick Start" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\project\ai07_배포\frontend"

Write-Host "[1] Current directory:" -ForegroundColor Green
Get-Location
Write-Host ""

Write-Host "[2] Starting development server..." -ForegroundColor Green
Write-Host "Server will run on http://localhost:3007" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Red
Write-Host ""

npm run dev
