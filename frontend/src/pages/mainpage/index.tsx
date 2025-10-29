import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Hero from './Hero';
import Features from './Features';
import Testimonials from './Testimonials';
import Newsletter from './Newsletter';
import AuthModal from '../auth/AuthModal';

export default function Mainpage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // 根據 flow-overview.md: 已登入用戶應該自動導向 Dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#04c0f4]/5 to-[#04c0f4]/10">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">BookClub</span>
            </div>

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
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">BookClub</span>
              </div>
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
