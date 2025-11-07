// frontend/src/pages/LandingPage.tsx
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

/**
 * LandingPage - 首頁/歡迎頁面
 * 當使用者未登入時顯示
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 如果已登入，重定向到探索頁面
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/clubs');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左側：文字內容 */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                讓閱讀
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                  {' '}更有溫度
                </span>
              </h1>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                讓交流更有深度
              </h2>
            </div>

            <p className="text-xl text-gray-600">
              加入 BookClub，與志同道合的書友一起分享閱讀心得，探索書中的無限可能
            </p>

            {/* CTA 按鈕 */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                立即開始
              </button>
              <button
                onClick={() => navigate('/clubs')}
                className="px-8 py-4 bg-white hover:bg-gray-50 text-cyan-500 border-2 border-cyan-500 rounded-xl font-semibold text-lg transition-colors"
              >
                瀏覽社團
              </button>
            </div>

            {/* 統計數據 */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-4xl font-bold text-cyan-500 mb-1">10K+</div>
                <div className="text-sm text-gray-600">活躍會員</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-cyan-500 mb-1">500+</div>
                <div className="text-sm text-gray-600">讀書社團</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-1">50K+</div>
                <div className="text-sm text-gray-600">書籍討論</div>
              </div>
            </div>
          </div>

          {/* 右側：插圖 */}
          <div className="relative animate-slide-up">
            <div className="relative z-10">
              {/* 主卡片 */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-center w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                  <svg
                    className="w-32 h-32 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>

              {/* 裝飾卡片 */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl shadow-lg transform -rotate-12"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl shadow-lg transform rotate-12"></div>
            </div>

            {/* 背景圓形 */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full transform scale-150 -z-10 opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              為什麼選擇 BookClub？
            </h2>
            <p className="text-xl text-gray-600">
              我們提供最完善的讀書會平台，讓閱讀變得更有趣
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">多元社群</h3>
              <p className="text-gray-600">
                加入各種主題的讀書會，找到志同道合的書友，一起分享閱讀的樂趣
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">深度討論</h3>
              <p className="text-gray-600">
                參與書籍討論，分享你的見解，從不同角度理解每一本書的精髓
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">線上活動</h3>
              <p className="text-gray-600">
                定期舉辦線上讀書會活動，與作者對話，參加讀書心得分享會
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            準備好開始你的閱讀之旅了嗎？
          </h2>
          <p className="text-xl text-white/90 mb-8">
            立即加入 BookClub，與千萬書友一起探索書籍的無限可能
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white hover:bg-gray-100 text-cyan-600 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            免費註冊
          </button>
        </div>
      </div>
    </div>
  );
}
