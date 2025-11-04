import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Club() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([
    { id: 1, name: '古典文學社', role: '創辦者', members: 234, joined: '2024-01-15' },
    { id: 2, name: '科幻讀書會', role: '成員', members: 156, joined: '2024-02-10' },
    { id: 3, name: '推理小說', role: '管理員', members: 189, joined: '2024-03-05' },
    { id: 4, name: '心靈成長', role: '成員', members: 98, joined: '2024-03-20' },
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingClub, setDeletingClub] = useState<{ id: number; name: string } | null>(null);

  const handleClubClick = (club: typeof clubs[0]) => {
    // 根據身份導向不同頁面
    if (club.role === '創辦者' || club.role === '管理員') {
      // 創辦者或管理員：進入社團管理介面
      navigate(`/clubs/${club.id}/management`);
    } else {
      // 一般成員：進入社團詳情頁面
      navigate(`/clubs/${club.id}`);
    }
  };

  const handleDeleteClick = (club: typeof clubs[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingClub({ id: club.id, name: club.name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingClub) return;

    try {
      // TODO: 調用 API 刪除社團
      // await clubService.leaveClub(deletingClub.id);
      
      // 從列表中移除
      setClubs(clubs.filter(club => club.id !== deletingClub.id));
      toast.success(`已退出「${deletingClub.name}」`);
      setShowDeleteModal(false);
      setDeletingClub(null);
    } catch (error) {
      console.error('退出社團失敗:', error);
      toast.error('退出社團失敗，請稍後再試');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingClub(null);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-brand-light rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{clubs.length}</p>
              <p className="text-sm text-gray-500">參加的社團</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-500">管理社團數</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-500">天活躍度</p>
            </div>
          </div>
        </div>
      </div>

      {/* Club List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">我的社團</h2>
        <div className="space-y-4">
          {clubs.map((club) => (
            <div 
              key={club.id} 
              onClick={() => handleClubClick(club)}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {club.name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{club.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {club.members} 成員
                    </span>
                    <span>加入於 {club.joined}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  club.role === '創辦者' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md' : 
                  club.role === '管理員' ? 'bg-blue-100 text-blue-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {club.role}
                </span>
                <button 
                  onClick={(e) => handleDeleteClick(club, e)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="退出社團"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingClub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              確認退出社團
            </h3>
            <p className="text-gray-600 text-center mb-6">
              你確定要退出「<span className="font-semibold text-gray-900">{deletingClub.name}</span>」嗎？
              <br />
              退出後將無法查看社團內容。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-bold shadow-md transition-all"
              >
                確認退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
