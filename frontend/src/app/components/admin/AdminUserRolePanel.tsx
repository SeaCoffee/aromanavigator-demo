'use client';

import { useState, useTransition } from 'react';

import {
  demoteToUserAction,
  promoteToAdminAction,
  promoteToModeratorAction,
} from '@/app/actions/usersActions';
import FormMessage from '@/app/components/auth/FormMessage';
import { buttonStyles } from '@/app/components/common/buttonStyles';
import type { ActionMessage } from '@/app/types/authTypes';
import type { AdminUserListItem } from '@/app/types/userTypes';
import { getAdminUserRoleLabel } from '@/app/utils/userDisplayUtils';

type Props = {
  user: AdminUserListItem;
};

export default function AdminUserRolePanel({ user }: Props) {
  const [message, setMessage] = useState<ActionMessage>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentRole = getAdminUserRoleLabel(user);
  const isSuperuser = user.is_superuser;

  function runAction(action: () => Promise<{ ok: boolean; msg?: ActionMessage }>) {
    setMessage('');
    setIsSuccess(false);

    startTransition(async () => {
      const result = await action();

      setIsSuccess(result.ok);
      setMessage(result.msg ?? '');
    });
  }

  return (
    <section className="grid content-start gap-4 rounded-2xl border p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Р РѕР»СЊ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°</h2>
        <p className="mt-1 text-sm text-gray-500">
          Р—РјС–РЅР° СЂРѕР»С– РґРѕСЃС‚СѓРїРЅР° Р»РёС€Рµ РґР»СЏ РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ, СЏРєС– РЅРµ С” superuser.
        </p>
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="grid gap-1">
          <dt className="text-gray-500">РџРѕС‚РѕС‡РЅР° СЂРѕР»СЊ</dt>
          <dd>{currentRole}</dd>
        </div>
      </dl>

      <FormMessage message={message} ok={isSuccess} />

      {isSuperuser ? (
        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
          Superuser role РЅРµ РјРѕР¶РЅР° Р·РјС–РЅСЋРІР°С‚Рё Р· Р°РґРјС–РЅ-РїР°РЅРµР»С–.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending || currentRole === 'admin'}
            onClick={() => runAction(() => promoteToAdminAction(user.id))}
            className={buttonStyles.primary}
          >
            Р—СЂРѕР±РёС‚Рё admin
          </button>

          <button
            type="button"
            disabled={isPending || currentRole === 'moderator'}
            onClick={() => runAction(() => promoteToModeratorAction(user.id))}
            className={buttonStyles.secondary}
          >
            Р—СЂРѕР±РёС‚Рё moderator
          </button>

          <button
            type="button"
            disabled={isPending || currentRole === 'user'}
            onClick={() => runAction(() => demoteToUserAction(user.id))}
            className={buttonStyles.secondary}
          >
            Р—СЂРѕР±РёС‚Рё user
          </button>
        </div>
      )}
    </section>
  );
}
