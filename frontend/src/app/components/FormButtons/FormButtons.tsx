'use client';

import { formButtonStyles as s } from '@/app/components/FormButtons/formButtons.styles';

type BaseProps = {
  label: string;
  pending?: boolean;
  disabled?: boolean;
  size?: 'default' | 'compact';
};

function getClass(size: BaseProps['size']) {
  return `${s.base} ${size === 'compact' ? s.compact : s.primary}`;
}

/**
 * РЈРЅРёРІРµСЂСЃР°Р»СЊРЅР°СЏ submit РєРЅРѕРїРєР°
 */
export function SubmitBtn({
  label,
  pending,
  disabled,
  size = 'default',
}: BaseProps) {
  const isDisabled = pending || disabled;

  return (
    <button type="submit" disabled={isDisabled} className={getClass(size)}>
      {pending ? '...' : label}
    </button>
  );
}

/**
 * РђР»РёР°СЃ РїРѕРґ СЃС‚Р°СЂС‹Р№ SaveBtn (С‡С‚РѕР±С‹ РЅРµ Р»РѕРјР°С‚СЊ РєРѕРґ)
 */
export function SaveBtn({
  pending,
  label = 'Р—Р±РµСЂРµРіС‚Рё',
}: {
  pending?: boolean;
  label?: string;
}) {
  return (
    <SubmitBtn
      label={label}
      pending={pending}
    />
  );
}
