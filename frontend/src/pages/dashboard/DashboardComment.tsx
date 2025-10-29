export default function DashboardComment() {
  const comments = [
    {
      id: 1,
      clubName: '現代文學讀書會',
      bookName: '挪威的森林',
      content: '這本書對於孤獨的描寫真的很深刻，主角渡邊徹的內心世界讓人產生共鳴...',
      timestamp: '2024-05-20 14:30',
      replies: 8,
      likes: 24,
    },
    {
      id: 2,
      clubName: '科幻小說愛好者',
      bookName: '三體',
      content: '黑暗森林法則的設定太精彩了！這個宇宙觀讓人細思極恐，作者的想像力令人敬佩。',
      timestamp: '2024-05-20 10:15',
      replies: 15,
      likes: 42,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">我的留言</h2>
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                我
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900">我</span>
                  <span className="text-sm text-gray-500">在</span>
                  <span className="text-sm font-medium text-brand-primary">{comment.clubName}</span>
                </div>
                <p className="text-gray-700 mb-3">{comment.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{comment.timestamp}</span>
                  <span>{comment.replies} 則回覆</span>
                  <span>{comment.likes} 讚</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm h-fit">
        <h3 className="font-semibold text-gray-900 mb-4">留言統計</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">總留言數</span>
            <span className="font-bold text-brand-primary">{comments.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
