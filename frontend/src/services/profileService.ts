import { apiClient } from './api';

// Profile data types
export interface InterestTag {
  id: number;
  name: string;
  is_predefined: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  interest_tags: InterestTag[];
}

export interface UpdateProfileData {
  display_name?: string;
  bio?: string;
}

export interface AvatarUploadResponse {
  avatar_url: string;
  message: string;
}

// Mock data flag (set to false when backend is ready)
const USE_MOCK_DATA = true;

// Mock profile data
const mockProfile: UserProfile = {
  id: 1,
  email: 'user@example.com',
  display_name: '書蟲小明',
  bio: '熱愛閱讀的軟體工程師，喜歡科幻、推理、歷史類書籍。',
  avatar_url: null,
  interest_tags: [
    { id: 1, name: '科幻小說', is_predefined: true },
    { id: 2, name: '推理懸疑', is_predefined: true },
    { id: 5, name: '歷史文學', is_predefined: true },
  ],
};

// Mock predefined tags
const mockPredefinedTags: InterestTag[] = [
  { id: 1, name: '科幻小說', is_predefined: true },
  { id: 2, name: '推理懸疑', is_predefined: true },
  { id: 3, name: '文學小說', is_predefined: true },
  { id: 4, name: '商業理財', is_predefined: true },
  { id: 5, name: '歷史文學', is_predefined: true },
  { id: 6, name: '心理勵志', is_predefined: true },
  { id: 7, name: '藝術設計', is_predefined: true },
  { id: 8, name: '科學科普', is_predefined: true },
  { id: 9, name: '旅遊飲食', is_predefined: true },
  { id: 10, name: '漫畫圖文', is_predefined: true },
];

export const profileService = {
  /**
   * Get user profile
   * GET /api/users/me/profile
   */
  getProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { ...mockProfile };
    }

    const response = await apiClient.get<UserProfile>('/api/users/me/profile');
    return response.data;
  },

  /**
   * Update user profile
   * PUT /api/users/me/profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      mockProfile.display_name = data.display_name || mockProfile.display_name;
      mockProfile.bio = data.bio !== undefined ? data.bio : mockProfile.bio;
      return { ...mockProfile };
    }

    const response = await apiClient.put<UserProfile>('/api/users/me/profile', data);
    return response.data;
  },

  /**
   * Upload avatar
   * POST /api/users/me/avatar
   */
  uploadAvatar: async (file: File): Promise<AvatarUploadResponse> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Generate a mock URL
      const mockUrl = `/uploads/avatars/mock_${Date.now()}.jpg`;
      mockProfile.avatar_url = mockUrl;
      return {
        avatar_url: mockUrl,
        message: '頭像上傳成功',
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<AvatarUploadResponse>(
      '/api/users/me/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Remove avatar
   * DELETE /api/users/me/avatar
   */
  removeAvatar: async (): Promise<void> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      mockProfile.avatar_url = null;
      return;
    }

    await apiClient.delete('/api/users/me/avatar');
  },

  /**
   * Get all interest tags
   * GET /api/interest-tags
   */
  getInterestTags: async (predefinedOnly: boolean = false): Promise<InterestTag[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return predefinedOnly ? mockPredefinedTags : [...mockPredefinedTags];
    }

    const response = await apiClient.get<InterestTag[]>('/api/interest-tags', {
      params: { predefined_only: predefinedOnly },
    });
    return response.data;
  },

  /**
   * Create custom interest tag
   * POST /api/interest-tags
   */
  createInterestTag: async (name: string): Promise<InterestTag> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newTag: InterestTag = {
        id: Date.now(),
        name,
        is_predefined: false,
      };
      return newTag;
    }

    const response = await apiClient.post<InterestTag>('/api/interest-tags', { name });
    return response.data;
  },

  /**
   * Add interest tag to user
   * POST /api/users/me/interest-tags
   */
  addUserInterestTag: async (tagId: number): Promise<InterestTag[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const tag = mockPredefinedTags.find((t) => t.id === tagId);
      if (tag && !mockProfile.interest_tags.find((t) => t.id === tagId)) {
        mockProfile.interest_tags.push(tag);
      }
      return [...mockProfile.interest_tags];
    }

    const response = await apiClient.post<InterestTag[]>('/api/users/me/interest-tags', {
      tag_id: tagId,
    });
    return response.data;
  },

  /**
   * Remove interest tag from user
   * DELETE /api/users/me/interest-tags/{tag_id}
   */
  removeUserInterestTag: async (tagId: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      mockProfile.interest_tags = mockProfile.interest_tags.filter((t) => t.id !== tagId);
      return;
    }

    await apiClient.delete(`/api/users/me/interest-tags/${tagId}`);
  },
};
