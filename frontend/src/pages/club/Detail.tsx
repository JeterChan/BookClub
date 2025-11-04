import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

// TypeScript interfaces for club detail data - ready for backend integration
interface ClubDetail {
  id: number;
  name: string;
  description: string;
  category: string;
  cover_image_url?: string;
  member_count: number;
  created_at: string;
  is_member: boolean; // 是否已加入社團
  is_favorited: boolean; // 是否已收藏
  tags: string[]; // 社團標籤
  owner: {
    id: number;
    username: string;
  };
  members?: {
    id: number;
    username: string;
    joined_at: string;
  }[];
  latest_announcements?: {
    id: number;
    title: string;
    content: string;
    created_at: string;
  }[];
  latest_discussions?: {
    id: number;
    title: string;
    author: string;
    created_at: string;
    reply_count: number;
  }[];
}

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toggle favorite status
  const toggleFavorite = () => {
    if (!club) return;
    setClub({ ...club, is_favorited: !club.is_favorited });
    // TODO: Call API to update favorite status in database
    console.log('Toggle favorite for club:', id);
  };

  // Toggle membership status (join/leave)
  const toggleMembership = () => {
    if (!club) return;
    setClub({ ...club, is_member: !club.is_member });
    // TODO: Call API to update membership status in database
    console.log('Toggle membership for club:', id);
  };

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
          is_member: false, // 可以根據需要修改測試不同狀態
          is_favorited: false,
          tags: ['推理', '懸疑', '小說', '閱讀'], // 社團標籤
          owner: {
            id: 1,
            username: 'Admin User'
          },
          members: [
            { id: 1, username: 'Member 1', joined_at: '2024-01-08' },
            { id: 2, username: 'Member 2', joined_at: '2024-02-20' },
            { id: 3, username: 'Member 3', joined_at: '2022-08-24' },
          ],
          latest_announcements: [
            {
              id: 1,
              title: '本週書單公告',
              content: '本週我們將閱讀東野圭吾的《嫌疑犯X的獻身》，歡迎大家積極參與討論！',
              created_at: '2024-10-25'
            },
            {
              id: 2,
              title: '下次線上聚會時間',
              content: '下週六晚上8點，我們會進行線上讀書會，請準時參加。',
              created_at: '2024-10-20'
            }
          ],
          latest_discussions: [
            {
              id: 1,
              title: '《嫌疑犯X的獻身》討論串',
              author: '張小明',
              created_at: '2024-10-26',
              reply_count: 24
            },
            {
              id: 2,
              title: '推理小說推薦',
              author: '李華',
              created_at: '2024-10-24',
              reply_count: 18
            },
            {
              id: 3,
              title: '東野圭吾作品心得',
              author: '王大同',
              created_at: '2024-10-22',
              reply_count: 32
            }
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
    <div className="min-h-screen bg-[#D7E2EF]">
      {/* Header */}
      <Header />
      
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#04C0F4] transition-colors shadow-sm"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium text-gray-700">返回</span>
          </button>
          
          {/* Main Card Container - Horizontal Layout */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg overflow-hidden mb-6">
          <div className="flex flex-col lg:flex-row relative">
            {/* Favorite Button - Inside Card */}
            <button 
              onClick={toggleFavorite}
              className="absolute top-4 right-4 z-10 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium hover:border-[#04C0F4] hover:bg-[#E0F5FD] transition-colors flex items-center gap-2 shadow-md"
            >
              <span className="text-xl">{club.is_favorited ? '⭐' : '☆'}</span>
              <span className="text-sm font-medium text-gray-700">
                {club.is_favorited ? '已收藏' : '收藏'}
              </span>
            </button>

            {/* Left: Cover Image Section */}
            <div className="lg:w-[260px] h-[180px] lg:h-auto flex-shrink-0 relative">
              {club.cover_image_url ? (
                <div className="relative h-full">
                  <img
                    src={club.cover_image_url}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute inset-0 bg-[#DBEAFE] opacity-70 mix-blend-multiply" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#DBEAFE] to-[#E0F5FD]">
                  <span className="text-6xl">📚</span>
                </div>
              )}
            </div>

            {/* Right: Content Section */}
            <div className="flex-1 p-6 flex flex-col">
              {/* Title and Category */}
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {club.name}
                </h1>
                <p className="text-lg text-gray-600">{club.category}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {club.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-[#E0F5FD] text-[#04C0F4] text-sm rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons Row - 條件顯示 */}
              <div className="flex flex-wrap gap-3 mb-6">
                {club.is_member ? (
                  <>
                    <button 
                      onClick={() => navigate(`/club/${id}/discussions`)}
                      className="px-6 py-2 bg-[#E0F5FD] border-[1.5px] border-[#04C0F4] text-[#04C0F4] rounded-lg font-medium hover:bg-[#04C0F4] hover:text-white transition-colors"
                    >
                      進入討論
                    </button>
                    <button 
                      onClick={toggleMembership}
                      className="px-6 py-2 bg-white border-[1.5px] border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
                    >
                      離開社團
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={toggleMembership}
                    className="px-8 py-3 bg-[#04C0F4] text-white rounded-lg font-semibold hover:bg-[#03a8d8] transition-colors shadow-lg text-base"
                  >
                    加入社團
                  </button>
                )}
              </div>

              {/* Club Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">創建時間</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(club.created_at).toLocaleDateString("zh-TW")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">成員人數</p>
                  <p className="text-gray-900 font-medium">{club.member_count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            關於這個社團
          </h2>
          <p className="text-gray-700 whitespace-pre-line">
            {club.description}
          </p>
        </div>

        {/* Latest Announcements Section */}
        {club.latest_announcements && club.latest_announcements.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              最新公告
            </h2>
            <div className="space-y-4">
              {club.latest_announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="p-4 bg-[#E0F5FD] rounded-lg border border-[#04C0F4] hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-gray-900 mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-700 text-sm mb-2">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(announcement.created_at).toLocaleDateString("zh-TW")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Discussions Section */}
        {club.latest_discussions && club.latest_discussions.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              最新討論
            </h2>
            <div className="space-y-3">
              {club.latest_discussions.map((discussion) => (
                <div 
                  key={discussion.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                  onClick={() => navigate(`/discussions/${discussion.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {discussion.title}
                    </h3>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                      {discussion.reply_count} 則回覆
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{discussion.author}</span>
                    <span>•</span>
                    <span>{new Date(discussion.created_at).toLocaleDateString("zh-TW")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members Section */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            成員 ({club.members?.length || 0})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {club.members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#04C0F4] flex items-center justify-center text-white font-medium">
                  {member.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {member.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(member.joined_at).toLocaleDateString("zh-TW")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
