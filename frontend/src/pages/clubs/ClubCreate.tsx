// frontend/src/pages/clubs/ClubCreate.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useBookClubStore } from '../../store/bookClubStore';

// 表單驗證 schema
const clubCreateSchema = z.object({
  name: z.string().min(1, '請輸入讀書會名稱').max(50, '名稱最多 50 個字元'),
  description: z.string().max(500, '描述最多 500 個字元').optional(),
  tag_ids: z.array(z.number()).min(1, '請至少選擇一個標籤'),
  cover_image: z.instanceof(File).optional(),
});

type ClubCreateForm = z.infer<typeof clubCreateSchema>;

export default function ClubCreate() {
  const navigate = useNavigate();
  const { 
    createBookClub, 
    fetchAvailableTags, 
    availableTags, 
    loading, 
    error, 
    createSuccess,
    detailClub, // Changed from currentClub
    resetCreateSuccess,
    clearError,
  } = useBookClubStore();

  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const hasFetched = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ClubCreateForm>({
    resolver: zodResolver(clubCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      tag_ids: [],
    },
  });

  // 載入標籤
  useEffect(() => {
    if (!hasFetched.current) {
      fetchAvailableTags();
      hasFetched.current = true;
    }
  }, [fetchAvailableTags]);

  // 處理建立成功
  useEffect(() => {
    if (createSuccess && detailClub) {
      toast.success('讀書會建立成功！');
      resetCreateSuccess();
      navigate(`/clubs/${detailClub.id}`);
    }
  }, [createSuccess, detailClub, navigate, resetCreateSuccess]);

  // 處理錯誤
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleTagToggle = (tagId: number) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newSelectedTags);
    setValue('tag_ids', newSelectedTags, { shouldValidate: true });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 驗證檔案類型
      if (!file.type.startsWith('image/')) {
        toast.error('請選擇圖片檔案');
        return;
      }
      // 驗證檔案大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('圖片檔案不能超過 5MB');
        return;
      }
      setCoverImageFile(file);
      // 建立預覽
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
  };

  const onSubmit = async (data: ClubCreateForm) => {
    try {
      await createBookClub({
        ...data,
        visibility: 'public', // Hardcode to public
        tag_ids: selectedTags,
        cover_image: coverImageFile || undefined,
      });
    } catch {
      // Error handled by store and useEffect
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">建立讀書會</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 讀書會名稱 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                讀書會名稱 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="請輸入讀書會名稱（最多 50 個字元）"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* 讀書會封面照片 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                讀書會封面照片
              </label>
              {coverImagePreview ? (
                <div className="relative">
                  <img 
                    src={coverImagePreview} 
                    alt="封面預覽" 
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="cover-image-input"
                  />
                  <label
                    htmlFor="cover-image-input"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">點擊上傳封面照片</p>
                    <p className="text-xs text-gray-500">支援 JPG, PNG, GIF (最大 5MB)</p>
                  </label>
                </div>
              )}
            </div>

            {/* 讀書會描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                讀書會描述
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="請描述讀書會的主題、目標或特色（最多 500 個字元）"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* 標籤選擇 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                標籤 <span className="text-red-500">*</span> <span className="text-gray-500">(至少選擇一個)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {errors.tag_ids && (
                <p className="mt-1 text-sm text-red-600">{errors.tag_ids.message}</p>
              )}
            </div>

            {/* 按鈕區 */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? '建立中...' : '建立讀書會'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
