import 'server-only';

import {
  uploadObjectAttachmentsServer,
  uploadObjectCoverServer,
} from '@/app/services/objectPhotoServices.server';
import {
  MAX_ATTACHMENTS_PER_UPLOAD,
  validateImageFile,
} from '@/app/utils/photoActionUtils';

import type {
  ObjectAttachmentPhoto,
  ObjectCover,
} from '@/app/types/photoTypes';

export function readOptionalImage(
  formData: FormData,
  fieldName: string,
): File | null {
  const value = formData.get(fieldName);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  const validationError = validateImageFile(value);

  if (validationError) {
    throw new Error(validationError);
  }

  return value;
}

export function readImages(formData: FormData, fieldName: string): File[] {
  const files = formData
    .getAll(fieldName)
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length > MAX_ATTACHMENTS_PER_UPLOAD) {
    throw new Error('Р—Р° РѕРґРёРЅ СЂР°Р· РјРѕР¶РЅР° Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РЅРµ Р±С–Р»СЊС€Рµ 10 Р·РѕР±СЂР°Р¶РµРЅСЊ.');
  }

  const invalidFile = files.find((file) => validateImageFile(file));

  if (invalidFile) {
    throw new Error(validateImageFile(invalidFile) ?? 'РќРµРєРѕСЂРµРєС‚РЅРµ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.');
  }

  return files;
}

export async function uploadContentPhotos({
  target,
  cover,
  attachments,
}: {
  target: string;
  cover: File | null;
  attachments: File[];
}): Promise<{
  cover: ObjectCover | null;
  attachments: ObjectAttachmentPhoto[];
}> {
  const uploadedCover = cover
    ? await uploadObjectCoverServer({ target, image: cover })
    : null;

  const uploadedAttachments = attachments.length
    ? await uploadObjectAttachmentsServer({ target, images: attachments })
    : [];

  return {
    cover: uploadedCover,
    attachments: uploadedAttachments,
  };
}
