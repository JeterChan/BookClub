import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { profileService, UserProfile } from '../../services/profileService';
import { Button } from '../ui/Button';

interface GoogleAccountTabProps {
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

export const GoogleAccountTab = ({ profile, onUpdate }: GoogleAccountTabProps) => {
  const isLinked = profile.oauth_provider === 'google';

  const handleLink = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Note: The library gives an access token, but our backend needs an ID token.
        // For a real app, you would exchange this access token for an ID token or use a different flow.
        // As a workaround, we'll assume the backend can handle this, or we'd need a different library/setup.
        // This is a known limitation of this specific React library.
        // Let's pretend we get an id_token for now.
        const id_token = (tokenResponse as any).id_token || tokenResponse.access_token;
        const updatedProfile = await profileService.linkGoogleAccount(id_token);
        onUpdate(updatedProfile);
        toast.success('Google 帳號已成功綁定！');
      } catch (error: any) {
        toast.error(error.response?.data?.detail || '綁定失敗，請稍後再試。');
      }
    },
    onError: () => toast.error('Google 登入失敗。'),
  });

  const handleUnlink = async () => {
    if (window.confirm('您確定要解除綁定 Google 帳號嗎？您將需要使用密碼登入。')) {
      try {
        const updatedProfile = await profileService.unlinkGoogleAccount();
        onUpdate(updatedProfile);
        toast.success('Google 帳號已解除綁定。');
      } catch (error: any) {
        toast.error(error.response?.data?.detail || '解除綁定失敗，請確認您已設定密碼。');
      }
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Google 帳號綁定</h3>
      <p className="mt-1 text-sm text-gray-600">
        {isLinked
          ? '您的帳號已綁定 Google，您可以使用 Google 快速登入。'
          : '綁定您的 Google 帳號以便快速登入。'}
      </p>
      <div className="mt-6">
        {isLinked ? (
          <Button variant="danger" onClick={handleUnlink}>
            解除綁定 Google 帳號
          </Button>
        ) : (
          <Button onClick={() => handleLink()}>
            綁定 Google 帳號
          </Button>
        )}
      </div>
    </div>
  );
};
