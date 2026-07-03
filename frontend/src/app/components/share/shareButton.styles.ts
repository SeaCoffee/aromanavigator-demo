import { buttonStyles } from '@/app/components/common/buttonStyles';

export const shareButtonStyles = {
  wrapper: 'relative inline-flex items-center',

  button:
    buttonStyles.compactSecondary,

  iconButton:
    buttonStyles.icon,

  message:
    'absolute left-0 top-[calc(100%+0.45rem)] z-20 whitespace-nowrap rounded-full border border-[#eadfd7] bg-white px-3 py-1 text-xs font-medium text-[#6f5b5f] shadow-lg shadow-black/10',
} as const;
