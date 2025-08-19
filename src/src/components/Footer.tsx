import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaGithub, FaTwitter, FaInstagram, FaYoutube, FaEnvelope } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-black/90 backdrop-blur-xl border-t border-white/10">
      {/* Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              KPOP FANfolio
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              전 세계 K-POP 팬들을 위한<br />
              실시간 차트 모니터링 플랫폼
            </p>
            <div className="flex gap-3 mt-4">
              <motion.a 
                href="#" 
                className="text-gray-500 hover:text-purple-400 transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTwitter className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-500 hover:text-pink-400 transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaInstagram className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-500 hover:text-red-400 transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaYoutube className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Service */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-semibold text-lg mb-4 text-gray-200">서비스</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/trending" className="text-gray-400 hover:text-purple-400 transition-colors inline-block group">
                  <span className="relative">
                    실시간 트렌딩
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-purple-400 transition-colors inline-block group">
                  <span className="relative">
                    포트폴리오 관리
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-purple-400 transition-colors inline-block group">
                  <span className="relative">
                    서비스 소개
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-semibold text-lg mb-4 text-gray-200">이용안내</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors inline-block group">
                  <span className="relative">
                    개인정보처리방침
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors inline-block group">
                  <span className="relative">
                    이용약관
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </li>
              <li>
                <a href="mailto:support@kpopfanfolio.com" className="text-gray-400 hover:text-purple-400 transition-colors inline-block group">
                  <span className="relative">
                    문의하기
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-semibold text-lg mb-4 text-gray-200">비즈니스</h3>
            <p className="text-sm text-gray-400 space-y-2">
              <span className="block font-medium text-gray-300">DCC Lab Inc.</span>
              <span className="block">Seoul, South Korea</span>
              <a href="mailto:business@kpopfanfolio.com" className="block hover:text-purple-400 transition-colors flex items-center gap-2 group">
                <FaEnvelope className="w-4 h-4 group-hover:scale-110 transition-transform" />
                dcclab2022@gmail.com
              </a>
            </p>
          </motion.div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025 DCC Lab Inc. All rights reserved.
            </p>
            <motion.p 
              className="text-xs text-gray-500"
              animate={{ 
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Made with 💜 for K-POP fans worldwide
            </motion.p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
