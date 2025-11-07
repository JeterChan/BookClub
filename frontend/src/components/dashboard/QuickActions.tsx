import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';

/**
 * QuickActions - Quick action buttons for common tasks
 * Provides shortcuts to explore, create clubs, and more
 */
export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: '🔍',
      label: '探索社團',
      onClick: () => navigate('/clubs'),
    },
    {
      icon: '➕',
      label: '建立新社團',
      onClick: () => navigate('/clubs/create'),
    },
  ];

  return (
    <Card>
      <h3 className="text-base font-semibold text-gray-900 mb-3">快速操作</h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-black hover:bg-gray-50 transition-all text-left"
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="font-medium text-gray-900">{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};