import type { ID } from '@/app/types/http';

export type PhotoType = 'full' | 'bottom' | 'laser' | 'sprayer';

export type PhotoTarget = {
  app: string;
  model: string;
  id: ID;
};

export type PerfumePhoto = {
  id: ID;
  type: PhotoType;
  image: string;
  created_at?: string;
  updated_at?: string;
};

export type PerfumePhotoBulkUploadResponse = {
  detail: string;
  uploaded: PhotoType[];
};

export type ObjectCover = {
  id: ID;
  image: string;
  created_at: string;
  updated_at: string;
};

export type ObjectAttachmentPhoto = {
  id: ID;
  position: number;
  image: string;
  created_at?: string;
  updated_at?: string;
};

export type ObjectPhotosInitial = {
  cover?: ObjectCover | null;
  attachments?: ObjectAttachmentPhoto[];
};

export type PrivateObjectPhoto = {
  id: ID;
  url: string;
  original_name: string;
  content_type: string;
  size: number;
  created_at: string;
};

export type ModerationPhoto = {
  id: ID;
  kind: 'cover' | 'attachment' | string;
  image: string;
  target: PhotoTarget;
  created_at: string;
  updated_at: string;
};

export type ObjectPhotoRefreshOptions = {
  paths?: string[];
};

export type ObjectPhotoManagerProps = {
  target: PhotoTarget;
  initialPhotos?: ObjectPhotosInitial;
  withCover?: boolean;
  withAttachments?: boolean;
  refresh?: ObjectPhotoRefreshOptions;
  title?: string;
};
