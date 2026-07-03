import type {
  NotificationItem,
  NotificationPayload,
  NotificationRef,
} from '@/app/types/notificationTypes';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';
import { commentAnchorUrlBuilder } from '@/app/urls/pageUrls/commentAnchorUrlBuilder';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { meExchangePageUrlBuilder } from '@/app/urls/pageUrls/exchangePageUrlBuilder';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { getEntityTypeLabel } from '@/app/utils/entityDisplayUtils';
import { recordMessage } from '@/app/utils/messageUtils';

export function formatNotificationDate(value: string): string {
  return new Date(value).toLocaleString('uk-UA', {
    timeZone: 'Europe/Kyiv',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readId(value: unknown): number | null {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return recordMessage(value);
}

function getRefKey(ref: NotificationRef | null): string {
  return ref ? `${ref.app}.${ref.model}`.toLowerCase() : '';
}

function readFragranceSlug(payload: NotificationPayload): string {
  const fragrance = readRecord(payload.fragrance);
  const target = readRecord(payload.target);
  const item = readRecord(payload.item);

  return (
    readString(payload.slug) ||
    readString(fragrance?.slug) ||
    readString(target?.slug) ||
    readString(item?.slug)
  );
}

function readDisplayName(
  ref: NotificationRef | null,
  payload: NotificationPayload,
): string {
  const target = readRecord(payload.target);
  const actor = readRecord(payload.actor);

  return (
    readString(ref?.display_name) ||
    readString(target?.display_name) ||
    readString(actor?.display_name) ||
    readString(payload.target_display_name) ||
    readString(payload.display_name) ||
    readString(payload.username)
  ).replace(/^@/, '');
}

function getCommentNotificationHref(
  payload: NotificationPayload,
): string | null {
  const commentTarget = readRecord(payload.comment_target);
  const commentId = readId(payload.comment_id);

  if (!commentTarget || !commentId) {
    return null;
  }

  const app = readString(commentTarget.app);
  const model = readString(commentTarget.model);
  const targetId = readId(commentTarget.id);

  if (app === 'forum' && model === 'forumtopicmodel' && targetId) {
    return commentAnchorUrlBuilder.withAnchor(
      forumPageUrlBuilder.topics.detail(targetId),
      commentId,
    );
  }

  if (app === 'fragrance' && model === 'fragrancemodel') {
    const slug = readString(commentTarget.slug);

    return slug
      ? commentAnchorUrlBuilder.withAnchor(
          fragrancePageUrlBuilder.public.detail(slug),
          commentId,
        )
      : null;
  }

  return null;
}

export function getNotificationRefLabel(ref: NotificationRef | null): string {
  if (!ref) return '';

  if (ref.display_name) {
    const displayName = ref.display_name.replace(/^@/, '');

    return getRefKey(ref) === 'users.usermodel' ? `@${displayName}` : displayName;
  }

  return getEntityTypeLabel(ref);
}

export function getNotificationVerbLabel(verb: string): string {
  const labels: Record<string, string> = {
    followed_user: 'РїС–РґРїРёСЃР°РІСЃСЏ(Р»Р°СЃСЏ) РЅР° РІР°СЃ',
    exchange_created: 'РЅРѕРІР° РїСЂРѕРїРѕР·РёС†С–СЏ РѕР±РјС–РЅСѓ',
    exchange_accepted: 'РѕР±РјС–РЅ РїСЂРёР№РЅСЏС‚Рѕ',
    exchange_rejected: 'РѕР±РјС–РЅ РІС–РґС…РёР»РµРЅРѕ',
    exchange_canceled: 'РѕР±РјС–РЅ СЃРєР°СЃРѕРІР°РЅРѕ',
    liked: 'РІРїРѕРґРѕР±Р°РІ(Р»Р°)',
    favorited: 'РґРѕРґР°РІ(Р»Р°) РґРѕ РѕР±СЂР°РЅРѕРіРѕ',
    updated: 'РѕРЅРѕРІРёРІ(Р»Р°)',
    deleted: 'РІРёРґР°Р»РёРІ(Р»Р°)',
    mentioned_in_topic: 'Р·РіР°РґР°РІ(Р»Р°) РІР°СЃ Сѓ С‚РµРјС–',
    mentioned_in_comment: 'Р·РіР°РґР°РІ(Р»Р°) РІР°СЃ Сѓ РєРѕРјРµРЅС‚Р°СЂС–',
    comment_reply: 'РІС–РґРїРѕРІС–РІ(Р»Р°) РЅР° РІР°С€ РєРѕРјРµРЅС‚Р°СЂ',
    commented: 'РїСЂРѕРєРѕРјРµРЅС‚СѓРІР°РІ(Р»Р°)',
    created: 'СЃС‚РІРѕСЂРёРІ(Р»Р°)',
  };

  return labels[verb] ?? 'РѕРЅРѕРІР»РµРЅРЅСЏ';
}

export function getNotificationPayloadText(payload: NotificationPayload): string {
  const notificationKind = readString(payload.notification_kind);

  if (
    notificationKind === 'exchange_created' ||
    notificationKind === 'exchange_accepted' ||
    notificationKind === 'exchange_rejected' ||
    notificationKind === 'exchange_canceled'
  ) {
    const requested = readRecord(payload.requested);

    if (requested) {
      const title = readString(requested.title);
      const subtitle = readString(requested.subtitle);

      if (title && subtitle) return `${title} В· ${subtitle}`;
      if (title) return title;
    }
  }

  const notificationText = readString(payload.notification_text);
  const message = readString(payload.message);
  const title = readString(payload.title);
  const action = readString(payload.action);

  if (notificationText) return notificationText;
  if (message) return message;
  if (title) return title;
  if (action) return action;

  const item = readRecord(payload.item);

  if (item) {
    return readString(item.title) || readString(item.name) || readString(item.type);
  }

  return '';
}

export function getNotificationTitle(notification: NotificationItem): string {
  const unavailableSuffix =
    notification.target?.is_available === false
      ? ' (РѕР±КјС”РєС‚ Р±С–Р»СЊС€Рµ РЅРµРґРѕСЃС‚СѓРїРЅРёР№)'
      : '';
  const actor = getNotificationRefLabel(notification.actor);
  const verb = getNotificationVerbLabel(notification.verb);
  const target = getNotificationRefLabel(notification.target);

  if (actor && target) return `${actor} ${verb}: ${target}${unavailableSuffix}`;
  if (actor) return `${actor} ${verb}`;
  if (target) return `${verb}: ${target}${unavailableSuffix}`;

  return verb;
}

export function shouldShowPayload(notification: NotificationItem): boolean {
  return Boolean(getNotificationPayloadText(notification.payload));
}

export function getNotificationTargetHref(
  notification: NotificationItem,
): string | null {
  const target = notification.target;

  if (!target || target.is_available === false) {
    return null;
  }

  const payload = notification.payload ?? {};
  const key = getRefKey(target);

  if (key === 'articles.article') {
    return articlesPageUrlBuilder.public.detail(target.id);
  }

  if (key === 'forum.forumsectionmodel') {
    return forumPageUrlBuilder.sections.detail(target.id);
  }

  if (key === 'forum.forumtopicmodel') {
    const topic = readRecord(payload.topic);
    const topicId = readId(topic?.id) ?? target.id;

    return forumPageUrlBuilder.topics.detail(topicId);
  }

  if (key === 'fragrance.fragrancemodel') {
    const slug = readFragranceSlug(payload);

    return slug ? fragrancePageUrlBuilder.public.detail(slug) : null;
  }

  if (key === 'exchange.exchangeproposalmodel') {
    return meExchangePageUrlBuilder.detail(target.id);
  }

  if (key === 'comments.commentmodel') {
    return getCommentNotificationHref(payload);
  }

  if (key === 'users.usermodel' || key === 'users.user' || key === 'auth.user') {
    const displayName = readDisplayName(target, payload);

    return displayName ? userPageUrlBuilder.publicProfile(displayName) : null;
  }

  return null;
}
