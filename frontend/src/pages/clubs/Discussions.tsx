import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useBookClubStore } from '../../store/bookClubStore';
import toast from 'react-hot-toast';

const Discussions: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { discussions, loading, error, fetchDiscussions, detailClub, clearError } = useBookClubStore();

  useEffect(() => {
    if (clubId) {
      fetchDiscussions(Number(clubId));
    }
  }, [fetchDiscussions, clubId]);

  // 處理錯誤並在讀書會被刪除時導向列表頁
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
      
      if (!detailClub && error === '此讀書會已被刪除') {
        setTimeout(() => {
          navigate('/clubs');
        }, 2000);
      }
    }
  }, [error, clearError, detailClub, navigate]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate(`/clubs/${clubId}`)} 
            className="border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← 返回讀書會
          </button>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">討論區</h1>
            <p className="text-sm text-gray-500 mt-2">在「{detailClub?.name}」讀書會中</p>
          </div>
          <Link 
            to={`/clubs/${clubId}/discussions/new`} 
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            + 發起新討論
          </Link>
        </div>
        
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">所有主題</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {discussions.map((topic) => (
              <li key={topic.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                <Link to={`/clubs/${clubId}/discussions/${topic.id}`} className="block">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700">{topic.title}</h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      💬 {topic.comment_count} 則留言
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>發起人：{topic.author?.display_name}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Discussions;
