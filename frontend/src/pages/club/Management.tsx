import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { ClubInfoSettings } from '../../components/clubs/ClubInfoSettings';
import { MemberManagement } from '../../components/clubs/MemberManagement';
import { JoinRequestList } from '../../components/clubs/JoinRequestList';
import { TransferOwnership } from '../../components/clubs/TransferOwnership';
import { useBookClubStore } from '../../store/bookClubStore';

type TabType = 'info' | 'members' | 'requests' | 'transfer';

export default function ClubManagement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const { detailClub } = useBookClubStore();
  // const { detailClub, fetchClubDetail } = useBookClubStore(); // 之後串接真實 API 時使用

  // 🔥 添加調試：追蹤 tab 切換
  const handleTabChange = (tabId: TabType) => {
    console.log('🔄 Tab clicked:', tabId, '→ Current active:', activeTab);
    setActiveTab(tabId);
  };

  useEffect(() => {
    if (id) {
      // TODO: 之後串接真實後端 API
      // fetchClubDetail(parseInt(id));
      
      // 暫時模擬資料：從 Club.tsx 的模擬資料判斷身份
      // id=1 是「古典文學社」，角色是「創辦者」
      const mockClubData = {
        1: { name: '古典文學社', membership_status: 'owner' as const },
        2: { name: '科幻讀書會', membership_status: 'member' as const },
        3: { name: '推理小說', membership_status: 'admin' as const },
        4: { name: '心靈成長', membership_status: 'member' as const },
      };
      
      const clubId = parseInt(id);
      const mockData = mockClubData[clubId as keyof typeof mockClubData];
      
      if (mockData) {
        // 暫時設定模擬的 membership_status
        // 這樣創辦者就能看到「轉移擁有權」功能
        console.log('📌 Using mock data for club:', clubId, mockData);
      }
    }
  }, [id]);

  // 從 detailClub 取得社團名稱，如果沒有就用模擬資料
  const clubName = detailClub?.name || (id === '1' ? '古典文學社' : id === '3' ? '推理小說' : '讀書會');

  // 檢查當前用戶是否為創辦人
  // 暫時：id=1 的社團（古典文學社）視為創辦者
  const isOwner = detailClub?.membership_status === 'owner' || id === '1';

  // 除錯：顯示當前狀態
  console.log('🔍 Management Debug:', {
    id,
    detailClub: detailClub ? { id: detailClub.id, name: detailClub.name, membership_status: detailClub.membership_status } : null,
    isOwner,
    mockMode: id === '1' // 標記是否使用模擬模式
  });

  // 基本標籤（所有管理者都能看到）
  const baseTabs = [
    { id: 'info' as TabType, name: '社團資訊', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'members' as TabType, name: '成員管理', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'requests' as TabType, name: '加入申請', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
  ];

  // 只有創辦人才能看到的標籤
  const ownerOnlyTab = { id: 'transfer' as TabType, name: '轉移擁有權', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' };

  // 根據用戶角色組合標籤
  const tabs = isOwner ? [...baseTabs, ownerOnlyTab] : baseTabs;

  // 🔥 Debug: 顯示 tabs 的內容
  console.log('🎯 Tabs Debug:', {
    isOwner,
    tabsCount: tabs.length,
    tabNames: tabs.map(t => t.name),
    hasTransferTab: tabs.some(t => t.id === 'transfer'),
    allTabIds: tabs.map(t => t.id),
    currentActiveTab: activeTab // 🆕 顯示當前啟用的 tab
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#04c0f4]/5 to-[#04c0f4]/10">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center space-x-2 text-sm">
          <button
            onClick={() => navigate('/account')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            帳號設定
          </button>
          <span className="text-gray-400">/</span>
          <button
            onClick={() => navigate('/account')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            我的社團
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{clubName} 管理</span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{clubName}</h1>
              <p className="text-gray-500 mt-1">社團管理後台</p>
            </div>
            <button
              onClick={() => navigate(`/clubs/${id}`)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>查看社團頁面</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'info' && <ClubInfoSettings />}
            {activeTab === 'members' && <MemberManagement />}
            {activeTab === 'requests' && <JoinRequestList />}
            {activeTab === 'transfer' && <TransferOwnership />}
          </div>
        </div>
      </div>
    </div>
  );
}
