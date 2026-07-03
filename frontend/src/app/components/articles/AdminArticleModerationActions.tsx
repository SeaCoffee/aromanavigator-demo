'use client';

import { useState, useTransition } from 'react';

import {
  publishArticleAction,
  rejectArticleAction,
} from '@/app/actions/articleActions';
import { messageToText } from '@/app/components/articles/articleMessages';
import { buttonStyles } from '@/app/components/common/buttonStyles';
import type { ID } from '@/app/types/http';

type Props = {
  articleId: ID;
  onChanged?: () => void;
};

export default function AdminArticleModerationActions({
  articleId,
  onChanged,
}: Props) {
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function publish() {
    setMessage('');

    startTransition(async () => {
      const result = await publishArticleAction(articleId);

      if (!result.ok) {
        setMessage(messageToText(result.msg));
        return;
      }

      setMessage(messageToText(result.msg));
      onChanged?.();
    });
  }

  function reject() {
    setMessage('');

    startTransition(async () => {
      const result = await rejectArticleAction(articleId, {
        moderator_comment: comment,
      });

      if (!result.ok) {
        setMessage(messageToText(result.msg));
        return;
      }

      setMessage(messageToText(result.msg));
      onChanged?.();
    });
  }

  return (
    <div className="grid gap-2">
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={2}
        placeholder="РљРѕРјРµРЅС‚Р°СЂ РґР»СЏ РІС–РґС…РёР»РµРЅРЅСЏ"
        className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={publish}
          className={buttonStyles.compactPrimary}
        >
          РћРїСѓР±Р»С–РєСѓРІР°С‚Рё
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={reject}
          className={buttonStyles.compactDanger}
        >
          Р’С–РґС…РёР»РёС‚Рё
        </button>
      </div>

      {message ? <p className="text-xs text-gray-600">{message}</p> : null}
    </div>
  );
}
