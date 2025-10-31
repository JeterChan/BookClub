import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { profileService,type UpdateProfileData } from '../../services/profileService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import toast from 'react-hot-toast';

const ProfileSettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState<UpdateProfileData>({ display_name: '', bio: '' });
  const [initialData, setInitialData] = useState<UpdateProfileData>({ display_name: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
  console.log("isDirty calculated as:", isDirty);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await profileService.getProfile();
        const initial = { display_name: profile.display_name, bio: profile.bio || '' };
        setFormData(initial);
        setInitialData(initial);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('無法載入個人資料，請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isDirty) return;

    setIsSaving(true);
    try {
      const updatedProfile = await profileService.updateProfile(formData);
      setUser(updatedProfile);
      const newInitialData = { display_name: updatedProfile.display_name, bio: updatedProfile.bio || '' };
      setInitialData(newInitialData);
      setFormData(newInitialData);
      toast.success('個人資料已成功更新！');
      setTimeout(() => {
        console.log("State after update:", { 
          formData: newInitialData, 
          initialData: newInitialData 
        });
      }, 0);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('更新失敗，請稍後再試。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('只接受 JPG 或 PNG 格式的圖片。');
      return;
    }
    const maxSizeInMB = 2;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast.error(`檔案大小不能超過 ${maxSizeInMB}MB。`);
      return;
    }

    setIsUploading(true);
    try {
      const response = await profileService.uploadAvatar(file);
      if (user) {
        setUser({ ...user, avatar_url: response.avatar_url });
      }
      toast.success('大頭貼已成功更新！');
    } catch (error) {
      toast.error('大頭貼上傳失敗，請稍後再試。');
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveConfirm = async () => {
    setIsRemoving(true);
    try {
      await profileService.removeAvatar();
      if (user) {
        setUser({ ...user, avatar_url: undefined });
      }
      toast.success('大頭貼已成功移除。');
    } catch (error) {
      toast.error('移除大頭貼失敗，請稍後再試。');
    } finally {
      setIsRemoving(false);
      setIsRemoveModalOpen(false);
    }
  };

  if (loading) {
    return <div className="p-4 md:p-8 max-w-2xl mx-auto">正在載入資料...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">個人檔案設定</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border rounded-lg shadow-sm">
        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">顯示名稱</label>
          <Input
            id="display_name"
            name="display_name"
            type="text"
            value={formData.display_name}
            onChange={handleChange}
            className="w-full"
            maxLength={50}
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">個人簡介</label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full"
            rows={4}
            maxLength={300}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty || isSaving}>
            {isSaving ? '儲存中...' : '儲存變更'}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-8 border-t">
        <h2 className="text-xl font-semibold mb-4">個人大頭貼</h2>
        <div className="flex items-center gap-6">
          <img 
            src={user?.avatar_url || '/default-avatar.png'} 
            alt="User Avatar" 
            className="w-24 h-24 rounded-full object-cover bg-gray-200"
            onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
          />
          <div className="flex flex-col gap-3">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg"
              data-testid="avatar-upload-input"
            />
            <Button type="button" onClick={handleUploadClick} disabled={isUploading || isRemoving}>
              {isUploading ? '上傳中...' : '上傳新照片'}
            </Button>
            {user?.avatar_url && (
              <Button 
                type="button" 
                variant="destructive" 
                disabled={isUploading || isRemoving}
                onClick={() => setIsRemoveModalOpen(true)}
              >
                {isRemoving ? '移除中...' : '移除照片'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={handleRemoveConfirm}
        title="確認移除大頭貼"
        message="您確定要移除您的大頭貼嗎？此操作無法復原。"
      />
    </div>
  );
};

export default ProfileSettingsPage;
