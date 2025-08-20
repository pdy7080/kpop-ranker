module.exports = {
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en', 'ja', 'zh'],
    localeDetection: true,
  },
  fallbackLng: 'en',
  supportedLngs: ['ko', 'en', 'ja', 'zh'],
  
  // 언어별 폴백 설정
  fallbackLng: {
    'zh-TW': ['zh', 'en'],  // 대만 → 중국어 → 영어
    'default': ['en']
  },
  
  // 네임스페이스 설정
  ns: ['common', 'charts', 'search', 'portfolio'],
  defaultNS: 'common',
  
  // 디버그 모드 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',
  
  // 리소스 로딩 설정
  load: 'languageOnly',
  
  // 백엔드 설정 (정적 파일 사용)
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  
  // React 설정
  react: {
    useSuspense: false,
  },
  
  // 언어 감지 설정
  detection: {
    order: ['cookie', 'header', 'querystring', 'navigator'],
    caches: ['cookie'],
    cookieMinutes: 60 * 24 * 30, // 30일
    cookieDomain: 'kpop-ranker.vercel.app',
  },
};