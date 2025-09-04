import React, { Suspense, lazy } from 'react';

// Lazy Loading 컴포넌트들
const ArtistHeader = lazy(() => import('./components/ArtistHeader'));
const ArtistTabs = lazy(() => import('./components/ArtistTabs'));
const ArtistOverview = lazy(() => import('./components/ArtistOverview'));
const ArtistTracks = lazy(() => import('./components/ArtistTracks'));

// 이미지 Lazy Loading 컴포넌트
interface LazyImageProps {
  artist: string;
  track?: string;
  className?: string;
  shape?: 'square' | 'circle';
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  artist, 
  track, 
  className = "",
  shape = "square"
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [src, setSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!artist) return;

    // Intersection Observer로 이미지가 뷰포트에 들어올 때만 로드
    const img = new Image();
    const handleLoad = () => {
      setIsLoaded(true);
      setHasError(false);
    };
    const handleError = () => {
      setHasError(true);
      setIsLoaded(false);
    };

    img.onload = handleLoad;
    img.onerror = handleError;

    if (track) {
      img.src = `/api/album-image-smart/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
    } else {
      img.src = `/api/album-image-smart/${encodeURIComponent(artist)}/default`;
    }

    setSrc(img.src);
  }, [artist, track]);

  if (hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ${
        shape === 'circle' ? 'rounded-full' : 'rounded-lg'
      }`}>
        <span className="text-white text-2xl">🎵</span>
      </div>
    );
  }

  return (
    <div className={`${className} ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} overflow-hidden bg-gray-800`}>
      {!isLoaded && (
        <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse" />
      )}
      {src && (
        <img
          src={src}
          alt={`${artist}${track ? ` - ${track}` : ''}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

// 스켈레톤 UI 컴포넌트
const ArtistSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
    <div className="container mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row items-center gap-12">
        {/* 아티스트 이미지 스켈레톤 */}
        <div className="w-80 h-80 bg-gray-700 rounded-2xl animate-pulse" />
        
        {/* 아티스트 정보 스켈레톤 */}
        <div className="flex-1 space-y-6">
          <div className="h-16 bg-gray-700 rounded-lg animate-pulse w-3/4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
    {/* 탭 스켈레톤 */}
    <div className="container mx-auto px-4">
      <div className="h-12 bg-gray-800 rounded-lg animate-pulse mb-8" />
      <div className="grid grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

// 트랙 카드 스켈레톤
const TrackSkeleton = () => (
  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
    <div className="flex gap-4 mb-4">
      <div className="w-16 h-16 bg-gray-700 rounded-lg animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-800 rounded animate-pulse w-1/2" />
      </div>
    </div>
    <div className="flex gap-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-6 w-12 bg-gray-700 rounded-full animate-pulse" />
      ))}
    </div>
  </div>
);

// Virtual List 컴포넌트 (대량 트랙 처리)
interface VirtualTrackListProps {
  tracks: any[];
  onTrackClick: (track: any) => void;
}

const VirtualTrackList: React.FC<VirtualTrackListProps> = ({ tracks, onTrackClick }) => {
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 20 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      const itemHeight = 200; // 예상 트랙 카드 높이
      const containerHeight = containerRef.current.clientHeight;
      
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 5, tracks.length);
      
      setVisibleRange({ start, end });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // 초기 실행
      
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [tracks.length]);

  const visibleTracks = tracks.slice(visibleRange.start, visibleRange.end);

  return (
    <div ref={containerRef} className="h-96 overflow-y-auto">
      <div style={{ height: visibleRange.start * 200 }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleTracks.map((track, idx) => (
          <div
            key={`${track.title}-${visibleRange.start + idx}`}
            onClick={() => onTrackClick(track)}
            className="group bg-gray-800/50 backdrop-blur rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer border border-gray-700 hover:border-purple-500"
          >
            <div className="flex gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0">
                <LazyImage
                  artist={track.artist || ''}
                  track={track.title}
                  className="w-full h-full"
                  shape="square"
                />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-bold text-white mb-1 truncate group-hover:text-purple-300 transition-colors">
                  {track.title}
                </h4>
                {track.best_rank && (
                  <div className="text-yellow-400 text-sm font-medium">
                    최고 #{track.best_rank}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: (tracks.length - visibleRange.end) * 200 }} />
    </div>
  );
};

export { LazyImage, ArtistSkeleton, TrackSkeleton, VirtualTrackList };