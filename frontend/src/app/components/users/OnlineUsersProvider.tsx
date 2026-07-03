'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useVisibleInterval } from '@/app/hooks/useVisibleInterval';
import { fetchPresenceBulk } from '@/app/services/presenceServices';
import type { ID } from '@/app/types/userTypes';

type PresenceMap = Record<string, boolean>;

type OnlineUsersContextValue = {
  getIsOnline: (userId: ID) => boolean | null;
  refresh: () => void;
};

type Props = {
  userIds: ID[];
  children: ReactNode;
};

const REFRESH_MS = 60 * 1000;
const MIN_SPACING_MS = 5000;

const OnlineUsersContext = createContext<OnlineUsersContextValue | null>(null);

function normalizeIds(ids: ID[]) {
  return Array.from(
    new Set(
      ids
        .map((id) => String(id).trim())
        .filter(Boolean),
    ),
  );
}

export function OnlineUsersProvider({ userIds, children }: Props) {
  const idsKey = useMemo(() => normalizeIds(userIds).join(','), [userIds]);
  const ids = useMemo(() => (idsKey ? idsKey.split(',') : []), [idsKey]);

  const [presence, setPresence] = useState<PresenceMap>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [canReadPresence, setCanReadPresence] = useState(true);

  const loadPresence = useCallback(async () => {
    if (ids.length === 0 || !canReadPresence) {
      return;
    }

    const result = await fetchPresenceBulk(ids);

    if (!result.ok) {
      if (result.status === 401 || result.status === 403) {
        setCanReadPresence(false);
      }

      setIsLoaded(true);
      return;
    }

    const nextPresence: PresenceMap = {};

    Object.entries(result.data ?? {}).forEach(([userId, value]) => {
      nextPresence[userId] = Boolean(value?.is_online);
    });

    setPresence(nextPresence);
    setIsLoaded(true);
  }, [ids, canReadPresence]);

  useVisibleInterval(loadPresence, {
    enabled: ids.length > 0 && canReadPresence,
    intervalMs: REFRESH_MS,
    minSpacingMs: MIN_SPACING_MS,
    runImmediately: true,
  });

  const value = useMemo<OnlineUsersContextValue>(
    () => ({
      getIsOnline: (userId: ID) => {
        if (!isLoaded || !canReadPresence) {
          return null;
        }

        return presence[String(userId)] ?? false;
      },
      refresh: () => {
        void loadPresence();
      },
    }),
    [canReadPresence, isLoaded, loadPresence, presence],
  );

  return (
    <OnlineUsersContext.Provider value={value}>
      {children}
    </OnlineUsersContext.Provider>
  );
}

export function useOnlineStatus(userId: ID) {
  const context = useContext(OnlineUsersContext);

  if (!context) {
    return null;
  }

  return context.getIsOnline(userId);
}
