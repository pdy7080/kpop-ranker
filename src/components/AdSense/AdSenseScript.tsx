'use client';

import Script from 'next/script';

interface AdSenseScriptProps {
  publisherId: string;
}

/**
 * Google AdSense 스크립트 로드 컴포넌트
 * Root Layout에서 한 번만 사용
 */
export default function AdSenseScript({ publisherId }: AdSenseScriptProps) {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => console.log('✅ AdSense script loaded')}
      onError={() => console.error('❌ AdSense script failed to load')}
    />
  );
}
