/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // TypeScript 빌드 오류 무시
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint 오류 무시
  eslint: {
    ignoreDuringBuilds: true,
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
  
  // API 라우트 설정
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.kpopranker.chargeapp.net/api/:path*',
      },
    ];
  },
  
  // CORS 헤더 설정
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.kpopranker.chargeapp.net'
  }
}

module.exports = nextConfig
