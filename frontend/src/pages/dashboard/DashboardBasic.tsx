import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function DashboardBasic() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const stats = [
    { label: '參加社團', value: '5', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: '總留言數', value: '142', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { label: '本週活動', value: '8', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: '閱讀進度', value: '67%', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  const recentActivity = [
    { club: '現代文學讀書會', action: '發表了留言', time: '2 小時前', book: '挪威的森林' },
    { club: '科幻小說愛好者', action: '加入了討論', time: '5 小時前', book: '三體' },
    { club: '經典名著研讀', action: '完成了閱讀', time: '1 天前', book: '傲慢與偏見' },
    { club: '推理小說社', action: '新增了筆記', time: '2 天前', book: '東方快車謀殺案' },
  ];

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 10px;
          border: 2px solid rgba(55, 65, 81, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
        }
      `}</style>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Book Club Progress */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4">讀書會進度</h3>
          
          {/* Scrollable Container */}
          <div 
            className="custom-scrollbar overflow-y-auto pr-2"
            style={{
              maxHeight: 'calc(3 * 88px)', // 每個項目約88px高度，顯示3個
              scrollbarWidth: 'thin',
              scrollbarColor: '#3b82f6 #374151'
            }}
          >
            <div className="space-y-4">
              {[
                { name: 'Fantasy Readers', date: 'Due: 7/30', progress: 75 },
                { name: 'Member Buddies - Draft sharing', date: 'Due: 4/02', progress: 85 },
                { name: 'Clubhouse Q&A - Moderator prep', date: 'Due: 8/10', progress: 50 },
                { name: '經典文學讀書會', date: 'Due: 8/15', progress: 60 },
                { name: '科幻小說探索', date: 'Due: 8/20', progress: 40 },
                { name: '推理小說研究社', date: 'Due: 8/25', progress: 90 }
              ].map((club, index) => (
                <div key={index} className="flex items-start space-x-3">
                  {/* Book Icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded flex-shrink-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                  
                  {/* Progress Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-medium text-white">{club.name}</h4>
                      <span className="text-xs text-gray-400">{club.progress}%</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{club.date}</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${club.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近動態</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {activity.club.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    在 <span className="font-semibold text-brand-primary">{activity.club}</span> {activity.action}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">《{activity.book}》</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              {user?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="font-semibold text-gray-900">{user?.display_name || '使用者名稱'}</h3>
            <p className="text-sm text-gray-500 mt-1">{user?.email || 'user@example.com'}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">加入日期</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' }) : '2024 年 1 月'}
              </p>
            </div>
            <button 
              onClick={() => navigate('/account')}
              className="mt-4 px-4 py-2 rounded-lg transition-colors text-sm font-medium inline-block"
              style={{ backgroundColor: '#04c0f4', color: '#ffffff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0398c4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#04c0f4'}
            >
              編輯個人資料
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/clubs/create')}
              className="w-full py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center space-x-3"
            >
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm text-gray-700">建立新社團</span>
            </button>
            <button 
              onClick={() => navigate('/clubs')}
              className="w-full py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center space-x-3"
            >
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-gray-700">探索社團</span>
            </button>
            <button 
              onClick={() => navigate('/discussions')}
              className="w-full py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center space-x-3"
            >
              <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm text-gray-700">討論區</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
