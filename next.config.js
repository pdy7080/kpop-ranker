/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
    return config;
  },
  // 환경 변수
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.kpopranker.chargeapp.net'
  }
}

module.exports = nextConfig
