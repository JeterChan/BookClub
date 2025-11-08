import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { 
  Notification, 
  NewMemberContent, 
  EventCreatedContent 
} from '../../types/notification';
import { 
  UserPlusIcon, 
  CalendarIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case "NEW_MEMBER":
        return <UserPlusIcon className="h-6 w-6 text-blue-500" />;
      case "EVENT_CREATED":
        return <CalendarIcon className="h-6 w-6 text-green-500" />;
      case "NEW_POST":
        return <DocumentTextIcon className="h-6 w-6 text-purple-500" />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    switch (notification.type) {
      case "NEW_MEMBER": {
        const content = notification.content as NewMemberContent;
        return (
          <>
            <span className="font-semibold">{content.user_display_name}</span> 申請加入{' '}
            <span className="font-semibold">{content.club_name}</span>
          </>
        );
      }
      case "EVENT_CREATED": {
        const content = notification.content as EventCreatedContent;
        return (
          <>
            新活動：<span className="font-semibold">{content.event_title}</span>
          </>
        );
      }
      default:
        return '新通知';
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    switch (notification.type) {
      case "NEW_MEMBER": {
        const content = notification.content as NewMemberContent;
        // 導航到讀書會設定頁面處理加入請求
        navigate(`/clubs/${content.club_id}/settings`);
        break;
      }
      case "EVENT_CREATED": {
        const content = notification.content as EventCreatedContent;
        navigate(`/clubs/${content.club_id}/events/${content.event_id}`);
        break;
      }
      default:
        break;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: zhTW
  });

  return (
    <div
      onClick={handleClick}
      className={`
        p-4 border-b cursor-pointer transition-colors
        ${!notification.is_read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
            {getMessage()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
        </div>
        {!notification.is_read && (
          <div className="flex-shrink-0">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
