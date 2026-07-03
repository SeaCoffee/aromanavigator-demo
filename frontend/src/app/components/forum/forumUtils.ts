import type { ForumTopic } from '@/app/types/forumTypes';
import type { ObjectPhotosInitial } from '@/app/types/photoTypes';
import { formatKeyedMessage } from '@/app/utils/messageUtils';

export function normalizeActionMessage(message: unknown): string {
  return formatKeyedMessage(message, 'РќРµРІС–РґРѕРјР° РїРѕРјРёР»РєР°.');
}

export function formatForumUserLabel(item: {
  user?: number;
  user_display_name?: string | null;
  user_username?: string | null;
}): string {
  return (
    item.user_display_name ||
    item.user_username ||
    'РљРѕСЂРёСЃС‚СѓРІР°С‡'
  );
}

export function isAuthLikeError(message: string): boolean {
  return /401|403|auth|login|СѓРІС–Р№РґС–С‚СЊ|СѓРІС–Р№С‚Рё|РІРѕР№С‚Рё/i.test(message);
}

export function parseForumTagsInput(value: string): string[] {
  return Array.from(
    new Set(
      String(value || '')
        .split(',')
        .map((item) => item.trim().replace(/^#/, '').toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 20);
}

export function forumTopicTagsToInput(topic: Pick<ForumTopic, 'tags_read'>): string {
  return Array.isArray(topic.tags_read) ? topic.tags_read.join(', ') : '';
}

export function forumTopicPhotosInitial(topic: ForumTopic): ObjectPhotosInitial {
  return {
    cover: topic.cover
      ? {
          id: topic.cover.id,
          image: topic.cover.image,
          created_at: topic.cover.created_at ?? '',
          updated_at: topic.cover.updated_at ?? '',
        }
      : null,
    attachments: (topic.attachments ?? []).map((photo, index) => ({
      id: photo.id,
      image: photo.image,
      position: photo.position ?? index,
      created_at: photo.created_at,
      updated_at: photo.updated_at,
    })),
  };
}
