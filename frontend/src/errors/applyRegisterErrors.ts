import type { FieldErrors, UseFormSetError } from 'react-hook-form';
import type { RegisterFormValues } from '@/app/types/formTypes';
import { applyServerErrorsToForm } from '@/errors/applyFormErrors';

export function applyRegisterErrors(
  e: unknown,
  setError: UseFormSetError<RegisterFormValues>,
) {
  applyServerErrorsToForm<RegisterFormValues>(
    e,
    setError,
    {
      email: ['email'],
      password: ['password', 'new_password', 'new_password2'],
      name: ['profile.name', 'name'],
      display_name: ['profile.display_name', 'display_name'],
    },
    'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°СЂРµС”СЃС‚СЂСѓРІР°С‚РёСЃСЏ',
  );
}

export function collectRegisterErrorHints(errors: FieldErrors<RegisterFormValues>) {
  const items: Array<{ field: keyof RegisterFormValues; message: string }> = [];
  (['email', 'name', 'display_name', 'password'] as const).forEach((k) => {
    const msg = errors[k]?.message;
    if (typeof msg === 'string' && msg.trim()) items.push({ field: k, message: msg });
  });
  return items;
}
