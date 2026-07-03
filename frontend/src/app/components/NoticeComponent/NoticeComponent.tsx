'use client';

import { useState } from 'react';

import { buttonStyles } from '@/app/components/common/buttonStyles';
import type { JSX } from 'react';

type Kind = 'success' | 'error' | 'info' | 'warning';

const styles: Record<Kind, string> = {
  success: 'border-green-200 bg-green-50/70 text-green-800',
  error:   'border-rose-200  bg-rose-50/70  text-rose-800',
  info:    'border-sky-200   bg-sky-50/70   text-sky-800',
  warning: 'border-amber-200 bg-amber-50/70 text-amber-800',
};

const icons: Record<Kind, JSX.Element> = {
  success: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2m-1.1 13.7-3.6-3.6 1.4-1.4 2.2 2.2 4.9-4.9 1.4 1.4z"/>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2m1 14h-2v-2h2zm0-4h-2V7h2z"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2m-1 7h2V7h-2zm0 8h2v-6h-2z"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2zm0-4h-2v-4h2z"/>
    </svg>
  ),
};

export function Notice({
  kind = 'info',
  children,
  dismissible = false,
  className = '',
  'aria-live': ariaLive = 'polite',
}: {
  kind?: Kind;
  children: React.ReactNode;
  dismissible?: boolean;
  className?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  // РџСЂРёР±СЂР°С‚Рё alert.
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live={ariaLive}
      className={`mb-3 flex items-start gap-2 rounded-xl border p-3 text-sm leading-6 ${styles[kind]} ${className}`}
    >
      <span className="mt-0.5">{icons[kind]}</span>
      <div className="flex-1">{children}</div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Р—Р°РєСЂРёС‚Рё РїРѕРІС–РґРѕРјР»РµРЅРЅСЏ"
          className={`${buttonStyles.iconQuiet} ml-2 size-7`}
        >
          Г—
        </button>
      )}
    </div>
  );
}
