/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
  }
}

module.exports = nextConfig