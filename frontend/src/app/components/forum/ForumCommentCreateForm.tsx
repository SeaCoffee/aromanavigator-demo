'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { createCommentFormAction } from '@/app/actions/commentActions';
import type { ForumComment } from '@/app/types/forumTypes';
import { PHOTO_INPUT_ACCEPT } from '@/app/utils/photoActionUtils';

import { forumCommentStyles } from './forumStyles';
import { normalizeActionMessage } from './forumUtils';

type FormValues = {
  body: string;
};

type Props = {
  topicId: number;
  refreshPaths?: string[];
  parentId?: number | null;
  onCreated?: (comment: ForumComment) => void;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
  loginHref?: string;
  canPublishOfficial?: boolean;
};

export default function ForumCommentCreateForm({
  topicId,
  refreshPaths,
  parentId = null,
  onCreated,
  placeholder = 'РќР°РїРёС€С–С‚СЊ РєРѕРјРµРЅС‚Р°СЂ...',
  submitLabel = 'Р”РѕРґР°С‚Рё РєРѕРјРµРЅС‚Р°СЂ',
  compact = false,
  loginHref,
  canPublishOfficial = false,
}: Props) {
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [publishOfficial, setPublishOfficial] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      body: '',
    },
  });

  const bodyValue = watch('body') || '';

  const onSubmit = (values: FormValues) => {
    setServerMsg(null);

    const body = values.body.trim();

    if (!body) {
      setServerMsg('РљРѕРјРµРЅС‚Р°СЂ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїРѕСЂРѕР¶РЅС–Рј.');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();

      formData.set('target_app', 'forum');
      formData.set('target_model', 'forumtopicmodel');
      formData.set('target_id', String(topicId));
      formData.set('body', body);

      if (canPublishOfficial && publishOfficial) formData.set('is_official', 'true');

      if (parentId) {
        formData.set('parent_id', String(parentId));
      }

      for (const path of refreshPaths ?? []) {
        formData.append('refresh_path', path);
      }

      for (const image of images) {
        formData.append('images', image);
      }

      const result = await createCommentFormAction(null, formData);

      if (result.ok) {
        reset();
        setImages([]);
        setPublishOfficial(false);
        setFileInputKey((value) => value + 1);
        setServerMsg(result.msg ?? 'РљРѕРјРµРЅС‚Р°СЂ РґРѕРґР°РЅРѕ.');
        onCreated?.(result.data);
        return;
      }

      setServerMsg(normalizeActionMessage(result.msg));
    });
  };

  if (loginHref) {
    return (
      <div className={forumCommentStyles.loginPrompt}>
        <p className={forumCommentStyles.loginText}>
          РЈРІС–Р№РґС–С‚СЊ РІ Р°РєР°СѓРЅС‚, С‰РѕР± Р·Р°Р»РёС€РёС‚Рё РєРѕРјРµРЅС‚Р°СЂ.
        </p>

        <Link href={loginHref} className={forumCommentStyles.loginButton}>
          РЈРІС–Р№С‚Рё
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={compact ? forumCommentStyles.formCompact : forumCommentStyles.form}
    >
      <textarea
        {...register('body', {
          required: 'РљРѕРјРµРЅС‚Р°СЂ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїРѕСЂРѕР¶РЅС–Рј.',
          validate: (value) =>
            value.trim().length > 0 || 'РљРѕРјРµРЅС‚Р°СЂ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїРѕСЂРѕР¶РЅС–Рј.',
          maxLength: {
            value: 5000,
            message: 'РњР°РєСЃРёРјСѓРј 5000 СЃРёРјРІРѕР»С–РІ.',
          },
        })}
        placeholder={placeholder}
        className={[
          forumCommentStyles.textarea,
          compact
            ? forumCommentStyles.textareaCompact
            : forumCommentStyles.textareaDefault,
        ].join(' ')}
        disabled={isPending}
      />

      <label className={forumCommentStyles.photoField}>
        Р”РѕРґР°С‚Рё С„РѕС‚Рѕ
        <input
          key={fileInputKey}
          type="file"
          accept={PHOTO_INPUT_ACCEPT}
          multiple
          disabled={isPending}
          className={forumCommentStyles.fileInput}
          onChange={(event) => setImages(Array.from(event.target.files ?? []))}
        />
        {images.length ? <span>РћР±СЂР°РЅРѕ: {images.length}</span> : null}
      </label>

      {canPublishOfficial ? (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={publishOfficial}
            onChange={(event) => setPublishOfficial(event.target.checked)}
          />
          РћРїСѓР±Р»С–РєСѓРІР°С‚Рё РІС–Рґ РђРґРјС–РЅС–СЃС‚СЂР°С†С–С—
        </label>
      ) : null}

      <div className={forumCommentStyles.metaRow}>
        <div className={forumCommentStyles.counter}>
          {bodyValue.trim().length}/5000
          {parentId ? <span className="ml-2">РІС–РґРїРѕРІС–РґСЊ</span> : null}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={forumCommentStyles.submitButton}
        >
          {isPending ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...' : submitLabel}
        </button>
      </div>

      {errors.body ? (
        <div className={forumCommentStyles.error}>{errors.body.message}</div>
      ) : null}

      {serverMsg ? (
        <div
          className={
            serverMsg === 'РљРѕРјРµРЅС‚Р°СЂ РґРѕРґР°РЅРѕ.'
              ? forumCommentStyles.success
              : forumCommentStyles.error
          }
        >
          {serverMsg}
        </div>
      ) : null}
    </form>
  );
}
