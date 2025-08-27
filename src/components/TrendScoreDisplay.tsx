import React from 'react';
import DataDescription from '@/components/DataDescription';
import { TrendingUp } from 'lucide-react';

interface TrendScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDescription?: boolean;
}

export default function TrendScoreDisplay({ 
  score, 
  size = 'md', 
  showLabel = true,
  showDescription = true 
}: TrendScoreDisplayProps) {
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-purple-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-green-400';
    if (score >= 20) return 'text-yellow-400';
    return 'text-gray-400';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return '🔥 Hot';
    if (score >= 60) return '📈 Rising';
    if (score >= 40) return '✨ Popular';
    if (score >= 20) return '🎵 Active';
    return '🎶 New';
  };
  
  return (
    <div className="flex items-center gap-2">
      <TrendingUp className={`w-4 h-4 ${getScoreColor(score)}`} />
      <div className="flex items-center gap-1">
        {showLabel && (
          <span className="text-xs text-gray-400">트렌드</span>
        )}
        <span className={`font-bold ${sizeClasses[size]} ${getScoreColor(score)}`}>
          {score}
        </span>
        {showDescription && (
          <DataDescription type="trend_score" value={score} />
        )}
        <span className="text-xs ml-1">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}