import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShare, FaTwitter, FaFacebook, FaLink, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ShareButtonProps {
  type: 'portfolio' | 'artist';
  data: any;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ type, data, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    if (shareUrl) return shareUrl;

    setIsGenerating(true);
    try {
      // 임시로 현재 URL 사용
      const currentUrl = window.location.href;
      setShareUrl(currentUrl);
      return currentUrl;
    } catch (error) {
      console.error('Failed to generate share link:', error);
      toast.error('공유 링크 생성에 실패했습니다');
    } finally {
      setIsGenerating(false);
    }
    return null;
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'copy') => {
    const url = await generateShareLink();
    if (!url) return;

    const text = type === 'portfolio' 
      ? `나의 K-POP 포트폴리오를 확인해보세요! 🎵`
      : `${data.artist} - ${data.track}의 실시간 차트 순위! 🎵`;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('링크가 복사되었습니다!');
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <FaShare className="w-4 h-4" />
        <span>공유하기</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Share Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg z-20 overflow-hidden"
            >
              <button
                onClick={() => handleShare('twitter')}
                disabled={isGenerating}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <FaTwitter className="w-5 h-5 text-blue-400" />
                <span>Twitter</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                disabled={isGenerating}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <FaFacebook className="w-5 h-5 text-blue-600" />
                <span>Facebook</span>
              </button>

              <button
                onClick={() => handleShare('copy')}
                disabled={isGenerating}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {copied ? (
                  <FaCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <FaLink className="w-5 h-5 text-gray-600" />
                )}
                <span>{copied ? '복사됨!' : '링크 복사'}</span>
              </button>

              {isGenerating && (
                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                  링크 생성 중...
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareButton;