import { User } from './user';

export interface DiscussionComment {
  id: number;
  content: string;
  owner_id: number;
  author?: User;
}

export interface DiscussionTopic {
  id: number;
  title: string;
  content: string;
  club_id: number;
  owner_id: number;
  author?: User;
  comments?: DiscussionComment[];
  comment_count: number;
}