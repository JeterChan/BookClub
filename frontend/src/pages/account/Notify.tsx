export default function Notify() {
  const notifications = [
    { id: 1, type: 'comment', club: '古典文學社', message: '有人回覆了您的評論', time: '2小時前', unread: true },
    { id: 2, type: 'club', club: '科幻讀書會', message: '新增了一則公告', time: '5小時前', unread: true },
    { id: 3, type: 'system', message: '您的閱讀目標已達成', time: '1天前', unread: false },
    { id: 4, type: 'comment', club: '推理小說', message: '您的評論獲得了10個讚', time: '2天前', unread: false },
  ];

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">通知設定</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-medium text-gray-900">社團活動通知</h3>
              <p className="text-sm text-gray-500">新公告、新討論、活動提醒</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:shadow-md"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-medium text-gray-900">評論互動通知</h3>
              <p className="text-sm text-gray-500">回覆、按讚、提及</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:shadow-md"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-medium text-gray-900">系統通知</h3>
              <p className="text-sm text-gray-500">重要更新、帳號安全</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:shadow-md"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">最近通知</h2>
          <button className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium">
            全部標為已讀
          </button>
        </div>
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
                notif.unread ? 'bg-brand-light/30' : 'bg-gray-50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-brand-primary' : 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {notif.type === 'comment' && (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                  {notif.type === 'club' && (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                  {notif.type === 'system' && (
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {notif.club && <span className="text-sm font-medium text-gray-900">{notif.club}</span>}
                </div>
                <p className="text-sm text-gray-700">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
