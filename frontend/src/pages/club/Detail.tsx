import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// TypeScript interface for club detail data - ready for backend integration
interface ClubDetail {
  id: number;
  name: string;
  description: string;
  category: string;
  cover_image_url?: string;
  member_count: number;
  created_at: string;
  owner: {
    id: number;
    username: string;
  };
  members?: {
    id: number;
    username: string;
    joined_at: string;
  }[];
}

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API endpoint when backend is ready
    // Example: fetch(`/api/clubs/${id}`)
    const fetchClubDetail = async () => {
      try {
        setLoading(true);
        
        // Mock data for development - replace with actual API call
        // const response = await fetch(`/api/clubs/${id}`);
        // const data = await response.json();
        
        // Temporary mock data matching SVG design expectations
        const mockData: ClubDetail = {
          id: Number(id),
          name: 'Mystery Love',
          description: '這是一個關於神秘小說的討論社團。我們每週會選讀一本推理小說，並在線上進行深入討論。歡迎所有喜愛推理、懸疑、偵探故事的讀者加入我們！\n\n社團活動包括：\n- 每週書籍討論\n- 月度閱讀挑戰\n- 作者訪談活動\n- 推理遊戲之夜',
          category: 'Mystery',
          cover_image_url: '',
          member_count: 156,
          created_at: '2024-01-08',
          owner: {
            id: 1,
            username: 'Admin User'
          },
          members: [
            { id: 1, username: 'Member 1', joined_at: '2024-01-08' },
            { id: 2, username: 'Member 2', joined_at: '2024-02-20' },
            { id: 3, username: 'Member 3', joined_at: '2022-08-24' },
          ]
        };

        setClub(mockData);
        setError(null);
      } catch (err) {
        setError('載入社團詳情失敗');
        console.error('Error fetching club detail:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClubDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D7E2EF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04C0F4] mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-[#D7E2EF] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-red-600 mb-4">錯誤</h2>
          <p className="text-gray-700 mb-6">{error || '找不到社團'}</p>
          <button
            onClick={() => navigate('/club/directory')}
            className="w-full bg-[#04C0F4] text-white py-2 px-4 rounded-lg hover:bg-[#03A8D8] transition-colors"
          >
            返回社團列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D7E2EF] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Container - White rounded rectangle matching SVG design */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Club Image Area with Gradient Overlay - matching SVG design */}
          <div className="relative h-64 bg-gradient-to-b from-[#DBEAFE] to-[#E0F5FD]">
            {club.cover_image_url ? (
              <>
                <img
                  src={club.cover_image_url}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay like SVG design */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#DBEAFE]/50"></div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl text-[#04C0F4] mb-2">📚</div>
                  <p className="text-gray-400">暫無封面圖片</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Club Name and Description - "Simplified description" in SVG */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{club.name}</h1>
              <p className="text-gray-500 text-lg">{club.category}</p>
            </div>

            {/* Action Buttons Row - Matching SVG design exactly */}
            <div className="flex gap-4 mb-8">
              {/* Club Info Button - Light blue bg (#E0F5FD) with cyan border (#04C0F4) */}
              <button className="flex-1 py-3 px-6 bg-[#E0F5FD] text-[#04C0F4] border-[1.5px] border-[#04C0F4] rounded-lg font-medium hover:bg-[#D0EBFA] transition-colors">
                社團資訊
              </button>
              
              {/* Join Club Button - Cyan bg (#04C0F4) with white text */}
              <button className="flex-1 py-3 px-6 bg-[#04C0F4] text-white rounded-lg font-medium hover:bg-[#03A8D8] transition-colors">
                加入社團
              </button>
            </div>

            {/* Club Info Section - Member count and creation date like SVG */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">創建日期</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(club.created_at).toLocaleDateString('zh-TW')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">成員人數</p>
                  <p className="text-gray-800 font-medium">{club.member_count} 人</p>
                </div>
              </div>
            </div>

            {/* About this Club Section - matching SVG "About this Club" header */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">關於這個社團</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {club.description}
              </p>
            </div>

            {/* Members Section (if available) */}
            {club.members && club.members.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">最近加入的成員</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {club.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Avatar with cyan background matching SVG cyan theme */}
                      <div className="w-10 h-10 bg-[#04C0F4] rounded-full flex items-center justify-center text-white font-medium">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{member.username}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(member.joined_at).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Directory Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/club/directory')}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← 返回社團列表
          </button>
        </div>
      </div>
    </div>
  );
}
