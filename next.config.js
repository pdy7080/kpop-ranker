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
  
  // 페이지 확장자 설정 (_backup 폴더 제외)
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'tsx', 'ts', 'jsx', 'js'],
  
  // webpack 설정 (null-loader 제거, ignore-loader 사용)
  webpack: (config, { isServer }) => {
    // 백업 파일들을 빌드에서 제외 (null-loader 대신 무시)
    config.module.rules.push({
      test: /.*(_backup_|_broken_|_old|\.backup|\.old).*\.(tsx?|jsx?)$/,
      loader: 'ignore-loader'
    });
    
    return config;
  }
}

module.exports = nextConfig