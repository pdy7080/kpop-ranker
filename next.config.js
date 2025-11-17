/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  
  // 🚀 이미지 최적화 설정 (Next.js 14 호환)
  images: {
    unoptimized: false, // Next.js 이미지 최적화 활성화
    domains: [
      'localhost',
      'api.kpopranker.chargeapp.net',
      'kpop-ranker.vercel.app',
      'kpopranker.vercel.app',
      'www.kpopranker.com'
    ],
    formats: ['image/webp', 'image/avif'], // 최신 이미지 포맷 지원
    minimumCacheTTL: 86400, // 24시간 캐시
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // 📱 반응형 크기 설정
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    
    // 🔧 추가 최적화 설정
    loader: 'default',
    path: '/_next/image',
  },
  
  // 타입 체크 무시
  typescript: {
    ignoreBuildErrors: true
  },
  
  // ESLint 무시
  eslint: {
    ignoreDuringBuilds: true
  },
  
  // 페이지 확장자 설정
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'tsx', 'ts', 'jsx', 'js'],
  
  // API 프록시 설정 추가
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*'
      }
    ]
  },

  // SSG 제외 페이지 (admin 페이지는 동적 렌더링)
  experimental: {
    // admin 페이지 SSG 비활성화
    excludePaths: ['/admin/**']
  }
}

module.exports = nextConfig