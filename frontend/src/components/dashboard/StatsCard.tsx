import type { DashboardStats } from '../../services/dashboardService';
import { Card } from '../ui/Card';

interface StatsCardProps {
  stats: DashboardStats;
}

interface StatItemProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const StatItem = ({ label, value, icon, color }: StatItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`text-4xl ${color}`}>
        {icon}
      </div>
    </div>
  );
};

/**
 * StatsCard - Display user statistics
 * Shows clubs count, books read, and discussions count
 */
export const StatsCard = ({ stats }: StatsCardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <StatItem 
          label="參加的讀書會" 
          value={stats.clubsCount} 
          icon="📚"
          color="text-blue-600"
        />
      </Card>
      <Card>
        <StatItem 
          label="閱讀的書籍" 
          value={stats.booksRead} 
          icon="📖"
          color="text-green-600"
        />
      </Card>
      <Card>
        <StatItem 
          label="參與的討論" 
          value={stats.discussionsCount} 
          icon="💬"
          color="text-purple-600"
        />
      </Card>
    </div>
  );
};
