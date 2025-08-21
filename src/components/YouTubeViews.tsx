import React from 'react';

interface YouTubeViewsProps {
  views: string | number | undefined;
  className?: string;
  showIcon?: boolean;
}

// 조회수 포맷팅 함수
export const formatViews = (views: string | number | undefined): string => {
  if (!views || views === '0' || views === '') return '';
  
  try {
    const num = typeof views === 'string' ? parseInt(views) : views;
    if (isNaN(num)) return '';
    
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  } catch {
    return '';
  }
};

const YouTubeViews: React.FC<YouTubeViewsProps> = ({ 
  views, 
  className = '', 
  showIcon = true 
}) => {
  const formattedViews = formatViews(views);
  
  if (!formattedViews) return null;
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && (
        <svg 
          className="w-4 h-4 text-red-500" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
        </svg>
      )}
      <span className="font-medium">{formattedViews} views</span>
    </div>
  );
};

export default YouTubeViews;
