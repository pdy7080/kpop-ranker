/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // SSR 모드로 변경 (정적 빌드 비활성화)
  // output: 'export',  // 주석 처리하여 SSR 모드로 전환
  trailingSlash: true,
  images: { 
    unoptimized: true 
  },
  
  // 타입 체크 무시
  typescript: {
    ignoreBuildErrors: true
  },
  
  // ESLint 무시
  eslint: {
    ignoreDuringBuilds: true
  },
  
  // exportPathMap 제거 (SSR 모드에서는 불필요)
  // exportPathMap은 static export에서만 사용됨
  
  // 페이지 확장자 설정 (_backup 폴더 제외)
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'tsx', 'ts', 'jsx', 'js'],
  
  // 특정 폴더 제외
  excludeFiles: ['**/_backup/**', '**/*.backup.*', '**/*.old.*'],
  
  // 특정 파일 패턴 제외
  webpack: (config, { isServer }) => {
    // 백업 파일들 빌드에서 제외
    config.module.rules.push({
      test: /.*(_backup_|_broken_|_old|\.backup|\.old).*\.(tsx?|jsx?)$/,
      use: 'null-loader'
    });
    
    return config;
  }
}

module.exports = nextConfig