import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { profileService } from '../../services/profileService';
import type { UserProfile, InterestTag } from '../../services/profileService';

interface InterestTagsTabProps {
  profile: UserProfile;
  onUpdate: (updated: UserProfile) => void;
}

/**
 * InterestTagsTab - Manage interest tags
 * Add predefined or custom tags, remove tags, max 20 tags
 */
export const InterestTagsTab = ({ profile, onUpdate }: InterestTagsTabProps) => {
  const [allTags, setAllTags] = useState<InterestTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [customTagName, setCustomTagName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await profileService.getInterestTags();
      setAllTags(tags);
    } catch {
      toast.error('載入標籤失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (tagId: number) => {
    if (profile.interest_tags.length >= 20) {
      toast.warning('最多只能選擇20個興趣標籤');
      return;
    }

    try {
      const updated = await profileService.addUserInterestTag(tagId);
      onUpdate({
        ...profile,
        interest_tags: updated,
      });
      toast.success('標籤已新增');
    } catch {
      toast.error('新增標籤失敗');
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      await profileService.removeUserInterestTag(tagId);
      onUpdate({
        ...profile,
        interest_tags: profile.interest_tags.filter((t) => t.id !== tagId),
      });
      toast.success('標籤已移除');
    } catch {
      toast.error('移除標籤失敗');
    }
  };

  const handleCreateCustomTag = async () => {
    const trimmedName = customTagName.trim();
    
    if (!trimmedName) {
      toast.error('請輸入標籤名稱');
      return;
    }

    if (trimmedName.length > 50) {
      toast.error('標籤名稱最多50個字元');
      return;
    }

    if (profile.interest_tags.length >= 20) {
      toast.warning('最多只能選擇20個興趣標籤');
      return;
    }

    try {
      setCreating(true);
      const newTag = await profileService.createInterestTag(trimmedName);
      setAllTags([...allTags, newTag]);
      
      // Automatically add the newly created tag to user
      await handleAddTag(newTag.id);
      
      setCustomTagName('');
    } catch {
      toast.error('創建標籤失敗');
    } finally {
      setCreating(false);
    }
  };

  const isTagSelected = (tagId: number) => {
    return profile.interest_tags.some((t) => t.id === tagId);
  };

  if (loading) {
    return <div className="text-gray-600">載入中...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Selected Tags */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          已選標籤 ({profile.interest_tags.length}/20)
        </h3>
        {profile.interest_tags.length === 0 ? (
          <p className="text-gray-500 text-sm">尚未選擇任何標籤</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.interest_tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
              >
                <span className="text-sm">{tag.name}</span>
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  aria-label={`移除 ${tag.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Predefined Tags */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">預設標籤</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {allTags
            .filter((tag) => tag.is_predefined)
            .map((tag) => {
              const selected = isTagSelected(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => selected ? handleRemoveTag(tag.id) : handleAddTag(tag.id)}
                  disabled={!selected && profile.interest_tags.length >= 20}
                  className={`
                    px-3 py-2 border rounded-lg text-sm font-medium transition-colors
                    ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {tag.name}
                </button>
              );
            })}
        </div>
      </div>

      {/* Custom Tags */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">自定義標籤</h3>
        <div className="flex items-stretch gap-2">
          <div className="flex-grow">
            <Input
              value={customTagName}
              onChange={(e) => setCustomTagName(e.target.value)}
              placeholder="輸入自定義標籤（最多50字元）"
              maxLength={50}
              disabled={creating || profile.interest_tags.length >= 20}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateCustomTag();
                }
              }}
            />
          </div>
          <div className="flex-shrink-0">
            <Button
              onClick={handleCreateCustomTag}
              disabled={creating || !customTagName.trim() || profile.interest_tags.length >= 20}
              loading={creating}
            >
              新增
            </Button>
          </div>
        </div>
        
        {/* Display custom tags */}
        {allTags.filter((tag) => !tag.is_predefined).length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {allTags
              .filter((tag) => !tag.is_predefined)
              .map((tag) => {
                const selected = isTagSelected(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => selected ? handleRemoveTag(tag.id) : handleAddTag(tag.id)}
                    disabled={!selected && profile.interest_tags.length >= 20}
                    className={`
                      px-3 py-2 border rounded-lg text-sm font-medium transition-colors
                      ${
                        selected
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-600'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {tag.name}
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* Help Text */}
      {profile.interest_tags.length >= 20 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            您已達到20個標籤的上限。如需新增其他標籤，請先移除一些現有標籤。
          </p>
        </div>
      )}
    </div>
  );
};
