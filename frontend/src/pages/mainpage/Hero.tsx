import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export default function Hero({ onOpenAuth }: HeroProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-light/30 via-white to-brand-primary/20 py-20 sm:py-32 lg:py-40">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-light/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              讓閱讀
              <span className="bg-gradient-to-r from-brand-primary to-blue-500 bg-clip-text text-transparent">
                {" "}更有溫度
              </span>
              <br />
              讓交流更有深度
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              加入 BookClub,與志同道合的書友一起分享閱讀心得,探索書中的無限可能
            </p>

            {/* CTA Buttons - 根據登入狀態顯示不同內容 */}
            {!isAuthenticated ? (
              // 未登入：顯示註冊/登入按鈕
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-8 py-4 bg-[#04c0f4] text-white rounded-xl hover:bg-[#0398c4] font-semibold text-lg transition-all shadow-xl shadow-[#04c0f4]/30 hover:shadow-2xl hover:shadow-[#04c0f4]/40 hover:-translate-y-0.5"
                >
                  立即開始
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-8 py-4 bg-white text-[#04c0f4] border-2 border-[#04c0f4] rounded-xl hover:bg-[#04c0f4]/10 font-semibold text-lg transition-all"
                >
                  瀏覽社團
                </button>
              </div>
            ) : (
              // 已登入：顯示用戶資訊和功能入口
              <div className="space-y-6">
                {/* 用戶頭像和歡迎訊息 */}
                <div className="flex items-center gap-4 justify-center lg:justify-start">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="h-16 w-16 rounded-full border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#04c0f4] to-blue-500 text-white text-2xl font-bold shadow-lg border-4 border-white">
                      {user?.display_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="text-center lg:text-left">
                    <p className="text-sm text-gray-600">歡迎回來！</p>
                    <p className="text-xl font-bold text-gray-900">{user?.display_name}</p>
                  </div>
                </div>

                {/* 功能快速入口 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto lg:mx-0">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#04c0f4] hover:bg-[#04c0f4]/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#04c0f4]/10 group-hover:bg-[#04c0f4]/20 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-[#04c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#04c0f4]">儀表板</span>
                  </button>

                  <button
                    onClick={() => navigate('/clubs')}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#04c0f4] hover:bg-[#04c0f4]/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#04c0f4]/10 group-hover:bg-[#04c0f4]/20 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-[#04c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#04c0f4]">探索社團</span>
                  </button>

                  <button
                    onClick={() => navigate('/clubs?view=my')}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#04c0f4] hover:bg-[#04c0f4]/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#04c0f4]/10 group-hover:bg-[#04c0f4]/20 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-[#04c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#04c0f4]">我的社團</span>
                  </button>

                  <button
                    onClick={() => navigate('/discussions')}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#04c0f4] hover:bg-[#04c0f4]/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#04c0f4]/10 group-hover:bg-[#04c0f4]/20 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-[#04c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#04c0f4]">討論區</span>
                  </button>

                  <button
                    onClick={() => navigate('/notifications')}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#04c0f4] hover:bg-[#04c0f4]/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#04c0f4]/10 group-hover:bg-[#04c0f4]/20 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-[#04c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#04c0f4]">通知</span>
                  </button>

                  <button
                    onClick={() => navigate('/account/profile')}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#04c0f4] hover:bg-[#04c0f4]/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#04c0f4]/10 group-hover:bg-[#04c0f4]/20 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-[#04c0f4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#04c0f4]">個人資料</span>
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-[#04c0f4]">10K+</div>
                <div className="text-sm text-gray-600 mt-1">活躍會員</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-[#04c0f4]">500+</div>
                <div className="text-sm text-gray-600 mt-1">讀書社團</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-brand-primary">50K+</div>
                <div className="text-sm text-gray-600 mt-1">書籍討論</div>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main Circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-blue-500 rounded-full opacity-10 animate-pulse" />
              
              {/* Book Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-white rounded-3xl shadow-2xl p-12 transform hover:rotate-3 transition-transform duration-300">
                  <svg className="w-full h-full text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute top-10 -left-10 w-32 h-40 bg-white rounded-xl shadow-xl transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                <div className="p-4">
                  <div className="w-full h-20 bg-gradient-to-br from-brand-primary/20 to-brand-light rounded-lg mb-2" />
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded" />
                    <div className="h-2 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 -right-10 w-32 h-40 bg-white rounded-xl shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <div className="p-4">
                  <div className="w-full h-20 bg-gradient-to-br from-blue-500/20 to-brand-primary/20 rounded-lg mb-2" />
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded" />
                    <div className="h-2 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 sm:h-24" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
