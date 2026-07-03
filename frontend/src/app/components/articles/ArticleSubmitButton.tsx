'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useState, useTransition } from 'react';

import { submitArticleAction } from '@/app/actions/articleActions';
import { messageToText } from '@/app/components/articles/articleMessages';
import type { ID } from '@/app/types/http';

type Props = {
  articleId: ID;
  onSubmitted?: () => void;
};

export default function ArticleSubmitButton({
  articleId,
  onSubmitted,
}: Props) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmitArticle() {
    setMessage('');

    startTransition(async () => {
      const result = await submitArticleAction(articleId);

      if (!result.ok) {
        setMessage(messageToText(result.msg));
        return;
      }

      setMessage(messageToText(result.msg));
      onSubmitted?.();
    });
  }

  return (
    <div className="grid gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmitArticle}
        className={`${buttonStyles.compactSecondary}`}
      >
        {isPending ? 'Р’С–РґРїСЂР°РІР»РµРЅРЅСЏ...' : 'РќР° РјРѕРґРµСЂР°С†С–СЋ'}
      </button>

      {message ? <p className="text-xs text-gray-600">{message}</p> : null}
    </div>
  );
}
