import { useNavigate } from 'react-router-dom';

export default function Comment() {
  const navigate = useNavigate();
  const comments = [
    {
      id: 1,
      clubName: '古典文學社',
      bookName: '紅樓夢',
      content: '這一章節對於賈寶玉的性格描寫非常細膩，作者透過細節展現了他的多面性格...',
      timestamp: '2024-03-15 14:30',
      replies: 5,
      likes: 12,
    },
    {
      id: 2,
      clubName: '科幻讀書會',
      bookName: '三體',
      content: '黑暗森林法則的提出讓人深思，這種宇宙社會學的設定非常精彩...',
      timestamp: '2024-03-14 09:15',
      replies: 8,
      likes: 23,
    },
    {
      id: 3,
      clubName: '推理小說',
      bookName: '東方快車謀殺案',
      content: '結局的反轉實在令人驚豔，阿嘉莎克里斯蒂的敘事技巧堪稱大師級...',
      timestamp: '2024-03-13 16:45',
      replies: 3,
      likes: 8,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{comments.length}</p>
              <p className="text-sm text-gray-500">總評論數</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">43</p>
              <p className="text-sm text-gray-500">獲得讚數</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">16</p>
              <p className="text-sm text-gray-500">收到回覆</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">我的評論</h2>
        <div className="max-h-[640px] overflow-y-auto space-y-4 pr-2">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 border border-gray-200 rounded-lg hover:border-brand-primary transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-brand-primary">{comment.clubName}</span>
                    <span className="text-gray-300"></span>
                    <span className="text-sm text-gray-600">{comment.bookName}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    onClick={() => navigate(`/comments/${comment.id}/edit`)}
                    className="text-gray-400 hover:text-brand-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{comment.timestamp}</span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {comment.replies} 回覆
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {comment.likes} 讚
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
