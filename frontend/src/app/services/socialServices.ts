import { userApi } from '@/app/services/userApi';
import { socialApiUrlBuilder } from '@/app/urls/socialUrlBuilder';
import {
  normalizeSubscriptionTarget,
  subscriptionTargetToApiValue,
} from '@/app/utils/socialTargetUtils';

import type { ID, Paginated, Query } from '@/app/types/http';
import type {
  SocialState,
  SocialToggleResponse,
  SocialUser,
  SubscriptionListQuery,
  SubscriptionOut,
  SubscriptionTarget,
} from '@/app/types/socialTypes';

export function followToggle(userId: ID): Promise<SocialToggleResponse> {
  return userApi.post<SocialToggleResponse>(
    socialApiUrlBuilder.user.follow.toggle(userId),
    { cache: 'no-store' },
  );
}

export function blockToggle(userId: ID): Promise<SocialToggleResponse> {
  return userApi.post<SocialToggleResponse>(
    socialApiUrlBuilder.user.block.toggle(userId),
    { cache: 'no-store' },
  );
}

export function getSocialState(userId: ID): Promise<SocialState> {
  return userApi.get<SocialState>(
    socialApiUrlBuilder.user.state(userId),
    { cache: 'no-store' },
  );
}

export function getFollowers(
  userId: ID,
  query?: Query,
): Promise<Paginated<SocialUser>> {
  return userApi.get<Paginated<SocialUser>>(
    socialApiUrlBuilder.user.follow.followers(userId, query),
    { cache: 'no-store' },
  );
}

export function getFollowing(
  userId: ID,
  query?: Query,
): Promise<Paginated<SocialUser>> {
  return userApi.get<Paginated<SocialUser>>(
    socialApiUrlBuilder.user.follow.following(userId, query),
    { cache: 'no-store' },
  );
}

export function getMySubscriptions(
  query?: SubscriptionListQuery,
): Promise<Paginated<SubscriptionOut>> {
  return userApi.get<Paginated<SubscriptionOut>>(
    socialApiUrlBuilder.user.subscriptions.list(query),
    { cache: 'no-store' },
  );
}

export function subscribeToTarget(
  target: SubscriptionTarget,
): Promise<SubscriptionOut> {
  return userApi.post<SubscriptionOut>(
    socialApiUrlBuilder.user.subscriptions.subscribe(),
    {
      json: {
        target: subscriptionTargetToApiValue(normalizeSubscriptionTarget(target)),
      },
      cache: 'no-store',
    },
  );
}

export function unsubscribeFromTarget(
  target: SubscriptionTarget,
): Promise<void> {
  return userApi.post<void>(
    socialApiUrlBuilder.user.subscriptions.unsubscribe(),
    {
      json: {
        target: subscriptionTargetToApiValue(normalizeSubscriptionTarget(target)),
      },
      cache: 'no-store',
    },
  );
}
