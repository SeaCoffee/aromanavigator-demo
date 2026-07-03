'use client';

import { useOnlineStatus } from '@/app/components/users/OnlineUsersProvider';
import type { ID } from '@/app/types/userTypes';

type Props = {
  userId: ID;
  className?: string;
};

export default function OnlineBadge({ userId, className = '' }: Props) {
  const isOnline = useOnlineStatus(userId);

  if (isOnline === null) {
    return null;
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
        isOnline
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-gray-200 bg-gray-50 text-gray-500',
        className,
      ].join(' ')}
    >
      <span
        className={[
          'h-1.5 w-1.5 rounded-full',
          isOnline ? 'bg-green-600' : 'bg-gray-400',
        ].join(' ')}
      />

      {isOnline ? 'РѕРЅР»Р°Р№РЅ' : 'РѕС„Р»Р°Р№РЅ'}
    </span>
  );
}
