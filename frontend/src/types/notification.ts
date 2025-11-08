export type NotificationType = "NEW_POST" | "NEW_MEMBER" | "EVENT_CREATED";

export type NotificationContent = 
  | NewMemberContent 
  | EventCreatedContent 
  | NewPostContent;

export interface NewMemberContent {
  user_id: number;
  user_display_name: string;
  club_id: number;
  club_name: string;
  request_id: number;
}

export interface EventCreatedContent {
  event_id: number;
  event_title: string;
  event_datetime: string;
  organizer_id: number;
  club_id: number;
}

export interface NewPostContent {
  post_id: number;
  post_title: string;
  author_id: number;
  author_display_name: string;
  club_id: number;
  club_name: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  content: NotificationContent;
  is_read: boolean;
  created_at: string;
  recipient_id: number;
}
