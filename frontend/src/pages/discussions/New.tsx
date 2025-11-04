import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '../../components/Header';

const createDiscussionSchema = z.object({
  title: z.string().min(5, '標題至少需要 5 個字').max(100, '標題不能超過 100 個字'),
  content: z.string().min(20, '內容至少需要 20 個字').max(5000, '內容不能超過 5000 個字'),
  club: z.string().min(1, '請選擇社團'),
});

type CreateDiscussionForm = z.infer<typeof createDiscussionSchema>;

export default function NewDiscussion() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<CreateDiscussionForm>({
    resolver: zodResolver(createDiscussionSchema),
    defaultValues: {
      title: '',
      content: '',
      club: ''
    }
  });

  const contentValue = watch('content');

  const clubs = [
    { id: '1', name: '古典文學社' },
    { id: '2', name: '科幻讀書會' },
    { id: '3', name: '推理小說' },
    { id: '4', name: '自我成長' },
    { id: '5', name: '商業管理' },
    { id: '6', name: '歷史研究' },
  ];

  const onSubmit = async (data: CreateDiscussionForm) => {
    console.log(data);
    // TODO: API call
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">發起新討論</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Club Select */}
            <div>
              <label htmlFor="club" className="block text-sm font-medium text-gray-700 mb-2">
                選擇社團 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('club')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04c0f4] focus:border-transparent"
              >
                <option value="">請選擇社團</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
              {errors.club && (
                <p className="mt-1 text-sm text-red-600">{errors.club.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                討論標題 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="例如：紅樓夢第一回讀後感"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04c0f4] focus:border-transparent"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  討論內容 <span className="text-red-500">*</span>
                </label>
                <span className="text-sm text-gray-500">
                  {contentValue?.length || 0}/5000
                </span>
              </div>
              <textarea
                {...register('content')}
                placeholder="分享你的想法、觀點或提出問題..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04c0f4] focus:border-transparent resize-none"
                rows={10}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2"> 討論小提示</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li> 清晰表達你的觀點或問題</li>
                <li> 尊重不同的意見和看法</li>
                <li> 避免發表與讀書無關的內容</li>
                <li> 歡迎引用書中片段來支持你的論點</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#04c0f4] text-white rounded-lg hover:bg-[#03a8d8] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '發佈中...' : '發起討論'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
