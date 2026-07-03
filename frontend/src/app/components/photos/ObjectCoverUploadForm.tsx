'use client';

import { useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { uploadObjectCoverAction } from '@/app/actions/objectPhotoActions';
import { buttonStyles } from '@/app/components/common/buttonStyles';
import {
  appendRefreshPaths,
  PHOTO_INPUT_ACCEPT,
  validateImageFile,
} from '@/app/utils/photoActionUtils';
import { appendPhotoTarget } from '@/app/utils/photoTargetUtils';

import type { ObjectCover, PhotoTarget } from '@/app/types/photoTypes';

type CoverFormValues = {
  image: FileList;
};

type ObjectCoverUploadFormProps = {
  target: PhotoTarget;
  refreshPaths?: string[];
  onUploaded?: (cover: ObjectCover) => void;
};

export function ObjectCoverUploadForm({
  target,
  refreshPaths = [],
  onUploaded,
}: ObjectCoverUploadFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CoverFormValues>();

  const onSubmit = handleSubmit((values) => {
    const image = values.image?.item(0);

    if (!image) {
      setActionError('РћР±РµСЂС–С‚СЊ С„РѕС‚Рѕ.');
      return;
    }

    const validationError = validateImageFile(image);

    if (validationError) {
      setActionError(validationError);
      return;
    }

    const formData = new FormData();

    appendPhotoTarget(formData, target);
    appendRefreshPaths(formData, refreshPaths);
    formData.set('image', image);

    setMessage(null);
    setActionError(null);

    startTransition(() => {
      void uploadObjectCoverAction(formData).then((result) => {
        if (!result.ok) {
          setActionError(result.error);
          return;
        }

        onUploaded?.(result.data);
        setMessage(result.message ?? 'РћР±РєР»Р°РґРёРЅРєСѓ РѕРЅРѕРІР»РµРЅРѕ.');

        reset();
        formRef.current?.reset();
      });
    });
  });

  return (
    <form ref={formRef} className="grid gap-3" onSubmit={onSubmit}>
      <div className="grid gap-1.5">
        <label
          htmlFor="object-cover-image"
          className="text-sm font-medium text-slate-800"
        >
          Р—Р°РІР°РЅС‚Р°Р¶РёС‚Рё РѕР±РєР»Р°РґРёРЅРєСѓ
        </label>

        <input
          id="object-cover-image"
          type="file"
          accept={PHOTO_INPUT_ACCEPT}
          disabled={isPending}
          className={buttonStyles.fileInput}
          {...register('image', {
            required: 'РћР±РµСЂС–С‚СЊ С„РѕС‚Рѕ.',
            validate: (files) => {
              const image = files?.item(0);

              if (!image) {
                return 'РћР±РµСЂС–С‚СЊ С„РѕС‚Рѕ.';
              }

              return validateImageFile(image) ?? true;
            },
          })}
        />

        {errors.image?.message ? (
          <p className="text-sm text-red-600">{errors.image.message}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={`${buttonStyles.compactPrimary}`}
        >
          {isPending ? 'Р—Р°РІР°РЅС‚Р°Р¶СѓС”РјРѕ...' : 'Р—Р°РІР°РЅС‚Р°Р¶РёС‚Рё РѕР±РєР»Р°РґРёРЅРєСѓ'}
        </button>
      </div>

      {actionError ? (
        <p className="text-sm text-red-600">{actionError}</p>
      ) : null}

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
    </form>
  );
}
