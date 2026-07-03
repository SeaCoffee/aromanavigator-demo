'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useState, useTransition } from 'react';

import { deleteArticleAction } from '@/app/actions/articleActions';
import { messageToText } from '@/app/components/articles/articleMessages';
import type { ID } from '@/app/types/http';

type Props = {
  articleId: ID;
  onDeleted?: () => void;
};

export default function ArticleDeleteButton({
  articleId,
  onDeleted,
}: Props) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setMessage('');

    startTransition(async () => {
      const result = await deleteArticleAction(articleId);

      if (!result.ok) {
        setMessage(messageToText(result.msg));
        return;
      }

      onDeleted?.();
    });
  }

  return (
    <div className="grid gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className={`${buttonStyles.compactDanger}`}
      >
        {isPending ? 'Р’РёРґР°Р»РµРЅРЅСЏ...' : 'Р’РёРґР°Р»РёС‚Рё'}
      </button>

      {message ? <p className="text-xs text-red-600">{message}</p> : null}
    </div>
  );
}
