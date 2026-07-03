'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import {
  createArticleAction,
  updateArticleAction,
} from '@/app/actions/articleActions';
import {
  deleteObjectAttachmentAction,
  deleteObjectCoverAction,
} from '@/app/actions/objectPhotoActions';
import { messageToText } from '@/app/components/articles/articleMessages';
import { articleFormStyles as styles } from '@/app/components/articles/articleForm.styles';
import MediaImage from '@/app/components/images/MediaImage';
import {
  ARTICLE_AUTHOR_STATUS_OPTIONS,
  ARTICLE_DEFAULT_STATUS,
} from '@/app/constants/articleConstants';
import type { ArticleDetail, ArticleStatus } from '@/app/types/articleTypes';
import type { ObjectAttachmentPhoto } from '@/app/types/photoTypes';
import {
  articlePhotoToken,
  pendingArticlePhotoToken,
  removeArticlePhoto,
  removePendingArticlePhoto,
} from '@/app/utils/articleContentUtils';
import {
  MAX_ATTACHMENTS_PER_UPLOAD,
  PHOTO_INPUT_ACCEPT,
  validateImageFile,
} from '@/app/utils/photoActionUtils';

type ArticleFormValues = {
  title: string;
  content: string;
  status: ArticleStatus;
  tag_names: string;
};

type Props = {
  mode: 'create' | 'edit';
  initialArticle?: ArticleDetail | null;
  successHref?: string | null;
  successLinkLabel?: string;
};

type PreviewBlock =
  | {
      kind: 'text';
      key: string;
      value: string;
    }
  | {
      kind: 'photo';
      key: string;
      src: string | null;
      alt: string;
      fallback: string;
    };

const ARTICLE_EDITABLE_PHOTO_TOKEN_RE =
  /\[\[(article-photo|article-upload):(\d+)\]\]/g;

function defaultValues(article?: ArticleDetail | null): ArticleFormValues {
  return {
    title: article?.title ?? '',
    content: article?.content ?? '',
    status: article?.status === 'pending' ? 'pending' : ARTICLE_DEFAULT_STATUS,
    tag_names: article?.tags.map((tag) => tag.name).join(', ') ?? '',
  };
}

function splitTags(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((tag) => tag.trim().replace(/\s+/g, ' '))
        .filter(Boolean),
    ),
  );
}

function buildPreviewBlocks({
  content,
  photos,
  pendingImageUrls,
}: {
  content: string;
  photos: ObjectAttachmentPhoto[];
  pendingImageUrls: string[];
}): PreviewBlock[] {
  const photoMap = new Map(photos.map((photo) => [String(photo.id), photo]));
  const blocks: PreviewBlock[] = [];

  let cursor = 0;

  for (const match of content.matchAll(ARTICLE_EDITABLE_PHOTO_TOKEN_RE)) {
    const tokenIndex = match.index ?? 0;
    const text = content.slice(cursor, tokenIndex);

    if (text) {
      blocks.push({
        kind: 'text',
        key: `text-${cursor}`,
        value: text,
      });
    }

    const tokenKind = match[1];
    const rawId = match[2];

    if (tokenKind === 'article-photo') {
      const photo = photoMap.get(rawId);

      blocks.push({
        kind: 'photo',
        key: `article-photo-${rawId}-${tokenIndex}`,
        src: photo?.image ?? null,
        alt: `Р¤РѕС‚Рѕ СЃС‚Р°С‚С‚С– ${rawId}`,
        fallback: `Р¤РѕС‚Рѕ #${rawId} РЅРµРґРѕСЃС‚СѓРїРЅРµ`,
      });
    }

    if (tokenKind === 'article-upload') {
      const pendingIndex = Number(rawId);
      const src = Number.isInteger(pendingIndex)
        ? pendingImageUrls[pendingIndex] ?? null
        : null;

      blocks.push({
        kind: 'photo',
        key: `article-upload-${rawId}-${tokenIndex}`,
        src,
        alt: `РќРѕРІРµ С„РѕС‚Рѕ ${pendingIndex + 1}`,
        fallback: `РќРѕРІРµ С„РѕС‚Рѕ #${pendingIndex + 1} С‰Рµ РЅРµ Р·Р°РІР°РЅС‚Р°Р¶РµРЅРµ`,
      });
    }

    cursor = tokenIndex + match[0].length;
  }

  const tail = content.slice(cursor);

  if (tail) {
    blocks.push({
      kind: 'text',
      key: `text-${cursor}`,
      value: tail,
    });
  }

  return blocks;
}

function ArticlePreview({
  content,
  photos,
  pendingImageUrls,
}: {
  content: string;
  photos: ObjectAttachmentPhoto[];
  pendingImageUrls: string[];
}) {
  const blocks = buildPreviewBlocks({
    content,
    photos,
    pendingImageUrls,
  });

  if (!content.trim()) {
    return (
      <p className={styles.emptyMedia}>
        РўСѓС‚ Р·вЂ™СЏРІРёС‚СЊСЃСЏ РїРѕРїРµСЂРµРґРЅС–Р№ РїРµСЂРµРіР»СЏРґ СЃС‚Р°С‚С‚С–.
      </p>
    );
  }

  return (
    <div className={styles.previewContent}>
      {blocks.map((block) =>
        block.kind === 'photo' ? (
          <figure key={block.key} className={styles.previewFigure}>
            <MediaImage
              src={block.src}
              alt={block.alt}
              className={styles.previewImage}
              fallbackClassName={styles.previewFallback}
              fallback={block.fallback}
            />
          </figure>
        ) : (
          <div key={block.key} className={styles.previewTextBlock}>
            {block.value}
          </div>
        ),
      )}
    </div>
  );
}

export default function ArticleForm({
  mode,
  initialArticle = null,
  successHref = null,
  successLinkLabel = 'РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ РґРѕ СЃС‚Р°С‚РµР№',
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [savedArticle, setSavedArticle] =
    useState<ArticleDetail | null>(initialArticle);
  const [cover, setCover] = useState<File | null>(null);
  const [inlineImages, setInlineImages] = useState<File[]>([]);
  const [inlineImageUrls, setInlineImageUrls] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<ArticleFormValues>({
    defaultValues: defaultValues(initialArticle),
  });

  const contentValue = watch('content') ?? '';

  useEffect(() => {
    const urls = inlineImages.map((image) => URL.createObjectURL(image));

    setInlineImageUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [inlineImages]);

  const contentField = register('content', {
    required: 'Р”РѕРґР°Р№С‚Рµ С‚РµРєСЃС‚ СЃС‚Р°С‚С‚С–.',
  });

  const hasExistingAttachments = Boolean(savedArticle?.attachments?.length);
  const submitDisabled =
    isPending || (mode === 'edit' && !isDirty && !cover && inlineImages.length === 0);

  function insertToken(token: string) {
    const textarea = textareaRef.current;
    const content = getValues('content');
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? start;
    const prefix = start > 0 && content[start - 1] !== '\n' ? '\n\n' : '';
    const suffix = content[end] && content[end] !== '\n' ? '\n\n' : '';
    const next = `${content.slice(0, start)}${prefix}${token}${suffix}${content.slice(end)}`;

    setValue('content', next, {
      shouldDirty: true,
      shouldValidate: true,
    });

    requestAnimationFrame(() => {
      const cursor = start + prefix.length + token.length + suffix.length;

      textarea?.focus();
      textarea?.setSelectionRange(cursor, cursor);
    });
  }

  function addInlineImages(files: FileList | null) {
    const selected = Array.from(files ?? []);
    const remainingSlots = Math.max(
      0,
      MAX_ATTACHMENTS_PER_UPLOAD - inlineImages.length,
    );
    const withinLimit = selected.slice(0, remainingSlots);
    const nextFiles = withinLimit.filter((file) => !validateImageFile(file));

    if (selected.length > remainingSlots) {
      setMessage('Р”Рѕ СЃС‚Р°С‚С‚С– РјРѕР¶РЅР° РґРѕРґР°С‚Рё РЅРµ Р±С–Р»СЊС€Рµ 10 РЅРѕРІРёС… С„РѕС‚Рѕ Р·Р° РѕРґРёРЅ СЂР°Р·.');
      setIsSuccess(false);
    } else if (nextFiles.length !== selected.length) {
      const invalidFile = selected.find((file) => validateImageFile(file));

      setMessage(
        invalidFile
          ? validateImageFile(invalidFile) ?? 'РќРµРєРѕСЂРµРєС‚РЅРµ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.'
          : 'РќРµРєРѕСЂРµРєС‚РЅРµ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.',
      );
      setIsSuccess(false);
    }

    setInlineImages((current) => [...current, ...nextFiles]);
  }

  function removeInlineImage(index: number) {
    setInlineImages((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );

    setValue('content', removePendingArticlePhoto(getValues('content'), index), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function clearCoverSelection() {
    setCover(null);

    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  }

  function deleteSavedCover() {
    const currentCover = savedArticle?.cover;

    if (!currentCover || !savedArticle) {
      return;
    }

    setMessage('');
    setIsSuccess(false);

    startTransition(async () => {
      const result = await deleteObjectCoverAction(currentCover.id, [
        `/me/articles/${savedArticle.id}/edit`,
        `/articles/${savedArticle.id}`,
      ]);

      if (!result.ok) {
        setMessage(result.error);
        return;
      }

      setSavedArticle((current) =>
        current ? { ...current, cover: null } : current,
      );
      setMessage('РћР±РєР»Р°РґРёРЅРєСѓ РІРёРґР°Р»РµРЅРѕ.');
      setIsSuccess(true);
    });
  }

  function deleteSavedAttachment(photo: ObjectAttachmentPhoto) {
    if (!savedArticle) {
      return;
    }

    setMessage('');
    setIsSuccess(false);

    startTransition(async () => {
      const result = await deleteObjectAttachmentAction(photo.id, [
        `/me/articles/${savedArticle.id}/edit`,
        `/articles/${savedArticle.id}`,
      ]);

      if (!result.ok) {
        setMessage(result.error);
        return;
      }

      setSavedArticle((current) =>
        current
          ? {
              ...current,
              attachments: current.attachments.filter(
                (item) => String(item.id) !== String(photo.id),
              ),
            }
          : current,
      );
      setValue(
        'content',
        removeArticlePhoto(getValues('content'), photo.id),
        { shouldDirty: true },
      );
      setMessage('Р¤РѕС‚Рѕ РІРёРґР°Р»РµРЅРѕ.');
      setIsSuccess(true);
    });
  }

  function onSubmit(values: ArticleFormValues) {
    const formData = new FormData();

    formData.set('title', values.title);
    formData.set('content', values.content);
    formData.set('status', values.status);

    splitTags(values.tag_names).forEach((tag) => {
      formData.append('tag_names', tag);
    });

    if (cover) {
      formData.set('cover', cover);
    }

    inlineImages.forEach((image) => {
      formData.append('inline_images', image);
    });

    setMessage('');
    setIsSuccess(false);

    startTransition(async () => {
      const result =
        mode === 'edit' && initialArticle
          ? await updateArticleAction(initialArticle.id, formData)
          : await createArticleAction(formData);

      if (!result.ok) {
        setMessage(messageToText(result.msg));
        return;
      }

      const nextArticle = result.data ?? initialArticle;

      setMessage(messageToText(result.msg));
      setIsSuccess(true);
      setSavedArticle(nextArticle);
      setCover(null);
      setInlineImages([]);
      reset(defaultValues(nextArticle));

      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>РћСЃРЅРѕРІРЅРµ</h2>
          <p className={styles.panelText}>
            РќР°Р·РІР°, РѕР±РєР»Р°РґРёРЅРєР° С– РєРѕСЂРѕС‚РєР° РїС–РґРіРѕС‚РѕРІРєР° РјР°С‚РµСЂС–Р°Р»Сѓ.
          </p>
        </div>

        <div className={styles.field}>
          <label htmlFor="article-title" className={styles.label}>
            Р—Р°РіРѕР»РѕРІРѕРє
          </label>

          <input
            id="article-title"
            maxLength={200}
            {...register('title', {
              required: 'Р’РєР°Р¶С–С‚СЊ Р·Р°РіРѕР»РѕРІРѕРє СЃС‚Р°С‚С‚С–.',
              maxLength: {
                value: 200,
                message: 'РњР°РєСЃРёРјСѓРј 200 СЃРёРјРІРѕР»С–РІ.',
              },
            })}
            className={styles.input}
          />

          {errors.title?.message ? (
            <p className={styles.error}>{errors.title.message}</p>
          ) : null}
        </div>

        <div className={styles.coverGrid}>
          <div className={styles.coverPreview}>
            {savedArticle?.cover?.image ? (
              <MediaImage
                src={savedArticle.cover.image}
                alt="РџРѕС‚РѕС‡РЅР° РѕР±РєР»Р°РґРёРЅРєР° СЃС‚Р°С‚С‚С–"
                className={styles.coverImage}
                fallbackClassName={styles.coverFallback}
                fallback="РћР±РєР»Р°РґРёРЅРєР° РЅРµРґРѕСЃС‚СѓРїРЅР°"
              />
            ) : (
              <div className={styles.coverFallback}>РћР±РєР»Р°РґРёРЅРєСѓ С‰Рµ РЅРµ РґРѕРґР°РЅРѕ</div>
            )}
          </div>

          <div className={styles.coverTools}>
            <div className={styles.field}>
              <label htmlFor="article-cover" className={styles.label}>
                РћР±РєР»Р°РґРёРЅРєР°
              </label>

              <input
                ref={coverInputRef}
                id="article-cover"
                type="file"
                accept={PHOTO_INPUT_ACCEPT}
                onChange={(event) => {
                  const image = event.target.files?.item(0) ?? null;

                  const validationError = image
                    ? validateImageFile(image)
                    : null;

                  if (image && validationError) {
                    setMessage(validationError);
                    setIsSuccess(false);
                    setCover(null);
                    event.target.value = '';
                    return;
                  }

                  setCover(image);
                }}
                className={styles.fileInput}
              />

              <p className={styles.hint}>
                {cover
                  ? `Р‘СѓРґРµ Р·Р°РІР°РЅС‚Р°Р¶РµРЅРѕ РЅРѕРІСѓ РѕР±РєР»Р°РґРёРЅРєСѓ: ${cover.name}`
                  : savedArticle?.cover
                    ? 'РџРѕС‚РѕС‡РЅР° РѕР±РєР»Р°РґРёРЅРєР° Р·Р°Р»РёС€РёС‚СЊСЃСЏ Р±РµР· Р·РјС–РЅ.'
                    : 'РћР±РєР»Р°РґРёРЅРєР° РЅРµРѕР±РѕРІвЂ™СЏР·РєРѕРІР°.'}
              </p>
            </div>

            {cover ? (
              <button
                type="button"
                onClick={clearCoverSelection}
                className={styles.ghostButton}
              >
                РЎРєР°СЃСѓРІР°С‚Рё РІРёР±С–СЂ РѕР±РєР»Р°РґРёРЅРєРё
              </button>
            ) : null}

            {!cover && savedArticle?.cover ? (
              <button
                type="button"
                disabled={isPending}
                onClick={deleteSavedCover}
                className={styles.removeButton}
              >
                Р’РёРґР°Р»РёС‚Рё РїРѕС‚РѕС‡РЅСѓ РѕР±РєР»Р°РґРёРЅРєСѓ
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>РўРµРєСЃС‚ С– С„РѕС‚Рѕ</h2>
          <p className={styles.panelText}>
            РЈ РїРѕР»С– СЂРµРґР°РіСѓРІР°РЅРЅСЏ С„РѕС‚Рѕ РїРѕР·РЅР°С‡Р°СЋС‚СЊСЃСЏ СЃР»СѓР¶Р±РѕРІРёРјРё РІСЃС‚Р°РІРєР°РјРё. РЈ
            РїРѕРїРµСЂРµРґРЅСЊРѕРјСѓ РїРµСЂРµРіР»СЏРґС– РЅРёР¶С‡Рµ РІРѕРЅРё РїРѕРєР°Р·СѓСЋС‚СЊСЃСЏ СЏРє СЂРµР°Р»СЊРЅС– Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.
          </p>
        </div>

        <div className={styles.field}>
          <label htmlFor="article-content" className={styles.label}>
            РўРµРєСЃС‚ СЃС‚Р°С‚С‚С–
          </label>

          <textarea
            id="article-content"
            {...contentField}
            ref={(element) => {
              contentField.ref(element);
              textareaRef.current = element;
            }}
            className={styles.textarea}
          />

          <p className={styles.tokenHint}>
            Р’СЃС‚Р°РІРєРё РЅР° РєС€С‚Р°Р»С‚ <code className={styles.code}>[[article-photo:6]]</code>{' '}
            вЂ” С†Рµ РјС–СЃС†СЏ С„РѕС‚Рѕ. РЈ СЃС‚Р°С‚С‚С– РІРѕРЅРё Р±СѓРґСѓС‚СЊ Р·Р°РјС–РЅРµРЅС– РЅР° Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.
          </p>

          {errors.content?.message ? (
            <p className={styles.error}>{errors.content.message}</p>
          ) : null}
        </div>

        <div className={styles.innerPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.innerTitle}>Р¤РѕС‚Рѕ РґР»СЏ РІСЃС‚Р°РІРєРё РІ С‚РµРєСЃС‚</h3>
            <p className={styles.hint}>
              РќРѕРІС– С„РѕС‚Рѕ Р·Р°РІР°РЅС‚Р°Р¶Р°С‚СЊСЃСЏ РїС–Рґ С‡Р°СЃ Р·Р±РµСЂРµР¶РµРЅРЅСЏ СЃС‚Р°С‚С‚С–. Р©РѕР± РІСЃС‚Р°РІРёС‚Рё
              С„РѕС‚Рѕ, РїРѕСЃС‚Р°РІС‚Рµ РєСѓСЂСЃРѕСЂ Сѓ С‚РµРєСЃС‚С– Р№ РЅР°С‚РёСЃРЅС–С‚СЊ В«Р’СЃС‚Р°РІРёС‚Рё РІ С‚РµРєСЃС‚В».
            </p>
          </div>

          <input
            type="file"
            multiple
            accept={PHOTO_INPUT_ACCEPT}
            onChange={(event) => {
              addInlineImages(event.target.files);
              event.target.value = '';
            }}
            className={styles.fileInput}
          />

          {inlineImages.length ? (
            <div className={styles.mediaGroup}>
              <p className={styles.mediaGroupTitle}>РќРѕРІС– С„РѕС‚Рѕ</p>

              <div className={styles.mediaList}>
                {inlineImages.map((image, index) => (
                  <div
                    key={`${image.name}-${image.lastModified}-${index}`}
                    className={styles.mediaItem}
                  >
                    <span className={styles.mediaPlaceholder} aria-hidden="true">
                      Р¤РѕС‚Рѕ
                    </span>

                    <span className={styles.mediaName}>{image.name}</span>

                    <button
                      type="button"
                      onClick={() => insertToken(pendingArticlePhotoToken(index))}
                      className={styles.smallButton}
                    >
                      Р’СЃС‚Р°РІРёС‚Рё РІ С‚РµРєСЃС‚
                    </button>

                    <button
                      type="button"
                      onClick={() => removeInlineImage(index)}
                      className={styles.removeButton}
                      aria-label={`РџСЂРёР±СЂР°С‚Рё ${image.name}`}
                    >
                      Г—
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {hasExistingAttachments ? (
            <div className={styles.mediaGroup}>
              <p className={styles.mediaGroupTitle}>Р’Р¶Рµ Р·Р°РІР°РЅС‚Р°Р¶РµРЅС– С„РѕС‚Рѕ</p>

              <div className={styles.mediaList}>
                {savedArticle?.attachments.map((photo) => (
                  <div key={photo.id} className={styles.mediaItem}>
                    <MediaImage
                      src={photo.image}
                      alt="Р¤РѕС‚Рѕ СЃС‚Р°С‚С‚С–"
                      className={styles.mediaThumb}
                      fallbackClassName={styles.mediaThumb}
                      fallback=""
                    />

                    <span className={styles.mediaName}>Р¤РѕС‚Рѕ #{photo.id}</span>

                    <button
                      type="button"
                      onClick={() => insertToken(articlePhotoToken(photo.id))}
                      className={styles.smallButton}
                    >
                      Р’СЃС‚Р°РІРёС‚Рё РІ С‚РµРєСЃС‚
                    </button>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => deleteSavedAttachment(photo)}
                      className={styles.removeButton}
                    >
                      Р’РёРґР°Р»РёС‚Рё С„РѕС‚Рѕ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!inlineImages.length && !hasExistingAttachments ? (
            <p className={styles.emptyMedia}>
              Р¤РѕС‚Рѕ РґР»СЏ РІСЃС‚Р°РІРєРё РІ С‚РµРєСЃС‚ С‰Рµ РЅРµ РґРѕРґР°РЅРѕ.
            </p>
          ) : null}
        </div>

        <div className={styles.previewPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.innerTitle}>РџРѕРїРµСЂРµРґРЅС–Р№ РїРµСЂРµРіР»СЏРґ</h3>
            <p className={styles.hint}>
              РўСѓС‚ РІРёРґРЅРѕ, СЏРє С‚РµРєСЃС‚ С– С„РѕС‚Рѕ РІРёРіР»СЏРґР°С‚РёРјСѓС‚СЊ Сѓ СЃС‚Р°С‚С‚С–.
            </p>
          </div>

          <ArticlePreview
            content={contentValue}
            photos={savedArticle?.attachments ?? []}
            pendingImageUrls={inlineImageUrls}
          />
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>РџСѓР±Р»С–РєР°С†С–СЏ</h2>
          <p className={styles.panelText}>
            РўРµРіРё РґРѕРїРѕРјР°РіР°СЋС‚СЊ Р·РЅР°Р№С‚Рё СЃС‚Р°С‚С‚СЋ, Р° СЃС‚Р°С‚СѓСЃ РІРёР·РЅР°С‡Р°С”, С‡Рё Р·Р°Р»РёС€РёС‚СЊСЃСЏ РІРѕРЅР°
            С‡РµСЂРЅРµС‚РєРѕСЋ, С‡Рё РїС–РґРµ РЅР° РјРѕРґРµСЂР°С†С–СЋ.
          </p>
        </div>

        <div className={styles.twoColumns}>
          <div className={styles.field}>
            <label htmlFor="article-tags" className={styles.label}>
              РўРµРіРё
            </label>

            <input
              id="article-tags"
              placeholder="РїР°СЂС„СѓРјРё, РѕРіР»СЏРґ, РЅС–С€РµРІС– Р°СЂРѕРјР°С‚Рё"
              {...register('tag_names')}
              className={styles.input}
            />

            <p className={styles.hint}>
              Р’РєР°Р¶С–С‚СЊ С‚РµРіРё С‡РµСЂРµР· РєРѕРјСѓ. РњР°РєСЃРёРјСѓРј 12 С‚РµРіС–РІ.
            </p>
          </div>

          <div className={styles.field}>
            <label htmlFor="article-status" className={styles.label}>
              РЎС‚Р°С‚СѓСЃ
            </label>

            <select
              id="article-status"
              {...register('status')}
              className={styles.input}
            >
              {ARTICLE_AUTHOR_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {savedArticle?.moderator_comment ? (
        <div className={`${styles.message} ${styles.failure}`}>
          <strong>РљРѕРјРµРЅС‚Р°СЂ РјРѕРґРµСЂР°С‚РѕСЂР°</strong>
          <p>{savedArticle.moderator_comment}</p>
        </div>
      ) : null}

      {message ? (
        <p className={`${styles.message} ${isSuccess ? styles.success : styles.failure}`}>
          {message}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button type="submit" disabled={submitDisabled} className={styles.submit}>
          {isPending
            ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...'
            : mode === 'create'
              ? 'РЎС‚РІРѕСЂРёС‚Рё СЃС‚Р°С‚С‚СЋ'
              : 'Р—Р±РµСЂРµРіС‚Рё Р·РјС–РЅРё'}
        </button>

        {successHref ? (
          <Link href={successHref} className={styles.link}>
            {successLinkLabel}
          </Link>
        ) : null}
      </div>
    </form>
  );
}
