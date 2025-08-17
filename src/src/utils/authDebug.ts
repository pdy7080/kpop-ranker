/**
 * OAuth 디버깅 유틸리티
 * 브라우저 콘솔에서 실행하여 상태 확인
 */

export const checkAuthState = () => {
  console.log('🔍 Auth Debug Information:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 1. LocalStorage 확인
  const token = localStorage.getItem('auth_token');
  const userInfo = localStorage.getItem('user_info');
  
  console.log('📦 LocalStorage:');
  console.log('  Token:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
  
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      console.log('  User Info:', user);
    } catch (e) {
      console.log('  User Info: PARSE ERROR', userInfo);
    }
  } else {
    console.log('  User Info: NO USER INFO');
  }
  
  // 2. Cookies 확인
  console.log('🍪 Cookies:', document.cookie || 'NO COOKIES');
  
  // 3. SessionStorage 확인
  console.log('💾 SessionStorage:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      console.log(`  ${key}:`, sessionStorage.getItem(key));
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return {
    hasToken: !!token,
    hasUserInfo: !!userInfo,
    tokenPreview: token ? `${token.substring(0, 30)}...` : null,
    user: userInfo ? JSON.parse(userInfo) : null
  };
};

// 전역으로 사용 가능하도록 설정
if (typeof window !== 'undefined') {
  (window as any).checkAuthState = checkAuthState;
  (window as any).clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('refresh_token');
    sessionStorage.clear();
    console.log('✅ Auth data cleared. Please refresh the page.');
  };
  
  console.log('🔧 Auth Debug Tools Loaded');
  console.log('  - Run checkAuthState() to see auth status');
  console.log('  - Run clearAuth() to clear all auth data');
}

export default checkAuthState;
