// frontend/src/app/types/userTypes.ts


import type { Region } from '@/app/constants/regionOptions';

export type { ID, Paginated } from '@/app/types/http.ts';

export type UserRole =
  | 'superuser'
  | 'admin'
  | 'moderator'
  | 'user'
  | string;

export type AccountType =
  | 'basic'
  | 'premium'
  | string;


export type UserMeProfile = {
  id: number;
  name: string;
  display_name: string;
  region: Region;
  avatar_url: string | null;
  about_me: string | null;
};

export type UserStats = {
  followers_count: number;
  following_count: number;

  notifications_unread_count: number;
  messages_unread_count: number;

  forum_topics_count: number;
  forum_comments_count: number;

  likes_given_count: number;
  likes_received_count: number;

  started_at: string;
};

export type UserMeStats = UserStats;

export type UserMe = {
  id: number;
  email: string;
  email_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  role: UserRole;
  is_seller: boolean;
  account_type: AccountType;

  profile: UserMeProfile | null;
  stats: UserMeStats | null;

  is_suspended: boolean;
  suspended_until: string | null;
  suspended_indefinitely: boolean;
  suspension_seconds_left: number | null;

  has_password: boolean;
};

export type PublicUserProfile = {
  id?: number;
  name?: string | null;
  display_name?: string | null;
  region?: Region | null;
  avatar_url?: string | null;
  avatar?: string | null;
  about_me?: string | null;
};

export type PublicUser = {
  id: number;
  profile: PublicUserProfile | null;
  stats: Partial<UserStats> | null;
};

export type UserDetailProfile = {
  id: number;
  name: string;
  display_name: string;
  avatar?: string | null;
  created_at?: string;
  updated_at?: string;
  user?: number;
  region?: Region;
  about_me?: string | null;
};

export type UserDetail = {
  id: number;
  email: string;

  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;

  last_login: string | null;
  last_logout: string | null;

  created_at: string;
  updated_at: string;

  profile: UserDetailProfile | null;
  stats: UserStats | null;

  suspended_until: string | null;
  suspended_reason: string;
  suspended_indefinitely: boolean;
  is_suspended: boolean;
  suspension_seconds_left: number | null;
};

export type AdminUserListItem = {
  id: number;
  email: string;
  email_verified: boolean;

  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;

  created_at: string;
  updated_at: string;

  role: UserRole;

  is_seller: boolean;
  account_type: AccountType;
  is_upgrade_to_premium: boolean;

  last_login: string | null;
  last_logout: string | null;

  profile: UserMeProfile | null;
  stats: UserStats | null;

  suspended_until: string | null;
  suspended_indefinitely: boolean;
  suspended_reason: string;
  is_suspended: boolean;
  suspension_seconds_left: number | null;
};

export type UserAdmin = AdminUserListItem;

export type UpdateMePayload = {
  profile: {
    name?: string;
    display_name?: string;
    region?: Region;
    about_me?: string | null;
  };
};

export type UpdateMeResponse = UserMe;


export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
};

export type MeSuspendedResponse = {
  is_suspended: boolean;
  suspended_until: string | null;
  suspended_indefinitely: boolean;
  suspension_seconds_left: number | null;
  suspended_reason: string;
  server_now: string;
};

export type PresenceBulkResponse = Record<
  string,
  {
    is_online: boolean;
  }
>;

export type SuspendUserPayload = {
  until?: string | null;
  permanent?: boolean;
  reason?: string;
};

export type SuspendUserResponse = {
  id: number;
  suspended_until: string | null;
  suspended_indefinitely: boolean;
  is_suspended: boolean;
  suspension_seconds_left: number | null;
};

export type UnsuspendUserResponse = {
  id: number;
  is_suspended: boolean;
};
