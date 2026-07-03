'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { updateCommentAction } from '@/app/actions/commentActions';
import type { ForumComment } from '@/app/types/forumTypes';

import { forumCommentStyles } from './forumStyles';
import { normalizeActionMessage } from './forumUtils';

type FormValues = {
  body: string;
};

type Props = {
  commentId: number;
  initialBody: string;
  refreshPaths?: string[];
  onSaved?: (comment: ForumComment) => void;
  onCancel?: () => void;
};

export default function ForumCommentEditForm({
  commentId,
  initialBody,
  refreshPaths,
  onSaved,
  onCancel,
}: Props) {
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      body: initialBody ?? '',
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
      const result = await updateCommentAction(
        commentId,
        { body },
        { refreshPaths },
      );

      if (result.ok) {
        setServerMsg(result.msg ?? 'РљРѕРјРµРЅС‚Р°СЂ РѕРЅРѕРІР»РµРЅРѕ.');
        onSaved?.(result.data);
        return;
      }

      setServerMsg(normalizeActionMessage(result.msg));
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={forumCommentStyles.form}>
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
        className={[
          forumCommentStyles.textarea,
          forumCommentStyles.textareaCompact,
        ].join(' ')}
        disabled={isPending}
      />

      <div className={forumCommentStyles.metaRow}>
        <div className={forumCommentStyles.counter}>
          {bodyValue.trim().length}/5000
        </div>

        <div className="flex items-center gap-2">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className={forumCommentStyles.smallButton}
            >
              РЎРєР°СЃСѓРІР°С‚Рё
            </button>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className={forumCommentStyles.submitButton}
          >
            {isPending ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...' : 'Р—Р±РµСЂРµРіС‚Рё'}
          </button>
        </div>
      </div>

      {errors.body ? (
        <div className={forumCommentStyles.error}>{errors.body.message}</div>
      ) : null}

      {serverMsg ? (
        <div
          className={
            serverMsg === 'РљРѕРјРµРЅС‚Р°СЂ РѕРЅРѕРІР»РµРЅРѕ.'
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
