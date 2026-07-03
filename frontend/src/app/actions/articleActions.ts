'use server';

import { revalidatePath } from 'next/cache';

import { errorToActionState } from '@/app/actions/actionHelpers/wardrobeActionStateHelpers';
import {
  createArticleServer,
  deleteArticleServer,
  getMyArticleServer,
  publishArticleServer,
  rejectArticleServer,
  submitArticleServer,
  updateArticleServer,
} from '@/app/services/articleServices.server';
import {
  readImages,
  readOptionalImage,
  uploadContentPhotos,
} from '@/app/actions/actionHelpers/contentPhotoActionHelpers';
import type {
  ArticleCreatePayload,
  ArticleDetail,
  ArticleRejectPayload,
  ArticleStatus,
  ArticleUpdatePayload,
} from '@/app/types/articleTypes';
import type { ActionState } from '@/app/types/authTypes';
import type { ID } from '@/app/types/http';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';
import {
  replacePendingArticlePhotoTokens,
  validatePendingArticlePhotoTokens,
} from '@/app/utils/articleContentUtils';
import { articlePhotoTargetString } from '@/app/utils/photoTargetBuilders';

const AUTHOR_ALLOWED_STATUSES = new Set<ArticleStatus>(['draft', 'pending']);

function normalizeId(value: ID, message: string): ID {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new Error(message);
  }

  return numericValue;
}

function normalizeText(value: unknown): string {
  return String(value ?? '').trim();
}

function normalizeTitle(value: unknown): string {
  const title = normalizeText(value);

  if (!title) {
    throw new Error('Р’РєР°Р¶С–С‚СЊ Р·Р°РіРѕР»РѕРІРѕРє СЃС‚Р°С‚С‚С–.');
  }

  if (title.length > 200) {
    throw new Error('Р—Р°РіРѕР»РѕРІРѕРє РјР°С” Р±СѓС‚Рё РЅРµ РґРѕРІС€РёР№ Р·Р° 200 СЃРёРјРІРѕР»С–РІ.');
  }

  return title;
}

function normalizeContent(value: unknown): string {
  const content = normalizeText(value);

  if (!content) {
    throw new Error('Р”РѕРґР°Р№С‚Рµ С‚РµРєСЃС‚ СЃС‚Р°С‚С‚С–.');
  }

  if (content.length > 30_000) {
    throw new Error('РўРµРєСЃС‚ СЃС‚Р°С‚С‚С– РјР°С” Р±СѓС‚Рё РЅРµ РґРѕРІС€РёР№ Р·Р° 30000 СЃРёРјРІРѕР»С–РІ.');
  }

  return content;
}

function normalizeAuthorStatus(value: unknown): ArticleStatus {
  const status = String(value || 'draft') as ArticleStatus;

  if (!AUTHOR_ALLOWED_STATUSES.has(status)) {
    throw new Error('РЎС‚Р°С‚С‚СЋ РјРѕР¶РЅР° Р·Р±РµСЂРµРіС‚Рё СЏРє С‡РµСЂРЅРµС‚РєСѓ Р°Р±Рѕ РІС–РґРїСЂР°РІРёС‚Рё РЅР° РјРѕРґРµСЂР°С†С–СЋ.');
  }

  return status;
}

function normalizeTagNames(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  value.forEach((item) => {
    const tag = String(item ?? '').trim().replace(/\s+/g, ' ');

    if (!tag) {
      return;
    }

    if (tag.length > 50) {
      throw new Error('РўРµРі РјР°С” Р±СѓС‚Рё РЅРµ РґРѕРІС€РёР№ Р·Р° 50 СЃРёРјРІРѕР»С–РІ.');
    }

    const key = tag.toLowerCase();

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    result.push(tag);
  });

  if (result.length > 12) {
    throw new Error('РњР°РєСЃРёРјР°Р»СЊРЅР° РєС–Р»СЊРєС–СЃС‚СЊ С‚РµРіС–РІ: 12.');
  }

  return result;
}

function normalizeCreatePayload(
  payload: ArticleCreatePayload,
): ArticleCreatePayload {
  return {
    title: normalizeTitle(payload.title),
    content: normalizeContent(payload.content),
    status: normalizeAuthorStatus(payload.status),
    tag_names: normalizeTagNames(payload.tag_names),
  };
}

function normalizeUpdatePayload(
  payload: ArticleUpdatePayload,
): ArticleUpdatePayload {
  const normalized: ArticleUpdatePayload = {};

  if (payload.title !== undefined) {
    normalized.title = normalizeTitle(payload.title);
  }

  if (payload.content !== undefined) {
    normalized.content = normalizeContent(payload.content);
  }

  if (payload.status !== undefined) {
    normalized.status = normalizeAuthorStatus(payload.status);
  }

  if (payload.tag_names !== undefined) {
    normalized.tag_names = normalizeTagNames(payload.tag_names);
  }

  if (Object.keys(normalized).length === 0) {
    throw new Error('РќРµРјР°С” РґР°РЅРёС… РґР»СЏ РѕРЅРѕРІР»РµРЅРЅСЏ.');
  }

  return normalized;
}

function readArticleFormData(formData: FormData): ArticleCreatePayload {
  return normalizeCreatePayload({
    title: String(formData.get('title') ?? ''),
    content: String(formData.get('content') ?? ''),
    status: formData.get('status') as ArticleStatus,
    tag_names: formData.getAll('tag_names').map(String),
  });
}

function revalidateArticlePages(articleId?: ID) {
  revalidatePath(articlesPageUrlBuilder.public.list());
  revalidatePath(articlesPageUrlBuilder.me.list());
  revalidatePath(articlesPageUrlBuilder.admin.moderation());

  if (articleId) {
    revalidatePath(articlesPageUrlBuilder.public.detail(articleId));
    revalidatePath(articlesPageUrlBuilder.me.edit(articleId));
  }
}

export async function createArticleAction(
  formData: FormData,
): Promise<ActionState<ArticleDetail>> {
  try {
    const normalizedPayload = readArticleFormData(formData);
    const cover = readOptionalImage(formData, 'cover');
    const inlineImages = readImages(formData, 'inline_images');

    validatePendingArticlePhotoTokens(
      normalizedPayload.content,
      inlineImages.length,
    );

    let data = await createArticleServer({
      ...normalizedPayload,
      status: 'draft',
    });
    const uploaded = await uploadContentPhotos({
      target: articlePhotoTargetString(data.id),
      cover,
      attachments: inlineImages,
    });
    const content = replacePendingArticlePhotoTokens(
      normalizedPayload.content,
      uploaded.attachments,
    );

    data = await updateArticleServer(data.id, {
      content,
      status: normalizedPayload.status,
    });

    data = await getMyArticleServer(data.id);

    revalidateArticlePages(data.id);

    return {
      ok: true,
      msg: 'РЎС‚Р°С‚С‚СЋ Р·Р±РµСЂРµР¶РµРЅРѕ.',
      data,
    };
  } catch (error) {
    return errorToActionState<ArticleDetail>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р±РµСЂРµРіС‚Рё СЃС‚Р°С‚С‚СЋ.',
    );
  }
}

export async function updateArticleAction(
  articleId: ID,
  formData: FormData,
): Promise<ActionState<ArticleDetail>> {
  try {
    const normalizedArticleId = normalizeId(articleId, 'РќРµРєРѕСЂРµРєС‚РЅР° СЃС‚Р°С‚С‚СЏ.');
    const normalizedPayload = normalizeUpdatePayload(readArticleFormData(formData));
    const cover = readOptionalImage(formData, 'cover');
    const inlineImages = readImages(formData, 'inline_images');

    validatePendingArticlePhotoTokens(
      normalizedPayload.content ?? '',
      inlineImages.length,
    );

    const uploaded = await uploadContentPhotos({
      target: articlePhotoTargetString(normalizedArticleId),
      cover,
      attachments: inlineImages,
    });

    if (normalizedPayload.content !== undefined) {
      normalizedPayload.content = replacePendingArticlePhotoTokens(
        normalizedPayload.content,
        uploaded.attachments,
      );
    }

    await updateArticleServer(
      normalizedArticleId,
      normalizedPayload,
    );
    const data = await getMyArticleServer(normalizedArticleId);

    revalidateArticlePages(normalizedArticleId);

    return {
      ok: true,
      msg: 'РЎС‚Р°С‚С‚СЋ РѕРЅРѕРІР»РµРЅРѕ.',
      data,
    };
  } catch (error) {
    return errorToActionState<ArticleDetail>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё СЃС‚Р°С‚С‚СЋ.',
    );
  }
}

export async function deleteArticleAction(
  articleId: ID,
): Promise<ActionState<null>> {
  try {
    const normalizedArticleId = normalizeId(articleId, 'РќРµРєРѕСЂРµРєС‚РЅР° СЃС‚Р°С‚С‚СЏ.');

    await deleteArticleServer(normalizedArticleId);
    revalidateArticlePages(normalizedArticleId);

    return {
      ok: true,
      msg: 'РЎС‚Р°С‚С‚СЋ РІРёРґР°Р»РµРЅРѕ.',
      data: null,
    };
  } catch (error) {
    return errorToActionState<null>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ РІРёРґР°Р»РёС‚Рё СЃС‚Р°С‚С‚СЋ.',
    );
  }
}

export async function submitArticleAction(
  articleId: ID,
): Promise<ActionState<ArticleDetail>> {
  try {
    const normalizedArticleId = normalizeId(articleId, 'РќРµРєРѕСЂРµРєС‚РЅР° СЃС‚Р°С‚С‚СЏ.');
    const data = await submitArticleServer(normalizedArticleId);

    revalidateArticlePages(normalizedArticleId);

    return {
      ok: true,
      msg: 'РЎС‚Р°С‚С‚СЋ РІС–РґРїСЂР°РІР»РµРЅРѕ РЅР° РјРѕРґРµСЂР°С†С–СЋ.',
      data,
    };
  } catch (error) {
    return errorToActionState<ArticleDetail>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ РІС–РґРїСЂР°РІРёС‚Рё СЃС‚Р°С‚С‚СЋ РЅР° РјРѕРґРµСЂР°С†С–СЋ.',
    );
  }
}

export async function publishArticleAction(
  articleId: ID,
): Promise<ActionState<ArticleDetail>> {
  try {
    const normalizedArticleId = normalizeId(articleId, 'РќРµРєРѕСЂРµРєС‚РЅР° СЃС‚Р°С‚С‚СЏ.');
    const data = await publishArticleServer(normalizedArticleId);

    revalidateArticlePages(normalizedArticleId);

    return {
      ok: true,
      msg: 'РЎС‚Р°С‚С‚СЋ РѕРїСѓР±Р»С–РєРѕРІР°РЅРѕ.',
      data,
    };
  } catch (error) {
    return errorToActionState<ArticleDetail>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ РѕРїСѓР±Р»С–РєСѓРІР°С‚Рё СЃС‚Р°С‚С‚СЋ.',
    );
  }
}

export async function rejectArticleAction(
  articleId: ID,
  payload: ArticleRejectPayload,
): Promise<ActionState<ArticleDetail>> {
  try {
    const normalizedArticleId = normalizeId(articleId, 'РќРµРєРѕСЂРµРєС‚РЅР° СЃС‚Р°С‚С‚СЏ.');

    const data = await rejectArticleServer(normalizedArticleId, {
      moderator_comment: normalizeText(payload.moderator_comment),
    });

    revalidateArticlePages(normalizedArticleId);

    return {
      ok: true,
      msg: 'РЎС‚Р°С‚С‚СЋ РІС–РґС…РёР»РµРЅРѕ.',
      data,
    };
  } catch (error) {
    return errorToActionState<ArticleDetail>(
      error,
      'РќРµ РІРґР°Р»РѕСЃСЏ РІС–РґС…РёР»РёС‚Рё СЃС‚Р°С‚С‚СЋ.',
    );
  }
}
