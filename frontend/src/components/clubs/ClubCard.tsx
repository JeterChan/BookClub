// frontend/src/components/clubs/ClubCard.tsx
import { useNavigate } from 'react-router-dom';
import type { BookClubListItem } from '../../types/bookClub';

interface ClubCardProps {
  club: BookClubListItem;
}

/**
 * ClubCard - 讀書會卡片元件
 * 用於探索頁面展示讀書會摘要資訊
 */
export const ClubCard = ({ club }: ClubCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/clubs/${club.id}`);
  };

  // 如果沒有簡介，則顯示預設文字
  const descriptionText = club.description || '暫無簡介';

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* 封面圖片 */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {club.cover_image_url ? (
          <img
            src={club.cover_image_url}
            alt={club.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-brand-light">
            <span className="text-6xl">📚</span>
          </div>
        )}
      </div>

      {/* 卡片內容 */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {club.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {descriptionText}
        </p>

        {/* 底部資訊 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center">
            <span className="mr-1">👥</span>
            {club.member_count} 成員
          </span>
          
          {/* 標籤 */}
          <div className="flex gap-1 flex-wrap justify-end">
            {club.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-brand-50 text-brand-700 rounded-full text-xs"
              >
                {tag.name}
              </span>
            ))}
            {club.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{club.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
