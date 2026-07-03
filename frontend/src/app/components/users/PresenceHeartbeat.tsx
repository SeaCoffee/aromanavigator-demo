'use client';

import { useCallback, useRef, useState } from 'react';

import { useVisibleInterval } from '@/app/hooks/useVisibleInterval';
import { sendPresenceHeartbeat } from '@/app/services/presenceServices';

const PERIOD_MS = 5 * 60 * 1000;
const MIN_SPACING_MS = 3000;

export default function PresenceHeartbeat() {
  const [enabled, setEnabled] = useState(true);
  const inFlightRef = useRef(false);

  const ping = useCallback(async () => {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;

    try {
      const response = await sendPresenceHeartbeat();

      if (!response.ok && (response.status === 401 || response.status === 403)) {
        setEnabled(false);
      }
    } catch {
      // РџСЂРёСЃСѓС‚РЅС–СЃС‚СЊ РЅРµ РїРѕРІРёРЅРЅР° Р»Р°РјР°С‚Рё С–РЅС‚РµСЂС„РµР№СЃ.
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useVisibleInterval(ping, {
    enabled,
    intervalMs: PERIOD_MS,
    minSpacingMs: MIN_SPACING_MS,
    runImmediately: true,
  });

  return null;
}
