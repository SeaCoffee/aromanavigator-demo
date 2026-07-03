'use client';

import { useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { uploadObjectAttachmentsAction } from '@/app/actions/objectPhotoActions';
import { buttonStyles } from '@/app/components/common/buttonStyles';
import {
  appendRefreshPaths,
  MAX_ATTACHMENTS_PER_UPLOAD,
  PHOTO_INPUT_ACCEPT,
  validateImageFile,
} from '@/app/utils/photoActionUtils';
import { appendPhotoTarget } from '@/app/utils/photoTargetUtils';

import type {
  ObjectAttachmentPhoto,
  PhotoTarget,
} from '@/app/types/photoTypes';

type AttachmentsFormValues = {
  images: FileList;
};

type ObjectAttachmentsUploadFormProps = {
  target: PhotoTarget;
  refreshPaths?: string[];
  onUploaded?: (photos: ObjectAttachmentPhoto[]) => void;
};

export function ObjectAttachmentsUploadForm({
  target,
  refreshPaths = [],
  onUploaded,
}: ObjectAttachmentsUploadFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttachmentsFormValues>();

  const onSubmit = handleSubmit((values) => {
    const images = Array.from(values.images ?? []).filter(
      (file) => file.size > 0,
    );

    if (images.length === 0) {
      setActionError('РћР±РµСЂС–С‚СЊ С…РѕС‡Р° Р± РѕРґРЅРµ С„РѕС‚Рѕ.');
      return;
    }

    if (images.length > MAX_ATTACHMENTS_PER_UPLOAD) {
      setActionError('Р—Р° РѕРґРёРЅ СЂР°Р· РјРѕР¶РЅР° Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РЅРµ Р±С–Р»СЊС€Рµ 10 Р·РѕР±СЂР°Р¶РµРЅСЊ.');
      return;
    }

    const invalidImage = images.find((image) => validateImageFile(image));

    if (invalidImage) {
      setActionError(validateImageFile(invalidImage) ?? 'РќРµРєРѕСЂРµРєС‚РЅРµ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.');
      return;
    }

    const formData = new FormData();

    appendPhotoTarget(formData, target);
    appendRefreshPaths(formData, refreshPaths);

    for (const image of images) {
      formData.append('images', image);
    }

    setMessage(null);
    setActionError(null);

    startTransition(() => {
      void uploadObjectAttachmentsAction(formData).then((result) => {
        if (!result.ok) {
          setActionError(result.error);
          return;
        }

        onUploaded?.(result.data);
        setMessage(result.message ?? 'Р¤РѕС‚Рѕ РґРѕРґР°РЅРѕ.');

        reset();
        formRef.current?.reset();
      });
    });
  });

  return (
    <form ref={formRef} className="grid gap-3" onSubmit={onSubmit}>
      <div className="grid gap-1.5">
        <label
          htmlFor="object-attachments-images"
          className="text-sm font-medium text-slate-800"
        >
          Р—Р°РІР°РЅС‚Р°Р¶РёС‚Рё РґРѕРґР°С‚РєРѕРІС– С„РѕС‚Рѕ
        </label>

        <input
          id="object-attachments-images"
          type="file"
          multiple
          accept={PHOTO_INPUT_ACCEPT}
          disabled={isPending}
          className={buttonStyles.fileInput}
          {...register('images', {
            required: 'РћР±РµСЂС–С‚СЊ С…РѕС‡Р° Р± РѕРґРЅРµ С„РѕС‚Рѕ.',
            validate: (files) => {
              if (!files || files.length === 0) {
                return 'РћР±РµСЂС–С‚СЊ С…РѕС‡Р° Р± РѕРґРЅРµ С„РѕС‚Рѕ.';
              }

              const images = Array.from(files).filter((file) => file.size > 0);

              if (images.length === 0) {
                return 'РћР±РµСЂС–С‚СЊ С…РѕС‡Р° Р± РѕРґРЅРµ С„РѕС‚Рѕ.';
              }

              if (images.length > MAX_ATTACHMENTS_PER_UPLOAD) {
                return 'Р—Р° РѕРґРёРЅ СЂР°Р· РјРѕР¶РЅР° Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РЅРµ Р±С–Р»СЊС€Рµ 10 Р·РѕР±СЂР°Р¶РµРЅСЊ.';
              }

              for (const image of images) {
                const validationError = validateImageFile(image);

                if (validationError) {
                  return validationError;
                }
              }

              return true;
            },
          })}
        />

        {errors.images?.message ? (
          <p className="text-sm text-red-600">{errors.images.message}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={`${buttonStyles.compactPrimary}`}
        >
          {isPending ? 'Р—Р°РІР°РЅС‚Р°Р¶СѓС”РјРѕ...' : 'Р”РѕРґР°С‚Рё С„РѕС‚Рѕ'}
        </button>
      </div>

      {actionError ? (
        <p className="text-sm text-red-600">{actionError}</p>
      ) : null}

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
    </form>
  );
}
