import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaInstagram, FaYoutube, FaEnvelope, FaBuilding } from 'react-icons/fa';
import { useTranslation } from '@/contexts/TranslationContext';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="relative bg-black/90 backdrop-blur-xl border-t border-white/10">
      {/* Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      
      {/* Mobile Compact View */}
      <div className="md:hidden">
        <div className="px-4 py-4">
          {/* Brand & Copyright */}
          <div className="text-center">
            <h3 className="font-bold text-sm bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              KPOP FANfolio
            </h3>
            <p className="text-xs text-gray-400 mt-1">© 2025 DCC Lab Inc.</p>
          </div>
          
          {/* Quick Links - Horizontal */}
          <div className="flex justify-center gap-3 mt-3 text-xs flex-wrap">
            <Link href="/trending" className="text-gray-400 hover:text-purple-400">
              {t('footer.service.trending')}
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/portfolio" className="text-gray-400 hover:text-purple-400">
              {t('footer.service.portfolio')}
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/b2b" className="text-gray-400 hover:text-purple-400 font-semibold">
              B2B
            </Link>
            <span className="text-gray-600">|</span>
            <a href="mailto:dcclab2022@gmail.com" className="text-gray-400 hover:text-purple-400">
              Contact
            </a>
          </div>
          
          {/* Social Icons */}
          <div className="flex justify-center gap-4 mt-3">
            <motion.a 
              href="#" 
              className="text-gray-500 hover:text-pink-400"
              whileHover={{ scale: 1.1 }}
            >
              <FaInstagram className="w-4 h-4" />
            </motion.a>
            <motion.a 
              href="#" 
              className="text-gray-500 hover:text-red-400"
              whileHover={{ scale: 1.1 }}
            >
              <FaYoutube className="w-4 h-4" />
            </motion.a>
            <motion.a 
              href="mailto:dcclab2022@gmail.com" 
              className="text-gray-500 hover:text-purple-400"
              whileHover={{ scale: 1.1 }}
            >
              <FaEnvelope className="w-4 h-4" />
            </motion.a>
          </div>
        </div>
      </div>

      {/* Desktop View - Simplified */}
      <div className="hidden md:block container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Brand - Compact */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              KPOP FANfolio
            </h3>
            <p className="text-xs text-gray-400">
              {t('footer.brand.description')}
            </p>
          </motion.div>

          {/* Service Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-semibold text-sm mb-2 text-white">{t('footer.service')}</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/trending" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('footer.service.trending')}
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('footer.service.portfolio')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('footer.service.about')}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Business Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h4 className="font-semibold text-sm mb-2 text-white">Business</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/b2b" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1">
                  <FaBuilding className="w-3 h-3" />
                  <span>B2B 서비스</span>
                </Link>
              </li>
              <li>
                <Link href="/b2b#pricing" className="text-gray-400 hover:text-purple-400 transition-colors">
                  요금제
                </Link>
              </li>
              <li>
                <Link href="/b2b#demo" className="text-gray-400 hover:text-purple-400 transition-colors">
                  데모 신청
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-semibold text-sm mb-2 text-white">{t('footer.legal')}</h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('footer.legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('footer.legal.terms')}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact - Compact */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-semibold text-sm mb-2 text-white">Contact</h4>
            <p className="text-xs text-gray-400">
              <span className="block">DCC Lab Inc.</span>
              <a href="mailto:dcclab2022@gmail.com" className="block hover:text-purple-400 transition-colors mt-1">
                dcclab2022@gmail.com
              </a>
              <a href="mailto:business@kpopfanfolio.com" className="block hover:text-purple-400 transition-colors mt-1">
                business@kpopfanfolio.com
              </a>
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 mt-2">
              <a href="#" className="text-gray-500 hover:text-pink-400">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-500 hover:text-red-400">
                <FaYoutube className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section with B2B CTA */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-400">
              {t('footer.copyright')} • Made with 💜 for K-POP fans
            </p>
            <Link 
              href="/b2b" 
              className="mt-2 md:mt-0 px-4 py-1.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-xs font-semibold text-purple-400 hover:from-purple-600/30 hover:to-pink-600/30 transition-all"
            >
              🚀 기획사 솔루션 문의
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
