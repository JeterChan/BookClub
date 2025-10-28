import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';

/**
 * QuickActions - Quick action buttons for common tasks
 * Provides shortcuts to explore, create clubs, and settings
 */
export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: '🔍',
      label: '探索讀書會',
      description: '發現有趣的讀書會',
      onClick: () => navigate('/clubs'),
      variant: 'primary' as const,
    },
    {
      icon: '➕',
      label: '建立讀書會',
      description: '創建自己的讀書會',
      onClick: () => navigate('/clubs/create'),
      variant: 'secondary' as const,
    },
    {
      icon: '⚙️',
      label: '個人檔案設定',
      description: '管理個人檔案',
      onClick: () => navigate('/profile'),
      variant: 'secondary' as const,
    },
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">{action.icon}</span>
            <span className="font-semibold text-gray-900">{action.label}</span>
            <span className="text-sm text-gray-600">{action.description}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};