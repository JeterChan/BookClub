import { useState, useEffect } from 'react';
import { Tabs } from '../components/ui/Tabs';
import type { Tab } from '../components/ui/Tabs';
import { BasicInfoTab } from '../components/profile/BasicInfoTab';
import { AvatarTab } from '../components/profile/AvatarTab';
import { InterestTagsTab } from '../components/profile/InterestTagsTab';
import { PrivacyTab } from '../components/profile/PrivacyTab';
import { GoogleAccountTab } from '../components/profile/GoogleAccountTab';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { profileService } from '../services/profileService';
import type { UserProfile } from '../services/profileService';

/**
 * Profile - Profile management page
 * Allows users to edit profile info, avatar, tags, and privacy settings
 * Protected by PrivateRoute
 */
const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updated: UserProfile) => {
    setProfile(updated);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || '無法載入個人檔案，請稍後再試'}
          </p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  // Define tabs
  const profileTabs: Tab[] = [
    {
      id: 'basic',
      label: '基本資料',
      icon: '👤',
      content: <BasicInfoTab profile={profile} onUpdate={handleProfileUpdate} />,
    },
    {
      id: 'avatar',
      label: '頭像設定',
      icon: '📷',
      content: <AvatarTab profile={profile} onUpdate={handleProfileUpdate} />,
    },
    {
      id: 'tags',
      label: '興趣標籤',
      icon: '🏷️',
      content: <InterestTagsTab profile={profile} onUpdate={handleProfileUpdate} />,
    },
    {
      id: 'privacy',
      label: '隱私設定',
      icon: '🔒',
      content: <PrivacyTab profile={profile} onUpdate={handleProfileUpdate} />,
    },
    {
      id: 'google',
      label: 'Google 帳號',
      icon: '🇬',
      content: <GoogleAccountTab profile={profile} onUpdate={handleProfileUpdate} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">個人檔案設定</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Tabs tabs={profileTabs} defaultTab="basic" />
        </div>
      </div>
    </div>
  );
};

export default Profile;
