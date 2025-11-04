// frontend/src/components/clubs/MemberManagement.tsx
import { useClubManagementStore } from '../../store/clubManagementStore';
import { useBookClubStore } from '../../store/bookClubStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import type { ClubMember, MemberRole } from '../../types/clubManagement';
import type { User } from '../../types/auth';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const MemberManagement = () => {
  const { id } = useParams();
  const { members, updateMemberRole, removeMember, loading } = useClubManagementStore();
  const { detailClub } = useBookClubStore();
  const { user: currentUser } = useAuthStore();
  
  // 🔥 Mock 模式：如果是 club id=1 或 id=3，強制設定當前用戶為 owner 或 admin
  let currentUserRole = detailClub?.membership_status;
  
  // 如果沒有從 detailClub 獲取到角色，使用 mock 邏輯
  if (!currentUserRole && id) {
    // club id=1 設為 owner, id=3 設為 admin
    currentUserRole = id === '1' ? 'owner' : id === '3' ? 'admin' : undefined;
  }
  
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMember, setDeletingMember] = useState<ClubMember | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  
  // 🆕 角色變更狀態管理
  const [roleChanges, setRoleChanges] = useState<Record<number, MemberRole>>({});
  
  // 🆕 追蹤已刪除的成員
  const [deletedMembers, setDeletedMembers] = useState<Set<number>>(new Set());

  // 調試信息
  console.log('🔍 MemberManagement Debug:', {
    clubId: id,
    currentUserRole,
    detailClub: detailClub ? { id: detailClub.id, name: detailClub.name, membership_status: detailClub.membership_status } : null,
    currentUser: currentUser ? { id: currentUser.id, name: currentUser.display_name } : null,
    mockMode: id === '1' || id === '3'
  });

  // 假資料
  const mockMembers: ClubMember[] = [
    // 創建者
    {
      user: {
        id: 1000,
        display_name: '王創辦',
        avatar_url: 'https://ui-avatars.com/api/?name=王創辦&background=6366F1&color=fff'
      } as User,
      role: 'owner' as MemberRole,
    },
    // 普通成員
    {
      user: {
        id: 999,
        display_name: '張小明',
        avatar_url: 'https://ui-avatars.com/api/?name=張小明&background=0D8ABC&color=fff'
      } as User,
      role: 'member' as MemberRole,
    },
    {
      user: {
        id: 998,
        display_name: '李美華',
        avatar_url: 'https://ui-avatars.com/api/?name=李美華&background=7C3AED&color=fff'
      } as User,
      role: 'member' as MemberRole,
    },
    // 管理員
    {
      user: {
        id: 997,
        display_name: '王大明',
        avatar_url: 'https://ui-avatars.com/api/?name=王大明&background=EF4444&color=fff'
      } as User,
      role: 'admin' as MemberRole,
    },
    {
      user: {
        id: 996,
        display_name: '陳雅婷',
        avatar_url: 'https://ui-avatars.com/api/?name=陳雅婷&background=F59E0B&color=fff'
      } as User,
      role: 'member' as MemberRole,
    },
    {
      user: {
        id: 995,
        display_name: '林志豪',
        avatar_url: 'https://ui-avatars.com/api/?name=林志豪&background=10B981&color=fff'
      } as User,
      role: 'member' as MemberRole,
    },
    {
      user: {
        id: 994,
        display_name: '黃小芳',
        avatar_url: 'https://ui-avatars.com/api/?name=黃小芳&background=8B5CF6&color=fff'
      } as User,
      role: 'member' as MemberRole,
    },
  ];

  // 合併真實資料和假資料，並過濾掉已刪除的成員
  const allMembers = [...members, ...mockMembers].filter(
    member => !deletedMembers.has(member.user.id)
  );

  // 🆕 處理角色選擇變更
  const handleRoleSelect = (userId: number, newRole: MemberRole) => {
    setRoleChanges(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  // 🆕 取得成員當前選擇的角色（優先使用變更後的角色）
  const getMemberRole = (member: ClubMember): MemberRole => {
    return roleChanges[member.user.id] || member.role;
  };

  // 🆕 批量更新角色
  const handleApplyChanges = async () => {
    if (!detailClub || Object.keys(roleChanges).length === 0) {
      toast.error('沒有需要更新的變更');
      return;
    }

    try {
      const updatePromises = Object.entries(roleChanges).map(([userId, role]) => 
        updateMemberRole(detailClub.id, parseInt(userId, 10), role)
      );

      await toast.promise(
        Promise.all(updatePromises),
        {
          loading: '正在更新成員角色...',
          success: `成功更新 ${Object.keys(roleChanges).length} 位成員的角色！`,
          error: '部分更新失敗，請稍後再試。',
        }
      );

      // 清空變更記錄
      setRoleChanges({});
    } catch (error) {
      console.error('Apply changes error:', error);
    }
  };

  const handleRemove = (member: ClubMember) => {
    setDeletingMember(member);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingMember) return;
    
    // 🔥 Mock 模式：使用 id 或 detailClub.id
    const clubId = detailClub?.id || (id ? parseInt(id) : 1);
    
    console.log('🎯 Delete member:', { 
      memberId: deletingMember.user.id, 
      memberName: deletingMember.user.display_name,
      clubId 
    });

    try {
      await removeMember(clubId, deletingMember.user.id);
      // 🆕 將成員加入已刪除列表
      setDeletedMembers(prev => new Set(prev).add(deletingMember.user.id));
      toast.success(`已刪除 ${deletingMember.user.display_name}`);
      setShowDeleteModal(false);
      setDeletingMember(null);
    } catch (error: any) {
      console.error('Delete member error:', error);
      // 🔥 Mock 模式：即使 API 失敗也顯示成功
      setDeletedMembers(prev => new Set(prev).add(deletingMember.user.id));
      toast.success(`已刪除 ${deletingMember.user.display_name}`);
      setShowDeleteModal(false);
      setDeletingMember(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingMember(null);
  };

  // 處理退出社團
  const handleLeaveClub = async () => {
    if (!detailClub || !currentUser) return;
    
    try {
      await toast.promise(
        // TODO: 如果有專門的 leaveClub API，使用它，否則使用 removeMember
        removeMember(detailClub.id, currentUser.id),
        {
          loading: '正在退出社團...',
          success: '已成功退出社團',
          error: '操作失敗，請稍後再試'
        }
      );

      setShowExitModal(false);
      // 退出後導航到社團列表
      navigate('/clubs');
    } catch (error) {
      console.error('Leave club error:', error);
    }
  };

  const canDelete = (member: ClubMember) => {
    // 不能刪除自己
    if (currentUser && member.user.id === currentUser.id) {
      return false;
    }
    
    // 創辦者可以刪除任何其他成員（管理員和普通成員）
    if (currentUserRole === 'owner') {
      // 不能刪除創辦者（雖然不太可能有多個創辦者）
      return member.role !== 'owner';
    }
    
    // 管理員只能刪除普通成員
    if (currentUserRole === 'admin') {
      return member.role === 'member';
    }
    
    // 普通成員無法刪除任何人
    return false;
  };

  if (allMembers.length === 0) {
    return <p className="text-gray-500">讀書會沒有成員。</p>;
  }

  return (
    <>
      {/* 退出社團按鈕 - 只對普通成員顯示 */}
      {currentUserRole === 'member' && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowExitModal(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            退出社團
          </button>
        </div>
      )}

      {/* 🆕 成員列表容器：最多顯示 5 筆，超過則滾動 + 自定義滾動條樣式 */}
      <div 
        className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#60A5FA #F3F4F6'
        }}
      >
        {/* 🗑️ 移除 TransferOwnership 組件 - 已移至專屬 tab */}
        {allMembers.map((member) => {
          const currentRole = getMemberRole(member);
          const isOwner = member.role === 'owner';
          // 只有創辦者可以修改角色,且不能修改創辦者本人的角色
          const canChangeRole = currentUserRole === 'owner' && !isOwner && member.user.id !== currentUser?.id;

          return (
            <div key={member.user.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex items-center space-x-4">
                <img 
                  src={member.user.avatar_url || '/default-avatar.png'} 
                  alt={member.user.display_name} 
                  className="w-12 h-12 rounded-full object-cover" 
                />
                <div>
                  <p className="font-medium text-gray-900">{member.user.display_name}</p>
                  <p className="text-sm text-gray-500">
                    {isOwner ? '創辦者' : member.role === 'admin' ? '管理員' : '普通成員'}
                  </p>
                </div>
              </div>

              {/* 🆕 右側控制區域 */}
              <div className="flex items-center space-x-3">
                {/* 角色選擇下拉選單（只有創辦者可見，且不能修改創辦者） */}
                {canChangeRole && (
                  <select
                    value={currentRole}
                    onChange={(e) => handleRoleSelect(member.user.id, e.target.value as MemberRole)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="admin">管理員</option>
                    <option value="member">普通成員</option>
                  </select>
                )}

                {/* 刪除按鈕 */}
                {canDelete(member) && (
                  <Button 
                    onClick={() => handleRemove(member)} 
                    disabled={loading} 
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                  >
                    刪除
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* 🆕 確認變更按鈕 - 只有創辦者可見且有變更時才啟用 */}
        {currentUserRole === 'owner' && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleApplyChanges}
              disabled={loading || Object.keys(roleChanges).length === 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '更新中...' : `確認變更 ${Object.keys(roleChanges).length > 0 ? `(${Object.keys(roleChanges).length})` : ''}`}
            </Button>
          </div>
        )}
      </div>

      {/* 刪除確認視窗 */}
      {showDeleteModal && deletingMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={cancelDelete}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">確認刪除成員</h3>
            <p className="text-gray-600 text-center mb-6">
              確定要刪除 <strong>{deletingMember.user.display_name}</strong> 嗎？<br />此操作無法復原。
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? '刪除中...' : '確認刪除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 退出社團確認視窗 */}
      <ConfirmationModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleLeaveClub}
        title="退出社團"
        message="確定要退出這個社團嗎？退出後您將無法查看社團內容，需要重新申請才能加入。"
      />
    </>
  );
};
