import { pickMediaUrl } from '@/app/utils/MediaUrlUtils';

export function getFragranceImageUrl(...images: unknown[]) {
  return pickMediaUrl(...images) || null;
}
