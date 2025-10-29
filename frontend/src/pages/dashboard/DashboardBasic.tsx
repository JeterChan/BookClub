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

        {/* Activity Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">本週活動趨勢</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[20, 35, 45, 60, 50, 70, 55].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                <div
                  className="w-full bg-gradient-to-t from-brand-primary to-brand-primary/50 rounded-t-lg transition-all hover:from-brand-primary/90 hover:to-brand-primary/40"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500">
                  {['週一', '週二', '週三', '週四', '週五', '週六', '週日'][index]}
                </span>
              </div>
            ))}
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
  );
}
