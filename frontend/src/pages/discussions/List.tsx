import { useState } from 'react';

export default function DiscussionsList() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'my' | 'popular'>('all');

  const discussions = [
    {
      id: 1,
      title: '紅樓夢第一回讀後感',
      author: '張小明',
      club: '古典文學社',
      replies: 24,
      views: 156,
      lastActivity: '2小時前',
      isPinned: true,
      hasNewReplies: true
    },
    {
      id: 2,
      title: '林黛玉人物性格分析討論',
      author: '李小華',
      club: '古典文學社',
      replies: 18,
      views: 203,
      lastActivity: '5小時前',
      isPinned: false,
      hasNewReplies: true
    },
    {
      id: 3,
      title: '三體中的物理學概念',
      author: '王大明',
      club: '科幻讀書會',
      replies: 31,
      views: 287,
      lastActivity: '1天前',
      isPinned: false,
      hasNewReplies: false
    },
    {
      id: 4,
      title: '推理小說中的詭計分類',
      author: '陳小美',
      club: '推理小說',
      replies: 15,
      views: 142,
      lastActivity: '2天前',
      isPinned: false,
      hasNewReplies: false
    },
  ];

  const filters = [
    { id: 'all' as const, name: '全部討論' },
    { id: 'my' as const, name: '我的討論' },
    { id: 'popular' as const, name: '熱門討論' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">討論區</h1>
          <button className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium">
            發起討論
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                activeFilter === filter.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>

        {/* Discussions List */}
        <div className="space-y-3">
          {discussions.map((discussion) => (
            <div
              key={discussion.id}
              className={`bg-white rounded-lg p-6 hover:shadow-md transition-shadow ${
                discussion.isPinned ? 'border-2 border-brand-primary' : 'shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {discussion.author[0]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {discussion.isPinned && (
                      <span className="px-2 py-1 bg-brand-primary text-white text-xs font-medium rounded">
                        置頂
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {discussion.club}
                    </span>
                    {discussion.hasNewReplies && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-brand-primary cursor-pointer">
                    {discussion.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{discussion.author}</span>
                    <span></span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {discussion.replies}
                    </span>
                    <span></span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {discussion.views}
                    </span>
                    <span></span>
                    <span>{discussion.lastActivity}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
