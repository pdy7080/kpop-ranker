import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'KPOP FANfolio - 나만의 K-POP 포트폴리오',
  description = 'K-POP 아티스트의 실시간 차트 순위를 확인하고, 나만의 포트폴리오를 만들어보세요. AI 기반 인사이트와 트렌드 분석을 제공합니다.',
  keywords = 'K-POP, 케이팝, 차트, 순위, 포트폴리오, 아이돌, 음원차트, Spotify, Melon, YouTube, BTS, NewJeans, SEVENTEEN',
  image = 'https://kpopranker.chargeapp.net/og-default.png',
  url = 'https://kpopranker.chargeapp.net',
  type = 'website',
  author = 'KPOP FANfolio Team',
  publishedTime
}) => {
  const siteName = 'KPOP FANfolio';
  const twitterHandle = '@kpopfanfolio';

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="ko_KR" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Mobile App Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="KPOP FANfolio" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#EF4444" />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: siteName,
            description: description,
            url: url,
            applicationCategory: 'EntertainmentApplication',
            genre: 'Music',
            browserRequirements: 'Requires JavaScript. Requires HTML5.',
            softwareVersion: '2.0',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'KRW'
            },
            author: {
              '@type': 'Organization',
              name: author
            }
          })
        }}
      />
    </Head>
  );
};

export default SEO;
