// frontend/src/pages/clubs/ClubExplore.tsx
import { useEffect } from 'react';
import { useBookClubStore } from '../../store/bookClubStore';
import { ClubCard } from '../../components/clubs/ClubCard';
import { SearchBar } from '../../components/clubs/SearchBar';
import { TagFilter } from '../../components/clubs/TagFilter';
import { Pagination } from '../../components/common/Pagination';
import { SkeletonCard } from '../../components/common/SkeletonCard';
import { Button } from '../../components/ui/Button';

/**
 * ClubExplore - 讀書會探索頁面
 * 展示所有公開的讀書會，支援搜尋和標籤篩選
 */
const ClubExplore = () => {
  const {
    clubs,
    pagination,
    availableTags,
    searchKeyword,
    selectedTagIds,
    loading,
    error,
    fetchClubs,
    fetchAvailableTags,
    setSearchKeyword,
    setSelectedTagIds,
  } = useBookClubStore();

  // 初始載入
  useEffect(() => {
    fetchClubs();
    fetchAvailableTags();
  }, [fetchClubs, fetchAvailableTags]);

  // 搜尋/篩選變更時重新載入
  const handleSearch = () => {
    fetchClubs(1); // 重置到第一頁
  };

  const handleTagToggle = (tagId: number) => {
    const newSelectedTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    setSelectedTagIds(newSelectedTagIds);
    
    // 延遲執行搜尋，等待 state 更新
    setTimeout(() => {
      fetchClubs(1);
    }, 0);
  };

  const handlePageChange = (page: number) => {
    fetchClubs(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 載入狀態
  if (loading && clubs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">探索讀書會</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error && clubs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">探索讀書會</h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchClubs()}>重試</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">探索讀書會</h1>

        {/* 搜尋和篩選區域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 space-y-4">
          <SearchBar
            value={searchKeyword}
            onChange={setSearchKeyword}
            onSearch={handleSearch}
          />
          <TagFilter
            availableTags={availableTags}
            selectedTagIds={selectedTagIds}
            onTagToggle={handleTagToggle}
          />
        </div>

        {/* 結果數量 */}
        {pagination && (
          <div className="mb-4 text-sm text-gray-600">
            找到 <span className="font-semibold">{pagination.total_items}</span> 個讀書會
          </div>
        )}

        {/* 讀書會卡片網格 */}
        {clubs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-600 text-lg mb-2">沒有找到符合條件的讀書會</p>
            <p className="text-gray-500 text-sm">試試調整搜尋關鍵字或篩選條件</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>

            {/* 分頁 */}
            {pagination && pagination.total_pages > 1 && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* 載入中 overlay */}
        {loading && clubs.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubExplore;
