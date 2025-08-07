/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // SSR 모드 - output: 'export' 제거
  // output: 'export',  // 이 줄을 제거하여 SSR 모드로 변경
  
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
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // 특정 파일 패턴 제외
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
    
    // 백업 파일들 빌드에서 제외
    config.module.rules.push({
      test: /.*(_backup_|_broken_|_old|\.backup|\.old).*\.(tsx?|jsx?)$/,
      use: 'null-loader'
    });
    
    return config;
  }
}

module.exports = nextConfig