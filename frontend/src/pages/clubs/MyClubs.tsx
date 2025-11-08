import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { listBookClubs } from '../../services/bookClubService';
import { getImageUrl } from '../../utils/imageUrl';
import type { BookClubListItem } from '../../types/bookClub';
import { getEventsList } from '../../services/eventService';
import toast from 'react-hot-toast';

type RoleFilter = 'all' | 'owner' | 'admin' | 'member';

interface ClubWithEventCount extends BookClubListItem {
  eventCount?: number;
}

export default function MyClubs() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<ClubWithEventCount[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<ClubWithEventCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  useEffect(() => {
    loadMyClubs();
  }, [page]);

  useEffect(() => {
    // 根據角色篩選讀書會
    if (roleFilter === 'all') {
      setFilteredClubs(clubs);
    } else {
      const filtered = clubs.filter(club => club.membership_status === roleFilter);
      setFilteredClubs(filtered);
    }
  }, [clubs, roleFilter]);

  const loadMyClubs = async () => {
    try {
      setLoading(true);
      const response = await listBookClubs({
        page,
        pageSize: 20,
        myClubs: true,
      });
      
      // 為每個讀書會載入活動數量
      const clubsWithEventCount = await Promise.all(
        response.items.map(async (club) => {
          try {
            const eventsResponse = await getEventsList(club.id, {});
            return {
              ...club,
              eventCount: eventsResponse.items.length,
            };
          } catch (error) {
            // 如果獲取活動失敗，返回 0
            return {
              ...club,
              eventCount: 0,
            };
          }
        })
      );
      
      setClubs(clubsWithEventCount);
      setTotalPages(response.pagination.total_pages);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '載入我的讀書會失敗');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (membershipStatus?: string | null) => {
    if (!membershipStatus) return null;
    
    const badgeConfig = {
      owner: { label: '成員', bgColor: 'bg-gray-900', textColor: 'text-white' },
      admin: { label: '創建者', bgColor: 'bg-success-700', textColor: 'text-white' },
      member: { label: '成員', bgColor: 'bg-gray-600', textColor: 'text-white' },
    };

    const config = badgeConfig[membershipStatus as keyof typeof badgeConfig];
    if (!config) return null;

    return (
      <span className={`px-3 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  const getRoleCount = (role: RoleFilter) => {
    if (role === 'all') return clubs.length;
    return clubs.filter(club => club.membership_status === role).length;
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
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 返回按鈕 */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← 返回儀表板
          </button>
        </div>

        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">我的讀書會</h1>
          <p className="text-gray-600">
            你加入的所有讀書會（共 {clubs.length} 個）
          </p>
        </div>

        {/* 角色篩選按鈕 */}
        {clubs.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  roleFilter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部 ({getRoleCount('all')})
              </button>
              <button
                onClick={() => setRoleFilter('owner')}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  roleFilter === 'owner'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                創建者 ({getRoleCount('owner')})
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  roleFilter === 'admin'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                管理員 ({getRoleCount('admin')})
              </button>
              <button
                onClick={() => setRoleFilter('member')}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  roleFilter === 'member'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                成員 ({getRoleCount('member')})
              </button>
            </div>
          </div>
        )}

        {/* 讀書會列表 */}
        {filteredClubs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            {clubs.length === 0 ? (
              <>
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
              </>
            ) : (
              <>
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  沒有符合條件的讀書會
                </h3>
                <p className="text-gray-600">
                  試試選擇其他篩選條件
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden animate-fade-in"
                onClick={() => navigate(`/clubs/${club.id}`)}
              >
                {club.cover_image_url && (
                  <img
                    src={getImageUrl(club.cover_image_url) || ''}
                    alt={club.name}
                    className="w-full h-56 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {club.name}
                    </h3>
                    {getRoleBadge(club.membership_status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {club.description || '暫無描述'}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        {club.member_count || 0} 成員
                      </span>
                      {club.tags && club.tags.length > 0 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {club.tags[0].name}
                        </span>
                      )}
                    </div>
                    {club.eventCount !== undefined && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {club.eventCount} 個活動
                      </div>
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
