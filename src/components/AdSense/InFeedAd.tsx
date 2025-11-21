'use client';

import { useEffect, useRef } from 'react';

interface InFeedAdProps {
  adSlot: string;
  adLayout?: string;
  adLayoutKey?: string;
  className?: string;
}

/**
 * Google AdSense 인피드 광고
 * 콘텐츠 목록 중간에 자연스럽게 삽입되는 광고
 *
 * @param adSlot - AdSense 광고 단위 ID
 * @param adLayout - 광고 레이아웃 (기본: 'in-article')
 */
export default function InFeedAd({
  adSlot,
  adLayout = 'in-article',
  adLayoutKey,
  className = '',
}: InFeedAdProps) {
  const adInitialized = useRef(false);

  useEffect(() => {
    // 이미 초기화된 광고는 다시 로드하지 않음
    if (adInitialized.current) {
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adInitialized.current = true;
      }
    } catch (err) {
      console.error('AdSense InFeed error:', err);
    }
  }, []);

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  if (!publisherId) {
    console.warn('⚠️ NEXT_PUBLIC_ADSENSE_PUBLISHER_ID is not set');
    return null;
  }

  return (
    <div className={`adsense-infeed ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format="fluid"
        {...(adLayoutKey && { 'data-ad-layout-key': adLayoutKey })}
      />
    </div>
  );
}
