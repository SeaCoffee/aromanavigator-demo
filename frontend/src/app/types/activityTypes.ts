// frontend/src/app/types/activityTypes.ts

export type PaginatedResponse<T> = {
  total_items: number;
  total_pages: number;
  next: boolean;
  prev: boolean;
  results: T[];
};

export type ActivityVerb =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'commented'
  | 'liked'
  | 'favorited'
  | 'followed_user'
  | string;

export type ActivityActor = {
  id: number;
  display_name: string;
  avatar_url?: string | null;
};

export type ActivityTarget = {
  app: string;
  model: string;
  id: number;
};

export type ActivityPayload = Record<string, unknown>;

export type ActivityEvent = {
  id: number;
  actor: ActivityActor;
  verb: ActivityVerb;

  target: ActivityTarget | null;

  target_app: string;
  target_model: string;
  target_id: number | null;

  payload: ActivityPayload;
  is_private: boolean;

  created_at: string;
  updated_at: string;
};

export type ActivityFeedQuery = {
  page?: string | number;
  verb?: string;
  actor?: string | number;
  target_app?: string;
  target_model?: string;
  target_id?: string | number;
};
