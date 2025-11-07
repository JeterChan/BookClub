import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUserClubEvents, type ClubEvent } from '../../services/userEventService';
import { getImageUrl } from '../../utils/imageUrl';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Button } from '../../components/ui/Button';

export default function MyEvents() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // 篩選狀態
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [participationFilter, setParticipationFilter] = useState<string>('all');

  useEffect(() => {
    // 從 URL 參數讀取篩選條件
    const status = searchParams.get('status') || 'all';
    const participation = searchParams.get('participation') || 'all';
    const pageNum = parseInt(searchParams.get('page') || '1');
    
    setStatusFilter(status);
    setParticipationFilter(participation);
    setPage(pageNum);
    
    loadEvents(pageNum, status, participation);
  }, [searchParams]);

  const loadEvents = async (
    pageNum: number,
    status: string,
    participation: string
  ) => {
    try {
      setLoading(true);
      const response = await getUserClubEvents({
        page: pageNum,
        pageSize: 20,
        status: status === 'all' ? undefined : status as any,
        participation: participation === 'all' ? undefined : participation as any,
      });
      setEvents(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      // Error handling - silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: 'status' | 'participation', value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(filterType, value);
    newParams.set('page', '1'); // 重置到第一頁
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const getEventStatusBadge = (event: ClubEvent) => {
    const eventDate = new Date(event.eventDatetime);
    const now = new Date();
    const isPast = eventDate < now;

    if (isPast) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          已結束
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-success-100 text-success-700">
        即將舉行
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="mb-4"
          >
            ← 返回儀表板
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">我的活動</h1>
          <p className="text-gray-600 mt-2">瀏覽您參與讀書會的所有活動</p>
        </div>

        {/* Filters */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* 狀態篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活動狀態
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <option value="all">全部</option>
                <option value="published">即將舉行</option>
                <option value="completed">已結束</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>

            {/* 參與狀態篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                參與狀態
              </label>
              <select
                value={participationFilter}
                onChange={(e) => handleFilterChange('participation', e.target.value)}
                className="block w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <option value="all">全部</option>
                <option value="registered">已報名</option>
                <option value="not_registered">未報名</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-gray-600 mb-4">沒有找到符合條件的活動</p>
            <Button onClick={() => navigate('/clubs')} variant="primary">
              探索讀書會
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/clubs/${event.clubId}/events/${event.id}`)}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all cursor-pointer animate-fade-in"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {event.title}
                        </h3>
                        {event.isRegistered && (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-success-100 text-success-700">
                            ✓ 已報名
                          </span>
                        )}
                        {getEventStatusBadge(event)}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/clubs/${event.clubId}`);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:underline mb-3 inline-block"
                      >
                        📚 {event.clubName}
                      </button>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          🕒 {format(new Date(event.eventDatetime), 'yyyy年M月d日 HH:mm', { locale: zhTW })}
                        </span>
                        <span className="flex items-center">
                          👥 {event.currentParticipants}
                          {event.maxParticipants && event.maxParticipants > 0 && ` / ${event.maxParticipants}`} 人
                        </span>
                      </div>

                      <p className="mt-3 text-gray-600 text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {event.clubCoverImageUrl && (
                      <img
                        src={getImageUrl(event.clubCoverImageUrl) || ''}
                        alt={event.clubName}
                        className="w-24 h-24 rounded-xl object-cover ml-6 flex-shrink-0"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  上一頁
                </Button>
                <span className="text-gray-600">
                  第 {page} / {totalPages} 頁
                </span>
                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  下一頁
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
