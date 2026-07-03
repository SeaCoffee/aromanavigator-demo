import 'server-only';

import { djangoFormData, djangoJson } from '@/app/services/djangoClient.server';
import { photoApiUrlBuilder } from '@/app/urls/photoUrlBuilder';

import type { ID } from '@/app/types/http';
import type { Paginated } from '@/app/types/http';
import type {
  ModerationPhoto,
  ObjectAttachmentPhoto,
  ObjectCover,
} from '@/app/types/photoTypes';
import type { Query } from '@/app/types/http';

type UploadObjectCoverInput = {
  target: string;
  image: File;
};

type UploadObjectAttachmentsInput = {
  target: string;
  images: File[];
};

type ObjectPhotosTarget = {
  app: string;
  model: string;
  id: ID;
};

type ObjectPhotosResponse = {
  cover: ObjectCover | null;
  attachments: ObjectAttachmentPhoto[];
};

export async function getObjectPhotosServer({
  app,
  model,
  id,
}: ObjectPhotosTarget): Promise<ObjectPhotosResponse> {
  return djangoJson<ObjectPhotosResponse>(
    photoApiUrlBuilder.server.object.photos.detail(app, model, id),
    {
      auth: 'auto',
    },
  );
}

export async function uploadObjectCoverServer({
  target,
  image,
}: UploadObjectCoverInput): Promise<ObjectCover> {
  const formData = new FormData();

  formData.set('target', target);
  formData.set('image', image);

  return djangoFormData<ObjectCover>(
    photoApiUrlBuilder.server.object.cover.set(),
    {
      method: 'POST',
      formData,
      auth: 'required',
    },
  );
}

export async function deleteObjectCoverServer(coverId: ID): Promise<void> {
  await djangoJson<void>(
    photoApiUrlBuilder.server.object.cover.delete(coverId),
    {
      method: 'DELETE',
      auth: 'required',
    },
  );
}

export async function uploadObjectAttachmentsServer({
  target,
  images,
}: UploadObjectAttachmentsInput): Promise<ObjectAttachmentPhoto[]> {
  const formData = new FormData();

  formData.set('target', target);

  for (const image of images) {
    formData.append('images', image);
  }

  return djangoFormData<ObjectAttachmentPhoto[]>(
    photoApiUrlBuilder.server.object.attachments.add(),
    {
      method: 'POST',
      formData,
      auth: 'required',
    },
  );
}

export async function deleteObjectAttachmentServer(photoId: ID): Promise<void> {
  await djangoJson<void>(
    photoApiUrlBuilder.server.object.attachments.delete(photoId),
    {
      method: 'DELETE',
      auth: 'required',
    },
  );
}

export async function getModerationObjectPhotosServer(query?: Query) {
  return djangoJson<Paginated<ModerationPhoto>>(
    photoApiUrlBuilder.server.object.attachments.modList(query),
    {
      auth: 'required',
    },
  );
}

export async function getModerationObjectCoversServer(query?: Query) {
  return djangoJson<Paginated<ModerationPhoto>>(
    photoApiUrlBuilder.server.object.cover.modList(query),
    {
      auth: 'required',
    },
  );
}
