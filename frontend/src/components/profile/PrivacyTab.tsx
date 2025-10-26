import { Button } from '../ui/Button';

export const PrivacyTab = () => {
  const handleDeactivate = () => {
    if (window.confirm('您確定要停用您的帳號嗎？此操作無法復原。')) {
      // Call deactivation service here
      alert('帳號已停用');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium text-gray-900">帳號停用</h3>
        <p className="mt-1 text-sm text-gray-600">
          停用您的帳號將會移除您的個人資料，但您發布的內容（如討論）將會保留。此操作無法復原。
        </p>
        <Button
          onClick={handleDeactivate}
          variant="destructive"
          className="mt-4"
        >
          停用我的帳號
        </Button>
      </div>
    </div>
  );
};

