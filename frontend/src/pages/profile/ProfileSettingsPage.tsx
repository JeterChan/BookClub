import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { profileService, UserProfile, UpdateProfileData } from '../../services/profileService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import toast from 'react-hot-toast';

const ProfileSettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState<UpdateProfileData>({ display_name: '', bio: '' });
  const [initialData, setInitialData] = useState<UpdateProfileData>({ display_name: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await profileService.getProfile();
        const initial = { display_name: profile.display_name, bio: profile.bio || '' };
        setFormData(initial);
        setInitialData(initial);
      } catch (error) {
        toast.error('無法載入個人資料，請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
  }, [formData, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isDirty) return;

    setIsSaving(true);
    try {
      const updatedProfile = await profileService.updateProfile(formData);
      // The service returns the full profile, so we can update the store directly
      setUser(updatedProfile);
      const newInitialData = { display_name: updatedProfile.display_name, bio: updatedProfile.bio || '' };
      setInitialData(newInitialData);
      setFormData(newInitialData);
      toast.success('個人資料已成功更新！');
    } catch (error) {
      toast.error('更新失敗，請稍後再試。');
    } finally {
      setIsSaving(false);
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
    </div>
  );
};

export default ProfileSettingsPage;
