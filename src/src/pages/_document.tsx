import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ef5144" />
        <meta name="description" content="K-POP 팬들을 위한 차트 트래킹 & 포트폴리오 서비스" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
