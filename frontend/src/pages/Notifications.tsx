import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore';
import NotificationItem from '../components/notifications/NotificationItem';
import { BellIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';

const NOTIFICATIONS_PER_PAGE = 10;

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, loading, error, fetchNotifications, markAsRead } = useNotificationStore();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // 獲取更多通知以支持分頁
    fetchNotifications(undefined, 100);
  }, [fetchNotifications]);

  // 計算分頁
  const totalPages = Math.ceil(notifications.length / NOTIFICATIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * NOTIFICATIONS_PER_PAGE;
  const endIndex = startIndex + NOTIFICATIONS_PER_PAGE;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 返回按鈕 */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>返回</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">通知</h1>
            <p className="text-gray-600 mt-2">
              {notifications.length > 0 
                ? `共 ${notifications.length} 則通知` 
                : '查看您的所有通知'}
            </p>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暫無通知</h3>
          <p className="text-gray-500">當有新的活動或加入請求時，您會在這裡看到通知</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {currentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          </div>

          {/* 分頁控制 */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                className="px-4 py-2"
              >
                上一頁
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // 只顯示當前頁附近的頁碼
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                className="px-4 py-2"
              >
                下一頁
              </Button>
            </div>
          )}

          {/* 頁面資訊 */}
          <div className="mt-4 text-center text-sm text-gray-600">
            顯示 {startIndex + 1} - {Math.min(endIndex, notifications.length)} / {notifications.length} 則通知
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;

