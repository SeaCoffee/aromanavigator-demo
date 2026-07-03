'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useState, useTransition } from 'react';

import { deleteWardrobeItemAction } from '@/app/actions/wardrobeActions';
import { wardrobeStyles as s } from '@/app/components/wardrobe/wardrobe.styles';
import { messageToText } from '@/app/components/wardrobe/wardrobeMessages';
import type { ID } from '@/app/types/http';

type Props = {
  itemId: ID;
  onDeleted?: () => void;
  variant?: 'button' | 'icon';
  label?: string;
};

export default function WardrobeDeleteButton({
  itemId,
  onDeleted,
  variant = 'button',
  label = 'Р’РёРґР°Р»РёС‚Рё',
}: Props) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setMessage('');

    startTransition(async () => {
      const result = await deleteWardrobeItemAction(itemId);

      if (!result.ok) {
        setMessage(messageToText(result.msg));
        return;
      }

      onDeleted?.();
    });
  }

  if (variant === 'icon') {
    return (
      <span className={s.deleteWrap}>
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className={s.deleteIconButton}
          aria-label={label}
          title={label}
        >
          Г—
        </button>

        {message ? <span className={s.deleteMessage}>{message}</span> : null}
      </span>
    );
  }

  return (
    <div className="grid gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className={`${buttonStyles.danger}`}
      >
        {isPending ? 'Р’РёРґР°Р»РµРЅРЅСЏ...' : label}
      </button>

      {message ? <p className={s.deleteMessage}>{message}</p> : null}
    </div>
  );
}
