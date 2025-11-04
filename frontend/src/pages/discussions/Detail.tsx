import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DiscussionDetail() {
  const navigate = useNavigate();
  const [replyContent, setReplyContent] = useState('');
  const [showAllReplies, setShowAllReplies] = useState(false);
  
  // 討論文章的按讚狀態
  const [discussionLiked, setDiscussionLiked] = useState(false);
  const [discussionLikes, setDiscussionLikes] = useState(18);
  
  // 回覆的按讚狀態 (使用 Map 管理每個回覆的狀態)
  const [replyLikes, setReplyLikes] = useState<Map<number, { liked: boolean; count: number }>>(
    new Map([
      [1, { liked: false, count: 5 }],
      [2, { liked: false, count: 8 }],
      [3, { liked: false, count: 12 }],
      [4, { liked: false, count: 6 }],
      [5, { liked: false, count: 9 }],
      [6, { liked: false, count: 4 }],
    ])
  );

  // 切換討論文章的按讚
  const toggleDiscussionLike = () => {
    setDiscussionLiked(!discussionLiked);
    setDiscussionLikes(discussionLiked ? discussionLikes - 1 : discussionLikes + 1);
    // TODO: Call API to update like status in database
  };

  // 切換回覆的按讚
  const toggleReplyLike = (replyId: number) => {
    setReplyLikes(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(replyId);
      if (current) {
        newMap.set(replyId, {
          liked: !current.liked,
          count: current.liked ? current.count - 1 : current.count + 1
        });
      }
      return newMap;
    });
    // TODO: Call API to update like status in database
  };

  const discussion = {
    id: 1,
    title: '紅樓夢第一回讀後感',
    author: '張小明',
    content: `剛讀完紅樓夢第一回，對於開篇的石頭記故事很有感觸。作者用神話的形式來解釋這部書的來歷，實在是高明至極。

特別是女媧補天剩下的那塊石頭，後來幻化成為通靈寶玉，這種浪漫主義的手法，為整部小說增添了一層神秘色彩。

我認為曹雪芹用這個開頭，其實是在暗示這部書的內容雖然是虛構的，但其中的情感和人生道理卻是真實的。大家怎麼看？`,
    club: '古典文學社',
    createdAt: '3小時前',
    views: 156,
    likes: 18
  };

  const replies = [
    {
      id: 1,
      author: '李小華',
      content: '我也有同樣的感受！曹雪芹的這個開頭確實別具匠心。他用「假語村言」來包裝真實的人生百態，這種虛實結合的手法，在古典小說中是非常少見的。',
      createdAt: '2小時前',
      timestamp: new Date('2025-10-29T08:00:00').getTime(),
      likes: 5
    },
    {
      id: 2,
      author: '王大明',
      content: '石頭記這個名字也很有意思，暗示了全書的悲劇色彩。那塊無材補天的頑石，就像賈寶玉一樣，不為世俗所用，卻有著獨特的價值。',
      createdAt: '1小時前',
      timestamp: new Date('2025-10-29T09:00:00').getTime(),
      likes: 8
    },
    {
      id: 3,
      author: '陳小美',
      content: '贊同！而且「甄士隱」和「賈雨村」這兩個名字也很有深意，分別代表「真事隱」和「假語村」，作者真的是處處留下伏筆。',
      createdAt: '30分鐘前',
      timestamp: new Date('2025-10-29T09:30:00').getTime(),
      likes: 12
    },
    {
      id: 4,
      author: '林小花',
      content: '第一回還有一個重要的角色——甄士隱的女兒英蓮，她的命運其實預示了整部小說的主題：人生無常，世事難料。',
      createdAt: '15分鐘前',
      timestamp: new Date('2025-10-29T09:45:00').getTime(),
      likes: 6
    },
    {
      id: 5,
      author: '趙大山',
      content: '我特別喜歡開頭那首《好了歌》，「世人都曉神仙好，惟有功名忘不了」，真是道盡了人生的諷刺。',
      createdAt: '10分鐘前',
      timestamp: new Date('2025-10-29T09:50:00').getTime(),
      likes: 9
    },
    {
      id: 6,
      author: '孫小玉',
      content: '感謝大家的分享！我現在對第一回有了更深的理解，準備繼續往下讀了。',
      createdAt: '5分鐘前',
      timestamp: new Date('2025-10-29T09:55:00').getTime(),
      likes: 4
    }
  ];

  // 按時間排序（早到晚）
  const sortedReplies = useMemo(() => {
    return [...replies].sort((a, b) => a.timestamp - b.timestamp);
  }, []);

  // 決定顯示的回覆
  const displayedReplies = showAllReplies ? sortedReplies : sortedReplies.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回討論區
        </button>

        {/* Discussion */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {discussion.author[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                  {discussion.club}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{discussion.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{discussion.author}</span>
                <span></span>
                <span>{discussion.createdAt}</span>
                <span></span>
                <span>{discussion.views} 次查看</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-line">{discussion.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <button 
              onClick={toggleDiscussionLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                discussionLiked 
                  ? 'text-[#04c0f4] bg-blue-50' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg 
                className="w-5 h-5" 
                fill={discussionLiked ? "currentColor" : "none"}
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span className="font-medium">{discussionLikes}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              分享
            </button>
          </div>
        </div>

        {/* Replies */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{sortedReplies.length} 則回覆</h2>
          <div className="space-y-4">
            {displayedReplies.map((reply) => (
              <div key={reply.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {reply.author[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900">{reply.author}</span>
                      <span className="text-sm text-gray-600">{reply.createdAt}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{reply.content}</p>
                    <button 
                      onClick={() => toggleReplyLike(reply.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        replyLikes.get(reply.id)?.liked 
                          ? 'text-[#04c0f4]' 
                          : 'text-gray-600 hover:text-[#04c0f4]'
                      }`}
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill={replyLikes.get(reply.id)?.liked ? "currentColor" : "none"}
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span>{replyLikes.get(reply.id)?.count || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 顯示更多按鈕 */}
          {sortedReplies.length > 4 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllReplies(!showAllReplies)}
                className="px-6 py-2 bg-white border-2 border-[#04c0f4] text-[#04c0f4] rounded-lg hover:bg-[#E0F5FD] transition-colors font-medium"
              >
                {showAllReplies ? '收起回覆' : `顯示更多回覆 (${sortedReplies.length - 4})`}
              </button>
            </div>
          )}
        </div>

        {/* Reply Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">發表回覆</h3>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="分享你的想法..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04c0f4] focus:border-transparent resize-none"
            rows={4}
          />
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={() => setReplyContent('')}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              取消
            </button>
            <button className="px-6 py-2 bg-[#04c0f4] text-white rounded-lg hover:bg-[#03a8d8] transition-colors font-medium shadow-lg">
              發表回覆
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
