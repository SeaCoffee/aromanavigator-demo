// frontend/src/app/utils/userDisplayUtils.ts

import type {
  AdminUserListItem,
  PublicUser,
  UserDetail,
} from '@/app/types/userTypes';

type UserWithProfile = Pick<PublicUser, 'id' | 'profile'>;

export function getPublicUserDisplayName(user: UserWithProfile) {
  return user.profile?.display_name || user.profile?.name || 'РљРѕСЂРёСЃС‚СѓРІР°С‡';
}

export function getUserDisplayName(
  user: Pick<UserDetail, 'id' | 'profile'> | Pick<AdminUserListItem, 'id' | 'profile'>,
) {
  return user.profile?.display_name || user.profile?.name || 'РљРѕСЂРёСЃС‚СѓРІР°С‡';
}

export function getUserInitial(user: UserWithProfile) {
  return getPublicUserDisplayName(user).slice(0, 1).toUpperCase();
}

export function getAdminUserRoleLabel(user: AdminUserListItem) {
  if (user.is_superuser) return 'superuser';

  return user.role || (user.is_staff ? 'staff' : 'user');
}

export function getAdminUserStatusLabel(user: AdminUserListItem) {
  if (user.is_suspended) return 'Р—Р°Р±Р»РѕРєРѕРІР°РЅРёР№';
  if (!user.is_active) return 'РќРµР°РєС‚РёРІРЅРёР№';

  return 'РђРєС‚РёРІРЅРёР№';
}


export function normalizePublicUsername(raw: string) {
  const trimmed = raw.trim().replace(/^@+/, '');

  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

export function getPublicUserProfileUsername(user: UserWithProfile) {
  return user.profile?.display_name || null;
}
