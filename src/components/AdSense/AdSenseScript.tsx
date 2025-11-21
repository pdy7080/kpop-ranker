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

/**
 * 광고 카드 래퍼 컴포넌트
 * 다크 테마 사이트에 맞게 광고를 감싸는 스타일 카드
 */
interface AdCardProps {
  children: React.ReactNode;
  className?: string;
  showLabel?: boolean;
}

export function AdCard({ children, className = '', showLabel = true }: AdCardProps) {
  return (
    <div className={`my-8 flex justify-center ${className}`}>
      <div
        className="
          w-full max-w-[728px]
          rounded-2xl
          border border-white/10
          bg-[#0B0B10]/80
          backdrop-blur-sm
          px-4 py-3
          shadow-[0_8px_30px_rgba(0,0,0,0.4)]
        "
      >
        {showLabel && (
          <div className="text-xs text-white/30 mb-2 text-center">Sponsored</div>
        )}
        {children}
      </div>
    </div>
  );
}
