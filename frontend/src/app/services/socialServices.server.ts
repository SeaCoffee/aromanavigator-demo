import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
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

export async function followToggleServer(
  userId: ID,
): Promise<SocialToggleResponse> {
  return djangoJson<SocialToggleResponse>(
    socialApiUrlBuilder.server.follow.toggle(userId),
    {
      method: 'POST',
      auth: 'required',
      cache: 'no-store',
    },
  );
}

export async function blockToggleServer(
  userId: ID,
): Promise<SocialToggleResponse> {
  return djangoJson<SocialToggleResponse>(
    socialApiUrlBuilder.server.block.toggle(userId),
    {
      method: 'POST',
      auth: 'required',
      cache: 'no-store',
    },
  );
}

export async function getSocialStateServer(userId: ID): Promise<SocialState> {
  return djangoJson<SocialState>(
    socialApiUrlBuilder.server.state(userId),
    {
      auth: 'required',
      cache: 'no-store',
    },
  );
}

export async function getFollowersServer(
  userId: ID,
  query?: Query,
): Promise<Paginated<SocialUser>> {
  return djangoJson<Paginated<SocialUser>>(
    socialApiUrlBuilder.server.follow.followers(userId, query),
    {
      auth: 'auto',
      cache: 'no-store',
    },
  );
}

export async function getFollowingServer(
  userId: ID,
  query?: Query,
): Promise<Paginated<SocialUser>> {
  return djangoJson<Paginated<SocialUser>>(
    socialApiUrlBuilder.server.follow.following(userId, query),
    {
      auth: 'auto',
      cache: 'no-store',
    },
  );
}

export async function getMySubscriptionsServer(
  query?: SubscriptionListQuery,
): Promise<Paginated<SubscriptionOut>> {
  return djangoJson<Paginated<SubscriptionOut>>(
    socialApiUrlBuilder.server.subscriptions.list(query),
    {
      auth: 'required',
      cache: 'no-store',
    },
  );
}

export async function getTargetSubscriptionServer(
  target: SubscriptionTarget,
): Promise<SubscriptionOut | null> {
  const normalizedTarget = normalizeSubscriptionTarget(target);

  const data = await getMySubscriptionsServer({
    app: normalizedTarget.app,
    model: normalizedTarget.model,
    id: normalizedTarget.id,
  });

  return data.results[0] ?? null;
}

export async function subscribeToTargetServer(
  target: SubscriptionTarget,
): Promise<SubscriptionOut> {
  return djangoJson<SubscriptionOut>(
    socialApiUrlBuilder.server.subscriptions.subscribe(),
    {
      method: 'POST',
      auth: 'required',
      json: {
        target: subscriptionTargetToApiValue(target),
      },
      cache: 'no-store',
    },
  );
}

export async function unsubscribeFromTargetServer(
  target: SubscriptionTarget,
): Promise<void> {
  await djangoJson<void>(
    socialApiUrlBuilder.server.subscriptions.unsubscribe(),
    {
      method: 'POST',
      auth: 'required',
      json: {
        target: subscriptionTargetToApiValue(target),
      },
      cache: 'no-store',
    },
  );
}

export async function deleteSubscriptionServer(subscriptionId: ID): Promise<void> {
  await djangoJson<void>(
    socialApiUrlBuilder.server.subscriptions.delete(subscriptionId),
    {
      method: 'DELETE',
      auth: 'required',
      cache: 'no-store',
    },
  );
}
