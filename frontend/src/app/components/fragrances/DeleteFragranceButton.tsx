'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useState, useTransition } from 'react';

import { deleteFragranceAction } from '@/app/actions/fragranceActions';
import {
  actionResultMessage,
  isSuccessMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import { fragranceAdminLabels as labels } from '@/app/components/fragrances/fragranceAdminLabels';
import { messageClassName } from '@/app/components/fragrances/fragranceAdmin.styles';

import type { ID } from '@/app/types/http';

type DeleteFragranceButtonProps = {
  fragranceId: ID;
  onDeleted?: (id: ID) => void;
};

export default function DeleteFragranceButton({
  fragranceId,
  onDeleted,
}: DeleteFragranceButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const deleteFragrance = () => {
    setMessage(null);

    const formData = new FormData();
    formData.set('id', String(fragranceId));

    startTransition(() => {
      void (async () => {
        const result = await deleteFragranceAction(null, formData);

        setMessage(actionResultMessage(result));

        if (result.ok) {
          setIsConfirming(false);
          onDeleted?.(fragranceId);
        }
      })();
    });
  };

  return (
    <div className="grid gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="grid gap-1">
        <h2 className="text-sm font-semibold text-red-900">
          {labels.deleteFragrance}
        </h2>
        <p className="text-sm text-red-700">
          {labels.deleteFragranceDescription}
        </p>
      </div>

      {isConfirming ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={deleteFragrance}
            disabled={isPending}
            className={`${buttonStyles.compactDanger}`}
          >
            {isPending ? labels.deleting : labels.confirmDelete}
          </button>

          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            disabled={isPending}
            className={buttonStyles.compactSecondary}
          >
            {labels.cancel}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          disabled={isPending}
          className={`${buttonStyles.compactDanger} w-fit`}
        >
          {labels.deleteFragrance}
        </button>
      )}

      {message ? (
        <div
          className={messageClassName(isSuccessMessage(message))}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
