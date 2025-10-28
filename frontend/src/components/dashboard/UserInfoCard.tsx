import type { User } from '../../types/auth';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { formatFullDate } from '../../utils/dateFormatter';

interface UserInfoCardProps {
  user: User;
}

/**
 * UserInfoCard - Display user profile information in a vertical layout.
 * Shows avatar, name, email, and join date.
 */
export const UserInfoCard = ({ user }: UserInfoCardProps) => {
  return (
    <Card>
      <div className="flex flex-col items-center text-center gap-4">
        <Avatar 
          src={user.avatar_url} 
          alt={user.display_name} 
          size="xl" 
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{user.display_name}</h2>
          <p className="text-gray-600 mt-1">{user.email}</p>
          <p className="text-gray-500 text-sm mt-2">
            加入於 {formatFullDate(user.created_at)}
          </p>
        </div>
      </div>
    </Card>
  );
};
