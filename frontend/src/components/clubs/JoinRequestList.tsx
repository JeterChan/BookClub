// frontend/src/components/clubs/JoinRequestList.tsx
import { useClubManagementStore } from '../../store/clubManagementStore';
import { useBookClubStore } from '../../store/bookClubStore';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export const JoinRequestList = () => {
  const { joinRequests, approveRequest, rejectRequest, loading } = useClubManagementStore();
  const { detailClub } = useBookClubStore();

  const handleApprove = async (requestId: number) => {
    if (!detailClub) return;
    await toast.promise(
      approveRequest(detailClub.id, requestId),
      {
        loading: '正在批准...',
        success: '請求已批准！',
        error: '操作失敗，請稍後再試。',
      }
    );
  };

  const handleReject = async (requestId: number) => {
    if (!detailClub) return;
    await toast.promise(
      rejectRequest(detailClub.id, requestId),
      {
        loading: '正在拒絕...',
        success: '請求已拒絕。',
        error: '操作失敗，請稍後再試。',
      }
    );
  };

  if (joinRequests.length === 0) {
    return <p className="text-gray-500">目前沒有待處理的加入請求。</p>;
  }

  return (
    <div className="space-y-4">
      {joinRequests.map((req) => (
        <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <img src={req.user.avatar_url || `/default-avatar.png`} alt={req.user.display_name} className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-medium">{req.user.display_name}</p>
              <p className="text-sm text-gray-500">{req.user.email}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => handleApprove(req.id)} disabled={loading} size="sm">批准</Button>
            <Button onClick={() => handleReject(req.id)} disabled={loading} variant="outline" size="sm">拒絕</Button>
          </div>
        </div>
      ))}
    </div>
  );
};
