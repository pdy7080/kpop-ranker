// components/UserProfile.tsx
// 사용자 프로필 컴포넌트

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

interface User {
  id: number;
  email: string;
  name: string;
  profile_image?: string;
  provider: string;
  search_count?: number;
  portfolio_count?: number;
}

interface UserProfileProps {
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onLoginClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // 토큰 삭제
    localStorage.removeItem('token');
    
    // 로그아웃 콜백
    onLogout();
    
    // 드롭다운 닫기
    setShowDropdown(false);
  };

  const navigateToMyPage = () => {
    router.push('/mypage');
    setShowDropdown(false);
  };

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <span>로그인</span>
      </button>
    );
  }

  return (
    <div className="relative">
      {/* 프로필 버튼 */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {user.profile_image ? (
          <Image
            src={user.profile_image}
            alt={user.name}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {user.name}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 드롭다운 메뉴 */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* 클릭 외부 영역 */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* 드롭다운 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-20 overflow-hidden"
            >
              {/* 사용자 정보 */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {user.profile_image ? (
                    <Image
                      src={user.profile_image}
                      alt={user.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                {/* 통계 */}
                <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800">{user.search_count || 0}</p>
                    <p className="text-xs text-gray-500">검색</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800">{user.portfolio_count || 0}</p>
                    <p className="text-xs text-gray-500">포트폴리오</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      {user.provider === 'google' ? '구글' : '카카오'}
                    </p>
                    <p className="text-xs text-gray-500">로그인</p>
                  </div>
                </div>
              </div>
              
              {/* 메뉴 항목 */}
              <div className="py-2">
                <button
                  onClick={navigateToMyPage}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>마이페이지</span>
                </button>
                
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>설정</span>
                </button>
              </div>
              
              {/* 로그아웃 */}
              <div className="border-t border-gray-200 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>로그아웃</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
