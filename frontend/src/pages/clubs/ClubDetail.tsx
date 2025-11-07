// frontend/src/pages/clubs/ClubDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookClubStore } from '../../store/bookClubStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/common/SkeletonCard';
import { getImageUrl } from '../../utils/imageUrl';
import { getEventsList, isEventPast, type EventListItem } from '../../services/eventService';
import type { DiscussionTopic } from '../../types/discussion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

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
    clearError,
    discussions,
    fetchDiscussions,
  } = useBookClubStore();

  // 狀態：即將到來的活動和最近討論
  const [upcomingEvents, setUpcomingEvents] = useState<EventListItem[]>([]);
  const [recentDiscussions, setRecentDiscussions] = useState<DiscussionTopic[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [hasLoadedContent, setHasLoadedContent] = useState(false);

  useEffect(() => {
    if (clubId) {
      fetchClubDetail(parseInt(clubId));
    }
  }, [clubId, fetchClubDetail]);

  // 當讀書會資訊載入後，檢查是否為成員，只有成員才載入活動和討論
  // 使用 hasLoadedContent 防止重複載入
  useEffect(() => {
    if (detailClub && clubId && detailClub.id === parseInt(clubId) && !hasLoadedContent) {
      const isMember = detailClub.membership_status === 'owner' 
                    || detailClub.membership_status === 'admin' 
                    || detailClub.membership_status === 'member';
      
      if (isMember) {
        loadUpcomingEvents(parseInt(clubId));
        loadRecentDiscussions(parseInt(clubId));
        setHasLoadedContent(true);
      } else {
        // 非成員，標記為已檢查但不載入
        setHasLoadedContent(true);
      }
    }
  }, [detailClub, clubId, hasLoadedContent]);

  // 載入即將到來的活動（最多3個）
  const loadUpcomingEvents = async (clubId: number) => {
    try {
      setEventsLoading(true);
      const response = await getEventsList(clubId, {
        page: 1,
        pageSize: 3,
        sortBy: 'event_datetime',
        order: 'asc',
      });
      
      // 只顯示未來的活動
      const upcoming = response.items.filter(event => !isEventPast(event.eventDatetime));
      setUpcomingEvents(upcoming.slice(0, 3));
    } catch (error: any) {
      // 靜默處理錯誤，不顯示錯誤訊息給非成員
    } finally {
      setEventsLoading(false);
    }
  };

  // 載入最近的討論（最多3個）
  const loadRecentDiscussions = async (clubId: number) => {
    try {
      await fetchDiscussions(clubId);
    } catch (error: any) {
      // 靜默處理錯誤，不顯示錯誤訊息給非成員
    }
  };

  useEffect(() => {
    if (discussions && discussions.length > 0) {
      setRecentDiscussions(discussions.slice(0, 3));
    }
  }, [discussions]);

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
      toast.success('已發送加入請求，等待管理員審核');
      // 不需要重新載入，joinClub 已經更新了 membership_status
    } catch (e) {
      // Error is handled by the store
    }
  };

  const handleLeaveClick = async () => {
    if (!clubId) return;
    await leaveClub(parseInt(clubId));
    toast.success('已退出讀書會');
  };

  // ... (The rest of the component remains the same)
  const renderMembershipButton = () => {
    if (!detailClub) return null;

    const membershipStatus = detailClub.membership_status || 'not_member';
    
        // Owner Check - 創建者不能退出
    if (membershipStatus === 'owner') {
      return (
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => navigate(`/clubs/${clubId}/events`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-xl transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            活動
          </button>
          <button 
            onClick={() => navigate(`/clubs/${clubId}/discussions`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-xl transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            討論區
          </button>
          <button 
            onClick={() => navigate(`/clubs/${clubId}/settings`)}
            style={{ backgroundColor: '#1e40af' }}
            className="flex items-center gap-2 px-5 py-2.5 hover:opacity-90 text-white rounded-xl transition-all font-medium shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            管理
          </button>
        </div>
      );
    }

    // Admin Check - 可以退出
    if (membershipStatus === 'admin') {
      return (
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => navigate(`/clubs/${clubId}/events`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-xl transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            活動
          </button>
          <button 
            onClick={() => navigate(`/clubs/${clubId}/discussions`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-xl transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            討論區
          </button>
          <button 
            onClick={() => navigate(`/clubs/${clubId}/settings`)}
            style={{ backgroundColor: '#1e40af' }}
            className="flex items-center gap-2 px-5 py-2.5 hover:opacity-90 text-white rounded-xl transition-all font-medium shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            管理
          </button>
          <Button 
            onClick={handleLeaveClick}
            variant="destructive"
            className="whitespace-nowrap rounded-xl px-5 py-2.5"
          >
            退出讀書會
          </Button>
        </div>
      );
    }

    // Member Check
    if (membershipStatus === 'member') {
      return (
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => navigate(`/clubs/${clubId}/events`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-xl transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            活動
          </button>
          <button 
            onClick={() => navigate(`/clubs/${clubId}/discussions`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-xl transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            討論區
          </button>
          <Button 
            onClick={handleLeaveClick}
            variant="outline"
            className="whitespace-nowrap border-2 border-gray-300 rounded-xl px-5 py-2.5"
          >
            退出讀書會
          </Button>
        </div>
      );
    }

    if (loading) {
      return (
        <Button disabled className="whitespace-nowrap">
          <span className="animate-pulse">載入中...</span>
        </Button>
      );
    }

    // 已請求加入讀書會（等待審核）
    if (membershipStatus === 'pending_request') {
      return (
        <Button 
          disabled
          className="whitespace-nowrap bg-yellow-400 text-gray-800"
        >
          等待審核
        </Button>
      );
    }

    // 未加入，顯示加入按鈕（所有讀書會都需要審核）
    return (
      <Button 
        onClick={handleJoinClick}
        className="whitespace-nowrap"
      >
        加入讀書會
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
    <div className="min-h-screen bg-white relative">
      {/* 返回按鈕 - 左上角 */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/clubs')}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 rounded-xl shadow-md transition-colors font-medium border-2 border-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回
        </button>
      </div>

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
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 md:p-8">
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

              {/* 即將到來的活動 - 只有成員可見 */}
              {(detailClub.membership_status === 'owner' || 
                detailClub.membership_status === 'admin' || 
                detailClub.membership_status === 'member') && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">即將到來的活動</h2>
                  {upcomingEvents.length > 0 && (
                    <button
                      onClick={() => navigate(`/clubs/${clubId}/events`)}
                      className="text-sm text-gray-900 hover:text-gray-700 font-medium"
                    >
                      查看全部 →
                    </button>
                  )}
                </div>
                {eventsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => navigate(`/clubs/${clubId}/events/${event.id}`)}
                        className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span>🕒 {format(new Date(event.eventDatetime), 'MM月dd日 HH:mm', { locale: zhTW })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>👥 {event.currentParticipants}/{event.maxParticipants || '∞'} 人</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200">
                    <p className="text-gray-500 text-sm">暫無即將到來的活動</p>
                  </div>
                )}
              </div>
              )}

              {/* 最近討論 - 只有成員可見 */}
              {(detailClub.membership_status === 'owner' || 
                detailClub.membership_status === 'admin' || 
                detailClub.membership_status === 'member') && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">最近討論</h2>
                  {recentDiscussions.length > 0 && (
                    <button
                      onClick={() => navigate(`/clubs/${clubId}/discussions`)}
                      className="text-sm text-gray-900 hover:text-gray-700 font-medium"
                    >
                      查看全部 →
                    </button>
                  )}
                </div>
                {recentDiscussions.length > 0 ? (
                  <div className="space-y-3">
                    {recentDiscussions.map((discussion) => (
                      <div
                        key={discussion.id}
                        onClick={() => navigate(`/clubs/${clubId}/discussions/${discussion.id}`)}
                        className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{discussion.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>💬 {discussion.comment_count} 則留言</span>
                          <span>•</span>
                          <span>{discussion.author?.display_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200">
                    <p className="text-gray-500 text-sm">暫無討論主題</p>
                  </div>
                )}
              </div>
              )}
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
      </div>
    </div>
  );
};

export default ClubDetail;
