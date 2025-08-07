import React from 'react';
import Link from 'next/link';
import { FaGithub, FaTwitter, FaInstagram, FaYoutube, FaEnvelope } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              KPOP FANfolio
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              전 세계 K-POP 팬들을 위한<br />
              실시간 차트 모니터링 플랫폼
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Service */}
          <div>
            <h3 className="font-semibold text-lg mb-4">서비스</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/trending" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  실시간 트렌딩
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  포트폴리오 관리
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  서비스 소개
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">이용안내</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <a href="mailto:support@kpopfanfolio.com" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  문의하기
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">비즈니스</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <span className="block font-medium">DCC Lab Inc.</span>
              <span className="block">Seoul, South Korea</span>
              <a href="mailto:business@kpopfanfolio.com" className="block hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-2">
                <FaEnvelope className="w-4 h-4" />
                dcclab2022@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 DCC Lab Inc. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Made with 💜 for K-POP fans worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
