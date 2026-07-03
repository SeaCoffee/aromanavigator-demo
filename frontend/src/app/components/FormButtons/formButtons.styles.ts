import { buttonStyles } from '@/app/components/common/buttonStyles';

export const formButtonStyles = {
  base:
    buttonStyles.base,

  primary: buttonStyles.primary,
  compact: buttonStyles.compactPrimary,

  loading: 'opacity-60',
} as const;
