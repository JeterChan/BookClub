// frontend/src/pages/clubs/ClubSettings.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useClubManagementStore } from '../../store/clubManagementStore';
import { useBookClubStore } from '../../store/bookClubStore';
import { ClubInfoSettings } from '../../components/clubs/ClubInfoSettings';
import { JoinRequestList } from '../../components/clubs/JoinRequestList';
import { MemberManagement } from '../../components/clubs/MemberManagement';
import { ClubDangerZone } from '../../components/clubs/ClubDangerZone';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const ClubSettings = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const fetchClubManagementData = useClubManagementStore(state => state.fetchClubManagementData);
  const deleteClub = useClubManagementStore(state => state.deleteClub);
  const managementLoading = useClubManagementStore(state => state.loading);
  const managementError = useClubManagementStore(state => state.error);
  const { detailClub, fetchClubDetail, loading: clubLoading } = useBookClubStore();
  
  // 從 URL 參數讀取 tab，預設為 'info'
  const tabFromUrl = searchParams.get('tab') || 'info';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    const clubIdNum = parseInt(clubId || '0');
    if (clubIdNum) {
      // 同時載入讀書會詳細資訊和管理資料
      fetchClubDetail(clubIdNum);
      fetchClubManagementData(clubIdNum);
    }
  }, [clubId, fetchClubDetail, fetchClubManagementData]);

  // 當 URL 參數變化時更新 activeTab
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleDeleteConfirm = async () => {
    const clubIdNum = parseInt(clubId || '0');
    if (!clubIdNum) return;

    try {
      await deleteClub(clubIdNum);
      toast.success('讀書會已成功刪除');
      navigate('/clubs');
    } catch (err) {
      toast.error(err as string || '刪除失敗，請稍後再試');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <ClubInfoSettings />;
      case 'members':
        return <MemberManagement />;
      case 'requests':
        return <JoinRequestList />;
      case 'settings':
        return <ClubDangerZone onDeleteConfirm={handleDeleteConfirm} />;
      default:
        return null;
    }
  };

  const loading = managementLoading || clubLoading;

  if (loading && !detailClub) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (managementError) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">錯誤: {managementError}</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = detailClub?.membership_status === 'owner';

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => navigate(`/clubs/${clubId}`)}
            variant="outline"
            className="mb-4 border-2 border-gray-300 rounded-xl px-4 py-2"
          >
            ← 返回讀書會
          </Button>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">管理: {detailClub?.name}</h1>
        <p className="text-gray-600 mb-8">在此頁面更新你的讀書會設定。</p>
        
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="border-b-2 border-gray-200">
            <nav className="-mb-0.5 flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('info')}
                className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'info'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                }`}
              >
                基本資訊
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'members'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                }`}
              >
                成員管理
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'requests'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                }`}
              >
                加入請求
              </button>
              {isOwner && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'settings'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-red-600 hover:border-gray-300'
                  }`}
                >
                  設定
                </button>
              )}
            </nav>
          </div>

          <div className="py-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubSettings;
