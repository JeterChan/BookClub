import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useBookClubStore } from '../../store/bookClubStore';

const Discussions: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { discussions, loading, error, fetchDiscussions, detailClub } = useBookClubStore();

  useEffect(() => {
    if (clubId) {
      fetchDiscussions(Number(clubId));
    }
  }, [fetchDiscussions, clubId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4">
        <button onClick={() => navigate(`/clubs/${clubId}`)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
          &larr; 返回讀書會
        </button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">討論區</h1>
          <p className="text-sm text-gray-500">在「{detailClub?.name}」讀書會中</p>
        </div>
        <Link to={`/clubs/${clubId}/discussions/new`} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          發起新討論
        </Link>
      </div>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">所有主題</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {discussions.map((topic) => (
            <li key={topic.id} className="p-4 hover:bg-gray-50">
              <Link to={`/clubs/${clubId}/discussions/${topic.id}`} className="block">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-blue-600 truncate">{topic.title}</p>
                  <p className="text-sm text-gray-500">{topic.comment_count} 則留言</p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <p>發起人: {topic.author?.display_name}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Discussions;
