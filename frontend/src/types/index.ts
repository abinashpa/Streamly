export type MediaType = "video" | "short" | "music";

export interface MediaItem {
  id: string;
  media_id?: string;
  title: string;
  description: string;
  media_type: MediaType;
  artist?: string;
  duration: number;
  stream_url: string;
  thumbnail_url: string;
  uploader_id?: string;
  uploader_name?: string;
  tags?: string;
  views?: number;
  likes?: number;
  created_at: string;
}

export interface CommentItem {
  id: string;
  catalog_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  likes: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  subscribers?: number;
}
