import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

interface Discussion {
  id: number;
  title: string;
  author: string;
  replies: number;
  views: number;
  lastActivity: string;
  isPinned: boolean;
  hasNewReplies: boolean;
}

interface ClubInfo {
  id: number;
  name: string;
  member_count: number;
}

export default function ClubDiscussions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'my' | 'popular'>('all');
  const [club, setClub] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock club data - 之後替換為 API 呼叫
  useEffect(() => {
    // TODO: 替換為實際的 API 呼叫
    // fetch(`/api/clubs/${id}`)
    setTimeout(() => {
      setClub({
        id: Number(id),
        name: 'Mystery Love',
        member_count: 156
      });
      setLoading(false);
    }, 500);
  }, [id]);

  // Mock discussions data - 之後替換為 API 呼叫
  const discussions: Discussion[] = [
    {
      id: 1,
      title: '推理小說中的詭計分類與討論',
      author: '陳小美',
      replies: 24,
      views: 156,
      lastActivity: '2小時前',
      isPinned: true,
      hasNewReplies: true
    },
    {
      id: 2,
      title: '東野圭吾《嫌疑人X的獻身》讀後感',
      author: '李大華',
      replies: 18,
      views: 203,
      lastActivity: '5小時前',
      isPinned: false,
      hasNewReplies: true
    },
    {
      id: 3,
      title: '推薦一些經典的本格推理作品',
      author: '王小明',
      replies: 31,
      views: 287,
      lastActivity: '1天前',
      isPinned: false,
      hasNewReplies: false
    },
    {
      id: 4,
      title: '關於密室推理的討論',
      author: '張三',
      replies: 15,
      views: 142,
      lastActivity: '2天前',
      isPinned: false,
      hasNewReplies: false
    },
    {
      id: 5,
      title: '阿嘉莎·克里斯蒂作品推薦',
      author: '林小花',
      replies: 12,
      views: 98,
      lastActivity: '3天前',
      isPinned: false,
      hasNewReplies: false
    },
  ];

  const filters = [
    { id: 'all' as const, name: '全部討論' },
    { id: 'my' as const, name: '我的討論' },
    { id: 'popular' as const, name: '熱門討論' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#04c0f4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">找不到社團資訊</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name} - 討論區</h1>
              <p className="text-gray-600">社團成員：{club.member_count} 人</p>
            </div>
            <button 
              onClick={() => navigate(`/discussions/new?clubId=${id}`)}
              className="px-6 py-2 bg-[#04c0f4] text-white rounded-lg hover:bg-[#03a8d8] transition-colors font-medium shadow-lg"
            >
              發起討論
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                activeFilter === filter.id
                  ? 'bg-[#04c0f4] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>

        {/* Discussions List */}
        <div className="space-y-3">
          {discussions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500 mb-4">目前還沒有討論</p>
              <button 
                onClick={() => navigate(`/discussions/new?clubId=${id}`)}
                className="px-6 py-2 bg-[#04c0f4] text-white rounded-lg hover:bg-[#03a8d8] transition-colors font-medium"
              >
                成為第一個發起討論的人
              </button>
            </div>
          ) : (
            discussions.map((discussion) => (
              <div
                key={discussion.id}
                onClick={() => navigate(`/discussions/${discussion.id}`)}
                className={`bg-white rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${
                  discussion.isPinned ? 'border-2 border-[#04c0f4]' : 'shadow-sm'
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
                        <span className="px-2 py-1 bg-[#04c0f4] text-white text-xs font-medium rounded">
                          置頂
                        </span>
                      )}
                      {discussion.hasNewReplies && (
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-[#04c0f4]">
                      {discussion.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{discussion.author}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {discussion.replies}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {discussion.views}
                      </span>
                      <span>•</span>
                      <span>{discussion.lastActivity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
