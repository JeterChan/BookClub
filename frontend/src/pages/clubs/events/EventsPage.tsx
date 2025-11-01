import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventsList, isEventPast } from '../../../services/eventService';
import type { EventListItem } from '../../../services/eventService';
import { EventCard } from '../../../components/events/EventCard';
import { toast } from 'react-hot-toast';

export const EventsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<EventListItem[]>([]);
  const [pastEvents, setPastEvents] = useState<EventListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadEvents();
  }, [clubId, currentPage]);

  const loadEvents = async () => {
    if (!clubId) return;

    try {
      setLoading(true);
      const response = await getEventsList(Number(clubId), {
        page: currentPage,
        pageSize: 20,
        sortBy: 'event_datetime',
        order: 'asc',
      });

      // 分離即將舉行和已結束的活動
      const upcoming: EventListItem[] = [];
      const past: EventListItem[] = [];

      response.items.forEach((event) => {
        if (isEventPast(event.eventDatetime)) {
          past.push(event);
        } else {
          upcoming.push(event);
        }
      });

      setUpcomingEvents(upcoming);
      setPastEvents(past);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || '載入活動列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigate(`/clubs/${clubId}/events/create`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isEmpty = upcomingEvents.length === 0 && pastEvents.length === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">讀書會活動</h1>
          <p className="text-gray-600 mt-2">查看所有活動，並報名參加</p>
        </div>
        <button
          onClick={handleCreateEvent}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          建立活動
        </button>
      </div>

      {/* 空狀態 */}
      {isEmpty && (
        <div className="text-center py-16">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">尚無活動</h3>
          <p className="mt-2 text-gray-600">目前這個讀書會還沒有任何活動</p>
          <button
            onClick={handleCreateEvent}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            建立第一個活動
          </button>
        </div>
      )}

      {/* 即將舉行的活動 */}
      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="inline-block w-1 h-6 bg-blue-600 mr-3"></span>
            即將舉行
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({upcomingEvents.length} 個活動)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* 已結束的活動 */}
      {pastEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="inline-block w-1 h-6 bg-gray-400 mr-3"></span>
            已結束
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({pastEvents.length} 個活動)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* 分頁控制器 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一頁
          </button>
          <span className="text-gray-700">
            第 {currentPage} 頁，共 {totalPages} 頁
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
