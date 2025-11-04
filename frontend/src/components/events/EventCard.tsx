import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isEventPast } from '../../services/eventService';
import type { EventListItem } from '../../services/eventService';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface EventCardProps {
  event: EventListItem;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const isPast = isEventPast(event.eventDatetime);

  const handleClick = () => {
    navigate(`/clubs/${event.clubId}/events/${event.id}`);
  };

  // 格式化活動時間
  const formattedDate = format(new Date(event.eventDatetime), 'yyyy年M月d日 HH:mm', {
    locale: zhTW,
  });

  // 人數顯示邏輯
  const participantsDisplay = () => {
    // 當 maxParticipants 為 null 或 0 時，表示無人數限制
    if (event.maxParticipants === null || event.maxParticipants === 0) {
      return `${event.currentParticipants}人已報名`;
    }
    const isFull = event.currentParticipants >= event.maxParticipants;
    return (
      <span className={isFull ? 'text-red-600 font-semibold' : ''}>
        {event.currentParticipants}/{event.maxParticipants}
        {isFull && ' (已額滿)'}
      </span>
    );
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 cursor-pointer border border-gray-200"
    >
      {/* 標題與狀態 */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
          {event.title}
        </h3>
        <div className="flex flex-col items-end gap-1 ml-2">
          {event.isOrganizer && (
            <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium shrink-0">
              我是發起人
            </span>
          )}
          {isPast && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full shrink-0">
              已結束
            </span>
          )}
          {!isPast && event.isParticipating && !event.isOrganizer && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full shrink-0">
              已報名
            </span>
          )}
        </div>
      </div>

      {/* 活動時間 */}
      <div className="flex items-center text-sm text-gray-600 mb-3">
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>{formattedDate}</span>
      </div>

      {/* 發起人資訊 */}
      <div className="flex items-center text-sm text-gray-600 mb-3">
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span>
          發起人：{event.organizer.displayName}
          {event.isOrganizer && (
            <span className="ml-1 text-blue-600">(我)</span>
          )}
        </span>
      </div>

      {/* 報名人數 */}
      <div className="flex items-center text-sm text-gray-700">
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {participantsDisplay()}
      </div>
    </div>
  );
};
