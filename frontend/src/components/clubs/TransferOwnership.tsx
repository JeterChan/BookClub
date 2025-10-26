// frontend/src/components/clubs/TransferOwnership.tsx
import { useState } from 'react';
import { useClubManagementStore } from '../../store/clubManagementStore';
import { useBookClubStore } from '../../store/bookClubStore';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import toast from 'react-hot-toast';

export const TransferOwnership = () => {
  const { members, transferOwnership, loading } = useClubManagementStore();
  const { detailClub } = useBookClubStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const currentUserRole = detailClub?.membership_status;
  const ownerId = detailClub?.owner.id;

  const handleTransfer = async () => {
    if (!detailClub || !selectedUserId) return;
    if (!window.confirm(`你確定要將擁有權轉讓給這位成員嗎？你將會成為管理員，此操作無法復原。`)) return;

    await toast.promise(
      transferOwnership(detailClub.id, parseInt(selectedUserId, 10)),
      {
        loading: '正在轉讓擁有權...',
        success: '擁有權已成功轉讓！頁面將會重新整理。',
        error: (err) => err.response?.data?.detail || '操作失敗，請稍後再試。',
      }
    );
  };

  // Only show this component if the current user is the owner
  if (currentUserRole !== 'owner') {
    return null;
  }

  const potentialNewOwners = members.filter(m => m.user.id !== ownerId);

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-300 my-6">
      <h3 className="text-lg font-bold text-yellow-800">轉讓擁有權</h3>
      <p className="text-sm text-yellow-700 mt-1">將讀書會的擁有權轉讓給另一位成員。此操作無法復原，你將會被降級為管理員。</p>
      <div className="flex items-center space-x-2 mt-4">
        <Select onChange={(e) => setSelectedUserId(e.target.value)} defaultValue="">
          <option value="" disabled>選擇一位新擁有者</option>
            {potentialNewOwners.map(member => (
              <SelectItem key={member.user.id} value={member.user.id.toString()}>
                {member.user.display_name} ({member.user.email})
              </SelectItem>
            ))}
        </Select>
        <Button 
          onClick={handleTransfer} 
          disabled={!selectedUserId || loading}
          variant="destructive"
        >
          轉讓
        </Button>
      </div>
    </div>
  );
};
