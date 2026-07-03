import type { ID } from '@/app/types/http';
import type { ObjectAttachmentPhoto } from '@/app/types/photoTypes';

const ARTICLE_PHOTO_TOKEN_RE = /\[\[article-photo:(\d+)\]\]/g;
const PENDING_ARTICLE_PHOTO_TOKEN_RE = /\[\[article-upload:(\d+)\]\]/g;

export type ArticleContentBlock =
  | { kind: 'text'; value: string }
  | { kind: 'photo'; photo: ObjectAttachmentPhoto };

export function articlePhotoToken(photoId: ID): string {
  return `[[article-photo:${photoId}]]`;
}

export function pendingArticlePhotoToken(index: number): string {
  return `[[article-upload:${index}]]`;
}

export function replacePendingArticlePhotoTokens(
  content: string,
  photos: ObjectAttachmentPhoto[],
): string {
  return content.replace(
    PENDING_ARTICLE_PHOTO_TOKEN_RE,
    (_token, rawIndex: string) => {
      const photo = photos[Number(rawIndex)];
      return photo ? articlePhotoToken(photo.id) : '';
    },
  );
}

export function removePendingArticlePhoto(
  content: string,
  removedIndex: number,
): string {
  return content.replace(
    PENDING_ARTICLE_PHOTO_TOKEN_RE,
    (_token, rawIndex: string) => {
      const index = Number(rawIndex);

      if (index === removedIndex) {
        return '';
      }

      return pendingArticlePhotoToken(index > removedIndex ? index - 1 : index);
    },
  );
}

export function removeArticlePhoto(
  content: string,
  photoId: ID,
): string {
  const token = articlePhotoToken(photoId);

  return content.split(token).join('');
}

export function validatePendingArticlePhotoTokens(
  content: string,
  photoCount: number,
): void {
  for (const match of content.matchAll(PENDING_ARTICLE_PHOTO_TOKEN_RE)) {
    const index = Number(match[1]);

    if (!Number.isInteger(index) || index < 0 || index >= photoCount) {
      throw new Error('РЈ С‚РµРєСЃС‚С– С” Р·РѕР±СЂР°Р¶РµРЅРЅСЏ, СЏРєРµ РЅРµ Р±СѓР»Рѕ РґРѕРґР°РЅРѕ РґРѕ С„РѕСЂРјРё.');
    }
  }
}

export function stripArticlePhotoTokens(content: string): string {
  return content
    .replace(ARTICLE_PHOTO_TOKEN_RE, ' ')
    .replace(PENDING_ARTICLE_PHOTO_TOKEN_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function articleContentBlocks(
  content: string,
  photos: ObjectAttachmentPhoto[],
): ArticleContentBlock[] {
  const photoMap = new Map(photos.map((photo) => [String(photo.id), photo]));
  const blocks: ArticleContentBlock[] = [];
  let cursor = 0;

  for (const match of content.matchAll(ARTICLE_PHOTO_TOKEN_RE)) {
    const index = match.index ?? 0;
    const text = content.slice(cursor, index);

    if (text) {
      blocks.push({ kind: 'text', value: text });
    }

    const photo = photoMap.get(match[1]);

    if (photo) {
      blocks.push({ kind: 'photo', photo });
    }

    cursor = index + match[0].length;
  }

  const tail = content.slice(cursor);

  if (tail) {
    blocks.push({ kind: 'text', value: tail });
  }

  return blocks;
}

export function unusedArticlePhotos(
  content: string,
  photos: ObjectAttachmentPhoto[],
): ObjectAttachmentPhoto[] {
  const usedIds = new Set(
    Array.from(content.matchAll(ARTICLE_PHOTO_TOKEN_RE), (match) => match[1]),
  );

  return photos.filter((photo) => !usedIds.has(String(photo.id)));
}
