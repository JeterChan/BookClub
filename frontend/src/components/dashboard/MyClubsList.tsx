import { Link } from 'react-router-dom';
import type { Club } from '../../services/dashboardService';
import { Card } from '../ui/Card';
import { formatRelativeTime } from '../../utils/dateFormatter';
import { getImageUrl } from '../../utils/imageUrl';

interface MyClubsListProps {
  clubs: Club[];
}

/**
 * MyClubsList - Display user's clubs
 * Shows up to 3 clubs with option to view all
 */
export const MyClubsList = ({ clubs }: MyClubsListProps) => {
  const displayedClubs = clubs.slice(0, 3);
  const hasMore = clubs.length > 3;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">我的讀書會</h3>
        {hasMore && (
          <Link 
            to="/clubs/my-clubs" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
          >
            查看全部 ({clubs.length})
          </Link>
        )}
      </div>
      
      {displayedClubs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-4xl mb-2">📚</p>
          <p>尚未加入任何讀書會</p>
          <Link 
            to="/clubs" 
            className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
          >
            探索讀書會 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedClubs.map((club) => (
            <Link
              key={club.id}
              to={`/clubs/${club.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-black hover:bg-gray-50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{club.name}</h4>
                    {/* 狀態標籤 */}
                    {club.status === 'active' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-success-700 text-white rounded">
                        進行中
                      </span>
                    )}
                    {club.status === 'completed' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-600 text-white rounded">
                        已完成
                      </span>
                    )}
                    {club.status === 'planning' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-400 text-white rounded">
                        規劃中
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>👥 {club.memberCount} 成員</span>
                    <span>🕒 {formatRelativeTime(club.lastActivity)}</span>
                  </div>
                </div>
                {club.coverImage && (
                  <img 
                    src={getImageUrl(club.coverImage) || ''} 
                    alt={club.name}
                    className="w-12 h-12 rounded object-cover ml-4"
                  />
                )}
              </div>
              
              {/* 進度條 */}
              {club.totalEvents > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600">活動進度</span>
                    <span className="font-medium text-gray-900">{club.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-success-700 h-2 rounded-full transition-all"
                      style={{ width: `${club.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{club.completedEvents} / {club.totalEvents} 活動完成</span>
                    {club.upcomingEvents > 0 && (
                      <span>{club.upcomingEvents} 場即將到來</span>
                    )}
                  </div>
                </div>
              )}
              {club.totalEvents === 0 && (
                <div className="mt-3 text-xs text-gray-500 italic">
                  尚未規劃活動
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};
