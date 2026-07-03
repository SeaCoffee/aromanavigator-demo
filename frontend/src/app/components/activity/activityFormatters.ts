import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { recordMessage } from '@/app/utils/messageUtils';
import type {
  ActivityActor,
  ActivityEvent,
  ActivityPayload,
  ActivityTarget,
  ActivityVerb,
} from '@/app/types/activityTypes';

const HIDDEN_ACTIVITY_VERBS = new Set([
  'unliked',
]);

const VERB_LABELS: Record<string, string> = {
  created: 'СЃС‚РІРѕСЂРёРІ(Р»Р°)',
  updated: 'РѕРЅРѕРІРёРІ(Р»Р°)',
  deleted: 'РІРёРґР°Р»РёРІ(Р»Р°)',
  commented: 'РїСЂРѕРєРѕРјРµРЅС‚СѓРІР°РІ(Р»Р°)',
  liked: 'РІРїРѕРґРѕР±Р°РІ(Р»Р°)',
  favorited: 'РґРѕРґР°РІ(Р»Р°) РґРѕ РѕР±СЂР°РЅРѕРіРѕ',
  followed_user: 'РїС–РґРїРёСЃР°РІСЃСЏ(Р»Р°СЃСЏ)',
  points_awarded: 'РѕС‚СЂРёРјР°РІ(Р»Р°) Р±Р°Р»Рё',
  badge_granted: 'РѕС‚СЂРёРјР°РІ(Р»Р°) РІС–РґР·РЅР°РєСѓ',
};

const TARGET_LABELS: Record<string, string> = {
  'articles.article': 'РЎС‚Р°С‚С‚СЏ',
  'activity.activityevent': 'РџРѕРґС–СЏ Р°РєС‚РёРІРЅРѕСЃС‚С–',
  'activity.activityeventmodel': 'РџРѕРґС–СЏ Р°РєС‚РёРІРЅРѕСЃС‚С–',
  'auth.group': 'Р“СЂСѓРїР° РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ',
  'auth.permission': 'Р”РѕР·РІС–Р»',
  'comments.commentmodel': 'РљРѕРјРµРЅС‚Р°СЂ',
  'favorites.favoritemodel': 'РћР±СЂР°РЅРµ',
  'forum.forumsectionmodel': 'Р РѕР·РґС–Р» С„РѕСЂСѓРјСѓ',
  'forum.forumtopicmodel': 'РўРµРјР° С„РѕСЂСѓРјСѓ',
  'fragrance.brandmodel': 'Р‘СЂРµРЅРґ',
  'fragrance.fragranceaddrequestmodel': 'Р—Р°СЏРІРєР° РЅР° Р°СЂРѕРјР°С‚',
  'fragrance.fragrancefamilymodel': 'РЎС–РјРµР№СЃС‚РІРѕ Р°СЂРѕРјР°С‚Сѓ',
  'fragrance.fragrancemodel': 'РђСЂРѕРјР°С‚',
  'fragrance.fragrancenoteofficialmodel': 'РќРѕС‚Р° Р°СЂРѕРјР°С‚Сѓ',
  'fragrance.fragranceperfumermodel': 'РџР°СЂС„СѓРјРµСЂ Р°СЂРѕРјР°С‚Сѓ',
  'fragrance.notemodel': 'РќРѕС‚Р°',
  'fragrance.olfactoryfamilymodel': 'РћР»СЊС„Р°РєС‚РѕСЂРЅРµ СЃС–РјРµР№СЃС‚РІРѕ',
  'fragrance.perfumermodel': 'РџР°СЂС„СѓРјРµСЂ',
  'fragrance_ugc.fragranceaddrequestmodel': 'Р—Р°СЏРІРєР° РЅР° Р°СЂРѕРјР°С‚',
  'fragrance_ugc.fragrancesimilaritysuggestionmodel': 'РџСЂРѕРїРѕР·РёС†С–СЏ СЃС…РѕР¶РѕРіРѕ Р°СЂРѕРјР°С‚Сѓ',
  'fragrance_ugc.userfragrancenotesuggestionmodel': 'РџСЂРѕРїРѕР·РёС†С–СЏ РЅРѕС‚Рё',
  'likes.likemodel': 'Р’РїРѕРґРѕР±Р°РЅРЅСЏ',
  'notifications.notificationmodel': 'РЎРїРѕРІС–С‰РµРЅРЅСЏ',
  'photos.photomodel': 'Р¤РѕС‚Рѕ',
  'tags.taggeditemmodel': 'РўРµРі',
  'taste_profile.tasteprofilemodel': 'РџР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ',
  'taste_profile.tastepreferenceitemmodel': 'РЎРјР°РєРѕРІР° РІРїРѕРґРѕР±Р°Р№РєР°',
  'users.user': 'РљРѕСЂРёСЃС‚СѓРІР°С‡',
  'users.usermodel': 'РљРѕСЂРёСЃС‚СѓРІР°С‡',
  'auth.user': 'РљРѕСЂРёСЃС‚СѓРІР°С‡',
  'wardrobe.wardrobeitemmodel': 'Р—Р°РїРёСЃ РіР°СЂРґРµСЂРѕР±Р°',
};

const UNKNOWN_VERB_LABELS: Record<string, string> = {
  add: 'РґРѕРґР°РІ(Р»Р°)',
  approve: 'СЃС…РІР°Р»РёРІ(Р»Р°)',
  approved: 'СЃС…РІР°Р»РёРІ(Р»Р°)',
  block: 'Р·Р°Р±Р»РѕРєСѓРІР°РІ(Р»Р°)',
  canceled: 'СЃРєР°СЃСѓРІР°РІ(Р»Р°)',
  cancelled: 'СЃРєР°СЃСѓРІР°РІ(Р»Р°)',
  create: 'СЃС‚РІРѕСЂРёРІ(Р»Р°)',
  delete: 'РІРёРґР°Р»РёРІ(Р»Р°)',
  edit: 'РѕРЅРѕРІРёРІ(Р»Р°)',
  publish: 'РѕРїСѓР±Р»С–РєСѓРІР°РІ(Р»Р°)',
  published: 'РѕРїСѓР±Р»С–РєСѓРІР°РІ(Р»Р°)',
  reject: 'РІС–РґС…РёР»РёРІ(Р»Р°)',
  rejected: 'РІС–РґС…РёР»РёРІ(Р»Р°)',
  remove: 'РІРёРґР°Р»РёРІ(Р»Р°)',
  reply: 'РІС–РґРїРѕРІС–РІ(Р»Р°)',
  send: 'РЅР°РґС–СЃР»Р°РІ(Р»Р°)',
  sent: 'РЅР°РґС–СЃР»Р°РІ(Р»Р°)',
  submit: 'РЅР°РґС–СЃР»Р°РІ(Р»Р°)',
  submitted: 'РЅР°РґС–СЃР»Р°РІ(Р»Р°)',
  updated: 'РѕРЅРѕРІРёРІ(Р»Р°)',
};

type ActivityLinkTarget = {
  app: string;
  model: string;
  id: number;
};

export function formatActivityDate(value: string): string {
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

function stripAt(value: string): string {
  return value.replace(/^@/, '').trim();
}

function targetKey(target: ActivityTarget | ActivityLinkTarget | null): string {
  if (!target) return '';

  return `${target.app}.${target.model}`.toLowerCase();
}

function splitTechnicalValue(value: string): string[] {
  return value
    .replace(/model$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z?-?????])([A-Z?-?????])/g, '$1 $2')
    .split(/\s+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function getFallbackVerbLabel(verb: ActivityVerb): string {
  const rawVerb = String(verb).trim();
  const parts = splitTechnicalValue(rawVerb);

  for (const part of parts) {
    const label = UNKNOWN_VERB_LABELS[part];

    if (label) {
      return label;
    }
  }

  return 'РІРёРєРѕРЅР°РІ(Р»Р°) РґС–СЋ';
}

function getFallbackTargetLabel(target: ActivityTarget | ActivityLinkTarget) {
  const key = targetKey(target);
  const appLabel = splitTechnicalValue(target.app).join(' ');
  const modelLabel = splitTechnicalValue(target.model).join(' ');

  if (key.includes('comment')) return 'РљРѕРјРµРЅС‚Р°СЂ';
  if (key.includes('notification')) return 'РЎРїРѕРІС–С‰РµРЅРЅСЏ';
  if (key.includes('photo') || key.includes('image')) return 'Р¤РѕС‚Рѕ';
  if (key.includes('fragrance')) return 'РђСЂРѕРјР°С‚';
  if (key.includes('forum') && key.includes('topic')) return 'РўРµРјР° С„РѕСЂСѓРјСѓ';
  if (key.includes('user')) return 'РљРѕСЂРёСЃС‚СѓРІР°С‡';

  if (modelLabel) {
    return modelLabel.charAt(0).toUpperCase() + modelLabel.slice(1);
  }

  if (appLabel) {
    return appLabel.charAt(0).toUpperCase() + appLabel.slice(1);
  }

  return 'РћР±КјС”РєС‚';
}

function buildTitleWithSubtitle(title: string, subtitle: string): string {
  if (title && subtitle) return `${title} В· ${subtitle}`;
  return title || subtitle;
}

function getItemPayload(payload: ActivityPayload): Record<string, unknown> | null {
  return readRecord(payload.item);
}

function readPayloadTarget(payload: ActivityPayload): ActivityLinkTarget | null {
  const target = readRecord(payload.target);

  if (!target) {
    return null;
  }

  const app = readString(target.app);
  const model = readString(target.model);
  const id = readId(target.id);

  if (!app || !model || !id) {
    return null;
  }

  return {
    app,
    model,
    id,
  };
}

function readItemTarget(payload: ActivityPayload): ActivityLinkTarget | null {
  const item = getItemPayload(payload);

  if (!item) {
    return null;
  }

  const app = readString(item.app);
  const model = readString(item.model);
  const id = readId(item.id);

  if (!app || !model || !id) {
    return null;
  }

  return {
    app,
    model,
    id,
  };
}

function shouldPreferPayloadTarget(
  eventTarget: ActivityTarget | null,
  payloadTarget: ActivityLinkTarget | null,
): boolean {
  if (!payloadTarget) {
    return false;
  }

  if (!eventTarget) {
    return true;
  }

  const eventKey = targetKey(eventTarget);
  const payloadKey = targetKey(payloadTarget);

  if (eventKey === 'comments.commentmodel') {
    return true;
  }

  return eventKey !== payloadKey || eventTarget.id !== payloadTarget.id;
}

function getEffectiveTarget(
  target: ActivityTarget | null,
  payload: ActivityPayload,
): ActivityTarget | ActivityLinkTarget | null {
  const payloadTarget = readPayloadTarget(payload);

  if (shouldPreferPayloadTarget(target, payloadTarget)) {
    return payloadTarget;
  }

  return target;
}

function getFragranceSlug(payload: ActivityPayload): string {
  const item = getItemPayload(payload);
  const fragrance = readRecord(payload.fragrance);
  const target = readRecord(payload.target);

  return (
    readString(payload.slug) ||
    readString(item?.slug) ||
    readString(fragrance?.slug) ||
    readString(target?.slug)
  );
}

function getDisplayName(payload: ActivityPayload): string {
  const actor = readRecord(payload.actor);
  const target = readRecord(payload.target);

  return stripAt(
    readString(payload.target_display_name) ||
      readString(payload.display_name) ||
      readString(payload.username) ||
      readString(target?.display_name) ||
      readString(actor?.display_name),
  );
}

function getPayloadTitle(payload: ActivityPayload): string {
  const item = getItemPayload(payload);
  const fragrance = readRecord(payload.fragrance);
  const target = readRecord(payload.target);

  const directTitle =
  readString(payload.title) ||
  readString(payload.name) ||
  readString(payload.target_title);

  if (directTitle) return directTitle;

  if (target) {
    const title = readString(target.title) || readString(target.name);
    const subtitle = readString(target.subtitle);

    if (title || subtitle) return buildTitleWithSubtitle(title, subtitle);
  }

  if (item) {
    const title = readString(item.title) || readString(item.name);
    const subtitle = readString(item.subtitle);

    if (title || subtitle) return buildTitleWithSubtitle(title, subtitle);
  }

  if (fragrance) {
    const brand = readRecord(fragrance.brand);
    const brandName = readString(brand?.name);
    const name = readString(fragrance.name);

    if (brandName && name) return `${brandName} ${name}`;
    if (name) return name;
  }

  return '';
}

function getTargetPayloadTitle(payload: ActivityPayload): string {
  const target = readRecord(payload.target);

  if (!target) {
    return '';
  }

  const title = readString(target.title) || readString(target.name);
  const subtitle = readString(target.subtitle);

  return buildTitleWithSubtitle(title, subtitle);
}

function getTopicPayloadTitle(payload: ActivityPayload): string {
  const topic = readRecord(payload.topic);

  if (!topic) {
    return '';
  }

  const title = readString(topic.title);
  const sectionTitle = readString(topic.section_title);

  return buildTitleWithSubtitle(title, sectionTitle);
}

export function getActivityActorLabel(actor: ActivityActor): string {
  const displayName = stripAt(readString(actor.display_name));

  if (displayName) {
    return displayName;
  }

  return 'РљРѕСЂРёСЃС‚СѓРІР°С‡';
}

export function getActivityActorHref(actor: ActivityActor): string | null {
  const displayName = stripAt(readString(actor.display_name));

  if (!displayName) {
    return null;
  }

  return userPageUrlBuilder.publicProfile(displayName);
}

export function getActivityVerbLabel(verb: ActivityVerb): string {
  return VERB_LABELS[String(verb)] ?? getFallbackVerbLabel(verb);
}

function getActivityTargetLabelByResolvedTarget(
  target: ActivityTarget | ActivityLinkTarget | null,
  payload: ActivityPayload = {},
): string {
  if (!target) return '';

  const key = targetKey(target);

  if (key === 'users.usermodel' || key === 'users.user' || key === 'auth.user') {
    const displayName = getDisplayName(payload);

    return displayName || 'РљРѕСЂРёСЃС‚СѓРІР°С‡';
  }

  if (key === 'forum.forumtopicmodel') {
    return getTopicPayloadTitle(payload) || getTargetPayloadTitle(payload) || 'РўРµРјР° С„РѕСЂСѓРјСѓ';
  }

  if (key === 'fragrance.fragrancemodel') {
    return getPayloadTitle(payload) || 'РђСЂРѕРјР°С‚';
  }

  const item = getItemPayload(payload);

  if (item) {
    const itemLabel = TARGET_LABELS[key] ?? '';
    const title = readString(item.title) || readString(item.name);
    const subtitle = readString(item.subtitle);
    const itemText = buildTitleWithSubtitle(title, subtitle);

    if (itemLabel && itemText) return `${itemLabel}: ${itemText}`;
    if (itemText) return itemText;
  }

  const targetTitle = getTargetPayloadTitle(payload);
  if (targetTitle) return targetTitle;

  const title = getPayloadTitle(payload);
  if (title) return title;

  return TARGET_LABELS[key] ?? getFallbackTargetLabel(target);
}

export function getActivityTargetLabel(
  target: ActivityTarget | null,
  payload: ActivityPayload = {},
): string {
  return getActivityTargetLabelByResolvedTarget(
    getEffectiveTarget(target, payload),
    payload,
  );
}

export function getActivityPayloadText(event: ActivityEvent): string {
  const payload = event.payload ?? {};

  const comment = readRecord(payload.comment);

  if (comment) {
    const preview = readString(comment.preview);

    if (preview) {
      return preview;
    }
  }

  if (event.verb === 'commented') {
    return '';
  }

  if (event.verb === 'liked') {
    return '';
  }

  if (event.verb === 'favorited') {
    return getPayloadTitle(payload);
  }

  const payloadTitle = getPayloadTitle(payload);

  if (payloadTitle && payloadTitle !== getActivityTargetLabel(event.target, payload)) {
    return payloadTitle;
  }

  return '';
}

export function shouldShowActivityPayload(event: ActivityEvent): boolean {
  return Boolean(getActivityPayloadText(event));
}

export function isVisibleActivityEvent(event: ActivityEvent): boolean {
  return !HIDDEN_ACTIVITY_VERBS.has(String(event.verb));
}

export function getActivitySentence(event: ActivityEvent): string {
  const actor = getActivityActorLabel(event.actor);
  const verb = getActivityVerbLabel(event.verb);
  const target = getActivityTargetLabel(event.target, event.payload);

  return target ? `${actor} ${verb}: ${target}` : `${actor} ${verb}`;
}

export function getActivityHrefByTarget(
  target: ActivityTarget | ActivityLinkTarget | null,
  payload: ActivityPayload = {},
): string | null {
  if (!target) return null;

  const key = targetKey(target);

  if (key === 'articles.article') {
    return articlesPageUrlBuilder.public.detail(target.id);
  }

  if (key === 'forum.forumsectionmodel') {
    return forumPageUrlBuilder.sections.detail(target.id);
  }

  if (key === 'forum.forumtopicmodel') {
    const topic = readRecord(payload.topic);
    const id = readId(topic?.id) ?? target.id;

    return forumPageUrlBuilder.topics.detail(id);
  }

  if (key === 'fragrance.fragrancemodel') {
    const slug = getFragranceSlug(payload);
    return slug ? fragrancePageUrlBuilder.public.detail(slug) : null;
  }

  if (key === 'users.usermodel' || key === 'users.user' || key === 'auth.user') {
    const displayName = getDisplayName(payload);

    return displayName ? userPageUrlBuilder.publicProfile(displayName) : null;
  }

  return null;
}

function getActivityFallbackHref(payload: ActivityPayload): string | null {
  const topic = readRecord(payload.topic);
  const topicId = readId(topic?.id);

  if (topicId) {
    return forumPageUrlBuilder.topics.detail(topicId);
  }

  const fragranceSlug = getFragranceSlug(payload);

  if (fragranceSlug) {
    return fragrancePageUrlBuilder.public.detail(fragranceSlug);
  }

  const itemTarget = readItemTarget(payload);

  if (itemTarget) {
    return getActivityHrefByTarget(itemTarget, payload);
  }

  return null;
}

export function getActivityTargetHref(event: ActivityEvent): string | null {
  const payload = event.payload ?? {};
  const effectiveTarget = getEffectiveTarget(event.target, payload);

  return (
    getActivityHrefByTarget(effectiveTarget, payload) ||
    getActivityFallbackHref(payload)
  );
}
