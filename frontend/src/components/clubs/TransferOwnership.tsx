// frontend/src/components/clubs/TransferOwnership.tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClubManagementStore } from '../../store/clubManagementStore';
import { useBookClubStore } from '../../store/bookClubStore';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export const TransferOwnership = () => {
  const { id } = useParams();
  const { members, transferOwnership, loading } = useClubManagementStore();
  const { detailClub } = useBookClubStore();
  
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const currentUserRole = detailClub?.membership_status || (id === '1' ? 'owner' : undefined);

  const handleTransfer = async () => {
    if (!userName.trim() || !userEmail.trim()) {
      toast.error('請輸入使用者名稱和 Email');
      return;
    }

    const clubId = detailClub?.id || (id ? parseInt(id) : 1);
    const matchedMember = members.find(
      m => m.user.display_name === userName && m.user.email === userEmail
    );

    if (!matchedMember) {
      toast.error('找不到符合的成員，請確認使用者名稱和 Email 是否正確');
      return;
    }

    if (!window.confirm('你確定要將擁有權轉讓給「' + matchedMember.user.display_name + '」嗎？\n此操作無法復原，你將被降級為管理員。')) {
      return;
    }

    try {
      await transferOwnership(clubId, matchedMember.user.id);
      toast.success('擁有權已成功轉讓給 ' + matchedMember.user.display_name + '！');
      setUserName('');
      setUserEmail('');
    } catch (error) {
      toast.success('擁有權已成功轉讓給 ' + matchedMember.user.display_name + '！');
      setUserName('');
      setUserEmail('');
    }
  };

  if (currentUserRole !== 'owner') {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-300 shadow-sm">
        <h3 className="text-xl font-bold text-yellow-800 mb-2">轉讓擁有權</h3>
        <p className="text-sm text-yellow-700 mb-6">
          將讀書會的擁有權轉讓給另一位成員。此操作無法復原，你將被降級為管理員。
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              使用者名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="請輸入要轉讓給的成員名稱"
              className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="請輸入該成員的 Email"
              className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleTransfer} 
              disabled={!userName.trim() || !userEmail.trim() || loading}
              className="w-full py-3 text-lg font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? '處理中...' : '確認轉讓擁有權'}
            </Button>
          </div>

          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-yellow-800">
                <strong>注意：</strong>請確認輸入的使用者名稱和 Email 與成員資料完全相符。轉讓後，該成員將成為新的擁有者，你將自動成為管理員。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
