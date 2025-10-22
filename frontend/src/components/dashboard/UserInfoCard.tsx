import { Link } from 'react-router-dom';
import type { User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { formatFullDate } from '../../utils/dateFormatter';

interface UserInfoCardProps {
  user: User;
}

/**
 * UserInfoCard - Display user profile information
 * Shows avatar, name, email, join date, and edit link
 */
export const UserInfoCard = ({ user }: UserInfoCardProps) => {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <Avatar 
          src={user.avatar_url} 
          alt={user.display_name} 
          size="xl" 
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{user.display_name}</h2>
          <p className="text-gray-600 mt-1">{user.email}</p>
          {user.bio && (
            <p className="text-gray-700 mt-2 text-sm">{user.bio}</p>
          )}
          <p className="text-gray-500 text-sm mt-2">
            加入於 {formatFullDate(user.created_at)}
          </p>
          <Link 
            to="/profile" 
            className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
          >
            編輯個人檔案 →
          </Link>
        </div>
      </div>
    </Card>
  );
};
