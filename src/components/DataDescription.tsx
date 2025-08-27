import React from 'react';
import { Info, TrendingUp, BarChart3, Clock, Award } from 'lucide-react';

interface DataDescriptionProps {
  type: 'trend_score' | 'rank' | 'views' | 'chart_count' | 'weeks' | 'avg_rank';
  value?: number | string;
  className?: string;
}

const descriptions = {
  trend_score: {
    title: '트렌드 스코어',
    description: '차트 진입 수와 순위를 종합한 인기도 지표',
    formula: '(차트 수 × 10) + (101 - 최고순위)',
    icon: TrendingUp,
    color: 'text-purple-500'
  },
  rank: {
    title: '차트 순위',
    description: '각 음원 차트에서의 실시간 순위',
    formula: '1위가 가장 높은 순위',
    icon: Award,
    color: 'text-yellow-500'
  },
  views: {
    title: '조회수/스트리밍',
    description: 'YouTube 조회수 또는 스트리밍 횟수',
    formula: 'K=천, M=백만, B=10억',
    icon: BarChart3,
    color: 'text-blue-500'
  },
  chart_count: {
    title: '차트 진입 수',
    description: '동시에 진입한 음원 차트 개수',
    formula: '최대 8개 차트 (국내 5개, 해외 3개)',
    icon: BarChart3,
    color: 'text-green-500'
  },
  weeks: {
    title: '차트 체류 기간',
    description: '차트에 머문 총 주수',
    formula: '장기간 체류 = 꾸준한 인기',
    icon: Clock,
    color: 'text-cyan-500'
  },
  avg_rank: {
    title: '평균 순위',
    description: '모든 차트의 평균 순위',
    formula: '낮을수록 전체적으로 높은 순위',
    icon: TrendingUp,
    color: 'text-orange-500'
  }
};

export default function DataDescription({ type, value, className = '' }: DataDescriptionProps) {
  const desc = descriptions[type];
  if (!desc) return null;
  
  const Icon = desc.icon;
  
  return (
    <div className={`group relative inline-block ${className}`}>
      <Info className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="flex items-start gap-2">
          <Icon className={`w-5 h-5 ${desc.color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <h4 className="font-semibold text-white text-sm mb-1">{desc.title}</h4>
            <p className="text-xs text-gray-400 mb-2">{desc.description}</p>
            <div className="text-xs bg-gray-800 rounded px-2 py-1 font-mono">
              {desc.formula}
            </div>
            {value !== undefined && (
              <div className="mt-2 text-xs text-gray-500">
                현재 값: <span className="text-white font-semibold">{value}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="w-2 h-2 bg-gray-900 border-r border-b border-gray-700 transform rotate-45" />
        </div>
      </div>
    </div>
  );
}

// 컴포넌트 사용을 위한 헬퍼 함수
export function withDataDescription(
  label: string,
  value: number | string,
  type: DataDescriptionProps['type']
) {
  return (
    <div className="flex items-center gap-1">
      <span>{label}</span>
      <DataDescription type={type} value={value} />
    </div>
  );
}