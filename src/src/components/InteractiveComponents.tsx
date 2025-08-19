import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';
import { useRouter } from 'next/router';

// 3D 앨범 아트 컴포넌트
export const Album3D: React.FC<{ src: string; artist: string; title: string }> = ({ src, artist, title }) => {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    rotateX.set((-mouseY / rect.height) * 30);
    rotateY.set((mouseX / rect.width) * 30);
  };
  
  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };
  
  return (
    <motion.div
      ref={ref}
      className="relative w-64 h-64 cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <motion.div
        className="w-full h-full rounded-xl overflow-hidden"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        <ImageWithFallback
          src={src}
          alt={`${artist} - ${title}`}
          artistName={artist}
          trackName={title}
          className="w-full h-full"
          fill={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
          <div className="absolute bottom-4 left-4">
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <p className="text-white/80 text-sm">{artist}</p>
          </div>
        </div>
        <motion.div
          className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};

// 개선된 차트 레이스 애니메이션
export const ChartRace: React.FC<{ data: any[] }> = ({ data }) => {
  const router = useRouter();

  const handleTrackClick = (artist: string, title: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
  };

  return (
    <div className="glass-card rounded-xl p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
      {data && data.length > 0 ? (
        data.slice(0, 10).map((item, index) => (
          <motion.div
            key={item.id || index}
            className="flex items-center gap-4 mb-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
            initial={{ x: -100, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              transition: {
                delay: index * 0.05,
                type: 'spring',
                stiffness: 100
              }
            }}
            layout
            layoutId={`track-${item.id}`}
            onClick={() => handleTrackClick(item.artist, item.title)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 순위 */}
            <motion.div 
              className={`text-2xl font-bold min-w-[3rem] ${
                index === 0 ? 'text-yellow-400' :
                index === 1 ? 'text-gray-300' :
                index === 2 ? 'text-orange-400' :
                'text-purple-400'
              }`}
              animate={{ 
                scale: index === 0 ? [1, 1.1, 1] : 1,
              }}
              transition={{ 
                duration: 2, 
                repeat: index === 0 ? Infinity : 0 
              }}
            >
              #{index + 1}
            </motion.div>

            {/* 앨범 이미지 */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={item.albumImage || `/api/album-image-smart/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`}
                alt={`${item.artist} - ${item.title}`}
                artistName={item.artist}
                trackName={item.title}
                className="w-full h-full object-cover"
                width={48}
                height={48}
              />
            </div>

            {/* 트랙 정보 */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                {item.title || item.track}
              </h4>
              <p className="text-sm text-gray-400 truncate">
                {item.artist}
              </p>
            </div>

            {/* 트렌드 스코어 */}
            {item.trendingScore && (
              <div className="text-right">
                <div className="text-xs text-gray-500">스코어</div>
                <div className="text-lg font-bold text-purple-400">
                  {item.trendingScore}
                </div>
              </div>
            )}

            {/* 순위 변동 */}
            {item.change !== undefined && item.change !== 0 && (
              <motion.div
                className={`text-sm font-bold flex items-center gap-1 ${
                  item.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {item.change > 0 ? '↑' : '↓'} 
                <span>{Math.abs(item.change)}</span>
              </motion.div>
            )}
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>차트 데이터를 불러오는 중...</p>
        </div>
      )}
    </div>
  );
};

// 마우스 추적 그라데이션
export const MouseGradient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute w-96 h-96 rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--neon-purple) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          filter: 'blur(40px)',
          transition: 'all 0.3s ease-out',
        }}
      />
      {children}
    </div>
  );
};

// 파티클 효과
export const ParticleField: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    setMounted(true);
    // 클라이언트에서만 랜덤 값 생성
    setParticles(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 20 + 10,
      }))
    );
  }, []);

  // 서버 렌더링 중이거나 마운트되지 않았으면 빈 div 반환
  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// 음악 파형 비주얼라이저
export const WaveVisualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const bars = Array.from({ length: 40 }, (_, i) => i);
  
  return (
    <div className="flex items-end gap-1 h-20">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
          animate={{
            height: isPlaying ? [20, Math.random() * 60 + 20, 20] : 20,
          }}
          transition={{
            duration: Math.random() * 0.5 + 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default {
  Album3D,
  ChartRace,
  MouseGradient,
  ParticleField,
  WaveVisualizer,
};
