// frontend/src/pages/clubs/ClubSettings.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClubManagementStore } from '../../store/clubManagementStore';
import { useBookClubStore } from '../../store/bookClubStore';
import { ClubInfoSettings } from '../../components/clubs/ClubInfoSettings';
import { JoinRequestList } from '../../components/clubs/JoinRequestList';
import { MemberManagement } from '../../components/clubs/MemberManagement';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const ClubSettings = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  
  const fetchClubManagementData = useClubManagementStore(state => state.fetchClubManagementData);
  const deleteClub = useClubManagementStore(state => state.deleteClub);
  const loading = useClubManagementStore(state => state.loading);
  const error = useClubManagementStore(state => state.error);
  const { detailClub } = useBookClubStore();
  const [activeTab, setActiveTab] = useState('info');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const clubIdNum = parseInt(clubId || '0');
    if (clubIdNum) {
      fetchClubManagementData(clubIdNum);
    }
  }, [clubId, fetchClubManagementData]);

  const handleDeleteConfirm = async () => {
    const clubIdNum = parseInt(clubId || '0');
    if (!clubIdNum) return;

    try {
      await deleteClub(clubIdNum);
      toast.success('讀書會已成功刪除');
      navigate('/clubs');
    } catch (err) {
      toast.error(err.message || '刪除失敗，請稍後再試');
    }
    setIsModalOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <ClubInfoSettings />;
      case 'members':
        return <MemberManagement />;
      case 'requests':
        return <JoinRequestList />;
      default:
        return null;
    }
  };

  if (loading && !detailClub) {
    return <div>Loading club settings...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  const isOwner = detailClub?.membership_status === 'owner';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">管理: {detailClub?.name}</h1>
      <p className="text-gray-600 mb-6">在此頁面更新你的讀書會設定。</p>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('info')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            基本資訊
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            成員管理
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            加入請求
          </button>
        </nav>
      </div>

      <div className="py-6">
        {renderTabContent()}
      </div>

      {isOwner && (
        <div className="mt-8 p-6 border border-red-300 rounded-lg bg-red-50">
          <h3 className="text-lg font-semibold text-red-800">危險區域</h3>
          <p className="text-red-600 mt-2 mb-4">刪除讀書會是永久性操作，無法復原。</p>
          <Button variant="danger" onClick={() => setIsModalOpen(true)} className="border border-red-600 hover:bg-red-700 cursor-pointer">
            刪除讀書會
          </Button>
        </div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="確認刪除讀書會"
        message="你確定要永久刪除這個讀書會嗎？所有相關資料都將被移除，此操作無法復原。"
      />
    </div>
  );
};

export default ClubSettings;
