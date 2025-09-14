import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Zap, Palette, Building } from 'lucide-react';

interface PromoSlide {
  id: string;
  company: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  external?: boolean;
  gradient: string;
  accentColor: string;
  bgImage: string;
}

const promoSlides: PromoSlide[] = [
  {
    id: 'dcclab',
    company: 'DCC LAB',
    title: 'AI 기반 K-POP 데이터 플랫폼',
    description: '실시간 차트 분석부터 팬 포트폴리오까지, 완전 자동화된 K-POP 데이터 솔루션',
    features: ['실시간 글로벌 차트 연동', '팬 포트폴리오 & 랭킹 시스템', '웹페이지 및 시스템 제작'],
    cta: 'B2B 서비스 확인하기',
    href: '/b2b',
    gradient: 'from-purple-600 via-violet-600 to-blue-600',
    accentColor: 'text-purple-400',
    bgImage: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
  },
  {
    id: 'bymint',
    company: 'ByMint Creative',
    title: 'K-POP 공연·굿즈 전문 제작사',
    description: '해외공연 기획부터 굿즈 제작, 납품까지  브랜드를 팬심에 닿게',
    features: ['공연기획 및 브랜딩', 'MD 제작. 패키징', '온/오프라인 판매'],
    cta: '포트폴리오 보기',
    href: 'https://bymint.kr',
    external: true,
    gradient: 'from-pink-600 via-rose-600 to-orange-600',
    accentColor: 'text-pink-400',
    bgImage: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%)'
  }
];

const PromoCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 6000); // 6초 간격

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section 
      className="relative py-16 md:py-20"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-black/10" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            K-POP Partners
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto">
            K-POP 생태계를 함께 혁신해나가는 전문 파트너들과의 협업
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Main Carousel */}
          <div className="relative h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Gradient Border */}
            <div className="absolute inset-0 p-[1px] sm:p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl sm:rounded-3xl">
              <div className="h-full bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.5 }}
                    className="h-full relative overflow-hidden rounded-2xl sm:rounded-3xl"
                  >
                    <PromoSlideContent slide={promoSlides[currentSlide]} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Navigation Arrows - Mobile Optimized */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:bg-black/70 hover:scale-110 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:bg-black/70 hover:scale-110 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
            {promoSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Auto-play indicator */}
        <div className="flex justify-center mt-4">
          <div className={`text-xs text-gray-500 flex items-center gap-2 ${isAutoPlaying ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            {isAutoPlaying ? '자동 재생 중' : '일시 정지'}
          </div>
        </div>
      </div>
    </section>
  );
};

interface PromoSlideContentProps {
  slide: PromoSlide;
}

const PromoSlideContent: React.FC<PromoSlideContentProps> = ({ slide }) => {
  const LinkWrapper = slide.external ? 'a' : Link;
  const linkProps = slide.external 
    ? { href: slide.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: slide.href };

  return (
    <div className="h-full relative">
      {/* Background Image/Pattern */}
      <div className="absolute inset-0">
        {/* K-POP Concert Photo Background */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: slide.id === 'dcclab' 
                ? `url('data:image/svg+xml;base64,${btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 800 400">
                    <defs>
                      <pattern id="concert1" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <rect width="100" height="100" fill="#1e1b4b" opacity="0.8"/>
                        <circle cx="20" cy="30" r="8" fill="#8b5cf6" opacity="0.6"/>
                        <circle cx="60" cy="20" r="5" fill="#a78bfa" opacity="0.7"/>
                        <circle cx="80" cy="60" r="6" fill="#c084fc" opacity="0.5"/>
                      </pattern>
                      <radialGradient id="stage1" cx="70%" cy="50%" r="80%">
                        <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.3" />
                        <stop offset="50%" style="stop-color:#6366f1;stop-opacity:0.2" />
                        <stop offset="100%" style="stop-color:#1e1b4b;stop-opacity:0.9" />
                      </radialGradient>
                      <linearGradient id="crowd1" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#000;stop-opacity:0.8" />
                        <stop offset="70%" style="stop-color:#8b5cf6;stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:#a78bfa;stop-opacity:0.1" />
                      </linearGradient>
                    </defs>
                    
                    <!-- Concert Photo Base -->
                    <rect width="800" height="400" fill="url(#concert1)"/>
                    
                    <!-- Stage Silhouette -->
                    <path d="M 500 400 L 800 400 L 800 250 L 650 200 L 500 250 Z" fill="url(#stage1)" opacity="0.4"/>
                    
                    <!-- Crowd Silhouette -->
                    <path d="M 0 400 L 0 350 Q 100 330 200 340 T 400 350 L 500 360 L 600 400 Z" fill="#000" opacity="0.6"/>
                    
                    <!-- Stage Lights -->
                    <circle cx="600" cy="100" r="40" fill="url(#stage1)" opacity="0.4"/>
                    <circle cx="700" cy="80" r="35" fill="#a78bfa" opacity="0.3"/>
                    <circle cx="750" cy="120" r="25" fill="#c084fc" opacity="0.4"/>
                    
                    <!-- Light Beams -->
                    <path d="M 600 100 L 580 400 L 620 400 Z" fill="url(#crowd1)" opacity="0.2"/>
                    <path d="M 700 80 L 670 400 L 730 400 Z" fill="url(#crowd1)" opacity="0.15"/>
                    
                    <!-- Performers Silhouette -->
                    <ellipse cx="650" cy="280" rx="8" ry="30" fill="#8b5cf6" opacity="0.4"/>
                    <ellipse cx="680" cy="275" rx="6" ry="25" fill="#a78bfa" opacity="0.3"/>
                    <ellipse cx="620" cy="285" rx="7" ry="28" fill="#c084fc" opacity="0.4"/>
                    
                    <!-- Gradient Overlay for text readability -->
                    <linearGradient id="textOverlay1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#000;stop-opacity:0.7" />
                      <stop offset="60%" style="stop-color:#000;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#000;stop-opacity:0.1" />
                    </linearGradient>
                    <rect width="800" height="400" fill="url(#textOverlay1)"/>
                  </svg>
                `)}')`
                : `url('data:image/svg+xml;base64,${btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 800 400">
                    <defs>
                      <pattern id="concert2" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                        <rect width="80" height="80" fill="#7c2d12" opacity="0.8"/>
                        <circle cx="15" cy="25" r="6" fill="#ec4899" opacity="0.7"/>
                        <circle cx="50" cy="15" r="4" fill="#f472b6" opacity="0.8"/>
                        <circle cx="65" cy="50" r="5" fill="#fb7185" opacity="0.6"/>
                        <circle cx="30" cy="60" r="3" fill="#fbbf24" opacity="0.9"/>
                      </pattern>
                      <radialGradient id="stage2" cx="75%" cy="40%" r="70%">
                        <stop offset="0%" style="stop-color:#ec4899;stop-opacity:0.4" />
                        <stop offset="40%" style="stop-color:#f97316;stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:#7c2d12;stop-opacity:0.9" />
                      </radialGradient>
                      <linearGradient id="crowd2" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#000;stop-opacity:0.8" />
                        <stop offset="60%" style="stop-color:#ec4899;stop-opacity:0.4" />
                        <stop offset="100%" style="stop-color:#fbbf24;stop-opacity:0.2" />
                      </linearGradient>
                    </defs>
                    
                    <!-- Concert Photo Base -->
                    <rect width="800" height="400" fill="url(#concert2)"/>
                    
                    <!-- Main Stage -->
                    <path d="M 450 400 L 800 400 L 800 200 L 600 150 L 450 200 Z" fill="url(#stage2)" opacity="0.5"/>
                    
                    <!-- Audience Crowd -->
                    <path d="M 0 400 L 0 330 Q 150 310 300 325 T 500 340 L 600 350 L 800 370 L 800 400 Z" fill="#000" opacity="0.7"/>
                    
                    <!-- Stage Lighting Setup -->
                    <circle cx="650" cy="80" r="45" fill="url(#stage2)" opacity="0.5"/>
                    <circle cx="720" cy="60" r="38" fill="#f472b6" opacity="0.4"/>
                    <circle cx="600" cy="110" r="32" fill="#fbbf24" opacity="0.5"/>
                    <circle cx="770" cy="100" r="28" fill="#fb7185" opacity="0.4"/>
                    
                    <!-- Dynamic Light Beams -->
                    <path d="M 650 80 L 620 400 L 680 400 Z" fill="url(#crowd2)" opacity="0.25"/>
                    <path d="M 720 60 L 680 400 L 760 400 Z" fill="url(#crowd2)" opacity="0.2"/>
                    <path d="M 600 110 L 560 400 L 640 400 Z" fill="url(#crowd2)" opacity="0.15"/>
                    
                    <!-- Artist Silhouettes -->
                    <ellipse cx="630" cy="250" rx="10" ry="35" fill="#ec4899" opacity="0.5"/>
                    <ellipse cx="670" cy="245" rx="8" ry="30" fill="#f472b6" opacity="0.4"/>
                    <ellipse cx="700" cy="255" rx="9" ry="32" fill="#fbbf24" opacity="0.5"/>
                    <ellipse cx="600" cy="260" rx="7" ry="28" fill="#fb7185" opacity="0.4"/>
                    
                    <!-- Confetti/Effects -->
                    <circle cx="550" cy="150" r="3" fill="#fbbf24" opacity="0.8"/>
                    <circle cx="580" cy="120" r="2" fill="#ec4899" opacity="0.9"/>
                    <circle cx="610" cy="140" r="2.5" fill="#f472b6" opacity="0.7"/>
                    <circle cx="640" cy="110" r="2" fill="#fb7185" opacity="0.8"/>
                    <circle cx="670" cy="130" r="3" fill="#fbbf24" opacity="0.6"/>
                    
                    <!-- Text Readability Overlay -->
                    <linearGradient id="textOverlay2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#000;stop-opacity:0.7" />
                      <stop offset="60%" style="stop-color:#000;stop-opacity:0.3" />
                      <stop offset="100%" style="stop-color:#000;stop-opacity:0.05" />
                    </linearGradient>
                    <rect width="800" height="400" fill="url(#textOverlay2)"/>
                  </svg>
                `)}')`
            }}
          />
        </div>
        
        {/* Additional Gradient Overlay for better text contrast */}
        <div className="absolute inset-0" style={{ background: slide.bgImage }} />
      </div>
      
      {/* Concert Stage Pattern - Enhanced */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-white/30 via-white/10 to-transparent" />
        <div className="absolute top-0 right-0 w-2/5 h-full bg-gradient-to-l from-white/20 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-white/5 to-transparent rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-4xl">
            {/* Company Logo/Name - Mobile Responsive */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${slide.gradient}`}>
                <Building className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className={`text-sm sm:text-lg md:text-xl font-semibold ${slide.accentColor}`}>
                {slide.company}
              </div>
            </div>

            {/* Main Title - Mobile Typography */}
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              {slide.title}
            </h3>

            {/* Description - Mobile Responsive */}
            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 max-w-3xl">
              {slide.description}
            </p>

            {/* Features - Mobile Stack */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
              {slide.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm"
                >
                  {feature}
                </motion.div>
              ))}
            </div>

            {/* CTA Button - Mobile Responsive */}
            <LinkWrapper
              {...linkProps}
              className="inline-block group"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r ${slide.gradient} text-white font-semibold text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300`}
              >
                {slide.cta}
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </motion.div>
            </LinkWrapper>
          </div>
        </div>
      </div>

      {/* Decorative Elements - Mobile Hidden */}
      <div className="hidden sm:block absolute top-6 sm:top-8 right-6 sm:right-8 opacity-20">
        <div className={`w-16 sm:w-24 h-16 sm:h-24 rounded-full bg-gradient-to-r ${slide.gradient} blur-2xl`} />
      </div>
      <div className="hidden sm:block absolute bottom-6 sm:bottom-8 left-6 sm:left-8 opacity-10">
        <div className={`w-20 sm:w-32 h-20 sm:h-32 rounded-full bg-gradient-to-r ${slide.gradient} blur-3xl`} />
      </div>
    </div>
  );
};

export default PromoCarousel;