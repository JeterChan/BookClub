import { useState } from 'react';
import { Button } from '../ui/Button';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { profileService } from '../../services/profileService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const PrivacyTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleDeactivateConfirm = async () => {
    setIsDeactivating(true);
    try {
      await profileService.deactivateAccount();
      toast.success('帳號已成功停用');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error('停用帳號失敗，請稍後再試');
    } finally {
      setIsDeactivating(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium text-gray-900">帳號停用</h3>
        <p className="mt-1 text-sm text-gray-600">
          停用您的帳號將會移除您的個人資料，但您發布的內容（如討論）將會保留。此操作無法復原。
        </p>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="destructive"
          className="mt-4"
          disabled={isDeactivating}
        >
          停用我的帳號
        </Button>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeactivateConfirm}
        title="確認停用帳號"
        message="您確定要停用您的帳號嗎？此操作將無法復原，您將會被登出。"
        confirmText="確認停用"
        isConfirming={isDeactivating}
      />
    </div>
  );
};


