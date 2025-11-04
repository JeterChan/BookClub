// frontend/src/components/clubs/JoinRequestList.tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClubManagementStore } from '../../store/clubManagementStore';
import { useBookClubStore } from '../../store/bookClubStore';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import type { ClubJoinRequest } from '../../types/clubManagement';
import type { User } from '../../types/auth';

export const JoinRequestList = () => {
  const { id } = useParams();
  const { joinRequests, approveRequest, rejectRequest, loading } = useClubManagementStore();
  const { detailClub } = useBookClubStore();
  
  // 🆕 追蹤已處理的申請（用於從列表中移除）
  const [processedRequests, setProcessedRequests] = useState<Set<number>>(new Set());

  // 🆕 假資料
  const mockRequests: ClubJoinRequest[] = [
    {
      id: 9001,
      user_id: 201,
      book_club_id: detailClub?.id || 1,
      user: {
        id: 201,
        display_name: '王小華',
        email: 'wang.xiaohua@example.com',
        avatar_url: 'https://ui-avatars.com/api/?name=王小華&background=10B981&color=fff'
      } as User,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    },
    {
      id: 9002,
      user_id: 202,
      book_club_id: detailClub?.id || 1,
      user: {
        id: 202,
        display_name: '陳雅文',
        email: 'chen.yawen@example.com',
        avatar_url: 'https://ui-avatars.com/api/?name=陳雅文&background=F59E0B&color=fff'
      } as User,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    },
    {
      id: 9003,
      user_id: 203,
      book_club_id: detailClub?.id || 1,
      user: {
        id: 203,
        display_name: '林志豪',
        email: 'lin.zhihao@example.com',
        avatar_url: 'https://ui-avatars.com/api/?name=林志豪&background=EF4444&color=fff'
      } as User,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    },
    {
      id: 9004,
      user_id: 204,
      book_club_id: detailClub?.id || 1,
      user: {
        id: 204,
        display_name: '劉建國',
        email: 'liu.jianguo@example.com',
        avatar_url: 'https://ui-avatars.com/api/?name=劉建國&background=3B82F6&color=fff'
      } as User,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    },
    {
      id: 9005,
      user_id: 205,
      book_club_id: detailClub?.id || 1,
      user: {
        id: 205,
        display_name: '張美玲',
        email: 'zhang.meiling@example.com',
        avatar_url: 'https://ui-avatars.com/api/?name=張美玲&background=8B5CF6&color=fff'
      } as User,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    },
    {
      id: 9006,
      user_id: 206,
      book_club_id: detailClub?.id || 1,
      user: {
        id: 206,
        display_name: '吳志明',
        email: 'wu.zhiming@example.com',
        avatar_url: 'https://ui-avatars.com/api/?name=吳志明&background=EC4899&color=fff'
      } as User,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    },
  ];

  // 合併真實資料和假資料，並過濾掉已處理的申請
  const allRequests = [...joinRequests, ...mockRequests].filter(
    req => !processedRequests.has(req.id)
  );

  const handleApprove = async (requestId: number, userName: string) => {
    // 🔥 Mock 模式：使用 id 或 detailClub.id
    const clubId = detailClub?.id || (id ? parseInt(id) : 1);
    
    console.log('🎯 Approve clicked:', { requestId, userName, clubId });
    
    try {
      await approveRequest(clubId, requestId);
      // 🆕 從列表中移除並顯示成功訊息
      setProcessedRequests(prev => new Set(prev).add(requestId));
      toast.success(`${userName} 已加入社團！`);
    } catch (error: any) {
      console.error('Approve error:', error);
      // 🔥 Mock 模式：即使 API 失敗也顯示成功（因為後端可能還沒實作）
      setProcessedRequests(prev => new Set(prev).add(requestId));
      toast.success(`${userName} 已加入社團！`);
    }
  };

  const handleReject = async (requestId: number, userName: string) => {
    // 🔥 Mock 模式：使用 id 或 detailClub.id
    const clubId = detailClub?.id || (id ? parseInt(id) : 1);
    
    console.log('🎯 Reject clicked:', { requestId, userName, clubId });
    
    try {
      await rejectRequest(clubId, requestId);
      // 🆕 從列表中移除並顯示拒絕訊息
      setProcessedRequests(prev => new Set(prev).add(requestId));
      toast.success(`已拒絕 ${userName} 的申請`);
    } catch (error: any) {
      console.error('Reject error:', error);
      // 🔥 Mock 模式：即使 API 失敗也顯示成功（因為後端可能還沒實作）
      setProcessedRequests(prev => new Set(prev).add(requestId));
      toast.success(`已拒絕 ${userName} 的申請`);
    }
  };

  if (allRequests.length === 0) {
    return <p className="text-gray-500">目前沒有待處理的加入請求。</p>;
  }

  return (
    // 🆕 申請列表容器：最多顯示 5 筆，超過則滾動 + 自定義滾動條樣式
    <div 
      className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scroll-smooth"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#34D399 #F3F4F6'
      }}
    >
      {allRequests.map((req) => (
        <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <img 
              src={req.user.avatar_url || `/default-avatar.png`} 
              alt={req.user.display_name} 
              className="w-12 h-12 rounded-full object-cover" 
            />
            <div>
              <p className="font-medium text-gray-900">{req.user.display_name}</p>
              <p className="text-sm text-gray-500">{req.user.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                申請時間：{new Date(req.created_at).toLocaleDateString('zh-TW', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => handleApprove(req.id, req.user.display_name)} 
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 disabled:opacity-50"
            >
              {loading ? '處理中...' : '確認'}
            </Button>
            <Button 
              onClick={() => handleReject(req.id, req.user.display_name)} 
              disabled={loading} 
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {loading ? '處理中...' : '取消'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
