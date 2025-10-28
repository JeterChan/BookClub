// frontend/src/components/clubs/ClubInfoSettings.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useBookClubStore } from '../../store/bookClubStore';
import { useClubManagementStore } from '../../store/clubManagementStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import toast from 'react-hot-toast';

const formSchema = z.object({
  name: z.string().min(3, '名稱至少需要 3 個字元').max(50, '名稱不能超過 50 個字元'),
  description: z.string().max(500, '簡介不能超過 500 個字元').optional(),
  cover_image_url: z.string().url('請輸入有效的圖片網址').or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const ClubInfoSettings = () => {
  const { detailClub } = useBookClubStore();
  const { updateClubDetails, loading } = useClubManagementStore();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: detailClub?.name || '',
      description: detailClub?.description || '',
      cover_image_url: detailClub?.cover_image_url || '',
    },
  });

  // Sync form with external state changes
  useEffect(() => {
    if (detailClub) {
      reset({
        name: detailClub.name,
        description: detailClub.description || '',
        cover_image_url: detailClub.cover_image_url || '',
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

      <div>
        <Label htmlFor="cover_image_url">封面圖片網址</Label>
        <Input id="cover_image_url" {...register('cover_image_url')} />
        {errors.cover_image_url && <p className="text-red-500 text-sm mt-1">{errors.cover_image_url.message}</p>}
      </div>

      <Button type="submit" disabled={loading} className="hover:bg-blue-700 cursor-pointer">
        {loading ? '儲存中...' : '儲存變更'}
      </Button>
    </form>
  );
};
