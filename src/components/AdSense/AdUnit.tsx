'use client';

import { useEffect } from 'react';

interface AdUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle';
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Google AdSense 디스플레이 광고 단위
 *
 * @param adSlot - AdSense 광고 단위 ID
 * @param adFormat - 광고 형식 (기본: 'auto')
 * @param fullWidthResponsive - 반응형 광고 활성화 (기본: true)
 */
export default function AdUnit({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style,
  className = '',
}: AdUnitProps) {
  useEffect(() => {
    try {
      // AdSense 광고 초기화
      if (typeof window !== 'undefined') {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  if (!publisherId) {
    console.warn('⚠️ NEXT_PUBLIC_ADSENSE_PUBLISHER_ID is not set');
    return null;
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
