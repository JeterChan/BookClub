import { useState } from 'react';
import AddTagModal from './AddTagModal';

interface PreferenceModalProps {
  onClose: () => void;
}

export default function PreferenceModal({ onClose }: PreferenceModalProps) {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    clubUpdates: true,
    commentReplies: true,
    weeklyDigest: false,
    language: 'zh-TW',
    theme: 'light',
  });

  // 用戶選擇的標籤
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Fantasy',
    'Productivity',
    'Memoir',
    'Product Design',
    'Historical',
    'Club Q&A',
  ]);

  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleAddTags = (newTags: string[]) => {
    setSelectedTags(prev => [...prev, ...newTags]);
  };

  const handleSave = async () => {
    try {
      console.log('Save preferences:', preferences);
      console.log('Selected tags:', selectedTags);
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">偏好設定</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Notification Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">通知偏好</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">電子郵件通知</p>
                  <p className="text-sm text-gray-500">接收電子郵件通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:shadow-md"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">推送通知</p>
                  <p className="text-sm text-gray-500">接收瀏覽器推送通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:shadow-md"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">社團更新</p>
                  <p className="text-sm text-gray-500">新公告和活動通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.clubUpdates}
                    onChange={(e) => setPreferences({ ...preferences, clubUpdates: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:shadow-md"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">評論回覆</p>
                  <p className="text-sm text-gray-500">有人回覆您的評論時通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.commentReplies}
                    onChange={(e) => setPreferences({ ...preferences, commentReplies: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:shadow-md"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">每週摘要</p>
                  <p className="text-sm text-gray-500">每週接收活動摘要郵件</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.weeklyDigest}
                    onChange={(e) => setPreferences({ ...preferences, weeklyDigest: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:shadow-md"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">顯示設定</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">語言</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                >
                  <option value="zh-TW">繁體中文</option>
                  <option value="zh-CN">简体中文</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">主題</label>
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                >
                  <option value="light">淺色</option>
                  <option value="dark">深色</option>
                  <option value="auto">自動</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preference Tags (移到底部) */}
          <div className="border-2 border-brand-primary rounded-xl p-5 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">偏好標籤</h3>
              <button 
                onClick={() => setIsAddTagModalOpen(true)}
                className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              已選擇的偏好標籤，點擊標籤右側的 × 可以移除
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTags.length === 0 ? (
                <p className="text-gray-400 text-sm">尚未選擇任何標籤，點擊右上角 + 按鈕新增</p>
              ) : (
                selectedTags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500 text-white shadow-md"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:from-gray-400 disabled:to-gray-400"
            >
              ✓ 儲存設定
            </button>
          </div>
        </div>
      </div>

      {/* Add Tag Modal */}
      {isAddTagModalOpen && (
        <AddTagModal
          onClose={() => setIsAddTagModalOpen(false)}
          onAdd={handleAddTags}
          selectedTags={selectedTags}
        />
      )}
    </div>
  );
}
