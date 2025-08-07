import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100 transition-colors">
      {/* 🔥 중복 안내창 방지 - 단일 Toaster만 표시 */}
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'glass',
          duration: 3000, // 🔥 3초로 단축
          style: {
            padding: '16px',
            color: '#1e1e1e',
            zIndex: 9999, // 🔥 최상위 표시
          },
          success: {
            iconTheme: {
              primary: '#10b981', // 🔥 녹색으로 변경
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // 🔥 빨간색
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Header />
      
      <AnimatePresence mode="wait">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      <Footer />
    </div>
  );
};

export default Layout;
