// frontend/src/components/clubs/ClubCard.tsx
import { useNavigate } from 'react-router-dom';
import type { BookClubListItem } from '../../types/bookClub';
import { getImageUrl } from '../../utils/imageUrl';


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
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group"
      role="article"
    >
      {/* 封面圖片 - 可點擊 */}
      <div 
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        className="h-56 bg-gray-200 overflow-hidden relative cursor-pointer"
        role="button"
        tabIndex={0}
      >
        {club.cover_image_url ? (
          <img
            src={getImageUrl(club.cover_image_url) || ''}
            alt={club.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-7xl opacity-40">📚</span>
          </div>
        )}
      </div>

      {/* 卡片內容 */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">
          {club.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {descriptionText}
        </p>

        {/* 成員數和標籤 */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">{club.member_count} 成員</span>
          </div>
          
          {/* 標籤 */}
          <div className="flex gap-1.5 flex-wrap justify-end">
            {club.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* 查看詳情按鈕 */}
        <button
          onClick={handleClick}
          className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          查看詳情
        </button>
      </div>
    </div>
  );
};
