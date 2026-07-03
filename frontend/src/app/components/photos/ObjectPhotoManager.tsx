'use client';

import { useState } from 'react';

import { ObjectAttachmentsUploadForm } from '@/app/components/photos/ObjectAttachmentsUploadForm';
import { ObjectCoverUploadForm } from '@/app/components/photos/ObjectCoverUploadForm';
import { ObjectPhotoCard } from '@/app/components/photos/ObjectPhotoCard';
import { photoPageUrlBuilder } from '@/app/urls/photoUrlBuilder';

import type { ID } from '@/app/types/http';
import type {
  ObjectAttachmentPhoto,
  ObjectCover,
  ObjectPhotoManagerProps,
} from '@/app/types/photoTypes';

function sortAttachments(
  photos: ObjectAttachmentPhoto[],
): ObjectAttachmentPhoto[] {
  return [...photos].sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }

    return Number(a.id) - Number(b.id);
  });
}

export function ObjectPhotoManager({
  target,
  initialPhotos,
  withCover = true,
  withAttachments = true,
  refresh,
  title = 'Р¤РѕС‚Рѕ',
}: ObjectPhotoManagerProps) {
  const [cover, setCover] = useState<ObjectCover | null>(
    initialPhotos?.cover ?? null,
  );

  const [attachments, setAttachments] = useState<ObjectAttachmentPhoto[]>(
    sortAttachments(initialPhotos?.attachments ?? []),
  );

  const refreshPaths = refresh?.paths ?? [];

  const handleCoverUploaded = (nextCover: ObjectCover) => {
    setCover(nextCover);
  };

  const handleCoverDeleted = () => {
    setCover(null);
  };

  const handleAttachmentsUploaded = (nextPhotos: ObjectAttachmentPhoto[]) => {
    setAttachments((current) => sortAttachments([...current, ...nextPhotos]));
  };

  const handleAttachmentDeleted = (photoId: ID) => {
    setAttachments((current) =>
      current.filter((photo) => String(photo.id) !== String(photoId)),
    );
  };

  return (
    <section id={photoPageUrlBuilder.anchors.photos} className="grid gap-6">
      <header className="grid gap-1">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="text-sm text-slate-500">
          Р—Р°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ С„РѕС‚Рѕ, РѕР±РєР»Р°РґРёРЅРєРё С‚Р° РґРѕРґР°С‚РєРѕРІРёС… Р·РѕР±СЂР°Р¶РµРЅСЊ.
        </p>
      </header>

      {withCover ? (
        <section
          id={photoPageUrlBuilder.anchors.cover}
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <h3 className="text-base font-semibold text-slate-950">
                РћР±РєР»Р°РґРёРЅРєР°
              </h3>
              <p className="text-sm text-slate-500">
                РћР±РєР»Р°РґРёРЅРєР° СЂРѕР·РґС–Р»Сѓ РѕРіРѕР»РѕС€РµРЅСЊ
              </p>
            </div>
          </div>

          {cover ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              <ObjectPhotoCard
                id={cover.id}
                image={cover.image}
                alt="РћР±РєР»Р°РґРёРЅРєР°"
                kind="cover"
                refreshPaths={refreshPaths}
                onDeleted={handleCoverDeleted}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              РћР±РєР»Р°РґРёРЅРєСѓ С‰Рµ РЅРµ Р·Р°РІР°РЅС‚Р°Р¶РµРЅРѕ.
            </div>
          )}

          <ObjectCoverUploadForm
            target={target}
            refreshPaths={refreshPaths}
            onUploaded={handleCoverUploaded}
          />
        </section>
      ) : null}

      {withAttachments ? (
        <section
          id={photoPageUrlBuilder.anchors.attachments}
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="grid gap-1">
            <h3 className="text-base font-semibold text-slate-950">
              Р”РѕРґР°С‚РєРѕРІС– С„РѕС‚Рѕ
            </h3>
            <p className="text-sm text-slate-500">
              РњРѕР¶РЅР° Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РѕРґРЅРµ Р°Р±Рѕ РєС–Р»СЊРєР° С„РѕС‚Рѕ.
            </p>
          </div>

          {attachments.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {attachments.map((photo) => (
                <ObjectPhotoCard
                  key={photo.id}
                  id={photo.id}
                  image={photo.image}
                  alt={`Р¤РѕС‚Рѕ ${photo.position}`}
                  kind="attachment"
                  refreshPaths={refreshPaths}
                  onDeleted={handleAttachmentDeleted}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Р”РѕРґР°С‚РєРѕРІРёС… С„РѕС‚Рѕ С‰Рµ РЅРµРјР°С”.
            </div>
          )}

          <ObjectAttachmentsUploadForm
            target={target}
            refreshPaths={refreshPaths}
            onUploaded={handleAttachmentsUploaded}
          />
        </section>
      ) : null}
    </section>
  );
}
