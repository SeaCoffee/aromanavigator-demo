import type {
  PublicUser,
  PublicUserProfile,
  UserStats,
} from '@/app/types/userTypes';

export function makeUserStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    followers_count: 0,
    following_count: 0,

    notifications_unread_count: 0,
    messages_unread_count: 0,

    forum_topics_count: 0,
    forum_comments_count: 0,

    likes_given_count: 0,
    likes_received_count: 0,

    started_at: '2026-05-05T10:00:00Z',

    ...overrides,
  };
}

export function makePublicUserProfile(
  overrides: Partial<PublicUserProfile> = {},
): PublicUserProfile {
  return {
    id: 10,
    name: 'Dexter Morgan',
    display_name: 'dexter-morgan',
    region: 'other',
    avatar_url: null,
    about_me: null,

    ...overrides,
  };
}

export function makePublicUser(overrides: Partial<PublicUser> = {}): PublicUser {
  return {
    id: 25,
    profile: makePublicUserProfile(),
    stats: makeUserStats(),

    ...overrides,
  };
}
