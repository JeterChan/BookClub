import { Link } from 'react-router-dom';
import type { Activity } from '../../services/dashboardService';
import { Card } from '../ui/Card';
import { formatRelativeTime } from '../../utils/dateFormatter';

interface ActivityTimelineProps {
  activities: Activity[];
}

const getActivityIcon = (type: Activity['type']): string => {
  const icons: Record<Activity['type'], string> = {
    join_club: '🎉',
    post_discussion: '💬',
    complete_book: '✅',
    comment: '💭',
  };
  return icons[type];
};

/**
 * ActivityTimeline - Display recent user activities
 * Shows timeline of recent 10 activities
 */
export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  const displayedActivities = activities.slice(0, 10);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活動</h3>
      
      {displayedActivities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-4xl mb-2">🌟</p>
          <p>還沒有任何活動記錄</p>
        </div>
      ) : (
        <div className="relative">
          {displayedActivities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4 mb-6 last:mb-0">
              {/* Timeline dot and line */}
              <div className="relative flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm z-10">
                  {getActivityIcon(activity.type)}
                </div>
                {index !== displayedActivities.length - 1 && (
                  <div className="w-px h-full bg-gray-200 absolute top-8"></div>
                )}
              </div>
              
              {/* Activity content */}
              <div className="flex-1 pt-1">
                <p className="text-sm text-gray-800">
                  {activity.description}
                  {activity.relatedEntity && (
                    <>
                      {' '}
                      <Link 
                        to={activity.relatedEntity.link}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                      >
                        {activity.relatedEntity.name}
                      </Link>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
