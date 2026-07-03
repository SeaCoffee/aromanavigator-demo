import { buttonStyles } from '@/app/components/common/buttonStyles';

export const likeButtonStyles = {
  root: 'inline-grid gap-1',

  buttonBase: `${buttonStyles.base} ${buttonStyles.compact}`,

  buttonLiked: buttonStyles.selectedPalette,

  buttonDefault: buttonStyles.secondaryPalette,

  buttonDisabled: 'cursor-not-allowed opacity-60',

  error: 'text-xs text-red-600',
} as const;
