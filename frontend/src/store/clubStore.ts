import { create } from 'zustand';
import * as clubService from '../services/clubService';
import type { DiscussionTopic } from '../types/discussion';

interface ClubState {
  discussions: DiscussionTopic[];
  currentTopic: DiscussionTopic | null;
  loading: boolean;
  error: string | null;
  fetchDiscussions: (clubId: number) => Promise<void>;
  addDiscussion: (clubId: number, data: { title: string; content: string }) => Promise<void>;
  fetchDiscussion: (clubId: number, topicId: number) => Promise<void>;
  addComment: (clubId: number, topicId: number, data: { content: string }) => Promise<void>;
}

export const useClubStore = create<ClubState>((set) => ({
  discussions: [],
  currentTopic: null,
  loading: false,
  error: null,
  fetchDiscussions: async (clubId) => {
    set({ loading: true, error: null });
    try {
      const discussions = await clubService.getDiscussions(clubId);
      set({ discussions, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch discussions', loading: false });
    }
  },
  addDiscussion: async (clubId, data) => {
    set({ loading: true, error: null });
    try {
      const newTopic = await clubService.createDiscussion(clubId, data);
      set((state) => ({ discussions: [...state.discussions, newTopic], loading: false }));
    } catch (error) {
      set({ error: 'Failed to add discussion', loading: false });
    }
  },
  fetchDiscussion: async (clubId, topicId) => {
    set({ loading: true, error: null });
    try {
      const topic = await clubService.getDiscussion(clubId, topicId);
      set({ currentTopic: topic, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch discussion', loading: false });
    }
  },
  addComment: async (clubId, topicId, data) => {
    set({ loading: true, error: null });
    try {
      await clubService.createComment(clubId, topicId, data);
      const topic = await clubService.getDiscussion(clubId, topicId);
      set({ currentTopic: topic, loading: false });
    } catch (error) {
      set({ error: 'Failed to add comment', loading: false });
    }
  },
}));
