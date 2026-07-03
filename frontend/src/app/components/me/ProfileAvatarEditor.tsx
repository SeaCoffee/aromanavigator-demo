'use client';

import { useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import {
  deleteObjectCoverAction,
  uploadObjectCoverAction,
} from '@/app/actions/objectPhotoActions';
import AvatarImage from '@/app/components/images/AvatarImage';
import { profileAvatarStyles as styles } from '@/app/components/me/profileAvatar.styles';
import type { ObjectCover, PhotoTarget } from '@/app/types/photoTypes';
import {
  appendRefreshPaths,
  PHOTO_INPUT_ACCEPT,
  validateImageFile,
} from '@/app/utils/photoActionUtils';
import { appendPhotoTarget } from '@/app/utils/photoTargetUtils';

type FormValues = {
  image: FileList;
};

type Props = {
  target: PhotoTarget;
  initialCover: ObjectCover | null;
  displayName: string;
  refreshPaths: string[];
};

export default function ProfileAvatarEditor({
  target,
  initialCover,
  displayName,
  refreshPaths,
}: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputId = 'profile-avatar-input';

  const [cover, setCover] = useState<ObjectCover | null>(initialCover);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const imageRegister = register('image', {
    required: 'РћР±РµСЂС–С‚СЊ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.',
    validate: (files) => {
      const image = files?.item(0);

      return image
        ? validateImageFile(image) ?? true
        : 'РћР±РµСЂС–С‚СЊ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.';
    },
    onChange: (event) => {
      const file = event.target.files?.item(0);

      setSelectedFileName(file?.name ?? '');
      setMessage('');
      setError('');
    },
  });

  const initial = displayName.trim().charAt(0).toUpperCase() || 'Рљ';

  const onSubmit = handleSubmit((values) => {
    const image = values.image?.item(0);

    const validationError = image
      ? validateImageFile(image)
      : 'РћР±РµСЂС–С‚СЊ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.';

    if (!image || validationError) {
      setError(validationError ?? 'РћР±РµСЂС–С‚СЊ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.');
      return;
    }

    const formData = new FormData();

    appendPhotoTarget(formData, target);
    appendRefreshPaths(formData, refreshPaths);
    formData.set('image', image);

    setMessage('');
    setError('');

    startTransition(() => {
      void uploadObjectCoverAction(formData).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        setCover(result.data);
        setMessage(cover ? 'РђРІР°С‚Р°СЂ РѕРЅРѕРІР»РµРЅРѕ.' : 'РђРІР°С‚Р°СЂ РґРѕРґР°РЅРѕ.');
        setSelectedFileName('');
        reset();
        formRef.current?.reset();
      });
    });
  });

  function removeAvatar() {
    if (!cover) {
      return;
    }

    setMessage('');
    setError('');

    startTransition(() => {
      void deleteObjectCoverAction(cover.id, refreshPaths).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        setCover(null);
        setSelectedFileName('');
        setMessage('РђРІР°С‚Р°СЂ РІРёРґР°Р»РµРЅРѕ.');
      });
    });
  }

  return (
    <section className={styles.shell} aria-labelledby="profile-avatar-title">
      <div className={styles.previewColumn}>
        <div className={styles.previewFrame}>
          <AvatarImage
            src={cover?.image}
            alt={`РђРІР°С‚Р°СЂ РєРѕСЂРёСЃС‚СѓРІР°С‡Р° ${displayName}`}
            initial={initial}
            className={styles.preview}
            fallbackClassName={styles.fallback}
          />
        </div>

        <p className={styles.previewHint}>
          Р РµРєРѕРјРµРЅРґРѕРІР°РЅРѕ РєРІР°РґСЂР°С‚РЅРµ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.
        </p>
      </div>

      <div className={styles.content}>
        <header className={styles.heading}>
          <p className={styles.kicker}>Р—РѕР±СЂР°Р¶РµРЅРЅСЏ РїСЂРѕС„С–Р»СЋ</p>

          <h2 id="profile-avatar-title" className={styles.title}>
            РђРІР°С‚Р°СЂ
          </h2>

          <p className={styles.text}>
            Р”РѕРґР°Р№С‚Рµ Р°Р±Рѕ Р·Р°РјС–РЅС–С‚СЊ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ РїСЂРѕС„С–Р»СЋ. Р’РѕРЅРѕ Р±СѓРґРµ РІС–РґРѕР±СЂР°Р¶Р°С‚РёСЃСЏ Сѓ
            РїСѓР±Р»С–С‡РЅРѕРјСѓ РїСЂРѕС„С–Р»С–, РїРѕРІС–РґРѕРјР»РµРЅРЅСЏС… С– РґРѕРїРёСЃР°С….
          </p>
        </header>

        <form ref={formRef} className={styles.form} onSubmit={onSubmit}>
          <input
            id={inputId}
            type="file"
            accept={PHOTO_INPUT_ACCEPT}
            disabled={isPending}
            className={styles.hiddenInput}
            aria-label="РћР±РµСЂС–С‚СЊ РЅРѕРІРёР№ Р°РІР°С‚Р°СЂ"
            {...imageRegister}
          />

          <div className={styles.uploadRow}>
            <label htmlFor={inputId} className={styles.fileButton}>
              Р’РёР±СЂР°С‚Рё Р·РѕР±СЂР°Р¶РµРЅРЅСЏ
            </label>

            <span className={styles.fileName}>
              {selectedFileName || 'Р¤Р°Р№Р» РЅРµ РІРёР±СЂР°РЅРѕ'}
            </span>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              disabled={isPending}
              className={styles.primaryButton}
            >
              {isPending
                ? 'Р—Р±РµСЂС–РіР°С”РјРѕ...'
                : cover
                  ? 'Р—Р°РјС–РЅРёС‚Рё Р°РІР°С‚Р°СЂ'
                  : 'Р”РѕРґР°С‚Рё Р°РІР°С‚Р°СЂ'}
            </button>

            {cover ? (
              <button
                type="button"
                disabled={isPending}
                onClick={removeAvatar}
                className={styles.removeButton}
              >
                Р’РёРґР°Р»РёС‚Рё
              </button>
            ) : null}
          </div>

          {errors.image?.message ? (
            <p className={styles.error}>{errors.image.message}</p>
          ) : null}

          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}
        </form>
      </div>
    </section>
  );
}
