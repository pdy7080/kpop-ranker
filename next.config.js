/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // 이미지: /api/album-image-v2/... (프록시 경유)만 쓰면 remotePatterns 없어도 됩니다.
  // 혹시 원격 URL을 직접 쓰는 컴포넌트가 있으면 아래 패턴 유지하세요.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.kpopranker.chargeapp.net', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '3007', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.pixabay.com', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' }
    ],
    unoptimized: false
  },

  // (선택) 환경변수 — 가능하면 Vercel Project Settings에서 관리 권장
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000'
        : 'https://api.kpopranker.chargeapp.net'
  }
};

module.exports = nextConfig;
