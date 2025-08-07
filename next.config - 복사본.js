/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 완전한 클라이언트 사이드 렌더링으로 전환
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // 이미지 최적화 비활성화 (CSR 모드에서 필요)
  images: {
    unoptimized: true,
    domains: ['api.kpopranker.chargeapp.net']
  },
  
  // 컴파일러 설정
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // 실험적 기능들 비활성화
  experimental: {
    optimizeCss: false
  },
  
  // 빌드 시 정적 파일로 export
  distDir: 'out',
  
  // 웹팩 설정으로 불필요한 파일 제외
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  }
}

module.exports = nextConfig
