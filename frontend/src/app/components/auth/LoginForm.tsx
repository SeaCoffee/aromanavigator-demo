'use client';

import { useId, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { loginAction } from '@/app/actions/authActions';
import FormMessage from '@/app/components/auth/FormMessage';
import { authStyles as styles } from '@/app/components/auth/auth.styles';
import type { ActionMessage } from '@/app/types/authTypes';

type Props = {
  next: string;
};

type FormValues = {
  email: string;
  password: string;
};

export default function LoginForm({ next }: Props) {
  const baseId = useId();
  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<ActionMessage>('');
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: FormValues) {
    setMessage('');

    startTransition(async () => {
      const result = await loginAction(values, next);

      if (!result.ok) {
        setMessage(result.msg);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor={emailId} className={styles.label}>
          Email
        </label>

        <input
          id={emailId}
          {...register('email', {
            required: 'Р’РєР°Р¶С–С‚СЊ email.',
          })}
          type="email"
          autoComplete="email"
          className={styles.input}
        />

        {errors.email?.message ? (
          <span className={styles.error}>{errors.email.message}</span>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor={passwordId} className={styles.label}>
          РџР°СЂРѕР»СЊ
        </label>

        <div className={styles.passwordWrap}>
          <input
            id={passwordId}
            {...register('password', {
              required: 'Р’РєР°Р¶С–С‚СЊ РїР°СЂРѕР»СЊ.',
            })}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={styles.passwordInput}
          />

          <button
            type="button"
            aria-label={showPassword ? 'РЎС…РѕРІР°С‚Рё РїР°СЂРѕР»СЊ' : 'РџРѕРєР°Р·Р°С‚Рё РїР°СЂРѕР»СЊ'}
            onClick={() => setShowPassword((value) => !value)}
            className={styles.passwordToggle}
          >
            {showPassword ? 'РЎС…РѕРІР°С‚Рё' : 'РџРѕРєР°Р·Р°С‚Рё'}
          </button>
        </div>

        {errors.password?.message ? (
          <span className={styles.error}>{errors.password.message}</span>
        ) : null}
      </div>

      <FormMessage message={message} ok={false} />

      <button
        type="submit"
        disabled={isPending || !isValid}
        className={styles.submit}
      >
        {isPending ? 'Р’С…С–Рґ...' : 'РЈРІС–Р№С‚Рё'}
      </button>
    </form>
  );
}
