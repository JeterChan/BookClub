import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import toast from 'react-hot-toast';

export default function CommentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState({
    clubName: '',
    bookName: '',
    content: '',
    timestamp: '',
  });

  useEffect(() => {
    // TODO: 從 API 獲取評論資料
    // 模擬數據
    const mockComment = {
      clubName: '古典文學社',
      bookName: '紅樓夢',
      content: '這一章節對於賈寶玉的性格描寫非常細膩，作者透過細節展現了他的多面性格...',
      timestamp: '2024-03-15 14:30',
    };
    setComment(mockComment);
  }, [id]);

  const handleSave = async () => {
    if (!comment.content.trim()) {
      toast.error('評論內容不能為空');
      return;
    }

    setLoading(true);
    try {
      // TODO: 調用 API 保存評論
      // await commentService.updateComment(id, { content: comment.content });
      
      toast.success('評論已更新');
      navigate('/account?tab=comment'); // 返回帳號設定的「我的留言」標籤
    } catch (error) {
      console.error('更新評論失敗:', error);
      toast.error('更新失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/account?tab=comment'); // 返回帳號設定的「我的留言」標籤
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#04c0f4]/5 to-[#04c0f4]/10">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center space-x-2 text-sm">
          <button
            onClick={() => navigate('/account')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            帳號設定
          </button>
          <span className="text-gray-400">/</span>
          <button
            onClick={() => navigate('/account')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            我的留言
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">編輯評論</span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">編輯評論</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium text-blue-600">{comment.clubName}</span>
            <span className="text-gray-300">•</span>
            <span>{comment.bookName}</span>
            <span className="text-gray-300">•</span>
            <span>{comment.timestamp}</span>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                評論內容
              </label>
              <textarea
                value={comment.content}
                onChange={(e) => setComment({ ...comment, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="分享你的想法..."
              />
              <p className="mt-2 text-sm text-gray-500">
                {comment.content.length} 字
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>儲存中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>儲存變更</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">編輯提示</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>請保持評論內容的客觀和尊重</li>
                <li>編輯後的評論會標記為「已編輯」</li>
                <li>修改內容需符合社團規範</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
