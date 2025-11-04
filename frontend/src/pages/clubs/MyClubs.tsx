import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { listBookClubs } from '../../services/bookClubService';
import { getImageUrl } from '../../utils/imageUrl';
import type { BookClubListItem } from '../../types/bookClub';
import toast from 'react-hot-toast';

export default function MyClubs() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<BookClubListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadMyClubs();
  }, [page]);

  const loadMyClubs = async () => {
    try {
      setLoading(true);
      const response = await listBookClubs({
        page,
        pageSize: 20,
        myClubs: true,
      });
      setClubs(response.items);
      setTotalPages(response.pagination.total_pages);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '載入我的讀書會失敗');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 返回按鈕 */}
        <div className="mb-6">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
          >
            ← 返回儀表板
          </Button>
        </div>

        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的讀書會</h1>
          <p className="text-gray-600 mt-2">
            你加入的所有讀書會（共 {clubs.length} 個）
          </p>
        </div>

        {/* 讀書會列表 */}
        {clubs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              尚未加入任何讀書會
            </h3>
            <p className="text-gray-600 mb-6">
              探索讀書會，找到志同道合的閱讀夥伴
            </p>
            <Button onClick={() => navigate('/clubs')}>
              探索讀書會
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => navigate(`/clubs/${club.id}`)}
              >
                {club.cover_image_url && (
                  <img
                    src={getImageUrl(club.cover_image_url) || ''}
                    alt={club.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {club.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {club.description || '暫無描述'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {club.member_count || 0} 成員
                    </span>
                    {club.tags && club.tags.length > 0 && (
                      <span className="text-blue-600">
                        {club.tags[0].name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
            >
              上一頁
            </Button>
            <span className="px-4 py-2 text-gray-700">
              第 {page} / {totalPages} 頁
            </span>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
            >
              下一頁
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
