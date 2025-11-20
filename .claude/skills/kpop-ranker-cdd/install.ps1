# 🚀 K-POP Ranker CDD 스킬 - 자동 설치 스크립트
# Windows PowerShell

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎵 K-POP Ranker CDD 스킬 설치" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 소스 경로
$sourcePath = "C:\project\kpopranker-v2\.claude\skills\kpop-ranker-cdd"

# 목적지 경로
$destPath = "$env:APPDATA\Claude\skills\kpop-ranker-cdd"

# 1. 소스 확인
Write-Host "📦 1. 소스 확인 중..." -ForegroundColor Yellow
if (-not (Test-Path $sourcePath)) {
    Write-Host "  ❌ 소스 폴더를 찾을 수 없습니다: $sourcePath" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ 소스 확인 완료" -ForegroundColor Green
Write-Host ""

# 2. Claude 폴더 확인
Write-Host "📁 2. Claude 폴더 확인 중..." -ForegroundColor Yellow
$claudePath = "$env:APPDATA\Claude"
if (-not (Test-Path $claudePath)) {
    Write-Host "  ❌ Claude 폴더를 찾을 수 없습니다" -ForegroundColor Red
    Write-Host "     Claude Desktop이 설치되어 있나요?" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✅ Claude 폴더 확인 완료" -ForegroundColor Green
Write-Host ""

# 3. skills 폴더 생성
Write-Host "📂 3. skills 폴더 생성 중..." -ForegroundColor Yellow
$skillsPath = "$env:APPDATA\Claude\skills"
if (-not (Test-Path $skillsPath)) {
    New-Item -ItemType Directory -Path $skillsPath -Force | Out-Null
    Write-Host "  ✅ skills 폴더 생성 완료" -ForegroundColor Green
} else {
    Write-Host "  ✅ skills 폴더 이미 존재" -ForegroundColor Green
}
Write-Host ""

# 4. 기존 스킬 백업 (있다면)
Write-Host "💾 4. 기존 스킬 확인 중..." -ForegroundColor Yellow
if (Test-Path $destPath) {
    $backupPath = "$destPath.backup." + (Get-Date -Format "yyyyMMdd_HHmmss")
    Copy-Item -Path $destPath -Destination $backupPath -Recurse -Force
    Write-Host "  ✅ 기존 스킬 백업: $backupPath" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ 신규 설치" -ForegroundColor Green
}
Write-Host ""

# 5. 스킬 복사
Write-Host "📋 5. 스킬 복사 중..." -ForegroundColor Yellow
Copy-Item -Path $sourcePath -Destination $skillsPath -Recurse -Force
Write-Host "  ✅ 스킬 복사 완료" -ForegroundColor Green
Write-Host ""

# 6. 설치 확인
Write-Host "🔍 6. 설치 확인 중..." -ForegroundColor Yellow
$skillFile = Join-Path $destPath "SKILL.md"
if (Test-Path $skillFile) {
    $fileSize = (Get-Item $skillFile).Length
    Write-Host "  ✅ SKILL.md 확인 ($fileSize bytes)" -ForegroundColor Green
} else {
    Write-Host "  ❌ SKILL.md를 찾을 수 없습니다" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 7. 완료
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎊 K-POP Ranker CDD 스킬 설치 완료!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "📍 설치 위치:" -ForegroundColor Yellow
Write-Host "   $destPath" -ForegroundColor White
Write-Host ""

Write-Host "🚀 다음 단계:" -ForegroundColor Yellow
Write-Host "   1. Claude Desktop 재시작" -ForegroundColor White
Write-Host "   2. 새 대화창 열기" -ForegroundColor White
Write-Host "   3. 테스트: @kpop-ranker-cdd 오늘 작업을 시작해줘" -ForegroundColor White
Write-Host ""

Write-Host "💡 주요 명령어:" -ForegroundColor Cyan
Write-Host "   @kpop-ranker-cdd 오늘 작업을 시작해줘" -ForegroundColor DarkGray
Write-Host "   @kpop-ranker-cdd Task 5.1을 개발해줘" -ForegroundColor DarkGray
Write-Host "   @kpop-ranker-cdd 변경사항을 커밋해줘" -ForegroundColor DarkGray
Write-Host "   @kpop-ranker-cdd 오늘 작업을 마무리해줘" -ForegroundColor DarkGray
Write-Host ""

Write-Host "📚 자세한 사용법:" -ForegroundColor Cyan
Write-Host "   C:\project\kpopranker-v2\.claude\skills\kpop-ranker-cdd\INSTALL.md" -ForegroundColor DarkGray
Write-Host ""

# 8. Claude 재시작 제안
Write-Host "❓ Claude Desktop을 지금 재시작할까요? (Y/N): " -ForegroundColor Yellow -NoNewline
$restart = Read-Host

if ($restart -eq "Y" -or $restart -eq "y") {
    Write-Host ""
    Write-Host "🔄 Claude Desktop 재시작 중..." -ForegroundColor Yellow
    
    # Claude 프로세스 종료
    $claudeProcess = Get-Process -Name "Claude" -ErrorAction SilentlyContinue
    if ($claudeProcess) {
        Stop-Process -Name "Claude" -Force
        Write-Host "  ✅ Claude Desktop 종료 완료" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
    
    # Claude 실행 경로 찾기
    $claudeExe = "$env:LOCALAPPDATA\Programs\Claude\Claude.exe"
    if (Test-Path $claudeExe) {
        Start-Process $claudeExe
        Write-Host "  ✅ Claude Desktop 재시작 완료" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 스킬 사용 준비 완료!" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Claude.exe를 찾을 수 없습니다" -ForegroundColor Yellow
        Write-Host "     수동으로 Claude Desktop을 재시작해주세요" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "⚠️  Claude Desktop을 수동으로 재시작해주세요" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
