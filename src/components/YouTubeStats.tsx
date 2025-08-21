// components/YouTubeStats.tsx
// YouTube 조회수 표시 컴포넌트

import { useEffect, useState } from 'react';
import { FaYoutube, FaThumbsUp, FaComment, FaEye } from 'react-icons/fa';

interface YouTubeMetadata {
  video_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration: string;
  published_at: string;
}

interface YouTubeStatsProps {
  artist: string;
  track: string;
}

export default function YouTubeStats({ artist, track }: YouTubeStatsProps) {
  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYouTubeData();
  }, [artist, track]);

  const fetchYouTubeData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/youtube/metadata/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setMetadata(data);
      }
    } catch (error) {
      console.error('Failed to fetch YouTube data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-24 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (!metadata) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <FaYoutube className="text-2xl" />
        <h3 className="text-lg font-semibold">YouTube 통계</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <FaEye className="mx-auto mb-2 text-xl" />
          <div className="text-2xl font-bold">{formatNumber(metadata.view_count)}</div>
          <div className="text-xs opacity-80">조회수</div>
        </div>
        
        <div className="text-center">
          <FaThumbsUp className="mx-auto mb-2 text-xl" />
          <div className="text-2xl font-bold">{formatNumber(metadata.like_count)}</div>
          <div className="text-xs opacity-80">좋아요</div>
        </div>
        
        <div className="text-center">
          <FaComment className="mx-auto mb-2 text-xl" />
          <div className="text-2xl font-bold">{formatNumber(metadata.comment_count)}</div>
          <div className="text-xs opacity-80">댓글</div>
        </div>
      </div>
      
      {metadata.video_id && (
        <a
          href={`https://youtube.com/watch?v=${metadata.video_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center bg-white text-red-600 py-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          YouTube에서 보기
        </a>
      )}
    </div>
  );
}
