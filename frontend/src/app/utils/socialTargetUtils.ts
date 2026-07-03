import type { SubscriptionTarget } from '@/app/types/socialTypes';

const TARGET_RE = /^[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*:\d+$/;

const ALLOWED_SUBSCRIPTION_TARGETS = new Set([
  'forum.forumsectionmodel',
  'forum.forumtopicmodel',
]);

export function normalizeSubscriptionTarget(
  target: SubscriptionTarget,
): SubscriptionTarget {
  const app = String(target.app ?? '').trim().toLowerCase();
  const model = String(target.model ?? '').trim().toLowerCase();
  const id = Number(target.id);

  if (!app || !model || !Number.isInteger(id) || id <= 0) {
    throw new Error('РќРµРєРѕСЂРµРєС‚РЅР° С†С–Р»СЊ РїС–РґРїРёСЃРєРё.');
  }

  const key = `${app}.${model}`;

  if (!ALLOWED_SUBSCRIPTION_TARGETS.has(key)) {
    throw new Error('РџС–РґРїРёСЃРєР° РЅР° С†РµР№ С‚РёРї РѕР±КјС”РєС‚Р° РЅРµ РїС–РґС‚СЂРёРјСѓС”С‚СЊСЃСЏ.');
  }

  return {
    app,
    model,
    id,
  };
}

export function subscriptionTargetToApiValue(target: SubscriptionTarget): string {
  const normalized = normalizeSubscriptionTarget(target);

  return `${normalized.app}.${normalized.model}:${normalized.id}`;
}

export function isSubscriptionTargetApiValue(value: unknown): value is string {
  return typeof value === 'string' && TARGET_RE.test(value);
}
