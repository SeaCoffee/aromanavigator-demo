'use client';

import { useEffect, useState } from 'react';

import { shareButtonStyles as s } from '@/app/components/share/shareButton.styles';

type CopyStatus = 'idle' | 'copying' | 'copied' | 'failed';

type Props = {
  url: string;
  title?: string;
  text?: string;
  label?: string;
  copiedLabel?: string;
  failedLabel?: string;
  className?: string;
  iconOnly?: boolean;
};

const MESSAGE_HIDE_DELAY_MS = 2200;

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.6 6.8-4.2" />
      <path d="m8.6 13.4 6.8 4.2" />
    </svg>
  );
}

async function copyTextToClipboard(value: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard API is not available.');
  }

  await navigator.clipboard.writeText(value);
}

export default function ShareButton({
  url,
  label = 'РЎРєРѕРїС–СЋРІР°С‚Рё',
  copiedLabel = 'РџРѕСЃРёР»Р°РЅРЅСЏ СЃРєРѕРїС–Р№РѕРІР°РЅРѕ',
  failedLabel = 'РќРµ РІРґР°Р»РѕСЃСЏ СЃРєРѕРїС–СЋРІР°С‚Рё РїРѕСЃРёР»Р°РЅРЅСЏ',
  className,
  iconOnly = false,
}: Props) {
  const [status, setStatus] = useState<CopyStatus>('idle');

  const isCopying = status === 'copying';

  const message =
    status === 'copied'
      ? copiedLabel
      : status === 'failed'
        ? failedLabel
        : '';

  useEffect(() => {
    if (status !== 'copied' && status !== 'failed') {
      return;
    }

    const timeoutId = setTimeout(() => {
      setStatus('idle');
    }, MESSAGE_HIDE_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [status]);

  async function handleCopy() {
    if (isCopying) {
      return;
    }

    setStatus('copying');

    try {
      await copyTextToClipboard(url);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  }

  const buttonClassName = className ?? (iconOnly ? s.iconButton : s.button);

  return (
    <span className={s.wrapper}>
      <button
        type="button"
        onClick={handleCopy}
        disabled={isCopying}
        className={buttonClassName}
        aria-label={label}
        title={label}
      >
        <ShareIcon />

        {iconOnly ? null : <span>{label}</span>}
      </button>

      {message ? (
        <span role="status" aria-live="polite" className={s.message}>
          {message}
        </span>
      ) : null}
    </span>
  );
}
