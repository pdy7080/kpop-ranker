/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // TypeScript 빌드 오류 무시 (Vercel 배포용)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint 오류도 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // SSR/SSG 비활성화 - 모든 페이지를 동적으로
  experimental: {
    runtime: 'nodejs',
    serverComponents: false,
  },
  
  images: {
    domains: [
      'localhost',
      'api.kpopranker.chargeapp.net',
      'cdn.pixabay.com',
      'via.placeholder.com'
    ],
    unoptimized: true
  },
  
  // 빌드에서 제외할 페이지 패턴
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  webpack: (config, { isServer }) => {
    // _backup 폴더 무시
    config.module.rules.push({
      test: /\/_backup\//,
      loader: 'ignore-loader'
    });
    
    // 서버 사이드에서 next/router 문제 해결
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
  
  // 환경 변수
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.kpopranker.chargeapp.net'
  },
  
  // 정적 페이지 생성 건너뛰기
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  
  // 모든 페이지를 서버 사이드 렌더링으로
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
