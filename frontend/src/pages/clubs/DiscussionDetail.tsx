import React, { useEffect, useState } from 'react';
import { useBookClubStore } from '../../store/bookClubStore';
import { useNavigate, useParams } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';

const DiscussionDetail: React.FC = () => {
  const { clubId, topicId } = useParams<{ clubId: string; topicId: string }>();
  const navigate = useNavigate();
  const { currentTopic, loading, error, fetchDiscussion, addComment } = useBookClubStore();
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (clubId && topicId) {
      fetchDiscussion(Number(clubId), Number(topicId));
    }
  }, [fetchDiscussion, clubId, topicId]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clubId && topicId && comment) {
      addComment(Number(clubId), Number(topicId), { content: comment });
      setComment('');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!currentTopic) return <div className="p-4">Topic not found</div>;

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate(`/clubs/${clubId}/discussions`)} 
            className="border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← 返回討論列表
          </button>
        </div>
        
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              {currentTopic.author?.avatar_url ? (
                <img
                  src={getImageUrl(currentTopic.author.avatar_url) || undefined}
                  alt={currentTopic.author.display_name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600">
                  <span className="text-lg font-medium leading-none text-white">
                    {currentTopic.author?.display_name?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-semibold text-gray-900">{currentTopic.author?.display_name}</div>
              <div className="text-sm text-gray-500">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">發起人</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{currentTopic.title}</h1>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{currentTopic.content}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">{currentTopic.comments?.length || 0} 則留言</h2>
          <div className="space-y-4">
            {currentTopic.comments && currentTopic.comments.map((comment) => (
              <div key={comment.id} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {comment.author?.avatar_url ? (
                      <img
                        src={getImageUrl(comment.author.avatar_url) || undefined}
                        alt={comment.author.display_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-500">
                        <span className="text-lg font-medium leading-none text-white">
                          {comment.author?.display_name?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 mb-1">{comment.author?.display_name}</div>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">發表你的看法</h2>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              rows={4}
              placeholder="分享你的想法..."
              required
            />
            <div className="mt-4 flex justify-end">
              <button 
                type="submit" 
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                送出留言
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;
