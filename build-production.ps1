Set-Location "C:\project\ai07\kpop-frontend-v2"
$env:NODE_ENV = "production"
Write-Host "Building KPOP Ranker Frontend for Production..." -ForegroundColor Green
npm run build
Write-Host "Build completed!" -ForegroundColor Green
Read-Host "Press Enter to exit"