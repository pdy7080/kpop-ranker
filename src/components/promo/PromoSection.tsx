import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Zap, Palette } from 'lucide-react';

interface PromoCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  href: string;
  external?: boolean;
  gradient: string;
}

const promoCards: PromoCard[] = [
  {
    id: 'dcclab',
    icon: <Zap className="w-6 h-6" />,
    title: 'AI 기반 K-POP 데이터 플랫폼',
    description: '실시간 차트 분석부터 팬 포트폴리오까지',
    cta: 'B2B 서비스 확인',
    href: '/b2b',
    gradient: 'from-purple-500 via-violet-500 to-blue-500'
  },
  {
    id: 'bymint',
    icon: <Palette className="w-6 h-6" />,
    title: 'K-POP 공연·굿즈 전문 제작사',
    description: '기획부터 제작, 납품까지 원스톱 솔루션',
    cta: '포트폴리오 보기',
    href: 'https://bymint.kr',
    external: true,
    gradient: 'from-pink-500 via-rose-500 to-orange-500'
  }
];

const PromoSection: React.FC = () => {
  return (
    <section className="relative py-12 md:py-16">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-black/20" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Our Partners
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            K-POP 생태계를 함께 만들어가는 파트너들을 소개합니다
          </p>
        </motion.div>

        {/* Promo Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {promoCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <PromoCard card={card} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface PromoCardProps {
  card: PromoCard;
}

const PromoCard: React.FC<PromoCardProps> = ({ card }) => {
  const CardWrapper = card.external ? 'a' : Link;
  const wrapperProps = card.external 
    ? { href: card.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: card.href };

  return (
    <CardWrapper
      {...wrapperProps}
      className="block group relative overflow-hidden"
    >
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.3 }}
        className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 h-full"
      >
        {/* Gradient Border Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl`} />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Icon & Gradient */}
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${card.gradient} text-white mb-4 w-fit`}>
            {card.icon}
          </div>

          {/* Text Content */}
          <div className="flex-1 mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
              {card.title}
            </h3>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              {card.description}
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex items-center justify-between">
            <motion.span 
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${card.gradient} text-white font-semibold text-sm md:text-base group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300`}
              whileHover={{ scale: 1.05 }}
            >
              {card.cta}
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </motion.span>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-500 rounded-2xl`} />
      </motion.div>
    </CardWrapper>
  );
};

export default PromoSection;