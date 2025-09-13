import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConsultationModal from '@/components/ConsultationModal';
import { 
  FaChartLine, FaMusic, FaGlobe, FaClock, 
  FaShieldAlt, FaCode, FaCheck, FaArrowRight,
  FaHeadset, FaPalette, FaUserTie
} from 'react-icons/fa';

const B2BPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const charts = [
    { name: 'Melon', icon: '🍈', color: 'from-green-400 to-green-600' },
    { name: 'Genie', icon: '🧞', color: 'from-blue-400 to-blue-600' },
    { name: 'Bugs', icon: '🐛', color: 'from-orange-400 to-orange-600' },
    { name: 'FLO', icon: '🎵', color: 'from-purple-400 to-purple-600' },
    { name: 'Spotify', icon: '🎧', color: 'from-green-500 to-green-700' },
    { name: 'Apple Music', icon: '🍎', color: 'from-red-400 to-red-600' },
    { name: 'YouTube Music', icon: '📺', color: 'from-red-500 to-red-700' },
    { name: 'Last.fm', icon: '📻', color: 'from-red-600 to-red-800' }
  ];

  const features = [
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: '실시간 차트 모니터링',
      description: '국내외 8개 주요 음원 차트를 실시간으로 추적하고 표시합니다'
    },
    {
      icon: <FaMusic className="w-8 h-8" />,
      title: '아티스트 중심 디스플레이',
      description: '소속 아티스트의 차트 진입 현황만 선별하여 자동으로 표시합니다'
    },
    {
      icon: <FaGlobe className="w-8 h-8" />,
      title: '글로벌 차트 통합',
      description: 'Spotify, Apple Music 등 글로벌 차트까지 한눈에 확인 가능합니다'
    },
    {
      icon: <FaClock className="w-8 h-8" />,
      title: '24/7 자동 업데이트',
      description: '차트별 업데이트 주기에 맞춰 자동으로 최신 데이터를 반영합니다'
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: '안정적인 서비스',
      description: '99.9% 가동률과 빠른 응답속도를 보장합니다'
    },
    {
      icon: <FaCode className="w-8 h-8" />,
      title: '완벽한 기술 지원',
      description: '설치부터 운영까지 전문 기술팀이 완벽하게 지원합니다'
    }
  ];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      features: [
        '국내외 차트 8개 모두 제공',
        '최대 3명 아티스트',
        '실시간 업데이트',
        '기본 위젯 디자인',
        '이메일 기술 지원',
        '기본 설치 지원'
      ],
      recommended: false
    },
    {
      id: 'professional',
      name: 'Professional',
      features: [
        '국내외 차트 8개 모두 제공',
        '최대 10명 아티스트',
        '실시간 업데이트',
        '커스텀 디자인 제공',
        '우선 기술 지원',
        'API 직접 연동',
        '전담 엔지니어 배정'
      ],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      features: [
        '국내외 차트 8개 모두 제공',
        '무제한 아티스트',
        '실시간 업데이트',
        '완전 커스터마이징',
        '전담 매니저 배정',
        'SLA 보장',
        '데이터 분석 리포트',
        '24/7 기술 지원'
      ],
      recommended: false
    }
  ];

  return (
    <>
      <Head>
        <title>B2B 서비스 - KPOP FANfolio</title>
        <meta name="description" content="기획사를 위한 실시간 차트 모니터링 솔루션" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black text-white">
        <Header />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Chart Widget for Agencies
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                소속 아티스트의 차트 성과를 실시간으로 홈페이지에 표시하세요
              </p>
              <motion.button
                onClick={() => setIsConsultationOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg hover:shadow-xl transition-shadow"
              >
                상담 요청
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Live Demo Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">실시간 위젯 데모</h2>
              <p className="text-gray-400">귀사 홈페이지에 이렇게 표시됩니다</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">BLACKPINK Chart Status</h3>
                <span className="text-sm text-gray-400">실시간 업데이트</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { chart: 'Melon', rank: 2, icon: '🍈' },
                  { chart: 'Spotify', rank: 8, icon: '🎧' },
                  { chart: 'Apple Music', rank: 5, icon: '🍎' },
                  { chart: 'YouTube', rank: 3, icon: '📺' }
                ].map((item, index) => (
                  <motion.div
                    key={item.chart}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-4 text-center"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="font-semibold">{item.chart}</div>
                    <div className="text-2xl font-bold text-purple-400">#{item.rank}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">
                * 차트 진입하지 않은 플랫폼은 자동으로 숨김 처리됩니다
              </div>
            </motion.div>
          </div>
        </section>

        {/* Supported Charts */}
        <section className="py-16 px-4 bg-black/50">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">지원 차트</h2>
              <p className="text-gray-400">국내외 주요 음원 차트를 모두 지원합니다</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {charts.map((chart, index) => (
                <motion.div
                  key={chart.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="text-center"
                >
                  <div className={`w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${chart.color} flex items-center justify-center text-3xl shadow-lg`}>
                    {chart.icon}
                  </div>
                  <div className="font-semibold">{chart.name}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">핵심 기능</h2>
              <p className="text-gray-400">기획사를 위한 맞춤형 솔루션</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="text-purple-400 mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 px-4 bg-gradient-to-b from-purple-900/20 to-black">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">서비스 플랜</h2>
              <p className="text-gray-400">기획사 규모에 맞는 플랜을 선택하세요</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl p-8 ${
                    plan.recommended 
                      ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-500' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-semibold">
                      추천
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    {plan.id === 'starter' && (
                      <div className="text-gray-400">소규모 기획사</div>
                    )}
                    {plan.id === 'professional' && (
                      <div className="text-gray-400">중형 기획사</div>
                    )}
                    {plan.id === 'enterprise' && (
                      <div className="text-gray-400">대형 기획사</div>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <FaCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setIsConsultationOpen(true)}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      plan.recommended
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    상담 신청
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Support */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">완벽한 기술 지원</h2>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-bold mb-6 text-purple-400">전문 기술팀이 모든 과정을 지원합니다</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                      <FaCode className="w-8 h-8 text-purple-400" />
                    </div>
                    <h4 className="font-semibold mb-2">설치 및 연동</h4>
                    <p className="text-sm text-gray-400">
                      전문 엔지니어가 직접 방문하여 홈페이지에 위젯을 설치하고 최적화합니다
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-600/20 flex items-center justify-center">
                      <FaPalette className="w-8 h-8 text-pink-400" />
                    </div>
                    <h4 className="font-semibold mb-2">디자인 커스터마이징</h4>
                    <p className="text-sm text-gray-400">
                      귀사 홈페이지 디자인에 완벽하게 어울리도록 위젯을 맞춤 제작합니다
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <FaHeadset className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="font-semibold mb-2">지속적인 관리</h4>
                    <p className="text-sm text-gray-400">
                      정기적인 점검과 업데이트로 항상 최상의 상태를 유지합니다
                    </p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-purple-600/10 rounded-lg border border-purple-500/30">
                  <p className="text-center text-sm text-purple-300">
                    💡 기술적인 부분은 저희가 모두 처리합니다. 귀사는 결과만 확인하시면 됩니다.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-blue-900/50">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                지금 문의하세요
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                소속 아티스트의 차트 성과를 실시간으로 보여주는<br />
                강력한 마케팅 도구를 경험해보세요
              </p>
              <motion.button
                onClick={() => setIsConsultationOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:shadow-xl transition-shadow"
              >
                상담 문의하기
              </motion.button>
              <p className="mt-8 text-sm text-gray-500">
                문의: business@kpopfanfolio.com | 02-1234-5678
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Consultation Modal */}
      <ConsultationModal 
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </>
  );
};

export default B2BPage;