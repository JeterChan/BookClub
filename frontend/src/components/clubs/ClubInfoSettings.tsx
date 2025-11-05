// frontend/src/components/clubs/ClubInfoSettings.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState, useRef } from 'react';
import { useBookClubStore } from '../../store/bookClubStore';
import { useClubManagementStore } from '../../store/clubManagementStore';
import { updateClubCover } from '../../services/bookClubService';
import { getImageUrl } from '../../utils/imageUrl';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import toast from 'react-hot-toast';

const formSchema = z.object({
  name: z.string().min(3, '名稱至少需要 3 個字元').max(50, '名稱不能超過 50 個字元'),
  description: z.string().max(500, '簡介不能超過 500 個字元').optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const ClubInfoSettings = () => {
  const { detailClub, fetchClubDetail } = useBookClubStore();
  const { updateClubDetails, loading } = useClubManagementStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: detailClub?.name || '',
      description: detailClub?.description || '',
    },
  });

  // Sync form with external state changes
  useEffect(() => {
    if (detailClub) {
      reset({
        name: detailClub.name,
        description: detailClub.description || '',
      });
    }
  }, [detailClub, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!detailClub) return;
    await toast.promise(
      updateClubDetails(detailClub.id, data),
      {
        loading: '正在更新資訊...',
        success: '讀書會資訊已更新！',
        error: '更新失敗，請稍後再試。',
      }
    );
  };

  const handleCoverImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !detailClub) return;

    // 驗證檔案類型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('請上傳 JPG、PNG 或 WebP 格式的圖片');
      return;
    }

    // 驗證檔案大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('圖片大小不能超過 5MB');
      return;
    }

    // 顯示預覽
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 上傳封面
    setIsUploadingCover(true);
    try {
      await updateClubCover(detailClub.id, file);
      toast.success('封面已更新！');
      // 重新載入讀書會資料
      await fetchClubDetail(detailClub.id);
      setCoverImagePreview(null);
    } catch (error) {
      toast.error('封面上傳失敗，請稍後再試');
      setCoverImagePreview(null);
    } finally {
      setIsUploadingCover(false);
      // 清空 input，允許重複上傳同一個檔案
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">讀書會名稱</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">簡介</Label>
        <Textarea id="description" {...register('description')} />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      {/* 封面圖片上傳區域 */}
      <div>
        <Label>讀書會封面</Label>
        <div className="mt-2 space-y-3">
          {/* 當前封面預覽 */}
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
            {coverImagePreview ? (
              <img
                src={coverImagePreview}
                alt="封面預覽"
                className="w-full h-full object-cover"
              />
            ) : detailClub?.cover_image_url ? (
              <img
                src={getImageUrl(detailClub.cover_image_url) || ''}
                alt="當前封面"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">尚未上傳封面圖片</span>
              </div>
            )}
            
            {isUploadingCover && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </div>
            )}
          </div>

          {/* 上傳按鈕和說明 */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleCoverImageSelect}
              disabled={isUploadingCover}
              variant="outline"
            >
              {isUploadingCover ? '上傳中...' : '選擇圖片'}
            </Button>
            <p className="text-sm text-gray-500">
              支援 JPG、PNG、WebP 格式，檔案大小不超過 5MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleCoverImageChange}
            className="hidden"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="hover:bg-blue-700 cursor-pointer">
        {loading ? '儲存中...' : '儲存變更'}
      </Button>
    </form>
  );
};
