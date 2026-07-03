'use server';

import {
  createForumSectionServer,
  createForumTopicServer,
  deleteForumSectionServer,
  deleteForumTopicServer,
  getForumTopicServer,
  updateForumSectionServer,
  updateForumTopicServer,
} from '@/app/services/forumServerServices';
import {
  readImages,
  readOptionalImage,
  uploadContentPhotos,
} from '@/app/actions/actionHelpers/contentPhotoActionHelpers';
import { forumTopicPhotoTargetString } from '@/app/utils/photoTargetBuilders';
import type {
  ForumSection,
  ForumSectionCreatePayload,
  ForumSectionUpdatePayload,
  ForumTopic,
  ForumTopicCreatePayload,
  ForumTopicUpdatePayload,
} from '@/app/types/forumTypes';

import {
  assertPositiveInt,
  cleanText,
  getErrorMessage,
  refreshActionPaths,
  type ActionOptions,
  type ActionResult,
} from '@/app/actions/actionHelpers/forumActionHelpers';

const FORUM_ACTION_ERROR = 'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё С„РѕСЂСѓРј.';

function cleanSectionCreatePayload(
  payload: ForumSectionCreatePayload,
): ForumSectionCreatePayload {
  return {
    title: cleanText(payload.title, 'РќР°Р·РІР° СЂРѕР·РґС–Р»Сѓ', 120),
    description: String(payload.description ?? '').trim(),
    is_active: payload.is_active,
    order: payload.order,
  };
}

function cleanSectionUpdatePayload(
  payload: ForumSectionUpdatePayload,
): ForumSectionUpdatePayload {
  const cleaned: ForumSectionUpdatePayload = {};

  if (payload.title !== undefined) {
    cleaned.title = cleanText(payload.title, 'РќР°Р·РІР° СЂРѕР·РґС–Р»Сѓ', 120);
  }

  if ('description' in payload) {
    cleaned.description = String(payload.description ?? '').trim();
  }

  if ('is_active' in payload) {
    cleaned.is_active = payload.is_active;
  }

  if ('order' in payload) {
    cleaned.order = payload.order;
  }

  return cleaned;
}

function cleanTags(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const tags = Array.from(
    new Set(
      value
        .map((item) => String(item ?? '').trim().replace(/^#/, '').toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 20);

  return tags.length > 0 ? tags : [];
}

function cleanTopicCreatePayload(
  payload: ForumTopicCreatePayload,
): ForumTopicCreatePayload {
  return {
    section: assertPositiveInt(payload.section, 'ID СЂРѕР·РґС–Р»Сѓ'),
    title: cleanText(payload.title, 'РќР°Р·РІР° С‚РµРјРё', 160),
    content: cleanText(payload.content, 'РўРµРєСЃС‚ С‚РµРјРё'),
    tags: cleanTags(payload.tags),
    is_pinned: payload.is_pinned,
    is_locked: payload.is_locked,
    is_hidden: payload.is_hidden,
  };
}

function cleanTopicUpdatePayload(
  payload: ForumTopicUpdatePayload,
): ForumTopicUpdatePayload {
  const cleaned: ForumTopicUpdatePayload = {};

  if (payload.title !== undefined) {
    cleaned.title = cleanText(payload.title, 'РќР°Р·РІР° С‚РµРјРё', 160);
  }

  if (payload.content !== undefined) {
    cleaned.content = cleanText(payload.content, 'РўРµРєСЃС‚ С‚РµРјРё');
  }

  if ('tags' in payload) {
    cleaned.tags = cleanTags(payload.tags) ?? [];
  }

  if ('is_pinned' in payload) {
    cleaned.is_pinned = payload.is_pinned;
  }

  if ('is_locked' in payload) {
    cleaned.is_locked = payload.is_locked;
  }

  if ('is_hidden' in payload) {
    cleaned.is_hidden = payload.is_hidden;
  }

  return cleaned;
}

function topicCreatePayloadFromFormData(formData: FormData): ForumTopicCreatePayload {
  return cleanTopicCreatePayload({
    section: Number(formData.get('section') ?? 0),
    title: String(formData.get('title') ?? ''),
    content: String(formData.get('content') ?? ''),
    tags: formData.getAll('tags').map(String),
  });
}

function topicUpdatePayloadFromFormData(formData: FormData): ForumTopicUpdatePayload {
  return cleanTopicUpdatePayload({
    title: String(formData.get('title') ?? ''),
    content: String(formData.get('content') ?? ''),
    tags: formData.getAll('tags').map(String),
  });
}

export async function createForumSectionAction(
  payload: ForumSectionCreatePayload,
  options?: ActionOptions,
): Promise<ActionResult<ForumSection>> {
  try {
    const section = await createForumSectionServer(cleanSectionCreatePayload(payload));

    refreshActionPaths(options);

    return { ok: true, data: section, msg: 'Р РѕР·РґС–Р» СЃС‚РІРѕСЂРµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error, FORUM_ACTION_ERROR) };
  }
}

export async function updateForumSectionAction(
  sectionId: number | string,
  payload: ForumSectionUpdatePayload,
  options?: ActionOptions,
): Promise<ActionResult<ForumSection>> {
  try {
    const cleanId = assertPositiveInt(sectionId, 'ID СЂРѕР·РґС–Р»Сѓ');
    const section = await updateForumSectionServer(
      cleanId,
      cleanSectionUpdatePayload(payload),
    );

    refreshActionPaths(options);

    return { ok: true, data: section, msg: 'Р РѕР·РґС–Р» РѕРЅРѕРІР»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error, FORUM_ACTION_ERROR) };
  }
}

export async function deleteForumSectionAction(
  sectionId: number | string,
  options?: ActionOptions,
): Promise<ActionResult<null>> {
  try {
    const cleanId = assertPositiveInt(sectionId, 'ID СЂРѕР·РґС–Р»Сѓ');

    await deleteForumSectionServer(cleanId);
    refreshActionPaths(options);

    return { ok: true, data: null, msg: 'Р РѕР·РґС–Р» РІРёРґР°Р»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error, FORUM_ACTION_ERROR) };
  }
}

export async function createForumSectionFormAction(formData: FormData) {
  await createForumSectionAction(
    {
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? ''),
      order: Number(formData.get('order') ?? 0),
      is_active: formData.get('is_active') === 'on',
    },
    { refreshPaths: ['/admin/forum', '/forum'] },
  );
}

export async function updateForumSectionFormAction(formData: FormData) {
  await updateForumSectionAction(
    String(formData.get('id') ?? ''),
    {
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? ''),
      order: Number(formData.get('order') ?? 0),
      is_active: formData.get('is_active') === 'on',
    },
    { refreshPaths: ['/admin/forum', '/forum'] },
  );
}

export async function deleteForumSectionFormAction(formData: FormData) {
  await deleteForumSectionAction(
    String(formData.get('id') ?? ''),
    { refreshPaths: ['/admin/forum', '/forum'] },
  );
}

export async function createForumTopicAction(
  formData: FormData,
  options?: ActionOptions,
): Promise<ActionResult<ForumTopic>> {
  try {
    let topic = await createForumTopicServer(topicCreatePayloadFromFormData(formData));
    await uploadContentPhotos({
      target: forumTopicPhotoTargetString(topic.id),
      cover: readOptionalImage(formData, 'cover'),
      attachments: readImages(formData, 'attachments'),
    });
    topic = await getForumTopicServer(topic.id);

    refreshActionPaths(options);

    return { ok: true, data: topic, msg: 'РўРµРјСѓ СЃС‚РІРѕСЂРµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error, FORUM_ACTION_ERROR) };
  }
}

export async function updateForumTopicAction(
  topicId: number | string,
  formData: FormData,
  options?: ActionOptions,
): Promise<ActionResult<ForumTopic>> {
  try {
    const cleanId = assertPositiveInt(topicId, 'ID С‚РµРјРё');
    await updateForumTopicServer(cleanId, topicUpdatePayloadFromFormData(formData));
    await uploadContentPhotos({
      target: forumTopicPhotoTargetString(cleanId),
      cover: readOptionalImage(formData, 'cover'),
      attachments: readImages(formData, 'attachments'),
    });
    const topic = await getForumTopicServer(cleanId);

    refreshActionPaths(options);

    return { ok: true, data: topic, msg: 'РўРµРјСѓ РѕРЅРѕРІР»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error, FORUM_ACTION_ERROR) };
  }
}

export async function deleteForumTopicAction(
  topicId: number | string,
  options?: ActionOptions,
): Promise<ActionResult<null>> {
  try {
    const cleanId = assertPositiveInt(topicId, 'ID С‚РµРјРё');

    await deleteForumTopicServer(cleanId);
    refreshActionPaths(options);

    return { ok: true, data: null, msg: 'РўРµРјСѓ РІРёРґР°Р»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error, FORUM_ACTION_ERROR) };
  }
}

export async function deleteForumTopicFormAction(formData: FormData) {
  const topicId = formData.get('id');

  await deleteForumTopicAction(String(topicId ?? ''), {
    refreshPaths: ['/admin/forum'],
  });
}
