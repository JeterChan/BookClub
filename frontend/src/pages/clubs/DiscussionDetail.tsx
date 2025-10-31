import React, { useEffect, useState } from 'react';
import { useBookClubStore } from '../../store/bookClubStore';
import { useNavigate, useParams } from 'react-router-dom';

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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4">
        <button onClick={() => navigate(`/clubs/${clubId}/discussions`)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
          &larr; 返回討論列表
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-500">
              <span className="text-lg font-medium leading-none text-white">{currentTopic.owner?.display_name?.charAt(0)}</span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900">{currentTopic.owner?.display_name}</div>
            <div className="text-sm text-gray-500">發起人</div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">{currentTopic.title}</h1>
        <p className="text-gray-700 whitespace-pre-wrap">{currentTopic.content}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">{currentTopic.comments?.length || 0} 則留言</h2>
        <div className="space-y-6">
          {currentTopic.comments && currentTopic.comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-500">
                  <span className="text-lg font-medium leading-none text-white">{comment.owner?.display_name?.charAt(0)}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{comment.owner?.display_name}</div>
                <p className="text-gray-700 whitespace-pre-wrap mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">發表你的看法</h2>
        <form onSubmit={handleCommentSubmit} className="bg-white shadow rounded-lg p-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={4}
            required
          />
          <div className="mt-4 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              送出留言
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscussionDetail;
