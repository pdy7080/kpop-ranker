/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Pages Router 사용 (App Router 비활성화)
  experimental: {
    appDir: false
  },
  
  // 이미지 최적화 비활성화
  images: {
    unoptimized: true,
    domains: ['api.kpopranker.chargeapp.net', 'localhost']
  },
  
  // 타입 체크 무시
  typescript: {
    ignoreBuildErrors: true
  },
  
  // ESLint 무시
  eslint: {
    ignoreDuringBuilds: true
  },
  
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://api.kpopranker.chargeapp.net'
      : 'http://localhost:5000'
  },
  
  // 웹팩 설정
  webpack: (config, { isServer }) => {
    // 클라이언트에서 Node.js 모듈 폴백
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // 백업 파일 제외
    config.module.rules.push({
      test: /\.(bak|backup|old)$/,
      loader: 'ignore-loader',
    });
    
    return config;
  }
}

module.exports = nextConfig