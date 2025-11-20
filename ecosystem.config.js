/**
 * PM2 Ecosystem Configuration for KPOP Ranker Frontend
 *
 * 기존 서버 환경:
 *   - kpop-backend (FastAPI)
 *   - kpop-ultimate-v21 (스케줄러/크롤러)
 *   - kpop-ai-scheduler
 *   - autobid 서비스들
 *
 * 포트 충돌 방지:
 *   - Frontend: 3007 (개발 시와 동일)
 *   - Backend API: 8000 (기존 kpop-backend)
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart kpop-ranker-frontend
 *   pm2 logs kpop-ranker-frontend
 *   pm2 stop kpop-ranker-frontend
 */

module.exports = {
  apps: [
    {
      name: 'kpop-ranker-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/chargeap/kpopranker',
      instances: 1,
      exec_mode: 'fork',

      // 환경 변수
      env: {
        NODE_ENV: 'production',
        PORT: 3007,  // 개발 시와 동일한 포트, 기존 서비스와 충돌 방지
        HOSTNAME: '0.0.0.0',  // 외부 접근 허용

        // API 엔드포인트 (기존 백엔드 연동)
        NEXT_PUBLIC_API_URL: 'https://api.kpopranker.chargeapp.net',
      },

      // 재시작 설정
      watch: false,
      max_memory_restart: '500M',  // 다중 서비스 환경 고려

      // 로그 설정
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // 재시작 정책
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,  // 재시작 시 3초 대기

      // 크론 재시작 (매일 새벽 4시 - 백엔드 스케줄러와 충돌 방지)
      cron_restart: '0 4 * * *',

      // 우아한 종료
      kill_timeout: 5000,
      wait_ready: true,
    },
  ],
};
