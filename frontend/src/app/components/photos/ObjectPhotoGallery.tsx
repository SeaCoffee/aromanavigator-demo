import { getFragranceImageUrl } from '@/app/utils/fragranceImageUtils';
import MediaImage from '@/app/components/images/MediaImage';
import type { ObjectAttachmentPhoto } from '@/app/types/photoTypes';

type Props = {
  title: string;
  photos: ObjectAttachmentPhoto[];
  emptyText?: string;
};

export default function ObjectPhotoGallery({
  title,
  photos,
  emptyText = 'Р¤РѕС‚Рѕ РїРѕРєРё РЅРµРјР°С”.',
}: Props) {
  return (
    <section className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-5">
      <h2 className="text-2xl font-semibold text-neutral-950">{title}</h2>

      {photos.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => {
            const image = getFragranceImageUrl(photo.image);

            return image ? (
              <a
                key={photo.id}
                href={image}
                target="_blank"
                rel="noreferrer"
                className="aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
              >
                <MediaImage
                  src={image}
                  alt={`Р¤РѕС‚Рѕ ${index + 1}`}
                  className="h-full w-full object-cover"
                  fallbackClassName="grid h-full place-items-center p-3 text-center text-xs text-neutral-400"
                  fallback="Р¤РѕС‚Рѕ РЅРµРґРѕСЃС‚СѓРїРЅРµ"
                />
              </a>
            ) : null;
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-500">
          {emptyText}
        </div>
      )}
    </section>
  );
}
