import React from 'react';
import ImageWithFallback from './ImageWithFallback';

interface AlbumImageProps {
  src?: string;  // 추가: 직접 URL 전달 가능
  artist: string;
  artistNormalized?: string;  // 정규화된 아티스트명 추가
  track?: string;
  size?: 'sm' | 'small' | 'md' | 'medium' | 'lg' | 'large' | 'xl' | 'xlarge';
  className?: string;
  priority?: boolean;
  shape?: 'square' | 'rounded' | 'circle';
  showArtistName?: boolean;
  onClick?: () => void;
  alt?: string;  // 추가: 커스텀 alt 텍스트
}

/**
 * 🎵 AlbumImage - KPOP Ranker 전용 앨범 이미지 컴포넌트 (개선)
 * 
 * Task 1-3 Step 3: 프론트엔드 이미지 컴포넌트 구현
 * 
 * 특징:
 * - /api/album-image/ API 전용 설계
 * - 팬덤 친화적 디자인 (둥근 모서리, 그림자 효과)
 * - 4단계 폴백 시스템으로 100% 이미지 표시 보장
 * - 모바일 반응형 지원
 * - K-POP 감성에 맞는 크기 및 스타일
 * - 정규화된 아티스트명 지원 (한글 → 영어 자동 변환)
 */
const AlbumImage: React.FC<AlbumImageProps> = ({
  src,
  artist,
  artistNormalized,  // 정규화된 아티스트명
  track = '',
  size = 'medium',
  className = '',
  priority = false,
  shape = 'rounded',
  showArtistName = false,
  onClick,
  alt
}) => {
  // 크기별 스타일 정의 (짧은 이름도 지원)
  const sizeStyles = {
    sm: { width: 48, height: 48, className: 'w-12 h-12' },
    small: { width: 48, height: 48, className: 'w-12 h-12' },
    md: { width: 64, height: 64, className: 'w-16 h-16' },
    medium: { width: 64, height: 64, className: 'w-16 h-16' },
    lg: { width: 96, height: 96, className: 'w-24 h-24' },
    large: { width: 96, height: 96, className: 'w-24 h-24' },
    xl: { width: 128, height: 128, className: 'w-32 h-32' },
    xlarge: { width: 128, height: 128, className: 'w-32 h-32' }
  };

  // 모양별 스타일 정의
  const shapeStyles = {
    square: '',
    rounded: 'rounded-lg',
    circle: 'rounded-full'
  };

  // 팬덤 감성 효과 (그림자, 호버 등)
  const fandomEffects = 'shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105';

  // 안전한 크기 가져오기 (기본값 처리)
  const currentSize = sizeStyles[size] || sizeStyles.medium;
  const currentShape = shapeStyles[shape] || shapeStyles.rounded;

  // 클릭 가능한 경우 추가 스타일
  const interactiveStyles = onClick ? 'cursor-pointer hover:brightness-110' : '';

  // 최종 클래스명 조합
  const finalClassName = `
    ${currentSize.className}
    ${currentShape}
    ${fandomEffects}
    ${interactiveStyles}
    ${className}
    overflow-hidden
    bg-gradient-to-br from-purple-100 to-pink-100
    border-2 border-white
  `.trim().replace(/\s+/g, ' ');

  // alt 텍스트 결정
  const altText = alt || (track ? `${artist} - ${track} 앨범 커버` : `${artist} 아티스트 이미지`);

  return (
    <div className="album-image-wrapper inline-block">
      <div
        className={finalClassName}
        onClick={onClick}
        title={track ? `${artist} - ${track}` : artist}
      >
        <ImageWithFallback
          src={src || ""} // src가 있으면 사용, 없으면 빈 문자열
          alt={altText}
          artistName={artist}
          artistNameNormalized={artistNormalized}  // 정규화된 이름 전달
          trackName={track}
          width={currentSize.width}
          height={currentSize.height}
          className="w-full h-full object-cover"
          priority={priority}
          unoptimized={true}
        />
      </div>
      
      {/* 아티스트명 표시 옵션 */}
      {showArtistName && (
        <div className="mt-2 text-center">
          <div className="text-sm font-semibold text-gray-800 truncate">
            {artist}
          </div>
          {track && (
            <div className="text-xs text-gray-600 truncate">
              {track}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumImage;
