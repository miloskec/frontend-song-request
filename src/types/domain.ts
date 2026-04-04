export type VisibilityMode = 'hidden' | 'current_only' | 'current_and_next' | 'top_n' | 'full';
export type QueueItemStatus = 'queued' | 'now_playing' | 'played' | 'skipped' | 'removed';
export type UserRole = 'user' | 'super_admin';

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  status: 'active' | 'disabled';
}

export interface Song {
  id: string;
  user_id: string;
  title: string;
  artist: string | null;
  album?: string | null;
  genre?: string | null;
  cover_image_url?: string | null;
  default_price?: number | null;
  bidding_enabled: boolean;
  is_active: boolean;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  is_public: boolean;
  cover_image_url?: string | null;
  qr_uuid: string;
  queue_visibility_mode: VisibilityMode;
  queue_visible_count?: number | null;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  is_active: boolean;
}

export interface SongRequest {
  id: string;
  playlist_id: string;
  song_id: string;
  status: string;
  guest_name?: string | null;
  guest_message?: string | null;
  request_type: 'free' | 'fixed_price' | 'bid';
  offered_amount?: number | null;
}

export interface Queue {
  id: string;
  playlist_id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  visibility_mode: VisibilityMode;
  visible_count?: number | null;
  current_queue_item_id?: string | null;
}

export interface QueueItem {
  id: string;
  queue_id: string;
  request_id?: string | null;
  song_id: string;
  position: number;
  status: QueueItemStatus;
  is_locked: boolean;
}
