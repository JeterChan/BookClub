import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookClubStore } from '../../store/bookClubStore';


const DiscussionNew: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { addDiscussion, detailClub } = useBookClubStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clubId) {
      addDiscussion(Number(clubId), { title, content });
      navigate(`/clubs/${clubId}/discussions`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold">發起新討論</h1>
        <p className="text-sm text-gray-500 mb-6">在「{detailClub?.name}」讀書會中</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">標題</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">內容</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={6}
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              返回
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              發佈主題
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscussionNew;
