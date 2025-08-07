import React from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { FaBrain, FaChartLine, FaRobot, FaDatabase, FaLightbulb, FaRocket } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>회사 소개 - KPOP FANfolio</title>
        <meta name="description" content="AI 학습 기반 K-POP 차트 트래킹 서비스" />
      </Head>
      
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-6">
              <span className="gradient-text">AI가 학습하는</span> K-POP 검색 플랫폼
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              KPOP FANfolio는 사용자의 검색 패턴을 학습하여 
              시간이 갈수록 더 정확하고 빠른 검색을 제공하는 
              차세대 K-POP 차트 트래킹 서비스입니다.
            </p>
          </motion.section>

          {/* Core Technology Section */}
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-12">
              <FaBrain className="inline-block mr-3 text-primary-500" />
              핵심 기술: AI 학습 검색 시스템
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Stage 1 */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="glass rounded-2xl p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <FaDatabase className="w-10 h-10 text-primary-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">1단계: 스마트 DB</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  500개 초기 데이터로 시작하여 매일 TOP 100 차트를 
                  자동 수집하며 지속적으로 성장하는 데이터베이스
                </p>
                <div className="mt-4 text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    실시간 업데이트
                  </span>
                </div>
              </motion.div>

              {/* Stage 2 */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="glass rounded-2xl p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <FaRobot className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">2단계: AI 보정</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  DB에 없는 검색어는 AI가 분석하여 영어,한글 또는 
                  변형단어 생성후 DB에 반영하여  <br />
                  다음 검색부터는 정확한 결과 제공
                </p>
                <div className="mt-4 text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                    99% 정확도
                  </span>
                </div>
              </motion.div>

              {/* Stage 3 */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="glass rounded-2xl p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <FaLightbulb className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">3단계: 자동 학습</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  새로운 데이터를 축적하고, 사용자가 확인한 결과는 자동으로 DB에 저장되어 
                  다음 검색부터는 즉시 결과 제공
                </p>
                <div className="mt-4 text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    지속 성장
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Growth Chart */}
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-20"
          >
            <div className="glass rounded-3xl p-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center">
                <FaChartLine className="mr-3 text-green-500" />
                AI 학습 효과
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold mb-4">검색 정확도 향상</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-20 text-sm">시작</span>
                      <div className="flex-1 mx-3 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div className="bg-gradient-to-r from-red-500 to-yellow-500 h-4 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-sm font-bold">60%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-sm">3개월</span>
                      <div className="flex-1 mx-3 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div className="bg-gradient-to-r from-yellow-500 to-green-500 h-4 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-sm font-bold">85%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-sm">6개월</span>
                      <div className="flex-1 mx-3 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div className="bg-green-500 h-4 rounded-full" style={{width: '99%'}}></div>
                      </div>
                      <span className="text-sm font-bold">99%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">AI API 비용 절감</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-20 text-sm">시작</span>
                      <div className="flex-1 mx-3 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div className="bg-red-500 h-4 rounded-full" style={{width: '100%'}}></div>
                      </div>
                      <span className="text-sm font-bold">100%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-sm">3개월</span>
                      <div className="flex-1 mx-3 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div className="bg-yellow-500 h-4 rounded-full" style={{width: '40%'}}></div>
                      </div>
                      <span className="text-sm font-bold">40%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-sm">6개월</span>
                      <div className="flex-1 mx-3 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div className="bg-green-500 h-4 rounded-full" style={{width: '5%'}}></div>
                      </div>
                      <span className="text-sm font-bold">5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Features */}
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-12">주요 특징</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass rounded-xl p-6">
                <h3 className="font-bold mb-2">🎯 오타 자동 보정</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  "뉴진스", "new jeans", "뉴진즈" 모두 NewJeans로 인식
                </p>
              </div>
              
              <div className="glass rounded-xl p-6">
                <h3 className="font-bold mb-2">🌏 한영 자동 변환</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  "방탄소년단"도 "BTS"도 모두 정확하게 검색
                </p>
              </div>
              
              <div className="glass rounded-xl p-6">
                <h3 className="font-bold mb-2">📈 실시간 차트 업데이트</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  매일 각차트의 업데이트 시간에 맞춰, TOP 100 차트를 자동으로 수집하여 최신 정보 제공
                </p>
              </div>
              
              <div className="glass rounded-xl p-6">
                <h3 className="font-bold mb-2">💾 사용자 패턴 학습</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  자주 검색하는 패턴을 학습하여 개인화된 추천
                </p>
              </div>
              
              <div className="glass rounded-xl p-6">
                <h3 className="font-bold mb-2">⚡ 초고속 검색</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  학습된 데이터는 0.1초 내에 즉시 결과 제공
                </p>
              </div>
              
              <div className="glass rounded-xl p-6">
                <h3 className="font-bold mb-2">🚀 지속적 진화</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  사용할수록 더 똑똑해지는 AI 검색 시스템
                </p>
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <div className="glass rounded-3xl p-10 bg-gradient-to-r from-primary-500/10 to-purple-500/10">
              <FaRocket className="w-16 h-16 mx-auto mb-4 text-primary-500" />
              <h2 className="text-2xl font-bold mb-4">
                K-POP 검색의 미래를 경험하세요
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                KPOP FANfolio의 AI 학습 검색으로 
                더 빠르고 정확한 K-POP 정보를 만나보세요.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-primary-500 text-white px-8 py-3 rounded-full hover:bg-primary-600 transition-colors"
              >
                지금 시작하기
              </button>
            </div>
          </motion.section>
        </div>
      </Layout>
    </>
  );
}
