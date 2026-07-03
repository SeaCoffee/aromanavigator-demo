// frontend/src/app/hooks/useVisibleInterval.ts

'use client';

import { useEffect, useRef } from 'react';

type Options = {
  intervalMs: number;
  minSpacingMs?: number;
  enabled?: boolean;
  runImmediately?: boolean;
};

export function useVisibleInterval(
  callback: () => void | Promise<void>,
  {
    intervalMs,
    minSpacingMs = 0,
    enabled = true,
    runImmediately = true,
  }: Options,
) {
  const callbackRef = useRef(callback);
  const lastRunAtRef = useRef(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let stopped = false;
    const controller = new AbortController();

    const run = () => {
      if (stopped) return;
      if (document.visibilityState !== 'visible') return;

      const now = Date.now();

      if (minSpacingMs > 0 && now - lastRunAtRef.current < minSpacingMs) {
        return;
      }

      lastRunAtRef.current = now;
      void callbackRef.current();
    };

    if (runImmediately) {
      run();
    }

    const timer = setInterval(run, intervalMs);

    document.addEventListener('visibilitychange', run, {
      signal: controller.signal,
    });

    addEventListener('focus', run, {
      signal: controller.signal,
    });

    return () => {
      stopped = true;
      controller.abort();
      clearInterval(timer);
    };
  }, [enabled, intervalMs, minSpacingMs, runImmediately]);
}
