import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaGithub, FaTwitter, FaInstagram, FaYoutube, FaEnvelope } from 'react-icons/fa';
import { useTranslation } from '@/contexts/TranslationContext';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
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
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
              {t('footer.brand.description')}
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
            <h3 className="font-semibold text-lg mb-4 text-white">{t('footer.service')}</h3>
            <ul className="space-y-2 text-sm">
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

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-semibold text-lg mb-4 text-white">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm">
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
              <li>
                <Link href="mailto:support@kpopfanfolio.com" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('footer.company.contact')}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Business */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-semibold text-lg mb-4 text-white">{t('footer.company')}</h3>
            <p className="text-sm text-gray-400 space-y-1">
              <span className="block">DCC Lab Inc.</span>
              <span className="block">Seoul, South Korea</span>
              <a href="mailto:business@kpopfanfolio.com" className="block hover:text-purple-400 transition-colors">
                <FaEnvelope className="inline w-4 h-4 mr-2" />
                dcclab2022@gmail.com
              </a>
            </p>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div 
          className="text-center pt-8 border-t border-white/10 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="mb-2">{t('footer.copyright')}</p>
          <p className="flex items-center justify-center gap-1">
            {t('footer.made.with')} <span className="text-red-500 animate-pulse">💜</span> {t('footer.made.for')}
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
