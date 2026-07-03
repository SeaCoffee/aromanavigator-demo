'use server';

import {
  createCommentFormServer,
  createCommentServer,
  deleteCommentServer,
  updateCommentServer,
} from '@/app/services/commentServerServices';
import { readImages } from '@/app/actions/actionHelpers/contentPhotoActionHelpers';
import type {
  ForumComment,
  ForumCommentCreatePayload,
  ForumCommentUpdatePayload,
} from '@/app/types/forumTypes';

import {
  assertPositiveInt,
  cleanText,
  getErrorMessage,
  refreshActionPaths,
  type ActionOptions,
  type ActionResult,
} from '@/app/actions/actionHelpers/forumActionHelpers';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';

const COMMENT_ACTION_ERROR = 'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё РєРѕРјРµРЅС‚Р°СЂ.';

function cleanCommentTarget(target: ForumCommentCreatePayload['target']) {
  if (!target || typeof target !== 'object') {
    throw new Error('РќРµРєРѕСЂРµРєС‚РЅР° С†С–Р»СЊ РєРѕРјРµРЅС‚Р°СЂСЏ.');
  }

  const directApp = String(target.app ?? '').trim().toLowerCase();
  const directModel = String(target.model ?? '').trim().toLowerCase();

  if (!directApp || !directModel) {
    throw new Error('РќРµРєРѕСЂРµРєС‚РЅРёР№ С‚РёРї РѕР±вЂ™С”РєС‚Р° РґР»СЏ РєРѕРјРµРЅС‚Р°СЂСЏ.');
  }

  return {
    app: directApp,
    model: directModel,
    id: assertPositiveInt(target.id, 'ID РѕР±вЂ™С”РєС‚Р°'),
  };
}

function cleanCommentCreatePayload(
  payload: ForumCommentCreatePayload,
): ForumCommentCreatePayload {
  return {
    target: cleanCommentTarget(payload.target),
    body: cleanText(payload.body, 'РљРѕРјРµРЅС‚Р°СЂ', 5000),
    parent_id:
      payload.parent_id === null || payload.parent_id === undefined
        ? null
        : assertPositiveInt(payload.parent_id, 'ID Р±Р°С‚СЊРєС–РІСЃСЊРєРѕРіРѕ РєРѕРјРµРЅС‚Р°СЂСЏ'),
  };
}

function cleanCommentUpdatePayload(
  payload: ForumCommentUpdatePayload,
): ForumCommentUpdatePayload {
  return {
    body: cleanText(payload.body, 'РљРѕРјРµРЅС‚Р°СЂ', 5000),
  };
}

function readOptionalPositiveInt(formData: FormData, key: string): number | null {
  const value = String(formData.get(key) ?? '').trim();

  if (!value) {
    return null;
  }

  return assertPositiveInt(value, key);
}

function readRefreshPaths(formData: FormData): string[] {
  return formData
    .getAll('refresh_path')
    .map((value) => String(value).trim())
    .filter((value) => value.startsWith('/'));
}

export async function createCommentAction(
  payload: ForumCommentCreatePayload,
  options?: ActionOptions,
): Promise<ActionResult<ForumComment>> {
  try {
    const comment = await createCommentServer(cleanCommentCreatePayload(payload));

    refreshActionPaths(options);

    return { ok: true, data: comment, msg: 'РљРѕРјРµРЅС‚Р°СЂ РґРѕРґР°РЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error, COMMENT_ACTION_ERROR) };
  }
}

export async function createCommentFormAction(
  _prev: ActionResult<ForumComment> | null,
  formData: FormData,
): Promise<ActionResult<ForumComment>> {
  try {
    const payload = cleanCommentCreatePayload({
      target: {
        app: String(formData.get('target_app') ?? ''),
        model: String(formData.get('target_model') ?? ''),
        id: assertPositiveInt(formData.get('target_id'), 'ID РѕР±вЂ™С”РєС‚Р°'),
      },
      body: String(formData.get('body') ?? ''),
      parent_id: readOptionalPositiveInt(formData, 'parent_id'),
    });
    const requestFormData = new FormData();

    requestFormData.set(
      'target',
      `${payload.target.app}.${payload.target.model}:${payload.target.id}`,
    );
    requestFormData.set('body', payload.body);

    if (payload.parent_id) {
      requestFormData.set('parent_id', String(payload.parent_id));
    }

    if (formData.get('is_official') === 'true') {
      requestFormData.set('is_official', 'true');
    }

    for (const image of readImages(formData, 'images')) {
      requestFormData.append('images', image);
    }

    const comment = await createCommentFormServer(requestFormData);

    refreshActionPaths({ refreshPaths: readRefreshPaths(formData) });

    return { ok: true, data: comment, msg: 'РљРѕРјРµРЅС‚Р°СЂ РґРѕРґР°РЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error, COMMENT_ACTION_ERROR) };
  }
}

export async function updateCommentAction(
  commentId: number | string,
  payload: ForumCommentUpdatePayload,
  options?: ActionOptions,
): Promise<ActionResult<ForumComment>> {
  try {
    const cleanId = assertPositiveInt(commentId, 'ID РєРѕРјРµРЅС‚Р°СЂСЏ');
    const comment = await updateCommentServer(cleanId, cleanCommentUpdatePayload(payload));

    refreshActionPaths(options);

    return { ok: true, data: comment, msg: 'РљРѕРјРµРЅС‚Р°СЂ РѕРЅРѕРІР»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error, COMMENT_ACTION_ERROR) };
  }
}

export async function deleteCommentAction(
  commentId: number | string,
  options?: ActionOptions,
): Promise<ActionResult<null>> {
  try {
    const cleanId = assertPositiveInt(commentId, 'ID РєРѕРјРµРЅС‚Р°СЂСЏ');

    await deleteCommentServer(cleanId);
    refreshActionPaths(options);

    return { ok: true, data: null, msg: 'РљРѕРјРµРЅС‚Р°СЂ РІРёРґР°Р»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error, COMMENT_ACTION_ERROR) };
  }
}

export async function deleteCommentFormAction(formData: FormData) {
  await deleteCommentAction(String(formData.get('id') ?? ''), {
    refreshPaths: [adminPageUrlBuilder.comments.list()],
  });
}
