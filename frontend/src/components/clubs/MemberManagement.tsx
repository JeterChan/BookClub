// frontend/src/components/clubs/MemberManagement.tsx
import { useClubManagementStore } from '../../store/clubManagementStore';
import { useBookClubStore } from '../../store/bookClubStore';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import type { ClubMember, MemberRole } from '../../types/clubManagement';
import { TransferOwnership } from './TransferOwnership';

export const MemberManagement = () => {
  const { members, updateMemberRole, removeMember, loading } = useClubManagementStore();
  const { detailClub } = useBookClubStore();
  const currentUserRole = detailClub?.membership_status;

  const handleRoleChange = async (userId: number, role: MemberRole) => {
    if (!detailClub) return;
    await toast.promise(
      updateMemberRole(detailClub.id, userId, role),
      {
        loading: '正在更新角色...',
        success: '成員角色已更新！',
        error: (err) => err.response?.data?.detail || '操作失敗，請稍後再試。',
      }
    );
  };

  const handleRemove = async (userId: number) => {
    if (!detailClub) return;
    if (!window.confirm('你確定要移除這位成員嗎？此操作無法復原。')) return;

    await toast.promise(
      removeMember(detailClub.id, userId),
      {
        loading: '正在移除成員...',
        success: '成員已移除。',
        error: (err) => err.response?.data?.detail || '操作失敗，請稍後再試。',
      }
    );
  };

  const canManage = (member: ClubMember) => {
    if (currentUserRole === 'owner') {
      return member.role !== 'owner'; // Owner can manage anyone except themselves
    }
    if (currentUserRole === 'admin') {
      return member.role === 'member'; // Admin can only manage members
    }
    return false;
  };

  if (members.length === 0) {
    return <p className="text-gray-500">讀書會沒有成員。</p>;
  }

  return (
    <div className="space-y-4">
      <TransferOwnership />
      {members.map((member) => (
        <div key={member.user.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <img src={member.user.avatar_url || '/default-avatar.png'} alt={member.user.display_name} className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-medium">{member.user.display_name}</p>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          </div>
          {canManage(member) && (
            <div className="flex space-x-2">
              {currentUserRole === 'owner' && member.role === 'member' && (
                <Button onClick={() => handleRoleChange(member.user.id, 'admin')} disabled={loading} size="sm" variant="outline">設為管理員</Button>
              )}
              {currentUserRole === 'owner' && member.role === 'admin' && (
                <Button onClick={() => handleRoleChange(member.user.id, 'member')} disabled={loading} size="sm" variant="outline">設為成員</Button>
              )}
              <Button onClick={() => handleRemove(member.user.id)} disabled={loading} size="sm" variant="destructive">移除</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
