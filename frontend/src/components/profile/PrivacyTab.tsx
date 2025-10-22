import { Card } from '../ui/Card';

interface PrivacyTabProps {
  profile: any;
  onUpdate: (updated: any) => void;
}

/**
 * PrivacyTab - Privacy settings (Placeholder)
 * Will be implemented in future iteration
 */
export const PrivacyTab = ({ profile, onUpdate }: PrivacyTabProps) => {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <div className="text-center py-8">
          <p className="text-4xl mb-2">🔒</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            隱私設定
          </h3>
          <p className="text-gray-600">
            此功能將在未來版本中實作
          </p>
        </div>
      </Card>
    </div>
  );
};
