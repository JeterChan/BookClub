import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Hero from './Hero';
import Features from './Features';
import Testimonials from './Testimonials';
import Newsletter from './Newsletter';
import AuthModal from '../auth/AuthModal';
import Logo from '../../components/Logo';
import Header from '../../components/Header';

export default function Mainpage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // 6個功能按鈕
  const features = [
    { 
      title: '我的儀表板', 
      description: '查看個人統計與活動',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      path: '/dashboard'
    },
    { 
      title: '探索社團', 
      description: '尋找感興趣的讀書社團',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      path: '/clubs'
    },
    { 
      title: '討論區', 
      description: '參與書籍討論',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      path: '/discussions'
    },
    { 
      title: '我的社團', 
      description: '管理已加入的社團',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      path: '/account?tab=club'
    },
    { 
      title: '個人資料', 
      description: '編輯個人資訊設定',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      path: '/account'
    },
    { 
      title: '建立社團', 
      description: '創建新的讀書社團',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      path: '/clubs/create'
    },
  ];

  // 如果未登入，顯示原有的行銷頁面
  if (!isAuthenticated) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#04c0f4]/5 to-[#04c0f4]/10">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Logo className="space-x-2" />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-[#04c0f4] transition-colors">功能</a>
              <a href="#testimonials" className="text-gray-600 hover:text-[#04c0f4] transition-colors">評價</a>
              <a href="#newsletter" className="text-gray-600 hover:text-[#04c0f4] transition-colors">訂閱</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base text-[#04c0f4] hover:text-[#0398c4] font-medium transition-colors"
              >
                登入
              </button>
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-[#04c0f4] text-white rounded-lg hover:bg-[#0398c4] font-medium transition-all shadow-lg shadow-[#04c0f4]/30 hover:shadow-xl hover:shadow-[#04c0f4]/40"
              >
                免費註冊
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20">
        <Hero onOpenAuth={handleOpenAuth} />
        <Features />
        <Testimonials />
        <Newsletter />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1">
              <Logo className="space-x-2 mb-4" />
              <p className="text-sm text-gray-400">讓閱讀更有溫度,讓交流更有深度</p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">產品</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-brand-primary transition-colors">功能介紹</a></li>
                <li><a href="#" className="hover:text-brand-primary transition-colors">使用指南</a></li>
                <li><a href="#" className="hover:text-brand-primary transition-colors">定價方案</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">支援</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-brand-primary transition-colors">幫助中心</a></li>
                <li><a href="#" className="hover:text-brand-primary transition-colors">聯絡我們</a></li>
                <li><a href="#" className="hover:text-brand-primary transition-colors">隱私政策</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">社群</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#04c0f4] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#04c0f4] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center text-gray-500">
             2025 BookClub. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          mode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
    );
  }

  // 登入後顯示功能選單頁面
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#04c0f4]/5 to-[#04c0f4]/10">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            歡迎回來！
          </h1>
          <p className="text-lg text-gray-600">
            選擇您想要前往的功能
          </p>
        </div>

        {/* 6個功能按鈕 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => navigate(feature.path)}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#04c0f4] to-[#0398c4] rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#04c0f4] transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
