'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useState, useTransition } from 'react';

import {
  deleteObjectAttachmentAction,
  deleteObjectCoverAction,
} from '@/app/actions/objectPhotoActions';
import MediaImage from '@/app/components/images/MediaImage';

import type { ID } from '@/app/types/http';

type ObjectPhotoKind = 'cover' | 'attachment';

type ObjectPhotoCardProps = {
  id: ID;
  image: string;
  alt: string;
  kind: ObjectPhotoKind;
  refreshPaths?: string[];
  onDeleted?: (id: ID) => void;
};

export function ObjectPhotoCard({
  id,
  image,
  alt,
  kind,
  refreshPaths = [],
  onDeleted,
}: ObjectPhotoCardProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setActionError(null);

    startTransition(() => {
      const action =
        kind === 'cover'
          ? deleteObjectCoverAction
          : deleteObjectAttachmentAction;

      void action(id, refreshPaths).then((result) => {
        if (!result.ok) {
          setActionError(result.error);
          return;
        }

        onDeleted?.(id);
      });
    });
  };

  return (
    <article className="grid gap-2">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <MediaImage
          src={image}
          alt={alt}
          className="h-full w-full object-cover"
          fallbackClassName="flex h-full items-center justify-center p-4 text-center text-sm text-slate-400"
          fallback="Р¤РѕС‚Рѕ РЅРµРґРѕСЃС‚СѓРїРЅРµ"
        />
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className={`${buttonStyles.compactDanger}`}
      >
        {isPending ? 'Р’РёРґР°Р»СЏС”РјРѕ...' : 'Р’РёРґР°Р»РёС‚Рё'}
      </button>

      {actionError ? (
        <p className="text-sm text-red-600">{actionError}</p>
      ) : null}
    </article>
  );
}
