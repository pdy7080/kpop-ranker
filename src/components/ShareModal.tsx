import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, MessageCircle, Facebook, Twitter, X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackInfo: {
    artist: string;
    title: string;
  };
  url: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, trackInfo, url }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `🎵 Check out "${trackInfo.title}" by ${trackInfo.artist} on KPOP Ranker!`;
  const hashtags = 'KPOP,KPOPRanker,Music';

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'bg-gray-600 hover:bg-gray-500',
      action: async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          prompt('이 링크를 복사하세요:', url);
        }
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-blue-500 hover:bg-blue-400',
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
        window.open(twitterUrl, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-500',
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank');
      }
    },
    {
      name: 'KakaoTalk',
      icon: MessageCircle,
      color: 'bg-yellow-500 hover:bg-yellow-400',
      action: () => {
        // KakaoTalk 공유는 Kakao SDK가 필요하므로 일단 링크 복사로 대체
        navigator.clipboard.writeText(`${shareText} ${url}`);
        alert('카카오톡으로 공유할 텍스트가 복사되었습니다!');
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <Share2 className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Share Track</h3>
            <p className="text-gray-400 text-sm">
              {trackInfo.artist} - {trackInfo.title}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`${option.color} text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-all transform hover:scale-105`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{option.name}</span>
                </button>
              );
            })}
          </div>

          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-green-400 text-sm"
            >
              ✓ 링크가 복사되었습니다!
            </motion.div>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full py-3 text-gray-400 hover:text-white transition-colors"
          >
            닫기
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareModal;
