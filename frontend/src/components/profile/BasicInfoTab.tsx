import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { profileService } from '../../services/profileService';
import type { UserProfile } from '../../services/profileService';

interface BasicInfoTabProps {
  profile: UserProfile;
  onUpdate: (updated: UserProfile) => void;
}

const basicInfoSchema = z.object({
  display_name: z
    .string()
    .min(2, '顯示名稱至少 2 個字元')
    .max(50, '顯示名稱最多 50 個字元')
    .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '僅能包含字母、數字、中文或底線'),
  bio: z.string().max(500, '個人簡介最多 500 個字元').optional(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

/**
 * BasicInfoTab - Basic profile information editing
 * Allows user to update display name and bio
 */
export const BasicInfoTab = ({ profile, onUpdate }: BasicInfoTabProps) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      display_name: profile.display_name,
      bio: profile.bio || '',
    },
  });

  const bioValue = watch('bio');
  const bioLength = bioValue?.length || 0;

  const onSubmit = async (data: BasicInfoFormData) => {
    try {
      setLoading(true);
      const updated = await profileService.updateProfile(data);
      onUpdate(updated);
      toast.success('基本資料更新成功');
    } catch {
      toast.error('更新失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
        />
        <p className="text-sm text-gray-500 mt-1">Email 無法修改</p>
      </div>

      {/* Display Name */}
      <Input
        label="顯示名稱"
        {...register('display_name')}
        error={errors.display_name?.message}
        placeholder="請輸入顯示名稱"
      />

      {/* Bio */}
      <Textarea
        label="個人簡介"
        {...register('bio')}
        error={errors.bio?.message}
        placeholder="介紹一下自己吧..."
        rows={5}
        maxLength={500}
        showCharCount
        currentLength={bioLength}
      />

      {/* Save button */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading || !isDirty} loading={loading}>
          儲存變更
        </Button>
        {isDirty && (
          <p className="text-sm text-gray-600">您有未儲存的變更</p>
        )}
      </div>
    </form>
  );
};
