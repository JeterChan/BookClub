import { useState } from 'react';
import toast from 'react-hot-toast';
import { FileUpload } from '../ui/FileUpload';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { profileService } from '../../services/profileService';
import type { UserProfile } from '../../services/profileService';

interface AvatarTabProps {
  profile: UserProfile;
  onUpdate: (updated: UserProfile) => void;
}

/**
 * AvatarTab - Avatar management
 * Upload, preview, and remove avatar
 */
export const AvatarTab = ({ profile, onUpdate }: AvatarTabProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const result = await profileService.uploadAvatar(selectedFile);
      
      // Clear preview and selected file FIRST
      setSelectedFile(null);
      setPreview(null);
      
      // Then update profile with new avatar URL
      const updatedProfile = {
        ...profile,
        avatar_url: result.avatar_url,
      };
      onUpdate(updatedProfile);
      useAuthStore.getState().setUser(updatedProfile);

      toast.success('頭像更新成功');
    } catch {
      toast.error('頭像上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!profile.avatar_url) return;

    try {
      setRemoving(true);
      const updatedProfile = await profileService.removeAvatar();
      
      // Update profile to remove avatar
      onUpdate({
        ...profile,
        avatar_url: updatedProfile.avatar_url,
      });
      useAuthStore.getState().setUser(updatedProfile);

      toast.success('頭像已移除');
    } catch {
      toast.error('移除頭像失敗，請稍後再試');
    } finally {
      setRemoving(false);
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Current Avatar Display */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">當前頭像</h3>
        <Avatar 
          src={profile.avatar_url} 
          alt={profile.display_name} 
          size="xl" 
        />
      </div>

      {/* File Upload */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {preview ? '預覽新頭像' : '上傳新頭像'}
        </h3>
        <FileUpload
          onFileSelect={handleFileSelect}
          preview={preview}
          currentImage={preview ? undefined : undefined}
          loading={uploading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {preview && (
          <>
            <Button onClick={handleUpload} disabled={uploading} loading={uploading}>
              上傳頭像
            </Button>
            <Button 
              onClick={handleCancelPreview} 
              variant="secondary"
              disabled={uploading}
            >
              取消
            </Button>
          </>
        )}

        {profile.avatar_url && !preview && (
          <Button
            onClick={handleRemove}
            variant="destructive"
            disabled={removing}
            loading={removing}
          >
            移除頭像
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>提示：</strong>
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
          <li>支援 JPG 或 PNG 格式</li>
          <li>檔案大小不可超過 2MB</li>
          <li>建議使用正方形圖片以獲得最佳效果</li>
          <li>頭像會自動裁切為圓形顯示</li>
        </ul>
      </div>
    </div>
  );
};
