// frontend/src/components/clubs/ClubInfoSettings.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  
  // 標籤管理狀態
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>({
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
      setPreviewUrl(detailClub.cover_image_url || '');
      // TODO: 從 detailClub 中載入標籤
      // setTags(detailClub.tags || []);
    }
  }, [detailClub, reset]);

  // 標籤管理函數
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    
    if (!trimmedTag) {
      toast.error('請輸入標籤名稱');
      return;
    }
    
    if (trimmedTag.length < 2 || trimmedTag.length > 20) {
      toast.error('標籤長度需在 2-20 個字元之間');
      return;
    }
    
    if (tags.length >= 10) {
      toast.error('最多可添加 10 個標籤');
      return;
    }
    
    if (tags.includes(trimmedTag)) {
      toast.error('此標籤已存在');
      return;
    }
    
    setTags([...tags, trimmedTag]);
    setNewTag('');
    toast.success('標籤已添加');
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
    toast.success('標籤已移除');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 檔案大小驗證 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('檔案大小不能超過 5MB');
        return;
      }
      
      setSelectedFile(file);
      // 創建本地預覽
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      toast.error('請先選擇圖片');
      return;
    }

    try {
      // TODO: 實際上傳到後端的邏輯
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // const response = await uploadImageAPI(formData);
      // const imageUrl = response.data.url;
      
      // 暫時使用 base64 作為示範
      const imageUrl = previewUrl;
      setUploadedImageUrl(imageUrl);
      setValue('cover_image_url', imageUrl);
      
      toast.success('圖片上傳成功！');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('圖片上傳失敗');
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!detailClub) return;
    
    // 包含標籤資料
    const updateData = {
      ...data,
      tags: tags,
      cover_image_url: uploadedImageUrl || data.cover_image_url
    };
    
    await toast.promise(
      updateClubDetails(detailClub.id, updateData),
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
        <Textarea id="description" rows={4} {...register('description')} />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <Label>封面圖片</Label>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <p className="text-gray-500 text-xs">支援 JPG, PNG, GIF 格式，檔案大小不超過 5MB</p>
          
          {previewUrl && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">圖片預覽：</p>
                <img src={previewUrl} alt="封面預覽" className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200" />
              </div>
              <Button 
                type="button" 
                onClick={handleUploadImage}
                disabled={!selectedFile || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                確認上傳圖片
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 標籤設定 */}
      <div>
        <Label>社團標籤</Label>
        <p className="text-sm text-gray-500 mb-2">最多可添加 10 個標籤，每個標籤 2-20 個字元</p>
        
        <div className="flex gap-2 mb-3">
          <Input 
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="輸入新標籤"
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={handleAddTag}
            variant="outline"
            className="shrink-0"
          >
            添加
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="hover:text-red-500 transition-colors"
                  aria-label={`移除標籤 ${tag}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        
        {tags.length === 0 && (
          <p className="text-sm text-gray-400">尚未添加任何標籤</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="hover:bg-blue-700 cursor-pointer">
        {loading ? '儲存中...' : '儲存變更'}
      </Button>
    </form>
  );
};
