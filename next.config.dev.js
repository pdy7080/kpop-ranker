/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // 개발 환경에서만 프록시 사용
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*',
        },
      ];
    }
    return [];
  },
  
  // 페이지 확장자 설정
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
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