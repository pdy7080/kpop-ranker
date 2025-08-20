import React from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { FaBrain, FaChartLine, FaRobot, FaDatabase, FaLightbulb, FaRocket } from 'react-icons/fa';
import { useTranslation } from '@/contexts/TranslationContext';

export default function AboutPage() {
  const { t } = useTranslation();
  
  return (
    <>
      <Head>
        <title>{t('about.title')} - KPOP FANfolio</title>
        <meta name="description" content={t('about.description')} />
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
              <span className="gradient-text">{t('about.hero.title1')}</span> {t('about.hero.title2')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('about.hero.description')}
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
              {t('about.tech.title')}
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
                <h3 className="text-xl font-bold mb-3">{t('about.stage1.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('about.stage1.description')}
                </p>
                <div className="mt-4 text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    {t('about.stage1.badge')}
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
                <h3 className="text-xl font-bold mb-3">{t('about.stage2.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('about.stage2.description')}
                </p>
                <div className="mt-4 text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                    {t('about.stage2.badge')}
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
                <h3 className="text-xl font-bold mb-3">{t('about.stage3.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('about.stage3.description')}
                </p>
                <div className="mt-4 text-sm">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {t('about.stage3.badge')}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-12">{t('about.features.title')}</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div 
                whileHover={{ x: 10 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <FaChartLine className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t('about.feature1.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('about.feature1.description')}
                  </p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ x: 10 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FaRocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t('about.feature2.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('about.feature2.description')}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Mission Statement */}
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-16 px-8 rounded-3xl gradient-bg"
          >
            <h2 className="text-3xl font-bold mb-6 text-white">{t('about.mission.title')}</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {t('about.mission.description')}
            </p>
          </motion.section>
        </div>
      </Layout>
    </>
  );
}
