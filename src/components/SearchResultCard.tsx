// 검색 결과 카드 컴포넌트
import React from 'react';
import AlbumImage from './AlbumImage';

interface Track {
  artist: string;
  artist_normalized?: string;  // 정규화된 아티스트명
  track: string;
  rank: number | null;
  views: string;
  album_image: string;
}

interface SearchResultCardProps {
  chart: string;
  tracks: Track[];
  onArtistClick?: (artist: string) => void;
  onTrackClick?: (artist: string, track: string) => void;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ 
  chart, 
  tracks,
  onArtistClick,
  onTrackClick 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3">
        <h3 className="text-white font-semibold text-lg">{chart}</h3>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {tracks.map((track, index) => (
            <div 
              key={`${track.artist}-${track.track}-${index}`} 
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* 순위 */}
              {track.rank && (
                <div className="flex-shrink-0 w-12 text-center">
                  <span className="text-2xl font-bold text-gray-700">
                    {track.rank}
                  </span>
                </div>
              )}
              
              {/* 앨범 이미지 */}
              <div className="flex-shrink-0">
                <AlbumImage
                  src={track.album_image}
                  alt={`${track.artist} - ${track.track}`}
                  size="sm"
                  artist={track.artist}
                  track={track.track}
                />
              </div>
              
              {/* 트랙 정보 */}
              <div className="flex-grow">
                <div 
                  className="font-medium text-gray-900 cursor-pointer hover:text-purple-600"
                  onClick={() => onTrackClick?.(track.artist_normalized || track.artist, track.track)}
                >
                  {track.track}
                </div>
                <div 
                  className="text-sm text-gray-600 cursor-pointer hover:text-purple-600"
                  onClick={() => onArtistClick?.(track.artist_normalized || track.artist)}
                >
                  {track.artist}
                </div>
              </div>
              
              {/* 조회수/스트림 */}
              {track.views && (
                <div className="flex-shrink-0 text-sm text-gray-500">
                  {track.views}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResultCard;
