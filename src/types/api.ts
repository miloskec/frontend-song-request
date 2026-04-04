import type { AuthUser, Playlist, Queue, QueueItem, Song, SongRequest } from './domain';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface PublicPlaylistResponse {
  playlist: Playlist;
  songs: Song[];
  now_playing: Song | null;
  queue_preview: QueueItem[];
  settings: {
    show_now_playing: boolean;
    show_queue_to_guests: boolean;
    queue_visibility_mode: Queue['visibility_mode'];
    queue_visible_count: number | null;
    show_only_locked_items: boolean;
  };
}

export interface PublicQueueResponse {
  queue: Queue;
  items: QueueItem[];
}

export interface RequestCreatePayload {
  song_id: string;
  guest_name?: string;
  guest_message?: string;
  offered_amount?: number | null;
}

export interface RequestCreateResponse {
  request: SongRequest;
  message: string;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}
