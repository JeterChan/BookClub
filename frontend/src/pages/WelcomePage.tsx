// frontend/src/pages/WelcomePage.tsx
import { useNavigate } from 'react-router-dom';

/**
 * WelcomePage - 登入後的歡迎頁面
 * 提供快速導航功能
 */
const WelcomePage = () => {
  const navigate = useNavigate();

  // 快速操作卡片數據
  const quickActions = [
    {
      id: 'dashboard',
      title: '我的儀表板',
      description: '查看個人統計與活動',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      onClick: () => navigate('/dashboard'),
      bgColor: 'from-cyan-400 to-cyan-500'
    },
    {
      id: 'explore',
      title: '探索社團',
      description: '尋找感興趣的讀書社團',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      onClick: () => navigate('/clubs'),
      bgColor: 'from-cyan-400 to-cyan-500'
    },
    {
      id: 'discussions',
      title: '最近活動',
      description: '查看近期的活動',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => navigate('/activities/my-events'),
      bgColor: 'from-cyan-400 to-cyan-500'
    },
    {
      id: 'my-clubs',
      title: '我的讀書會',
      description: '管理已加入的讀書會',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      onClick: () => navigate('/clubs/my-clubs'),
      bgColor: 'from-cyan-400 to-cyan-500'
    },
    {
      id: 'profile',
      title: '個人資料',
      description: '編輯個人資訊設定',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: () => navigate('/profile'),
      bgColor: 'from-cyan-400 to-cyan-500'
    },
    {
      id: 'create',
      title: '建立社團',
      description: '創建新的讀書會社團',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => navigate('/clubs/create'),
      bgColor: 'from-cyan-400 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 歡迎標題 */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            歡迎回來！
          </h1>
          <p className="text-xl text-gray-600">
            選擇您想要前往的功能
          </p>
        </div>

        {/* 快速操作卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {quickActions.map((action, index) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* 圖標 */}
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${action.bgColor} flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>

              {/* 標題 */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {action.title}
              </h3>

              {/* 描述 */}
              <p className="text-gray-600 text-sm">
                {action.description}
              </p>
            </button>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            還不熟悉平台？
            <button
              onClick={() => navigate('/clubs')}
              className="text-cyan-500 hover:text-cyan-600 font-medium ml-2 underline"
            >
              從探索讀書會開始
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
