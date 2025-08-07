import React from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaLock, FaUserShield, FaDatabase, FaCookie, FaEnvelope } from 'react-icons/fa';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>개인정보처리방침 - KPOP FANfolio</title>
        <meta name="description" content="KPOP FANfolio 서비스의 개인정보처리방침입니다." />
      </Head>
      
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
              <FaShieldAlt className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                개인정보처리방침
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              시행일: 2025년 1월 1일
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Section 1 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaUserShield className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold">1. 개인정보의 수집 및 이용 목적</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <p>KPOP FANfolio(이하 '서비스')는 다음과 같은 목적으로 개인정보를 수집 및 이용합니다:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>회원 관리:</strong> 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 부정 이용 방지</li>
                  <li><strong>서비스 제공:</strong> 포트폴리오 관리, 차트 데이터 제공, 맞춤형 콘텐츠 제공</li>
                  <li><strong>서비스 개선:</strong> 신규 서비스 개발, 서비스 이용 통계 및 분석</li>
                  <li><strong>마케팅 활용:</strong> 이벤트 및 광고성 정보 제공(선택 동의 시)</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaDatabase className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold">2. 수집하는 개인정보 항목</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">필수 수집 항목</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>소셜 로그인 시: 이메일, 닉네임, 프로필 이미지</li>
                    <li>서비스 이용 기록: 접속 로그, 쿠키, 접속 IP</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">선택 수집 항목</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>관심 아티스트, 선호 장르</li>
                    <li>생년월일, 성별(통계 목적)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaLock className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold">3. 개인정보의 보유 및 이용 기간</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <p>회원의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다.</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>회원 정보:</strong> 회원 탈퇴 시까지</li>
                  <li><strong>서비스 이용 기록:</strong> 3개월</li>
                  <li><strong>관련 법령에 따른 보존:</strong>
                    <ul className="list-circle pl-6 mt-2 space-y-1">
                      <li>계약 또는 청약철회 기록: 5년</li>
                      <li>대금결제 및 재화 공급 기록: 5년</li>
                      <li>소비자 불만 또는 분쟁처리 기록: 3년</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaCookie className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold">4. 쿠키 사용</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <p>서비스는 이용자 맞춤 서비스 제공을 위해 쿠키를 사용합니다.</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>쿠키란?</strong> 웹사이트가 이용자의 브라우저에 전송하는 작은 텍스트 파일</li>
                  <li><strong>사용 목적:</strong> 로그인 유지, 이용자 선호 설정 저장, 서비스 이용 통계</li>
                  <li><strong>거부 방법:</strong> 브라우저 설정에서 쿠키 허용을 거부할 수 있으나, 일부 서비스 이용에 제한이 있을 수 있습니다</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaUserShield className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold">5. 이용자의 권리와 행사 방법</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <p>이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>개인정보 열람 요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제 요구</li>
                  <li>처리 정지 요구</li>
                </ul>
                <p className="mt-4">권리 행사는 서비스 내 '설정' 메뉴 또는 고객센터를 통해 가능합니다.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaEnvelope className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold">6. 개인정보 보호책임자</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <p>개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mt-4">
                  <p className="font-semibold mb-2">개인정보 보호책임자</p>
                  <ul className="space-y-1 text-sm">
                    <li>성명: Paul</li>
                    <li>직책: 개인정보보호팀장</li>
                    <li>이메일: dcclab2022@gmail.com</li>
                    
                  </ul>
                </div>
              </div>
            </section>

            {/* Footer notice */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                본 개인정보처리방침은 2025년 1월 1일부터 적용됩니다.<br />
                개정 시 서비스 공지사항을 통해 안내드리겠습니다.
              </p>
            </div>
          </motion.div>
        </div>
      </Layout>
    </>
  );
}
