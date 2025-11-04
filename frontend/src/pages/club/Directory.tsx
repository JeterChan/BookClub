import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

interface Club {
  id: number;
  name: string;
  description: string;
  category: string;
  members: number;
  is_member: boolean;
  is_favorited: boolean;
}

export default function ClubDirectory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [clubs, setClubs] = useState<Club[]>([
    {
      id: 1,
      name: '古典文學社',
      description: '一起閱讀紅樓夢、三國演義等經典名著，探討古典文學之美',
      category: 'literature',
      members: 156,
      is_member: false,
      is_favorited: false
    },
    {
      id: 2,
      name: '科幻讀書會',
      description: '從三體到基地，探索科幻世界的無限可能',
      category: 'scifi',
      members: 203,
      is_member: true,
      is_favorited: true
    },
    {
      id: 3,
      name: '推理小說',
      description: '福爾摩斯、阿嘉莎克里斯蒂，一起解開謎團',
      category: 'mystery',
      members: 287,
      is_member: false,
      is_favorited: true
    },
    {
      id: 4,
      name: '自我成長',
      description: '閱讀心理學、個人成長類書籍，成為更好的自己',
      category: 'selfhelp',
      members: 342,
      is_member: true,
      is_favorited: false
    },
    {
      id: 5,
      name: '商業管理',
      description: '商業思維、管理策略，提升職場競爭力',
      category: 'business',
      members: 198,
      is_member: false,
      is_favorited: false
    },
    {
      id: 6,
      name: '歷史研究',
      description: '從史記到資治通鑑，了解歷史脈絡',
      category: 'history',
      members: 142,
      is_member: false,
      is_favorited: true
    },
  ]);

  // Toggle favorite status
  const toggleFavorite = (clubId: number) => {
    setClubs(clubs.map(club => 
      club.id === clubId 
        ? { ...club, is_favorited: !club.is_favorited }
        : club
    ));
    // TODO: Call API to update favorite status in database
    console.log('Toggle favorite for club:', clubId);
  };

  // Toggle membership status
  const toggleMembership = (clubId: number) => {
    setClubs(clubs.map(club => 
      club.id === clubId 
        ? { ...club, is_member: !club.is_member }
        : club
    ));
    // TODO: Call API to update membership status in database
    console.log('Toggle membership for club:', clubId);
  };

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'literature', name: '文學' },
    { id: 'scifi', name: '科幻' },
    { id: 'mystery', name: '推理' },
    { id: 'selfhelp', name: '自我成長' },
    { id: 'business', name: '商業' },
    { id: 'history', name: '歷史' },
  ];

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">探索社團</h1>
          <button 
            onClick={() => navigate('/clubs/create')}
            className="px-6 py-2 bg-[#04C0F4] text-white rounded-lg hover:bg-[#04C0F4]/90 transition-colors font-medium flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Create Club
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋社團名稱或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors font-medium ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <div key={club.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col relative">
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(club.id)}
                  className="absolute top-4 right-4 text-2xl hover:scale-110 transition-transform"
                >
                  {club.is_favorited ? '⭐' : '☆'}
                </button>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {club.name[0]}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{club.name}</h3>
                    <p className="text-sm text-gray-600">{club.members} 位成員</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 line-clamp-2 flex-grow">{club.description}</p>
                
                {/* Conditional Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/clubs/${club.id}`)}
                    className="flex-1 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    查看社團
                  </button>
                  {club.is_member ? (
                    <button
                      onClick={() => toggleMembership(club.id)}
                      className="flex-1 py-2 rounded-lg font-medium transition-colors bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    >
                      離開社團
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleMembership(club.id)}
                      className="flex-1 py-2 rounded-lg font-medium transition-colors bg-[#04C0F4] text-white hover:bg-[#04C0F4]/90"
                    >
                      加入社團
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">找不到符合的社團</h3>
            <p className="text-gray-600">試試調整搜尋條件或類別篩選</p>
          </div>
        )}
      </div>
    </div>
  );
}
