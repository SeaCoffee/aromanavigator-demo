import { ObjectPhotoManager } from '@/app/components/photos/ObjectPhotoManager';
import { fragrancePhotoTarget } from '@/app/utils/photoTargetBuilders';

import type { FragranceDetail } from '@/app/types/fragranceTypes';

type FragrancePhotosManagerProps = {
  fragrance: FragranceDetail;
};

export default function FragrancePhotosManager({
  fragrance,
}: FragrancePhotosManagerProps) {
  return (
    <ObjectPhotoManager
      title="Р¤РѕС‚Рѕ Р°СЂРѕРјР°С‚Сѓ"
      target={fragrancePhotoTarget(fragrance.id)}
      initialPhotos={{
        cover: fragrance.cover,
      }}
      withCover
      withAttachments={false}
    />
  );
}
