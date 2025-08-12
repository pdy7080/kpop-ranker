import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* 기본 메타 태그 */}
        <meta charSet="utf-8" />
        
        {/* Open Graph 메타 태그 (카톡, 페이스북 등) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="KPOP FANfolio - 7개 차트 한 곳에서 확인" />
        <meta property="og:description" content="최애 아티스트의 글로벌 & 국내 차트 순위를 한눈에! Spotify, YouTube, Billboard, 멜론, 지니, 벅스를 한눈에 모니터링하세요." />
        <meta property="og:image" content="https://kpop-ranker.vercel.app/og-image.png" />
        <meta property="og:url" content="https://kpop-ranker.vercel.app" />
        <meta property="og:site_name" content="KPOP FANfolio" />
        <meta property="og:locale" content="ko_KR" />
        
        {/* 트위터 카드 메타 태그 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="KPOP FANfolio - 7개 차트 한 곳에서 확인" />
        <meta name="twitter:description" content="최애 아티스트의 글로벌 & 국내 차트 순위를 한눈에! 실시간 차트 모니터링 플랫폼" />
        <meta name="twitter:image" content="https://kpop-ranker.vercel.app/og-image.png" />
        
        {/* 네이버 메타 태그 */}
        <meta name="naver-site-verification" content="" />
        <meta name="description" content="K-POP 아티스트의 모든 차트 순위를 한 곳에서! 멜론, 지니, 벅스, Spotify, YouTube, Billboard 실시간 모니터링" />
        <meta name="keywords" content="KPOP,케이팝,차트,순위,멜론,지니,벅스,스포티파이,유튜브,빌보드,뉴진스,블랙핑크,세븐틴,스트레이키즈,에스파" />
        
        {/* 파비콘 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* 구글 폰트 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
