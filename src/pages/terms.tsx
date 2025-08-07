import React from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { FaFileContract, FaHandshake, FaBalanceScale, FaExclamationTriangle, FaBan, FaCheckCircle, FaShieldAlt, FaGavel } from 'react-icons/fa';

export default function Terms() {
  return (
    <>
      <Head>
        <title>이용약관 - KPOP FANfolio</title>
        <meta name="description" content="KPOP FANfolio 서비스 이용약관입니다." />
      </Head>
      
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-6">
              <FaFileContract className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                이용약관
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
                <FaHandshake className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">제1조 (목적)</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <p>
                  본 약관은 DCC Lab Inc.(이하 "회사")가 제공하는 KPOP FANfolio 서비스(이하 "서비스")의 이용과 관련하여 
                  회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaCheckCircle className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">제2조 (정의)</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <ul className="list-decimal pl-6 space-y-2">
                  <li><strong>"서비스"</strong>란 회사가 제공하는 K-POP 차트 모니터링 및 포트폴리오 관리 관련 제반 서비스를 의미합니다.</li>
                  <li><strong>"이용자"</strong>란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                  <li><strong>"회원"</strong>이란 회사와 서비스 이용계약을 체결하고 이용자 아이디를 부여받은 이용자를 말합니다.</li>
                  <li><strong>"포트폴리오"</strong>란 이용자가 관심 있는 K-POP 아티스트와 곡을 저장하고 관리하는 개인 컬렉션을 말합니다.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaBalanceScale className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">제3조 (이용계약의 체결)</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <p className="font-semibold">1. 이용계약의 성립</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>이용계약은 이용자가 본 약관에 동의하고 회원가입을 신청한 후, 회사가 이를 승낙함으로써 체결됩니다.</li>
                  <li>회사는 소셜 로그인(Google, Kakao 등)을 통한 간편 가입을 제공합니다.</li>
                </ul>
                
                <p className="font-semibold mt-4">2. 이용신청의 거절</p>
                <p>회사는 다음 각 호에 해당하는 경우 이용신청을 거절할 수 있습니다:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>타인의 명의를 도용한 경우</li>
                  <li>허위 정보를 기재한 경우</li>
                  <li>사회의 안녕과 질서 또는 미풍양속을 저해할 목적으로 신청한 경우</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaCheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold">제4조 (서비스의 제공)</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <p className="font-semibold">회사는 다음과 같은 서비스를 제공합니다:</p>
                <ul className="list-decimal pl-6 space-y-2">
                  <li>K-POP 차트 데이터 조회 서비스</li>
                  <li>아티스트 및 곡 검색 서비스</li>
                  <li>포트폴리오 생성 및 관리 서비스</li>
                  <li>실시간 차트 모니터링 서비스</li>
                  <li>트렌드 분석 정보 제공</li>
                  <li>기타 회사가 정하는 서비스</li>
                </ul>
                <p className="mt-4 text-sm bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  서비스는 연중무휴 24시간 제공함을 원칙으로 하나, 시스템 점검 등의 사유로 일시적으로 중단될 수 있습니다.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaExclamationTriangle className="w-6 h-6 text-yellow-600" />
                <h2 className="text-2xl font-bold">제5조 (이용자의 의무)</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
                <ul className="list-decimal pl-6 space-y-2">
                  <li>타인의 정보 도용</li>
                  <li>서비스에 게시된 정보의 무단 변경</li>
                  <li>회사가 정한 정보 이외의 정보 송신 또는 게시</li>
                  <li>회사와 타인의 저작권 등 지적재산권 침해</li>
                  <li>회사와 타인의 명예 훼손 또는 업무 방해</li>
                  <li>외설적이거나 폭력적인 정보 송신 또는 게시</li>
                  <li>서비스를 이용한 영리 활동</li>
                  <li>불법적인 프로그램의 사용 또는 배포</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaBan className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold">제6조 (서비스 이용 제한)</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <p>회사는 이용자가 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 다음과 같이 서비스 이용을 제한할 수 있습니다:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>1차 위반:</strong> 경고</li>
                  <li><strong>2차 위반:</strong> 7일간 이용 정지</li>
                  <li><strong>3차 위반:</strong> 30일간 이용 정지</li>
                  <li><strong>4차 위반:</strong> 영구 이용 정지</li>
                </ul>
                <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                  단, 저작권 침해, 개인정보 도용 등 중대한 위반의 경우 즉시 영구 정지될 수 있습니다.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaBalanceScale className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold">제7조 (저작권의 귀속)</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <ul className="list-decimal pl-6 space-y-2">
                  <li>서비스에서 제공하는 모든 콘텐츠의 저작권은 회사에 귀속됩니다.</li>
                  <li>이용자가 서비스를 이용하여 작성한 포트폴리오 등의 저작권은 이용자에게 귀속됩니다.</li>
                  <li>회사는 서비스 운영을 위해 필요한 범위 내에서 이용자의 콘텐츠를 사용할 수 있습니다.</li>
                  <li>차트 데이터는 각 음원 플랫폼의 공개 데이터를 수집한 것으로, 해당 플랫폼의 저작권 정책을 따릅니다.</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaShieldAlt className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold">제8조 (면책조항)</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <ul className="list-decimal pl-6 space-y-2">
                  <li>회사는 천재지변, 전쟁, 기타 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
                  <li>회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
                  <li>회사는 이용자가 서비스를 이용하여 기대하는 수익을 얻지 못한 것에 대하여 책임을 지지 않습니다.</li>
                  <li>회사는 이용자가 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여 책임을 지지 않습니다.</li>
                  <li>차트 데이터의 정확성은 원본 플랫폼의 데이터에 의존하며, 회사는 데이터의 오류에 대해 책임을 지지 않습니다.</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaGavel className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold">제9조 (분쟁해결)</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <ul className="list-decimal pl-6 space-y-2">
                  <li>회사와 이용자 간 발생한 분쟁은 상호 협의하여 해결하는 것을 원칙으로 합니다.</li>
                  <li>협의가 이루어지지 않을 경우, 전자거래기본법에 의한 전자거래분쟁조정위원회의 조정에 따를 수 있습니다.</li>
                  <li>회사와 이용자 간 발생한 분쟁에 관한 소송은 서울중앙지방법원을 관할 법원으로 합니다.</li>
                </ul>
              </div>
            </section>

            {/* Section 10 */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <FaCheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold">제10조 (약관의 개정)</h2>
              </div>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                <ul className="list-decimal pl-6 space-y-2">
                  <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
                  <li>약관을 개정할 경우, 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 내 공지사항에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</li>
                  <li>이용자가 개정약관의 적용에 동의하지 않는 경우, 이용자는 이용계약을 해지할 수 있습니다.</li>
                  <li>개정약관의 공지 후 이용자가 명시적으로 거부의사를 표명하지 않으면 개정약관에 동의한 것으로 간주합니다.</li>
                </ul>
              </div>
            </section>

            {/* Footer notice */}
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                본 약관은 2025년 8월 1일부터 시행됩니다.<br />
                최종 수정일: 2025년 8월 1일
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  문의사항이 있으시면 support@kpopfanfolio.com으로 연락해주세요.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    </>
  );
}
