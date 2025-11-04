import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { getUserClubEvents, type ClubEvent } from '../../services/userEventService';
import { getImageUrl } from '../../utils/imageUrl';
import { formatRelativeTime } from '../../utils/dateFormatter';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export const RecentEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getUserClubEvents({
        page: 1,
        pageSize: 3,
        status: 'published'
      });
      setEvents(response.items);
    } catch (err: any) {
      setError(err.message || '載入活動失敗');
    } finally {
      setLoading(false);
    }
  };

  const getEventStatusBadge = (event: ClubEvent) => {
    const eventDate = new Date(event.eventDatetime);
    const now = new Date();
    const isPast = eventDate < now;

    if (isPast) {
      return <span className="text-xs text-gray-500">已結束</span>;
    }

    return (
      <span className="text-xs text-blue-600 font-medium">即將舉行</span>
    );
  };

  const getParticipantsDisplay = (event: ClubEvent) => {
    if (event.maxParticipants === null || event.maxParticipants === 0) {
      return `${event.currentParticipants}人已報名`;
    }
    return `${event.currentParticipants}/${event.maxParticipants}人`;
  };

  if (loading) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活動</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活動</h3>
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">最近活動</h3>
        {events.length > 0 && (
          <Link
            to="/activities/my-events"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
          >
            查看全部
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-4xl mb-2">📅</p>
          <p className="mb-2">目前沒有即將舉行的活動</p>
          <Link
            to="/clubs"
            className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
          >
            探索讀書會 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/clubs/${event.clubId}/events/${event.id}`)}
              className="block p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      📅 {event.title}
                    </h4>
                    {event.isRegistered && (
                      <span className="inline-flex items-center text-green-600 text-xs">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  
                  <Link
                    to={`/clubs/${event.clubId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline mb-2 inline-block"
                  >
                    📚 {event.clubName}
                  </Link>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      🕒 {format(new Date(event.eventDatetime), 'MM/dd HH:mm', { locale: zhTW })}
                      <span className="ml-1 text-xs">
                        ({formatRelativeTime(event.eventDatetime)})
                      </span>
                    </span>
                    <span>👥 {getParticipantsDisplay(event)}</span>
                    {getEventStatusBadge(event)}
                  </div>
                </div>
                
                {event.clubCoverImageUrl && (
                  <img
                    src={getImageUrl(event.clubCoverImageUrl) || ''}
                    alt={event.clubName}
                    className="w-12 h-12 rounded object-cover ml-4 flex-shrink-0"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
