'use server';

import { revalidatePath } from 'next/cache';

import {
  deleteObjectAttachmentServer,
  deleteObjectCoverServer,
  uploadObjectAttachmentsServer,
  uploadObjectCoverServer,
} from '@/app/services/objectPhotoServices.server';
import {
  getActionErrorMessage,
  MAX_ATTACHMENTS_PER_UPLOAD,
  normalizeRefreshPaths,
  readRefreshPaths,
  validateImageFile,
  type PhotoActionResult,
} from '@/app/utils/photoActionUtils';
import { isPhotoTargetFormValue } from '@/app/utils/photoTargetUtils';

import type { ID } from '@/app/types/http';
import type {
  ObjectAttachmentPhoto,
  ObjectCover,
} from '@/app/types/photoTypes';

function refreshObjectPhotoPaths(paths: unknown) {
  for (const path of normalizeRefreshPaths(paths)) {
    revalidatePath(path);
  }
}

function getRequiredTarget(formData: FormData): string {
  const target = formData.get('target');

  if (!isPhotoTargetFormValue(target)) {
    throw new Error('РќРµРІС–СЂРЅРёР№ target РґР»СЏ С„РѕС‚Рѕ.');
  }

  return target;
}

function getRequiredImage(formData: FormData, fieldName: string): File {
  const file = formData.get(fieldName);

  if (!(file instanceof File) || file.size <= 0) {
    throw new Error('РћР±РµСЂС–С‚СЊ С„РѕС‚Рѕ.');
  }

  const validationError = validateImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  return file;
}

function getRequiredImages(formData: FormData, fieldName: string): File[] {
  const files = formData
    .getAll(fieldName)
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    throw new Error('РћР±РµСЂС–С‚СЊ С…РѕС‡Р° Р± РѕРґРЅРµ С„РѕС‚Рѕ.');
  }

  if (files.length > MAX_ATTACHMENTS_PER_UPLOAD) {
    throw new Error('Р—Р° РѕРґРёРЅ СЂР°Р· РјРѕР¶РЅР° Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РЅРµ Р±С–Р»СЊС€Рµ 10 Р·РѕР±СЂР°Р¶РµРЅСЊ.');
  }

  const invalidFile = files.find((file) => validateImageFile(file));

  if (invalidFile) {
    throw new Error(validateImageFile(invalidFile) ?? 'РќРµРєРѕСЂРµРєС‚РЅРµ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.');
  }

  return files;
}

export async function uploadObjectCoverAction(
  formData: FormData,
): Promise<PhotoActionResult<ObjectCover>> {
  try {
    const target = getRequiredTarget(formData);
    const image = getRequiredImage(formData, 'image');

    const cover = await uploadObjectCoverServer({
      target,
      image,
    });

    refreshObjectPhotoPaths(readRefreshPaths(formData));

    return {
      ok: true,
      data: cover,
      message: 'РћР±РєР»Р°РґРёРЅРєСѓ РѕРЅРѕРІР»РµРЅРѕ.',
    };
  } catch (error) {
    return {
      ok: false,
      error: getActionErrorMessage(error),
    };
  }
}

export async function deleteObjectCoverAction(
  coverId: ID,
  refreshPaths: string[] = [],
): Promise<PhotoActionResult<{ id: ID }>> {
  try {
    await deleteObjectCoverServer(coverId);

    refreshObjectPhotoPaths(refreshPaths);

    return {
      ok: true,
      data: { id: coverId },
      message: 'РћР±РєР»Р°РґРёРЅРєСѓ РІРёРґР°Р»РµРЅРѕ.',
    };
  } catch (error) {
    return {
      ok: false,
      error: getActionErrorMessage(error),
    };
  }
}

export async function deleteObjectCoverFormAction(formData: FormData) {
  await deleteObjectCoverAction(String(formData.get('id') ?? ''), [
    '/admin/photos',
  ]);
}

export async function uploadObjectAttachmentsAction(
  formData: FormData,
): Promise<PhotoActionResult<ObjectAttachmentPhoto[]>> {
  try {
    const target = getRequiredTarget(formData);
    const images = getRequiredImages(formData, 'images');

    const photos = await uploadObjectAttachmentsServer({
      target,
      images,
    });

    refreshObjectPhotoPaths(readRefreshPaths(formData));

    return {
      ok: true,
      data: photos,
      message: 'Р¤РѕС‚Рѕ РґРѕРґР°РЅРѕ.',
    };
  } catch (error) {
    return {
      ok: false,
      error: getActionErrorMessage(error),
    };
  }
}

export async function deleteObjectAttachmentAction(
  photoId: ID,
  refreshPaths: string[] = [],
): Promise<PhotoActionResult<{ id: ID }>> {
  try {
    await deleteObjectAttachmentServer(photoId);

    refreshObjectPhotoPaths(refreshPaths);

    return {
      ok: true,
      data: { id: photoId },
      message: 'Р¤РѕС‚Рѕ РІРёРґР°Р»РµРЅРѕ.',
    };
  } catch (error) {
    return {
      ok: false,
      error: getActionErrorMessage(error),
    };
  }
}

export async function deleteObjectAttachmentFormAction(formData: FormData) {
  await deleteObjectAttachmentAction(String(formData.get('id') ?? ''), [
    '/admin/photos',
  ]);
}
