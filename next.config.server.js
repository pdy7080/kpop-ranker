/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // SSR 모드 (정적 export 대신 서버 사이드 렌더링)
  // output: 'export' 제거 - 동적 라우트 지원을 위해
  
  trailingSlash: true,
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
  
  // 페이지 확장자 설정
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://api.kpopranker.chargeapp.net'
      : 'http://localhost:5000'
  },
  
  // 웹팩 설정
  webpack: (config, { isServer }) => {
    // 클라이언트 사이드에서 fs 등 Node.js 모듈 사용 방지
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // 백업 파일들 빌드에서 제외
    config.module.rules.push({
      test: /.*(_backup_|_broken_|_old|\.backup|\.old).*\.(tsx?|jsx?)$/,
      use: 'null-loader'
    });
    
    return config;
  }
}

module.exports = nextConfig