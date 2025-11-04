// frontend/src/pages/clubs/ClubDetail.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookClubStore } from '../../store/bookClubStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/common/SkeletonCard';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

/**
 * ClubDetail - 讀書會詳細頁面
 * 顯示讀書會的完整資訊
 */
const ClubDetail = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { 
    detailClub, 
    loading, 
    error, 
    fetchClubDetail,
    joinClub,
    leaveClub,
    requestToJoinClub,
    clearError,
  } = useBookClubStore();

  useEffect(() => {
    if (clubId) {
      fetchClubDetail(parseInt(clubId));
    }
  }, [clubId, fetchClubDetail]);

  // Listen for errors from the store and display them
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError(); // Clear error after showing
    }
  }, [error, clearError]);

  const { isAuthenticated } = useAuthStore();

  const handleJoinClick = async () => {
    if (!isAuthenticated) {
      toast.error('請先登入帳號');
      navigate('/login');
      return;
    }
    if (!clubId) return;
    try {
      await joinClub(parseInt(clubId));
      toast.success('成功加入讀書會！');
    } catch (e) {
      // Error is handled by the useEffect
    }
  };

  const handleLeaveClick = async () => {
    if (!clubId) return;
    await leaveClub(parseInt(clubId));
    toast.success('已退出讀書會');
  };

  const handleRequestJoinClick = async () => {
    if (!clubId) return;
    await requestToJoinClub(parseInt(clubId));
    toast.success('已發送加入請求');
  };

  // ... (The rest of the component remains the same)
  const renderMembershipButton = () => {
    if (!detailClub) return null;

    const membershipStatus = detailClub.membership_status || 'not_member';

    // Owner or Admin Check
    if (membershipStatus === 'owner' || membershipStatus === 'admin') {
      return (
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(`/clubs/${clubId}/events`)}
            className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
          >
            活動
          </Button>
          <Button 
            onClick={() => navigate(`/clubs/${clubId}/discussions`)}
            className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white"
          >
            討論區
          </Button>
          <Button 
            onClick={() => navigate(`/clubs/${clubId}/settings`)}
            className="whitespace-nownowrap bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            管理
          </Button>
        </div>
      );
    }

    // Member Check
    if (membershipStatus === 'member') {
      return (
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(`/clubs/${clubId}/events`)}
            className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
          >
            活動
          </Button>
          <Button 
            onClick={() => navigate(`/clubs/${clubId}/discussions`)}
            className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white"
          >
            討論區
          </Button>
          <Button 
            onClick={handleLeaveClick}
            variant="outline"
            className="whitespace-nowrap"
          >
            退出讀書會
          </Button>
        </div>
      );
    }

    const isPublic = detailClub.visibility === 'public';

    if (loading) {
      return (
        <Button disabled className="whitespace-nowrap">
          <span className="animate-pulse">載入中...</span>
        </Button>
      );
    }

    // 已請求加入私密讀書會
    if (membershipStatus === 'pending_request') {
      return (
        <Button 
          disabled
          className="whitespace-nowrap bg-gray-400"
        >
          已請求加入
        </Button>
      );
    }

    // 未加入，公開讀書會
    if (isPublic) {
      return (
        <Button 
          onClick={handleJoinClick}
          className="whitespace-nowrap"
        >
          加入讀書會
        </Button>
      );
    }

    // 未加入，私密讀書會
    return (
      <Button 
        onClick={handleRequestJoinClick}
        className="whitespace-nowrap"
      >
        請求加入
      </Button>
    );
  };

  // 載入狀態
  if (loading && !detailClub) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // 錯誤狀態（404）
  if (error && !detailClub) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-6xl mb-4">😢</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">讀書會不存在</h2>
            <p className="text-gray-600 mb-6">
              {error || '找不到指定的讀書會，可能已被刪除或不存在'}
            </p>
            <Button onClick={() => navigate('/clubs')}>返回探索頁面</Button>
          </div>
        </div>
      </div>
    );
  }

  // Final check to ensure detailClub is not null for the main render
  if (!detailClub) {
    // This can happen briefly between the loading and error states being resolved
    return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 封面圖片區域 */}
      <div className="w-full h-64 md:h-96 bg-gray-200 overflow-hidden">
        {detailClub.cover_image_url ? (
          <img
            src={getImageUrl(detailClub.cover_image_url) || ''}
            alt={detailClub.name}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
            <span className="text-white text-8xl">📚</span>
          </div>
        )}
      </div>

      {/* 內容區域 */}
      <div className="max-w-5xl mx-auto p-4 md:p-8 -mt-16 relative z-10">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 md:p-8">
          {/* 標題和基本資訊 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {detailClub.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    detailClub.visibility === 'public'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {detailClub.visibility === 'public' ? '公開' : '私密'}
                </span>
                <span>•</span>
                <span>建立於 {formatDate(detailClub.created_at)}</span>
              </div>
            </div>
            {renderMembershipButton()}
          </div>

          {/* 主要內容網格 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側：簡介和描述 */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">讀書會簡介</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {detailClub.description || '暫無簡介'}
                </p>
              </div>

              {/* 主題標籤 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">主題標籤</h2>
                <div className="flex flex-wrap gap-2">
                  {detailClub.tags.length > 0 ? (
                    detailClub.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">暫無標籤</span>
                  )}
                </div>
              </div>
            </div>

            {/* 右側：資訊卡片 */}
            <div className="space-y-4">
              {/* 創建者資訊 */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">創建者</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                    {detailClub.owner.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{detailClub.owner.display_name}</p>
                    <p className="text-sm text-gray-500">{detailClub.owner.email}</p>
                  </div>
                </div>
              </div>

              {/* 統計資訊 */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">社群統計</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">成員數</span>
                    <span className="font-semibold text-gray-900">
                      {detailClub.member_count} 人
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">建立時間</span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {formatDate(detailClub.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 返回按鈕 */}
        <div className="mt-6 text-center">
          <Button
            onClick={() => navigate('/clubs')}
            variant="outline"
          >
            ← 返回探索頁面
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;
