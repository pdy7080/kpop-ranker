import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'recharts';
import { Activity, Users, Globe, Music } from 'lucide-react';

interface MarketPulseProps {
  className?: string;
}

export default function MarketPulse({ className = '' }: MarketPulseProps) {
  const [pulse, setPulse] = useState({
    activeUsers: 0,
    totalStreams: 0,
    globalReach: 0,
    newReleases: 0
  });

  useEffect(() => {
    // 실시간 시뮬레이션 (실제로는 API 호출)
    const interval = setInterval(() => {
      setPulse(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 100),
        totalStreams: prev.totalStreams + Math.floor(Math.random() * 1000),
        globalReach: Math.min(100, prev.globalReach + Math.random() * 2),
        newReleases: prev.newReleases + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 3000);

    // 초기값 설정
    setPulse({
      activeUsers: 15420,
      totalStreams: 2847300,
      globalReach: 78,
      newReleases: 24
    });

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      label: '활성 사용자',
      value: pulse.activeUsers.toLocaleString(),
      icon: <Users className="w-4 h-4" />,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      label: '총 스트리밍',
      value: `${(pulse.totalStreams / 1000000).toFixed(1)}M`,
      icon: <Activity className="w-4 h-4" />,
      color: 'from-green-500 to-emerald-500',
      change: '+8%'
    },
    {
      label: '글로벌 도달',
      value: `${pulse.globalReach.toFixed(0)}%`,
      icon: <Globe className="w-4 h-4" />,
      color: 'from-purple-500 to-pink-500',
      change: '+5%'
    },
    {
      label: '신규 릴리즈',
      value: pulse.newReleases,
      icon: <Music className="w-4 h-4" />,
      color: 'from-orange-500 to-red-500',
      change: 'Today'
    }
  ];

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Market Pulse</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="relative group"
          >
            <div className="relative overflow-hidden rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-4 hover:border-gray-600 transition-all">
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} bg-opacity-20`}>
                    {metric.icon}
                  </div>
                  <span className="text-xs text-gray-400">{metric.change}</span>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
                  <p className="text-xl font-bold text-white">{metric.value}</p>
                </div>
              </div>

              {/* Pulse Animation */}
              <motion.div
                className={`absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br ${metric.color} rounded-full blur-2xl opacity-20`}
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Market Activity Graph (placeholder) */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <h3 className="text-sm font-medium text-gray-400 mb-3">24시간 활동 추이</h3>
        <div className="h-24 flex items-end justify-between gap-1">
          {Array.from({ length: 24 }, (_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-blue-500/50 to-cyan-500/50 rounded-t"
              initial={{ height: '10%' }}
              animate={{ height: `${30 + (i * 2.5)}%` }}
              transition={{ duration: 0.5, delay: i * 0.02 }}
              style={{ minHeight: '10%' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}