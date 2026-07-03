'use client';

import Script from 'next/script';
import { useEffect, useRef, useState, useTransition } from 'react';

import { googleLoginAction } from '@/app/actions/authActions';
import FormMessage from '@/app/components/auth/FormMessage';
import { GOOGLE_SCRIPT_SRC } from '@/app/constants/authConstants';
import type { ActionMessage } from '@/app/types/authTypes';
import type {
  GoogleAccountsId,
  GoogleCredentialResponse,
} from '@/app/types/googleTypes';

type Props = {
  next?: string;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
};

function getGoogleAccountsId(): GoogleAccountsId | undefined {
  const runtime = globalThis as typeof globalThis & {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  };

  return runtime.google?.accounts?.id;
}

export default function GoogleLoginButton({
  next = '/',
  text = 'continue_with',
}: Props) {
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const [scriptReady, setScriptReady] = useState(false);
  const [message, setMessage] = useState<ActionMessage>('');
  const [isPending, startTransition] = useTransition();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

  useEffect(() => {
    const googleAccountsId = getGoogleAccountsId();

    if (!scriptReady || !clientId || !buttonRef.current || !googleAccountsId) {
      return;
    }

    googleAccountsId.initialize({
      client_id: clientId,
      callback: (response: GoogleCredentialResponse) => {
        const idToken = response.credential;

        if (!idToken) {
          setMessage('Google РЅРµ РїРѕРІРµСЂРЅСѓРІ id_token.');
          return;
        }

        setMessage('');

        startTransition(async () => {
          const result = await googleLoginAction(idToken, next);

          if (!result.ok) {
            setMessage(result.msg);
          }
        });
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    buttonRef.current.innerHTML = '';

    googleAccountsId.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text,
      shape: 'rectangular',
      locale: 'uk',
      width: 320,
    });
  }, [scriptReady, clientId, next, text]);

  if (!clientId) {
    return null;
  }

  return (
    <div className="grid gap-2">
      <Script
        src={GOOGLE_SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <div
        ref={buttonRef}
        aria-busy={isPending}
        className={isPending ? 'pointer-events-none opacity-60' : ''}
      />

      <FormMessage message={message} ok={false} />
    </div>
  );
}
