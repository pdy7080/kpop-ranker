import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

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
        <img src={src} alt={`${artist} - ${title}`} className="w-full h-full object-cover" />
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

// 차트 레이스 애니메이션
export const ChartRace: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="race-track rounded-xl p-4">
      {data.map((item, index) => (
        <motion.div
          key={item.id}
          className="flex items-center gap-4 mb-3 glass-card p-3 rounded-lg"
          initial={{ x: -100, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            transition: {
              delay: index * 0.1,
              type: 'spring',
              stiffness: 100
            }
          }}
          layout
          layoutId={item.id}
        >
          <motion.div 
            className="text-2xl font-bold neon-text min-w-[3rem]"
            animate={{ scale: item.rank === 1 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            #{item.rank}
          </motion.div>
          <div className="flex-1">
            <h4 className="font-semibold">{item.title}</h4>
            <p className="text-sm opacity-70">{item.artist}</p>
          </div>
          {item.change && (
            <motion.div
              className={`text-sm font-bold ${item.change > 0 ? 'text-green-400' : 'text-red-400'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {item.change > 0 ? '↑' : '↓'} {Math.abs(item.change)}
            </motion.div>
          )}
        </motion.div>
      ))}
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
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
  }));
  
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