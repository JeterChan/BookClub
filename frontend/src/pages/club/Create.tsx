import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '../../components/Header';

const createClubSchema = z.object({
  name: z.string().min(2, '社團名稱至少需要 2 個字').max(50, '社團名稱不能超過 50 個字'),
  category: z.string().min(1, '請選擇社團類別'),
  description: z.string().min(10, '社團描述至少需要 10 個字').max(500, '社團描述不能超過 500 個字'),
  privacy: z.enum(['public', 'private']),
});

type CreateClubForm = z.infer<typeof createClubSchema>;

export default function CreateClub() {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<CreateClubForm | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<CreateClubForm>({
    resolver: zodResolver(createClubSchema),
    defaultValues: {
      privacy: 'public'
    }
  });

  const descriptionValue = watch('description');
  const privacyValue = watch('privacy');

  const categories = [
    { id: 'literature', name: '文學' },
    { id: 'scifi', name: '科幻' },
    { id: 'mystery', name: '推理' },
    { id: 'selfhelp', name: '自我成長' },
    { id: 'business', name: '商業' },
    { id: 'history', name: '歷史' },
  ];

  const onSubmit = async (data: CreateClubForm) => {
    // 顯示確認對話框
    setFormData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmCreate = async () => {
    if (!formData) return;
    
    try {
      console.log('Creating club:', formData);
      // TODO: API call
      setShowConfirmDialog(false);
      // TODO: Navigate to club page or show success message
    } catch (error) {
      console.error('Failed to create club:', error);
      // TODO: Show error message
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setFormData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">創建新社團</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                社團名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="例如：古典文學社"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                社團類別 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                <option value="">請選擇類別</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  社團描述 <span className="text-red-500">*</span>
                </label>
                <span className="text-sm text-gray-500">
                  {descriptionValue?.length || 0}/500
                </span>
              </div>
              <textarea
                {...register('description')}
                placeholder="介紹一下你的社團，讓更多人了解..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                rows={5}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                隱私設定 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label 
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    privacyValue === 'public' 
                      ? 'border-brand-primary bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('privacy')}
                    value="public"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-gray-900">公開社團</span>
                    </div>
                    <p className="text-sm text-gray-600">任何人都可以查看和加入此社團</p>
                  </div>
                </label>

                <label 
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    privacyValue === 'private' 
                      ? 'border-brand-primary bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('privacy')}
                    value="private"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="font-medium text-gray-900">私密社團</span>
                    </div>
                    <p className="text-sm text-gray-600">需要審核才能加入，社團內容僅成員可見</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium border border-gray-300"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '創建中...' : '創建社團'}
              </button>
            </div>
          </form>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && formData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">確認創建社團</h2>
              
              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm text-gray-600">社團名稱：</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">{formData.name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">類別：</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">
                    {categories.find(c => c.id === formData.category)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">隱私設定：</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">
                    {formData.privacy === 'public' ? '公開社團' : '私密社團'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">描述：</span>
                  <p className="text-sm text-gray-900 mt-1 line-clamp-3">{formData.description}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelConfirm}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium border border-gray-300"
                >
                  返回修改
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCreate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  確認創建
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
