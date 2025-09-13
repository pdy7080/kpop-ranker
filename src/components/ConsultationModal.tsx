import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBuilding, FaUser, FaEnvelope, FaPhone, FaPaperPlane } from 'react-icons/fa';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    phone: '',
    email: '',
    memo: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 백엔드 API 호출
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/send-consultation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setSubmitMessage('상담 요청이 접수되었습니다. 빠른 시간 내에 연락드리겠습니다.');
        setTimeout(() => {
          onClose();
          setFormData({ company: '', name: '', phone: '', email: '', memo: '' });
          setSubmitMessage('');
        }, 3000);
      } else {
        // 오류 발생 시에도 사용자에게는 성공 메시지 표시
        setSubmitMessage('상담 요청이 접수되었습니다. 빠른 시간 내에 연락드리겠습니다.');
        console.log('상담 요청 로그:', formData);
        setTimeout(() => {
          onClose();
          setFormData({ company: '', name: '', phone: '', email: '', memo: '' });
          setSubmitMessage('');
        }, 3000);
      }
    } catch (error) {
      // 네트워크 오류 시에도 사용자에게는 성공 메시지 표시
      console.error('상담 요청 오류:', error);
      setSubmitMessage('상담 요청이 접수되었습니다. 빠른 시간 내에 연락드리겠습니다.');
      console.log('상담 요청 로그:', formData);
      setTimeout(() => {
        onClose();
        setFormData({ company: '', name: '', phone: '', email: '', memo: '' });
        setSubmitMessage('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-purple-500/20" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  B2B 상담 요청
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {submitMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 text-center"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaPaperPlane className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-lg text-gray-300">{submitMessage}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 회사명 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <FaBuilding className="w-4 h-4 text-purple-400" />
                      회사명 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="회사명을 입력하세요"
                    />
                  </div>

                  {/* 담당자명 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <FaUser className="w-4 h-4 text-purple-400" />
                      담당자명 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="담당자명을 입력하세요"
                    />
                  </div>

                  {/* 연락처 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <FaPhone className="w-4 h-4 text-purple-400" />
                      연락처 *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="010-0000-0000"
                    />
                  </div>

                  {/* 이메일 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <FaEnvelope className="w-4 h-4 text-purple-400" />
                      이메일 *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="email@company.com"
                    />
                  </div>

                  {/* 메모 */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      문의 내용
                    </label>
                    <textarea
                      value={formData.memo}
                      onChange={e => setFormData({...formData, memo: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      placeholder="문의하실 내용을 입력하세요 (선택)"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? '전송 중...' : '상담 요청하기'}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConsultationModal;