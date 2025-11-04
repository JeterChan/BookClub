import { apiClient } from './api';
import type { DiscussionTopic, DiscussionComment } from '../types/discussion';

// Discussions

export const getDiscussions = async (clubId: number): Promise<DiscussionTopic[]> => {
  const response = await apiClient.get(`/clubs/${clubId}/discussions`);
  return response.data;
};

export const createDiscussion = async (clubId: number, data: { title: string; content: string }): Promise<DiscussionTopic> => {
  const response = await apiClient.post(`/clubs/${clubId}/discussions`, data);
  return response.data;
};

export const getDiscussion = async (clubId: number, topicId: number): Promise<DiscussionTopic> => {
  const response = await apiClient.get(`/clubs/${clubId}/discussions/${topicId}`);
  return response.data;
};

export const createComment = async (clubId: number, topicId: number, data: { content: string }): Promise<DiscussionComment> => {
  const response = await apiClient.post(`/clubs/${clubId}/discussions/${topicId}/comments`, data);
  return response.data;
};
