import type { ID } from '@/app/types/http';

export type SocialCounts = {
  followers_count: number;
  following_count: number;
};

export type SocialToggleStatus =
  | 'followed'
  | 'unfollowed'
  | 'blocked'
  | 'unblocked';

export type SocialToggleResponse = {
  status: SocialToggleStatus;
  me: SocialCounts;
  target: SocialCounts;
};

export type SocialState = {
  is_following: boolean;
  is_blocked_by_me: boolean;
  is_blocked_between: boolean;
};

export type SocialUserProfile = {
  name?: string | null;
  display_name?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  region?: string | null;
};

export type SocialUserStats = {
  followers_count?: number;
  following_count?: number;
  [key: string]: unknown;
};

export type SocialUser = {
  id: number;
  profile: SocialUserProfile | null;
  stats: SocialUserStats | null;
};

export type SubscriptionTarget = {
  app: string;
  model: string;
  id: ID;
};

export type SubscriptionItem = {
  app: string;
  model: string;
  id: ID;
  label?: string | null;
  is_deleted?: boolean;
};

export type SubscriptionOut = {
  id: ID;
  created_at: string;
  item: SubscriptionItem | null;
};

export type SubscriptionListQuery = {
  app?: string;
  model?: string;
  id?: ID;
  page?: number | string;
};
